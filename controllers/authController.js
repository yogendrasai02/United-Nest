const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const util = require('util');
const validator = require('validator');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

const Email = require('../utils/Email');

// ** To create & sign a JWT **
const createToken = (id) => {
    const token = jwt.sign({ 
        id 
    }, process.env.JWT_SECRET_KEY, { 
        expiresIn: process.env.JWT_EXPIRES_IN 
    });
    return token;
};

// ** Middleware to Protect Route. Also add a '.user' property on 'req' object **
exports.authenticate = catchAsync(async (req, res, next) => {
    // 1. check if token exists & get token
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return next(new AppError('You must be logged in to continue', 401));
    }
    const token = req.headers.authorization.split(' ')[1];
    // 2. verify token: this might lead to TokenExpiredError|JsonWebTokenError
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
    // 3. get user from decoded token
    const user = await User.findById(decodedToken.id);
    // 4. check if user still exists (not deleted after JWT issual)
    if(!user) {
        return new AppError('Please login to continue', 401);
    }
    // 5. check if user changed password after JWT issual
    // TODO: test this thing once update/reset password are implemented
    if(user.passwordChangedAfter(decodedToken.iat)) {
        return next(new AppError('Your password was changed recently. Please login to continue', 401));
    }
    // 6. if everything is ok, add userDocument to req object & goto next middleware
    req.user = user;
    console.log(user);
    next();
});

// ** Function to Restrict Routes based on user permission. It RETURNS a middleware **
exports.authorize = (...permittedRoles) => {
    return (req, res, next) => {
        if(!req.user) {
            return next(new AppError('You must be logged in to continue.', 401));
        }
        if(!permittedRoles.includes(req.user.role)) {
            return next(new AppError('You are not allowed to perform this action', 403));
        }
        next();
    };
};

// ** Route handler for /signup route **
exports.signup = catchAsync(async (req, res, next) => {
    console.log('Inside SignUp Route Handler➡️');
    // 1. get payload
    const { name, username, email, mobile, password, passwordConfirm } = req.body;
    const payload = { name, username, email, mobile, password, passwordConfirm };
    // 2. save user to DB (runs validators, hashed pwd)
    const createdUser = await User.create(payload);
    // 3. create JWT
    const token = createToken(createdUser['_id']);
    // 4. send response
    console.log(`Exiting SignUp Route Handler🟡`);
    res.status(201).json({
        status: 'success',
        token,
        data: { createdUser }   // FIXME: this document has password: null, try to remove that
    });
});

// ** Route handler for /login route **
exports.login = catchAsync(async (req, res, next) => {
    console.log('Inside Login Route Handler➡️');
    // 1. get payload from client & build search query object
    const { password } = req.body;
    const searchQueryObj = {};
    if(req.body.email) {
        if(!validator.isEmail(req.body.email)) 
            return next(new AppError('Invalid Email Provided', 400));
        searchQueryObj.email = req.body.email;
    } else if(req.body.mobile) {    // FIXME: This VALIDATOR is NOT WORKING💥⚠️⚠️⚠️
        // console.log(validator.isMobilePhone(req.body.mobile));
        // console.log(req.body.mobile);
        // console.log(req.body.mobile.length);
        if(!validator.isMobilePhone(req.body.mobile)) 
            return next(new AppError('Invalid Mobile Number Provided', 400));
        searchQueryObj.mobile = +req.body.mobile;
    } else if(req.body.username) {
        searchQueryObj.username = req.body.username;
    } else {
        return next(new AppError('Please provide either username, email or mobile number'), 400);
    }
    if(!password) {
        return next(new AppError('Please provide the password'), 400);
    }
    // 2. find user by searchQuery built
    const user = await User.findOne(searchQueryObj).select('+password');
    if(!user) {
        return next(new AppError('User with given credentials not found', 401));
    }
    // 3. compare actual password (hashed, stored in DB) with given password
    const passwordsMatch = await user.comparePasswords(password, user.password);
    if(!passwordsMatch) {
        return next(new AppError('User with given credentials not found', 401));
    }
    // 4. create & send JWT
    const token = createToken(user.id);
    console.log('Exiting Login Route Handler🟡');
    res.status(200).json({
        status: 'success',
        token
    });
});

// ** Route Handler for /forgotPassword **
exports.forgotPassword = catchAsync(async (req, res, next) => {
    console.log(req.query);
    console.log('Inside Forgot Password Route Handler➡️');
    // 1. get email & get user by that email
    const { email } = req.body;
    if(!validator.isEmail(email)) {
        return next(new AppError('Please provide a valid email address', 400));
    }
    const user = await User.findOne({ email });
    // 2. create a 32 bit password reset token, store its hashed version in DB
    const passwordResetToken = await user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // 3. send email to user with password reset token
    const subject = 'Reset Password for your United Nest account';
    // FIXME: this resetPwdURL should be handled at frontend?
    // TODO: Refactor this sending email thing into methods of Email class itself (ex: sendPwdResetMail())
    const resetPasswordURL = `${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/auth/resetPassword/${passwordResetToken}`;
    const emailText = `Hello ${user.name}, you have initiated a request to reset your password.\n` + 
                    `Please use the following link to reset your password:\n${resetPasswordURL}\n` +
                    `This link is valid for 10 minutes and will expire by ` +
                    user.passwordResetTokenExpiresAt.toString();
    await (new Email()).sendEmail(user.email, subject, emailText);
    console.log('Exiting Forgot Password Route Handler🟡');
    res.status(200).json({
        status: 'success',
        message: 'If an user exists with that email, the Password Reset instructions will be sent to that email'
    });
});

// ** Route handler for /resetPassword/:resetToken **
exports.resetPassword = catchAsync(async(req, res, next) => {
    console.log('Inside Reset Password Route Handler➡️');
    // get reset token
    const { resetToken } = req.params;
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // get user based on hashed reset token
    const user = await User.findOne({ 
        passwordResetToken: hashedResetToken
    });
    if(!user) {
        return next(new AppError('Invalid Reset Token or Reset Token has expired', 400));
    }
    // get password, passwordConfirm from payload and update password
    const { password, passwordConfirm } = req.body;
    user['password'] = password;
    user['passwordConfirm'] = passwordConfirm;
    await user.save();
    console.log('Exiting Reset Password Route Handler🟡');
    res.status(200).json({
        status: 'success',
        message: 'Password reset successful. Please login to continue'
    });
});