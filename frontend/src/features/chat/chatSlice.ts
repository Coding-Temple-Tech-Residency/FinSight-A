import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  status: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  status: "idle",
  error: null,
};

export const sendMessage = createAsyncThunk(
  "chat/send",
  async (message: string, { rejectWithValue }) => {
    const res = await fetch(`${API}/ai/chat`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) return rejectWithValue("Failed to get a response.");
    const data = await res.json();
    return { userMessage: message, reply: data.reply as string };
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChat(state) {
      state.messages = [];
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.messages.push({ role: "user", content: action.meta.arg });
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = "idle";
        state.messages.push({ role: "assistant", content: action.payload.reply });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload as string;
      });
  },
});

export const { clearChat } = chatSlice.actions;
export default chatSlice.reducer;
