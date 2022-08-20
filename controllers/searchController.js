const Post = require("../models/postModel.js");
const User = require("../models/userModel.js");
const Connection = require("../models/connectionModel.js")
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

module.exports.searchPostsAndUsers = catchAsync(async (req, res, next) => {
    const type = req.query.type;
    const searchValue = req.query.searchQuery;
    const page = req.query.page;
    const limit = req.query.limit;

    if(type === 'hashtag') {
        let filterBasedOn = req.query.filter;
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
        
        //req.user.username;
        
        let connectedUsers = await Connection.find({$and: [{requestSender: "mario"}, {status: 'accepted'}]}, {_id: 0, requestReceiver: 1});

        console.log(connectedUsers);

        const users = [];

        for(let user of connectedUsers) {
            users.push(user.requestReceiver);
        }

        users.push("mario");

        console.log(users);

        const noOfPosts = await Post.find({$and: [{hashTags: searchValue}, {username: {$in: users}}]}).count();

        let pagesCnt = Math.floor(noOfPosts / limit) + (noOfPosts % limit !== 0);

        const posts = await Post.find({$and: [{hashTags: searchValue}, {username: {$in: users}}]}).skip((page - 1) * limit).limit(limit).sort(filterBasedOn);

        res.send({posts: posts, pagesCnt: pagesCnt});

    } else if(type === "user") {
        const users = await User.find({username: searchValue});

        res.send({users: users});
    } else {
        return next(new AppError("Type is not coorect", 400));
    }
});