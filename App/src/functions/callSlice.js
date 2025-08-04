import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  callId: null,
  isIncoming: false,
  isVideoRequestOn: false,
  isAudioRequestOn: false,
  isAudioCall: false,
  isVideoCall: false,
  peerOffer: null,
  peerConnection: null,
  isCallAccpted: true,
  // reciverDetails: null,
  // myStream: null,
  // otherStream: null
};

function setIncoming(state, action) {
  state.isIncoming = action.payload.callerType;
  state.callId = action.payload.CallId || null;
  state.isVideoRequestOn = action.payload.isCallOn;
  state.peerOffer = action.payload.Offer;
}

function setVideoCallingRequest(state, action) {
  state.isVideoRequestOn = action.payload.request;
}

function setAudioCallingRequest(state, action) {
  state.isAudioRequestOn = action.payload.request;
}

function setVideoCallingTrue(state, action) {
  state.isVideoCall = true;
}

function setVideoCallingFalse(state, action) {
  state.isVideoCall = false;
}

function setAudioCallingFalse(state, action) {
  state.isAudioCall = false;
}

function setAudioCallingTrue(state, action) {
  state.isAudioCall = true;
}

function setPeerConnection(state, action) {
  state.peerConnection = action.payload.peerConnection;
}

function setStream(state, action){
  console.log("set stream call slice: ", action.payload)
  state.myStream = action.payload.myStream;
  state.otherStream = action.payload.otherStream;
}

const callSlice = createSlice({
  name: "call",
  initialState: initialState,
  reducers: {
    trueVideoCall: setVideoCallingTrue,
    falseVideoCall: setVideoCallingFalse,
    trueAudioCall: setAudioCallingTrue,
    falseAudioCall: setAudioCallingFalse,
    videoCallRequest: setVideoCallingRequest,
    audioCallRequest: setAudioCallingRequest,
    callSetIncoming: setIncoming,
    setPc: setPeerConnection,
    setSteams: setStream
  },
});

export const {
  trueVideoCall,
  trueAudioCall,
  falseVideoCall,
  falseAudioCall,
  videoCallRequest,
  audioCallRequest,
  callSetIncoming,
  setPc,
  setSteams
} = callSlice.actions;
export default callSlice.reducer;
