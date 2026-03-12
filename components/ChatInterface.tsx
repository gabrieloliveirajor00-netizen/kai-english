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
  const [inputFocused, setInputFocused] = useState(false);

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
        setErrorDetail(err instanceof Error ? err.message : "erro desconhecido");
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
        await new Promise((r) => setTimeout(r, 1400));
        await generateProfile(withReply);
      } else {
        setStatus("chatting");
      }
    } catch (err: unknown) {
      setErrorDetail(err instanceof Error ? err.message : "erro desconhecido");
      setStatus("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = status === "chatting" && userTurnCount < MAX_USER_TURNS;
  const progress = userTurnCount / MAX_USER_TURNS;

  return (
    <div
      className="flex flex-col h-dvh"
      style={{
        background: `
          radial-gradient(ellipse 80% 35% at 50% -2%, rgba(6,182,212,0.13) 0%, transparent 70%),
          radial-gradient(ellipse 50% 20% at 20% 100%, rgba(139,92,246,0.07) 0%, transparent 60%),
          #07070f
        `,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3.5 px-5 py-3.5 shrink-0"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shrink-0 select-none"
          style={{
            background: "linear-gradient(145deg, #22d3ee 0%, #0891b2 60%, #0e7490 100%)",
            boxShadow: "0 0 0 2px rgba(34,211,238,0.2), 0 0 20px rgba(6,182,212,0.35)",
            letterSpacing: "0.05em",
          }}
        >
          K
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-none tracking-tight">Kai</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 4px #34d399" }} />
            <p className="text-[11px] text-emerald-400">online</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col items-end gap-1.5">
          <p className="text-[10px] text-white/20 font-mono">{userTurnCount}/{MAX_USER_TURNS}</p>
          <div className="w-28 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, #06b6d4, #8b5cf6)",
                boxShadow: "0 0 6px rgba(6,182,212,0.5)",
              }}
            />
          </div>
        </div>
      </header>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 pt-7 pb-4 space-y-5">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {status === "loading" && <TypingIndicator />}

        {status === "saving" && (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-4">
              {/* Animated rings */}
              <div className="relative w-14 h-14">
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "rgba(6,182,212,0.12)", animationDuration: "1.5s" }}
                />
                <div
                  className="absolute inset-1 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(34,211,238,0.3)" }}
                >
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="3" />
                    <path className="opacity-80" fill="#22d3ee" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-white/40 tracking-wide">montando seu perfil...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex justify-center py-4">
            <div
              className="rounded-2xl px-5 py-4 text-center max-w-sm"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.18)",
              }}
            >
              <p className="text-red-400 text-sm font-medium">algo deu errado</p>
              {errorDetail && (
                <p className="text-red-300/50 text-[11px] mt-1.5 font-mono leading-relaxed">{errorDetail}</p>
              )}
              <button
                onClick={() => { setStatus("chatting"); setErrorDetail(""); }}
                className="mt-3 text-xs text-red-300/70 hover:text-red-200 underline underline-offset-2 transition-colors"
              >
                tenta de novo
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <footer
        className="px-4 sm:px-8 py-5 shrink-0"
        style={{
          background: "linear-gradient(to top, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.7) 100%)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          className="flex gap-2.5 max-w-2xl mx-auto rounded-2xl p-2 transition-all duration-200"
          style={{
            background: inputFocused
              ? "rgba(34,211,238,0.06)"
              : "rgba(255,255,255,0.05)",
            border: inputFocused
              ? "1px solid rgba(34,211,238,0.35)"
              : "1px solid rgba(255,255,255,0.08)",
            boxShadow: inputFocused
              ? "0 0 0 3px rgba(34,211,238,0.08), 0 8px 32px rgba(0,0,0,0.3)"
              : "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            disabled={!canSend}
            placeholder={canSend ? "escreve aqui..." : ""}
            className="flex-1 bg-transparent text-white text-[15px] outline-none px-2 py-1.5 disabled:opacity-0"
            autoComplete="off"
            autoCorrect="off"
          />
          <button
            onClick={sendMessage}
            disabled={!canSend || !input.trim()}
            aria-label="Enviar"
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90"
            style={canSend && input.trim() ? {
              background: "linear-gradient(135deg, #22d3ee, #0891b2)",
              boxShadow: "0 0 16px rgba(6,182,212,0.45)",
            } : {
              background: "rgba(255,255,255,0.06)",
              opacity: 0.4,
              cursor: "not-allowed",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
