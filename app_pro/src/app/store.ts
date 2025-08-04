import { configureStore } from "@reduxjs/toolkit";
import AuthSliceReducer from "./functions/auth";
import TriggersSlice from './functions/triggers';
import TempSlice from './functions/temp'


export const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,
        triggers: TriggersSlice,
        temp: TempSlice
    }
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch