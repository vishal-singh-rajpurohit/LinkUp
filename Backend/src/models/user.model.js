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
      default: "0000",
      required: true,
    },
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
      default: "0",
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
    },
    public_id_avatar: {
      type: String,
      default: "0",
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

newSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  } else {
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
  const result = await bcrypt.compare(password, this.password);
  console.log("passowrd is " + password + "result is : " + result);

  return result;
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
