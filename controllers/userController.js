const Post = require("../models/postModel.js");
const Connection = require("../models/connectionModel.js");
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');


exports.getProfile = catchAsync(
    async (req,res,next)=>{

        return res.status(200).json({
            status: 'success',
            data: { 
                user: req.user
                }
        })
    }
);

exports.getProfileByID = catchAsync(
    async (req,res,next) => {
        const user = await User.findById(req.params.userid);
        if(!user || user.isActive == false){
            return new AppError('User doesnot exist or account is deleted', 400);
        }
        // check if the req.user follows the user with userid 
        let connection = await Connection.findOne({$and: [{requestSender: req.user.username}, {requestReceiver: user.username}]});
        console.log(connection);
        if(connection && connection.status == 'accepted'){
            const posts = await Post.find({username: user.username});
            console.log(posts);
            return res.status(200).json({
                status: 'success',
                data: {
                    user,
                    isFriend : true
                }
            })
        }
        else{
            return res.status(200).json({
                status: 'success',
                data: {
                    user : {
                        name: user.name,
                        username: user.username,
                        profilePhoto: user.profilePhoto,
                        description: user.description
                    },
                    isFriend: false
                }
            })
        }
    }
);

exports.deleteProfile = catchAsync(
    async (req,res,next) => {
        try{
            await User.findByIdAndUpdate(req.user.id, {$set : {isActive:false}});
            return res.status(201).json({
                status:'success',
                data:{'message': 'Deleted the User Successfully'}
            });
        }
        catch(err){
            console.log(err);
            return next(new AppError('Some Error Occured while deleting profile', 500));
        }
    }
)

exports.updateProfile = catchAsync(
    async (req,res,next) => {
        console.log('I ma insode the user controller')
        const updatedocs = {};
        if(req.body.name){
            updatedocs.name = req.body.name;
        }
        if(req.body.username){
            updatedocs.username = req.body.username
        }
        if(req.file && req.file.path){
            updatedocs.profilePhoto = req.file.path;
        }
        if(req.body.email){
            updatedocs.email = req.body.email;
        }
        if(req.body.mobile){
            updatedocs.mobile = req.body.mobile;
        }
        if(req.body.description){
            updatedocs.description = req.body.description;
        }
        try{
            const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedocs);
            return res.status(201).json({
                status: 'success',
                data : {updatedUser}
            }); 
        }
        catch(err){
            console.log(err);
            return next(new AppError('Some error Ocurred while updating profile', 500));
        } 
    }
)

