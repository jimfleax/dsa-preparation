import { motion } from "framer-motion";
import PublicFooter from "../components/PublicFooter";

export default function TermsOfService() {
  const title = "Terms of Service";

  return (
    <div className="relative min-h-screen bg-[#fafafa] flex flex-col overflow-hidden">
      {/* Background ambient glow + Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-mask opacity-60"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 
            className="text-5xl sm:text-6xl font-medium text-neutral-900 mb-4 tracking-tight leading-tight text-left"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            <span className="italic">{title.substring(0, title.lastIndexOf(" "))}</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 italic pr-2">
              {title.substring(title.lastIndexOf(" ") + 1)}
            </span>
          </h1>
          <p className="text-sm sm:text-base font-light text-neutral-500 mb-12">
            Last Updated: June 18, 2026
          </p>

          <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline text-neutral-600 font-light">
            <p className="mb-6">
              Please read these Terms of Service ("Terms") carefully before using
              the DSA Preparation application (the "Service") operated by us. Your
              access to and use of the Service is conditioned on your acceptance
              of and compliance with these Terms.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="mb-8">
              By accessing or using the Service you agree to be bound by these
              Terms. If you disagree with any part of the terms then you may not
              access the Service.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              2. Accounts
            </h2>
            <p className="mb-4">
              When you create an account with us, you must provide us information
              that is accurate, complete, and current at all times. Failure to do
              so constitutes a breach of the Terms, which may result in immediate
              termination of your account on our Service.
            </p>
            <p className="mb-8">
              You are responsible for safeguarding the password that you use to
              access the Service and for any activities or actions under your
              password. You agree not to disclose your password to any third
              party.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              3. Acceptable Use
            </h2>
            <p className="mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>Violate any local, state, national, or international laws.</li>
              <li>
                Attempt to gain unauthorized access to our computer systems or
                engage in any activity that disrupts, diminishes the quality of,
                interferes with the performance of, or impairs the functionality
                of the Service.
              </li>
              <li>
                Automatically scrape, extract, or mine data from the Service or
                its API without express permission.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              4. Third-Party Services
            </h2>
            <p className="mb-8">
              Our Service relies on third-party APIs (such as LeetCode) to
              function fully. We are not affiliated with, endorsed by, or
              sponsored by LeetCode or any other third-party services whose public
              data we may fetch. We are not responsible for the availability,
              accuracy, or reliability of such third-party services.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              5. Termination
            </h2>
            <p className="mb-8">
              We may terminate or suspend access to our Service immediately,
              without prior notice or liability, for any reason whatsoever,
              including without limitation if you breach the Terms.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              6. Disclaimer of Warranties
            </h2>
            <p className="mb-8">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We
              do not warrant that the Service will be uninterrupted, secure, or
              error-free. Your use of the Service is at your sole risk.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="mb-8">
              In no event shall we be liable for any indirect, incidental,
              special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your access to or use of or
              inability to access or use the Service.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              8. Changes
            </h2>
            <p className="mb-8">
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. By continuing to access or use our Service
              after those revisions become effective, you agree to be bound by the
              revised terms.
            </p>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
