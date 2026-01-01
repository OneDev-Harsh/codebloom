import { useLocation } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"

export default function AuthPage() {
  const { pathname } = useLocation()

  return (
    <main className="relative min-h-screen w-full bg-[#0B0B10] flex items-center justify-center overflow-hidden">
      
      {/* BACKGROUND BLOOMS */}
      <div className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-240px] right-[-200px] h-[460px] w-[460px] rounded-full bg-[#CB52D4]/20 blur-[120px]" />

      {/* AUTH CARD */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-slate-800 bg-black/70 backdrop-blur-xl shadow-[0_25px_80px_-30px_rgba(0,0,0,0.95)] px-6 py-8 sm:px-8">
          
          {/* BRAND HEADER */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#CB52D4] to-indigo-400 bg-clip-text text-transparent">
                CodeBloom
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to build and publish websites with AI
            </p>
          </div>

          {/* AUTH VIEW */}
          <AuthView
            pathname={pathname}
            classNames={{
              base: "text-white",
              header: "hidden",
              form: "space-y-4",
              input:
                "bg-white/5 border border-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              button:
                "bg-gradient-to-r from-[#CB52D4] to-indigo-600 hover:opacity-90 transition text-white font-medium",
              link:
                "text-indigo-400 hover:text-indigo-300 transition",
              divider:
                "border-slate-800 text-slate-500",
              error:
                "text-red-400 text-sm",
            }}
          />
        </div>

        {/* FOOTER */}
        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, you agree to CodeBloom’s{" "}
          <span className="text-slate-300">Terms</span> &{" "}
          <span className="text-slate-300">Privacy Policy</span>.
        </p>
      </div>
    </main>
  )
}
