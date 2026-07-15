import { getBackendUrl } from "@/src/lib/envUtils";
import { useState, useEffect, useCallback } from "react";

import { apiFetch } from "@/src/lib/apiFetch";

export interface LeetCodeCalendarData {
  activeYears: number[];
  streak: number;
  totalActiveDays: number;
  submissionCalendar: string; // JSON string
  ranking?: number;
}

export function useCommandPalette(leetcodeUsername?: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<LeetCodeCalendarData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    getBackendUrl();

  const fetchCalendarData = useCallback(async () => {
    if (!leetcodeUsername) return;

    // Check session storage cache first (cache for 5 mins)
    const cacheKey = `leetcode_calendar_${leetcodeUsername}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Invalidate cache if it is older than 5 minutes OR if the cached data is missing 'ranking'
        // (to handle transition from older backend version that didn't include ranking)
        if (
          Date.now() - timestamp < 5 * 60 * 1000 &&
          data &&
          "ranking" in data
        ) {
          setCalendarData(data);
          return;
        }
      } catch (e) {
        // invalid cache, ignore
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch(
        `${apiBase}/api/leetcode/calendar/${leetcodeUsername}`,
      );
      const result = await res.json();

      if (result.success && result.data) {
        setCalendarData(result.data);
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ data: result.data, timestamp: Date.now() }),
        );
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Network error fetching LeetCode data");
    } finally {
      setIsLoading(false);
    }
  }, [leetcodeUsername, apiBase]);

  // Fetch when opened
  useEffect(() => {
    if (isOpen && leetcodeUsername && !calendarData && !isLoading) {
      fetchCalendarData();
    }
  }, [isOpen, leetcodeUsername, calendarData, isLoading, fetchCalendarData]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    calendarData,
    isLoading,
    error,
    refetch: fetchCalendarData,
  };
}
