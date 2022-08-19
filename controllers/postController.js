const Post = require("../models/postModel.js");
const ObjectId = require("mongodb").ObjectId;
const Connection = require("../models/connectionModel.js");

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

module.exports.getPosts = catchAsync(async (req, res, next) => {
    let filterBasedOn = req.query.sort;
    const page = req.query.page;
    const limit = req.query.limit;

    if(filterBasedOn === undefined || page === undefined || limit === undefined) {
        return next(new AppError("URL is incomplete", 400));
    }

    // retrive all that usernames which the currently logged in user follows
    // req.user.username
    let usernames = await Connection.find({$and: [{requestSender: "mario"}, {status: 'accepted'}]}, {_id: 0, requestReceiver: 1});

    console.log(usernames);

    const users = [];

    for(let user of usernames) {
        users.push(user.requestReceiver);
    }

    console.log(users);

    // retreive the posts which are posted by those userids
    let noOfPosts = await Post.find({username: {$in: users}}).count();

    console.log(noOfPosts);

    if(filterBasedOn === '-comments') {
        filterBasedOn = {"reactionsCnt.comments": -1};
    } else if(filterBasedOn === 'comments') {
        filterBasedOn = {"reactionsCnt.comments": 1};
    } else if(filterBasedOn === '-postedAt') {
        filterBasedOn = {"postedAt": -1};
    } else if(filterBasedOn === 'postedAt') {
        filterBasedOn = {"postedAt": 1};
    } else if(filterBasedOn === "-likes") {
        filterBasedOn = {"reactionsCnt.likes": -1};
    } else if(filterBasedOn === "likes") {
        filterBasedOn = {"reactionsCnt.likes": 1};
    } else {
        return next(new AppError("Filter query string is wrong", 400));
    }

    let pagesCnt = Math.floor(noOfPosts / limit) + (noOfPosts % limit !== 0);

    let data = await Post.find({username: {$in: users}}).skip((page - 1) * limit).limit(limit).sort(filterBasedOn);

    res.send({data: data, pagesCnt: pagesCnt});
});

module.exports.getPostsById = catchAsync(async (req, res, next) => {
    console.log(req.params.postId);
    // await Post.findOne({_id: }).exec();
    const post = await Post.findById(req.params.postId);

    if(post === null) {
        return next(new AppError("Post doesn't exist", 400));
    }

    responseObj = {message: "success", post:"post"};

    res.send(responseObj);
});

module.exports.createPostsText = catchAsync(async (req, res, next) => {
    const postsDataFromFrontEnd = req.body;

    if(postsDataFromFrontEnd.length === 0) {
        return next(new AppError("Text should be of length > 0", 400));
    }

    console.log("Posts data is ", postsDataFromFrontEnd);

    const {content, contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;
    const postData = new Post({content: content, contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, updatedAt: postedAt});

    let suc = await postData.save();

    res.send({message: "Post added successfully"});
});

module.exports.createPostsImages = catchAsync(async (req, res, next) => {
    const postsDataFromFrontEnd = req.body;

    console.log("req.file is: ", req.files);

    const imagesUrlArray = [];

    for(let file of req.files) {
        imagesUrlArray.push(file.path);
    }

    if(postsDataFromFrontEnd.contentType === 'image') {
        const {contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;
        const postData = new Post({contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, images: imagesUrlArray, updatedAt: postedAt});

        let suc = await postData.save();

        res.send({message: "Post containing image is added successfully"});
    } else {
        const {content, contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;
        const postData = new Post({content: content, contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, images: imagesUrlArray, updatedAt: postedAt});

        let suc = await postData.save();

        res.send({message: "Post containing image and text is added successfully"});
    }
});

module.exports.createPostsVideo = catchAsync(async (req, res, next) => {
    console.log(req.file);
    const postsDataFromFrontEnd = req.body;

    const videoUrl = req.file.path;

    if(postsDataFromFrontEnd.contentType === 'video') {
        const {contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;
        const postData = new Post({contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, video: videoUrl, updatedAt: postedAt});

        let suc = await postData.save();

        res.send({message: "Post containing video is added successfully"});
    } else {
        const {content, contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;
        const postData = new Post({content: content, contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, video: videoUrl, updatedAt: postedAt});

        let suc = await postData.save();

        res.send({message: "Post containing video and text is added successfully"});
    }
});

module.exports.updatePostsText = catchAsync(async (req, res, next) => {
    let pid = new ObjectId(req.params.postId);

    const {content, hashTags, updatedAt} = req.body;

    console.log(req.body);

    console.log(hashTags);

    let data = await Post.find({_id: pid});

    if(data === null) {
        return next(new AppError("Posts doesn't exist", 400));
    }

    let suc = await Post.updateOne({_id: pid}, {$set: {content: content, hashTags: hashTags, updatedAt: updatedAt}});

    console.log({content, hashTags, updatedAt});

    res.send({message: "Post containing text is updated"});
});

module.exports.updatePostsImages = catchAsync(async (req, res, next) => {
    let pid = new ObjectId(req.params.postId);

    const imagesUrlArray = [];

    let data = await Post.find({_id: pid});

    if(data === null) {
        return next(new AppError("Posts doesn't exist", 400));
    }

    for(let file of req.files) {
        imagesUrlArray.push(file.path);
    }

    const {content, hashTags, updatedAt, contentType} = req.body;

    if(contentType == 'image') {
        let suc = await Post.updateMany({_id: pid}, {$set: {hashTags: hashTags, images: imagesUrlArray, updatedAt: updatedAt}});

        res.send({message: "Post containing image is updated successfully"});
    } else {
        let suc = await Post.updateMany({_id: pid}, {$set: {content: content, hashTags: hashTags, images: imagesUrlArray, updatedAt: updatedAt}});

        res.send({message: "Post containing image and text is updated successfully"});
    }
});

module.exports.updatePostsVideo = catchAsync(async (req, res, next) => {
    let pid = new ObjectId(req.params.postId);

    const videoUrl = req.file.path;

    const {content, hashTags, updatedAt, contentType} = req.body;

    let data = await Post.find({_id: pid});

    if(data === null) {
        return next(new AppError("Posts doesn't exist", 400));
    }
    

    if(contentType == 'video') {
        let suc = await Post.updateMany({_id: pid}, {$set: {hashTags: hashTags, video: videoUrl, updatedAt: updatedAt}});

        res.send({message: "Post containing video is updated successfully"});
    } else {
        let suc = await Post.updateMany({_id: pid}, {$set: {content: content, hashTags: hashTags, video: videoUrl, updatedAt: updatedAt}});

        res.send({message: "Post containing video and text is updated successfully"});
    }
});

module.exports.deletePosts = catchAsync(async (req, res, next) => {
    let pid = new ObjectId(req.params.postId);

    let data = await Post.find({_id: pid});

    if(data === null) {
        return next(new AppError("Posts doesn't exist", 400));
    }
    

    let suc = await Post.deleteOne({_id: pid});

    res.send({message: "Post deleted successfully"});
});