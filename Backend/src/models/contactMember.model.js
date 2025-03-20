const { Schema, default: mongoose } = require('mongoose');


const newSchema = new  Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    isAdmin: {
        type: Boolean,
        default: true,
        required: true
    }
},{
    timestamps: true
});

const ContactMember = mongoose.model("ContactMember", newSchema);
module.exports = ContactMember;