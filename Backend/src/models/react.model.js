const { Schema, default: mongoose } = require("mongoose");

const newSchema = new Schema(
  {
    reactCode: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageId: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
      required: true,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Reaction = mongoose.model("React", newSchema);

module.exports = Reaction;
