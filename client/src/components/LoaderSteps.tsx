import React, { useEffect, useState } from 'react'
import { Sparkles, Code2, Layout, Rocket } from 'lucide-react'

const steps = [
  {
    id: 1,
    title: 'Understanding your idea',
    subtitle: 'Analyzing prompt & intent',
    icon: Sparkles
  },
  {
    id: 2,
    title: 'Designing layout',
    subtitle: 'Structuring sections & UI',
    icon: Layout
  },
  {
    id: 3,
    title: 'Generating code',
    subtitle: 'Writing clean, scalable code',
    icon: Code2
  },
  {
    id: 4,
    title: 'Finalizing website',
    subtitle: 'Optimizing & preparing preview',
    icon: Rocket
  }
]

const LoaderSteps = () => {
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length) return prev + 1
        return prev
      })
    }, 1800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white px-4">
      
      {/* GLOW ORB */}
      <div className="relative mb-10">
        <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-3xl animate-pulse" />
        <div className="relative flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-[#CB52D4] to-indigo-600 shadow-xl">
          {React.createElement(
            steps[Math.min(currentStep - 1, steps.length - 1)].icon,
            { size: 34 }
          )}
        </div>
      </div>

      {/* TITLE */}
      <h2 className="text-xl font-semibold tracking-tight">
        Generating your website
      </h2>
      <p className="text-sm text-slate-400 mt-1">
        This usually takes a few seconds
      </p>

      {/* STEPS */}
      <div className="mt-10 w-full max-w-md space-y-4">
        {steps.map((step) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep

          return (
            <div
              key={step.id}
              className={`
                relative overflow-hidden rounded-xl border px-4 py-3
                transition-all duration-500
                ${
                  isActive
                    ? 'border-indigo-500/60 bg-indigo-500/10'
                    : isCompleted
                    ? 'border-slate-800 bg-white/5 opacity-80'
                    : 'border-slate-800 bg-black/30 opacity-40'
                }
              `}
            >
              {/* ACTIVE SHIMMER */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              )}

              <div className="relative flex items-center gap-3">
                <div
                  className={`
                    flex size-9 items-center justify-center rounded-lg
                    ${
                      isCompleted
                        ? 'bg-indigo-500 text-white'
                        : isActive
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-white/5 text-slate-500'
                    }
                  `}
                >
                  <step.icon size={18} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-slate-400">
                    {step.subtitle}
                  </p>
                </div>

                {/* DOT */}
                {isActive && (
                  <span className="flex size-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LoaderSteps
