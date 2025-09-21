import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface initialStateTypes {
    audioEnabled: boolean;
    videoEnable: boolean;
    isCalling: boolean;
    callingDet: {
        roomId: string;
        callId: string;
        avatar: string;
        searchTag: string;
        callerId: string;
    }
}

export interface callerTypes {
    callerName: string;
    callerId: string;
    avatar: string;
    callId: string;
    stream: MediaStream;
}

const initialState: initialStateTypes = {
    isCalling: false,
    audioEnabled: true,
    videoEnable: true,
    callingDet: {
        avatar: "",
        callerId: "",
        callId: "",
        roomId: "",
        searchTag: ""
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
}>) {
    state.callingDet.avatar = action.payload.avatar
    state.callingDet.callId = action.payload.callId
    state.callingDet.callerId = action.payload.callerId
    state.callingDet.roomId = action.payload.roomId
    state.callingDet.searchTag = action.payload.searchTag
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
        setCallDetails: setCallDetailsFunc
    }
})

export const { toggleAudio, toggleVideo, setCalling, setCallDetails } = CallSlice.actions

export default CallSlice.reducer