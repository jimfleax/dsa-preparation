/**
 * Retrieves a required environment variable.
 * Throws with a clear, actionable message if missing — use this for
 * variables that the application cannot function without.
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `CRITICAL: Required environment variable "${key}" is not set. ` +
      `Set it in .env or your deployment environment to continue.`
    );
  }
  return value;
}
