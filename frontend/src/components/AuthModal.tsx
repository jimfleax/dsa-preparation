import { getBackendUrl } from "@/src/lib/envUtils";
import { Loader2, X } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { apiFetch } from "../lib/apiFetch";
import BaseModal from "./BaseModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiBase =
    getBackendUrl();

  if (!isOpen) return null;

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${apiBase}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) {
        // Server returned a non-2xx status (e.g. 503 from HF Space cold start).
        // The body may be HTML, not JSON — avoid parsing it directly.
        const errorText = await res.text();
        console.error(`[Auth] Server responded with ${res.status}:`, errorText.substring(0, 200));
        setError(
          res.status >= 500
            ? "Server is starting up. Please try again in a few seconds."
            : "Authentication failed. Please try again."
        );
        return;
      }

      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        onClose();
      } else {
        setError(data.message || "Failed to authenticate with Google");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was unsuccessful. Try again later.");
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      modalId="auth-modal"
      hideHeader
      absoluteClose
      error={error || null}
    >
      <div className="relative p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Welcome!
          </h2>
          <p className="mt-3 text-sm font-medium text-neutral-500">
            Sign in to sync your DSA progress securely.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <p className="text-sm font-semibold text-neutral-600">
                Authenticating...
              </p>
            </div>
          ) : (
            <div className="w-full flex justify-center py-4 transform hover:scale-[1.02] transition-transform duration-200">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="pill"
                width="300"
                useOneTap
              />
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400">
            By continuing, you agree to our{" "}
            <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-500">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </BaseModal>
  );
}
