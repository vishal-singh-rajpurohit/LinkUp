const express = require("express");
const {
  liveCheckMailSignup,
  liveCheckTagSignup,
  signUp,
  logOut,
  logIn,
  liveCheckTagMailLogin,
  addSecurityQnA,
  forgetPasswordVerify,
  resetPassword,
  getAllAccountDetails,
  checkAlreadyLoddedIn,
  setTheme,
  updateSearchTag,
  updateMail,
  updateName,
  sendAns,
  changeAvatar,
} = require("../controllers/user.controller");

const auth = require("../middlewares/auth.middleware");
const { fileUploader } = require("../middlewares/handleFiles.middleware");
const { Location } = require("../middlewares/location.middleware");
const userRouter = express.Router();

userRouter.route("/live-check-mail").post(liveCheckMailSignup);
userRouter.route("/live-check-searchtag").post(liveCheckTagSignup);
userRouter.route("/register").post(Location, signUp);
userRouter.route("/live-check-searchtag-login").post(liveCheckTagMailLogin);
userRouter.route("/check-user-already-loggedin").post(auth, checkAlreadyLoddedIn);
userRouter.route("/login").post(logIn);
userRouter.route("/logout").post(auth, logOut);
userRouter.route("/get-chat-history").post(auth, getAllAccountDetails);

/**
 * @description Update routes
 */

userRouter.route("/update-searchtag").post(auth, updateSearchTag);
userRouter.route("/update-mail").post(auth, updateMail);
userRouter.route("/update-name").post(auth, updateName);
userRouter.route("/set-theme").get(auth, setTheme);
userRouter.route("/update-avatar").post(auth, fileUploader.single('avatar') ,changeAvatar);

/**
 * @description Secuity answer helps user while trying to forget password and also encryption
 */

userRouter.route("/save-quiz").post(auth, addSecurityQnA);
userRouter.route("/verify").post(auth, sendAns);

/**
 * @description Authentication routes forget password and resat password
 */

userRouter.route("/forget-password").post(forgetPasswordVerify);
userRouter.route("/resat-password").post(resetPassword);

/**
 * @description Danger Routes , Delete
 */

// userRouter.route("/delete-account").post(auth, deleteAccount);

module.exports = userRouter;
