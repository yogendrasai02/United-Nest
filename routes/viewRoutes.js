const express = require('express');

const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');

const viewRouter = express.Router();

viewRouter.get('/', authController.isLoggedIn, viewController.renderHomePage);
viewRouter.get('/login', authController.isLoggedIn, viewController.renderLoginPage);
viewRouter.get('/logout', authController.logout);
viewRouter.get('/signup-checkout', viewController.renderSignupCheckoutPage);
viewRouter.get('/signup', viewController.renderSignupPage);
viewRouter.get('/forgot-password', viewController.renderForgotPassPage);
viewRouter.get('/resetPassword/:resetToken', viewController.renderResetPassPage);
viewRouter.get('/verify-account/:verificationToken', viewController.renderVerificationPage);

// ** Routes accessible by USER **
// viewRouter.use(authController.authorize('user'));
viewRouter.get('/posts', authController.authenticate, viewController.renderPostsPage);
viewRouter.get('/add-post', authController.authenticate, viewController.renderAddPostPage);

viewRouter.get('/chats', authController.authenticate, viewController.chats_get);
viewRouter.get('/chats/createGroup', authController.authenticate, viewController.group_get);
viewRouter.post('/chats/createGroup', authController.authenticate, viewController.group_post);
viewRouter.get("/chats/:username1/:name2/:roomId", authController.authenticate, viewController.chat_get);
viewRouter.get("/chats/group/:gname", authController.authenticate, viewController.get_group_details);

viewRouter.get('/requests/followers', authController.authenticate, viewController.getAllConnections);
viewRouter.get('/requests/following', authController.authenticate, viewController.getAllConnections);
viewRouter.delete('/requests/following/:username', authController.authenticate, viewController.unfollowUser);
viewRouter.get('/requests/followerRequests/:action', authController.authenticate, viewController.getPendingFollowRequests);
viewRouter.patch('/requests/followRequests/:username', authController.authenticate, viewController.sendFollowRequest);
viewRouter.patch('/requests/followRequests/:username/:action', authController.authenticate, viewController.actOnFollowRequest);
viewRouter.get('/requests/allfollowers', authController.authenticate, viewController.getAllFollowers);
viewRouter.get('/requests/allfollowing', authController.authenticate, viewController.getAllFollowing);

viewRouter.get('/posts/:postId/comments', authController.authenticate, viewController.getComments);
viewRouter.post('/posts/:postId/comments', viewController.postComment);

viewRouter.get('/video-call-lobby', authController.authenticate, viewController.renderVideoCallLobbyPage);
viewRouter.get('/video-call/:receiver_username', authController.authenticate, viewController.renderVideoCallPage);

viewRouter.get('/my-profile', authController.authenticate, viewController.renderMyprofilePage);
viewRouter.get('/profile/:username', authController.authenticate, viewController.renderProfilePage);
viewRouter.get('/update', authController.authenticate, viewController.renderProfileUpdate);

viewRouter.get("/search", authController.authenticate, viewController.searchPostsAndUsers);

module.exports = viewRouter;