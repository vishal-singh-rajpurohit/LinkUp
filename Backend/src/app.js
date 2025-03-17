const express = require('express');
const websocket = require('ws');
const http = require('http');
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();    

app.use(express.json({ limit: "16kb" }));
app.use(cors({ origin: "*", credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

const server = http.createServer(app);

// WEB SOCKETS
const wss = new websocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('A new client connected!');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        ws.send(`You said: ${message}`);
    });

    ws.on('close', () => {
        console.log('A client disconnected.');
    });

    ws.on('error', (err) => {
        console.error("WebSocket error:", err);
    });
});

// ROUTERS
const userRouter = require('./routes/user.routes');
const chatRouter = require('./routes/chat.routes');


app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);


module.exports = {server, wss}