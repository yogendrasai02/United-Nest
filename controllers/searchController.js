const Post = require("../models/postModel.js");
const User = require("../models/userModel.js");
const Connection = require("../models/connectionModel.js")
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

module.exports.searchPostsAndUsers = catchAsync(async (req, res, next) => {
    const type = req.query.type;
    const searchValue = req.query.searchQuery;
    if(type === 'hashtag') {
        // const page = req.query.page;
        // const limit = req.query.limit;

        // let filterBasedOn = req.query.filter;
        // if(filterBasedOn === '-comments') {
        //     filterBasedOn = {"reactionsCnt.comments": -1};
        // } else if(filterBasedOn === 'comments') {
        //     filterBasedOn = {"reactionsCnt.comments": 1};
        // } else if(filterBasedOn === '-postedAt') {
        //     filterBasedOn = {"postedAt": -1};
        // } else if(filterBasedOn === 'postedAt') {
        //     filterBasedOn = {"postedAt": 1};
        // } else if(filterBasedOn === "-likes") {
        //     filterBasedOn = {"reactionsCnt.likes": -1};
        // } else if(filterBasedOn === "likes") {
        //     filterBasedOn = {"reactionsCnt.likes": 1};
        // } else {
        //     return next(new AppError("Filter query string is wrong", 400));
        // }
        
        // //req.user.username;
        
        // let connectedUsers = await Connection.find({$and: [{requestSender: "mario"}, {status: 'accepted'}]}, {_id: 0, requestReceiver: 1});

        // console.log(connectedUsers);

        // const users = [];

        // for(let user of connectedUsers) {
        //     users.push(user.requestReceiver);
        // }

        // users.push("mario");

        // console.log(users);

        // const noOfPosts = await Post.find({$and: [{hashTags: searchValue}, {username: {$in: users}}]}).count();

        // let pagesCnt = Math.floor(noOfPosts / limit) + (noOfPosts % limit !== 0);

        // const posts = await Post.find({$and: [{hashTags: searchValue}, {username: {$in: users}}]}).skip((page - 1) * limit).limit(limit).sort(filterBasedOn);

        // res.send({posts: posts, pagesCnt: pagesCnt});

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

    const searchHashtag = '#' + searchValue;

    // retreive the posts which are posted by those userids
    let noOfPosts = await Post.find({$and: [{username: {$in: users}}, {hashTags: searchHashtag}]}).count();

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

    let data = await Post.find({$and: [{username: {$in: users}}, {hashTags: searchHashtag}]}).skip((page - 1) * limit).limit(limit).sort(filterBasedOn);

    console.log("data is: ", data);

    return res.status(200).json({
        status: 'success',
        pagesCnt: pagesCnt,
        results: data.length,
        data: {
            posts: data
        }
    });

    } else if(type === "user") {
        const users = await User.find({name: {$regex: searchValue, $options: 'i'}});

        return res.send({users: users});
    } else {
        return next(new AppError("Type is not coorect", 400));
    }
});