const catchAsync = require("../utils/catchAsync")
const Comment = require("../models/commentModel.js");
const Post = require("../models/postModel.js");

module.exports.getComments = catchAsync(async (req, res) => {
    console.log("Comment ID: ", req.query.commentId);
    const commentId = req.query.commentId;
    const postId = req.params.postId;
    const limit = req.query.limit;
    const page = req.query.page;
    let noOfComments;

    let data = await Comment.findById(postId);

    if(data === null) {
        return next(new AppError("Post doesn't exist", 400));
    }

    data = await Comment.findById(commentId);

    if(data === null) {
        return next(new AppError("Comment doesn't exist", 400));
    }

    if(commentId === "null") {
        noOfComments = await Comment.find({$and: [{post: postId}, {parentComment: null}]}).count();
    } else {
        noOfComments = await Comment.find({$and: [{post: postId}, {parentComment: commentId}]}).count();
    }
    console.log(noOfComments);
    let pagesCnt = Math.floor(noOfComments / limit) + (noOfComments % limit !== 0);

    let filterBasedOn = {};

    if(commentId === "null") {
        filterBasedOn = req.query.filter; // -comments, comments, -commentedAt, commentedAt

        console.log(filterBasedOn);

        if(filterBasedOn === '-comments') {
            filterBasedOn = {"reactionsCnt.comments": -1};
        } else if(filterBasedOn === 'comments') {
            console.log("Hello");
            filterBasedOn = {"reactionsCnt.comments": 1};
        } else if(filterBasedOn === '-commentedAt') {
            filterBasedOn = {"commentedAt": -1};
        } else if(filterBasedOn === 'commentedAt') {
            filterBasedOn = {"commentedAt": 1};
        }
    } else {
        filterBasedOn = {"commentedAt": -1};
    }

    let comments; 

    if(commentId === "null") {
        comments = await Comment.find({$and: [{post: postId}, {parentComment: null}]}).skip((page - 1) * limit).limit(limit).sort(filterBasedOn);
    } else {
        comments = await Comment.find({$and: [{post: postId}, {parentComment: commentId}]}).skip((page - 1) * limit).limit(limit).sort(filterBasedOn);
    }
    
    res.send({comments: comments, pagesCnt: pagesCnt});
}); 

module.exports.postComment = catchAsync(async (req, res) => {
    const postId = req.params.postId;

    const {user, content, commentedAt} = req.body;

    const commentId = req.query.commentId;

    console.log("Comment Id: ",commentId);

    if(commentId === "null") {

        console.log("In parent comment");
        //comment is a parent comment  
        const commentData = new Comment({content: content, post: postId, user: user, commentedAt: commentedAt, updatedAt: commentedAt});

        let suc = await commentData.save();

        suc = await Post.findByIdAndUpdate(postId, {$inc: {"reactionsCnt.comments": 1}});

        res.send({"message": "Parent comment added successdully"});
    } else {

        console.log("In child comment");

        const commentData = new Comment({content: content, post: postId, user: user, commentedAt: commentedAt, parentComment: commentId, updatedAt: commentedAt});
        let suc = await commentData.save();

        const id = commentData._id;

        console.log(id);

        suc = await Comment.findByIdAndUpdate(commentId, {$push: {subComment: id}, $inc: {"reactionsCnt.comments": 1}});

        res.send({"message": "child comment added successdully"});
    }
});

module.exports.updateComment = catchAsync(async (req, res) => {
    const {content, updatedAt} = req.body;

    let data = await Comment.findById(req.params.commentId);

    if(data === null) {
        return next(new AppError("Comment doesn't exist", 400));
    }
    

    let suc = await Comment.findByIdAndUpdate(req.params.commentId, {content: content, updatedAt: updatedAt});

    res.send({message: "Update successful"});
});

module.exports.deleteComment = catchAsync(async (req, res) => {

    const commentId = req.params.commentId;
    const postId = req.params.postId;

    let data = await Comment.findById(commentId);

    if(data === null) {
        return new AppError("Comment doesn't exist", 400);
    }

    if(data.subComment.length !== 0) {
        const subCommentIds = data.subComment;

        for(let val of subCommentIds) {
            await Comment.findByIdAndDelete(val);
        }

        await Post.findByIdAndUpdate(postId, {$inc: {"reactionsCnt.comments": -1}});
    } else {
        const parentCommentId = data.parentComment;

        console.log(parentCommentId);

        await Comment.findByIdAndUpdate(parentCommentId, {$pull: {subComment: commentId}, $inc: {"reactionsCnt.comments": -1}})
    }

    await Comment.findByIdAndDelete(commentId);

    res.send({message: "Delete successful"});
});