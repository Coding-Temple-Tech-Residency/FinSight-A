import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`;

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  theme: "light" | "dark" | "system";
  is_day_trader: boolean;
  ai_refresh_interval_seconds: number;
}

export interface ProfileUpdate {
  theme?: "light" | "dark" | "system";
  is_day_trader?: boolean;
  ai_refresh_interval_seconds?: number;
}

interface ProfileState {
  profile: UserProfile | null;
  status: "idle" | "loading" | "saving" | "failed";
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  status: "idle",
  error: null,
};

export const fetchProfile = createAsyncThunk("profile/fetch", async () => {
  const res = await fetch(`${API}/profile`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load profile");
  return (await res.json()) as UserProfile;
});

export const saveProfile = createAsyncThunk(
  "profile/save",
  async (update: ProfileUpdate) => {
    const res = await fetch(`${API}/profile`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error("Failed to save profile");
    return (await res.json()) as UserProfile;
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "idle";
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error";
      })
      .addCase(saveProfile.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.status = "idle";
        state.profile = action.payload;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error";
      });
  },
});

export default profileSlice.reducer;
