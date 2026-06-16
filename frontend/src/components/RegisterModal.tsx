import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, UserPlus, User, Loader2, CheckCircle2, XCircle, Check } from "lucide-react";
import BaseModal from "./BaseModal";
import FormAlert from "./FormAlert";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const isUsernameValid = username.length >= 3;
  const isFormValid = isEmailValid && isPasswordValid && isUsernameValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setLoading(true);

    try {
      const apiBase =
        (import.meta as any).env.VITE_API_URL ||
        "https://dsa-preparation-788547842951.asia-south1.run.app";
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login(data.token, data.user);
        onClose();
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      modalId="register-modal"
      hideHeader
      absoluteClose
    >
      <div className="p-8 overflow-y-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <UserPlus className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Create Account
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Join to track your DSA progress
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <FormAlert type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" aria-hidden="true" />
              <input
                type="text"
                required
                aria-label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" aria-hidden="true" />
              <input
                type="email"
                required
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 bg-neutral-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  email.length > 0
                    ? isEmailValid
                      ? "border-emerald-500 focus:ring-emerald-100 focus:border-emerald-500"
                      : "border-red-300 focus:ring-red-100 focus:border-red-500"
                    : "border-neutral-200 focus:ring-indigo-100 focus:border-indigo-600"
                }`}
                placeholder="you@example.com"
              />
              {email.length > 0 && isEmailValid && (
                <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-emerald-500" aria-hidden="true" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" aria-hidden="true" />
              <input
                type="password"
                required
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-neutral-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  password.length > 0
                    ? isPasswordValid
                      ? "border-emerald-500 focus:ring-emerald-100 focus:border-emerald-500"
                      : "border-neutral-200 focus:ring-indigo-100 focus:border-indigo-600"
                    : "border-neutral-200 focus:ring-indigo-100 focus:border-indigo-600"
                }`}
                placeholder="••••••••"
              />
            </div>

            {/* Password Strength UI */}
            <div className="mt-3 space-y-1.5">
              {[
                { key: "length", label: "At least 8 characters" },
                { key: "uppercase", label: "One uppercase letter" },
                { key: "lowercase", label: "One lowercase letter" },
                { key: "number", label: "One number" },
                { key: "special", label: "One special character" },
              ].map((rule) => {
                const isValid = passwordRules[rule.key as keyof typeof passwordRules];
                return (
                  <div key={rule.key} className="flex items-center text-xs">
                    {isValid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5 flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-neutral-300 mr-1.5 flex-shrink-0" aria-hidden="true" />
                    )}
                    <span className={isValid ? "text-emerald-700" : "text-neutral-500"}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-[0.98] mt-2 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6 font-medium">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-indigo-600 hover:text-indigo-700 font-bold"
          >
            Sign in
          </button>
        </p>
      </div>
    </BaseModal>
  );
}
