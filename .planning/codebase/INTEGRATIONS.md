# Integrations

This document outlines the major databases, external APIs, and services integrated into the project.

## Databases
- **MongoDB**: The primary backend database for storing users, tracked problems, tracks, and application state. Integrated via the Mongoose ORM.
- **IndexedDB (Dexie / RxDB)**: Used on the frontend for local-first data storage, offline capabilities, and caching.

## External APIs & Services
- **LeetCode GraphQL API**: 
  - **Endpoint**: `https://leetcode.com/graphql`
  - **Purpose**: Fetches real-time problem metadata (title, difficulty) directly from LeetCode. It is also used to fetch user profile calendar and heatmap data via the `userProfileCalendar` operation for frontend visualisations.
- **Google OAuth / Authentication**:
  - **Frontend**: `@react-oauth/google` for user login flows.
  - **Backend**: `google-auth-library` to verify OAuth tokens and authenticate users securely against Google Identity Services.
- **Google GenAI (Gemini API)**:
  - **Library**: `@google/genai`
  - **Purpose**: The project lists `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` in its capabilities and includes the Gemini API SDK in its backend dependencies, indicating integration for AI-powered features.
