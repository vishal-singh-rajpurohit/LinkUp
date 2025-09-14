const mongoose = require("mongoose");

const newSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    expectedCount: {
        type: Number,
        required: true
    },
    isAnswered: {
        type: Boolean,
        required: true
    },
    isEnded: {
        type: Boolean,
        require: true,
        default: false
    }
  },
  {
    timestamps: true,
    timeseries: true,
  }
);


const Call = mongoose.model("Calls", newSchema)

module.exports = Call