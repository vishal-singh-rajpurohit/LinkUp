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

const disconnectEventListner = (socket) =>{
    socket.on(ChatEventEnum.DISCONNECT_EVENT, (chatId)=>{
        console.log("user disconnected chatID: ", chatId);
    })
}

const updateGroupName = (socket)=>{
    socket.on(ChatEventEnum.UPDATE_GROUP_NAME, (chatId)=>{
        console.log("user changed the group name chatId: ", chatId);
    })
}

const typingEvent = (socket) =>{
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId)=>{
        console.log("user typing: ", chatId);
    })
}

const stopTyping = (socket) =>{
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId)=>{
        console.log("Typing stoped :", chatId);
    })
}

const messageDeletedEvent = (socket) =>{
    socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, (chatId, MessagId) =>{
        console.log("message ID: ", MessagId , "deleted by: ", chatId);
    })
}


const newChatEvent = (socket) =>{
    socket.on(ChatEventEnum.NEW_CHAT_EVENT, (chatID)=>{
        console.log("new chat created by ID: ", chatID)
    })
}


const newMessage = (socket) =>{
    socket.on(ChatEventEnum.MESSAGE_RECIVED_EVENT, (chatID)=>{
        // chnging the index of the chat to top
        console.log("new message recived: ", chatID)
    })
}

export {}