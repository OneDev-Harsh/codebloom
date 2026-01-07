import React, { useState } from "react"
import { appPlans } from "../assets/assets"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { XIcon } from "lucide-react"
import confetti from "canvas-confetti"


interface Plan {
  id: string
  name: string
  price: string
  credits: number
  description: string
  features: string[]
  popular?: boolean
}

const Pricing = () => {

  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366F1", "#CB52D4", "#A855F7", "#FFFFFF"],
    })
  }

  const [plans] = useState<Plan[]>(appPlans)
  const { data: session } = authClient.useSession()

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const handlePurchase = (planId: string) => {
    if (!session?.user) {
      toast.error("Please sign in to purchase credits")
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (!plan) {
      toast.error("Invalid plan selected")
      return
    }

    setSelectedPlan(plan)
  }

  return (
    <>
      {/* PRICING PAGE */}
      <section className="px-4 md:px-16 lg:px-24 xl:px-32 py-20 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-semibold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Pick a plan that fits your workflow. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`
                relative rounded-2xl border p-6
                bg-gradient-to-b from-white/[0.06] to-white/[0.02]
                transition-all duration-300
                hover:-translate-y-2
                hover:shadow-[0_20px_60px_-25px_rgba(99,102,241,0.6)]
                ${
                  plan.popular
                    ? "border-indigo-500/60 ring-1 ring-indigo-500/30 scale-[1.02]"
                    : "border-slate-800 hover:border-indigo-500/50"
                }
              `}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full
                  bg-gradient-to-r from-[#CB52D4] to-indigo-600
                  px-3 py-1 text-xs font-medium">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-semibold">{plan.name}</h3>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-sm text-slate-400">
                  / {plan.credits} credits
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-400">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                      ✓
                    </span>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan.id)}
                className={`
                  mt-8 w-full rounded-md px-4 py-2.5 text-sm font-medium transition
                  active:scale-95
                  ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#CB52D4] to-indigo-600 hover:opacity-90"
                      : "bg-white/10 hover:bg-white/20"
                  }
                `}
              >
                Get started
              </button>
            </div>
          ))}
        </div>

        <p className="mt-16 text-center text-sm text-slate-500 max-w-2xl mx-auto">
          Each project creation consumes{" "}
          <span className="text-slate-300 font-medium">5 credits</span>. 
          Each project revision consumes <span className="text-slate-300 font-medium">2 credits</span>.
        </p>
      </section>

      {/* PAYMENT MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="relative w-full max-w-md rounded-2xl border border-indigo-500/30
                          bg-[#0B0B10] p-6 shadow-[0_30px_80px_-20px_rgba(99,102,241,0.6)]
                          animate-in fade-in">

            {/* CLOSE */}
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <XIcon size={18} />
            </button>

            {/* HEADER */}
            <h3 className="text-xl font-semibold tracking-tight">
              Complete your purchase
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Scan the QR code to pay
            </p>

            {/* PLAN INFO */}
            <div className="mt-5 rounded-xl border border-slate-800 bg-white/5 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-400">Credits</span>
                <span>{selectedPlan.credits}</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>₹{selectedPlan.price}</span>
              </div>
            </div>

            {/* QR PLACEHOLDER */}
            <div className="mt-6 flex flex-col items-center">
              <div className="h-48 w-48 rounded-xl border border-indigo-500/40
                              bg-white flex items-center justify-center">
                <span className="text-xs text-slate-500 text-center px-4">
                  <img
                      src="/upi-qr.png"
                      alt="UPI QR Code"
                      className="h-full w-full object-contain rounded-xl"
                    />
                </span>
              </div>

              {/* IMPORTANT NOTE */}
              <div
                className="
                  mt-6 w-full rounded-xl
                  border border-indigo-500/40
                  bg-indigo-500/10
                  p-4 text-center
                  shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)]
                  animate-pulse-subtle
                "
              >
                <p className="text-sm font-medium text-indigo-300">
                  Important
                </p>

                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  After completing the payment, please send a message from your
                  <span className="mx-1 font-semibold text-white">
                    registered email address
                  </span>
                  with the payment confirmation.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  This helps us verify your payment faster and credit your account without delay.
                </p>
              </div>
            </div>

            {/* FOOT */}
            <button
              onClick={() => {
                fireConfetti()

                toast.success(
                  "Payment noted 🎉 Credits will be added to your account as soon as possible.",
                  {
                    description:
                      "Please ensure you’ve messaged us from your registered email with the payment confirmation.",
                    duration: 6000,
                  }
                )

                setSelectedPlan(null)
              }}
              className="
                mt-6 w-full
                rounded-md
                bg-gradient-to-r from-indigo-600 to-[#CB52D4]
                py-2.5
                text-sm font-medium
                text-white
                shadow-[0_10px_35px_-12px_rgba(99,102,241,0.9)]
                hover:opacity-90
                active:scale-[0.98]
                transition
              "
            >
              I’ve completed the payment
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Pricing
