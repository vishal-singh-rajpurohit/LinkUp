const User = require("../models/user.model");
const ApiError = require("../utils/ApiError.utils")


const generateTokens = async (userId) =>{
    try {

        const isUser = await User.findOne({_id: userId});

        if(!isUser){
            throw new ApiError(400 , "User Not Found in the DataBase");
        }

        const newAccessToken = await isUser.generateAccessToken();
        const newRefreshToken = await isUser.generateRefreshToken();

        if(!newRefreshToken){
            throw new ApiError(500, "Error in newRefreshToken :" )
        }
        if(!newAccessToken){
            throw new ApiError(500, "Error in newRefreshToken :" )
        }

        return {newRefreshToken , newAccessToken};

    } catch (error) {
        console.log("Error while generating tokens :", error);
        throw new ApiError(501, "Error in genrateToken() :");
    }
}

module.exports = generateTokens