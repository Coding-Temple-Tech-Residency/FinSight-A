import { configureStore } from "@reduxjs/toolkit";
import marketReducer from "../features/market/marketSlice";

export const store = configureStore({
  reducer: {
    market: marketReducer,
import profileReducer from "../features/profile/profileSlice";
import watchlistReducer from "../features/watchlist/watchlistSlice";

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    watchlist: watchlistReducer

// export const store = configureStore({
//   reducer: {
//     watchlist: watchlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;