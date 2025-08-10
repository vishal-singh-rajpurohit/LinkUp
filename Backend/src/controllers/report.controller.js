const asyncHandler = require("../utils/asyncHandler.utils");
const ApiError = require("../utils/ApiError.utils");
const ApiResponse = require("../utils/ApiResponse.utils");
const FeedbackMode = require("../models/feedback.model");

const report = asyncHandler(async (req, resp) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "User not already logged in", {
      errorMessege: "User not already logged in",
    });
  }

  const { reportType, Users, message } = req.body;

  if (!reportType) {
    throw new ApiError(400, "Report Type not found");
  }

  if ((reportType === "spam" || reportType === "harm") && Users.length) {
    for (let user of Users) {
      const newContact = new FeedbackMode({
        userId: user._id,
        contactId: user._id,
        message: message,
        type: reportType,
      });
      await newContact.save();
    }
  } else {
    const newContact = new FeedbackMode({
      userId: user._id,
      type: reportType,
      message: message,
    });
    await newContact.save();
  }

  resp.status(201).json(new ApiResponse(201, {}, "Repored"));
});

module.exports = {
  report,
};
