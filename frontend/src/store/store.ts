import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "../features/profile/profileSlice";

export const store = configureStore({
  reducer: {
    profile: profileReducer,
import watchlistReducer from "../features/watchlist/watchlistSlice";

export const store = configureStore({
  reducer: {
    watchlist: watchlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;