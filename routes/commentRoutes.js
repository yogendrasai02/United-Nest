const express = require("express");
const commentRouter = express.Router({mergeParams: true});
const commentController = require("../controllers/commentController.js");

commentRouter.get("/", commentController.getComments);

commentRouter.post("/", commentController.postComment);

commentRouter.put("/:commentId", commentController.updateComment);

commentRouter.delete("/:commentId", commentController.deleteComment);

module.exports = commentRouter;