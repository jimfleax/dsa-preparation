import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

interface NetworkStatusContextType {
  /** True when the app has detected no internet connectivity */
  isOffline: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(
  undefined,
);

const HEALTH_POLL_INTERVAL_MS = 10_000; // 10 seconds when offline

/**
 * Provides network connectivity awareness to the entire app.
 *
 * Detection strategy:
 *   1. Listens to browser `online`/`offline` events as a fast signal.
 *   2. Verifies with a real `/api/health` fetch to avoid false positives.
 *   3. When offline, polls every 10 s to detect reconnection.
 */
export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  /**
   * Perform a real network check by hitting the health endpoint.
   * Returns `true` if reachable, `false` otherwise.
   */
  const verifyConnection = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(`${apiBase}/api/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, [apiBase]);

  /* ── Browser online/offline events ──────────────────────────── */

  useEffect(() => {
    const onOnline = async () => {
      // Verify before trusting the browser event
      const reachable = await verifyConnection();
      setIsOffline(!reachable);
    };

    const onOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [verifyConnection]);

  /* ── Periodic polling when offline ──────────────────────────── */

  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (isOffline) {
      pollRef.current = setInterval(async () => {
        const reachable = await verifyConnection();
        if (reachable) {
          setIsOffline(false);
        }
      }, HEALTH_POLL_INTERVAL_MS);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOffline, verifyConnection]);

  const contextValue = useMemo(() => ({ isOffline }), [isOffline]);

  return (
    <NetworkStatusContext.Provider value={contextValue}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus(): NetworkStatusContextType {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    throw new Error(
      "useNetworkStatus must be used within a NetworkStatusProvider",
    );
  }
  return context;
}
