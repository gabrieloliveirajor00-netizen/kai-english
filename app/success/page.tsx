export default function SuccessPage() {
  return (
    <div className="min-h-dvh bg-[#0a0a12] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-10">
        {/* Kai avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-cyan-500/25">
              K
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full ring-2 ring-cyan-400/20 ring-offset-4 ring-offset-[#0a0a12]" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-white text-xl font-semibold tracking-tight">
            perfil criado
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            montei seu plano de aprendizado personalizado.
            <br />
            vamos começar do jeito certo.
          </p>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 pt-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <div className="w-2 h-2 rounded-full bg-cyan-500/40" />
          <div className="w-2 h-2 rounded-full bg-cyan-500/15" />
        </div>
      </div>
    </div>
  );
}
