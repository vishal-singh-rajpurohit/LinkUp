const express = require("express");
const auth = require("../middlewares/auth.middleware")
const { crateGroupChat, createOneOnOneChat, blockContact, unblockContact, archieveContact, unArchieveContact, addToGroup, kickOutFromGroup, changeAvatar } = require("../controllers/contacts.controller");
const { sendMessage, fetchPresentChat, undoMessage, requestVideoCall, declineVideoCall, answerVideoCall, negosiateCall } = require("../controllers/chat.controller");
const { fileUploader } = require("../middlewares/handleFiles.middleware");

const chatRouter = express.Router();
 
chatRouter.route("/save-contact").post(auth, createOneOnOneChat)
chatRouter.route("/create-group-chat").post(auth, crateGroupChat);
chatRouter.route("/block-left").post(auth, blockContact);
chatRouter.route("/un-block").post(auth, unblockContact);

chatRouter.route("/add-to-group").post(auth, addToGroup);
chatRouter.route("/kickout-from-group").post(auth, kickOutFromGroup);

chatRouter.route("/archieve").post(auth, archieveContact);
chatRouter.route("/un-archieve").post(auth, unArchieveContact);

chatRouter.route("/un-archieve").post(auth, fileUploader.single('avatar'), changeAvatar);

chatRouter.route("/send-msg").post(auth, sendMessage);
chatRouter.route("/undo-msg").post(undoMessage);
chatRouter.route("/get-present-chats").post(fetchPresentChat);

chatRouter.route("/call/request-video-call").post(auth, requestVideoCall)
chatRouter.route("/call/decline-video-call").post(auth, declineVideoCall)
chatRouter.route("/call/ans-video-call").post(auth, answerVideoCall)
chatRouter.route("/call/call-nego").post(auth, negosiateCall)


module.exports = chatRouter;