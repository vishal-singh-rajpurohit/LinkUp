const { default: mongoose } = require("mongoose");
const { Schems } = require("mongoose");

const newSchema = new Schems(
  {
    messageId: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactId: {
      type: mongoose.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    seen: {
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

const Seen = mongoose.model("Seen", newSchema);

module.exports = Seen;
