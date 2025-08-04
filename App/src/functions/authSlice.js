import { createSlice } from "@reduxjs/toolkit";

const authInitialState = {
  loggedIn: false,
  user: {
    userName: null,
    _id: null,
    email: null,
    searchTag: null,
    avatar: null,
    theme: null,
  },
};

function loginUser(state, action) {
  console.log("login user action.payload: ", action)
  state.loggedIn = true;
  state.user.userName = action.payload.user.userName;
  state.user._id = action.payload.user._id;
  state.user.email = action.payload.user.email;
  state.user.searchTag = action.payload.user.searchTag;
  state.user.avatar = action.payload.user.avatar;
  state.user.theme = action.payload.user.theme;
}

function logoutUser(state, action) {
  state.loggedIn = false
  state.user.userName = null
  state.user._id = null;
  state.user.email = null
  state.user.searchTag = null
  state.user.avatar = null
  state.user.theme = null
}

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    login: loginUser,
    logout: logoutUser
  },
});

export const {login, logout} = authSlice.actions;

export default authSlice.reducer;
