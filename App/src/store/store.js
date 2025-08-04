import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../functions/authSlice'
import chatReducer from '../functions/chatSlice'
import contactReducer from '../functions/contactSlice'
import callReducer from "../functions/callSlice"


const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        contacts: contactReducer,
        call: callReducer
    }
})

export default store