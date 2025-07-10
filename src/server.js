import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { sanitizeRequest } from "./middleware/validation.js";

import transactionsRoutes from "./routes/transactionsRoute.js";
import userSettingsRoutes from "./routes/userSettingsRoute.js";
import accountRoutes from "./routes/accountRoute.js";
import job from "./config/cron.js";

dotenv.config();

const app = express();

// Configuración de CORS más segura
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:8081', 'exp://localhost:8081'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware de seguridad
app.use(cors(corsOptions));

// Headers de seguridad
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Trust proxy para obtener IP real detrás de proxies
app.set('trust proxy', 1);

if (process.env.NODE_ENV === "production" && process.env.API_URL) {
  console.log("Starting cron job in production...");
  job.start();
} else {
  console.log("Cron job not started. NODE_ENV or API_URL not set.");
}

// Middleware de aplicación
app.use(rateLimiter);
app.use(express.json({ limit: '10mb' })); // Limitar tamaño de payload
app.use(sanitizeRequest);

const PORT = process.env.PORT || 5001;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/transactions", transactionsRoutes);
app.use("/api/settings", userSettingsRoutes);
app.use("/api/account", accountRoutes);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  });
});
