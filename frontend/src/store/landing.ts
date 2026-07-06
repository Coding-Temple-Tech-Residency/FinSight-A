//FinSight-A/frontend/src/store/landing.ts

import { LandingData } from "../types/landing";

/********************************** ACTION TYPES *********************************/

const LOAD_LANDING = "landing/loadlanding";

/********************************** ACTION CREATORS ******************************/

const load_landing = (landingData: LandingData) => ({
  type: LOAD_LANDING,
  payload: landingData,
});

/********************************** THUNK ACTIONS ********************************/

export const getLanding = () => async (dispatch: any) => {
  try {

    //Mock data remove once backend is connected

    // const data = {
    //   trendingStocks:  ["AAPL", "TSLA", "NVDA"],
    //   trendingPerformance: [1.2, -0.5, 2.8],
    //   aiInsight: "Market is showing mixed momentum in tech sector.",
    //   trendingHighlights: ["AI rally continues", "Fed uncertaintiy remains"],
    // };

    const res = await fetch("/api/v1/landing");

    if (!res.ok) throw Error("Failed to get landing data");

    const data = await res.json();

    dispatch(load_landing(data));
  } catch (e) {
    console.error("Error loading landing page", e);
  } {/*finally {
    dispatch(getLanding());
  } */}
};

/********************************** INITIAL STATE AND REDUCER ********************/

const initialState = {
  trendingStocks: [],
  trendingPerformance: [],
  aiInsight: null,
  trendingHighlights: [],
};

const landingReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case LOAD_LANDING:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

export default landingReducer;