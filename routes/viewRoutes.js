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

module.exports = viewRouter;