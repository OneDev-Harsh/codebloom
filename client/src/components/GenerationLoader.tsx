import React, { useEffect, useState } from "react";

const STEPS = [
  "Analyzing your prompt",
  "Designing layout & structure",
  "Generating components",
  "Applying styles & interactions",
  "Finalizing preview",
];

const GenerationLoader = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0B0B10]">

      {/* BACKGROUND ENERGY */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px] animate-pulse" />
        <div className="absolute right-1/4 bottom-1/4 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[160px] animate-pulse delay-1000" />
      </div>

      <div className="flex flex-col items-center gap-8 text-center">

        {/* CORE ANIMATED ORB */}
        <div className="relative h-24 w-24">
          {/* outer pulse */}
          <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping" />

          {/* rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />

          {/* counter rotation */}
          <div className="absolute inset-3 rounded-full border border-indigo-400/40 border-b-transparent animate-spin [animation-direction:reverse] [animation-duration:3s]" />

          {/* glowing core */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-r from-[#CB52D4] to-indigo-600 blur-sm animate-pulse" />
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Generating your website
        </h2>

        {/* STEP TEXT */}
        <p
          key={step}
          className="text-sm text-slate-300 min-h-[1.25rem]
                     animate-[fadeSlide_0.6s_ease-out]"
        >
          {STEPS[step]}
        </p>

        {/* PROGRESS BAR */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all duration-700
                ${i <= step
                  ? "bg-gradient-to-r from-[#CB52D4] to-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                  : "bg-white/10"
                }`}
            />
          ))}
        </div>

        {/* SUBTEXT */}
        <p className="mt-2 text-xs text-slate-500 animate-pulse">
          This usually takes a few moments
        </p>
      </div>

      {/* KEYFRAMES */}
      <style>
        {`
          @keyframes fadeSlide {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default GenerationLoader;
 