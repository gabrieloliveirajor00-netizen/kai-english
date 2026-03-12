"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import MessageBubble, { type Message } from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const OPENING_MESSAGE =
  "e aí, tudo bem? sou o Kai. vou te ajudar a aprender inglês do jeito certo — sem aquele esquema chato de escola. mas primeiro quero te conhecer de verdade. qual é o seu nome?";

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
  const [errorDetail, setErrorDetail] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (status === "chatting") inputRef.current?.focus();
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
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error ?? "profile error");
        }
        router.push("/success");
      } catch (err: unknown) {
        console.error(err);
        setErrorDetail(err instanceof Error ? err.message : "profile error");
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
    setErrorDetail("");

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

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const withReply: Message[] = [
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ];
      setMessages(withReply);

      if (isLastTurn) {
        await new Promise((r) => setTimeout(r, 1200));
        await generateProfile(withReply);
      } else {
        setStatus("chatting");
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorDetail(err instanceof Error ? err.message : "unknown error");
      setStatus("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isDisabled = status !== "chatting" || userTurnCount >= MAX_USER_TURNS;

  return (
    <div className="flex flex-col h-dvh" style={{ background: "#07070f" }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-5 py-3.5 shrink-0"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{
            background: "linear-gradient(135deg, #22d3ee, #0e7490)",
            boxShadow: "0 0 16px rgba(6,182,212,0.4)",
          }}
        >
          K
        </div>

        <div className="flex-1">
          <p className="text-white font-semibold text-sm leading-none">Kai</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#4ade80" }}>
            online
          </p>
        </div>

        {/* Turn progress */}
        <div className="flex gap-1 items-center" title={`${userTurnCount}/${MAX_USER_TURNS}`}>
          {Array.from({ length: MAX_USER_TURNS }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: 6,
                height: 6,
                background: i < userTurnCount ? "#22d3ee" : "rgba(255,255,255,0.1)",
                boxShadow: i < userTurnCount ? "0 0 4px #22d3ee" : "none",
              }}
            />
          ))}
        </div>
      </header>

      {/* ── Messages ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-3 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {status === "loading" && <TypingIndicator />}

        {status === "saving" && (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)" }}
              >
                <svg className="animate-spin w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: "#94a3b8" }}>montando seu perfil...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex justify-center py-4">
            <div
              className="rounded-2xl px-5 py-4 text-center max-w-xs"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <p className="text-red-400 text-sm font-medium">algo deu errado</p>
              {errorDetail && (
                <p className="text-red-300/60 text-xs mt-1 font-mono">{errorDetail}</p>
              )}
              <button
                onClick={() => { setStatus("chatting"); setErrorDetail(""); }}
                className="mt-2 text-xs text-red-300 underline hover:text-red-200 transition-colors"
              >
                tenta de novo
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* ── Input ───────────────────────────────────────────────────── */}
      <footer
        className="px-4 sm:px-6 py-4 shrink-0"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder={isDisabled ? "" : "escreve aqui..."}
            className="flex-1 rounded-2xl px-5 py-3.5 text-[15px] text-white outline-none transition-all disabled:opacity-0"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1px solid rgba(6,182,212,0.5)";
              e.currentTarget.style.background = "rgba(255,255,255,0.09)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            }}
            autoComplete="off"
          />
          <button
            onClick={sendMessage}
            disabled={isDisabled || !input.trim()}
            aria-label="Enviar"
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #22d3ee, #0e7490)", boxShadow: input.trim() && !isDisabled ? "0 0 16px rgba(6,182,212,0.4)" : "none" }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
