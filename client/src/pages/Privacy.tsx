const Privacy = () => {
  return (
    <main className="relative mx-auto max-w-4xl px-6 py-20 text-slate-300">

      {/* PAGE HEADER */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Last updated: 25 December 2025
        </p>
      </header>

      {/* CONTENT */}
      <div className="space-y-10 text-sm leading-relaxed">

        {/* INTRO */}
        <section>
          <p>
            CodeBloom (“we”, “our”, “us”) respects your privacy and is committed to
            protecting your personal data. This Privacy Policy explains how we
            collect, use, store, and protect your information when you use our
            website, applications, and services (collectively, the “Service”).
          </p>
          <p className="mt-4">
            By using CodeBloom, you agree to the practices described in this
            Privacy Policy.
          </p>
        </section>

        {/* 1 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            1. Information We Collect
          </h2>

          <h3 className="text-white font-medium mt-4">
            a. Personal Information
          </h3>
          <p className="mt-2">
            When you create an account or sign in, we may collect your name,
            email address, authentication identifiers, and profile image (if
            provided).
          </p>

          <h3 className="text-white font-medium mt-4">
            b. Usage Data
          </h3>
          <p className="mt-2">
            We automatically collect limited technical information such as IP
            address, browser type, device information, and usage patterns to
            help us improve the service.
          </p>

          <h3 className="text-white font-medium mt-4">
            c. Project & Content Data
          </h3>
          <p className="mt-2">
            When you generate websites using CodeBloom, we collect prompts,
            generated code, project metadata, and version history strictly to
            provide the requested functionality.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Create and manage your account</li>
            <li>Generate and store AI-powered websites</li>
            <li>Track usage, credits, and billing</li>
            <li>Improve product quality and user experience</li>
            <li>Maintain security and prevent abuse</li>
          </ul>
          <p className="mt-4 font-medium text-slate-200">
            We do not sell your personal data.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            3. AI & Data Processing
          </h2>
          <p>
            Prompts and generated content are processed by AI systems to produce
            results. Your private projects remain private unless you explicitly
            choose to publish them.
          </p>
          <p className="mt-3">
            We do not use your private content to train public AI models.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            4. Cookies & Local Storage
          </h2>
          <p>
            CodeBloom uses cookies and local storage to maintain login sessions,
            improve performance, and store preferences. Disabling cookies may
            affect certain features.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            5. Third-Party Services
          </h2>
          <p>
            We rely on trusted third-party providers for authentication,
            hosting, infrastructure, and analytics. These providers receive
            only the data required to perform their services.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            6. Data Security
          </h2>
          <p>
            We implement industry-standard security measures including encrypted
            communication and secure authentication. However, no system is
            completely secure.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            7. Data Retention
          </h2>
          <p>
            Your data is retained only while your account is active. You may
            delete your account at any time via Account Settings, after which
            your data is permanently removed.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            8. Your Rights
          </h2>
          <p>
            Depending on your jurisdiction, you may have rights to access,
            correct, or delete your personal data. Most of these actions can be
            performed directly within the app.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            9. Children’s Privacy
          </h2>
          <p>
            CodeBloom is not intended for users under the age of 13, and we do
            not knowingly collect data from children.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page with an updated revision date.
          </p>
        </section>

      </div>
    </main>
  )
}

export default Privacy
