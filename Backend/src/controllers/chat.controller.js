// create chat and
// group => create, delete, mute, leave, Kick-Out-User, Change-Group-Setting, Make new Admin, View All the Contact List in the group
// Send Message and Undo Message
// Block Contact and Unblock the user
// Sending File

const {io} = require("socket.io");
const ApiError = require("../utils/ApiError.utils");
const ApiResponse = require("../utils/ApiResponse.utils");

const Contacts = require("../models/contacts.model");
const Message = require("../models/message.modal");
const Contact = require("../models/contacts.model");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler.utils");
const { default: mongoose } = require("mongoose");
const ContactMember = require("../models/contactMember.model");
const { ChatEventEnum } = require("../constants/constants");
const { emiterSocket } = require("../Socket");

//Chats
const sendMessage = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "Unautharized request", {
      errorMessage: "User not logged in",
    });
  }

  const { message, contactId } = req.body;

  if (!message || !contactId) {
    console.log("message and contact id required ", message, contactId);
    throw new ApiError(400, "message and contact id required ");
  }

  const Room = await Contacts.exists({
    _id: contactId,
  });

  if (!Room) {
    throw new ApiError(400, "Invalid Room / reciver Id / Chat does not exists");
  }

  const saveChat = await Message.create({
    message: message,
    contactId: contactId,
    senderId: user._id,
  });

  // Update the last message
  const updateLastChat = await Contact.findByIdAndUpdate(
    contactId,
    {
      $set: {
        lastMessage: message._id,
      },
    },
    {
      new: true,
    }
  );

  const chats = await Message.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(saveChat._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "senderId",
        foreignField: "_id",
        as: "sender",
      },
    },
    {
      $addFields: {
        sender: {
          $first: "$sender",
        },
      },
    },
    {
      $project: {
        _id: 1,
        message: 1,
        containsFile: 1,
        file: 1,
        seen: 1,
        socketStatus: 1,
        createdAt: 1,
        "sender._id": 1,
        "sender.avatar": 1,
      },
    },
  ]);

  const recivedMessage = chats[0];

  console.log("recivedMessage Type: ", typeof recivedMessage);

  if (!recivedMessage) {
    throw new ApiError(500, "Internal Server Error", {
      errorMessage: "Internal Server Error",
    });
  }

  // All the members from contact
  const members = await ContactMember.aggregate([
    {
      $match: {
        contactId: new mongoose.Types.ObjectId(contactId),
      },
    },
    {
      $project: {
        userId: 1,
      },
    },
  ]);

  if (!members) {
    throw new ApiError(500, "Members not found", {
      errorMessage: "Members not found",
    });
  }

    emiterSocket(
      req,
      contactId.toString(),
      ChatEventEnum.MESSAGE_RECIVED_EVENT,
      recivedMessage
    );


  console.log("message sent successfully", chats);

  resp
    .status(200)
    .json(
      new ApiResponse(200, { newMessage: chats }, "message sent successfully")
    );
});

const undoMessage = asyncHandler(async (req, resp) => {
  const { messageId, contactId } = req.body;

  if (!messageId) {
    console.log("messageId required", messageId);
    throw new ApiError(400, "message Id required");
  }

  const removeChat = await Message.findByIdAndUpdate(
    messageId,
    {
      $set: {
        isDeleted: true,
      },
    },
    {
      new: true,
    }
  );

  if (!removeChat) {
    throw new ApiError(400, "Error while deleting chat");
  }

  emiterSocket(req, contactId.toString(), "messageUndo", removeChat);

  console.log("chat removed");
  

  resp.status(200).json(new ApiResponse(200, {removed: removeChat}, "message removed from chat"));
});

const blockContact = asyncHandler(async (req, resp) => {
  const { userId, contactId } = req.body;

  if (!contactId) {
    throw new ApiError(400, "contactId required");
  }

  const blocked = await Contact.findByIdAndUpdate(
    contactId,
    {
      $set: {
        blocked: true,
        blockedBy: userId,
      },
    },
    {
      new: true,
    }
  );

  if (!blocked) {
    throw new ApiError(400, "Error While Blocking Contact");
  }

  resp.status(200).json(new ApiResponse(200, {}, "Blocked Success"));
});

const unblockContact = asyncHandler(async (req, resp) => {
  const { contactId } = req.body;

  if (!contactId) {
    throw new ApiError(400, "must provide contact id");
  }

  const blockedUser = await Contact.findByIdAndUpdate(
    contactId,
    {
      $set: {
        blocked: false,
        blockedBy: null,
      },
    },
    {
      new: true,
    }
  );

  if (!blockedUser) {
    throw new ApiError(400, "Error while unblocking contact");
  }

  resp.status(200).json(new ApiResponse(200, {}, "Unblocked"));
});

const createGroupChat = asyncHandler(async (req, resp) => {
  const { userId, groupName, contactsToAdd, whoCanSendMessage, admins } =
    req.body;
  if (!userId || !contactsToAdd || !whoCanSendMessage) {
    throw new ApiError(400, "all values required for create and new group");
  }

  const group = new Contact({
    contacts: contactsToAdd,
    approachedBy: userId,
    isGroup: true,
    groupName: groupName,
    whoCanSendMessages: whoCanSendMessage,
    admins: admins,
  });

  await group.save();

  if (!group) {
    throw new ApiError(400, "Error while creating new group");
  }

  //   SEND AN WELCOME MESSAGE TO ALL THE USER IN THE CAHT

  resp.status(200).json(200, { NewGroup: group }, "group created");
});

const leaveGroupChat = asyncHandler(async (req, resp) => {
  const { userId, isAdmin, chatId } = req.body;

  if (!userId || !chatId) {
    throw new ApiError(400, "must provide group id and user id");
  }

  const groupDetails = await Contact.findById(chatId);

  if (!groupDetails) {
    throw new Error(400, "Group not found");
  }

  let newContacts = [];
  let newAdmins = [];
  groupDetails.contacts.map((elem) => {
    if (userId === elem) {
    } else {
      newContacts.push(elem);
    }
  });

  if (isAdmin) {
    groupDetails.admins.map((elem) => {
      if (userId === elem) {
      } else {
        newAdmins.push(elem);
      }
    });

    const updatedGroup = await Contact.findByIdAndUpdate(
      chatId,
      {
        $set: {
          contacts: newContacts,
          admins: newAdmins,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedGroup) {
      throw new ApiError(400, "Error while updating group");
    }

    resp.status(200).json(new ApiResponse(200, {}, "Leaved Group"));
  }

  const updatedGroup = await Contact.findByIdAndUpdate(
    chatId,
    {
      $set: {
        contacts: newContacts,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedGroup) {
    throw new ApiError(400, "Error while updating group");
  }

  resp.status(200).json(new ApiResponse(200, {}, "Leaved Group"));
});

const fetchPresentChat = asyncHandler(async (req, resp) => {
  const { contactId } = req.body;

  console.log("Contact ID: ", contactId);

  if (!contactId) {
    throw new ApiError(400, "Contact Id must required", {
      errorMessage: "Contact Id must required",
    });
  }

  const isContactExists = await Contact.find({ _id: contactId });

  console.log("Existed contacts: ", isContactExists);

  if (!isContactExists) {
    throw new ApiError(400, "Contact not found", {
      errorMessage: "Contact not found",
    });
  }

  const chats = await Message.aggregate([
    {
      $match: {
        contactId: new mongoose.Types.ObjectId(contactId),
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "senderId",
        foreignField: "_id",
        as: "sender",
      },
    },
    {
      $addFields: {
        sender: {
          $first: "$sender",
        },
      },
    },
    {
      $project: {
        _id: 1,
        message: 1,
        containsFile: 1,
        file: 1,
        seen: 1,
        socketStatus: 1,
        createdAt: 1,
        "sender._id": 1,
        "sender.avatar": 1,
      },
    },
  ]);

  if (!chats) {
    throw new ApiError(400, "Not Chats found ", {
      errorMessage: "Not Chats found",
    });
  }

  resp
    .status(200)
    .json(new ApiResponse(200, { chats: chats }, "Here the chats"));
});

// Only For Admins
const addToGroupChat = asyncHandler(async (req, resp) => {
  const { userId, newUserId, roomId } = req.body;

  if (!userId || !newUserId) {
    throw new ApiError(400, "user id's must required");
  }

  const isValidUser = await User.findById(newUserId);

  if (!isValidUser) {
    throw new ApiError(401, "Invalid User");
  }

  const room = await Contact.findOne({ _id: roomId });

  let newContacts = room.contacts.push(newUserId);

  console.log("now contacts are ", newContacts);

  const updatedRoom = await Contact.findByIdAndUpdate(
    roomId,
    {
      $set: {
        contacts: newContacts,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedRoom) {
    throw new ApiError(400, "Error while adding to the contacts list");
  }

  resp.status(200).json(new ApiResponse(200, {}, "Contact Added"));
});

const addNewAdmin = asyncHandler(async (req, resp) => {
  const { userId, newUserId, roomId } = req.body;

  if (!userId || !newUserId) {
    throw new ApiError(400, "user id's must required");
  }

  const isValidUser = await User.findById(newUserId);

  if (!isValidUser) {
    throw new ApiError(401, "Invalid User");
  }

  const room = await Contact.findOne({ _id: roomId });

  let newAdmins = room.admins.push(newUserId);

  const updateRoom = await Contact.findByIdAndUpdate(
    roomId,
    {
      $set: {
        admins: newAdmins,
      },
    },
    {
      new: true,
    }
  );

  if (!updateRoom) {
    throw new ApiError(400, "Error while updating room");
  }

  resp.status(200).json(new ApiResponse(200, {}, "Admin created"));
});

const deleteTheGroup = asyncHandler(async (req, resp) => {
  const { userId, roomId } = req.body;

  if (!userId || !roomId) {
    throw new ApiError(400, "User and Room Id's must required");
  }

  const isValidAdmin = await Contact.findOneAndDelete({
    _id: roomId,
    approachedBy: userId,
  });

  if (!isValidAdmin) {
    throw new ApiError(400, "Only Creator can Delete the whold Group");
  }

  resp.status(200).json(new ApiResponse(200, {}, "Group Deleted Successfully"));
});

const changeGroupSettings = asyncHandler(async (req, resp) => {
  const { userId, roomId, groupName, whoCanSendMessage } = req.body;

  if (!userId || !roomId || !groupName || !whoCanSendMessage) {
    throw new ApiError(400, "All Data must required");
  }

  const isAdmin = await Contacts.findOne({
    _id: roomId,
    // Check in Admins
  });
});

const kickOutGroupChat = asyncHandler(async (req, resp) => {});

const viewGroupDetails = asyncHandler(async (req, resp) => {
  const { roomId } = req.body;

  if (!roomId) {
    throw new ApiError(400, "room id must required");
  }

  const roomDetails = await Contact.findOne({ _id: roomId });

  if (!roomDetails) {
    throw new ApiError(400, "Room with this id not found");
  }

  resp
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ContactDet: roomDetails },
        "Here is the contact details"
      )
    );
});

module.exports = {
  sendMessage,
  undoMessage,
  blockContact,
  unblockContact,
  createGroupChat,
  leaveGroupChat,
  addToGroupChat,
  addNewAdmin,
  deleteTheGroup,
  changeGroupSettings,
  kickOutGroupChat,
  viewGroupDetails,
  fetchPresentChat,
};
