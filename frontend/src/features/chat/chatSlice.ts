import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  insight: string | null;
  best: string | null;
  attention: string | null;
  status: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  insight: null,
  best: null,
  attention: null,
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
  },
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

        state.messages.push({
          role: "assistant",
          content: action.payload.reply,
        });

        const response = action.payload.reply;

        state.insight =
          response.match(/Insight:\s*([\s\S]*?)\n\s*Best:/)?.[1].trim() ?? null;

        state.best =
          response.match(/Best:\s*([\s\S]*?)\n\s*Attention:/)?.[1].trim() ??
          null;

        state.attention =
          response.match(/Attention:\s*([\s\S]*)/)?.[1].trim() ?? null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload as string;
      });
  },
});

export const { clearChat } = chatSlice.actions;
export default chatSlice.reducer;
