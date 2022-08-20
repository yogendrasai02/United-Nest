const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');


exports.getUsers = catchAsync(
    async (req,res,next)=>{

        const filterBasedOn = req.query.sort;
        const page = req.query.page;
        const limit = req.query.limit || 15;

        console.log(filterBasedOn, page, limit);

        if(filterBasedOn === undefined || page === undefined) {
            return next(new AppError("URL is incomplete", 400));
        }

        const users = await User.find().skip((page - 1) * limit).limit(limit).sort(filterBasedOn);
        let noOfUsers = await User.find().count();
        let pagesCnt =  Math.floor(noOfUsers / limit) + (noOfUsers % limit !== 0);
        console.log(users)
        res.status(200).json({
            status: 'success',
            data: { users, pagesCnt }
        })
    }
)

exports.getUserById = catchAsync(
    async (req,res,next) => {
        const userid = req.params.userid;

        try{
            const user = await User.findById(userid);
            if(!user){
                return next(new AppError('The User with the ID doesnot exist', 400));
            }
            res.status(200).json({
                status: 'success',
                data: { user }
            });
        }
        catch(err){
            console.log(err);
            return next(new AppError('Some Error Occured', 500));
        }
    }
)

exports.deleteUserById = catchAsync(
    async (req,res,next) =>{
        const userid = req.params.userid;
        try{
            await User.findByIdAndDelete(userid);   
            res.status(201).json({
                status: 'success',
                message: 'User successfully deleted'
            });  
        }
        catch(err){
            console.log(err);
            return next(new AppError('Some error ocuured while deleting the user', 500));
        }
    }
) 