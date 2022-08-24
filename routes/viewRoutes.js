const express = require('express');

const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');

const viewRouter = express.Router();

viewRouter.get('/', authController.isLoggedIn, viewController.renderHomePage);
viewRouter.get('/login', authController.isLoggedIn, viewController.renderLoginPage);
viewRouter.get('/logout', authController.logout);

viewRouter.use(authController.authenticate);

// ** Routes accessible by USER **
viewRouter.use(authController.authorize('user'));
viewRouter.get('/posts', viewController.renderPostsPage);


viewRouter.get('/chats', viewController.chats_get);
viewRouter.get('/chats/createGroup', viewController.group_get);
viewRouter.post('/chats/createGroup', viewController.group_post);
viewRouter.get("/chats/:username1/:name2/:roomId", viewController.chat_get);
viewRouter.get("/chats/group/:gname", viewController.get_group_details);

viewRouter.get('/requests/followers', viewController.getAllConnections);
viewRouter.get('/requests/following', viewController.getAllConnections);
viewRouter.delete('/requests/following/:username', viewController.unfollowUser);
viewRouter.get('/requests/followerRequests/:action', viewController.getPendingFollowRequests);
viewRouter.patch('/requests/followRequests/:username', viewController.sendFollowRequest);
viewRouter.patch('/requests/followRequests/:username/:action', viewController.actOnFollowRequest);
viewRouter.get('/requests/allfollowers', viewController.getAllFollowers);
viewRouter.get('/requests/allfollowing', viewController.getAllFollowing);

viewRouter.get('/posts/:postId/comments', viewController.getComments);
viewRouter.post('/posts/:postId/comments', viewController.postComment);

viewRouter.get('/video-call-lobby', viewController.renderVideoCallLobbyPage);
viewRouter.get('/video-call/:receiver_username', viewController.renderVideoCallPage);

module.exports = viewRouter;