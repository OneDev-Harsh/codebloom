const Footer = () => {
  return (
    <footer className="relative w-full bg-black border-t border-slate-800 text-white">
      {/* SOFT TOP GLOW */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16 flex flex-col items-center text-center">
        {/* LOGO */}
        <div className="flex items-center gap-2 mb-6">
          <img
            src="/favicon.svg"
            alt="CodeBloom logo"
            className="h-8"
          />
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-white">Code</span>
            <span className="bg-gradient-to-r from-[#CB52D4] to-indigo-500 bg-clip-text text-transparent">
              Bloom
            </span>
          </span>
        </div>

        {/* TAGLINE */}
        <p className="max-w-xl text-sm text-slate-400 leading-relaxed">
          Build, customize, and launch websites faster using intelligent AI
          design. CodeBloom helps you turn ideas into real products.
        </p>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} CodeBloom. All rights reserved.</span>

          <div className="mt-3 sm:mt-0 flex gap-4">
            <a href="/privacy" className="hover:text-white transition">
              Privacy
            </a>
            <a href="/terms" className="hover:text-white transition">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
