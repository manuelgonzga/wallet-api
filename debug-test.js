// Archivo para probar rápidamente las conexiones
import dotenv from 'dotenv';
dotenv.config();

console.log("=== ENVIRONMENT CHECK ===");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Missing");
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "Set" : "Missing");
console.log("NODE_ENV:", process.env.NODE_ENV);

// Test database connection
import { sql } from '../src/config/db.js';

async function testDB() {
  try {
    console.log("=== DATABASE TEST ===");
    const result = await sql`SELECT NOW() as current_time`;
    console.log("Database connection successful:", result[0]);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

// Test Clerk import
async function testClerk() {
  try {
    console.log("=== CLERK TEST ===");
    const { verifyToken } = await import('@clerk/clerk-sdk-node');
    console.log("Clerk import successful");
  } catch (error) {
    console.error("Clerk import failed:", error);
  }
}

testDB();
testClerk();
