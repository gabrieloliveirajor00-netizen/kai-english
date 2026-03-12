export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 justify-start animate-msg-left">
      <div
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-black"
        style={{
          background: "linear-gradient(145deg, #22d3ee 0%, #0891b2 100%)",
          boxShadow: "0 0 0 1px rgba(34,211,238,0.3), 0 4px 16px rgba(6,182,212,0.4)",
        }}
      >
        K
      </div>
      <div
        className="px-5 py-4 rounded-2xl"
        style={{
          background: "linear-gradient(160deg, rgba(8,47,63,0.9) 0%, rgba(7,40,54,0.95) 100%)",
          border: "1px solid rgba(34,211,238,0.18)",
          borderTopLeftRadius: 4,
        }}
      >
        <div className="flex gap-1.5 items-center">
          {[0, 180, 360].map((delay) => (
            <span
              key={delay}
              className="block rounded-full animate-bounce"
              style={{
                width: 5, height: 5,
                background: "#22d3ee",
                animationDelay: `${delay}ms`,
                animationDuration: "1.1s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
