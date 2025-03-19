const express = require("express");
const { liveCheckMailSignup, liveCheckTagSignup, signUp, logOut, logIn, liveCheckTagMailLogin } = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware")
const userRouter = express.Router();


userRouter.route("/live-check-mail").post(liveCheckMailSignup);
userRouter.route("/live-check-searchtag").post(liveCheckTagSignup);
userRouter.route("/register").post(signUp);
userRouter.route("/live-check-searchtag-login").post(liveCheckTagMailLogin);
userRouter.route("/login").post(logIn);
userRouter.route("/logout").post(auth, logOut);

module.exports = userRouter;