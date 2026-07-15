/**
 * Safely retrieves the backend API URL from the environment variables.
 * Logs a critical error if it's missing but falls back to a relative path
 * to preserve backward compatibility (e.g. for Vite proxying).
 */
export function getBackendUrl(): string {
  // @ts-ignore - Handle possible TypeScript strictness issues with import.meta
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.error(
      "CRITICAL: VITE_API_URL environment variable is missing. Falling back to relative path."
    );
    return "";
  }
  return url as string;
}

/**
 * Safely retrieves the Google OAuth Client ID from the environment.
 * Logs a critical error if missing — Google Sign-In will not work.
 */
export function getGoogleClientId(): string {
  // @ts-ignore - Handle possible TypeScript strictness issues with import.meta
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error(
      "CRITICAL: VITE_GOOGLE_CLIENT_ID environment variable is missing. Google Sign-In will not work."
    );
    return "";
  }
  return clientId as string;
}
