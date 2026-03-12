"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import MessageBubble, { type Message } from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const OPENING_MESSAGE =
  "e aí, tudo bem? sou o Kai. vou te ajudar a aprender inglês do jeito certo — sem aquele esquema chato de escola. mas primeiro quero te conhecer de verdade. qual é o seu nome?";

/** Number of user turns before triggering profile generation */
const MAX_USER_TURNS = 13;

type Status = "chatting" | "loading" | "saving" | "error";

export default function ChatInterface() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: OPENING_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("chatting");
  const [userTurnCount, setUserTurnCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Auto-focus input after Kai responds
  useEffect(() => {
    if (status === "chatting") {
      inputRef.current?.focus();
    }
  }, [status]);

  const generateProfile = useCallback(
    async (finalMessages: Message[]) => {
      setStatus("saving");
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: finalMessages }),
        });
        if (!res.ok) throw new Error("Profile API returned error");
        router.push("/success");
      } catch (err) {
        console.error("generateProfile error:", err);
        setStatus("error");
      }
    },
    [router]
  );

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || status !== "chatting") return;

    const newTurnCount = userTurnCount + 1;
    const isLastTurn = newTurnCount >= MAX_USER_TURNS;

    setInput("");
    setUserTurnCount(newTurnCount);

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(updatedMessages);
    setStatus("loading");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, isLastTurn }),
      });

      if (!res.ok) throw new Error("Chat API returned error");

      const data = await res.json();
      const withReply: Message[] = [
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ];
      setMessages(withReply);

      if (isLastTurn) {
        // Small pause so the user can read Kai's closing message
        await new Promise((r) => setTimeout(r, 1200));
        await generateProfile(withReply);
      } else {
        setStatus("chatting");
      }
    } catch (err) {
      console.error("sendMessage error:", err);
      setStatus("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isDisabled =
    status !== "chatting" || userTurnCount >= MAX_USER_TURNS;

  return (
    <div className="flex flex-col h-dvh bg-[#0a0a12]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#0f0f1a] border-b border-white/[0.06] shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-cyan-500/20">
          K
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">Kai</p>
          <p className="text-gray-500 text-xs mt-0.5">parceiro de inglês</p>
        </div>

        {/* Turn progress dots */}
        <div className="ml-auto flex gap-1 items-center">
          {Array.from({ length: MAX_USER_TURNS }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${
                i < userTurnCount ? "bg-cyan-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </header>

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 pt-5 pb-2 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {status === "loading" && <TypingIndicator />}

        {status === "saving" && (
          <div className="flex justify-center py-6">
            <div className="flex items-center gap-2.5 text-gray-400 text-sm">
              <svg
                className="animate-spin w-4 h-4 text-cyan-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              criando seu perfil...
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex justify-center py-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
              <p className="text-red-400 text-sm">algo deu errado</p>
              <button
                onClick={() => setStatus("chatting")}
                className="text-red-300 text-xs underline mt-1 hover:text-red-200"
              >
                tenta de novo
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* ── Input ──────────────────────────────────────────────────────── */}
      <footer className="px-4 py-4 bg-[#0f0f1a] border-t border-white/[0.06] shrink-0">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder={isDisabled ? "" : "escreva aqui..."}
            className="flex-1 bg-white/[0.05] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-0 placeholder-gray-600 transition-all"
            autoComplete="off"
          />
          <button
            onClick={sendMessage}
            disabled={isDisabled || !input.trim()}
            className="w-12 h-12 bg-cyan-500 hover:bg-cyan-400 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center justify-center shrink-0"
            aria-label="Enviar mensagem"
          >
            {/* Send icon */}
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
