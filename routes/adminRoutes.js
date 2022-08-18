const express = require('express')

const adminController = require('../controllers/adminController')

const adminRouter = express.Router()

adminRouter.get('/', adminController.getUsers);
adminRouter.get('/:userid', adminController.getUserById);
adminRouter.delete('/:userid', adminController.deleteUserById);

module.exports = adminRouter