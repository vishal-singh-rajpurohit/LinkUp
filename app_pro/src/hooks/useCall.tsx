import { useContext, useState } from "react"
import { WSContext } from "../context/Contexts"

export const useCall = () =>{

    const socketContext = useContext(WSContext)

    if(!socketContext) {
        throw new Error("Socket not found")
    }

    const {socket} = socketContext

    const [] = useState()

    function makeVideoCall(){
        try {
            console.log("Requested Video Call")
            
        } catch (error) {
            if(error instanceof Error) throw new Error("Error in create video call: " + error.message)
        }
    }

    return {
        makeVideoCall
    }
}