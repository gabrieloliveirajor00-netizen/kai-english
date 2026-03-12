export type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({ message }: { message: Message }) {
  const isKai = message.role === "assistant";

  return (
    <div
      className={`flex items-end gap-2.5 ${isKai ? "justify-start" : "justify-end"}`}
    >
      {/* Kai avatar — shown only on Kai messages */}
      {isKai && (
        <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mb-0.5 shadow-md shadow-cyan-500/20">
          K
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-3 ${
          isKai
            ? "bg-[#1a2a2a] border border-cyan-900/30 rounded-tl-sm"
            : "bg-[#1e1a2e] border border-purple-900/30 rounded-br-sm"
        }`}
      >
        <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}
