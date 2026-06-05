# Clerk UI/UX & Frontend Integration Plan

## 1. Clerk Provider Setup
Wrap the main React application (in `src/main.tsx` or `src/App.tsx`) with `<ClerkProvider publishableKey={PUBLISHABLE_KEY}>`.

## 2. UI Customization
Clerk provides pre-built components. We will use the `appearance` prop to style them to match the neutral/indigo theme.
```javascript
<ClerkProvider 
  appearance={{
    variables: { colorPrimary: '#4f46e5' }, // Indigo-600
    elements: {
      card: 'bg-white rounded-2xl shadow-lg border border-neutral-100',
      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm font-bold',
      // ... further tailwind class mapping
    }
  }}
>
```

## 3. Navigation & States
- **Unauthenticated View**: If `<SignedOut>`, render a landing screen or generic view prompting the user to Sign In using `<SignInButton />`.
- **Authenticated View**: `<SignedIn>` will render the actual app (Learn / Problems tabs).
- **User Button**: Add `<UserButton />` to the Top Navbar next to the Version Pill. 

## 4. User Settings Flow (LeetCode Sync Setup)
- We need a custom Modal or a dedicated Settings section where the user enters their `LeetCode Username`. 
- When submitted, the frontend sends a `POST /api/user/settings` to save it in the MongoDB `User` model.
- Until this is set, the "Sync" functionality in the "Problems" tab will show a warning: "Please link your LeetCode username to sync progress."
