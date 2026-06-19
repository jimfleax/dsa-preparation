# Handoff Report: Milestone 2 Backend Docs Setup

## Observation

1. `backend/src/models/LearningDoc.ts` is created and correctly defines the Mongoose schema for markdown docs (`title`, `filename`, `content`, `tags`).
2. `backend/src/controllers/admin/docsController.ts` provides `getDocs` (list), `createDoc` (create), and `deleteDoc` (delete) endpoints. It is currently missing the **retrieve** endpoint.
3. `backend/src/routes/admin/docsRoutes.ts` maps `/` to `getDocs` and `createDoc`, and `/:id` to `deleteDoc`. It lacks a `GET /:id` route.
4. `PROJECT.md` interface contract for Docs API states: `POST /api/admin/docs accepts file content (or multipart/form-data)`. Currently, `createDoc` only accepts a standard JSON body (`req.body.content`).
5. Running `npm run lint` (`tsc --noEmit`) yields 4 errors:
   - `src/controllers/admin/docsController.ts:30:39 - error TS2349: This expression is not callable.` (This occurs when calling `LearningDoc.findByIdAndDelete(id)`).
   - `src/scripts/test_analytics.ts:21:5 - error TS2769: ... 'auth0Id' does not exist in type`.
   - `src/scripts/test_analytics.ts:45:13 - error TS18047: 'user' is possibly 'null'`.
   - `src/scripts/test_analytics.ts:53:13 - error TS18047: 'user' is possibly 'null'`.

## Logic Chain

- **M2 Requirements:** To fully satisfy Milestone 2, we must implement the "retrieve" endpoint (e.g. `getDocById` or `getDocByFilename`) and add support for multipart/form-data document uploads as specified in `PROJECT.md`. This requires adding `multer` to handle file buffers and converting them to strings to store in the `content` field.
- **TS2349 Error in `docsController.ts`:** `LearningDoc.ts` exports `mongoose.models.LearningDoc || mongoose.model<ILearningDoc>(...)`. This fallback mechanism causes TypeScript to infer a union type that loses method signatures like `findByIdAndDelete`. We should explicitly type the model using `as mongoose.Model<ILearningDoc>` or remove the fallback since this is an Express app, not a serverless/Next.js environment.
- **TS Errors in `test_analytics.ts`:** The test script tries to mock `IUser` with obsolete Auth0 properties instead of the current `googleId` fields. We need to update the mock user creation to align with the latest `User.ts` schema and type-assert the user correctly.

## Caveats

- I did not verify if frontend logic relies on JSON instead of multipart/form-data. Given the `PROJECT.md` contract says "(or multipart/form-data)", the `createDoc` endpoint should ideally support **both** JSON `req.body.content` and multipart `req.file`.
- `multer` and `@types/multer` are not currently in `package.json` dependencies. They will need to be installed.

## Conclusion

To fully implement Milestone 2 and fix the compilation errors:

1. Fix `src/models/LearningDoc.ts` by correcting the export type cast to fix TS2349.
2. Fix `src/scripts/test_analytics.ts` by updating the user creation fields to match `User.ts`.
3. Implement `getDoc` in `docsController.ts` and add `GET /api/admin/docs/:id` to `docsRoutes.ts`.
4. Install `multer` (`npm install multer` and `npm i -D @types/multer`).
5. Update `docsRoutes.ts` to use `multer` middleware and `docsController.ts` `createDoc` to extract content from `req.file.buffer.toString('utf-8')` when uploaded as a file, preserving the JSON fallback.

## Verification Method

1. Run `cd backend && npm run lint` to ensure no TypeScript compilation errors exist.
2. Verify multipart upload works: `curl -F "file=@test.md" -F "title=Test" -F "filename=test.md" -H "Authorization: Bearer <admin_token>" POST http://localhost:PORT/api/admin/docs`
3. Verify retrieve endpoint works: `curl -H "Authorization: Bearer <admin_token>" GET http://localhost:PORT/api/admin/docs/<doc_id>`
