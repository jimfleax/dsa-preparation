import "dotenv/config";
import app from "./app.ts";
import { connectDB, disconnectDB } from "./src/lib/db.ts";
import { metricsCollector } from "./src/lib/metricsCollector.ts";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  try {
    // Connect to MongoDB before accepting requests if URI is provided
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn("[DB] ⚠ MONGODB_URI is not set. Database features will be unavailable.");
    }
    
    // Start background metrics collection
    metricsCollector.start();

    const server = app.listen(PORT, "0.0.0.0", () => {
      // Startup diagnostic banner — summarises which services are active
      const mongoStatus = process.env.MONGODB_URI
        ? "✓ Connected"
        : "✗ Not configured";
      const jwtStatus = process.env.JWT_SECRET
        ? "✓ Active"
        : "✗ Not configured";
      const env = process.env.NODE_ENV || "development";

      console.log("");
      console.log("╔══════════════════════════════════════════════════════╗");
      console.log("║           DSA Preparation — Server Started           ║");
      console.log("╠══════════════════════════════════════════════════════╣");
      console.log(
        `║  URL:        http://localhost:${String(PORT).padEnd(25)}║`,
      );
      console.log(`║  Env:        ${env.padEnd(39)}║`);
      console.log(`║  MongoDB:    ${mongoStatus.padEnd(39)}║`);
      console.log(`║  JWT Auth:   ${jwtStatus.padEnd(39)}║`);
      console.log("╚══════════════════════════════════════════════════════╝");
      console.log("");
    });

    let isShuttingDown = false;
    const gracefulShutdown = (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log(`\n[Server] ${signal} received. Draining connections...`);

      server.close(async () => {
        console.log("[Server] HTTP server closed. Disconnecting database...");
        await disconnectDB();
        process.exit(0);
      });

      // Forced exit fallback after 10s
      setTimeout(() => {
        console.error("[Server] Forced exit: Graceful shutdown timed out.");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    const err = error as Error;
    console.error("");
    console.error("╔══════════════════════════════════════════════════════╗");
    console.error("║        ✗ FATAL: Server failed to start               ║");
    console.error("╠══════════════════════════════════════════════════════╣");
    console.error(`║  Error: ${err.message.substring(0, 44).padEnd(44)}║`);
    console.error("╚══════════════════════════════════════════════════════╝");
    console.error("");
    console.error("Full stack trace:");
    console.error(err.stack || err);
    process.exit(1);
  }
}

const isDirectRun =
  !process.env.VERCEL &&
  typeof process !== "undefined" &&
  Boolean(
    process.argv[1] &&
      (process.argv[1].endsWith("server.src.ts") ||
        process.argv[1].endsWith("server.cjs") ||
        process.argv[1].endsWith("server.ts"))
  );

if (isDirectRun) {
  startServer();
}

export { startServer };
