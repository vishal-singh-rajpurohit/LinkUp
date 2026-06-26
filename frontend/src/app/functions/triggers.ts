import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


interface initialStateTypes {
    searching: boolean;
}

const initialState: initialStateTypes = {
    searching: false,
}

function searchFunc(state: initialStateTypes, action: PayloadAction<{ trigger: boolean }>) {
    state.searching = action.payload.trigger
}

const triggerSlice = createSlice({
    name: 'triggers',
    initialState: initialState,
    reducers: {
        setSearching: searchFunc
    }
})


export const { setSearching } = triggerSlice.actions;

export default triggerSlice.reducer;