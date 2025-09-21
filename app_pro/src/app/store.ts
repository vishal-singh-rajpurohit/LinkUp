import { configureStore } from "@reduxjs/toolkit";
import AuthSliceReducer from "./functions/auth";
import TriggersSlice from './functions/triggers';
import TempSlice from './functions/temp'
import CallSlice from "./functions/call";


export const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,
        triggers: TriggersSlice,
        temp: TempSlice,
        call: CallSlice
    }
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch