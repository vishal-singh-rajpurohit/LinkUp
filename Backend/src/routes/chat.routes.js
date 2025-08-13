const express = require("express");
const auth = require("../middlewares/auth.middleware")
const { crateGroupChat, createOneOnOneChat, blockContact, unblockContact, archieveContact, unArchieveContact, addToGroup, kickOutFromGroup, changeAvatar, upload } = require("../controllers/contacts.controller");
const { sendMessage, deleteMessage} = require("../controllers/chat.controller");
const { fileUploader } = require("../middlewares/handleFiles.middleware");

const chatRouter = express.Router();
 
chatRouter.route("/save-contact").post(auth, createOneOnOneChat);
chatRouter.route("/upload").post(auth, fileUploader.single('avatar'), upload);
chatRouter.route("/create-group-chat").post(auth, crateGroupChat);
chatRouter.route("/block-left").post(auth, blockContact);
chatRouter.route("/un-block").post(auth, unblockContact);

chatRouter.route("/add-to-group").post(auth, addToGroup);
chatRouter.route("/kickout-from-group").post(auth, kickOutFromGroup);

chatRouter.route("/archieve").post(auth, archieveContact);
chatRouter.route("/un-archieve").post(auth, unArchieveContact);
chatRouter.route("/update-avatar").post(auth, fileUploader.single('avatar'), changeAvatar);



// Messaging routes
chatRouter.route("/message/send-msg").post(auth, sendMessage);
chatRouter.route("/message/del-msg").post(auth, deleteMessage);

module.exports = chatRouter;