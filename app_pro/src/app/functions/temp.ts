import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


export interface searchUserTypes {
    _id: string;
    searchTag: string;
    avatar: string;
    isOnline: boolean
}

interface initialStateTypes {
    searchUsers: searchUserTypes[];
}

const initialState: initialStateTypes = {
    searchUsers: []
}

function searchingFunc(state: initialStateTypes, action: PayloadAction<{ users: searchUserTypes[] }>) {
    state.searchUsers = action.payload.users

    console.log(`state ${JSON.stringify(state.searchUsers, null, 2)}`);
}


const tempSlice = createSlice({
    name: 'temp',
    initialState: initialState,
    reducers: {
        searching: searchingFunc
    }
})


export const { searching } = tempSlice.actions

export default tempSlice.reducer