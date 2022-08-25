const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const UserConnection = require('../models/connectionModel');
const QueryUtils = require('../utils/QueryUtils');
const User = require('../models/userModel');
const Chat = require("../models/chatModel");
const { v4: uuidv4 } = require('uuid');

// * Utility function for intersection of 2 arrays (assuming both have unique elements) *
function set_intersect(a, b) {
    const setA = new Set(a);
    const setB = new Set(b);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return Array.from(intersection);
}

exports.checkIfUsersAreFriends = async (username_1, username_2) => {
    try {
        const ok_1 = await UserConnection.findOne({
            requestSender: username_1,
            requestReceiver: username_2,
            status: 'accepted'
        });
        const ok_2 = await UserConnection.findOne({
            requestSender: username_2,
            requestReceiver: username_1,
            status: 'accepted'
        });
        if(!ok_1 || !ok_2)    return false;
        else    return true;
    }
    catch(err) {
        throw err;
    }
};

// ** Route Handler for /allFriends endpoint **
exports.getAllFriends = catchAsync(async (req, res, next) => {
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
    const queryUtils = new QueryUtils(User.find({
            username: {
                "$in": usernames_friends
            }
        }), req.query).filter().sort('username').limit().paginate();
    const users_friends = await queryUtils.query;
    const friends = [];
    users_friends.forEach(el => {
        friends.push({
            username: el.username,
            profilePhoto: el.profilePhoto
        });
    });
    return res.status(200).json({
        status: 'success',
        data: {
            friends
        }
    });
});

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
    return res.status(200).json({
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
    return res.status(201).json({
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
        return res.status(204).json({
            status: 'success',
            data: null
        });
    }
    followRequest.status = 'accepted';

    let d = await UserConnection.findOne({ 
        requestSender: req.user.username,
        requestReceiver: senderUser.username,
        status: 'accepted'
    })

    console.log(d);

    if(d !== null) {    
        const chatD = await Chat.findOne({$and: [{users: req.user.username}, {users: senderUser.username}]});

        if(chatD === null) {
            const roomId = uuidv4();
            const users = [];

            users.push(req.user.username);
            users.push(senderUser.username);


            const chatData = new Chat({roomId: roomId, users: users});

            let suc = await chatData.save();
        }
    }

    followRequest.requestAcceptedTime = Date.now();
    followRequest = await followRequest.save();
    return res.status(200).json({
        status: 'success',
        data: {
            followRequest
        }
    });
});

exports.getAllConnections = catchAsync(async (req, res, next) => {
    const queryObj = {
        status: 'accepted'
    };
    if(req.path === '/followers') {
        queryObj.requestReceiver = req.user.username;
    } else if(req.path === '/following') {
       queryObj.requestSender = req.user.username; 
    } else {
        return next(new AppError('Invalid URL, not supported', 400));
    }
    const queryUtils = new QueryUtils(
        UserConnection.find(queryObj), req.query
        ).filter().sort().limit().paginate();
    const connections = await queryUtils.query;
    return res.status(200).json({
        status: 'success',
        results: connections.length,
        data: {
            connections
        }
    });
});

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
    return res.status(204).json({
        status: 'success',
        data: null
    });
});