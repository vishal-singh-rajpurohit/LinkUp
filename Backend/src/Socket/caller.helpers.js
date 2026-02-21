const { default: mongoose } = require('mongoose');
const Call = require('../models/calls.model');
const ApiError = require('../utils/ApiError.utils');

const makeCall = async (userId, roomId, count) => {
  try {
    const call = new Call({
      callerId: userId,
      roomId: roomId,
      expectedCount: count,
      isAnswered: false,
      members: [userId],
      isEnded: false,
    });

    await call.save();

    if (!call) {
      throw new ApiError(400, 'Error in creating Call in db: Not saved');
    }

    return call;
  } catch (error) {
    throw new ApiError(400, 'Error in creating Call in db: Not saved '+ error.message);
  }
};

const addMemberToCall = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);

    if (!call) {
      throw new ApiError(500, 'invalid call id: Call not found');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const updatedCall = await Call.findByIdAndUpdate(
      callId,
      {
        $addToSet: { members: userObjectId },
        isAnswered: true,
      },
      { new: true },
    );

    if (!updatedCall) {
      throw new ApiError(400, 'Error in saving Call in db: Not saved');
    }

    return {
      successs: true,
      newCall: updatedCall,
    };
  } catch (error) {
    throw new ApiError(400, 'Error in saving Call in db: Not saved');
  }
};

const endVideoCall = async (callId) => {
  try {
    const call = await Call.findById(callId);
    call.isEnded = true;
    await call.save();
    if (!call) {
      throw new ApiError(400, 'Error in Ending Call in db: Not saved');
    }

    return {
      successs: true,
    };
  } catch (error) {
    throw new ApiError(400, 'Error in Ending Call in db: Not saved');
  }
};

const changeVideoCallMember = async (callId) => {
  try {
    const call = await Call.findById(callId);
    call.expectedCount = call.expectedCount - 1;
    await call.save();
    if (!call) {
      throw new ApiError(400, 'Error in Ending Call in db: Not saved');
    }

    return {
      count: call.expectedCount,
    };
  } catch (error) {
    throw new ApiError(400, 'Error in Ending Call in db: Not saved');
  }
};

module.exports = {
  makeCall,
  addMemberToCall,
  endVideoCall,
  changeVideoCallMember,
};
