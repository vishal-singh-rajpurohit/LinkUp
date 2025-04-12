const { Schema, default: mongoose } = require("mongoose");

const newSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      index: true,
    },
    searchTag: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    avatar: {
      type: String,
      default: "defaultA",
    }
  },
  {
    timeseries: true,
    timestamps: true,
  }
);





const DeletedAccount = mongoose.model("DeletedAccount", newSchema);

module.exports = DeletedAccount;
