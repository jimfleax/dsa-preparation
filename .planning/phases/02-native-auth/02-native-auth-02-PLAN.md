---
phase: 02-native-auth
plan: 02
type: execute
wave: 2
depends_on: ["01"]
files_modified:
  - "src/context/AuthContext.tsx"
  - "src/pages/Login.tsx"
  - "src/pages/Register.tsx"
  - "src/components/SettingsModal.tsx"
  - "src/App.tsx"
autonomous: false
requirements:
  - AUTH-03
  - AUTH-04
must_haves:
  truths:
    - "User can navigate to Login and Register pages"
    - "User session persists in frontend via Context/localStorage"
    - "Settings modal allows updating leetcodeUsername via API"
  artifacts:
    - path: "src/context/AuthContext.tsx"
      provides: "Global auth state management"
    - path: "src/pages/Login.tsx"
      provides: "UI form for login"
    - path: "src/components/SettingsModal.tsx"
      provides: "UI for updating profile fields"
  key_links:
    - from: "src/pages/Login.tsx"
      to: "/api/auth/login"
      via: "fetch POST request"
---

<objective>
Implement frontend React UI and state management for native authentication.
Purpose: Allow users to securely log in and register without Clerk components.
Output: AuthContext, Login/Register pages, and updated SettingsModal.
</objective>

<execution_context>
@/home/jimfleax/.gemini/get-shit-done/workflows/execute-plan.md
@/home/jimfleax/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@Docs/AuthFeature/07_NATIVE_JWT_ARCHITECTURE.md
@src/App.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Auth Context</name>
  <files>src/context/AuthContext.tsx, src/App.tsx</files>
  <action>
    - Create `AuthContext` to hold `{ user, token, login, logout }`.
    - Retrieve initial token from `localStorage`.
    - Provide context wrapper in `src/App.tsx`.
    - Add logic to intercept/attach token to API calls (or just advise using it in fetch headers).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Auth context accurately reflects token presence and provides login/logout methods.</done>
</task>

<task type="auto">
  <name>Task 2: Create Login and Register Pages</name>
  <files>src/pages/Login.tsx, src/pages/Register.tsx, src/App.tsx</files>
  <action>
    - Build `Login.tsx` with email/password inputs and error state handling. On success, call `context.login(token)`.
    - Build `Register.tsx` with email, username, and password.
    - Style forms with Tailwind CSS.
    - Wire React Router routes in `App.tsx` replacing Clerk's `<SignIn />` and `<SignUp />` paths.
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>Routes exist and forms submit data to the backend.</done>
</task>

<task type="auto">
  <name>Task 3: Update Settings Modal for LeetCode Username</name>
  <files>src/components/SettingsModal.tsx</files>
  <action>
    - Replace any Clerk user-profile UI with a native update form.
    - Form queries `PUT /api/user/settings` (or similar existing route) with `{ leetcodeUsername }`.
    - Ensure the `Authorization: Bearer <token>` header is passed in the fetch call.
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>Settings modal successfully sends authenticated request to backend.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Frontend native auth integration with backend</what-built>
  <how-to-verify>
    1. Start the backend (`npm run dev:server` or equivalent).
    2. Start the frontend (`npm run dev`).
    3. Register a new user at `/register`.
    4. Verify automatic login or navigate to `/login` and login.
    5. Open Settings modal and successfully save a new LeetCode username.
  </how-to-verify>
  <resume-signal>Type "approved" if all flows work</resume-signal>
</task>

</tasks>

<verification>
Ensure frontend builds correctly and Clerk dependencies can safely be removed after this phase.
</verification>

<success_criteria>
- User can successfully register and login.
- JWT is stored securely and sent with subsequent requests.
- Settings modal updates native user record.
</success_criteria>

<output>
After completion, create `.planning/phases/02-native-auth/02-native-auth-02-SUMMARY.md`
</output>