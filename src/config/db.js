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
        settings_tag VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Crear tabla settings
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        period_days INT NOT NULL,
        settings_tag VARCHAR(100) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // Crear tabla de cuentas para preferencias de usuario
    await sql`
      CREATE TABLE IF NOT EXISTS account (
        user_id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(11) NOT NULL,
        currency_preference VARCHAR(10) NOT NULL DEFAULT 'EUR',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        dark_mode BOOLEAN NOT NULL DEFAULT FALSE
      );
    `;

    // Agregar campos faltantes a tablas existentes si no tienen el nuevo esquema
    await sql`
      DO $$ 
      BEGIN
        -- Agregar settings_tag a transactions si no existe
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'transactions' AND column_name = 'settings_tag'
        ) THEN
          ALTER TABLE transactions ADD COLUMN settings_tag VARCHAR(100);
        END IF;

        -- Agregar settings_tag a user_settings si no existe
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user_settings' AND column_name = 'settings_tag'
        ) THEN
          ALTER TABLE user_settings ADD COLUMN settings_tag VARCHAR(100);
        END IF;

        -- Agregar is_active a user_settings si no existe
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user_settings' AND column_name = 'is_active'
        ) THEN
          ALTER TABLE user_settings ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;

        -- Agregar id a user_settings si no existe (migración de esquema viejo)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user_settings' AND column_name = 'id'
        ) THEN
          ALTER TABLE user_settings ADD COLUMN id SERIAL;
        END IF;
      END $$;
    `;

    // Generar settings_tag para user_settings sin tag
    await sql`
      UPDATE user_settings 
      SET settings_tag = user_id || '_' || EXTRACT(EPOCH FROM COALESCE(created_at, CURRENT_TIMESTAMP))::TEXT || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
      WHERE settings_tag IS NULL;
    `;

    // Generar settings_tag para transactions sin tag
    await sql`
      UPDATE transactions 
      SET settings_tag = (
        SELECT us.settings_tag 
        FROM user_settings us 
        WHERE us.user_id = transactions.user_id 
        AND us.is_active = true
        LIMIT 1
      )
      WHERE settings_tag IS NULL AND EXISTS (
        SELECT 1 FROM user_settings us 
        WHERE us.user_id = transactions.user_id 
        AND us.is_active = true
      );
    `;

    // Hacer settings_tag NOT NULL después de llenar los datos
    await sql`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user_settings' AND column_name = 'settings_tag' AND is_nullable = 'YES'
        ) THEN
          ALTER TABLE user_settings ALTER COLUMN settings_tag SET NOT NULL;
        END IF;
      END $$;
    `;

    await sql`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'transactions' AND column_name = 'settings_tag' AND is_nullable = 'YES'
        ) THEN
          ALTER TABLE transactions ALTER COLUMN settings_tag SET NOT NULL;
        END IF;
      END $$;
    `;

    // Crear Foreign Key constraint solo si no existe
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_transactions_settings_tag'
        ) THEN
          ALTER TABLE transactions 
          ADD CONSTRAINT fk_transactions_settings_tag 
          FOREIGN KEY (settings_tag) REFERENCES user_settings(settings_tag);
        END IF;
      END $$;
    `;

    // Crear índices para optimización
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_settings_tag ON user_settings(settings_tag);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_settings_active ON user_settings(user_id, is_active);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_settings_tag ON transactions(settings_tag);
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing DB", error);
    process.exit(1);
  }
}
