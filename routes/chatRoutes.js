const express = require("express");
const chatController = require("../controllers/chatController");
const chatRouter = express.Router();
const authController = require("../controllers/authController.js");

chatRouter.use(authController.authenticate, authController.authorize('user'));

chatRouter.get("/", chatController.chats_get);

chatRouter.get("/:username1/:username2/:roomId", chatController.chat_get);

chatRouter.get("/createGroup", chatController.group_get);

chatRouter.post("/createGroup", chatController.group_post);

// chatRouter.get("/createChats", chatController.singlechat_post);

module.exports = chatRouter;