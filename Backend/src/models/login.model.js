const{ Schema, default:mongoose} = require('mongoose')


const newModel = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        }
    },
    {
        timeseries: true,
        timestamps: true
    }
)

const LoginModel = mongoose.model('login', newModel)

module.exports = LoginModel