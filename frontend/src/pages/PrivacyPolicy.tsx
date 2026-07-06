import { motion } from "framer-motion";
import PublicFooter from "../components/PublicFooter";

export default function PrivacyPolicy() {
  const title = "Privacy Policy";

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
              Welcome to DSA Preparation. We are committed to protecting your
              personal information and your right to privacy. If you have any
              questions or concerns about this privacy notice, or our practices
              with regards to your personal information, please contact us.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We collect personal information that you voluntarily provide to us
              when you register on the application, express an interest in
              obtaining information about us or our products and services, or
              otherwise when you contact us.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>
                <strong className="font-semibold text-neutral-800">Account Information:</strong> When you create an account,
                we collect your username, email address, and password (which is
                securely hashed).
              </li>
              <li>
                <strong className="font-semibold text-neutral-800">Usage Data:</strong> We collect data related to the
                problems you track, notes you take, review intervals, and your
                interactions with the curated roadmaps.
              </li>
              <li>
                <strong className="font-semibold text-neutral-800">LeetCode Data:</strong> If you choose to provide your
                LeetCode username, our application fetches your public submission
                history from the LeetCode GraphQL API to automatically sync your
                progress.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">
              We use the information we collect or receive to provide, maintain,
              and improve our services.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>
                To facilitate account creation and logon process securely using
                JSON Web Tokens (JWT).
              </li>
              <li>
                To provide and deliver the problem tracking and roadmap features
                you request.
              </li>
              <li>
                To synchronize your completed problems from third-party platforms
                like LeetCode.
              </li>
              <li>
                To improve the user experience and analyze application usage.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              3. Will Your Information Be Shared?
            </h2>
            <p className="mb-4">
              We only share information with your consent, to comply with laws, to
              provide you with services, to protect your rights, or to fulfill
              business obligations.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>
                <strong className="font-semibold text-neutral-800">Third-Party Integrations:</strong> Our backend fetches
                data from the LeetCode GraphQL API on your behalf. We do not sell
                or share your personal data with third-party advertisers.
              </li>
              <li>
                <strong className="font-semibold text-neutral-800">Infrastructure:</strong> Your data is stored securely in
                our MongoDB databases and managed on reliable cloud
                infrastructure.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              4. How Long Do We Keep Your Information?
            </h2>
            <p className="mb-8">
              We keep your information for as long as necessary to fulfill the
              purposes outlined in this privacy notice unless otherwise required
              by law. When we have no ongoing legitimate business need to process
              your personal information, we will either delete or anonymize it.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              5. How Do We Keep Your Information Safe?
            </h2>
            <p className="mb-8">
              We have implemented appropriate technical and organizational
              security measures (such as password hashing and secure API endpoint
              routing) designed to protect the security of any personal
              information we process. However, please also remember that we cannot
              guarantee that the internet itself is 100% secure.
            </p>

            <h2 className="text-xl font-bold text-neutral-900 mt-10 mb-4">
              6. Your Privacy Rights
            </h2>
            <p className="mb-8">
              You may review, change, or terminate your account at any time. Upon
              your request to terminate your account, we will deactivate or delete
              your account and information from our active databases.
            </p>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
