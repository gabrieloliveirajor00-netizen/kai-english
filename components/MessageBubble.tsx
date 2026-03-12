export type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({ message }: { message: Message }) {
  const isKai = message.role === "assistant";

  return (
    <div className={`flex items-end gap-2.5 ${isKai ? "justify-start" : "justify-end"}`}>
      {/* Kai avatar */}
      {isKai && (
        <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-lg bg-gradient-to-br from-cyan-400 to-teal-600" style={{ boxShadow: "0 0 12px rgba(6,182,212,0.35)" }}>
          K
        </div>
      )}

      {/* Bubble */}
      <div
        className={`
          relative rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap break-words
          ${isKai
            ? "max-w-[76%] md:max-w-[60%] text-gray-100 rounded-tl-none"
            : "max-w-[68%] md:max-w-[52%] text-white rounded-br-none"
          }
        `}
        style={isKai
          ? { background: "linear-gradient(135deg, #182a2a 0%, #1a2e2e 100%)", border: "1px solid rgba(6,182,212,0.15)" }
          : { background: "linear-gradient(135deg, #2e1d5e 0%, #3d2478 100%)", border: "1px solid rgba(139,92,246,0.25)" }
        }
      >
        {message.content}
      </div>
    </div>
  );
}
