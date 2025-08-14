const Contact = require("../models/contacts.model");
const ContactMember = require("../models/contactMember.model");
const Message = require("../models/message.modal");
const Reaction = require("../models/react.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError.utils");
const ApiResponse = require("../utils/ApiResponse.utils");
const asyncHandler = require("../utils/asyncHandler.utils");
const { emiterSocket } = require("../Socket");
const { chatEventEnumNew } = require("../constants/constants");

const sendMessage = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "Unautharized request", {
      errorMessage: "User not logged in",
    });
  }

  const myUser = await User.findById(user._id);

  if (!myUser._id) {
    throw new ApiError(501, "Unautharized Request");
  }

  const { message, contactId, contain_files, fileType, longitude, latitude } =
    req.body;

  if (!message.trim() && !contain_files) {
    throw new ApiError(400, "Either send file of Message");
  }

  if (!contactId) {
    throw new ApiError(400, "ContactId not found");
  }

  const contact = await Contact.findById(contactId);

  if (!contact._id) {
    throw new ApiError(400, "Contact not found");
  }

  const newMessage = new Message({
    message: message.trim(),
    contactId: contactId,
    userId: myUser._id,
    pending: false,
    hasAttechment: contain_files,
    attechmentType: contain_files && fileType,
    attechmentId: null,
    attechmentLink: "",
    callId: null,
    callType: "",
    isCall: false,
    geoLoc: {
      latitude: latitude,
      longitude: longitude,
    },
  });

  await newMessage.save();

  contact.lastMessage = message.trim();
  await contact.save();

  if (!newMessage._id) {
    throw new ApiError(501, "Message not created");
  }

  if (!newMessage.pending) {
    if (!contact.isGroup) {
      const reciver = await Contact.aggregate([
        {
          $match: {
            _id: contact._id,
            isGroup: false,
          },
        },
        {
          $lookup: {
            from: "contactmembers",
            localField: "_id",
            foreignField: "contactId",
            as: "members",
          },
        },
        {
          $addFields: {
            member: {
              $filter: {
                input: "$members",
                as: "member",
                cond: {
                  $ne: ["$$member.userId", user._id],
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "member.userId",
            foreignField: "_id",
            as: "member.user",
          },
        },
        {
          $unwind: "$member.user",
        },

        {
          $group: {
            _id: "$_id",
            member: {
              $first: "$member.user",
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            userId: {
              $first: "$member._id",
            },
            isOnline: {
              $first: "$member.online",
            },
            socketId: {
              $first: "$member.socketId",
            },
          },
        },
        {
          $match: {
            isOnline: true,
          },
        },
      ]);

      if (reciver) {
        // Working on this
        emiterSocket(req, reciver[0].socketId, chatEventEnumNew.NEW_MESSAGE, {message: newMessage.message})
      }
    } else {
      const myIo = req.app.get('io');
      const recivers = await Contact.aggregate([
        {
          $match: {
            _id: contact._id,
          },
        },
        {
          $lookup: {
            from: "contactmembers",
            localField: "_id",
            foreignField: "contactId",
            as: "members",
          },
        },
        {
          $addFields: {
            member: {
              $filter: {
                input: "$members",
                as: "member",
                cond: {
                  $ne: ["$$member.userId", user._id],
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "member.userId",
            foreignField: "_id",
            as: "member.user",
          },
        },
        {
          $unwind: "$member.user",
        },
        {
          $group: {
            _id: "$_id",
            member: {
              $first: "$member.user",
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            userId: {
              $first: "$member._id",
            },
            isOnline: {
              $first: "$member.online",
            },
            socketId: {
              $first: "$member.socketId",
            },
          },
        },
        {
          $match: {
            isOnline: true,
          },
        },
      ]);

      myIo.to(contact._id).emit(chatEventEnumNew.NEW_MESSAGE, {message: newMessage.message})

      recivers.forEach((reciver)=>{
        myIo.to(reciver.socketId).emit(chatEventEnumNew.NEW_MESSAGE, {message: newMessage.message})
      })

      if (recivers.length) {
        for (let reciver of recivers) {
          emiterSocket(req, reciver._id, chatEventEnumNew.NEW_MESSAGE, {});
        }
      }
      emiterSocket(req, contact._id, chatEventEnumNew.NEW_MESSAGE, {});
    }
  }

  resp
    .status(200)
    .json(
      new ApiResponse(200, { message: newMessage }, "message sent successfully")
    );
});

const deleteMessage = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "Unautharized request", {
      errorMessage: "User not logged in",
    });
  }

  const myUser = await User.findById(user._id);

  if (!myUser._id) {
    throw new ApiError(501, "Unautharized Request");
  }

  const { messageId, contactId } = req.body;

  const message = await Message.findById(messageId);

  if (!message._id) {
    throw new ApiError(400, "Message not found");
  }

  console.log(`user Id: `);
  console.log(`user Id: `);

  console.log(Object.toString(message.userId));

  if (message.userId !== myUser._id) {
    throw new ApiError(400, "Only Sender can delete the message");
  }

  message.isDeleted = true;
  await message.save();

  // Emit to socket

  resp
    .status(201)
    .json(new ApiResponse(201, { removedId: message._id }, "removed"));
});

const replyTo = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "Unautharized request", {
      errorMessage: "User not logged in",
    });
  }

  const myUser = await User.findById(user._id);

  if (!myUser._id) {
    throw new ApiError(501, "Unautharized Request");
  }

  const {
    message,
    contactId,
    contain_files,
    fileType,
    longitude,
    latitude,
    messageId,
  } = req.body;

  if (!message.trim() && !contain_files) {
    throw new ApiError(400, "Either send file of Message");
  }

  if (!contactId || !messageId) {
    throw new ApiError(400, "messageId || ContactId not found");
  }

  const contact = await Contact.findById(contactId);

  if (!contact._id) {
    throw new ApiError(400, "Contact not found");
  }

  const refMessage = await Message.findById(messageId);

  if (!refMessage._id) {
    throw new ApiError(400, "refMessage not found");
  }

  const newMessage = new Message({
    message: message.trim(),
    contactId: contactId,
    userId: myUser._id,
    pending: false,
    hasAttechment: contain_files,
    attechmentType: contain_files && fileType,
    attechmentId: null,
    attechmentLink: "",
    callId: null,
    callType: "",
    isCall: false,
    refferTo: refMessage._id,
    geoLoc: {
      latitude: latitude,
      longitude: longitude,
    },
  });

  await newMessage.save();

  contact.lastMessage = message.trim();
  await contact.save();

  if (!newMessage._id) {
    throw new ApiError(501, "Message not created");
  }

  resp
    .status(200)
    .json(new ApiResponse(200, { message: newMessage }, "Replied success"));
});

const reactTo = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "Unautharized request", {
      errorMessage: "User not logged in",
    });
  }

  const myUser = await User.findById(user._id);

  if (!myUser._id) {
    throw new ApiError(501, "Unautharized Request");
  }

  const { reactionCode, messageId } = req.body;

  if (!reactionCode || !messageId) {
    throw new ApiError(400, "Emoji Reaction Code or MessageId not found");
  }

  const message = await Message.findById(messageId);

  if (!message._id) {
    throw new ApiError(400, "message not found");
  }

  const newReaction = new Reaction({
    messageId: message._id,
    reactCode: reactionCode,
    userId: myUser._id,
  });

  await newReaction.save();

  if (!newReaction) {
    throw new ApiError(501, "reaction not created");
  }

  newReaction.sender._id = myUser._id;
  newReaction.sender.avatar = myUser.avatar;

  resp
    .status(201)
    .json(new ApiResponse(201, { reaction: newReaction }, "Reacted"));
});

module.exports = {
  sendMessage,
  deleteMessage,
  replyTo,
  reactTo,
};
