const ApiError = require("../utils/ApiError.utils");
const jwt = require("jsonwebtoken");
const { Socket } = require("socket.io");
const { ChatEventEnum, chatEventEnumNew } = require("../constants/constants");
const User = require("../models/user.model");
const Contact = require("../models/contacts.model");
const { default: mongoose } = require("mongoose");
const Message = require("../models/message.modal");
const Call = require("../models/calls.model");
const {
  makeCall,
  endVideoCall,
  addMemberToCall,
  changeVideoCallMember,
} = require("./caller.helpers");
const { createWorker, routerRtpCapabilities } = require("../mediasoup/worker");
const config = require("../mediasoup/config");
const mediasoup = require("mediasoup");

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

let mediasoupRouter;
const rooms = new Map();

const routerFunction = async () => {
  try {
    mediasoupRouter = await createWorker();

    console.log("Mediasoup worker and router created!");
  } catch (error) {
    throw new ApiError(400, "Error in creating mediasoup router", { error });
  }
};

const onCreateProducerTransport = async(event, ws) =>{
  
}


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

      socket.on(chatEventEnumNew.JOIN_ROOM, async (payload) => {
        const roomId = payload.roomId.toString();
        socket.join(roomId);
        // console.log(`User joined room: ${roomId}`);

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

      const contactsOnline = await getUserOnlineFriends(user._id);

      for (let con of contactsOnline) {
        io.to(`${con.userId}`).emit(`${chatEventEnumNew.ONLINE_EVENT}`, {
          contactId: con._id,
          message: "your friend is online",
        });
      }

      socket.on(chatEventEnumNew.TYPING_ON, async (payload) => {
        const contact = await Contact.findById(payload.contactId);

        if (!contact) {
          console.log("contacts not found");
        }

        if (!contact.isGroup) {
          const reciver = await Contact.aggregate([
            {
              $match: {
                _id: contact._id,
                isGroup: false,
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
                      $ne: ["$$member.userId", payload.userId],
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
                avatar: {
                  $first: "$member.avatar",
                },
              },
            },
            {
              $match: {
                isOnline: true,
              },
            },
          ]);

          if (reciver.length) {
            // Working on this
            io.to(`${reciver[0].socketId}`).emit(
              `${chatEventEnumNew.TYPING_ON}`,
              { avatar: payload.avatar }
            );
          }
        } else {
          // IF Group Chat
          const recivers = await Contact.aggregate([
            {
              $match: {
                _id: contact._id,
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
                      $ne: [
                        "$$member.userId",
                        new mongoose.Types.ObjectId(payload.userId),
                      ],
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
              $match: {
                "member.user.online": true,
              },
            },
            {
              $group: {
                _id: "$_id",
                member: {
                  $addToSet: "$member.user",
                },
              },
            },
            {
              $project: {
                "member._id": 1,
                "member.socketId": 1,
                "member.avatar": 1,
                "member.searchTag": 1,
              },
            },
          ]);

          if (recivers.length) {
            for (let reciver of recivers[0].member) {
              io.to(`${reciver.socketId}`).emit(
                `${chatEventEnumNew.TYPING_ON}`,
                { avatar: payload.avatar }
              );
            }
          }
        }
      });

      socket.on(chatEventEnumNew.MARK_READ, async (payload) => {
        const user = await User.findById(payload.id);
        if (!user) {
          throw new ApiError(501, "Unautharized Request");
        }
        const message = await Message.findByIdAndUpdate(
          payload.msgId,
          {
            $addToSet: { readBy: user._id },
          },
          { new: true }
        );
        if (!message) {
          throw new ApiError(400, "Message not found:");
        }

        const sender = await User.findById(message.userId);

        if (!sender) {
          throw new ApiError(400, "Sender not found");
        }

        socket.to(sender.socketId).emit(chatEventEnumNew.MARKED, {
          messageId: message._id,
          contactId: message.contactId,
          viewerId: user._id,
        });
      });

      socket.on(
        chatEventEnumNew.REQUEST_VIDEO_CALL,
        async (payload, callback) => {
          const contact = await Contact.findById(payload.contactId);

          if (!contact) {
            console.log("Contacts not found");
            socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
              message: "contacts not found",
            });
          }

          //Right Here
          const reciver = await getContactsForCall(contact._id);

          const recivers = await reciver[0].member.filter(
            (val) => val.online === true
          );

          const newCall = await makeCall(
            payload.userId,
            contact._id,
            recivers.length
          );

          if (recivers.length > 1) {
            for (const reciver of recivers) {
              if (reciver.online) {
                if (payload.userId === reciver._id) {
                  await routerFunction();
                  rooms.set(newCall._id, {
                    router: mediasoupRouter,
                    peers: new Map(),
                  });

                  socket.join(newCall._id);

                  const routerCapabilities = rooms.get(newCall._id).router
                    .rtpCapabilities;
                  callback({ routerRtpCapabilities: routerCapabilities });

                  socket
                    .to(newCall._id)
                    .emit("new-member-in-call", { peerId: socket.id });
                }
                io.to(`${reciver.socketId}`).emit(
                  `${chatEventEnumNew.INCOMING_VIDEO_CALL}`,
                  {
                    roomId: contact._id,
                    userId: payload.userId,
                    searchTag: contact.groupName || payload.userId,
                    avatar: contact.groupAvatar || payload.avatar,
                    callId: newCall._id,
                    mediasoupRouter: mediasoupRouter,
                  }
                );

                console.log(`call ${newCall._id} created.`);
              }
            }
          } else {
            socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
              message: "contacts not found",
            });
          }
        }
      );

      socket.on(
        chatEventEnumNew.CANCELLED_VIDEO_CALL,
        async ({ callId, roomId }) => {
          const contact = await Contact.findById(roomId);

          if (!contact) {
            socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
              message: "contacts not found",
            });
          }

          const ended = await endVideoCall(callId);

          if (!ended.successs) {
            console.log("Error in ending call");
          }

          const reciver = await getContactsForCall(contact._id);

          const recivers = reciver[0].member.filter(
            (val) => val.online === true
          );

          for (let reciver of recivers) {
            if (reciver.online) {
              io.to(`${reciver.socketId}`).emit(
                `${chatEventEnumNew.OFFLINE_CALLER}`,
                {
                  message: "Call Ended",
                }
              );
            }
          }
        }
      );

      socket.on(
        chatEventEnumNew.ANSWER_VIDEO_CALL,
        async ({ callId, roomId, userId, rtpCapabilities }) => {
          const contact = await Contact.findById(roomId);
          if (!contact) {
            socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
              message: "contacts not found",
            });
          }

          const addedContact = await addMemberToCall(callId, userId);
          const members = await getContactsInCall(callId);

          // Logic to Implement

          if (members[0].members.length) {
            for (const member of members[0].members) {
              io.to(member.socketId).emit(
                chatEventEnumNew.ACCEPTED_VIDEO_CALL,
                {
                  userId: userId,
                  callId: callId,
                  roomId: roomId,
                }
              );
            }
          } else {
            throw new ApiError(
              400,
              "Answer video call Error: Contacts not found"
            );
          }

          if (!addedContact) {
            throw new ApiError(400, "Contact not added");
          }
        }
      );

      socket.on(
        chatEventEnumNew.REJECT_VIDEO_CALL,
        async ({ callId, roomId, userId }) => {
          const contact = await Contact.findById(roomId);
          if (!contact) {
            socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
              message: "contacts not found",
            });
          }

          const currentCount = await changeVideoCallMember(callId);
          const members = await getContactsInCall(callId);

          // Logic to Implement

          if (members[0].members.length) {
            for (const member of members[0].members) {
              if (currentCount < 2) {
                io.to(member.socketId).emit(chatEventEnumNew.OFFLINE_CALLER, {
                  userId: userId,
                  callId: callId,
                  roomId: roomId,
                });
              } else {
                io.to(member.socketId).emit(
                  chatEventEnumNew.REJECTED_VIDEO_CALL,
                  {
                    userId: userId,
                    callId: callId,
                    roomId: roomId,
                  }
                );
              }
            }
          } else {
            throw new ApiError(
              400,
              "Reject Call video call Error: Contacts not found"
            );
          }
        }
      );

      socket.on(ChatEventEnum.DISCONNECT_EVENT, async () => {
        console.log("user has disconnected userId: " + socket.user?._id);
        if (socket.user?._id) {
          const contactsOnline = await getUserOnlineFriends(user._id);

          rooms.forEach((room, roomId) => {
            if (room.peers.has(socket.id)) {
              room.peers.delete(socket.id);
              console.log(`User ${socket.id} left room ${roomId}.`);
              if (room.peers.size === 0) {
                // If the room is empty, close the mediasoup router and delete the room
                room.router.close();
                rooms.delete(roomId);
                console.log(
                  `Room ${roomId} is now empty and has been deleted.`
                );
              }
            }
          });

          for (let con of contactsOnline) {
            io.to(`${con.userId}`).emit(`${chatEventEnumNew.OFFLINE_EVENT}`, {
              contactId: con._id,
              message: "your friend is Gone Offline",
            });
          }

          socket.leave(socket.user._id);
          await setUserOffline(user._id);
          delete peers[socket.id];
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

const emiterSocket = async (req, roomId, event, Payload) => {
  await req.app.get("io").to(roomId).emit(event, Payload);
};

const emiterSocketDIr = async (io, roomId, event, Payload) => {
  await io.to(roomId).emit(event, Payload);
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
          isGroup: false,
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
    return contactsOnline;
  } catch (error) {
    throw new ApiError(5001, "error in searching contacts");
  }
};

const getContactsForCall = async (roomId) => {
  try {
    const contacts = await Contact.aggregate([
      {
        $match: {
          _id: roomId,
          isGroup: false,
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
        $unwind: "$members",
      },
      {
        $lookup: {
          from: "users",
          localField: "members.userId",
          foreignField: "_id",
          as: "members.user",
        },
      },
      {
        $group: {
          _id: "$_id",
          member: {
            $addToSet: {
              $first: "$members.user",
            },
          },
        },
      },
    ]);
    return contacts;
  } catch (error) {
    throw new ApiError(400, "Error in getting contacts");
  }
};

const getContactsInCall = async (callId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) {
      throw new ApiError(400, "Call not found");
    }

    const contacts = await Call.aggregate([
      {
        $match: {
          _id: call._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members.user",
        },
      },
      {
        $unwind: "$members.user",
      },
      {
        $group: {
          _id: "$roomId",
          members: {
            $addToSet: "$members.user",
          },
        },
      },
    ]);
    return contacts;
  } catch (error) {
    throw new ApiError(400, "Error in getting contacts");
  }
};

module.exports = { starterSocketIo, emiterSocket, emiterCall };
