const express = require('express');

const authController = require('../controllers/authController');
const videoCallController = require('../controllers/videoCallController');

const videoCallRouter = express.Router();

videoCallRouter.use(authController.authenticate);
videoCallRouter.use(authController.authorize('user'));

videoCallRouter.post('/join', videoCallController.joinVideoCall);

module.exports = videoCallRouter;