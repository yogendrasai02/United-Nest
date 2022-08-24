const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const UserConnection = require('../models/connectionModel');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Chat = require("../models/chatModel");
const Group = require("../models/groupModel");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const connectionController = require('./connectionController');
const { v4: uuidv4 } = require('uuid');

// * Utility function for intersection of 2 arrays (assuming both have unique elements) *
function set_intersect(a, b) {
    const setA = new Set(a);
    const setB = new Set(b);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return Array.from(intersection);
}

// ** To render / page **
exports.renderHomePage = (req, res, next) => {
    res.redirect('/login');
};

// ** To render /login page **
exports.renderLoginPage = (req, res, next) => {
    res.render('login', {
        title: 'United Nest | Login'
    });
};

// ** To render /posts page **
exports.renderPostsPage = catchAsync(async (req, res, next) => {

    if(!req.query)  req.query = {};

    // 1. get posts
    let filterBasedOn = req.query.sort;
    let page = req.query.page;
    let limit = req.query.limit;

    if(!filterBasedOn) {
        filterBasedOn = '-postedAt';
    }
    if(!page) {
        page = '1';
    }
    if(!limit) {
        limit = '5';
    }

    // retrive all that usernames which the currently logged in user follows
    let usernames = await UserConnection.find({$and: [{requestSender: req.user.username}, {status: 'accepted'}]}, {_id: 0, requestReceiver: 1});

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
        filterBasedOn = {"postedAt": -1};
    }

    let pagesCnt = Math.floor(noOfPosts / limit) + (noOfPosts % limit !== 0);

    let posts = await Post.find({username: {$in: users}}).skip((page - 1) * limit).limit(limit).sort(filterBasedOn);

    posts.forEach(post => {
        console.log(post);
    });

    // 2. get profile photos (as MAP)
    const userDocs = await User.find({
        username: { $in: users }
    }).select('username profilePhoto');

    const profilePhotosMap = new Map();

    userDocs.forEach(doc => {
        profilePhotosMap.set(doc.username, doc.profilePhoto);
    });

    res.render('posts', {
        title: 'United Nest | Posts',
        pagesCnt, posts, profilePhotosMap,
        currentPage: page
    });
});

exports.renderAddPostPage = (req, res, next) => {
    res.render('addPost', {
        title: 'Add Post | United Nest'
    });
};

// ** To render /video-call-lobby page **
exports.renderVideoCallLobbyPage = catchAsync(async (req, res, next) => {
    const allFollowers = await UserConnection.find({
        requestReceiver: req.user.username,
        status: 'accepted' 
    }).select('requestSender');
    const allFollowing = await UserConnection.find({
        requestSender: req.user.username,
        status: 'accepted'
    }).select('requestReceiver');
    const followers = allFollowers.map(obj => obj.requestSender);
    const following = allFollowing.map(obj => obj.requestReceiver);
    const usernames_friends = set_intersect(followers, following);
    // const queryUtils = new QueryUtils(User.find({
    //         username: {
    //             "$in": usernames_friends
    //         }
    //     }), req.query).filter().sort('username').limit().paginate();
    // const users_friends = await queryUtils.query;
    const users_friends = await User.find({
        username: {
            "$in": usernames_friends
        }
    });
    const friends = [];
    users_friends.forEach(el => {
        friends.push({
            username: el.username,
            profilePhoto: el.profilePhoto
        });
    });
    friends.sort((a, b) => {
        if(a < b)   return -1;
        else if(a > b)  return 1;
        return 0;
    });
    res.render('videoCallLobby', {
        title: 'Video Call Lobby | United Nest',
        friends: friends
    });
});

// ** To render /video-call page **
exports.renderVideoCallPage = catchAsync(async (req, res, next) => {
    // const accessToken = req.cookies.videoCallAccessToken;
    // if(!accessToken) {
    //     res.redirect('/video-call-lobby');
    //     return;
    // }
    // res.render('videoCall', {
    //     accessToken
    // });
    // 1. get receiver user
    const { receiver_username } = req.params;
    if(!receiver_username) {
        return next(new AppError('You must specify a receiver user to start a video call.', 400));
    }
    if(!connectionController.checkIfUsersAreFriends(req.user.username, receiver_username)) {
        return next(new AppError('You can only start a video call if both users mutually follow each other', 400));
    }
    // 2. render page
    res.render('videoCall', {
        title: 'Video Call | United Nest',
        username_receiver: receiver_username
    });
});


module.exports.chats_get = async (req, res) => {

    let username, userDataFromDb;

    username = req.user.username;

    console.log(username);

    try {
        userDataFromDb = await Chat.find({users : username}).exec();
    } catch(e) {
        console.log("Error ", e);
    }

    console.log("User data from DB: ", userDataFromDb);

    users = [];

    for(let val of userDataFromDb) {
        let user = {};
        if(val['users'][0] != username) {
            const userData = await User.findOne({username: val['users'][0]}, {_id: 0, profilePhoto: 1});
            user = {username: val['users'][0], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
        }
        else {
            const userData = await User.findOne({username: val['users'][1]}, {_id: 0, profilePhoto: 1});
            user = {username: val['users'][1], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
        }

        users.push(user);
    }

    let groupsData = await Group.find({users : username});

    res.render("chats", {username: username, isLoggedIn: true, users: users, groups: groupsData, title: 'United Nest | Posts'});
}

module.exports.chat_get = async (req, res) => {
let fromUserData, toUserData;

// try {
//     fromUserData = await req.users;
// } catch(e) {
//     console.log("Error ", e);
// }

// try {
//     toUserData = await userModel.findOne({username: username2}).exec();
// } catch (e) {
//     console.log("Error: ", e);
// }

const roomId = req.params.roomId;

console.log(roomId);

const username = req.user.username;

let checkUsers = await Chat.findOne({roomId: roomId}, {_id: 0, users: 1});

console.log("Check Users: ", checkUsers);

if(checkUsers === null) {
    checkUsers = await Group.findOne({roomId: roomId}, {_id: 0, users: 1});
}

checkUsers = checkUsers['users'];

if(checkUsers === null) {
    //handle the case of id doesn't exist
}

console.log("check Users: ", checkUsers);

let c = 0;

for(let usr of checkUsers) {
    if(usr === username) {
        c = 1;
        break;
    }
}

if(c === 0) {
    res.redirect("/chats");
}
// if(username !== req.params.username1) {
//     return res.redirect("/chats");
// }

console.log("fromUsername: ",username);

// console.log(req.user);

const toUsername = req.params.name2;

let groupCheck = await Group.find({groupname: toUsername});

let isGroup = false;

console.log("Group check: ",groupCheck);

if(groupCheck.length !== 0) {
    isGroup = true;
}

try {
    userDataFromDb = await Chat.find({users : username}).exec();
} catch(e) {
    console.log("Error ", e);
}

users = [];

let toUserProfilePhoto = '';

for(let val of userDataFromDb) {
    let user = {};
    let usrname;
    if(val['users'][0] != username) {
        const userData = await User.findOne({username: val['users'][0]}, {_id: 0, profilePhoto: 1});
        if(userData['profilePhoto'] === '') {
            userData['profilePhoto'] = '/img/user.png';
        }
        usrname = val['users'][0];
        user = {username: val['users'][0], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
    }
    else {
        const userData = await User.findOne({username: val['users'][1]}, {_id: 0, profilePhoto: 1});
        if(userData['profilePhoto'] === '') {
            userData['profilePhoto'] = '/img/user.png';
        }
        usrname = val['users'][1];
        user = {username: val['users'][1], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
    }
    if(usrname == toUsername) {
        toUserProfilePhoto = user['profilePhoto'];
    }
    users.push(user);
}

let groupsData = await Group.find({users : username});

console.log("USERS: ", users);

console.log("GROUPS DATA: ", groupsData);

console.log(toUserProfilePhoto);

if(toUserProfilePhoto === '') {
    toUserProfilePhoto = '/img/users-three.png';
}

res.render("chat", {isLoggedIn: true, roomId: roomId, username: username, toUsername: toUsername, users: users, groups: groupsData, title: 'United Nest | Posts', toUserProfilePhoto: toUserProfilePhoto, isGroup: isGroup});
}

module.exports.group_get = async (req, res) => {
const userData = await User.find({}, {_id: 0, username: 1});
res.render("creategroup", {isLoggedIn: true, userData: userData, title: 'United Nest | Chats'});
}

module.exports.get_group_details = async (req, res) => {
const gname = req.params.gname;
console.log("gname: ", gname);

const gDetails = await Group.find({groupname: gname});

console.log("gDetails: ",gDetails); 

const users = gDetails[0].users;

const photos = {};

for(let user of users) {
    const profilePhoto = await User.find({username: user}, {profilePhoto: 1});
    if(profilePhoto[0]['profilePhoto'] === '') {
        photos[user] = '/img/user.png';
    } else {
        photos[user] = profilePhoto[0]['profilePhoto'];
    }
}

console.log('photos: ', photos);
res.render("viewgroup", {groupdetails: gDetails, photos: photos, title: 'United Nest | Posts'});
}

module.exports.group_post = async (req, res) => {
console.log("In Group post");

const groupDetails = JSON.parse(JSON.stringify(req.body));

let groupCheck = await Group.find({groupname: groupDetails.gname});

if(groupCheck.length !== 0) {
    //send an error message that group already exists
}

const roomId = uuidv4();

const createdBy = req.user.username;

let users = [];

console.log(req.body);

console.log("Group details: ", groupDetails);   

for(let val in groupDetails) {
    if(val.startsWith("user")) {
        users.push(groupDetails[val]);
    }
}

users.push(createdBy);

const groupData = new Group({roomId: roomId, createdBy: createdBy, users: users, groupname: groupDetails.gname, description: groupDetails.description});

await groupData.save();

res.redirect("/chats");
// try {
//     userDataFromDb = await Chat.find({users : createdBy}).exec();
// } catch(e) {
//     console.log("Error ", e);
// }

// users = [];

// for(let val of userDataFromDb) {
//     let user = {};
//     if(val['users'][0] != createdBy) {
//         const userData = await User.findOne({username: val['users'][0]}, {_id: 0, profilePhoto: 1});
//         user = {username: val['users'][0], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
//     }
//     else {
//         const userData = await User.findOne({username: val['users'][1]}, {_id: 0, profilePhoto: 1});
//         user = {username: val['users'][1], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
//     }

//     users.push(user);
// }

// let groupsData = await Group.find({users : createdBy});

// res.render("chats", {username: createdBy, isLoggedIn: true, users: users, groups: groupsData, title: 'United Nest | Posts'});
}


// ** Route Handler for /followRequests/:action endpoint **
exports.getPendingFollowRequests = catchAsync(async (req, res, next) => {
const { action } = req.params;
const initialFilter = { status: 'pending' };
if(action === 'sent')
    initialFilter.requestSender = req.user.username;
else if(action === 'received')
    initialFilter.requestReceiver = req.user.username;
else
    return next(new AppError('Action parameter value can be either sent|received', 400));
const queryUtils = new QueryUtils(
    UserConnection.find(initialFilter), req.query
    ).filter().sort('-requestSentTime').limit().paginate();
const followRequests = await queryUtils.query;
res.status(200).json({
    status: 'success',
    results: followRequests.length,
    data: {
        followRequests
    }
});
});

// ** Route handler for send follow request endpoint **
exports.sendFollowRequest = catchAsync(async (req, res, next) => {
const { username } = req.params;
const intendedUser = await User.findOne({ username });
if(!intendedUser) {
    return next(new AppError('Invalid username, Intended User Not Found', 400));
}
console.log(username);
const sentRequest = await UserConnection.create({
    requestSender: req.user.username,
    requestReceiver: intendedUser.username
});
res.status(201).json({
    status: 'success',
    data: {
        sentRequest
    }
});
});

// ** Route handle for accept|reject follow request endpoint **
exports.actOnFollowRequest = catchAsync(async (req, res, next) => {
const { username, action } = req.params;
if(username === req.user.username) {
    return next(new AppError('Username cannot be same as currently logged in user', 400));
}
if(!['accept', 'reject'].includes(action)) {
    return next(new AppError('Action parameter value can be either accept|reject'));
}
const senderUser = await User.findOne({ username });
if(!senderUser) {
    return next(new AppError('Invalid username, Sender User not found', 400));
}
let followRequest = await UserConnection.findOne({
    requestSender: senderUser.username,
    requestReceiver: req.user.username,
    status: 'pending'
});
if(!followRequest) {
    return next(new AppError('A pending follow request from the specified user does not exist', 400));
}
if(action === 'reject') {
    await UserConnection.deleteOne({ _id: followRequest['_id'] });
    // res.status(204).json({
    //     status: 'success',
    //     data: null
    // });

    res.redirect("/requests/allfollowers");
    return;
}
followRequest.status = 'accepted';

let d = await UserConnection.findOne({ 
    requestSender: req.user.username,
    requestReceiver: senderUser.username,
    status: 'accepted'
})

if(d.length !== 0) {    
    const roomId = uuidv4();
    const users = [];

    users.push(req.user.username);
    users.push(senderUser.username);

    const chatData = new Chat({roomId: roomId, users: users});

    let suc = await chatData.save();
}

followRequest.requestAcceptedTime = Date.now();
followRequest = await followRequest.save();
// res.status(200).json({
//     status: 'success',
//     data: {
//         followRequest
//     }
// });

res.redirect("/requests/allfollowers");
});

exports.getAllConnections = catchAsync(async (req, res, next) => {
console.log("In all connections");
const queryObj = {
    status: 'accepted'
};

let followers = false, following = false;

if(req.path === '/requests/followers') {
    queryObj.requestReceiver = req.user.username;
    followers = true;
} else if(req.path === '/requests/following') {
   queryObj.requestSender = req.user.username; 
   following = true;
} else {
    return next(new AppError('Invalid URL, not supported', 400));
}
const queryUtils = new QueryUtils(
    UserConnection.find(queryObj), req.query
    ).filter().sort().limit().paginate();
const connections = await queryUtils.query;
// res.status(200).json({
//     status: 'success',
//     results: connections.length,
//     data: {
//         connections
//     }
// });

res.render("request", {data: connections, followers: followers, following: following, title: 'United Nest | Requests'});
});

exports.getAllFollowers = async (req, res) => {
const followersAccepted = await UserConnection.find({$and: [{requestReceiver: req.user.username}, {status: "accepted"}]});

const followersPending = await UserConnection.find({$and: [{requestReceiver: req.user.username}, {status: "pending"}]});

console.log("Followers accepted", followersAccepted);

console.log("Followers pending", followersPending);

const acceptedUsers = [];

for(let fa of followersAccepted) {
    let user = {}; 
    
    user['username'] = fa['requestSender'];
    let profilePhoto = await User.find({username: fa['requestSender']}, {_id: 0, profilePhoto: 1});
    user['profilePhoto'] = profilePhoto[0]['profilePhoto'];

    if(user['profilePhoto'] === '') {
        user['profilePhoto'] = '/img/user.png';
    }

    acceptedUsers.push(user);
}

const pendingUsers = [];

for(let fp of followersPending) {
    let user = {}; 

    user['username'] = fp['requestSender'];
    let profilePhoto = await User.find({username: fp['requestSender']}, {_id: 0, profilePhoto: 1});
    user['profilePhoto'] = profilePhoto[0]['profilePhoto'];

    if(user['profilePhoto'] === '') {
        user['profilePhoto'] = '/img/user.png';
    }

    pendingUsers.push(user);
}

console.log("Accepted Users: ", acceptedUsers);
console.log("Pending Users: ", pendingUsers);

res.render("request", {accepted: acceptedUsers, pending: pendingUsers, followers: true, following: false, title: 'United Nest | Requests'});
}

exports.getAllFollowing = async (req, res) => {
const followingAccepted = await UserConnection.find({$and: [{requestSender: req.user.username}, {status: "accepted"}]});

const followingPending = await UserConnection.find({$and: [{requestSender: req.user.username}, {status: "pending"}]});

console.log("following accepted", followingAccepted);

console.log("following pending", followingPending);

const acceptedUsers = [];

for(let fa of followingAccepted) {
    let user = {}; 
    
    user['username'] = fa['requestReceiver'];
    let profilePhoto = await User.find({username: fa['requestReceiver']}, {_id: 0, profilePhoto: 1});
    user['profilePhoto'] = profilePhoto[0]['profilePhoto'];

    if(user['profilePhoto'] === '') {
        user['profilePhoto'] = '/img/user.png';
    }

    acceptedUsers.push(user);
}

const pendingUsers = [];

for(let fp of followingPending) {
    let user = {}; 

    user['username'] = fp['requestReceiver'];
    let profilePhoto = await User.find({username: fp['requestReceiver']}, {_id: 0, profilePhoto: 1});

    user['profilePhoto'] = profilePhoto[0]['profilePhoto'];

    if(user['profilePhoto'] === '') {
        user['profilePhoto'] = '/img/user.png';
    }

    pendingUsers.push(user);
}

console.log("Accepted Users: ", acceptedUsers);
console.log("Pending Users: ", pendingUsers);

res.render("request", {accepted: acceptedUsers, pending: pendingUsers, followers: false, following: true, title: 'United Nest | Posts'});
}

exports.unfollowUser = catchAsync(async(req, res, next) => {

const result = await UserConnection.deleteOne({
    requestSender: req.user.username,
    requestReceiver: req.params.username,
    status: 'accepted'
});

const result2 = await Chat.deleteOne({
    $and: [
        {users: req.user.username}, 
        {users: req.params.username}
    ]
});

if(result.deletedCount == 0) {
    return next(new AppError('Specified user doesnt exists or you are not following that user', 400));
}
res.status(204).json({
    status: 'success',
    data: null
});
});

exports.getComments = catchAsync(async (req, res, next) => {
console.log("Comment ID: ", req.query.commentId);
const commentId = req.query.commentId;
const postId = req.params.postId;
const limit = req.query.limit;
const page = req.query.page;
let noOfComments;

console.log("Post Id: ", postId);
if(page === undefined || limit === undefined) {
    return next(new AppError("URL is incomplete", 400));
}

console.log("Hello-1");

let data = await Post.findById(postId);

if(data === null) {
    return next(new AppError("Post doesn't exist", 400));
}

if(commentId !== 'null') {
    data = await Comment.findById(commentId);

    if(data === null) {
        return next(new AppError("Comment doesn't exist", 400));
    }
}

if(commentId === "null") {
    noOfComments = await Comment.find({$and: [{post: postId}, {parentComment: null}]}).count();
} else {
    noOfComments = await Comment.find({$and: [{post: postId}, {parentComment: commentId}]}).count();
}

console.log(noOfComments);

let pagesCnt = Math.floor(noOfComments / limit) + (noOfComments % limit !== 0);

console.log(pagesCnt);
let filterBasedOn = {};

let filter = '';

if(commentId === "null") {
    filterBasedOn = req.query.filter; // -comments, comments, -commentedAt, commentedAt

    filter = filterBasedOn;

    console.log(filterBasedOn);

    if(filterBasedOn === '-comments') {
        filterBasedOn = {"reactionsCnt.comments": -1};
    } else if(filterBasedOn === 'comments') {
        console.log("Hello");
        filterBasedOn = {"reactionsCnt.comments": 1};
    } else if(filterBasedOn === '-commentedAt') {
        filterBasedOn = {commentedAt: -1};
    } else if(filterBasedOn === 'commentedAt') {
        filterBasedOn = {commentedAt: 1};
    }
} else {
    filterBasedOn = {commentedAt: -1};
}

let comments; 

if(commentId === "null") {
    comments = await Comment.find({$and: [{post: postId}, {parentComment: null}]}).skip((page - 1) * limit).limit(limit).sort(filterBasedOn);
} else {
    comments = await Comment.find({$and: [{post: postId}, {parentComment: commentId}]}).skip((page - 1) * limit).limit(limit).sort(filterBasedOn);
}

console.log("Comments: ", comments);
console.log("Pages Cnt: ", pagesCnt);

// console.log(comments[0]);
// console.log(comments[0]['reactionsCnt']);
// console.log(comments[0]['reactionsCnt'].values());
// console.log(typeof comments[0]['reactionsCnt'].values());
// let va = comments[0]['reactionsCnt'].values();

// let noOfSubComments;

// for(let val of va) {
//     noOfSubComments = val;
// }

let i = 0;

let profilePhotos = {};

let time;

for(let comment of comments) {
    const commentedAt = comment['commentedAt'];
    const username = comment['username'];
    profilePhoto = await User.findOne({username: username}, {_id: 0, profilePhoto: 1});

    console.log("profile photo: ", profilePhoto);

    profilePhotos[username] = profilePhoto['profilePhoto'];
    
    date_now = new Date();

    date_past = new Date(commentedAt);

    var delta = Math.abs(date_past - date_now) / 1000;

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;

    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    var seconds = delta % 60; 

    if(days > 0) {
        time = days + ' d';
    }
    else if(hours > 0){
        time = hours + ' h';
    } else if(minutes > 0) {
        time = minutes + ' m';
    } else {
        time = Math.floor(seconds) + ' s';
    }

    comments[i]['time'] = time;
    i++;
}

profilePhoto = await User.findOne({username: req.user.username}, {_id: 0, profilePhoto: 1});

profilePhotos[req.user.username] = profilePhoto['profilePhoto'];

console.log("filter: ", filter);

const commentDetails = {};

if(commentId !== 'null') {
    const cmt = await Comment.findById(commentId);
    commentDetails['commentContent'] = cmt['content'];
    commentDetails['username'] = cmt['username'];
}

res.render("comments", {comments: comments, pagesCnt: pagesCnt, time: time, profilePhoto: profilePhotos, currPage: page, limit: limit, filterBasedOn: filter, commentId: commentId, postId: postId, commentDetails: commentDetails, title: 'United Nest | Comments', noOfComments: noOfComments});
});

module.exports.postComment = catchAsync(async (req, res, next) => {
console.log("Comment POST")
const postId = req.params.postId;

const {username, content, commentedAt} = req.body;

const commentId = req.query.commentId;

console.log("Comment Id: ",commentId);

console.log("req.body: ", req.body);

if(commentId === "null") {

    console.log("In parent comment");
    //comment is a parent comment  
    const commentData = new Comment({content: content, post: postId, username: username, commentedAt: commentedAt, updatedAt: commentedAt});

    let suc = await commentData.save();

    suc = await Post.findByIdAndUpdate(postId, {$inc: {"reactionsCnt.comments": 1}});

    res.send({"message": "Parent comment added successdully", title: 'United Nest | Comments'});
    // res.redirect(`/posts/${postId}/comments?commentId=null&limit=5&page=1&filter=-comments`);
} else {

    console.log("In child comment");

    const commentData = new Comment({content: content, post: postId, username: username, commentedAt: commentedAt, parentComment: commentId, updatedAt: commentedAt});
    let suc = await commentData.save();

    const id = commentData._id;

    console.log(id);

    suc = await Comment.findByIdAndUpdate(commentId, {$push: {subComment: id}, $inc: {"reactionsCnt.comments": 1}});

    res.send({"message": "child comment added successdully", title: 'United Nest | Comments'});
}
});