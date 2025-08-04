require("dotenv").config();

const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler.utils");
const ApiError = require("../utils/ApiError.utils");
const ApiResponse = require("../utils/ApiResponse.utils");
const generateTokens = require("../utils/generateTokens.utils");
const { Options } = require("../constants");

const User = require("../models/user.model");
const ContactMember = require("../models/contactMember.model");
const DeletedAccount = require("../models/deletedAccount.model");
const { default: mongoose } = require("mongoose");
const Contact = require("../models/contacts.model");

/**
 * @description these function will pre check the searchTag and Email Avilability
 */
const liveCheckTagSignup = asyncHandler(async (req, resp) => {
  const { searchTag } = req.body;
  if (!searchTag) {
    throw new ApiError(400, "Must proive search tag");
  }

  const isUserExists = await User.exists({ searchTag });

  if (isUserExists) {
    throw new ApiError(401, "this search tag is not avilable", {
      isError: false,
      resp_message: "Search Tag Not Avilable",
    });
  }

  resp.status(200).json(new ApiResponse(200, "tag is avilable", {}));
});

const liveCheckMailSignup = asyncHandler(async (req, resp) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Must proive email", {
      isError: true,
    });
  }

  const isUserExists = await User.exists({ email });

  if (isUserExists) {
    throw new ApiError(401, "this email is not avilable", {
      isError: false,
      resp_message: "An account already existed with this email",
    });
  }

  resp.status(200).json(new ApiResponse(200, "email is avilable", {}));
});

/**
 * @description this function will check given email or searchTag is already avilable or not
 */
const liveCheckTagMailLogin = asyncHandler(async (req, resp) => {
  const { searchTag } = req.body;
  if (!searchTag) {
    throw new ApiError(400, "Must proive search tag");
  }

  const isUserExists = await User.exists({
    $or: [
      {
        searchTag: searchTag,
      },
      {
        email: searchTag,
      },
    ],
  });

  if (!isUserExists) {
    throw new ApiError(401, "user with this email and search tag not found", {
      errorMessege: "user with this email and search tag not found",
    });
  }

  resp.status(200).json(new ApiResponse(200, "valid user", {}));
});

/**
 * @description signUp , logIn
 */
const signUp = asyncHandler(async (req, resp) => {
  try {
    const { userName, searchTag, email, password } = req.body;

    if (!userName || !searchTag || !email || !password) {
      throw new ApiError(401, "all data must required :");
    }

    const isUserExistsWithThisMail = await User.exists({
      email: email,
    });

    if (isUserExistsWithThisMail) {
      throw new ApiError(400, "An User Already Exists With Email", {
        errorMessege: "an user already exists with this email",
      });
    }

    const newUser = new User({
      userName,
      searchTag,
      email,
      password,
      online: true,
    });

    await newUser.save();

    if (!newUser) {
      throw new ApiError(501, "error while saving the user in database");
    }

    const { newRefreshToken, newAccessToken } = await generateTokens(
      newUser._id
    );

    if (!newRefreshToken || !newAccessToken) {
      throw new ApiError(501, "new Token not found");
    }

    const decodedToken = jwt.verify(
      newAccessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(501, "Somthing went wrong with decoded token");
    }

    const updatedUser = await User.findByIdAndUpdate(decodedToken._id, {
      $set: {
        refreshToken: newRefreshToken,
        online: false,
      },
    }).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(501, "Error while setting refreshToken to userDB");
    }

    const finalUser = await User.aggregate([
      {
        $match: {
          _id: updatedUser._id,
        },
      },
      {
        $project: {
          avatar: 1,
          userName: 1,
          searchTag: 1,
          email: 1,
          theme: 1,
          showOnline: 1,
          socketId: 1,
        },
      },
    ]);

    console.log(`Final user is: ${JSON.stringify(finalUser, null, 2)}`);

    resp
      .status(200)
      .cookie("accessToken", newAccessToken, Options)
      .cookie("refreshToken", newRefreshToken, Options)
      .json(
        new ApiResponse(
          201,
          {
            User: finalUser,
          },
          "Registration Successful"
        )
      );
  } catch (error) {
    console.log("Error in signup ", error);
  }
});

const logIn = asyncHandler(async (req, resp) => {
  const { searchTag, password } = req.body;

  if (!searchTag || !password) {
    throw new ApiError(400, "All data must required");
  }

  const user = await User.findOne({
    $or: [
      {
        searchTag: searchTag,
      },
      {
        email: searchTag,
      },
    ],
  });

  if (!user) {
    throw new ApiError(400, "User Not Found");
  }

  const isPasswordCorrect = await user.isPasswordCorect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(501, "Password incorrect ", {
      errorMessege: "Incorrect Password",
    });
  }

  const { newAccessToken, newRefreshToken } = await generateTokens(user._id);

  if (!newRefreshToken || !newAccessToken) {
    throw new ApiError(501, "new Token not found");
  }

  const decodedToken = jwt.verify(
    newAccessToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  if (!decodedToken) {
    throw new ApiError(501, "Error in decoded Token");
  }

  const updatedUser = await User.findByIdAndUpdate(decodedToken._id, {
    refreshToken: newRefreshToken,
    online: true,
  }).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(400, "Error while updating user");
  }

  const finalUser = await User.aggregate([
    {
      $match: {
        _id: updatedUser._id,
      },
    },
    {
      $project: {
        avatar: 1,
        userName: 1,
        searchTag: 1,
        email: 1,
        theme: 1,
        showOnline: 1,
        socketId: 1,
      },
    },
  ]);

  const contacts = await Contact.aggregate([
    {
      $match: {
        oneOnOne: {
          $in: [finalUser[0]._id],
        },
      },
    },
    {
      $lookup: {
        from: "messages",
        foreignField: "contactId",
        localField: "_id",
        as: "messages",
      },
    },
  ]);

  resp
    .status(201)
    .cookie("accessToken", newAccessToken, Options)
    .cookie("refreshToken", newRefreshToken, Options)
    .json(new ApiResponse(201, { User: finalUser[0] }, "User logged in"));
});

const checkAlreadyLoddedIn = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "User not already logged in", {
      errorMessege: "User not already logged in",
    });
  }

  const isUserExists = await User.exists({
    _id: user._id,
  });

  if (!isUserExists) {
    throw new ApiError(400, "User not found", {
      errorMessege: "User not found",
    });
  }

  const { newAccessToken, newRefreshToken } = await generateTokens(user._id);

  if (!newRefreshToken || !newAccessToken) {
    throw new ApiError(501, "new Token not found");
  }

  const decodedToken = jwt.verify(
    newAccessToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  if (!decodedToken) {
    throw new ApiError(501, "Error in decoded Token");
  }

  const updatedUser = await User.findByIdAndUpdate(decodedToken._id, {
    refreshToken: newRefreshToken,
    online: true,
  });

  const finalUser = await User.aggregate([
    {
      $match: {
        _id: updatedUser._id,
      },
    },
    // {
    //   $lookup: {
    //     from: "contacts",
    //     foreignField: "_id",
    //     localField: "contacts",
    //     as: "allContacts",
    //   },
    // },
    // {
    //   $unwind: "$allContacts",
    // },
    // {
    //   $lookup: {
    //     from: "users",
    //     let: {
    //       participentId: "$allContacts.oneOnOne",
    //     },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $in: ["$_id", "$$participentId"],
    //           },
    //         },
    //       },
    //       {
    //         $project: {
    //           _id: 1,
    //           userName: 1,
    //           searchTag: 1,
    //           avatar: 1,
    //           online: 1,
    //         },
    //       },
    //     ],
    //     as: "allContacts.participents",
    //   },
    // },
    {
      $project: {
        avatar: 1,
        userName: 1,
        searchTag: 1,
        email: 1,
        theme: 1,
        showOnline: 1,
        socketId: 1,
        // "contacts.participants.searchTag": 1,
        // "contacts.isGroup": 1,
        // "contacts.groupName": 1,
        // "contacts.whoCanSendMessage": 1,
        // "contacts.lastMessage": 1,
      },
    },
  ]);

  if (!updatedUser) {
    throw new ApiError(400, "Error while updating user");
  }

  resp
    .status(201)
    .cookie("accessToken", newAccessToken, Options)
    .cookie("refreshToken", newRefreshToken, Options)
    .json(
      new ApiResponse(201, { User: finalUser[0] }, "User alrady logged in")
    );
});

/**
 * @description authentication required before these funcions
 */
const logOut = asyncHandler(async (req, resp) => {
  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $set: {
        refreshToken: "",
        online: false,
      },
    },
    {
      new: true,
    }
  );

  resp
    .status(200)
    .clearCookie("refreshToken", Options)
    .clearCookie("accessToken", Options)
    .json(new ApiResponse(200, {}, "Logged Out"));
});

/**
 * @description fetch full details is fuction serving the whole contacts and messages
 * @param (<Schema.ObjectId>)
 * @returns <Array<Agrigation_Pipeline>
 */

const getAllAccountDetails = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "User not logged in ", {
      errorMessege: "User not logged in ",
    });
  }

  const WholeChats = await ContactMember.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "contacts",
        localField: "contactId",
        foreignField: "_id",
        as: "contact_det",
      },
    },
    {
      $unwind: "$contact_det",
    },
    {
      $lookup: {
        from: "messages",
        localField: "contact_det._id",
        foreignField: "contactId",
        as: "chats",
      },
    },
    {
      $lookup: {
        from: "contactmembers",
        localField: "contact_det._id",
        foreignField: "contactId",
        as: "contact_det.chat_members",
      },
    },
    {
      $group: {
        _id: "$_id",
        contact_det: {
          $first: "$contact_det",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "contact_det.chat_members.userId",
        foreignField: "_id",
        as: "contact_det.chat_members",
      },
    },
    {
      $project: {
        chats: 1,
        "contact_det.oneOnOne": 1,
        "contact_det.isGroup": 1,
        "contact_det.groupName": 1,
        "contact_det.whoCanSendMessage": 1,
        "contact_det.chat_members.userName": 1,
        "contact_det.chat_members.searchTag": 1,
        "contact_det.chat_members.email": 1,
        "contact_det.chat_members.avatar": 1,
        "contact_det.chat_members.online": 1,
      },
    },
  ]);

  const one_on_one_chats = await ContactMember.aggregate(
    // [
    //   {
    //     $match: {
    //       userId: new mongoose.Types.ObjectId(user._id),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "userId",
    //       foreignField: "_id",
    //       as: "user",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "contacts",
    //       localField: "contactId",
    //       foreignField: "_id",
    //       as: "contact",
    //     },
    //   },
    //   {
    //     $match: {
    //       "contact.isGroup": false,
    //     },
    //   },
    //   {
    //     $addFields: {
    //       user: {
    //         $first: "$user",
    //       },
    //       contact: {
    //         $first: "$contact",
    //       },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       contact_name: {
    //         $cond: {
    //           if: {
    //             $eq: ["$user.userName", "$contact.groupName"],
    //           },
    //           then: "$contact.groupName",
    //           else: "$contact.groupName",
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $addFields: {
    //       contact_det: "$contact",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "contact.oneOnOne",
    //       foreignField: "_id",
    //       as: "chat_members",
    //     },
    //   },
    //   {
    //     $unwind: "$chat_members",
    //   },
    //   {
    //     $addFields: {
    //       same_: {
    //         $cond: {
    //           if: {
    //             $eq: ["$chat_members._id", "$userId"],
    //           },
    //           then: true,
    //           else: false,
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $match: {
    //       same_: { $ne: true }, // Removes documents where same_ is true
    //       "contact.isSecured": { $ne: true },
    //     },
    //   },
    //   {
    //     $project: {
    //       contact_name: 1,
    //       "contact_det.isGroup": 1,
    //       "contact_det._id": 1,
    //       "contact_det.groupName": 1,
    //       "contact_det.lastMessage": 1,
    //       "contact_det._id": 1,
    //       "chat_members.searchTag": 1,
    //       "chat_members._id": 1,
    //     },
    //   },
    // ]
    [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(user._id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "contacts",
          localField: "contactId",
          foreignField: "_id",
          as: "contact",
        },
      },
      {
        $match: {
          "contact.isGroup": false,
        },
      },
      {
        $addFields: {
          user: {
            $first: "$user",
          },
          contact: {
            $first: "$contact",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "contact.oneOnOne",
          foreignField: "_id",
          as: "oneOnOne",
        },
      },
      {
        $addFields: {
          contact_name: {
            $cond: {
              if: {
                $eq: ["$user.userName", "$contact.groupName"],
              },
              then: {
                $let: {
                  vars: {
                    otherUser: {
                      $first: {
                        $filter: {
                          input: "$oneOnOne",
                          as: "u",
                          cond: {
                            $ne: ["$$u._id", "$userId"],
                          },
                        },
                      },
                    },
                  },
                  in: "$$otherUser.userName",
                },
              },
              else: "$contact.groupName",
            },
          },
          contact_user_id: {
            $let: {
              vars: {
                otherUser: {
                  $first: {
                    $filter: {
                      input: "$oneOnOne",
                      as: "u",
                      cond: {
                        $ne: ["$$u._id", "$userId"],
                      },
                    },
                  },
                },
              },
              in: "$$otherUser._id",
            },
          },
        },
      },
      {
        $addFields: {
          contact_det: "$contact",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "contact.oneOnOne",
          foreignField: "_id",
          as: "chat_members",
        },
      },
      {
        $unwind: "$chat_members",
      },
      {
        $addFields: {
          same_: {
            $cond: {
              if: {
                $eq: ["$chat_members._id", "$userId"],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $match: {
          same_: { $ne: true }, // Removes documents where same_ is true
          "contact.isSecured": { $ne: true },
        },
      },
      {
        $project: {
          contact_name: 1,
          "contact_det.isGroup": 1,
          "contact_det._id": 1,
          "contact_det.groupName": 1,
          "contact_det.lastMessage": 1,
          "contact_det._id": 1,
          "chat_members.searchTag": 1,
          "chat_members._id": 1,
          contact_user_id: 1,
        },
      },
    ]
  );

  const secured_chats = await ContactMember.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "contacts",
        localField: "contactId",
        foreignField: "_id",
        as: "contact",
      },
    },
    {
      $addFields: {
        user: {
          $first: "$user",
        },
        contact: {
          $first: "$contact",
        },
      },
    },
    {
      $addFields: {
        contact_name: {
          $cond: {
            if: { $eq: ["$user.userName", "$contact.groupName"] },
            then: "$contact.groupName",
            else: "$contact.groupName",
          },
        },
      },
    },
    {
      $addFields: {
        contact_det: "$contact",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "contact.oneOnOne",
        foreignField: "_id",
        as: "chat_members",
      },
    },
    {
      $unwind: "$chat_members",
    },
    {
      $addFields: {
        same_: {
          $cond: {
            if: {
              $eq: ["$chat_members._id", "$userId"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $match: {
        same_: { $ne: true }, // Removes documents where same_ is false
        "contact.isSecured": { $ne: true },
      },
    },
    {
      $addFields: {
        "contact_det.searchTag": "$chat_members.searchTag",
        "contact_det.groupName": "$chat_members.userName",
      },
    },
    {
      $project: {
        "contact_det.oneOnOne": 1,
        "contact_det.isGroup": 1,
        "contact_det.groupName": 1,
        "contact_det.searchTag": 1,
        "contact_det.searchTag": 1,
      },
    },
  ]);

  const group_chats = await ContactMember.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "contacts",
        localField: "contactId",
        foreignField: "_id",
        as: "contact_det",
      },
    },
    {
      $unwind: "$contact_det",
    },
    {
      $match: {
        "contact_det.isGroup": true,
      },
    },
    {
      $lookup: {
        from: "contactmembers",
        localField: "group._id",
        foreignField: "contactId",
        as: "contact_det.members",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "group.members.userId",
        foreignField: "_id",
        as: "contact_det.members",
      },
    },
    {
      $project: {
        isAdmin: 1,
        "contact_det._id": 1,
        "contact_det.groupName": 1,
        "contact_det.whoCanSendMessage": 1,
        "contact_det.members._id": 1,
        "contact_det.members.userName": 1,
        "contact_det.members.searchTag": 1,
        "contact_det.members.avatar": 1,
      },
    },
  ]);

  if (!WholeChats) {
    throw new ApiError(400, "Error while fetching chats history", {
      errorMessege: "Error while fetching chats history",
    });
  }

  resp.status(200).json(
    new ApiResponse(
      200,
      {
        contact_history: {
          whole_chats: WholeChats,
          one_on_one_chats: one_on_one_chats,
          secured_contacts: secured_chats,
          group_chats: group_chats,
        },
      },
      "Here all the message history"
    )
  );
});

/**
 * @description addSecurity auestion helps user when forget the password
 */

const addSecurityQnA = asyncHandler(async (req, resp) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(501, "Unautharized request", {
        errorMessege: "Unautharized request",
      });
    }

    const { question, answer } = req.body;

    if (!question || !answer) {
      throw new ApiError(400, "Must Provide Questions and Answers", {
        errorMessege: "Must Provide Questions and Answers",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, {
      securityQuestion: question,
      securityAnswer: answer,
    });

    if (!updatedUser) {
      throw new ApiError(400, "Error while updating question to the db", {
        errorMessege: "Error while updating question to the db",
      });
    }

    resp
      .status(200)
      .json(new ApiResponse(200, {}, "Questions added successfully"));
  } catch (error) {
    throw new ApiError(400, "Error while adding security ", {
      errorMessege: "Error while adding security ",
    });
  }
});

const forgetPasswordVerify = asyncHandler(async (req, resp, next) => {
  const { searchTag, securityAnswer } = req.body;

  if (!searchTag || !securityAnswer) {
    throw new ApiError(400, "search Tag Must Required");
  }

  const isValidUser = await User.findOne({
    $or: [
      {
        searchTag: searchTag,
      },
      {
        email: searchTag,
      },
    ],
  });

  if (!isValidUser) {
    throw new ApiError(401, "Invalid user", { errorMessege: "Invalid User" });
  }

  if (isValidUser.securityAnswer !== securityAnswer) {
    throw new ApiError(401, "Invalid Answer", {
      errorMessege: "Invalid Answer",
    });
  }

  resp
    .status(200)
    .cookie("allowResat", true, Options)
    .json(new ApiResponse(200, {}, "Valid User"));
});

const resetPassword = asyncHandler(async (req, resp) => {
  const allowResat = req.cookies?.allowResat;

  if (!allowResat) {
    throw new ApiError(401, "Not Allowed To Resat", {
      errorMessege: "Not Allowed To Resat",
    });
  }

  const { newPassword, conformPassword, searchTag } = req.body;

  if (!newPassword || !conformPassword) {
    throw new ApiError(400, "Must Provide new Password");
  }

  if (newPassword !== conformPassword) {
    throw new ApiError(400, "Both Password not matching");
  }

  const isValid = await User.findOneAndUpdate(
    {
      $or: [
        {
          searchTag: searchTag,
        },
        {
          email: searchTag,
        },
      ],
    },
    {
      password: newPassword,
    }
  );

  if (!isValid) {
    throw new ApiError(400, "Error while updating passwords");
  }

  console.log("resat done");

  resp
    .status(200)
    .clearCookie("allowResat", Options)
    .json(new ApiResponse(200, {}, "Password Updated Successfully"));
});

/**
 * @description Updating socket id after every connection
 */
const updateSocketId = asyncHandler((req, resp) => {
  const accessToken = req.cookie?.accessToken;

  if (!accessToken) {
    throw new ApiError(401, "Unauthraized request");
  }

  const { socektId } = req.body;

  if (!socektId) {
    throw new ApiError(400, "SocketId not found");
  }

  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  if (!decodedToken) {
    throw new ApiError(400, "Unable to decode the token");
  }

  const user = User.findByIdAndUpdate(
    decodedToken._id,
    {
      socketId: socektId,
    },
    {
      new: true,
    }
  ).select("-refreshToken -password");

  if (!user) {
    throw new ApiError(400, "unable to update the user socket id");
  }

  resp
    .status(200)
    .json(new ApiResponse(200, { User: user }, "socket updated "));
});

/**
 * @description Danger or Delete Operations in Delete account
 */
const deleteAccount = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(501, "Unautharized request ", {
      errorMessege: "Tokens not found",
    });
  }

  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password Must Required");
  }

  const isUserExists = await User.findById(user._id);

  if (!isUserExists) {
    throw new ApiError(400, "User Not Found");
  }

  const isPasswordCorrect = isUserExists.isPasswordCorect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(501, "Password is incorrects request", {
      errorMessege: "Password is incorrects",
    });
  }

  const deletedAccount = new DeletedAccount({
    userName: isUserExists.userName,
    searchTag: isUserExists.searchTag,
    email: isUserExists.email,
    avatar: isUserExists.avatar,
  });

  await deletedAccount.save();

  if (!deletedAccount) {
    throw new ApiError(400, "Error while deleting the account");
  }

  const del = await User.findByIdAndDelete(isUserExists._id);
  if (!del) {
    throw new ApiError(400, "Error while deleting the account");
  }

  resp
    .status(200)
    .clearCookie("accessToken", Options)
    .clearCookie("refreshToken", Options)
    .json(new ApiResponse(200, {}, "User Deleted Successfully"));
});

module.exports = {
  liveCheckTagSignup,
  liveCheckMailSignup,
  liveCheckTagMailLogin,
  checkAlreadyLoddedIn,
  signUp,
  logIn,
  logOut,
  addSecurityQnA,
  deleteAccount,
  forgetPasswordVerify,
  resetPassword,
  updateSocketId,
  getAllAccountDetails,
};
