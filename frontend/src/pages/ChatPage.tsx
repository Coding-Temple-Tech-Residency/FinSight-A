import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearChat, sendMessage } from "../features/chat/chatSlice";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { messages, status, error } = useAppSelector((state) => state.chat);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "loading") return;
    setInput("");
    dispatch(sendMessage(text));
  }

  return (
    <div
      style={{
        maxWidth: 680,
        margin: "2rem auto",
        padding: "0 1rem",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 6rem)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>FinSight AI</h1>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearChat())}
            style={{ fontSize: "0.85rem", padding: "0.25rem 0.75rem" }}
          >
            Clear
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          padding: "0.5rem 0",
        }}
      >
        {messages.length === 0 && status !== "loading" && (
          <p style={{ color: "#888", textAlign: "center", marginTop: "2rem" }}>
            Ask me anything about your investments.
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              padding: "0.6rem 1rem",
              borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
              background: msg.role === "user" ? "#2563eb" : "#e5e7eb",
              color: msg.role === "user" ? "#fff" : "#111",
              fontSize: "0.95rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {msg.content}
          </div>
        ))}

        {status === "loading" && (
          <div
            style={{
              alignSelf: "flex-start",
              padding: "0.6rem 1rem",
              borderRadius: "1rem 1rem 1rem 0.25rem",
              background: "#e5e7eb",
              color: "#555",
              fontSize: "0.9rem",
            }}
          >
            Thinking…
          </div>
        )}

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.5rem", paddingTop: "0.75rem" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a finance question…"
          disabled={status === "loading"}
          style={{ flex: 1, padding: "0.5rem 0.875rem", fontSize: "1rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
        />
        <button
          type="submit"
          disabled={!input.trim() || status === "loading"}
          style={{ padding: "0.5rem 1.25rem", fontSize: "1rem", borderRadius: "0.5rem" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
