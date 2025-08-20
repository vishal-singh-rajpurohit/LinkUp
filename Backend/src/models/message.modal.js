const { Schema, default: mongoose } = require("mongoose");

const geoSchcma = new Schema({
  longitude: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
});

const newSchema = new Schema(
  {
    message: {
      type: String,
    },
    contactId: {
      type: mongoose.Types.ObjectId,
      ref: "Contacts",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    hasAttechment: {
      type: Boolean,
      required: true,
      default: false,
    },
    pending: {
      type: Boolean,
      required: true,
      default: false,
    },
    attechmentLink: {
      type: String,
      required: false,
    },
    attechmentType: {
      type: String,
      require: false,
    },
    attechmentId: {
      type: mongoose.Types.ObjectId,
      ref: "Attechments",
    },
    isCall: {
      type: Boolean,
      required: true,
      default: false,
    },
    callType: {
      type: String,
      required: false,
      default: "VIDEO",
    },
    callId: {
      type: mongoose.Types.ObjectId,
      ref: "Calls",
      required: false,
    },
    geoLoc: {
      type: geoSchcma,
      required: true,
    },
    refferTo: {
      msgId: {
        type: mongoose.Types.ObjectId,
        ref: "messages",
      },
      targetUsetTag: {
        type: String,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Message = mongoose.model("Message", newSchema);

module.exports = Message;
