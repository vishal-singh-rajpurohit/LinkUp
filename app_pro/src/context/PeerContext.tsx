import { useContext, type ReactNode } from "react";
import { PeerContext, WSContext } from "./Contexts";

const PeerProvider = ({ children }: { children: ReactNode }) => {

    const wsContext = useContext(WSContext)

    if (!wsContext) {
        throw new Error("context not found");
    }

    return (
        <PeerContext.Provider value={null} >{children}</PeerContext.Provider>
    )
}

export default PeerProvider