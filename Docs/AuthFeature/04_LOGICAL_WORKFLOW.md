# Complete Logical Workflow

## Phase A: Authentication & Onboarding
1. User arrives at the app. They see a "Sign In" button provided by Clerk.
2. User authenticates via Clerk (OAuth/Email).
3. The React app detects `<SignedIn>` and renders the main workspace.
4. On initial load, a `useEffect` calls `GET /api/user/settings`. 
5. If the backend returns `404 Not Found` or missing `leetcodeUsername`, the backend automatically creates a skeleton `User` document. The UI prompts the user via a modal to enter their LeetCode username.

## Phase B: Viewing Problems
1. The user switches to the "Problems" tab.
2. The frontend fetches `GET /api/problems`. The request automatically includes the Clerk session token.
3. The Express backend middleware (`requireAuth`) validates the token and attaches `req.auth.userId`.
4. The controller runs `ProblemProgress.find({ userId: req.auth.userId })` and returns *only* that user's problems.
5. The frontend displays the Dense Table View.

## Phase C: Syncing LeetCode Data
1. The user clicks "Sync".
2. The frontend calls `POST /api/sync`.
3. The backend identifies the user (`req.auth.userId`), fetches their `leetcodeUsername` from the MongoDB `User` model.
4. The backend hits the `alfa-leetcode-api` using that specific username.
5. The backend iterates through the API response, upserting `ProblemProgress` records specifically with `{ userId: req.auth.userId, titleSlug: problem.titleSlug }`.
6. The backend responds with success, and the frontend re-fetches the problems list.
