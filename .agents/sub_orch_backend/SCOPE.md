# Scope: Backend Admin & Docs (Milestones 1 & 2)

## Architecture

- Express.js + MongoDB.
- Mongoose schemas for `Admin` and `MarkdownDoc`.
- Express controllers and routes for `/api/admin/*`.

## Milestones

| #   | Name                | Scope                                                                                                         | Dependencies | Status  |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------- | ------------ | ------- |
| 1   | Backend Admin Setup | Admin schema, auth middleware, auth route (login), user list route, analytics route, track management routes. | none         | DONE    |
| 2   | Backend Docs Setup  | Markdown documents schema, doc CRUD routes (upload/save, list, retrieve, delete).                             | none         | PLANNED |

## Interface Contracts

- See global `/home/reetabratabhandari/Projects/dsa-preparation/.agents/orchestrator/PROJECT.md` for API details.

## Instructions

- Run the `Explorer -> Worker -> Reviewer` loop for M1, then M2.
- Remember to verify that the TypeScript builds `npm run build` and tests pass if any.
- Note: Do NOT build an endpoint/script for creating the first admin. The user will do it manually. Just ensure Admin schema and login route work.
- Analytics Data to return: Total registered users & new users (last 30 days), Total tracks and problems available, Total problems solved globally, Most active tracks (based on TrackedProblem entries), Problem completion rate (Solved vs Revising/Unsolved).
