const { Schema, default: mongoose } = require('mongoose');


const newSchema = new Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    oneOnOne: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isGroup: {
        type: Boolean,
        required: true,
        default: false
    },
    groupName: {
        type: String,
        required: false
    },
    whoCanSendMessage : {
        type: String,
        enum: ["ALL" || "ONLY_ADMINS" || null],
        default: "ALL"
    },
    isSearchable: {
        type: Boolean,
        default: false
    },
    isSecured: {
        type: Boolean,
        default: false,
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null
    }
}, 
{
    timeseries: true,
    timestamps: true
});

const Contact = mongoose.model("Contact", newSchema);

module.exports = Contact;