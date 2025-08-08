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

    console.log(`req body: ${JSON.stringify(contacts, null, 2)}`);

    if (!groupName || !description || !whoCanSend || contacts.length < 3) {
      throw new ApiError(400, "All values must required", {
        errorMessage: "All values must required",
      });
    }

    const newGroup = new Contact({
      isGroup: true,
      groupName: groupName,
      whoCanSend: String.prototype.toUpperCase(whoCanSend),
      description: description,
      createdBy: user._id,
    });

    await newGroup.save();

    if (!newGroup) {
      throw new ApiError(400, "Error while creating new group", {
        errorMessage: "Error while creating new group",
      });
    }

    contacts.forEach(async (element) => {
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
    });

    const newGroupDetails = await Contact.aggregate([
      {
        $match: {
          _id: newGroup._id,
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
          _id: "$_id",
          isGroup: { $first: "$isGroup" },
          groupName: { $first: "$groupName" },
          avatar: { $first: "$avatar" },
          lastMessage: { $first: "$lastMessage" },
          whoCanSend: { $first: "$whoCanSend" },
          description: { $first: "$description" },
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
          groupName: 1,
          whoCanSend: 1,
          avatar: 1,
          description: 1,
          lastMessage: 1,
          "members._id": 1,
          "members.isAdmin": 1,
          "members.user._id": 1,
          "members.user.userName": 1,
          "members.user.serachTag": 1,
          "members.user.socketId": 1,
          "members.user.email": 1,
          "members.user.avatar": 1,
        },
      },
    ]);

    if (!newGroupDetails) {
      throw new ApiError(400, `group not found after creation`);
    }

    console.log(JSON.stringify(newGroupDetails, null, 2));

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

module.exports = {
  createOneOnOneChat,
  crateGroupChat,
  searchContacts,
  blockContact,
};
