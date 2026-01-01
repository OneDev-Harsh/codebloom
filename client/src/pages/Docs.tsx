import {
  Sparkles,
  Layers,
  MonitorSmartphone,
  Rocket,
  CreditCard,
  Settings,
} from "lucide-react"

const Docs = () => {
  return (
    <main className="relative mx-auto max-w-6xl px-6 py-20 text-slate-300">

      {/* HEADER */}
      <header className="mb-16 text-center">

        <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
          CodeBloom Docs
        </h1>

        <p className="mt-4 text-sm text-slate-400 max-w-2xl mx-auto">
          Learn how to create, edit, and publish AI-powered websites using
          CodeBloom — from first prompt to production.
        </p>
      </header>

      {/* CONTENT GRID */}
      <div className="grid gap-10">

        {/* CARD */}
        <DocCard
          icon={<Sparkles />}
          title="Getting Started"
        >
          <p>
            CodeBloom lets you turn natural language into fully working websites.
          </p>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-slate-300">
            <li>Sign in or create an account</li>
            <li>Enter a website prompt</li>
            <li>Generate your project (credits required)</li>
            <li>Edit visually or with AI</li>
            <li>Publish or export your site</li>
          </ol>
        </DocCard>

        <DocCard
          icon={<Layers />}
          title="Projects & Versions"
        >
          <p>
            Every generated website lives inside a project. Projects include:
          </p>

          <ul className="mt-4 list-disc list-inside space-y-2">
            <li>Initial prompt</li>
            <li>Generated code</li>
            <li>AI conversation history</li>
            <li>Version rollback support</li>
          </ul>

          <p className="mt-4 text-slate-400">
            You can safely experiment knowing every change is versioned.
          </p>
        </DocCard>

        <DocCard
          icon={<MonitorSmartphone />}
          title="Live Preview & Devices"
        >
          <p>
            Instantly preview your website across multiple devices:
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["Desktop", "Tablet", "Mobile"].map((d) => (
              <div
                key={d}
                className="rounded-lg border border-slate-800 bg-white/5 px-4 py-3 text-center text-sm"
              >
                {d}
              </div>
            ))}
          </div>
        </DocCard>

        <DocCard
          icon={<Rocket />}
          title="Publishing & Community"
        >
          <p>
            Projects are private by default. When published:
          </p>

          <ul className="mt-4 list-disc list-inside space-y-2">
            <li>Your site gets a public URL</li>
            <li>You can share it instantly</li>
            <li>It may appear in the Community Showcase</li>
          </ul>
        </DocCard>

        <DocCard
          icon={<CreditCard />}
          title="Credits & Plans"
        >
          <p>
            CodeBloom uses a credit-based system.
          </p>

          <ul className="mt-4 list-disc list-inside space-y-2">
            <li>Credits are required to create projects</li>
            <li>Each project consumes a fixed amount</li>
            <li>Credits never expire</li>
          </ul>

          <p className="mt-4 text-slate-400">
            Manage plans from the Pricing page.
          </p>
        </DocCard>

        <DocCard
          icon={<Settings />}
          title="Account & Settings"
        >
          <p>
            From Account Settings, you can:
          </p>

          <ul className="mt-4 list-disc list-inside space-y-2">
            <li>Update profile details</li>
            <li>Change password</li>
            <li>View credit usage</li>
            <li>Delete your account</li>
          </ul>
        </DocCard>

      </div>
    </main>
  )
}

/* ---------------------------------- */
/* Reusable Card Component */
/* ---------------------------------- */

const DocCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) => {
  return (
    <section
      className="
        rounded-2xl
        border border-slate-800
        bg-gradient-to-b from-white/[0.06] to-white/[0.02]
        p-6
        backdrop-blur
        hover:border-indigo-500/40
        transition
      "
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-500/15 p-2 text-indigo-400">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>
      </div>

      <div className="text-sm leading-relaxed text-slate-300">
        {children}
      </div>
    </section>
  )
}

export default Docs
