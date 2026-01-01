const Terms = () => {
  return (
    <main className="relative mx-auto max-w-4xl px-6 py-20 text-slate-300">

      {/* PAGE HEADER */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
          Terms & Conditions
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
            These Terms & Conditions (“Terms”) govern your access to and use of
            CodeBloom (“we”, “our”, “us”), including our website, applications,
            and services (collectively, the “Service”).
          </p>
          <p className="mt-4">
            By accessing or using CodeBloom, you agree to be bound by these
            Terms. If you do not agree, you may not use the Service.
          </p>
        </section>

        {/* 1 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            1. Eligibility
          </h2>
          <p>
            You must be at least 13 years old to use CodeBloom. By using the
            Service, you represent that you meet this requirement and that all
            information you provide is accurate.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            2. Account Registration
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account.
          </p>
          <p className="mt-3">
            You agree not to share your account or use another user’s account
            without permission.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            3. Use of the Service
          </h2>
          <p>
            CodeBloom allows you to generate websites using AI. You agree to use
            the Service only for lawful purposes and in compliance with all
            applicable laws.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>No misuse, abuse, or reverse engineering of the Service</li>
            <li>No generation of illegal, harmful, or infringing content</li>
            <li>No attempts to bypass usage limits or credit systems</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            4. Credits & Billing
          </h2>
          <p>
            Certain features require credits. Credits are consumed when creating
            or modifying projects as specified within the app.
          </p>
          <p className="mt-3">
            Credits are non-refundable unless explicitly stated otherwise.
            Pricing and plans may change at our discretion.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            5. Project Ownership & Content
          </h2>
          <p>
            You retain ownership of the websites and content you generate using
            CodeBloom.
          </p>
          <p className="mt-3">
            By using the Service, you grant us a limited license to store,
            process, and display your content solely to provide the Service.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            6. Publishing & Community
          </h2>
          <p>
            Projects are private by default. If you choose to publish a project
            or share it publicly, you are responsible for the content and any
            consequences arising from its publication.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            7. Termination
          </h2>
          <p>
            You may delete your account at any time. We reserve the right to
            suspend or terminate accounts that violate these Terms or misuse
            the Service.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            8. Disclaimer of Warranties
          </h2>
          <p>
            CodeBloom is provided “as is” and “as available”. We make no
            warranties regarding accuracy, reliability, or uninterrupted
            availability of the Service.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            9. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, CodeBloom shall not be liable
            for any indirect, incidental, or consequential damages arising from
            your use of the Service.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            10. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. Continued use of the
            Service after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

      </div>
    </main>
  )
}

export default Terms
