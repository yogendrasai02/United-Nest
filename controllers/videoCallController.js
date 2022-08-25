const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const AppError = require('../utils/AppError');
const connectionController = require('./connectionController');
const catchAsync = require('../utils/catchAsync');

let twilioClient = null;

// ** TWILIO VIDEO CALL **

// function to find|create a room based on 'roomName'
const findOrCreateRoom = async (roomName) => {
    try {
        // 1. if room doesnt exist, it throws error 20404
        await twilioClient.video.rooms(roomName).fetch();
    } catch (err) {
        if(err.code === 20404) {
            // 2. room not found, create it
            await twilioClient.video.rooms.create({
                uniqueName: roomName,
                type: "go"
            });
        } else {
            // 3. bubble up errors
            throw error;
        }
    }
};

// function to generate an access token for a user with 'username'
const getAccessToken = (roomName, username) => {
    // 1. create token
    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
        {
            identity: username,
            ttl: process.env.TWILIO_ACCESS_TOKEN_EXPIRES_IN_SECONDS
        }
    );
    // 2. create a video grant for this room
    const videoGrant = new VideoGrant({
        room: roomName
    });
    // 3. add the video & send token
    token.addGrant(videoGrant);
    return token.toJwt();
};

// route for joining a video call
exports.joinVideoCall = catchAsync(async (req, res, next) => {
    twilioClient = req.twilioClient;
    // 1. get usernames of both users
    const validReqBody = req.body && req.body.username_receiver;
    if(!validReqBody) {
        return next(new AppError('Please provide username of receiver', 400));
    }
    const { username_receiver } = req.body;
    const username_1 = req.user.username;
    const username_2 = username_receiver;
    if(username_1 == username_2) {
        return next(new AppError('You cannot join a video call with yourself', 400));
    }
    // 2. check if both users are followers of each other
    const areFriends = await connectionController.checkIfUsersAreFriends(username_1, username_2);
    if(!areFriends) {
        return next(new AppError('Users must be mutual followers to join a video call', 400));
    }
    // 3. create the room
    let mnUsername = username_1;
    let mxUsername = username_1;
    if(username_2 < mnUsername) mnUsername = username_2;
    if(username_2 > mxUsername) mxUsername = username_2;
    const roomName = `video-${mnUsername}-${mxUsername}`;
    findOrCreateRoom(roomName);
    // 4. get access token
    const token = getAccessToken(roomName, username_1);
    // 4.1 add cookie
    // res.cookie('videoCallAccessToken', token, {
    //     maxAge: process.env.TWILIO_ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000,
    //     httpOnly: true
    // });
    console.log(`Video Call access granted for user ${username_1} for room ${roomName}`);
    return res.status(200).json({
        status: 'success',
        roomName: roomName,
        videoCallAccessToken: token
    });
});