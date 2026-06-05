# Custom UI/UX Frontend Plan

## 1. Auth Context Setup
Create an `AuthContext.tsx` to manage the JWT token, the `isAuthenticated` boolean, and the global logout function. It will synchronize with `localStorage`.

## 2. New Views / Pages
We need custom React components to replace Clerk's UI:
- **Login View**: Form with Email/Password inputs. Sends `POST /api/auth/login`. On success, stores token.
- **Register View**: Form with Username, Email, Password inputs. Sends `POST /api/auth/register`.
- Both views must match the existing neutral/indigo Tailwind aesthetic.

## 3. Navigation & Routing
- Create an `AuthGuard` or `ProtectedRoute` wrapper component that checks the `AuthContext`. If unauthenticated, it redirects to the Login view.
- **User Button**: Replace Clerk's `<UserButton />` with a custom dropdown or simple "Logout" button in the Navbar.

## 4. User Settings Flow
- Create a `SettingsModal.tsx` accessible from the Navbar.
- Collect the `LeetCode Username`.
- When submitted, send a `PUT /api/user/settings` with the `Authorization: Bearer <token>` header.
