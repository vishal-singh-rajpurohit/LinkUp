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
    throw new ApiError(400, 'Error in creating Call in db: Not saved');
  }
};

const addMemberToCall = async (callId, userId) => {
  try {
    const call = await Call.findById(callId);

    const members = new Set(call.members);
    members.add(new mongoose.Types.ObjectId(userId));

    const updatedCall = await Call.findByIdAndUpdate(
      callId,
      {
        $addToSet: {
          members: new mongoose.Types.ObjectId(userId),
        },
        isAnswered: true,
      },
      {
        new: true,
      },
    );
    await updatedCall.save();
    if (!updatedCall) {
      throw new ApiError(400, 'Error in saving Call in db: Not saved');
    }

    const newCall = await Call.findById(callId);

    if (!newCall) {
      throw new ApiError(400, 'newCall in ');
    }

    return {
      successs: true,
      newCall,
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
