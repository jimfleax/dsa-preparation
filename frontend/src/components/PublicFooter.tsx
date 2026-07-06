import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="border-t border-neutral-100 py-12 mt-12 bg-white relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500 font-medium">
        <p>&copy; {new Date().getFullYear()} DSA Preparation. All rights reserved.</p>
        <div className="flex gap-6">
          <Link
            to="/privacy-policy"
            className="hover:text-indigo-600 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-of-service"
            className="hover:text-indigo-600 transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
