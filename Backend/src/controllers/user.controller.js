// Live Check for email and searchTag
// Login and Signup , Logout
// Update SocketId after every login
// Forget Password
// Delete Account
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler.utils");
const ApiError = require("../utils/ApiError.utils");
const ApiResponse = require("../utils/ApiResponse.utils");
const generateTokens = require("../utils/generateTokens.utils");
const { Options } = require("../constants");

const User = require("../models/user.model");
const DeletedAccount = require("../models/deletedAccount.model");

const liveCheckTagSignup = asyncHandler(async (req, resp) => {
  const { searchTag } = req.body;
  if (!searchTag) {
    throw new ApiError(400, "Must proive search tag");
  }

  const isUserExists = await User.exists({ searchTag });

  if (isUserExists) {
    throw new ApiError(401, "this search tag is not avilable");
  }

  resp.status(200).josn(new ApiResponse(200, "tag is avilable", {}));
});

const liveCheckMailSignup = asyncHandler(async (req, resp) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Must proive email");
  }

  const isUserExists = await User.exists({ email });

  if (isUserExists) {
    throw new ApiError(401, "this email is not avilable");
  }

  resp.status(200).josn(new ApiResponse(200, "email is avilable", {}));
});

const liveCheckTagMailLogin = asyncHandler(async (req, resp) => {
  const { searchTag } = req.body;
  if (!searchTag) {
    throw new ApiError(400, "Must proive search tag");
  }

  const isUserExists = await User.exists({
    $or: {
      searchTag: searchTag,
      email: searchTag,
    },
  });

  if (!isUserExists) {
    throw new ApiError(401, "user with this email and search tag not found");
  }

  resp.status(200).json(new ApiResponse(200, "valid user", {}));
});

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
    });

    await newUser.save();

    if (!newUser) {
      throw new ApiError(501, "error while saving the user in database");
    }

    const { newRefreshToken, newAccessToken } = await generateTokens();

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

    const finalUser = await User.findByIdAndUpdate(decodedToken._id, {
      $set: {
        refreshToken: newRefreshToken,
      },
    }).select("-password -refreshToken");

    if (!finalUser) {
      throw new ApiError(501, "Error while setting refreshToken to userDB");
    }

    // Direct serve normal contacts 
    const normalContacts = await User.aggregate([
      {
        $match: {
          isGroup: false,
          blocked: false,
          isEncrypted: false
        }
      },
      // {
      //   $lookup: {
      //     from: "User",
      //     as: "contactsIn"
      //   }
      // },
      {
        $project: {
          contacts: 1
        }
      }
    ])

    // serve groups
    // serve encrypted chats

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
  const { searchTag } = req.body;

  if (!searchTag) {
    throw new ApiError(400, "All data must required");
  }

  const user = await User.findOne({
    $or: {
      searchTag: searchTag,
      email: searchTag,
    },
  });

  if (!user) {
    throw new ApiError(400, "User Not Found");
  }

  const { newAccessToken, newRefreshToken } = await generateTokens();

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
  }).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(400, "Error while updating user");
  }

  resp
    .status(201)
    .cookie("accessToken", newAccessToken, Options)
    .cookie("refreshToken", newRefreshToken, Options)
    .josn(new ApiResponse(201, { User: updatedUser }, "User logged in"));
});

const logOut = asyncHandler(async (req, resp) => {
  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $set: {
        refreshToken: "",
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

const deleteAccount = asyncHandler(async (req, resp) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    throw new ApiError(400, "User Id and Password Must Required");
  }

  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new ApiError(400, "User Not Found");
  }

  const isPasswordCorrect = isUserExists.isPasswordCorect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(501, "Unauthraized request");
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

const forgetPasswordVerify = asyncHandler(async (req, resp, next) => {
  const { searchTag, securityAnswer } = req.body;

  if (!searchTag || !securityAnswer) {
    throw new ApiError(400, "search Tag Must Required");
  }

  const isValid = await User.findOne({
    $or: {
      searchTag: searchTag,
      email: searchTag,
    },
    securityAnswer: securityAnswer,
  });

  if (!isValid) {
    throw new ApiError(401, "Invalid Answer");
  }

  resp
    .status(200)
    .cookie("allowResat", true, Options)
    .json(new ApiResponse(200, {}, "Valid User"));
});

const resetPassword = asyncHandler(async (req, resp) => {
  const allowResat = req.cookie?.allowResat;

  if (!allowResat) {
    throw new ApiError("Not Allowed To Resat");
  }

  const { newPassword, conformPassword, searchTag } = req.body;

  if (!newPassword || !conformPassword) {
    throw new ApiError(400, "Must Provide new Password");
  }

  if (newPassword !== conformPassword) {
    throw new ApiError(400, "Both Password not matching");
  }

  const isValid = await User.findOneAndUpdate({
    $or: {
      searchTag: searchTag,
      email: searchTag,
    },
    password: newPassword,
  });

  if (!isValid) {
    throw new ApiError(400, "Error while updating passwords");
  }

  resp
    .status(200)
    .clearCookie("allowResat", Options)
    .json(new ApiResponse(200, {}, "Password Updated Successfully"));
});

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

module.exports = {
  liveCheckTagSignup,
  liveCheckMailSignup,
  liveCheckTagMailLogin,
  signUp,
  logIn,
  logOut,
  deleteAccount,
  forgetPasswordVerify,
  resetPassword,
  updateSocketId,
};
