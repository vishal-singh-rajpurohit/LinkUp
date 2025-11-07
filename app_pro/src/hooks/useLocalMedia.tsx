import { useContext } from "react";
import { WSContext } from "../context/Contexts";


const useLocalMedia = () => {

    const SocketContext = useContext(WSContext);

    if (!SocketContext) {
        throw new Error("Socket not found");
    }


    return {
        // localStream,
        // localVideoRef,
        // remoteStreamRef,
        // remoteVideoRef
    }
}

export default useLocalMedia;