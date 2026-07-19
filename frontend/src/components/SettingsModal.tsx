import { getBackendUrl } from "@/src/lib/envUtils";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Settings, Loader2, AlertCircle } from "lucide-react";
import BaseModal from "./BaseModal";
import FormAlert from "./FormAlert";

import { apiFetch } from "@/src/lib/apiFetch";
import { getApiError } from "@/src/lib/errorUtils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  onSaved: (username: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentUsername,
  onSaved,
}: SettingsModalProps) {
  const [username, setUsername] = useState<string>(currentUsername);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const { getToken } = useAuth();
  const apiBase =
    getBackendUrl();

  // Sync local state when the modal opens with a new value
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, currentUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter your LeetCode username.");
      return;
    }

    // Basic format validation — LeetCode usernames are alphanumeric + hyphens/underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError(
        "LeetCode username can only contain letters, numbers, hyphens, and underscores.",
      );
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const response = await apiFetch(`${apiBase}/api/user/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leetcodeUsername: trimmed }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(getApiError(data, "Failed to save settings."));
        return;
      }

      setSuccess(true);
      onSaved(trimmed);

      // Auto-close after showing success
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 600);
    } catch (err: any) {
      setError("Network error. Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      modalId="settings-modal"
      title="Settings"
      subtitle="Configure your LeetCode integration"
      icon={<Settings className="w-4 h-4" />}
      error={error || null}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
        {/* Info banner when no username is set */}
        {!currentUsername && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>
              Please link your LeetCode username to enable progress syncing.
            </span>
          </div>
        )}

        {/* Username Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="leetcode-username-input"
            className="text-xs font-semibold text-neutral-600"
          >
            LeetCode Username
          </label>
          <input
            id="leetcode-username-input"
            type="text"
            placeholder="e.g. jimfleax"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            disabled={saving}
            autoFocus
            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-medium disabled:opacity-50"
          />
          <p className="text-[10px] text-neutral-400">
            This is used to sync your solved problems from LeetCode.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <FormAlert type="success" message="Settings saved successfully!" />
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {currentUsername ? "Cancel" : "Skip for Now"}
          </button>
          <button
            type="submit"
            disabled={saving || !username.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
