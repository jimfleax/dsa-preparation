## 2026-06-24 - Bug Fix: Tracker Date Mismatch
- **Changed:** `frontend/src/lib/dateUtils.ts`
- **Root Cause:** The `timeAgo` function computed dates using a 24-hour rolling window instead of calendar days. Thus, any problem solved within the last 24 hours (even if solved yesterday at 11 PM) was displayed as "Today", while the tracker metric correctly filtered by the current calendar day, causing a discrepancy.
- **Fix:** Stripped the time components to compare strict calendar midnights in the `timeAgo` function, ensuring it accurately calculates "Today", "Yesterday", and past days.
- **Risk:** Low
- **Verification:** Verified that problems solved yesterday will correctly display as "Yesterday" and not increment the daily metric.