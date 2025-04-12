const { Schema, default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    socketId: {
      type: String,
      required: true,
      default: "0000",
    },
    contacts:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact"
    }],
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "defaultA",
    },
    online: {
      type: Boolean,
      default: false,
      required: true,
    },
    theme: {
      type: Boolean,
      default: true,
    },
    showOnline: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      default: "",
    },
    securityQuestion: {
      type: String,
      default: null,
    },
    securityAnswer: {
      type: String,
      default: null,
    }
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

newSchema.pre("save", async function (next) {
  console.log("before save called");
  if (!this.isModified("password")) {
    console.log("unmodified password");
    next();
  } else {
    console.log("password modified");
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
});

newSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (!update.password) {
    return next();
  }
  update.password = await bcrypt.hash(update.password, 10);
  next();
});

newSchema.methods.isPasswordCorect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

newSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      searchTag: this.searchTag,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

newSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      searchTag: this.searchTag,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", newSchema);

module.exports = User;
