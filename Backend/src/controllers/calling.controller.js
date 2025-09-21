const Contact = require('../models/contacts.model');
const User = require('../models/user.model');
const { getContactsForCall } = require('../Socket');
const { makeCall } = require('../Socket/caller.helpers');
const ApiError = require('../utils/ApiError.utils');
const asyncHandler = require('../utils/asyncHandler.utils');

// const joinCallRoom = asyncHandler(async (req, resp) => {
//   const user = req.user;

//   const ckUser = await User.findById(user._id);

//   if (!user || !ckUser) {
//     throw new ApiError(401, 'Unautharized request');
//   }

//   const { contactId } = req.body;

//   if (!contactId) {
//     throw new ApiError(401, 'Contact Id not found');
//   }

//   const contact = await Contact.findById(contactId);

//   if (!contact) {
//     console.log('Contacts not found');
//     // socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
//     //   message: 'contacts not found',
//     // });
//     throw new ApiError(401, 'Contact not found');
//   }

//   const reciver = await getContactsForCall(contact._id);

//   const recivers = await reciver[0].member.filter((val) => val.online === true);

//   const newCall = await makeCall(ckUser._id, contact._id, recivers.length);

//   if (recivers.length > 1) {
//     for (const reciver of recivers) {
//       if (reciver.online) {
//         if (callerId === reciver._id) {
//           socket.join(newCall._id);
//         }

//         // io.to(`${reciver.socketId}`).emit(
//         //   `${chatEventEnumNew.INCOMING_VIDEO_CALL}`,
//         //   {
//         //     roomId: contact._id,
//         //     callerId: callerId,
//         //     searchTag: contact.groupName || username,
//         //     avatar: contact.groupAvatar || avatar,
//         //     callId: newCall._id,
//         //     mediasoupRouter: router,
//         //   },
//         // );
//         console.log(`call ${newCall._id} created.`);
//       }
//     }
//   } else {
//     socket.emit(chatEventEnumNew.OFFLINE_CALLER, {
//       message: 'contacts not found',
//     });
//   }
// });
