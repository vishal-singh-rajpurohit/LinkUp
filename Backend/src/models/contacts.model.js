const { Schema, default: mongoose } = require('mongoose');


const newSchema = new Schema({
    contacts:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    approachedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    lastChat: {
        type: String,
        default: "",
        required: true
    },
    blocked: {
        type: Boolean,
        required: true,
        default: false
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        defualt: null
    },
    isEncrypted: {
        type: Boolean,
        default: false
    },
    encryptedBy:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        defualt: null
    }],
    isGroup: {
        type: Boolean,
        required: true,
        default: false
    },
    groupName: {
        type: String,
        default: `group ${Math.random()*100}`,
        required: false
    },
    whoCanSendMessages : {
        type: String,
        enum: ["ALL, ONLY_ADMINS"],
        default: "ALL"
    },
    isSearchable: {
        type: Boolean,
        default: false
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "User",
        required: false
    }],
    socketId: {
        type: String,
        required: false
    }
}, {
    timeseries: true,
    timestamps: true
});


const Contact = mongoose.model("Contact", newSchema);

module.exports = Contact;