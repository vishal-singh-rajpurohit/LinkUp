const { Schema, default: mongoose } = require("mongoose");

const newModel = new Schema(
  {
    messageId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Attachment = mongoose.model("Attachment", newModel);

module.exports = {
  Attachment,
};
