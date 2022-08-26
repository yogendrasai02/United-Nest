const express = require("express");
const postController = require("../controllers/postController.js");
const fileStorage = require("../utils/multer.js");
const authController = require("../controllers/authController.js");
const commentRouter = require("../routes/commentRoutes.js");
const reactionRouter = require("../routes/reactionRoutes");
const postRouter = express.Router();

postRouter.use(authController.authenticate, authController.authorize('user'));

postRouter.use("/:postId/comments/", commentRouter);

postRouter.use("/:postId/reactions", reactionRouter);

postRouter.get("/", postController.getPosts);

postRouter.get("/:postId", postController.getPostsById);

postRouter.post("/text", postController.filterToxicText, postController.createPostsText); //authController.authorize('user'),

postRouter.post(
    "/images", fileStorage('images').array('images'), 
    postController.filterToxicText, postController.imagesModeration, 
    postController.createPostsImages); // here 'image' should mathc with the name attribute in the input tag

postRouter.post(
    "/video", 
    fileStorage('video').single('video'), 
    postController.filterToxicText, 
    postController.createPostsVideo);

postRouter.put("/text/:postId", postController.updatePostsText);

postRouter.put("/images/:postId", fileStorage('images').array('images'), postController.updatePostsImages);

postRouter.put("/video/:postId", fileStorage('video').single('video'), postController.updatePostsVideo);

postRouter.delete("/:postId", postController.deletePosts);

module.exports = postRouter;