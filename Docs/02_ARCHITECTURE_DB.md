# Database Architecture (MongoDB + Mongoose)

## 1. Connection Lifecycle
The Mongoose connection will be initialized in a dedicated `src/lib/db.ts` file, keeping `server.ts` clean. 
- Use `dotenv` to parse the `MONGODB_URI` and `LEETCODE_USERNAME` from `.env`.
- Implement robust `try/catch` and error event listeners (`mongoose.connection.on('error')`).

## 2. Mongoose Schemas

### Problem Progress Schema
```javascript
const ProblemProgressSchema = new mongoose.Schema({
  titleSlug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  url: { type: String },
  isSolved: { type: Boolean, default: false },
  attemptCount: { type: Number, default: 0 },
  lastSolvedDate: { type: Date },
  syncedSubmissionIds: [{ type: String }] // To prevent duplicate attempts
}, { timestamps: true });

ProblemProgressSchema.index({ titleSlug: 1 }, { unique: true });
```
*(Note: A User schema is not required as the LeetCode username will be strictly read from the `.env` file.)*

## 3. REST API Endpoints
- `GET /api/problems`: Fetch all tracked problems (with sorting/filtering query params).
- `POST /api/problems`: Add a single problem manually (receives URL, fetches title via external API if missing).
- `POST /api/sync`: Trigger a sync with the `alfa-leetcode-api` for the hardcoded `.env` username to update existing records.
