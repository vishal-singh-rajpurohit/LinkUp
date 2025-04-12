const express = require("express");
const auth = require("../middlewares/auth.middleware")
const { crateGroupChat, createOneOnOneChat } = require("../controllers/contacts.controller");
const { sendMessage, fetchPresentChat, undoMessage } = require("../controllers/chat.controller");

const chatRouter = express.Router();

chatRouter.route("/save-contact").post(auth, createOneOnOneChat)
chatRouter.route("/create-group-chat").post(auth, crateGroupChat);

chatRouter.route("/send-msg").post(auth, sendMessage);
chatRouter.route("/undo-msg").post(undoMessage);
chatRouter.route("/get-present-chats").post(fetchPresentChat);


module.exports = chatRouter;