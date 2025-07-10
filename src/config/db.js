import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// Create a SQL connection using your DB URL
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    // Crear tabla de transacciones 
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Crear tabla settings
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id VARCHAR(255) PRIMARY KEY,
        total_amount DECIMAL(10, 2) NOT NULL,
        period_days INT NOT NULL,
        start_date DATE NOT NULL DEFAULT CURRENT_DATE
        );
    `;

    // Crear tabla de cuentas para preferencias de usuario
    await sql`
      CREATE TABLE IF NOT EXISTS account (
        user_id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        currency_preference VARCHAR(10) NOT NULL DEFAULT 'EUR',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        dark_mode BOOLEAN NOT NULL DEFAULT FALSE
      );
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing DB", error);
    process.exit(1);
  }
}
