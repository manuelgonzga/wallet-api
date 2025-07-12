import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateSettingsTagLength() {
  const client = await pool.connect();
  
  try {
    console.log('Starting settings_tag length migration...');
    
    // Check current column length
    const checkResult = await client.query(`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' 
      AND column_name = 'settings_tag'
    `);
    
    console.log('Current settings_tag length:', checkResult.rows[0]?.character_maximum_length);
    
    // Update transactions table
    console.log('Updating transactions table...');
    await client.query('ALTER TABLE transactions ALTER COLUMN settings_tag TYPE VARCHAR(100)');
    console.log('✅ Transactions table updated');
    
    // Update user_settings table
    console.log('Updating user_settings table...');
    await client.query('ALTER TABLE user_settings ALTER COLUMN settings_tag TYPE VARCHAR(100)');
    console.log('✅ User_settings table updated');
    
    // Verify changes
    const verifyResult = await client.query(`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' 
      AND column_name = 'settings_tag'
    `);
    
    console.log('New settings_tag length:', verifyResult.rows[0]?.character_maximum_length);
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateSettingsTagLength()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
