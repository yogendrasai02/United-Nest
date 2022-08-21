const express = require('express')

const adminController = require('../controllers/adminController')
const authController = require('../controllers/authController')

const adminRouter = express.Router()

adminRouter.use(authController.authenticate, authController.authorize('admin'));

adminRouter.get('/', adminController.getUsers);
adminRouter.get('/:userid', adminController.getUserById);
adminRouter.delete('/:userid', adminController.deleteUserById);

module.exports = adminRouter