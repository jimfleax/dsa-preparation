import { forceGlobalLogout } from "./logoutUtil";

/**
 * A wrapper around native fetch for Admin dashboard requests.
 * It automatically handles 401 Unauthorized responses (invalid token)
 * by triggering a global hard logout.
 */
export const adminFetch = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  const response = await fetch(url, options);

  // If the token is invalid, the backend returns 401 Unauthorized
  if (response.status === 401) {
    console.warn(
      "[adminFetch] Unauthorized token detected. Triggering global logout.",
    );
    // You could also check if response.json() contains { error: "Invalid token" }
    // but a 401 in the admin context is sufficient to wipe and redirect.
    await forceGlobalLogout("/admin/login");
    // Throw an error so the caller stops processing
    throw new Error("Unauthorized");
  }

  return response;
};
