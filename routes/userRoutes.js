const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);

userRouter.post('/login', authController.login);

//** here are the routes for handling user profile **
userRouter.get('/myProfile', userController.getProfile);
// userRouter.patch('/updateProfile', )
userRouter.delete('/deleteProfile', userController.deleteProfile);
userRouter.get('/profile/:userid', userController.getProfileByID);

module.exports = userRouter;