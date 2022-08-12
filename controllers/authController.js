const jwt = require('jsonwebtoken');
const validator = require('validator');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

// ** To create & sign a JWT **
const createToken = (id) => {
    const token = jwt.sign({ 
        id 
    }, process.env.JWT_SECRET_KEY, { 
        expiresIn: process.env.JWT_EXPIRES_IN 
    });
    return token;
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
        data: { createdUser }
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