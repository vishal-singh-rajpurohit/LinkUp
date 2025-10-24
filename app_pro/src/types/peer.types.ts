export interface peerMessage {
    type: "INCOMING" | "OUTGOING" | "ACCEPTED" | "DECLINED" | "ENDED" | "REJECTED" | "NEW_MEMBER" | "REMOVE_MEMBER";
    from: string;
    to: string;
    sessionDescription: RTCSessionDescription | null;
}