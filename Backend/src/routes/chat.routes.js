const express = require("express");
const auth = require("../middlewares/auth.middleware")
const { createContact, crateGroupChat } = require("../controllers/contacts.controller");

const chatRouter = express.Router();

chatRouter.route("/create-contact").post(auth, createContact);
chatRouter.route("/create-group-chat").post(auth, crateGroupChat);


module.exports = chatRouter;