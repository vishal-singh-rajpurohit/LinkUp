const {Server, Socket} = require("socket.io");
const {ChatEventEnum} = require("../constants/constants")


/**
 * @description 
 * @param
 */

const joinEventListner = (socket) =>{
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId)=>{
        console.log(`User Joined the chat , Chat Id is : ${chatId}`)
    })
}

export {}