# Testing, Debugging, and Feedback Loops

## 1. IDOR Vulnerability Testing
- **Test Case**: Attempt to delete or modify a problem progress entry belonging to User B while authenticated as User A.
- **Expected Result**: 404 Not Found or 403 Forbidden. The query `{ _id: req.params.id, userId: req.auth.userId }` must silently fail to find User B's document.
- **Debugging**: If it succeeds, verify that `userId` is strictly appended to the Mongoose query object inside the controller.

## 2. Middleware Enforcement Testing
- **Test Case**: Attempt to call `GET /api/problems` and `POST /api/sync` without an `Authorization` header.
- **Expected Result**: 401 Unauthorized.
- **Debugging**: Ensure `app.use('/api', requireAuth())` or equivalent router-level middleware is properly mounted in `server.ts` before the routes are registered.

## 3. Database Isolation Feedback Loop
- **Test Case**: User A adds a new problem URL. User B searches for that problem URL.
- **Expected Result**: User B's problem list should be empty.
- **Debugging**: Connect to the MongoDB Atlas cluster. Verify that two distinct `userId`s exist in the `ProblemProgress` collection, and the compound index `{ userId: 1, titleSlug: 1 }` prevents duplicates for the *same* user, but allows duplicates across *different* users.

## 4. Frontend State Feedback Loops
- **State Check**: Ensure the `<SignedOut>` boundary cleanly flushes any cached React state (e.g., clearing the `documents` array) so that if User A logs out and User B logs in on the same browser, User A's data doesn't temporarily flicker.
- **Error Handling**: If the `/api/sync` endpoint fails (e.g., due to an invalid LeetCode username), the UI must display a clear toast or error message rather than silently failing.
