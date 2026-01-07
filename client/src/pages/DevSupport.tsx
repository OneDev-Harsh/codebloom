import { Heart, Sparkles, Coffee, ShieldCheck } from "lucide-react"

const DevSupport = () => {
  return (
    <main className="relative overflow-hidden text-white">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-1/4 h-[500px] w-[500px] rounded-full bg-pink-500/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-24">

        {/* HEADER */}
        <header className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs text-pink-300 mb-6">
            <Heart size={14} />
            Support the Developer
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Help Keep <span className="bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">CodeBloom</span> Growing
          </h1>

          <p className="mt-6 text-slate-300 text-base leading-relaxed">
            CodeBloom is built with care, late nights, and a deep love for
            empowering creators. If this project helped you, inspired you, or
            saved you time, your support means more than you think.
          </p>
        </header>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT – MESSAGE */}
          <div className="space-y-8">

            <div className="rounded-2xl border border-slate-800 bg-white/5 p-6 backdrop-blur">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Sparkles className="text-indigo-400" size={18} />
                Why your support matters
              </h2>

              <ul className="space-y-3 text-sm text-slate-300">
                <li>• Keeps CodeBloom improving</li>
                <li>• Helps cover infrastructure & AI costs</li>
                <li>• Supports long-term development</li>
                <li>• Motivates independent creators</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-white/5 p-6 backdrop-blur">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Coffee className="text-pink-400" size={18} />
                Even small contributions help
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Whether it’s the cost of a coffee or something more - every bit
                directly fuels development. There are no investors here, just
                passion and persistence.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} />
              Secure UPI payments • No data stored
            </div>
          </div>

          {/* RIGHT – QR CARD */}
          <div className="flex justify-center">
            <div
              className="
                relative
                w-full max-w-sm
                rounded-3xl
                border border-indigo-500/30
                bg-gradient-to-b from-white/[0.08] to-white/[0.02]
                p-8
                backdrop-blur-xl
                shadow-[0_30px_80px_-25px_rgba(99,102,241,0.6)]
              "
            >
              {/* GLOW */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-500/30 to-indigo-500/30 blur opacity-60" />

              <div className="relative">

                <h3 className="text-center text-lg font-semibold mb-2">
                  Scan to Support
                </h3>

                <p className="text-center text-xs text-slate-400 mb-6">
                  Pay via UPI (Google Pay, PhonePe, Paytm, etc.)
                </p>

                {/* QR PLACEHOLDER */}
                <div className="flex justify-center mb-6">
                  <div className="h-56 w-56 rounded-xl bg-black/40 border border-slate-700 flex items-center justify-center text-slate-500 text-sm">
                    {/* Replace src with your actual QR */}
                    <img
                      src="/upi-qr.png"
                      alt="UPI QR Code"
                      className="h-full w-full object-contain rounded-xl"
                    />
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400">
                  UPI ID: <span className="text-slate-200">8100393516@ptyes</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* FOOT NOTE */}
        <footer className="mt-24 text-center text-sm text-slate-400">
          Thank you for being part of the CodeBloom journey 💕
        </footer>

      </div>
    </main>
  )
}

export default DevSupport
