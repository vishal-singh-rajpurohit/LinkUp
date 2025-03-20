const User = require("../models/user.model");

require("dotenv").config();
const ApiError = require("../utils/ApiError.utils");
const asyncHandler = require("../utils/asyncHandler.utils");
const jwt = require("jsonwebtoken");

const auth = asyncHandler(async (req, resp, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(501, "User not logged in", {
        errorMessage: "User not logged in",
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      throw new ApiError(400, " Error in decoding token ", {
        errorMessage: "Error in decoding token",
      });
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(400, "User not found with this id", {
        errorMessage: "User not found with this id",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("error in auth :", error)
    throw new ApiError(401, "Error in auth middleware", {
      errorMessage: "Error in auth middleware",
    });
  }
});

module.exports = auth;
