const {Schema, default: mongoose} = require("mongoose")


const newModel = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "User"
        },
        contactId: {
            type: mongoose.Types.ObjectId,
            default: null,
            ref: "contactmembers" || "contacts"
        },
        message: {
            type: String,
            default: "No Message",
            require: true
        },
        type: {
            type: String,
            required: true
        }
    },
    {
    timeseries: true,
    timestamps: true
})


const FeedbackModel = mongoose.model('Feedback', newModel)

module.exports = FeedbackModel