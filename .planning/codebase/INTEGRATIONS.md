# External Integrations and APIs

## 1. LeetCode GraphQL API
- **Purpose:** Core integration for syncing problems, fetching problem metadata, and tracking user activity.
- **Implementation:** 
  - The backend queries `https://leetcode.com/graphql` directly (e.g., via `backend/src/lib/leetcodeScraperUtil.ts`).
  - **Problem Data:** Extracts accurate titles, difficulty levels, and slugs when a user adds a LeetCode URL to their tracker.
  - **User Activity:** Fetches recent accepted submissions and the user's public profile calendar to synchronize off-platform progress.
- **Authentication:** Uses the public, unauthenticated layers of the GraphQL API.

## 2. Google Gemini SDK (`@google/genai`)
- **Purpose:** Artificial intelligence integrations.
- **Implementation:** The Google GenAI SDK (`@google/genai` v2.4+) is included in the backend dependencies (`package.json`). While it appears to be a planned integration (potentially for AI-driven problem hints, roadmap generation, or explanations), it represents a core third-party AI integration within the project's ecosystem.

## 3. MongoDB Atlas
- **Purpose:** Cloud-hosted NoSQL database.
- **Implementation:** The application connects to a MongoDB Atlas cluster to store application state including Users, TrackedProblems, and curated DSA Tracks. The integration is managed natively via the `mongoose` ODM with compound indexing for efficient multi-tenant queries.
