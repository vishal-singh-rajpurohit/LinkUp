const ApiError = require("../utils/ApiError.utils");
const jwt = require("jsonwebtoken");
const { Server, Socket } = require("socket.io");
const { ChatEventEnum } = require("../constants/constants");
const User = require("../models/user.model");
/**
 * @description event happens when user switches between chats or contacts based on contactId
 * @param {Socket<import("socket.io")}
 */
const ChatJoinEvent = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log("User Joined the chat");
    socket.join(ChatId);
  });
};

/**
 *
 * @param {*} io
 * @returns io connection
 */

const starterSocketIo = (io) => {
  return io.on("connection", async (socket) => {
    try {
      console.log("Socket connected to server", socket.id);
      const accessToken = socket.handshake.auth?.token;
  
      if (!accessToken) {
        console.log("Access token not found in cookies");
        throw new ApiError(400, "Unauthorized Access");
      }
  
      const decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );
  
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );
  
      if (!user) {
        throw new ApiError(400, "Unauthorized User");
      }
  
      socket.user = user;
      socket.userId = user._id.toString();
  
      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      console.log("User connected 🗼. userId: ", user._id.toString());
  
      // Events
      socket.on("joinRoom", async (payload) => {
        const roomId = payload.roomId.toString();
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
  
        socket.to(roomId).emit("message", { user: socket.id, text: `${socket.id} has joined the room` });
        socket.emit('joinedRoom', roomId);  // Confirm joining the room
  
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room) {
          console.log(`Users in room ${roomId}:`, room.size);
        }
      });
  
      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log("user has disconnected userId: " + socket.user?._id);
        if (socket.user?._id) {
          socket.leave(socket.user._id);
        }
      });
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
  
  // return io.on("connection", async (socket) => {
  //   try {
  //     console.log("Socket connected to server", socket.id);
  //     const accessToken = socket.handshake.auth?.token;


  //     if (!accessToken) {
  //       console.log("Access token not found in cookies");
  //       throw new ApiError(400, "Unautharized Access");
  //     }

  //     const decodedToken = jwt.verify(
  //       accessToken,
  //       process.env.ACCESS_TOKEN_SECRET
  //     );

  //     const user = await User.findById(decodedToken?._id).select(
  //       "-password -refreshToken"
  //     );

  //     if (!user) {
  //       throw new ApiError(400, "Unautharized User");
  //     }

  //     socket.user = user;
  //     socket.id = user._id.toString();

  //     socket.join(user._id.toString());
  //     socket.emit(ChatEventEnum.CONNECTED_EVENT);
  //     console.log("User connected 🗼. userId: ", user._id.toString());

  //     //   Initial Joins
  //     ChatJoinEvent(socket);


  //     // Events
  //     socket.on("joinRoom", async (payload) => {
  //       const roomId = payload.roomId.toString();
  //       socket.join(roomId);
  //       console.log("User joined room: " + payload.roomId);

  //       // socket.emit("joinedRoom", payload.roomId);

  //       // socket.to("marvel").emit('joined2', 'Hello, Room!');
  //       socket.to(roomId).emit('message', `${socket.id} has joined the room`);

  //       const room = io.sockets.adapter.rooms.get(roomId);
  //       if (room) {
  //         console.log(`Users in room ${roomId}:`, room);
  //       }
  //     });

  //     socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
  //       console.log("user has disconnecte userId: " + socket.user?._id);
  //       if (socket.user?._id) {
  //         socket.leave(socket.user._id);
  //       }
  //     });
  //   } catch (error) {
  //     socket.emit(
  //       ChatEventEnum.SOCKET_ERROR_EVENT,
  //       error?.message || "Something went wrong while connecting to the socket."
  //     );
  //   }
  // });
};

const emiterSocket = (req, roomId, event, Payload) => {
  console.log("emiited: ", roomId, Payload);
  req.app.get("io").in(roomId).emit(event, Payload);
};

// const sendMessage = (req, userId, event, Payload) => {
//   req.app.get("io").to(userId).emit(event, Payload);
// }

module.exports = { starterSocketIo, emiterSocket };
