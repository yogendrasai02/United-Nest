const Filter = require('bad-words');
// require('@tensorflow/tfjs');
const toxicity = require('@tensorflow-models/toxicity');
const axios = require('axios');

const Post = require("../models/postModel.js");
const ObjectId = require("mongodb").ObjectId;
const Connection = require("../models/connectionModel.js");

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const filterBadWords = (content) => {
    const filter = new Filter();
    return filter.clean(content); 
};

const detectToxicText = async (content) => {
    // const threshold = 0.6;
    // const model = await toxicity.load(threshold);
    const model = await toxicity.load();
    const sentences = [content];
    const pred = await model.classify(sentences);
    // console.log(pred);
    return pred;
};

const detectNSFWImage = async (imageURL) => {
    const response = await axios.get(
        process.env.SIGHTENGINE_IMAGE_MODERATION_API_URL, {
            params: {
                'url': imageURL, 
                'models': "nudity,wad,offensive,gore",
                'api_user': process.env.SIGHTENGINE_IMAGE_MODERATION_API_USERNAME,
                'api_secret': process.env.SIGHTENGINE_IMAGE_MODERATION_API_SECRET
            }
        }
    );
    // console.log(response.data);
    return response.data;
};

exports.filterToxicText = catchAsync(async (req, res, next) => {
    if(req.body.content && req.body.content.length > 0) {
        // 1. detect toxic text
        try {
            const predictions = await detectToxicText(req.body.content);
            let toxic = false, reasons = [];
            for(let el of predictions) {
                const {label, results} = el;
                // console.log(el, results);
                if(results[0].match === true) {
                    toxic = true;
                    reasons.push(label);
                }   
            }
            if(toxic) {
                return res.status(400).json({
                    status: 'toxicText',
                    message: 'Toxic Text Detected! Post Creation Cancelled.',
                    reasons: reasons
                });
            }
        } catch (err) {
            console.log(err);
            return next(new AppError('Something went wrong while detecting toxic text', 500));
        }
        // 2. filter bad words text
        req.body.content = filterBadWords(req.body.content);
    }
    return next();
});

exports.imagesModeration = catchAsync(async (req, res, next) => {
    if(req.files && req.files.length > 0 && req.body.contentType.includes('image')) {
        try {
            let reasons = new Set();
            for(let file of req.files) {
                const path = file.path;
                console.log('For Image URL:', path);
                const response = await detectNSFWImage(path);
                const hasNudity = !(response.nudity.safe >= 0.6);
                const hasWeapons = (response.weapon >= 0.6);
                const hasAlcohol = (response.alcohol >= 0.6);
                const hasDrugs = (response.drugs >= 0.6);
                const isOffensive = (response.offensive.prob >= 0.6);
                const isGore = (response.gore.prob >= 0.6);
                const isNSFW = (hasNudity || hasWeapons || hasAlcohol || hasDrugs || isOffensive || isGore);
                if(isNSFW) {
                    if(hasNudity) reasons.add('Has Nudity');
                    if(hasWeapons)  reasons.add('Has Weapons');
                    if(hasAlcohol)  reasons.add('Has Alcohol');
                    if(hasDrugs)    reasons.add('Has Drugs');
                    if(isOffensive) reasons.add('Is Offensive');
                    if(isGore)  reasons.add('Is Gore');
                }
            }
            if(reasons.size > 0) {
                return res.status(400).json({
                    status: 'isNSFW',
                    message: 'Not Safe For Work images detected! Post Creation Cancelled.',
                    reasons: Array.from(reasons)
                })
            }
        } catch (err) {
            return next(new AppError('Something went wrong while moderating images', 500));
        }
    }
    return next();
});

module.exports.getPosts = catchAsync(async (req, res, next) => {
    let filterBasedOn = req.query.sort;
    const page = req.query.page;
    const limit = req.query.limit;

    if(filterBasedOn === undefined || page === undefined || limit === undefined) {
        return next(new AppError("URL is incomplete", 400));
    }

    // retrive all that usernames which the currently logged in user follows
    let usernames = await Connection.find({$and: [{requestSender: req.user.username}, {status: 'accepted'}]}, {_id: 0, requestReceiver: 1});

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

    console.log("data is: ", data);

    return res.status(200).json({
        status: 'success',
        pagesCnt: pagesCnt,
        results: data.length,
        data: {
            posts: data
        }
    });
});

module.exports.getPostsById = catchAsync(async (req, res, next) => {
    console.log(req.params.postId);
    // await Post.findOne({_id: }).exec();
    const post = await Post.findById(req.params.postId);

    if(post === null) {
        return next(new AppError("Post doesn't exist", 400));
    }

    responseObj = {message: "success", post:"post"};

    return res.send(responseObj);
});

module.exports.createPostsText = catchAsync(async (req, res, next) => {
    const postsDataFromFrontEnd = req.body;

    console.log(req.body);

    if(postsDataFromFrontEnd.length === 0) {
        return next(new AppError("Text should be of length > 0", 400));
    }

    console.log("Posts data is ", postsDataFromFrontEnd);

    let {content, contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;

    hashTags = hashTags.split(' ');
    hashTags = hashTags.map(el => '#' + el);

    const postData = new Post({content: content, contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, updatedAt: postedAt});

    let suc = await postData.save();

    return res.status(201).json({
        status: 'success',
        message: "Post added successfully"
    });
});

module.exports.createPostsImages = catchAsync(async (req, res, next) => {
    const postsDataFromFrontEnd = req.body;

    console.log("req.file is: ", req.files);

    const imagesUrlArray = [];

    for(let file of req.files) {
        imagesUrlArray.push(file.path);
    }

    if(postsDataFromFrontEnd.contentType === 'image') {
        let {contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;
        hashTags = hashTags.split(' ');
        hashTags = hashTags.map(el => '#' + el);
        const postData = new Post({contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, images: imagesUrlArray, updatedAt: postedAt});

        let suc = await postData.save();

        return res.status(201).json({ status: 'success', message: "Post containing image is added successfully"});
    } else {
        let {content, contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;
        hashTags = hashTags.split(' ');
        hashTags = hashTags.map(el => '#' + el);
        const postData = new Post({content: content, contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, images: imagesUrlArray, updatedAt: postedAt});

        let suc = await postData.save();

        return res.status(201).json({
            status: 'success',
            message: "Post containing image and text is added successfully"
        });
    }
});

module.exports.createPostsVideo = catchAsync(async (req, res, next) => {
    console.log(req.file);
    const postsDataFromFrontEnd = req.body;

    const videoUrl = req.file.path;

    if(postsDataFromFrontEnd.contentType === 'video') {
        let {contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;
        hashTags = hashTags.split(' ');
        hashTags = hashTags.map(el => '#' + el);
        const postData = new Post({contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, video: videoUrl, updatedAt: postedAt});

        let suc = await postData.save();

        return res.status(201).json({status: 'success', message: "Post containing video is added successfully"});
    } else {
        let {content, contentType, username, postedAt, hashTags} = postsDataFromFrontEnd;
        hashTags = hashTags.split(' ');
        hashTags = hashTags.map(el => '#' + el);
        const postData = new Post({content: content, contentType: contentType, username: username, postedAt: postedAt, hashTags: hashTags, video: videoUrl, updatedAt: postedAt});

        let suc = await postData.save();

        return res.status(201).json({status:'success', message: "Post containing video and text is added successfully"});
    }
});

module.exports.updatePostsText = catchAsync(async (req, res, next) => {
    let pid = new ObjectId(req.params.postId);

    let {content, hashTags, updatedAt} = req.body;

    console.log(req.body);

    console.log(hashTags);

    hashTags = hashTags.split(' ');
    hashTags = hashTags.map(el => '#' + el);

    let data = await Post.find({_id: pid});

    if(data === null) {
        return next(new AppError("Posts doesn't exist", 400));
    }

    let suc = await Post.updateOne({_id: pid}, {$set: {content: content, hashTags: hashTags, updatedAt: updatedAt}});

    console.log({content, hashTags, updatedAt});

    return res.send({message: "Post containing text is updated"});
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

    let {content, hashTags, updatedAt, contentType} = req.body;

    hashTags = hashTags.split(' ');
    hashTags = hashTags.map(el => '#' + el);

    if(contentType == 'image') {
        let suc = await Post.updateMany({_id: pid}, {$set: {hashTags: hashTags, images: imagesUrlArray, updatedAt: updatedAt}});

        return res.send({message: "Post containing image is updated successfully"});
    } else {
        let suc = await Post.updateMany({_id: pid}, {$set: {content: content, hashTags: hashTags, images: imagesUrlArray, updatedAt: updatedAt}});

        return res.send({message: "Post containing image and text is updated successfully"});
    }
});

module.exports.updatePostsVideo = catchAsync(async (req, res, next) => {
    let pid = new ObjectId(req.params.postId);

    const videoUrl = req.file.path;

    let {content, hashTags, updatedAt, contentType} = req.body;

    hashTags = hashTags.split(' ');
    hashTags = hashTags.map(el => '#' + el);

    let data = await Post.find({_id: pid});

    if(data === null) {
        return next(new AppError("Posts doesn't exist", 400));
    }
    

    if(contentType == 'video') {
        let suc = await Post.updateMany({_id: pid}, {$set: {hashTags: hashTags, video: videoUrl, updatedAt: updatedAt}});

        return res.send({message: "Post containing video is updated successfully"});
    } else {
        let suc = await Post.updateMany({_id: pid}, {$set: {content: content, hashTags: hashTags, video: videoUrl, updatedAt: updatedAt}});

        return res.send({message: "Post containing video and text is updated successfully"});
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