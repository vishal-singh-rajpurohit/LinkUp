const  {Schema, default: mongoose, mongo} = require('mongoose');
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const newSchema = new Schema({
    message: {
        type: String,
        trim: true,
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
        required: true
    },
    sederId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    containsFile: {
        type: Boolean,
        required: true,
        default: false
    },
    fileType: {
        type: String,
        enum: ['IMG', 'VIDEO', "DOC", "AUDIO"]
    },
    file: {
        type: String,
        required: true,
        default: null
    },
    seen:{
        type: Boolean,
        default: false,
        required: true
    },
    socketStatus: {
        type: Boolean,
        required: true,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        required: true
    }
},{
    timeseries: true,
    timestamps: true
});

newSchema.pre('save', async (next)=>{
    await bcrypt.hash(this.message, 15);
    next();
});

newSchema.post('find', async(next)=>{
    await bcrypt.hashSync
})

const Message = mongoose.model("Message", newSchema);

module.exports = Message;