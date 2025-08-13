const ApiError = require("../utils/ApiError.utils");
const jwt = require("jsonwebtoken");
const { Socket } = require("socket.io");
const { ChatEventEnum, chatEventEnumNew } = require("../constants/constants");
const User = require("../models/user.model");
const Contact = require("../models/contacts.model");
/**
 * @description event happens when user switches between chats or contacts based on contactId
 * @param {Socket<import("socket.io")}
 */
const ChatJoinEvent = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log("User Joined the chat");
    socket.join(chatId);
  });
};

/**
 *
 * @param {*} io
 * @returns io connection
 */

const starterSocketIo = async (io) => {
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

      user.socketId = socket.id;
      await user.save();

      socket.user = user;
      socket.userId = user._id.toString();

      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      console.log("User connected 🗼. userId: ", user._id.toString());

      // Sending user is live to all users to is live
      const contactsOnline = await getUserOnlineFriends(user._id);
      for (let con of contactsOnline) {
        io.to(`${con.userId}`).emit(`${chatEventEnumNew.ONLINE_EVENT}`, {
          contactId: con._id,
          message: "your friend is online",
        });
      }

      // Events
      socket.on("joinRoom", async (payload) => {
        const roomId = payload.roomId.toString();
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);

        socket.to(roomId).emit("message", {
          user: socket.id,
          text: `${socket.id} has joined the room`,
        });
        socket.emit("joinedRoom", roomId); // Confirm joining the room

        const room = io.sockets.adapter.rooms.get(roomId);

        if (room) {
          console.log(`Users in room ${roomId}:`, room.size);
        }
      });

      socket.on(ChatEventEnum.DISCONNECT_EVENT, async () => {
        console.log("user has disconnected userId: " + socket.user?._id);
        if (socket.user?._id) {
          const contactsOnline = await getUserOnlineFriends(user._id);

          for (let con of contactsOnline) {
            io.to(`${con.userId}`).emit(`${chatEventEnumNew.OFFLINE_EVENT}`, {
              contactId: con._id,
              message: "your friend is Gone Offline",
            });
          }
          socket.leave(socket.user._id);
          await setUserOffline(user._id);
        }
      });
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
};

const emiterSocket = (req, roomId, event, Payload) => {
  console.log("emmited");
  req.app.get("io").to(roomId).emit(event, Payload);
};

const emiterCall = (req, userId, event, Payload) => {
  req.app.get("io").to(userId).emit(event, Payload);
};

const setUserOffline = async (userId) => {
  console.log("setting use offline");

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log("user does not found");
      throw new ApiError(400, "User not found");
    }
    user.online = false;
    await user.save();
    console.log("now user is offline");
  } catch (error) {
    throw new ApiError(501, "Error in setting Offline");
  }
};

const getUserOnlineFriends = async (userId) => {
  try {
    const contactsOnline = await Contact.aggregate([
      {
        $match: {
          oneOnOne: {
            $all: [userId],
          },
          isGroup: false
        },
      },
      {
        $lookup: {
          from: "contactmembers",
          localField: "_id",
          foreignField: "contactId",
          as: "members",
        },
      },
      {
        $addFields: {
          member: {
            $filter: {
              input: "$members",
              as: "member",
              cond: {
                $ne: ["$$member.userId", userId],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "member.userId",
          foreignField: "_id",
          as: "member.user",
        },
      },
      {
        $unwind: "$member.user",
      },

      {
        $group: {
          _id: "$_id",
          member: {
            $first: "$member.user",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          userId: {
            $first: "$member._id",
          },
          isOnline: {
            $first: "$member.online",
          },
          socketId: {
            $first: "$member.socketId",
          },
        },
      },
      {
        $match: {
          isOnline: true,
        },
      },
    ]);

    console.log(`contactsOnline `, contactsOnline);
    
    return contactsOnline;
  } catch (error) {
    throw new ApiError(5001, "error in searching contacts");
  }
};

module.exports = { starterSocketIo, emiterSocket, emiterCall };
