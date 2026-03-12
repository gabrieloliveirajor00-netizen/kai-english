export default function SuccessPage() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-6"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 50% 0%, rgba(6,182,212,0.14) 0%, transparent 65%),
          radial-gradient(ellipse 40% 30% at 50% 100%, rgba(139,92,246,0.08) 0%, transparent 60%),
          #07070f
        `,
      }}
    >
      <div className="max-w-xs w-full text-center flex flex-col items-center gap-9">

        {/* Avatar with glow rings */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-28 h-28 rounded-full animate-ping"
            style={{ background: "rgba(6,182,212,0.06)", animationDuration: "3s" }}
          />
          <div
            className="absolute w-20 h-20 rounded-full"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(34,211,238,0.15)" }}
          />
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black select-none"
            style={{
              background: "linear-gradient(145deg, #22d3ee 0%, #0891b2 60%, #0e7490 100%)",
              boxShadow: "0 0 0 2px rgba(34,211,238,0.3), 0 0 32px rgba(6,182,212,0.5)",
              letterSpacing: "0.05em",
            }}
          >
            K
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2.5">
          <h1 className="text-white text-2xl font-bold tracking-tight">
            tá pronto
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
            montei seu plano com base em tudo<br />que você me contou. vamos nessa.
          </p>
        </div>

        {/* Check badge */}
        <div
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(52,211,153,0.15)" }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-emerald-400 text-sm font-medium">perfil salvo com sucesso</p>
        </div>

      </div>
    </div>
  );
}
