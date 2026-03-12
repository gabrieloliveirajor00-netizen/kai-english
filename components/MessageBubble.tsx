export type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({ message }: { message: Message }) {
  const isKai = message.role === "assistant";

  return (
    <div className={`flex items-end gap-2.5 ${isKai ? "justify-start animate-msg-left" : "justify-end animate-msg-right"}`}>

      {/* Kai avatar */}
      {isKai && (
        <div
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-black select-none"
          style={{
            background: "linear-gradient(145deg, #22d3ee 0%, #0891b2 100%)",
            boxShadow: "0 0 0 1px rgba(34,211,238,0.3), 0 4px 16px rgba(6,182,212,0.4)",
            letterSpacing: "0.05em",
          }}
        >
          K
        </div>
      )}

      {/* Bubble */}
      <div
        className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
        style={isKai ? {
          maxWidth: "min(72%, 520px)",
          background: "linear-gradient(160deg, rgba(8,47,63,0.9) 0%, rgba(7,40,54,0.95) 100%)",
          border: "1px solid rgba(34,211,238,0.18)",
          boxShadow: "0 2px 16px rgba(6,182,212,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          borderTopLeftRadius: 4,
          color: "#e2e8f0",
        } : {
          maxWidth: "min(65%, 440px)",
          background: "linear-gradient(160deg, rgba(76,29,149,0.9) 0%, rgba(91,33,182,0.95) 100%)",
          border: "1px solid rgba(167,139,250,0.22)",
          boxShadow: "0 2px 16px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
          borderBottomRightRadius: 4,
          color: "#ede9fe",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
