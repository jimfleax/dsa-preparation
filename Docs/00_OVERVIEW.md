# Blueprint: DSA Problem Tracking Feature

## 1. Goal
Add a feature to track attempted and solved DSA problems. The system will store the problem details (URL, title), attempt counts, and the last solved date using MongoDB. It will automatically fetch the LeetCode title from a URL and synchronize the user's solved problem history using the `alfa-leetcode-api`.

## 2. Requirements Plan
- **Database**: MongoDB with Mongoose (Connection via `.env`).
- **Backend**: Express (Existing `server.ts` to be extended or refactored into modular routes).
- **Frontend**: React SPA with state-driven tabs (Learn vs. Problems).
- **UI Components**: 
  - Top Navbar with "Learn" and "Problems" tabs.
  - "Problems" view displaying titles, attempt counts, and days since last solved.
  - Search and Filter components.
  - Modal for adding new problems via URL.
- **External API Integration**: `alfa-leetcode-api` to fetch problem titles and sync submissions.

## 3. Risk Assessment
- **Breaking Changes**: Refactoring `App.tsx` state to accommodate a top-level tab structure could break the existing `Learn` flow if not carefully isolated.
- **API Rate Limits**: The `alfa-leetcode-api` might have rate limits; we need to be conservative with syncs.
- **Database Errors**: Unhandled MongoDB connection failures or promise rejections could crash the Express server.
