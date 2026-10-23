/**
 * Safely retrieves the backend API URL.
 * In a unified Vercel deployment or local Vite proxying, an empty string
 * is used to make relative /api calls. When VITE_API_URL is provided,
 * it routes to that explicit origin.
 */
export function getBackendUrl(): string {
  // @ts-ignore - Handle possible TypeScript strictness issues with import.meta
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    return "";
  }
  return (url as string).replace(/\/$/, "");
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
