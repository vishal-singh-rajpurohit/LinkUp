const { Schema, default: mongoose } = require("mongoose");

const newSchema = new Schema(
  {
    oneOnOne: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: null,
    },
    isGroup: {
      type: Boolean,
      default: false,
      required: true,
    },
    groupName: {
      type: String,
      required: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", newSchema);

module.exports = Contact;
