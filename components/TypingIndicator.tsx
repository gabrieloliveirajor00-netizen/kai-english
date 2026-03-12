export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* Kai avatar */}
      <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-cyan-500/20">
        K
      </div>

      {/* Bubble */}
      <div className="bg-[#1a2a2a] border border-cyan-900/30 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span
            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1.2s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "200ms", animationDuration: "1.2s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "400ms", animationDuration: "1.2s" }}
          />
        </div>
      </div>
    </div>
  );
}
