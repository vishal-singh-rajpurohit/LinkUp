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

    const reciver = await User.findById(reciverId);

    if(!reciver){
      throw new ApiError(400, "user does not exists")
    }

    if (!reciverId) {
      throw new ApiError(401, "Must Provide user id", {
        errorMessage: "Unautharized request",
      });
    }

    const isAlreadyContact = await Contact.findOne({
      oneOnOne: {
        $all: [user._id, new mongoose.Types.ObjectId(reciverId)],
      },
      isGroup: false,
    });

    // if (isAlreadyContact) {
    //   resp
    //     .status(200)
    //     .json(new ApiResponse(200, {}, "Contact already existed"));
    //   return;
    // }

    // create new contact if not
    const newContact = new Contact({
      createdBy: user._id,
      oneOnOne: [user._id, reciverId],
      groupName: reciver.userName,
      isGroup: false,
    });

    await newContact.save();

    if (!newContact) {
      throw new ApiError(400, "Unable to create contact", {
        errorMessage: "Unable to create contact",
      });
    }

    const contacts = [user._id, reciverId];

    const appendInUserContacts = await User.findByIdAndUpdate(user._id, {
      $addToSet: {
        contacts: newContact._id,
      },
    });

    if (!appendInUserContacts) {
      throw new ApiError(
        500,
        "Internal server error , while adding new contacts",
        {
          errorMessage: "Internal server error , while adding new contacts",
        }
      );
    }

    for (const id of contacts) {
      const contactMember = new ContactMember({
        userId: id,
        contactId: newContact._id,
        addedBy: null,
        isAdmin: true,
      });

      await contactMember.save();

      if (!contactMember) {
        throw new ApiError(401, "Error while adding new contact members", {
          errorMessage: "Error while adding new contact menbers",
        });
      }
    }

    const contactUserDetails = await Contact.findOne({
      oneOnOne: {
        $all: [user._id, reciverId],
      },
    });

    console.log("contact user :", contactUserDetails);

    if (!contactUserDetails) {
      throw new ApiError(400, "Error while getting user details");
    }

    resp
      .status(200)
      .json(
        new ApiResponse(
          200,
          { NewContact: newContact, contactUser: contactUserDetails },
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

    const { contacts, groupName, whoCanSendMessage, isSearchable } = req.body;

    contacts.push(user._id);

    if (!contacts || !groupName || !whoCanSendMessage) {
      throw new ApiError(400, "All values must required", {
        errorMessage: "All values must required",
      });
    }

    const newGroup = new Contact({
      createdBy: user._id,
      isGroup: true,
      groupName: groupName,
      whoCanSendMessage: whoCanSendMessage,
      isSearchable: false,
    });

    await newGroup.save();

    if (!newGroup) {
      throw new ApiError(400, "Error while creating new group", {
        errorMessage: "Error while creating new group",
      });
    }

    contacts.forEach(async (element) => {
      let addedMember = new ContactMember({
        userId: element,
        contactId: newGroup._id,
        addedBy: user._id,
      });

      await addedMember.save();

      if (!addedMember) {
        throw new ApiError(400, "Error while adding new contact member", {
          errorMessage: "Error while adding new contact member",
        });
      }
    });

    let newGroupDetails = await Contact.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(newGroup._id),
        },
      },
      {
        $lookup: {
          from: "contactmembers",
          localField: "_id",
          foreignField: "contactId",
          as: "user_details",
          pipeline: [
            {
              $addFields: {
                contactId: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ["$contactId", null] },
                        { $ne: ["$contactId", ""] },
                      ],
                    },
                    then: { $toObjectId: "$contactId" },
                    else: null,
                  },
                },
              },
            },
          ],
        },
      },
      {
        $unwind: "$user_details",
      },
      {
        $lookup: {
          from: "users",
          localField: "user_details.userId",
          foreignField: "_id",
          as: "user_details.user",
        },
      },
      {
        $unwind: "$user_details.user",
      },
      {
        $group: {
          _id: "$_id",
          oneOnOne: { $first: "$oneOnOner" },
          isGroup: { $first: "$isGroup" },
          whoCanSendMessage: { $first: "$whoCanSendMessage" },
          isSearchable: { $first: "$isSearchable" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          userDetails: { $push: "$user_details.user" },
        },
      },
      {
        $project: {
          _id: 1,
          oneOnOne: 1,
          isGroup: 1,
          groupName: 1,
          whoCanSendMessage: 1,
          "userDetails.userName": 1,
          "userDetails.avatar": 1,
          "userDetails.searchTag": 1,
          "userDetails.email": 1,
        },
      },
    ]);

    while (newGroupDetails.length <= 0) {
      newGroupDetails = await Contact.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(newGroup._id),
          },
        },
        {
          $lookup: {
            from: "contactmembers",
            localField: "_id",
            foreignField: "contactId",
            as: "user_details",
            pipeline: [
              {
                $addFields: {
                  contactId: {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ["$contactId", null] },
                          { $ne: ["$contactId", ""] },
                        ],
                      },
                      then: { $toObjectId: "$contactId" },
                      else: null,
                    },
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: "$user_details",
        },
        {
          $lookup: {
            from: "users",
            localField: "user_details.userId",
            foreignField: "_id",
            as: "user_details.user",
          },
        },
        {
          $unwind: "$user_details.user",
        },
        {
          $group: {
            _id: "$_id",
            oneOnOne: { $first: "$oneOnOner" },
            isGroup: { $first: "$isGroup" },
            whoCanSendMessage: { $first: "$whoCanSendMessage" },
            isSearchable: { $first: "$isSearchable" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            userDetails: { $push: "$user_details.user" },
          },
        },
        {
          $project: {
            _id: 1,
            oneOnOne: 1,
            isGroup: 1,
            groupName: 1,
            whoCanSendMessage: 1,
            "userDetails.userName": 1,
            "userDetails.avatar": 1,
            "userDetails.searchTag": 1,
            "userDetails.email": 1,
          },
        },
      ]);
    }

    if (newGroupDetails.length <= 0) {
      await Contact.findByIdAndDelete(newGroup._id);

      await Contact.deleteMany({
        _id: newGroup._id,
      });

      throw new ApiError(400, "Error while serving details ", {
        errorMessage: "Error while serving details ",
      });
    }

    if (!newGroupDetails) {
      throw new ApiError(400, "Error to fetch the group details", {
        errorMessage: "Error to fetch the group details",
      });
    }

    resp
      .status(200)
      .json(
        new ApiResponse(
          200,
          { newGroupDetails: newGroupDetails },
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
        $lookup: {
          from: "contacts",
          localField: "_id",
          foreignField: "oneOnOne",
          as: "contacts_list",
        },
      },
      {
        $project: {
          userName: 1,
          _id: 1,
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
            $cond: {
              if: {
                $or: [
                  {
                    $eq: ["$_id", new mongoose.Types.ObjectId(user._id)],
                  },
                  {
                    $eq: [new mongoose.Types.ObjectId(user._id), "$_id"],
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
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
          { Contacts: search_Contacts },
          "Here are search contacts"
        )
      );
  } catch (error) {
    console.log("Error in searh contact: ", error);
  }
});

module.exports = { createOneOnOneChat, crateGroupChat, searchContacts };
  