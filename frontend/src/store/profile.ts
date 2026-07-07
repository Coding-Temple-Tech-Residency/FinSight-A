// FinSight-A/frontend/src/store/profile.ts

import { Profile } from "../types/profile";

/********************************** ACTION TYPES *********************************/

const LOAD_PROFILE = "profile/loadProfile";
const CREATE_PROFILE = "profile/createProfile";
const UPDATE_PROFILE = "profile/updateProfile";
const DELETE_PROFILE = "profile/deleteProfile";

/********************************** ACTION CREATORS ******************************/

const loadProfile = (profile: Profile) => ({
  type: LOAD_PROFILE,
  payload: profile,
});

const createProfile = (profile: Profile) => ({
  type: CREATE_PROFILE,
  payload: profile,
});

const updateProfile = (profile: Profile) => ({
  type: UPDATE_PROFILE,
  payload: profile,
});

const deleteProfile = () => ({
  type: DELETE_PROFILE,
});

/********************************** THUNK ACTIONS ********************************/

// Get Profile
export const getProfile = () => async (dispatch: any) => {
  try {
    const res = await fetch("/api/profile");

    if (!res.ok) throw Error("Failed to get profile");

    const data = await res.json();

    dispatch(loadProfile(data));
  } catch (e) {
    console.error("Error loading profile", e);
  }
};

// Create Profile
export const createUserProfile =
  (profileData: Profile) => async (dispatch: any) => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw Error("Failed to create profile");

      const data = await res.json();

      dispatch(createProfile(data));

      return data;
    } catch (e) {
      console.error("Error creating profile", e);
    }
  };

// Update Profile
export const editProfile =
  (profileData: Profile) => async (dispatch: any) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw Error("Failed to update profile");

      const data = await res.json();

      dispatch(updateProfile(data));

      return data;
    } catch (e) {
      console.error("Error updating profile", e);
    }
  };

// Delete Profile
export const removeProfile = () => async (dispatch: any) => {
  try {
    const res = await fetch("/api/profile", {
      method: "DELETE",
    });

    if (!res.ok) throw Error("Failed to delete profile");

    dispatch(deleteProfile());
  } catch (e) {
    console.error("Error deleting profile", e);
  }
};

/********************************** INITIAL STATE AND REDUCER ********************/

const initialState = {
  profile: null,
};

const profileReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case LOAD_PROFILE:
    case CREATE_PROFILE:
    case UPDATE_PROFILE:
      return {
        ...state,
        profile: action.payload,
      };

    case DELETE_PROFILE:
      return {
        ...state,
        profile: null,
      };

    default:
      return state;
  }
};

export default profileReducer;