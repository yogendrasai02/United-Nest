const catchAsync = require("../utils/catchAsync");

const Reaction = require('../models/reactionModel');
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");

const AppError = require('../utils/AppError');

exports.getReactions = catchAsync(
    async (req,res,next) => {
        const commentId = req.query.commentId;
        const postId = req.params.postId;
        const page = req.query.page;
        const limit = req.query.limit || 10;

        if(page === undefined){
            return next(new AppError('URL is incomplete', 400));
        }
        let post = await Post.findById(postId);

        if(!post) {
            return next(new AppError("Post doesn't exist", 400));
        }

        if(commentId){
            let comment = await Comment.findById(commentId);
            if(!comment){
                return next(new AppError("Comment doesn't exist", 400));
            }
        }
        
        let reactionCnt = await Reaction.find({reactedTo: commentId || postId}).count();
        
        let pagesCnt = Math.floor(reactionCnt/limit) + (reactionCnt % limit !== 0);

        if(commentId){
            let reactions = await Reaction.find({$and: [{reactedTo: 'comment'}, {reactedToId: commentId}]}).skip((page - 1) * limit).limit(limit);
            return res.status(200).json({
                status: 'success',
                data: {
                    reactions,
                    pagesCnt
                }
            });
        }
        else{
            let reactions = await Reaction.find({$and: [{reactedTo: 'post'}, {reactedToId: postId}]});  
            // .skip((page - 1) * limit).limit(limit)
            return res.status(200).json({
                status: 'success',
                data : {
                    reactions,
                    pagesCnt
                }
            })
        }
    }
)

exports.postReaction = catchAsync(
    async (req,res,next) => {
        const commentId = req.query.commentId;
        const postId = req.params.postId;
        const type = req.query.type;
        console.log("Type is: ", type);
        const reactions = ['like', 'dislike', 'love', 'funny', 'angry', 'wow', 'sad']

        if(!type || !reactions.includes(type)){
            return next(new AppError('URL is improper', 400));
        }
        let post = await Post.findById(postId);

        if(!post) {
            return next(new AppError("Post doesn't exist", 400));
        }

        if(commentId){
            let comment = await Comment.findById(commentId);
            if(!comment){
                return next(new AppError("Comment doesn't exist", 400));
            }
        }

        if(commentId){
            let payload = {};
            payload.reactionType = type;
            payload.reactedTo = 'comment';
            payload.reactedToId = commentId;
            payload.user = req.user.id;
            const reaction = await Reaction.create(payload);
            
            return res.status(200).json({
                status: 'success',
                data: {
                    reaction
                }
            });
        }
        else{
            let payload = {};
            payload.reactionType = type;
            payload.reactedTo = 'post';
            payload.reactedToId = postId;
            payload.user = req.user.id;
            const reaction = await Reaction.create(payload);

            const updateField = `reactionsCnt.${type}`;

            console.log("update field: ", updateField);
            await Post.findByIdAndUpdate(postId, {$inc: {[updateField]: 1}});

            return res.status(200).json({
                status: 'success',
                data: {
                    reaction
                }
            });
        }
    }
)


exports.updateReaction = catchAsync(
    async (req,res,next) => {
        const commentId = req.query.commentId;
        const postId = req.params.postId;
        const reactionId = req.params.reactionId;
        const type = req.query.type;
        const reactions = ['like', 'dislike', 'love', 'funny', 'angry', 'wow', 'sad']

        if(!type || !reactions.includes(type)){
            return next(new AppError('URL is improper', 400));
        }

        let post = await Post.findById(postId);

        if(!post) {
            return next(new AppError("Post doesn't exist", 400));
        }

        if(commentId){
            let comment = await Comment.findByIdAndUpdate(commentId);
            if(!comment){
                return next(new AppError("Comment doesn't exist", 400));
            }
        }
        
        const reactionData = await Reaction.findById(reactionId);
        console.log("reaction Data: ", reactionData);

        let beforeType = reactionData['reactionType'];

        let str1 = `reactionsCnt.${beforeType}`;
        let str2 = `reactionsCnt.${type}`;

        console.log("str1: ", str1);
        console.log("str2: ", str2);

        await Post.findByIdAndUpdate(postId, { $inc: { [str1]: -1 } } );

        await Post.findByIdAndUpdate(postId, { $inc: { [str2]: 1 } } );

        let reaction = await Reaction.findByIdAndUpdate(reactionId, {$set: {reactionType: type}});

        return res.status(201).json({
            status: 'success',
            data: {
                reaction
            }
        });
    }
)


exports.deleteReaction = catchAsync(
    async (req,res,next) => {
        const commentId = req.query.commentId;
        const postId = req.params.postId;
        const reactionId = req.params.reactionId;

        let post = await Post.findById(postId);

        if(!post) {
            return next(new AppError("Post doesn't exist", 400));
        }

        if(commentId){
            let comment = await Comment.findByIdAndUpdate(commentId);
            if(!comment){
                return next(new AppError("Comment doesn't exist", 400));
            }
        }
        try{
            await Reaction.findByIdAndDelete(reactionId);
            return res.status(201).json({
                status: 'success',
                message: 'Deleted the reaction successfully'
            });
        }
        catch(err){
            console.log(err);
            return next(new AppError('Some Error occured while deleting reaction', 500));
        }
    }
)