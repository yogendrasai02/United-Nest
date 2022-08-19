const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const userRouter = express.Router();
const fileStorage = require('../utils/multer');
userRouter.post('/signup', authController.signup);

userRouter.post('/login', authController.login);

//** here are the routes for handling user profile **
userRouter.get('/myProfile', userController.getProfile);
//images is the name for input in form
userRouter.patch('/updateProfile', fileStorage('profile').single('profile') ,userController.updateProfile);
userRouter.delete('/deleteProfile', userController.deleteProfile);
userRouter.get('/profile/:userid', userController.getProfileByID);

module.exports = userRouter;