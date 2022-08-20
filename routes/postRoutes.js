const express = require("express");
const postController = require("../controllers/postController.js");
const fileStorage = require("../utils/multer.js");
const authController = require("../controllers/authController.js");
const commentRouter = require("../routes/commentRoutes.js");

const postRouter = express.Router();

postRouter.use(authController.authenticate, authController.authorize('user'));

postRouter.use("/:postId/comments/", commentRouter);

postRouter.get("/", postController.getPosts);

postRouter.get("/:postId", postController.getPostsById);

postRouter.post("/text", postController.createPostsText); //authController.authorize('user'),

postRouter.post("/images", fileStorage('images').array('images'), postController.createPostsImages); // here 'image' should mathc with the name attribute in the input tag

postRouter.post("/video", fileStorage('video').single('video'), postController.createPostsVideo);

postRouter.put("/text/:postId", postController.updatePostsText);

postRouter.put("/images/:postId", fileStorage('images').array('images'), postController.updatePostsImages);

postRouter.put("/video/:postId", fileStorage('video').single('video'), postController.updatePostsVideo);

postRouter.delete("/:postId", postController.deletePosts);

module.exports = postRouter;