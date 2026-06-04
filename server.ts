/**
 * Production entrypoint for Cloud Run.
 *
 * Cloud Run's buildpack has a persisted GOOGLE_ENTRYPOINT of "node server.ts".
 * Node.js 24 can execute .ts files with type stripping (--experimental-strip-types).
 * This shim sets NODE_ENV and loads the esbuild-compiled bundle at dist/server.cjs.
 *
 * For development, use: npm run dev (which uses tsx to run server.src.ts directly)
 */

import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const bundlePath: string = join(import.meta.dirname, 'dist', 'server.cjs');

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

if (existsSync(bundlePath)) {
  require(bundlePath);
} else {
  console.error(
    'ERROR: dist/server.cjs not found. Run "npm run build" first, or use "npm run dev" for development.'
  );
  process.exit(1);
}
