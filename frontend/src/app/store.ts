import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../features/chat/chatSlice";
import marketReducer from "../features/market/marketSlice";
import profileReducer from "../features/profile/profileSlice";
import watchlistReducer from "../features/watchlist/watchlistSlice";
import landingReducer from "../features/landing/landingSlice";
import portfolioReducer from "../features/portfolio/portfolioSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    market: marketReducer,
    profile: profileReducer,
    watchlist: watchlistReducer,
    landing: landingReducer,
    portfolio: portfolioReducer,
    dashboard: dashboardReducer,
// export const store = configureStore({
//   reducer: {
//     watchlist: watchlistReducer,
//    portfolio: portfolioReducer,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;