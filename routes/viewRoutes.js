const express = require('express');

const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');

const viewRouter = express.Router();

viewRouter.get('/', authController.isLoggedIn, viewController.renderHomePage);
viewRouter.get('/login', authController.isLoggedIn, viewController.renderLoginPage);
viewRouter.get('/logout', authController.logout);
viewRouter.get('/signup', viewController.renderSignupPage);
viewRouter.get('/forgot-password', viewController.renderForgotPassPage);
viewRouter.get('/resetPassword/:resetToken', viewController.renderResetPassPage);

viewRouter.use(authController.authenticate);

// ** Routes accessible by USER **
viewRouter.use(authController.authorize('user'));
viewRouter.get('/posts', viewController.renderPostsPage);
viewRouter.get('/video-call-lobby', viewController.renderVideoCallLobbyPage);
viewRouter.get('/video-call/:receiver_username', viewController.renderVideoCallPage);

viewRouter.get('/my-profile', viewController.renderMyprofilePage);
viewRouter.get('/profile/:userid', viewController.renderProfilePage);
viewRouter.get('/update', viewController.renderProfileUpdate);
module.exports = viewRouter;