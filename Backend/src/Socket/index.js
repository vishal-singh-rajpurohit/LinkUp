const ApiError = require('../utils/ApiError.utils');
const jwt = require('jsonwebtoken');
const { chatEventEnumNew, callEventEnum } = require('../constants/constants');
const User = require('../models/user.model');
const Contact = require('../models/contacts.model');
const { default: mongoose } = require('mongoose');
const Message = require('../models/message.modal');
const Call = require('../models/calls.model');
const { makeCall, endVideoCall } = require('./caller.helpers');
const nodemailer = require('nodemailer');


/**
 * @description event happens when user switches between chats or contacts based on contactId
 * @param {Socket<import("socket.io")}
 */


const callRooms = {};
let mailTransporter = null;
let mailTransporterInit = false;

const getMailTransporter = async () => {
  if (mailTransporter) {
    return mailTransporter;
  }

  if (mailTransporterInit) {
    return null;
  }

  mailTransporterInit = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SERVICE } = process.env;
  if ((!SMTP_SERVICE && !SMTP_HOST) || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  mailTransporter = nodemailer.createTransport(
    SMTP_SERVICE
      ? {
        service: SMTP_SERVICE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      }
      : {
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      },
  );

  return mailTransporter;
};

const sendCallInviteEmails = async ({ members, caller, contact }) => {
  try {
    if (!members?.length || !caller) {
      return;
    }

    const recipients = members.filter(
      (member) => member?.email && String(member._id) !== String(caller._id),
    );

    if (!recipients.length) {
      return;
    }

    const transporter = await getMailTransporter();
    if (!transporter) {
      return;
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const callerName = caller.userName || 'Someone';
    const roomName = contact?.groupName || 'a chat';

    await Promise.allSettled(
      recipients.map((member) =>
        transporter.sendMail({
          from,
          to: member.email,
          subject: `${callerName} is calling you on LinkUp`,
          text: `${callerName} started a call in ${roomName}. Open LinkUp to join.`,
        }),
      ),
    );
  } catch (error) {
    console.error('Error sending call invite emails:', error?.message || error);
  }
};

/**
 *
 * @param {*} io
 * @returns io connection
 */


const searchTagToSocketIdMapping = new Map()
const socketIdToSearchTagMapping = new Map()

const starterSocketIo = async (io) => {
  return io.on('connection', async (socket) => {
    try {
      const accessToken = socket.handshake.auth?.token;

      if (!accessToken) {
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
      socket.emit(chatEventEnumNew.CONNECTED_EVENT);

      socket.on(chatEventEnumNew.JOIN_ROOM, async (payload) => {
        const roomId = payload.roomId.toString();
        socket.join(roomId);

        socket.to(roomId).emit('message', {
          user: socket.id,
          text: `${socket.id} has joined the room`,
        });
        socket.emit('joinedRoom', roomId); // Confirm joining the room

        const room = io.sockets.adapter.rooms.get(roomId);

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
                      $ne: ['$$member.userId', user._id],
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
          payload.msgid,
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

        // Marked Read
        socket.to(sender.socketId).emit(chatEventEnumNew.MARKED, {
          messageId: message._id,
          contactId: message.contactId,
          viewerId: user._id,
        });
      });

      socket.on(callEventEnum.MAKE_VIDEO_CALL_PRE, async ({ contactId, callerId, username, avatar }) => {
        const contact = await Contact.findById(contactId);
        const user = await User.findById(callerId);

        if (!contact || !user || contact.isGroup) {
          socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
            message: 'contacts not found',
          });
          return;
        }

        const reciver = await getContactsForCall(contact._id);
        const members = reciver?.[0]?.member || [];
        const callerMember = members.find((m) => String(m._id) === String(callerId));
        const calleeMember = members.find((m) => String(m._id) !== String(callerId));

        if (!callerMember || !calleeMember || !calleeMember.online) {
          socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
            message: 'callee is offline',
          });
          return;
        }

        // strict one-to-one call: expected 2 participants
        const newCall = await makeCall(
          user._id,
          contact._id,
          2,
        );

        searchTagToSocketIdMapping.set(String(callerMember._id), callerMember.socketId)
        socketIdToSearchTagMapping.set(callerMember.socketId, String(callerMember._id))
        searchTagToSocketIdMapping.set(String(calleeMember._id), calleeMember.socketId)
        socketIdToSearchTagMapping.set(calleeMember.socketId, String(calleeMember._id))

        // caller gets outgoing pre-state with callee as target
        io.to(`${callerMember.socketId}`).emit(
          `${callEventEnum.INCOMING_VIDEO_CALL_PRE}`,
          {
            roomId: contact._id,
            callerId: String(callerId),
            remoteUserId: String(calleeMember._id),
            searchTag: contact.groupName || username,
            avatar: contact.groupAvatar || avatar,
            callId: newCall._id
          },
        );

        // callee gets incoming pre-state with caller as target
        io.to(`${calleeMember.socketId}`).emit(
          `${callEventEnum.INCOMING_VIDEO_CALL_PRE}`,
          {
            roomId: contact._id,
            callerId: String(callerId),
            remoteUserId: String(callerId),
            searchTag: contact.groupName || username,
            avatar: contact.groupAvatar || avatar,
            callId: newCall._id
          },
        );

      });

      socket.on(callEventEnum.MAKE_VIDEO_CALL, async ({ to, offer }) => {
        if (!to || !offer) return;
        io.to(`${to}`).emit(`${callEventEnum.INCOMING_VIDEO_CALL}`, { offer });
      });

      socket.on(callEventEnum.ANSWER_CALL, async ({ to, ans }) => {
        if (!to || !ans) return;
        io.to(`${to}`).emit(callEventEnum.CALL_ANSWERED, { ans })
      });

      socket.on(callEventEnum.END_CALL, async ({ to }) => {
        if (!to) return;
        io.to(`${to}`).emit(callEventEnum.ENDED_CALL, {})
      })

      socket.on(callEventEnum.ICE_CANDIDATE, ({ to, candidate }) => {
        if (!to || !candidate) return;
        io.to(`${to}`).emit(callEventEnum.ICE_CANDIDATE_INCOMING, { candidate })
      })

      socket.on(callEventEnum.NEGOTIATION_NEEDED, ({ to, offer }) => {
        if (!to || !offer) return;
        io.to(`${to}`).emit(callEventEnum.NEGOTIATION_INCOMING, { offer })
      });

      socket.on(callEventEnum.NEGOTIATION_DONE, ({ to, ans }) => {
        if (!to || !ans) return;
        io.to(`${to}`).emit(callEventEnum.NEGOTIATION_FINAL, { ans })
      });

      socket.on(callEventEnum.CANCELLED_BEFORE_ANSWER, async ({ contactId, callerId }) => {

        const contact = await Contact.findById(contactId);
        const user = await User.findById(callerId);

        if (!contact || !user || contact.isGroup) {
          socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
            message: 'contacts not found',
          });
          return;
        }

        const reciver = await getContactsForCall(contact._id);
        const members = reciver?.[0]?.member || [];
        const callerMember = members.find((m) => String(m._id) === String(callerId));
        const calleeMember = members.find((m) => String(m._id) !== String(callerId));

        if (callerMember?.socketId) {
          io.to(`${callerMember.socketId}`).emit(`${callEventEnum.STOP_CALLING}`, {});
        }
        if (calleeMember?.socketId) {
          io.to(`${calleeMember.socketId}`).emit(`${callEventEnum.STOP_CALLING}`, {});
        }
      },
      );

      socket.on(callEventEnum.DENAY_CALL, async ({ callId, memberId, roomId }) => {
        const call = await Call.findById(callId);
        if (!call) throw new Error('Call not found');

        const contact = await Contact.findById(roomId);
        const user = await User.findById(memberId);

        if (!contact || !user) {
          socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
            message: 'contacts not found',
          });
        }


        // strict one-to-one caller flow
        if (!contact.isGroup) {
          const reciver = await getContactsForCall(contact._id);
          const members = reciver?.[0]?.member || [];
          const callerMember = members.find((m) => String(m._id) === String(memberId));
          const calleeMember = members.find((m) => String(m._id) !== String(memberId));

          if (callerMember?.socketId) {
            io.to(`${callerMember.socketId}`).emit(`${callEventEnum.STOP_CALLING}`, {});
          }
          if (calleeMember?.socketId) {
            io.to(`${calleeMember.socketId}`).emit(`${callEventEnum.STOP_CALLING}`, {});
          }
        }


        // if(!call.members.length){
        //   throw new Error("not any member found in the call")
        // }

      });

      socket.on(chatEventEnumNew.CANCELLED_VIDEO_CALL, async ({ callId, roomId }) => {
        const contact = await Contact.findById(roomId);

        if (!contact) {
          socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
            message: 'contacts not found',
          });
        }

        const ended = await endVideoCall(callId);

        if (!ended.successs) {
        }

        const reciver = await getContactsForCall(contact._id);

        const recivers = reciver[0].member.filter(
          (val) => val.online === true,
        );

        delete callRooms[callId];

        for (let reciver of recivers) {
          if (reciver.online) {
            // producersMap.delete(reciver._id);
            io.to(`${reciver.socketId}`).emit(
              `${chatEventEnumNew.OFFLINE_CALLER}`,
              {
                message: 'Call Ended',
              },
            );
          }
        }
      },
      );

      socket.on(chatEventEnumNew.DISCONNECT_EVENT, async () => {
        if (socket.user?._id) {
          const socketId = socketIdToSearchTagMapping.get(socket.id)
          const tag = searchTagToSocketIdMapping.get(socketId)

          socketIdToSearchTagMapping.delete(socketId)
          searchTagToSocketIdMapping.delete(tag)

          const contactsOnline = await getUserOnlineFriends(user._id);

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

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(400, 'User not found');
    }
    user.online = false;
    await user.save();
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

const markReadToFunction = async (contactId, userId) => {
  try {
    const contact = await Contact.findById(contactId)
    const user = await User.findById(userId)

    if (!contact || !user) {
      throw new Error("Contact or user not found with this contact id")
    }

    await Message.updateMany(
      {
        contactId: contact._id,
        userId: { $ne: user._id },
        readBy: { $not: { $elemMatch: { $eq: user._id } } }
      },
      {
        $addToSet: { readBy: user._id }
      }
    )

  } catch (error) {
    console.error("Error in marking messages: ", error)
  }
}

module.exports = {
  starterSocketIo,
  emiterSocket,
  emiterCall,
  getContactsForCall,
};
