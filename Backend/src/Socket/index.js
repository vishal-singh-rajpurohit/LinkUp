const ApiError = require('../utils/ApiError.utils');
const jwt = require('jsonwebtoken');
const { ChatEventEnumNew, chatEventEnumNew, CallEventEnum } = require('../constants/constants');
const User = require('../models/user.model');
const Contact = require('../models/contacts.model');
const { default: mongoose } = require('mongoose');
const Message = require('../models/message.modal');
const Call = require('../models/calls.model');
const { makeCall, endVideoCall, addMemberToCall } = require('./caller.helpers');


/**
 * @description event happens when user switches between chats or contacts based on contactId
 * @param {Socket<import("socket.io")}
 */

let router;
let producer;
let consumer;
let producerTransport;
let consumerTransport;
const producersMap = new Map();

const callRooms = {};

/**
 *
 * @param {*} io
 * @returns io connection
 */

const starterSocketIo = async (io) => {
  return io.on('connection', async (socket) => {
    try {
      console.log('Socket connected to server', socket.id);
      const accessToken = socket.handshake.auth?.token;

      if (!accessToken) {
        console.log('Access token not found in cookies');
        throw new ApiError(400, 'Unauthorized Access');
      }

      const decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      );

      const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

      if (!user) {
        throw new ApiError(400, 'Unauthorized User');
      }

      user.socketId = socket.id;
      await user.save();
      socket.user = user;
      socket.userId = user._id.toString();
      socket.join(user._id.toString());
      socket.emit(ChatEventEnumNew.CONNECTED_EVENT);

      socket.on(chatEventEnumNew.JOIN_ROOM, async (payload) => {
        const roomId = payload.roomId.toString();
        socket.join(roomId);
        // console.log(`User joined room: ${roomId}`);

        socket.to(roomId).emit('message', {
          user: socket.id,
          text: `${socket.id} has joined the room`,
        });
        socket.emit('joinedRoom', roomId); // Confirm joining the room

        const room = io.sockets.adapter.rooms.get(roomId);

        if (room) {
          console.log(`Users in room ${roomId}:`, room.size);
        }
      });

      const contactsOnline = await getUserOnlineFriends(user._id);

      for (let con of contactsOnline) {
        io.to(`${con.userId}`).emit(`${chatEventEnumNew.ONLINE_EVENT}`, {
          contactId: con._id,
          message: 'your friend is online',
        });
      }

      socket.on(chatEventEnumNew.TYPING_ON, async (payload) => {
        const contact = await Contact.findById(payload.contactId);

        if (!contact) {
          console.log('contacts not found');
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
                from: 'contactmembers',
                localField: '_id',
                foreignField: 'contactId',
                as: 'members',
              },
            },
            {
              $addFields: {
                member: {
                  $filter: {
                    input: '$members',
                    as: 'member',
                    cond: {
                      $ne: ['$$member.userId', payload.userId],
                    },
                  },
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'member.userId',
                foreignField: '_id',
                as: 'member.user',
              },
            },
            {
              $unwind: '$member.user',
            },

            {
              $group: {
                _id: '$_id',
                member: {
                  $first: '$member.user',
                },
              },
            },
            {
              $group: {
                _id: '$_id',
                userId: {
                  $first: '$member._id',
                },
                isOnline: {
                  $first: '$member.online',
                },
                socketId: {
                  $first: '$member.socketId',
                },
                avatar: {
                  $first: '$member.avatar',
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
              { avatar: payload.avatar },
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
                from: 'contactmembers',
                localField: '_id',
                foreignField: 'contactId',
                as: 'members',
              },
            },
            {
              $addFields: {
                member: {
                  $filter: {
                    input: '$members',
                    as: 'member',
                    cond: {
                      $ne: [
                        '$$member.userId',
                        new mongoose.Types.ObjectId(payload.userId),
                      ],
                    },
                  },
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'member.userId',
                foreignField: '_id',
                as: 'member.user',
              },
            },
            {
              $unwind: '$member.user',
            },
            {
              $match: {
                'member.user.online': true,
              },
            },
            {
              $group: {
                _id: '$_id',
                member: {
                  $addToSet: '$member.user',
                },
              },
            },
            {
              $project: {
                'member._id': 1,
                'member.socketId': 1,
                'member.avatar': 1,
                'member.searchTag': 1,
              },
            },
          ]);

          if (recivers.length) {
            for (let reciver of recivers[0].member) {
              io.to(`${reciver.socketId}`).emit(
                `${chatEventEnumNew.TYPING_ON}`,
                { avatar: payload.avatar },
              );
            }
          }
        }
      });

      socket.on(chatEventEnumNew.MARK_READ, async (payload) => {
        const user = await User.findById(payload.id);
        if (!user) {
          throw new ApiError(501, 'Unautharized Request');
        }
        const message = await Message.findByIdAndUpdate(
          payload.msgId,
          {
            $addToSet: { readBy: user._id },
          },
          { new: true },
        );
        if (!message) {
          throw new ApiError(400, 'Message not found:');
        }

        const sender = await User.findById(message.userId);

        if (!sender) {
          throw new ApiError(400, 'Sender not found');
        }

        socket.to(sender.socketId).emit(chatEventEnumNew.MARKED, {
          messageId: message._id,
          contactId: message.contactId,
          viewerId: user._id,
        });
      });

      socket.on(ChatEventEnumNew.DISCONNECT_EVENT, async () => {
        console.log('user has disconnected userId: ' + socket.user?._id);
        if (socket.user?._id) {
          const contactsOnline = await getUserOnlineFriends(user._id);
          // const callId = socket.callId

          for (let con of contactsOnline) {
            io.to(`${con.userId}`).emit(`${chatEventEnumNew.OFFLINE_EVENT}`, {
              contactId: con._id,
              message: 'your friend is Gone Offline',
            });
          }

          // if(callId && callRooms[callId]){
          //   const {transports, consumers, producers} = callRooms[callId];
          // }

          socket.leave(socket.user._id);
          await setUserOffline(user._id);
        }
      });

    } catch (error) {
      socket.emit(
        chatEventEnumNew.SOCKET_ERROR_EVENT,
        error?.message ||
        'Something went wrong while connecting to the socket.',
      );
    }
  });
};

const emiterSocket = async (req, roomId, event, Payload) => {
  await req.app.get('io').to(roomId).emit(event, Payload);
};

const emiterCall = (req, userId, event, Payload) => {
  req.app.get('io').to(userId).emit(event, Payload);
};

const setUserOffline = async (userId) => {
  console.log('setting use offline');

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log('user does not found');
      throw new ApiError(400, 'User not found');
    }
    user.online = false;
    await user.save();
    console.log('now user is offline');
  } catch (error) {
    throw new ApiError(501, 'Error in setting Offline');
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
          from: 'contactmembers',
          localField: '_id',
          foreignField: 'contactId',
          as: 'members',
        },
      },
      {
        $addFields: {
          member: {
            $filter: {
              input: '$members',
              as: 'member',
              cond: {
                $ne: ['$$member.userId', userId],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'member.userId',
          foreignField: '_id',
          as: 'member.user',
        },
      },
      {
        $unwind: '$member.user',
      },

      {
        $group: {
          _id: '$_id',
          member: {
            $first: '$member.user',
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          userId: {
            $first: '$member._id',
          },
          isOnline: {
            $first: '$member.online',
          },
          socketId: {
            $first: '$member.socketId',
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
    throw new ApiError(5001, 'error in searching contacts');
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
          from: 'contactmembers',
          localField: '_id',
          foreignField: 'contactId',
          as: 'members',
        },
      },
      {
        $unwind: '$members',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members.userId',
          foreignField: '_id',
          as: 'members.user',
        },
      },
      {
        $group: {
          _id: '$_id',
          member: {
            $addToSet: {
              $first: '$members.user',
            },
          },
        },
      },
    ]);
    return contacts;
  } catch (error) {
    throw new ApiError(400, 'Error in getting contacts');
  }
};

const getContactsInCall = async (callId) => {
  try {
    const call = await Call.findById(callId);
    if (!call) {
      throw new ApiError(400, 'Call not found');
    }

    const contacts = await Call.aggregate([
      {
        $match: {
          _id: call._id,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members.user',
        },
      },
      {
        $unwind: '$members.user',
      },
      {
        $group: {
          _id: '$roomId',
          members: {
            $addToSet: '$members.user',
          },
        },
      },
    ]);
    return contacts;
  } catch (error) {
    throw new ApiError(400, 'Error in getting contacts');
  }
};

module.exports = {
  starterSocketIo,
  emiterSocket,
  emiterCall,
  getContactsForCall,
};
