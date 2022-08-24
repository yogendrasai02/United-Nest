const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const UserConnection = require('../models/connectionModel');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const connectionController = require('./connectionController');

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