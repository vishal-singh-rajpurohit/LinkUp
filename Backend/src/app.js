const express = require("express");
const {Server} = require("socket.io")
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {starterSocketIo} = require("./Socket/index") 

const app = express();

app.use(express.json({ limit: "16kb" }));
// app.use(cors());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// WEB SOCKETS

const server = http.Server(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
});

app.set("io", io);


// ROUTERS
const userRouter = require("./routes/user.routes");
const chatRouter = require("./routes/chat.routes");
const contactRouter = require("./routes/contacts.routes");

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/contact", contactRouter);


// Start socket.io connection
starterSocketIo(io);

module.exports = {server, io};
