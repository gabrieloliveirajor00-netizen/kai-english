export default function SuccessPage() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-6"
      style={{ background: "#07070f" }}
    >
      <div className="max-w-sm w-full text-center space-y-8">

        {/* Avatar with glow */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{
                background: "linear-gradient(135deg, #22d3ee, #0e7490)",
                boxShadow: "0 0 40px rgba(6,182,212,0.45)",
              }}
            >
              K
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "rgba(6,182,212,0.15)", animationDuration: "2.5s" }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-white text-2xl font-semibold tracking-tight">
            perfil criado
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            montei seu plano personalizado com base<br />
            no que você me contou. vamos nessa.
          </p>
        </div>

        {/* Checkmark badge */}
        <div className="flex justify-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
