const express = require("express");
const commentRouter = express.Router({mergeParams: true});
const commentController = require("../controllers/commentController.js");
const authController = require("../controllers/authController.js");

commentRouter.use(authController.authenticate, authController.authorize('user'));

commentRouter.get("/", commentController.getComments);

commentRouter.post("/", commentController.postComment);

commentRouter.put("/:commentId", commentController.updateComment);

commentRouter.delete("/:commentId", commentController.deleteComment);

module.exports = commentRouter;