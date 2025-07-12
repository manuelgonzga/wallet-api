import { sql } from "../src/config/db.js";

async function checkTableStructure() {
  try {
    // Verificar la clave primaria actual
    const primaryKey = await sql`
      SELECT ccu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'user_settings' AND tc.constraint_type = 'PRIMARY KEY';
    `;
    
    console.log("Current primary key column:", primaryKey);
    
    // Contar registros
    const count = await sql`SELECT COUNT(*) as count FROM user_settings`;
    console.log("Total records:", count[0].count);
    
    // Mostrar algunos registros de ejemplo
    const sample = await sql`SELECT user_id, settings_tag, is_active, id FROM user_settings LIMIT 3`;
    console.log("Sample records:", sample);
    
  } catch (error) {
    console.error("Error checking table:", error);
  }
  
  process.exit(0);
}

checkTableStructure();
