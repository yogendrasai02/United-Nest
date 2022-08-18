const util = require('util');
const jwt = require('jsonwebtoken');
const validator = require('validator');



const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');




const getUserIdFromHeader = async (authHeader) => {
    // 1. Extract the token from the authentication header
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return null;
    }
    // 2. Promisified the jwt.verify function, decode the token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
    // 3. return the userid from the decoded token
    return decodedToken.id;
}

exports.getProfile = catchAsync(
    async (req,res,next)=>{
        // 1. get the authentication header
        const authHeader = req.headers['authorization']
        // 2. get the userid by decoding the token provided in header
        const userid = await getUserIdFromHeader(authHeader);
        console.log(userid)
        // 3. Check if the user id is provided properly
        if(!userid){
            return next(new AppError('Please provide a valid token to continue', 403));
        }
        // 4. get the user with the given id from the db
        const user = await User.findById(userid);
        // 5. see if the user exists, if not return error
        if(!user || user.isActive === false){
            return next(new AppError('User doesnot exist', 400));
        }
        // 6. return the user details
        console.log('User details', user);
        res.status(200).json({
            status: 'success',
            data : {user}
        });
    }
);

exports.getProfileByID = catchAsync(
    async (req,res,next) => {
        // 1. get the userid from the query
        const userid = req.params.userid;

        // ** I think step-2 is redundant **

        // 2. check if the userid is provided as the query parameter
        if(!userid){
            return next(new AppError('Provide the user id', 400));
        }
        // 3. get the details of the user from the db
        const user = await User.findById(userid);
        // 4. see if the user is there or not
        if(!user){
            return next(new AppError('User doesnot exist', 400));
        }
        // 5. send back those details
        console.log('User Details', user);
        res.status(200).json({
            status:'success',
            data : {user}
        });
    }
);

exports.deleteProfile = catchAsync(
    async (req,res,next) => {
        // 1. get the authentication header
        const authHeader = req.headers['authorization']
        // 2. get the userid by decoding the token provided in header
        const userid = await getUserIdFromHeader(authHeader);
        // 3. Check if the user id is provided properly
        if(!userid){
            return next(new AppError('Please provide a valid token', 403));
        }
        // 4. set the isActive field in the user document to false
        await User.findByIdAndUpdate(userid, {$set : {isActive:false}});
        res.status(201).json({
            status:'success',
            data:{'message': 'Deleted the User Successfully'}
        });
    }
)

exports.updateProfile = catchAsync(
    async (req,res,next) {
        // 1. fetch the data
        const { name, username, profilePhoto, description } = req.body;
        // 2. check the data and update those in the database
        if(!name){

        }
    }
)

