import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


interface initialStateTypes {
    audioEnabled: boolean;
    videoEnable: boolean;
    callStatus: "OFF" | "ACTIVE" | "INCOMING" | "OUTGOING" | "ENDED";
    memberCount: number;
    callingDet: {
        roomId: string;
        callerId: string;
        callId: string;
        avatar: string;
        searchTag: string;
        email: string;
    }
}

export interface callerTypes {
    callerName: string;
    callerId: string;
    avatar: string;
    callId: string;
}

const initialState: initialStateTypes = {
    callStatus: "OFF",
    audioEnabled: true,
    videoEnable: true,
    memberCount: 0,
    callingDet: {
        roomId: "",
        callerId: "",
        callId: "",
        avatar: "",
        searchTag: "",
        email: ""
    }
}

function toggleAudioFunc(state: initialStateTypes) {
    state.audioEnabled = !state.audioEnabled;
}

function toggleVideoFunc(state: initialStateTypes) {
    state.videoEnable = !state.videoEnable;
}

function setCallDetailsFunc(state: initialStateTypes, action: PayloadAction<{
    roomId: string;
    callId: string;
    avatar: string;
    searchTag: string;
    callerId: string;
    email: string;
}>) {
    state.callingDet.avatar = action.payload.avatar;
    state.callingDet.callId = action.payload.callId;
    state.callingDet.callerId = action.payload.callerId;
    state.callingDet.roomId = action.payload.roomId;
    state.callingDet.searchTag = action.payload.searchTag;
    state.callingDet.email = action.payload.email;
}

function setMemberCountFunc(state: initialStateTypes, action: PayloadAction<{ type: "INC" | "DEC" }>) {
    if (action.payload.type === "INC") {
        state.memberCount = state.memberCount + 1;
    }
    else if (action.payload.type === "DEC") {
        state.memberCount = state.memberCount - 1;
    }
}

function callingStatusFunction(state: initialStateTypes, action: PayloadAction<{ status: "OFF" | "ACTIVE" | "INCOMING" | "OUTGOING" | "ENDED"; }>) {
    state.callStatus = action.payload.status
}

function clearCalling(state: initialStateTypes) {
    state.callStatus = "OFF"
    state.audioEnabled = true
    state.videoEnable = true
    state.memberCount = 0
    state.callingDet = {
        avatar: "",
        callerId: "",
        callId: "",
        roomId: "",
        searchTag: "",
        email: ""
    }
}

export const CallSlice = createSlice({
    name: 'call',
    initialState: initialState,

    reducers: {
        toggleAudio: toggleAudioFunc,
        toggleVideo: toggleVideoFunc,
        setCallDetails: setCallDetailsFunc,
        setMemberCount: setMemberCountFunc,
        setCallingStatus: callingStatusFunction,
        clearCall: clearCalling,
    }
})

export const { toggleAudio, toggleVideo, setCallDetails, setMemberCount, clearCall, setCallingStatus } = CallSlice.actions

export default CallSlice.reducer