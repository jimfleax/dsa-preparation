# Database & Architecture Plan for Auth

## 1. Paradigm Shift: Single-Tenant to Multi-Tenant
The current MongoDB schema assumes one user. Uniqueness is enforced on `titleSlug` globally. This must change to allow multiple users to track the same problem.

## 2. Mongoose Schemas Updates

### The `User` Schema (New)
Because the `LEETCODE_USERNAME` is user-specific, we need a lightweight User model linked to Clerk.
```typescript
const UserSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  leetcodeUsername: { type: String, required: false }, // Optional until they set it
}, { timestamps: true });
export const User = mongoose.model('User', UserSchema);
```

### The `ProblemProgress` Schema (Modified)
We will add `userId` and change the unique index to be a compound index.
```typescript
const ProblemProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // Clerk's User ID
  titleSlug: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String },
  isSolved: { type: Boolean, default: false },
  attemptCount: { type: Number, default: 0 },
  lastSolvedDate: { type: Date },
  syncedSubmissionIds: [{ type: String }] 
}, { timestamps: true });

// A user can only have one progress record per problem
ProblemProgressSchema.index({ userId: 1, titleSlug: 1 }, { unique: true });
```

## 3. Express Middleware Architecture
We will use `@clerk/express`.
- Global middleware: `app.use(clerkMiddleware())` parses the token.
- Protected Routes: `router.use(requireAuth())` ensures the request stops if unauthenticated.
- Controller Access: Controllers extract identity via `const userId = req.auth.userId;`. All MongoDB operations MUST include `userId` in the query object.
