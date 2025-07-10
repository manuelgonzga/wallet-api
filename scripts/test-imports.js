import express from "express";
import dotenv from "dotenv";

// Test básico de importaciones
console.log("✅ Testing imports...");

try {
  // Test de importaciones principales
  const { initDB } = await import("../src/config/db.js");
  console.log("✅ Database config: OK");

  const rateLimiter = await import("../src/middleware/rateLimiter.js");
  console.log("✅ Rate limiter: OK");

  const { sanitizeRequest } = await import("../src/middleware/validation.js");
  console.log("✅ Validation middleware: OK");

  const transactionsRoutes = await import("../src/routes/transactionsRoute.js");
  console.log("✅ Transactions routes: OK");

  const userSettingsRoutes = await import("../src/routes/userSettingsRoute.js");
  console.log("✅ User settings routes: OK");

  const accountRoutes = await import("../src/routes/accountRoute.js");
  console.log("✅ Account routes: OK");

  const job = await import("../src/config/cron.js");
  console.log("✅ Cron job: OK");

  console.log("\n🎉 All imports successful! Server should start without crashes.");

} catch (error) {
  console.error("❌ Import error:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
}
