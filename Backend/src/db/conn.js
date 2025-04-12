require('dotenv').config()
const {mongoose} = require('mongoose');
const ApiError = require('../utils/ApiError.utils')

const conn = async () =>{
    try {
        await mongoose.connect(process.env.ATLAS_LINK);
        console.log("connected to the database");
    } catch (error) {
        console.log("error with connection of databse", error)
        throw new ApiError(400, "Error to connect to the data base", error)
    }
}


module.exports = conn;