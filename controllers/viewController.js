
const Post = require('../models/postModel')
const User = require('../models/userModel')
const UserConnection = require('../models/connectionModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
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
exports.renderPostsPage = (req, res, next) => {
    res.render('posts', {
        title: 'United Nest | Posts'
    });
};

//** To render /my-profile page **
exports.renderMyprofilePage = async (req, res, next) => {
    let count  = await Post.find({username: req.user.username}).count();
    console.log(count, req.user)
    res.render('profile', {
        profile: 'self',
        title: 'United Nest | My-Profile',
        user: req.user,
        postsCount: count
    })    
}

exports.renderProfilePage = async (req,res,next) => {
    const id = req.params.userid;
    const user = await User.findById(id);
    const count =  await Post.find({username: user.username}).count();
    let con = await UserConnection.find({$and: [{requestSender: req.user.username}, {requestReceiver: user.username}]})
    let friend = (con.status === 'accepted') ? true : false;
    res.render('profile', {
        profile: 'other',
        title: 'United Nest | Profile',
        user: req.user,
        postsCount: count,
        isFriend : friend
    })
}

exports.renderResetPassPage = async (req,res,next) =>{
    const token = req.params.resetToken
    res.render('reset_password', {
        title: 'Unites Nest | Reset Password',
        token : token
    })
}

exports.renderProfileUpdate = (req,res,next) => {
    res.render('update_profile', {
        title: 'United Nest | Update-Profile',
        user: req.user,
    })
}

exports.renderSignupPage = (req, res, next) => {
    res.render('signup', {
        title: 'United Nest | SignUp'
    })
}

exports.renderForgotPassPage = (req, res, next)=> {
    res.render('forgot_password', {
        title: 'United Nest | Forgot Password'
    })
}

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

