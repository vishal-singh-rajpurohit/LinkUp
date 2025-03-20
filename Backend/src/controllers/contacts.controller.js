const Contact = require("../models/contacts.model");
const User = require("../models/user.model");
const ContactMember = require("../models/contactMember.model");
const asyncHandler = require("../utils/asyncHandler.utils");
const ApiError = require("../utils/ApiError.utils");
const ApiResponse = require("../utils/ApiResponse.utils");

const createContact = asyncHandler(async (req, resp) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unautharized request", {
        errorMessage: "Unautharized request",
      });
    }

    const { userId } = req.body;

    if (!userId) {
      throw new ApiError(401, "Must Provide user id", {
        errorMessage: "Unautharized request",
      });
    }

    const isAlreadyContact = await Contact.findOne({
      oneOnOne: {
        $all: [user._id, userId],
      },
      isGroup: false,
    });

    if (!isAlreadyContact) {
      const newContact = new Contact({
        createdBy: user._id,
        oneOnOne: [user._id, userId],
        isGroup: false,
      });

      await newContact.save();

      if (!newContact) {
        throw new ApiError(400, "Unable to create contact", {
          errorMessage: "Unable to create contact",
        });
      }

      // send the socket the new contact event

      //   making pipeline for this

      resp
        .status(200)
        .json(
          new ApiResponse(200, { newContact }, "Contact created successfully")
        );
    } else {
      resp
        .status(200)
        .json(new ApiResponse(200, { newContact }, "Contact already existed"));
    }
  } catch (error) {
    throw new ApiError(400, "Error while creating contacts ", {
      errorMessage: "Must Provide user id ",
    });
  }
});

const crateGroupChat = asyncHandler(async (req, resp)=>{
    try {
        const user = req.user;

        if(!user){
            throw new ApiError(401, "Unauthraized User", {errorMessage: "Unauthraized User"});
        }

        const {contacts, groupName, whoCanSendMessage, isSearchable} = req.body;

        if(contacts || groupName || whoCanSendMessage || isSearchable){
            throw new ApiError(400, "All values must required", {errorMessage: "All values must required"});
        }

        const newGroup = new Contact({
            createdBy: user._id,
            isGroup: true,
            groupName: groupName,
            whoCanSendMessage: whoCanSendMessage,
            isSearchable: false
        })

        await newGroup.save();

        if(!newGroup){
            throw new ApiError(400, "Error while creating new group", {errorMessage: "Error while creating new group"});
        }

        contacts.forEach(async (element) => {
            let addedMember = new ContactMember({
                userId: element,
                contactId: newGroup._id,
                addedBy: user._id
            });

            await addedMember.save();

            if(!addedMember){
                throw new ApiError(400, "Error while adding new contact member",  { errorMessage: "Error while adding new contact member" });
            }
        });

        // Aggrigate to send the whole details about group
        resp.status(200)
        .json(new ApiResponse(200, {}, "Group created successfully"))

    } catch (error) {
        throw new ApiError(401, "Error while creating group chat ", {errorMessage: "Error while creating group chat "});
    }
});
