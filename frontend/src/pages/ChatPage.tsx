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
      className="mx-auto mt-8 flex h-[calc(100vh-6rem)] max-w-3xl flex-col px-4"
    >
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">FinSight AI</h1>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearChat())}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium transition hover:bg-slate-100"
          >
            Clear
          </button>
        )}
      </div>

      <div
       className="flex flex-1 flex-col gap-3 overflow-y-auto py-2"
      >
        {messages.length === 0 && status !== "loading" && (
          <p className="mt-8 text-center text-slate-500">
            Ask me anything about your investments.
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            msg.role === 'user'
            ? "self-end rounded-br-md bg-indigo-600 text-white"
            : "self-start rounded-bl-md bg-slate-200 text-slate-900"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {status === "loading" && (
          <div
            className="self-start rounded-2xl rounded-bl-md bg-slate-200 px-4 py-3 text-sm text-slate-500"
          >
            Thinking…
          </div>
        )}

        {error && <p className="text-center text-red-500">{error}</p>}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-slate-200 pt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a finance question…"
          disabled={status === "loading"}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || status === "loading"}
          className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
