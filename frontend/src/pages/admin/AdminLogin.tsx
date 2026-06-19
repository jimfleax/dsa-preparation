import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/admin/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credentialResponse.credential }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to authenticate with Google");
      }

      adminLogin(data.token, data.admin);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred during authentication";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was unsuccessful. Try again later.");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-3xl opacity-50" />
        <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-3xl opacity-50" />
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(#4f46e5 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm shadow-indigo-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Admin Access
          </h2>
          <p className="text-neutral-500 mt-2 font-medium">
            Secure login for platform administrators
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-xl shadow-neutral-200/50 sm:rounded-3xl sm:px-12 border border-neutral-200/60">
          <div className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 text-rose-600 text-sm bg-rose-50/80 backdrop-blur-sm p-4 rounded-xl border border-rose-100">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-3 text-indigo-600 text-sm bg-indigo-50/80 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 font-medium">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in securely...
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
              />
            </div>
            
            <p className="text-center text-xs text-neutral-400 mt-6 font-medium">
              Only authorized Google accounts are permitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
