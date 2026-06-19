/**
 * Triggers a global hard logout and completely wipes client state.
 *
 * Use this when an Invalid Token / 401 error is detected to ensure
 * no stale data remains in the client across accounts or sessions.
 * It wipes localStorage, sessionStorage, ServiceWorker Caches, and IndexedDB.
 */
export const forceGlobalLogout = async (redirectUrl: string = "/") => {
  // 1. Clear standard browser storage
  localStorage.clear();
  sessionStorage.clear();

  // 2. Clear all ServiceWorker Caches
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch (e) {
      console.error("[forceGlobalLogout] Failed to clear caches:", e);
    }
  }

  // 3. Clear all IndexedDB databases (e.g. RxDB data)
  if ("indexedDB" in window && indexedDB.databases) {
    try {
      const dbs = await indexedDB.databases();
      dbs.forEach((db) => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    } catch (e) {
      console.error("[forceGlobalLogout] Failed to clear IndexedDB:", e);
    }
  } else if ("indexedDB" in window) {
    // For browsers that don't support indexedDB.databases() (e.g., Firefox without flags)
    // We explicitly delete known RxDB database prefixes if needed, but for now we fallback
    console.warn(
      "[forceGlobalLogout] indexedDB.databases() not supported in this browser.",
    );
  }

  // 4. Redirect to home/login and hard reload
  window.location.href = redirectUrl;
};
