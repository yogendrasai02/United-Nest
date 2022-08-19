const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const userRouter = express.Router();
const fileStorage = require('../utils/multer');

userRouter.use(authController.authenticate, authController.authorize('user'))


//** here are the routes for handling user profile **
userRouter.get('/myProfile', userController.getProfile);
userRouter.patch('/updateProfile', fileStorage('images').single('images') ,userController.updateProfile);
userRouter.delete('/deleteProfile', userController.deleteProfile);
userRouter.get('/profile/:userid', userController.getProfileByID);

module.exports = userRouter;