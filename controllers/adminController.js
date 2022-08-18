const util = require('util');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');


exports.getUsers = catchAsync(
    async (req,res,next)=>{
        const users = await User.find();
        console.log(users)
        res.status(200).json({
            status: 'success',
            data: { users }
        })
    }
)

exports.getUserById = catchAsync(
    async (req,res,next) => {
        const userid = req.params.userid;
        const user = await User.findById(userid);
        if(!user){
            return next(new AppError('The User with the ID doesnot exist', 400));
        }
        res.status(200).json({
            status: 'success',
            data: { user }
        })
    }
)

exports.deleteUserById = catchAsync(
    async (req,res,next) =>{
        const userid = req.params.userid;
        await User.findByIdAndDelete(userid, (err, data) => {
            if(err){
                console.log(err);
                return next(new AppError('Some error occured', 400));
            }
            else{
                res.status(201).json({
                    status: 'success',
                    message: 'User successfully deleted'
                })
            }
        });       
    }
) 