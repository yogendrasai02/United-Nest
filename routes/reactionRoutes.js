const express = require("express");
const reactionRouter = express.Router({mergeParams: true});
const reactionController = require("../controllers/reactionController");
const authController = require("../controllers/authController");

reactionRouter.use(authController.authenticate, authController.authorize('user'));

reactionRouter.get("/", reactionController.getReactions);
reactionRouter.post("/", reactionController.postReaction);
reactionRouter.patch("/:reactionId", reactionController.updateReaction);
reactionRouter.delete("/:reactionId", reactionController.deleteReaction);


module.exports = reactionRouter;