# Phase 1: Mongoose Backend Architecture - Research

**Researched:** 2025-03-01
**Domain:** Node.js Express Backend & MongoDB/Mongoose Integration
**Confidence:** HIGH

## Summary

This phase plans the integration of MongoDB into the existing Express server using Mongoose. The goal is to track 'Problems' (data structures & algorithms) with details like attempts, solution dates, and URLs, while enabling search and filtering. 

Currently, the project uses `server.ts` for file-based document reading. Introducing MongoDB will shift the architecture towards dynamic data storage. We will need to securely handle the Atlas URI via environment variables, manage the database connection lifecycle gracefully, and implement a `Problem` model and standard RESTful controllers.

**Primary recommendation:** Use a separate database module (`src/lib/db.ts`) for connection handling and abstract models (`src/models/Problem.ts`) rather than polluting `server.ts`. Provide a clean RESTful CRUD API on `/api/problems`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `mongoose` | `^8.12.0` | MongoDB Object Data Modeling (ODM) | Industry standard for Node.js + MongoDB. Handles validation, schemas, and connection pooling out-of-the-box. |
| `dotenv` | `^17.2.3` | Environment Variables | Already installed. Essential for securely injecting the `MONGODB_URI` without hardcoding credentials. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `mongoose` | Native `mongodb` driver | Mongoose provides schema validation and lifecycle hooks at the cost of slight performance overhead. Given the structured requirements (attempts, dates), validation is highly valuable here. |

**Installation:**
```bash
npm install mongoose
npm install -D @types/mongoose
```

## Architecture Patterns

### Recommended Project Structure
```
dsa-preparation/
├── .env                # Add MONGODB_URI=mongodb+srv://...
├── server.ts           # Mounts routes and calls connectDB()
└── src/
    ├── lib/
    │   └── db.ts       # Mongoose connection and lifecycle events
    ├── models/
    │   └── Problem.ts  # Mongoose Schema blueprint
    ├── controllers/
    │   └── problemController.ts # Logic for REST API
    └── routes/
        └── problemRoutes.ts     # Express router definition
```

### Pattern 1: Connection Setup & Lifecycle Management
**What:** Centralized database connection logic.
**When to use:** In any Express+Mongoose server to ensure the DB connects *before* handling requests and disconnects gracefully on process termination.
**Example:**
```typescript
// Source: Recommended Mongoose Express pattern
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB disconnected on app termination');
  process.exit(0);
});
```

### Pattern 2: Separation of Routes and Controllers
**What:** Keeping `server.ts` clean by mounting routers instead of writing all inline route handlers.
**When to use:** When the API expands beyond 1-2 simple endpoints.
**Example:**
```typescript
// In server.ts
import problemRoutes from './src/routes/problemRoutes';
app.use('/api/problems', problemRoutes);
```

### Anti-Patterns to Avoid
- **Inline Connections:** Don't call `mongoose.connect()` inside the route handler; it creates a new pool connection per request.
- **Hardcoding URIs:** Never store the Atlas connection string directly in code. Always load from `process.env`.
- **Ignoring Graceful Shutdown:** Failing to listen to `SIGINT` can leave hanging connections on Atlas leading to pool exhaustion.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request Validation | Hand-rolled if-else chains | Mongoose Schema validators | Mongoose schemas naturally handle required fields, defaults, and data-type casting cleanly and efficiently. |
| Timestamps | Custom `createdAt` hooks | Schema `{ timestamps: true }` | Mongoose has native support for `createdAt` and `updatedAt` metadata fields. |

## Common Pitfalls

### Pitfall 1: Unhandled Promise Rejections in Express Routes
**What goes wrong:** If a MongoDB operation throws an error (e.g., duplicate key) inside an async route handler without a try-catch, the server crashes.
**Why it happens:** Express 4 doesn't catch async errors automatically.
**How to avoid:** Always wrap controller logic in a `try/catch` block, or use a middleware like `express-async-handler`.

### Pitfall 2: Querying by ID safely
**What goes wrong:** Passing an invalid string to `findById` throws a CastError, taking down the request violently.
**How to avoid:** Catch the CastError in the catch block and return a proper 404/400 JSON response instead of unhandled 500.

## Code Examples

### The Mongoose Schema Blueprint
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  url: string;
  attempts: number;
  datesSolved: Date[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

const problemSchema = new Schema<IProblem>(
  {
    title: { 
      type: String, 
      required: [true, 'Problem title is required'], 
      trim: true,
      index: true // Helps with search
    },
    url: { 
      type: String, 
      required: [true, 'Problem URL is required'],
      unique: true, // Prevents duplicate problem entries
      trim: true
    },
    attempts: { 
      type: Number, 
      default: 0,
      min: [0, 'Attempts cannot be negative'] 
    },
    datesSolved: [{ 
      type: Date 
    }],
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard']
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  { timestamps: true }
);

// Indexes to speed up queries based on filtering needs
problemSchema.index({ tags: 1 });
problemSchema.index({ difficulty: 1 });

export default mongoose.model<IProblem>('Problem', problemSchema);
```

### RESTful API Blueprint

| Method | Endpoint | Description | Query/Body Parameters |
|--------|----------|-------------|-----------------------|
| `GET` | `/api/problems` | List problems with search/filter | `?tags=dp,arrays&difficulty=Medium&search=TwoSum` |
| `POST` | `/api/problems` | Add a new problem | `{ title, url, tags, difficulty }` |
| `GET` | `/api/problems/:id` | Get specific problem details | - |
| `PATCH` | `/api/problems/:id` | Update attempts, record a solve date, etc. | `{ attempts, $push: { datesSolved: new Date() } }` |
| `DELETE` | `/api/problems/:id` | Remove problem | - |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Callbacks in routes | `async/await` inside Try/Catch | ~Node 8+ | Cleaner, flatter code but requires strict error catching in Express routes. |
| Global Mongoose config | Local connection instance logic | Mongoose 6+ | Mongoose `strictQuery` default changes mean behavior is strictly scoped to defined schemas. |

## Open Questions

1. **How should 'Solve' events be tracked?**
   - What we know: The user needs `datesSolved` recorded.
   - What's unclear: Should a `PATCH` request just send a new date to append to the array, or should there be a dedicated endpoint like `POST /api/problems/:id/solve`?
   - Recommendation: Use a dedicated `POST /api/problems/:id/solve` to encapsulate the logic of incrementing attempts and pushing to the `datesSolved` array simultaneously.

## Sources

### Primary (HIGH confidence)
- Official Mongoose Documentation - Schema Types, Connections, Indexes.
- Standard Express REST Architecture.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Mongoose is the definitive standard for Express/MongoDB.
- Architecture: HIGH - REST plus controller/route separation is a proven structure.
- Pitfalls: HIGH - Common issues with async Express routes and MongoDB CastErrors are well-known.

**Research date:** 2025-03-01
**Valid until:** 2025-09-01
