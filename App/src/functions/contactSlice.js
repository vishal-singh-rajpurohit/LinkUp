import { createSlice } from "@reduxjs/toolkit";

const contactInitialState = {
  oneOnOne: [],
  groupChats: [],
  securedChats: [],
  blockedChats: []
}

function setContactDiractory(state, action){
    state.oneOnOne = action.payload.oneOnOne;
    state.groupChats = action.payload.groupChats;
    state.securedChats = action.payload.securedChats;
    state.blockedChats = action.payload.blockedChats || [];
}

function setClearDiractory(state, action){
    state.oneOnOne = []
    state.groupChats = []
    state.securedChats =[]
    state.blockedChats = []
}

const contactSlice = createSlice({
  name: "contacts",
  initialState: contactInitialState,
  reducers: {
    contactDiractory: setContactDiractory,
    clearDiractory: setClearDiractory,
  }
});


export const { contactDiractory, clearDiractory } = contactSlice.actions;
export default contactSlice.reducer;