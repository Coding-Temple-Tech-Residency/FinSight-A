import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../features/chat/chatSlice";
import marketReducer from "../features/market/marketSlice";
import profileReducer from "../features/profile/profileSlice";
import watchlistReducer from "../features/watchlist/watchlistSlice";
import landingReducer from "../features/landing/landingSlice";
import portfolioReducer from '../features/portfolio/portfolioSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    market: marketReducer,
    profile: profileReducer,
    watchlist: watchlistReducer,
    landing: landingReducer,
    portfolio: portfolioReducer

// export const store = configureStore({
//   reducer: {
//     watchlist: watchlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;