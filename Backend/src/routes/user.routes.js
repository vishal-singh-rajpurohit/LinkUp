const express = require("express");
const {
  liveCheckMailSignup,
  liveCheckTagSignup,
  signUp,
  logOut,
  logIn,
  liveCheckTagMailLogin,
  deleteAccount,
  addSecurityQnA,
  forgetPasswordVerify,
  resetPassword,
  getAllAccountDetails,
  checkAlreadyLoddedIn,
} = require("../controllers/user.controller");

const auth = require("../middlewares/auth.middleware");
const userRouter = express.Router();

userRouter.route("/live-check-mail").post(liveCheckMailSignup);
userRouter.route("/live-check-searchtag").post(liveCheckTagSignup);
userRouter.route("/register").post(signUp);
userRouter.route("/live-check-searchtag-login").post(liveCheckTagMailLogin);
userRouter.route("/check-user-already-loggedin").post(auth, checkAlreadyLoddedIn);
userRouter.route("/login").post(logIn);
userRouter.route("/logout").post(auth, logOut);
userRouter.route("/get-chat-history").post(auth, getAllAccountDetails);

/**
 * @description Secuity answer helps user while trying to forget password and also encryption
 */

userRouter.route("/add-security-answer").post(auth, addSecurityQnA);

/**
 * @description Authentication routes forget password and resat password
 */
userRouter.route("/forget-password").post(forgetPasswordVerify);
userRouter.route("/resat-password").post(resetPassword);

/**
 * @description Danger Routes , Delete
 */

userRouter.route("/delete-account").post(auth, deleteAccount);

module.exports = userRouter;
