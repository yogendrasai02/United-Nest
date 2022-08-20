const Post = require("../models/postModel.js");
const Connection = require("../models/connectionModel.js");
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');


exports.getProfile = catchAsync(
    async (req,res,next)=>{

        let followRequestsSent = await Connection.find({requestSender: req.user.username});
        let followRequestsRecv = await Connection.find({requestReceiver: req.user.username});
        
        let followers = [];
        let following = [];
        let followRequestPending = [];
        let followRequestRecived = [];

        followRequestsSent.forEach((request) => {
            if(request.status === 'pending'){
                followRequestPending.push(request.requestReceiver);
            }
            else{
                following.push(request.requestReceiver);
            }
        });

        followRequestsRecv.forEach((request) => {
            if(request.status === 'pending'){
                followRequestRecived.push(request.requestSender);
            }
            else{
                followers.push(request.requestSender);
            }
        })

        res.status(200).json({
            status: 'success',
            data: { 
                profile:{
                    name: req.user.name,
                    username: req.user.username,
                    email: req.user.email,
                    mobile: req.user.mobile,
                    profilePhoto: req.user.profilePhoto,
                    description: req.user.description,
                    followers,
                    following,
                    pending: followRequestPending,
                    received: followRequestRecived
                }
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
            res.status(200).json({
                status: 'success',
                data: {
                    profile: {
                        name: req.user.name,
                        username: req.user.username,
                        profilePhoto: req.user.profilePhoto,
                        description: req.user.description
                    },
                    posts
                }
            })
        }
        else{
            res.status(200).json({
                status: 'success',
                data: {
                    profile: {
                        name: req.user.name,
                        username: req.user.username,
                        profilePhoto: req.user.profilePhoto,
                        description: req.user.description
                    }
                }
            })
        }
    }
);

exports.deleteProfile = catchAsync(
    async (req,res,next) => {
        try{
            await User.findByIdAndUpdate(req.user.id, {$set : {isActive:false}});
            res.status(201).json({
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
        try{
            const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedocs);
            res.status(201).json({
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

