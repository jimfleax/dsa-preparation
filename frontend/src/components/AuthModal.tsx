import { Loader2, X } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { apiFetch } from "../lib/apiFetch";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${apiBase}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white/90 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 bg-neutral-100/50 hover:bg-neutral-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Welcome Back</h2>
            <p className="mt-3 text-sm font-medium text-neutral-500">
              Sign in to sync your DSA progress securely.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            {error && (
              <div className="w-full p-4 bg-rose-50/80 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium text-center shadow-inner">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-sm font-semibold text-neutral-600">Authenticating...</p>
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
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
