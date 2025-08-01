// Script de inicio con debugging mejorado
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

console.log("=== SERVER STARTUP DEBUG ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT || 5001);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Missing");
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "Set" : "Missing");

const app = express();

// CORS más permisivo para debugging
app.use(cors({
  origin: "*",
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  next();
});

app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5001;

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Import routes
import transactionsRoutes from "./src/routes/transactionsRoute.js";
app.use("/api/transactions", transactionsRoutes);

// Database init
import { initDB } from "./src/config/db.js";
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on PORT: ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/transactions/test`);
  });
}).catch(error => {
  console.error("❌ Failed to initialize database:", error);
});
