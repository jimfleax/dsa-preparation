# Integrations & External Services

## 1. Authentication

- **Google OAuth2**: Handled via `@react-oauth/google` on the frontend, which sends tokens to the backend `/api/auth/google` endpoint for verification and JWT issuance.

## 2. External Data Providers

- **LeetCode GraphQL API**: The backend dynamically scrapes LeetCode (e.g. for calendar tracking and problem title generation) using rate-limited, native `fetch` requests without API keys. This is utilized in `trackerController.ts` to power the "Command Palette" heatmaps.

## 3. Databases

- **MongoDB**: Primary persistent data store (Tracks, Users, Submissions).
- **RxDB / IndexedDB**: Used on the frontend to provide local-first offline support via Service Workers. Synchronizes with MongoDB backend when online.
