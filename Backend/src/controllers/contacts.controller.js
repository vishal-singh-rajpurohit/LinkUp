const Contact = require("../models/contacts.model");
const User = require("../models/user.model");
const ContactMember = require("../models/contactMember.model");
const asyncHandler = require("../utils/asyncHandler.utils");
const ApiError = require("../utils/ApiError.utils");
const ApiResponse = require("../utils/ApiResponse.utils");
const { default: mongoose } = require("mongoose");

const createOneOnOneChat = asyncHandler(async (req, resp) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unautharized request", {
        errorMessage: "Unautharized request",
      });
    }

    const { reciverId } = req.body;

    if (!reciverId) {
      throw new ApiError(401, "Must Provide user id", {
        errorMessage: "Unautharized request",
      });
    }

    const reciver = await User.findById(reciverId);

    if (!reciver) {
      throw new ApiError(400, "user does not exists");
    }

    const isAlreadyContact = await Contact.findOne({
      oneOnOne: {
        $all: [user._id, reciver._id],
      },
      isGroup: false,
    });

    console.log(`already in contact`);

    if (isAlreadyContact) {
      throw new ApiError(500, "already in contact", {
        errorMessage: "aleady in contact",
      });
    }

    // create new contact if not
    const newContact = new Contact({
      isGroup: false,
      oneOnOne: [user._id, reciverId],
      socketId: null,
    });

    await newContact.save();

    if (!newContact) {
      throw new ApiError(400, "Unable to create contact", {
        errorMessage: "Unable to create contact",
      });
    }

    // Create Members
    const memberOne = new ContactMember({
      userId: user._id,
      contactId: newContact._id,
      addedBy: user._id,
      isArchieved: false,
      isAdmin: true,
    });

    await memberOne.save();

    // Second Member
    const memberTwo = new ContactMember({
      userId: reciverId,
      contactId: newContact._id,
      addedBy: user._id,
      isArchieved: false,
      isAdmin: true,
    });

    await memberTwo.save();

    if (!memberOne || !memberTwo) {
      await Contact.findByIdAndDelete(newContact._id);
      throw new ApiError(500, "Members not created contacts", {
        errorMessage: "Members not created contacts",
      });
    }

    const contactUserDetails = await Contact.aggregate([
      {
        $match: {
          oneOnOne: {
            $in: [user._id, reciver._id],
          },
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
        $project: {
          lastMessage: 1,
          isBlocked: 1,
          updatedAt: 1,
          socketId: 1,
          "member._id": 1,
          "member.isArchieved": 1,
          "member.user._id": 1,
          "member.user.userName": 1,
          "member.user.searchTag": 1,
          "member.user.socketId": 1,
          "member.user.email": 1,
          "member.user.avatar": 1,
          "member.user.online": 1,
        },
      },
    ]);

    if (!contactUserDetails) {
      await Contact.findByIdAndDelete(newContact._id);
      await ContactMember.findByIdAndDelete(memberOne._id);
      await ContactMember.findByIdAndDelete(memberTwo._id);
      throw new ApiError(400, "Error while getting user details");
    }

    resp.status(200).json(
      new ApiResponse(
        200,
        {
          newContact: contactUserDetails[0],
        },
        "Contact created successfully"
      )
    );
  } catch (error) {
    console.log("Error in creating contact :", error);
    throw new ApiError(400, "Error while creating contacts ");
  }
});

const crateGroupChat = asyncHandler(async (req, resp) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthraized User", {
        errorMessage: "Unauthraized User",
      });
    }

    const { contacts, groupName, whoCanSend, description } = req.body;

    contacts.push({ userId: String(user._id), admin: true });

    if (!groupName || !description || !whoCanSend || contacts.length < 3) {
      throw new ApiError(400, "All values must required", {
        errorMessage: "All values must required",
      });
    }

    const newGroup = new Contact({
      isGroup: true,
      groupName: groupName,
      whoCanSend: whoCanSend,
      description: description,
      createdBy: user._id,
    });

    await newGroup.save();

    if (!newGroup) {
      throw new ApiError(400, "Error while creating new group", {
        errorMessage: "Error while creating new group",
      });
    }

    for (const element of contacts) {
      let addedMember = new ContactMember({
        userId: element.userId,
        contactId: newGroup._id,
        addedBy: user._id,
        isAdmin: element.admin ? true : false,
      });

      await addedMember.save();

      if (!addedMember) {
        throw new ApiError(400, "Error while adding new contact member", {
          errorMessage: "Error while adding new contact member",
        });
      }
    }

    const newGroupDetails = await ContactMember.aggregate([
      {
        $match: {
          userId: user._id,
          contactId: newGroup._id,
        },
      },
      {
        $lookup: {
          from: "contacts",
          localField: "contactId",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $unwind: "$group",
      },
      {
        $match: {
          "group.isGroup": true,
        },
      },
      {
        $lookup: {
          from: "contactmembers",
          localField: "group._id",
          foreignField: "contactId",
          as: "members",
        },
      },
      {
        $unwind: "$members",
      },
      {
        $lookup: {
          from: "users",
          localField: "members.userId",
          foreignField: "_id",
          as: "members.user",
        },
      },
      {
        $addFields: {
          "members.user": {
            $first: ["$members.user"],
          },
        },
      },
      {
        $group: {
          _id: "$group._id",
          isBlocked: { $first: "$isBlocked" },
          isArchieved: { $first: "$isArchieved" },
          isGroup: { $first: "$group.isGroup" },
          groupName: { $first: "$group.groupName" },
          avatar: { $first: "$group.avatar" },
          lastMessage: { $first: "$group.lastMessage" },
          isGroup: { $first: "$group.isGroup" },
          roomId: { $first: "$group.socketId" },
          whoCanSend: { $first: "$group.whoCanSend" },
          description: { $first: "$group.description" },
          updatedAt: { $first: "$group.updatedAt" },
          members: {
            $push: "$members",
          },
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "contactId",
          foreignField: "_id",
          as: "messages",
        },
      },
      {
        $project: {
          isGroup: 1,
          isBlocked: 1,
          isArchieved: 1,
          groupName: 1,
          whoCanSend: 1,
          avatar: 1,
          description: 1,
          roomId: 1,
          isGroup: 1,
          lastMessage: 1,
          updatedAt: 1,
          "members._id": 1,
          "members.isAdmin": 1,
          "members.user._id": 1,
          "members.user.userName": 1,
          "members.user.searchTag": 1,
          "members.user.socketId": 1,
          "members.user.online": 1,
          "members.user.email": 1,
          "members.user.avatar": 1,
        },
      },
    ]);

    // Error here
    if (!newGroupDetails[0]) {
      throw new ApiError(400, `group not found after creation`);
    }

    resp
      .status(200)
      .json(
        new ApiResponse(
          200,
          { newGroupDetails: newGroupDetails[0] },
          "Group created successfully"
        )
      );
  } catch (error) {
    console.log("Error in creating group: ", error);
    throw new ApiError(401, "Error while creating group chat ", {
      errorMessage: "Error while creating group chat ",
    });
  }
});

/**
 * @description searching for contacts alson filtered with values if already_Contacts
 */
const searchContacts = asyncHandler(async (req, resp) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unautharized Request", {
        errorMessage: "Unautharized Request",
      });
    }

    const { searchKeyword } = req.body;

    if (!searchKeyword) {
      throw new ApiError(400, "Search Keyword must required", {
        errorMessage: "Search Keyword must required",
      });
    }

    const search_Contacts = await User.aggregate([
      {
        $match: {
          searchTag: {
            $regex: searchKeyword, // Adjust the regex pattern as needed
            $options: "i",
          },
        },
      },
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(user._id) },
        },
      },
      {
        $lookup: {
          from: "contacts",
          localField: "_id",
          foreignField: "oneOnOne",
          as: "contacts_list",
        },
      },
      {
        $project: {
          _id: 1,
          avatar: 1,
          searchTag: 1,
          isOnline: 1,
          "contacts_list.oneOnOne": 1,
          "contacts_list.isGroup": {
            $cond: [false, "$$REMOVE", "$contacts_list.isGroup"],
          },
        },
      },
      {
        $addFields: {
          isContact: {
            $first: "$contacts_list.isGroup",
          },
        },
      },
      {
        $addFields: {
          isContact: { $first: "$isContact" },
        },
      },
      {
        $addFields: {
          already_in_contact: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$contacts_list",
                    as: "contact",
                    cond: {
                      $setEquals: [
                        "$$contact.oneOnOne",
                        ["$_id", new mongoose.Types.ObjectId(user._id)],
                      ],
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      // {
      //   $addFields: {
      //     already_in_contact: {
      //       $cond: {
      //         if: {
      //           $or: [
      //             {
      //               $eq: ["$_id", new mongoose.Types.ObjectId(user._id)],
      //             },
      //             {
      //               $eq: [new mongoose.Types.ObjectId(user._id), "$_id"],
      //             },
      //           ],
      //         },
      //         then: true,
      //         else: false,
      //       },
      //     },
      //   },
      // },
    ]);

    if (!search_Contacts) {
      resp
        .status(300)
        .json(
          new ApiResponse(
            300,
            { Contacts: search_Contacts },
            "Contact not found with this keyword"
          )
        );
    }

    resp
      .status(200)
      .json(
        new ApiResponse(
          200,
          { Users: search_Contacts },
          "Here are search contacts"
        )
      );
  } catch (error) {
    console.log("Error in searh contact: ", error);
  }
});

/**
 * @description Soft Left group and left
 */

const blockContact = asyncHandler(async (req, resp) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(501, "Unauthraized request");
    }

    const { contactId } = req.body;

    if (!contactId) {
      throw new ApiError(400, "Contact id not found");
    }

    const contact = await ContactMember.findOne({
      userId: user._id,
      contactId: contactId,
    });

    if (!contact) {
      throw new ApiError(400, "contact not found");
    }

    contact.isBlocked = true;
    await contact.save();

    resp
      .status(201)
      .json(
        new ApiResponse(200, { message: "blocked" }, "Blocked successfully")
      );
  } catch (error) {
    throw new ApiError(500, "error in block contact");
  }
});

const unblockContact = asyncHandler(async (req, resp) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(501, "Unauthrized Request");
    }

    const { contactId } = req.body;

    if (!contactId) {
      throw new ApiError(400, "Contact id not found");
    }

    const contact = await ContactMember.findOne({
      userId: user._id,
      contactId: contactId,
    });

    if (!contact) {
      throw new ApiError(400, "contact not found");
    }

    contact.isBlocked = false;
    await contact.save();

    resp
      .status(201)
      .json(
        new ApiResponse(
          200,
          { message: "un blocked" },
          "Un Blocked successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "error in unblock function");
  }
});

const archieveContact = asyncHandler(async (req, resp) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(501, "Unauthrized Request");
    }

    const { contactId } = req.body;

    if (!contactId) {
      throw new ApiError(400, "Contact id not found");
    }

    const contact = await ContactMember.findOne({
      userId: user._id,
      contactId: contactId,
    });

    if (!contact) {
      throw new ApiError(400, "contact not found");
    }

    contact.isArchieved = true;
    await contact.save();

    resp
      .status(201)
      .json(
        new ApiResponse(200, { message: "archieved" }, "archieved successfully")
      );
  } catch (error) {
    throw new ApiError(500, "error in archieved function");
  }
});

const unArchieveContact = asyncHandler(async (req, resp) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(501, "Unauthrized Request");
    }

    const { contactId } = req.body;

    if (!contactId) {
      throw new ApiError(400, "Contact id not found");
    }

    const contact = await ContactMember.findOne({
      userId: user._id,
      contactId: contactId,
    });

    if (!contact) {
      throw new ApiError(400, "contact not found");
    }

    contact.isArchieved = false;
    await contact.save();

    resp
      .status(201)
      .json(
        new ApiResponse(
          200,
          { message: "un archieved" },
          "unarchieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "error in unarchieved function");
  }
});

const addToGroup = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(501, "Unautharized request");
  }

  const { members, contactId } = req.body;

  if (!contactId || !members.length) {
    throw new ApiError(400, "members or contactId not found");
  }

  const group = await Contact.findById(contactId);

  if (!group) {
    throw new ApiError(400, "contact not found");
  }

  for (let val of members) {
    const isExistes = await ContactMember.findOne({
      contactId: group._id,
      userId: val._id,
    });

    if (!isExistes) {
      const newMember = new ContactMember({
        addedBy: user._id,
        userId: val._id,
        contactId: group._id,
        isAdmin: false,
        isArchieved: false,
        isBlocked: false,
      });
      await newMember.save();
    }
  }

  resp.status(201).json(new ApiResponse(201, {}, "Added to Chat"));
});

const kickOutFromGroup = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(501, "Unautharized request");
  }

  const { contactId, memberId } = req.body;

  if (!contactId || !memberId) {
    throw new ApiError(400, "Contact Id not found");
  }

  const contact = await Contact.findById(contactId);

  if (!contact) {
    throw new ApiError(400, "Contact not found");
  }

  const isUserInChat = await ContactMember.findOne({
    userId: user._id,
    contactId: contactId,
  });

  if (!isUserInChat.isAdmin) {
    throw new ApiError(400, "Not a member or not a admin");
  }

  const member = await ContactMember.findOne({
    userId: memberId,
    contactId: contactId,
  });

  if (!member._id) {
    throw new ApiError(400, "Member not found in Group");
  }

  member.isBlocked = true;
  await member.save();

  resp.status(201).json(new ApiResponse(201, {}, "Member Removed From Chat"));
});

const changeAvatar = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(501, "Unautharized request");
  }

  const { contactId } = req.body;

  if (!contactId) {
    throw new ApiError(501, "ContactId not found");
  }

  const myUser = await User.findById(user._id);

  if (!myUser) {
    throw new ApiError(501, "Unautharized request");
  }

  const group = await Contact.findById(contactId);

  if (!group) {
    throw new ApiError(400, "Group not found");
  }

  const isAdmin = await ContactMember.findOne({
    userId: user._id,
    contactId: group._id,
  });

  if (!isAdmin.isAdmin) {
    throw new ApiError(400, "User not Admin");
  }

  const path = req.file.path;

  if (!path) {
    throw new ApiError(501, "path not found request");
  }

  if (group.public_id_avatar) {
    await removeFromCloudinary(myUser.public_id_avatar);
  }

  const upload_resp = await uploadToCloudinary(path);

  group.public_id_avatar = upload_resp.public_id;
  group.avatar = upload_resp.url;

  await group.save();

  const updatedGroup = await Contact.findById(group._id)

  if (!updatedGroup) {
    throw new ApiError(501, "Internal server error contact not updated");
  }
  resp.status(201).json(new ApiResponse(201, { avatar: updatedUser.avatar }));
});

module.exports = {
  createOneOnOneChat,
  crateGroupChat,
  searchContacts,
  blockContact,
  unblockContact,
  archieveContact,
  unArchieveContact,
  addToGroup,
  kickOutFromGroup,
  changeAvatar
};
