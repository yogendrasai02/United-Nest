const express = require("express");
const reactionRouter = express.Router({mergeParams: true});
const reactionController = require("../controllers/reactionController");
const authController = require("../controllers/authController");

reactionRouter.use(authController.authenticate, authController.authorize('user'));

reactionRouter.get("/", reactionController.getReactions);
//react to post
//http://localhost:4000/api/v1/posts/:postid/reactions/?type=love|funny|sad|angry|wow|like|dislike
//react to comment
//http://localhost:4000/api/v1/posts/:postid/reactions/?type=love|funny|sad|angry|wow|like|dislike&commentId=id
reactionRouter.post("/", reactionController.postReaction);
//react to post
//http://localhost:4000/api/v1/posts/:postid/reactions/:reactionid/?type=love|funny|sad|angry|wow|like|dislike
//react to comment
//http://localhost:4000/api/v1/posts/:postid/reactions/:reactionid/?type=love|funny|sad|angry|wow|like|dislike&commentId=id
reactionRouter.patch("/:reactionId", reactionController.updateReaction);
reactionRouter.delete("/:reactionId", reactionController.deleteReaction);


module.exports = reactionRouter;