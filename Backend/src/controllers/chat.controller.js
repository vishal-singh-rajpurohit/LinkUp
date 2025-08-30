const Contact = require("../models/contacts.model");
const ContactMember = require("../models/contactMember.model");
const Message = require("../models/message.modal");
const Reaction = require("../models/react.model");
const { Attachment } = require("../models/attachment.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError.utils");
const ApiResponse = require("../utils/ApiResponse.utils");
const asyncHandler = require("../utils/asyncHandler.utils");
const { emiterSocket } = require("../Socket");
const { chatEventEnumNew } = require("../constants/constants");
const { uploadRawToCloudinary } = require("../utils/cloudinary.utils");

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
    pending: contain_files,
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
      // If not an group chat than you have to send details of message along with userId

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

      emiterSocket(req, myUser.socketId, chatEventEnumNew.NEW_MESSAGE, {
        newMessage: newMessage,
        contactId: contact._id,
      });
      if (reciver.length) {
        // Working on this
        emiterSocket(req, reciver[0].socketId, chatEventEnumNew.NEW_MESSAGE, {
          newMessage: newMessage,
          contactId: contact._id,
        });
      }
    } else {
      // IF Group Chat
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
                  $ne: ["$$member.userId", myUser._id],
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
          $match: {
            "member.user.online": true,
          },
        },
        {
          $group: {
            _id: "$_id",
            member: {
              $addToSet: "$member.user",
            },
          },
        },
        {
          $project: {
            "member._id": 1,
            "member.socketId": 1,
            "member.avatar": 1,
            "member.searchTag": 1,
          },
        },
      ]);

      const messageObject = {
        _id: newMessage._id,
        message: newMessage.message,
        hasAttechment: newMessage.hasAttechment,
        pending: newMessage.pending,
        attechmentLink: newMessage.attechmentLink,
        attechmentType: newMessage.attechmentType,
        isCall: newMessage.isCall,
        callType: newMessage.callType,
        createdAt: newMessage.createdAt,
        sender: {
          _id: myUser._id,
          searchTag: myUser.searchTag,
          avatar: myUser.avatar,
        },
      };

      if (recivers.length) {
        emiterSocket(req, myUser.socketId, chatEventEnumNew.NEW_MESSAGE, {
          newMessage: messageObject,
          contactId: contact._id,
        });
        for (let reciver of recivers[0].member) {
          emiterSocket(req, reciver.socketId, chatEventEnumNew.NEW_MESSAGE, {
            newMessage: messageObject,
            contactId: contact._id,
          });
        }
      }
    }
  }

  resp
    .status(200)
    .json(
      new ApiResponse(200, { message: newMessage }, "message sent successfully")
    );
});

const uploadAttechment = asyncHandler(async (req, resp) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unautharized User");
  }
  const myUser = await User.findById(user._id);
  if (!myUser._id) {
    throw new ApiError(501, "Unautharized Request");
  }
  const path = req.file.path;
  if (!path) {
    throw new ApiError(400, "Files not found");
  }
  const { messageId, contactId, fileType } = req.body;
  if (!contactId || !messageId) {
    throw new ApiError(400, "data not found");
  }
  const message = await Message.findByIdAndUpdate(messageId);
  if (!message) {
    throw new ApiError(400, "Message not found");
  }
  const { file_type, link, public_id } = await uploadRawToCloudinary(path);
  if (!file_type || !link || !public_id) {
    throw new ApiError(501, "Error in Uploading Media");
  }
  const attechment = new Attachment({
    messageId: message._id,
    contactId: message.contactId,
    fileType: fileType,
    link: link,
    public_id: public_id,
  });
  await attechment.save();
  if (!attechment) {
    throw new ApiError(400, "attechment not saved");
  }
  message.hasAttechment = true;
  message.pending = false;
  message.attechmentLink = attechment.link;
  message.attechmentType = attechment.fileType;
  message.attechmentId = attechment._id;
  await message.save();

  const contact = await Contact.findById(contactId);

  if (!contact.isGroup) {
    // If not an group chat than you have to send details of message along with userId

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

    emiterSocket(req, myUser.socketId, chatEventEnumNew.NEW_MESSAGE, {
      newMessage: message,
      contactId: contact._id,
    });
    if (reciver.length) {
      // Working on this
      emiterSocket(req, reciver[0].socketId, chatEventEnumNew.NEW_MESSAGE, {
        newMessage: message,
        contactId: contact._id,
      });
    }
  } else {
    // IF Group Chat
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
                $ne: ["$$member.userId", myUser._id],
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
        $match: {
          "member.user.online": true,
        },
      },
      {
        $group: {
          _id: "$_id",
          member: {
            $addToSet: "$member.user",
          },
        },
      },
      {
        $project: {
          "member._id": 1,
          "member.socketId": 1,
          "member.avatar": 1,
          "member.searchTag": 1,
        },
      },
    ]);

    const messageObject = {
      _id: message._id,
      message: message.message,
      hasAttechment: message.hasAttechment,
      pending: message.pending,
      attechmentLink: message.attechmentLink,
      attechmentType: message.attechmentType,
      isCall: message.isCall,
      callType: message.callType,
      createdAt: message.createdAt,
      sender: {
        _id: myUser._id,
        searchTag: myUser.searchTag,
        avatar: myUser.avatar,
      },
    };

    if (recivers.length) {
      emiterSocket(req, myUser.socketId, chatEventEnumNew.NEW_MESSAGE, {
        newMessage: messageObject,
        contactId: contact._id,
      });
      for (let reciver of recivers[0].member) {
        emiterSocket(req, reciver.socketId, chatEventEnumNew.NEW_MESSAGE, {
          newMessage: messageObject,
          contactId: contact._id,
        });
      }
    }
  }

  resp.status(200)
  .json(new ApiResponse(200, {message: message}, "File Uploaded and message updated"))
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

  if (!messageId || !contactId) {
    throw new ApiError(400, "contact id or messageId not found");
  }

  const message = await Message.findById(messageId);

  if (!message._id) {
    throw new ApiError(400, "Message not found");
  }

  const contact = await Contact.findById(contactId);

  if (!contact) {
    throw new ApiError(400, "contact not found");
  }

  if (!message.userId.equals(myUser._id)) {
    throw new ApiError(400, "Only Sender can delete the message");
  }

  message.isDeleted = true;
  await message.save();

  // Emit to socket
  if (!contact.isGroup) {
    // If not an group chat than you have to send details of message along with userId

    const contacts = await Contact.aggregate([
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

    emiterSocket(req, myUser.socketId, chatEventEnumNew.DELETED_MESSAGE, {
      messageId: message._id,
      contactId: contact._id,
      isGroup: false,
    });

    if (contacts.length) {
      // Working on this
      emiterSocket(
        req,
        contacts[0].socketId,
        chatEventEnumNew.DELETED_MESSAGE,
        {
          messageId: message._id,
          contactId: contact._id,
          isGroup: false,
        }
      );
    }
  } else {
    // IF Group Chat
    const contacts = await Contact.aggregate([
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
                $ne: ["$$member.userId", myUser._id],
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
        $match: {
          "member.user.online": true,
        },
      },
      {
        $group: {
          _id: "$_id",
          member: {
            $addToSet: "$member.user",
          },
        },
      },
      {
        $project: {
          "member._id": 1,
          "member.socketId": 1,
          "member.avatar": 1,
          "member.searchTag": 1,
        },
      },
    ]);

    console.log(`recivers `, JSON.stringify(contacts, null, 2));

    if (contacts.length) {
      emiterSocket(req, myUser.socketId, chatEventEnumNew.DELETED_MESSAGE, {
        messageId: message._id,
        contactId: contact._id,
        isGroup: true,
      });
      for (let reciver of contacts[0].member) {
        console.log(`reciver -> `, JSON.stringify(reciver, null, 2));
        emiterSocket(req, reciver.socketId, chatEventEnumNew.DELETED_MESSAGE, {
          messageId: message._id,
          contactId: contact._id,
          isGroup: true,
        });
      }
    }
  }

  resp.status(201).json(new ApiResponse(201, {}, "deleted from chat"));
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
    searchTag,
  } = req.body;

  if (!message.trim() && !contain_files) {
    throw new ApiError(400, "Either send file of Message");
  }

  if (!contactId || !messageId || !searchTag) {
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

  const targetUser = await User.findOne({ searchTag: searchTag });

  if (!targetUser) {
    throw new ApiError(400, "Invalid search tag");
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
    refferTo: {
      msgId: refMessage._id,
      targetUsetTag: targetUser.searchTag,
    },
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

  console.log("called out ");

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
  uploadAttechment
};
