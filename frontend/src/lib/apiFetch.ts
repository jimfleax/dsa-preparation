import { from, of, throwError, firstValueFrom } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";
import { saveToCache, getCachedResponse } from "./apiCache";

/**
 * A custom fetch wrapper that caches GET responses in RxDB using a Network-First strategy.
 */
export const apiFetch = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  const method = options?.method?.toUpperCase() || "GET";

  // We only cache GET requests
  if (method !== "GET") {
    return fetch(url, options);
  }

  const request$ = fromFetch(url, options).pipe(
    switchMap(async (response) => {
      // If network request succeeds, update the cache
      if (response.ok) {
        const cloned = response.clone();
        try {
          const text = await cloned.text();
          // Fire and forget cache update
          saveToCache(url, text).catch(console.error);
        } catch (e) {
          console.error("[apiFetch] Error reading response text for cache:", e);
        }
      } else if (response.status >= 500) {
        // If backend is completely down (502, 503, 504), throw to trigger fallback to cache
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    }),
    catchError((err) => {
      console.warn(
        `[apiFetch] Network or server error fetching ${url}. Falling back to RxDB cache...`,
      );
      // Network failure or server down
      return from(getCachedResponse(url)).pipe(
        switchMap((cachedText) => {
          if (cachedText) {
            // We have cached data! Return it as a successful response.
            return of(
              new Response(cachedText, {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }),
            );
          }
          // No cache available, throw original error
          return throwError(() => err);
        }),
      );
    }),
  );

  return firstValueFrom(request$);
};
