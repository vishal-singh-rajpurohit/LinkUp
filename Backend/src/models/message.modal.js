const { Schema, default: mongoose, mongo } = require("mongoose");

const newSchema = new Schema(
  {
    message: {
      type: String,
      trim: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    containsFile: {
      type: Boolean,
      required: true,
      default: false,
    },
    fileType: {
      type: String,
      enum: ["IMG", "VIDEO", "DOC", "AUDIO"],
    },
    file: {
      type: String,
      default: null,
    },
    seen: {
      type: Boolean,
      default: false,
      required: true,
    },
    socketStatus: {
      type: Boolean,
      required: true,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    isCall: {
      type: Boolean,
      default: false
    },
    callType: {
      type : String,
      enum: ["VIDEO", "AUDIO", null],
      default: null
    },
    isCallAccpted: {
      type: Boolean,
      default: false,
    },
    callReciverUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // location: {},
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Message = mongoose.model("Message", newSchema);

module.exports = Message;
