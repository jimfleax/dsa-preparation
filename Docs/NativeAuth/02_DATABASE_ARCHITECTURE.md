# Database & Middleware Architecture

## 1. Mongoose Schemas Updates

### The `User` Schema
A comprehensive schema to handle authentication and settings.
```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  leetcodeUsername: { type: String, required: false },
}, { timestamps: true });

// Pre-save hook for hashing passwords
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

export const User = mongoose.model('User', UserSchema);
```

### The `ProblemProgress` Schema
Must include the `userId` referencing the `User` model, with a compound unique index.
```typescript
const ProblemProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  titleSlug: { type: String, required: true },
  // ... other fields
}, { timestamps: true });

ProblemProgressSchema.index({ userId: 1, titleSlug: 1 }, { unique: true });
```

## 2. Express Middleware Architecture
A custom `requireAuth` middleware will replace `clerkMiddleware`.
```typescript
import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = { id: decoded.userId }; // Inject for controllers
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid Token' });
  }
};
```
