const Post = require('../models/postModel')
const User = require('../models/userModel')
const Connection = require('../models/connectionModel');
const { connections } = require('mongoose');
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
    let con = await Connection.find({$and: [{requestSender: req.user.username}, {requestReceiver: user.username}]})
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