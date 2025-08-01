import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addCurrencyColumn() {
  try {
    console.log('Adding currency column to user_settings table...');
    
    // Check if currency column already exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'currency';
    `;
    
    if (columnExists.length > 0) {
      console.log('Currency column already exists in user_settings table.');
      return;
    }
    
    // Add currency column
    await sql`
      ALTER TABLE user_settings 
      ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR';
    `;
    
    console.log('Successfully added currency column to user_settings table.');
    
    // Update existing records with EUR as default
    const updateResult = await sql`
      UPDATE user_settings 
      SET currency = 'EUR'
      WHERE currency IS NULL;
    `;
    
    console.log(`Updated existing records with default currency.`);
    
  } catch (error) {
    console.error('Error adding currency column:', error);
    throw error;
  }
}

// Run the migration
addCurrencyColumn()
  .then(() => {
    console.log('Migration completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
