export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 justify-start">
      {/* Kai avatar */}
      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-cyan-400 to-teal-600" style={{ boxShadow: "0 0 12px rgba(6,182,212,0.35)" }}>
        K
      </div>

      {/* Typing bubble */}
      <div
        className="rounded-2xl rounded-tl-none px-5 py-4"
        style={{ background: "linear-gradient(135deg, #182a2a 0%, #1a2e2e 100%)", border: "1px solid rgba(6,182,212,0.15)" }}
      >
        <div className="flex gap-1.5 items-center">
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: `${delay}ms`, animationDuration: "1.1s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
