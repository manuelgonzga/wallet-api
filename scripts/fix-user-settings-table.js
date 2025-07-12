import { sql } from "../src/config/db.js";

async function fixUserSettingsTable() {
  try {
    console.log("Checking current table structure...");
    
    // Verificar la estructura actual de la tabla
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' 
      ORDER BY ordinal_position;
    `;
    
    console.log("Current table structure:", tableInfo);

    // Verificar las restricciones
    const constraints = await sql`
      SELECT tc.constraint_name, tc.constraint_type, ccu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'user_settings';
    `;
    
    console.log("Current constraints:", constraints);

    // Si user_id es clave primaria, necesitamos reestructurar
    const hasPrimaryKeyOnUserId = constraints.some(c => 
      c.constraint_type === 'PRIMARY KEY' && c.column_name === 'user_id'
    );

    if (hasPrimaryKeyOnUserId) {
      console.log("Found incorrect primary key on user_id, fixing...");
      
      // Respaldar datos existentes
      const existingData = await sql`SELECT * FROM user_settings`;
      console.log("Backing up existing data:", existingData.length, "records");

      // Eliminar la tabla existente
      await sql`DROP TABLE IF EXISTS user_settings_old`;
      await sql`ALTER TABLE user_settings RENAME TO user_settings_old`;

      // Crear la tabla con la estructura correcta
      await sql`
        CREATE TABLE user_settings (
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

      // Restaurar datos con nuevos settings_tag únicos
      for (const record of existingData) {
        const newSettingsTag = record.settings_tag || `${record.user_id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        await sql`
          INSERT INTO user_settings (
            user_id, total_amount, period_days, settings_tag, is_active, start_date, created_at, updated_at
          ) VALUES (
            ${record.user_id}, 
            ${record.total_amount}, 
            ${record.period_days}, 
            ${newSettingsTag}, 
            ${record.is_active}, 
            ${record.start_date || new Date()}, 
            ${record.created_at || new Date()}, 
            ${record.updated_at || new Date()}
          )
        `;
      }

      console.log("Table structure fixed successfully!");
      console.log("Migrated", existingData.length, "records");

      // Eliminar tabla de respaldo
      await sql`DROP TABLE user_settings_old`;
      
    } else {
      console.log("Table structure is already correct");
    }

    // Verificar la nueva estructura
    const newTableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' 
      ORDER BY ordinal_position;
    `;
    
    console.log("Final table structure:", newTableInfo);

  } catch (error) {
    console.error("Error fixing table structure:", error);
    throw error;
  }
}

// Ejecutar la migración
fixUserSettingsTable()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
