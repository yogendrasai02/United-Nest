const express = require("express");
const searchController = require("../controllers/searchController.js");

const searchRouter = express.Router();

searchRouter.get("/", searchController.searchPostsAndUsers);

module.exports = searchRouter;
