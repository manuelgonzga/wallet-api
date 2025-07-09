import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoutes from "./routes/transactionsRoute.js";
import userSettingsRoutes from "./routes/userSettingsRoute.js";
import usersRoutes from "./routes/usersRoute.js";
import job from "./config/cron.js";

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production" && process.env.API_URL) {
  console.log("Starting cron job in production...");
  job.start();
} else {
  console.log("Cron job not started. NODE_ENV or API_URL not set.");
}

// middleware
app.use(rateLimiter);
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/transactions", transactionsRoutes);
app.use("/api/settings", userSettingsRoutes);
app.use("/api/users", usersRoutes);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  });
});
