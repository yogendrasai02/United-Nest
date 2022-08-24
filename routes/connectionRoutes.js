const express = require('express');

const authController = require('../controllers/authController');
const connectionController = require('../controllers/connectionController');

const connectionRouter = express.Router();

connectionRouter.use(authController.authenticate, authController.authorize('user'));

connectionRouter.get('/all-friends', connectionController.getAllFriends);
connectionRouter.get('/followers', connectionController.getAllConnections);
connectionRouter.get('/following', connectionController.getAllConnections);
connectionRouter.delete('/following/:username', connectionController.unfollowUser);

connectionRouter.get('/followerRequests/:action', connectionController.getPendingFollowRequests);
connectionRouter.patch('/followRequests/:username', connectionController.sendFollowRequest);
connectionRouter.patch('/followRequests/:username/:action', connectionController.actOnFollowRequest);

module.exports = connectionRouter;