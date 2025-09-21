import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface initialStateTypes {
    audioEnabled: boolean;
    videoEnable: boolean;
    isCalling: boolean;
    memberCount: number;
    isAnswered: boolean;
    callingDet: {
        roomId: string;
        callId: string;
        avatar: string;
        searchTag: string;
        callerId: string;
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
    isCalling: false,
    audioEnabled: true,
    videoEnable: true,
    memberCount: 0,
    isAnswered: false,
    callingDet: {
        avatar: "",
        callerId: "",
        callId: "",
        roomId: "",
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

function setMemberCountFunc(state: initialStateTypes, action: PayloadAction<{type: "INC" | "DEC"}>){
    if(action.payload.type === "INC"){
        state.memberCount = state.memberCount + 1;
        console.log("function is calling: ", state.memberCount)
    }
    else if(action.payload.type === "DEC"){
        state.memberCount = state.memberCount - 1;
    }

    if(state.memberCount > 2){
        console.log("answered")
        state.isAnswered = true
    }
}

function pickUpCallfunc(state: initialStateTypes){
    state.isAnswered = true;
}

function clearCalling(state: initialStateTypes){
    state.isCalling = false
    state.audioEnabled = true
    state.videoEnable = true
    state.memberCount = 0
    state.isAnswered = false
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
        setCalling: (state: initialStateTypes, action: PayloadAction<{ trigger: boolean; }>) => {
            state.isCalling = action.payload.trigger;
        },
        setCallDetails: setCallDetailsFunc,
        setMemberCount: setMemberCountFunc,
        pickUpCall: pickUpCallfunc,
        clearCall: clearCalling
    }
})

export const { toggleAudio, toggleVideo, setCalling, setCallDetails, setMemberCount, clearCall, pickUpCall } = CallSlice.actions

export default CallSlice.reducer