import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addTitleColumn() {
  try {
    console.log('Adding title column to user_settings table...');
    
    // Check if title column already exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'title';
    `;
    
    if (columnExists.length > 0) {
      console.log('Title column already exists in user_settings table.');
      return;
    }
    
    // Add title column
    await sql`
      ALTER TABLE user_settings 
      ADD COLUMN title VARCHAR(100) DEFAULT 'Budget Period';
    `;
    
    console.log('Successfully added title column to user_settings table.');
    
    // Update existing records with a simple default title
    const updateResult = await sql`
      UPDATE user_settings 
      SET title = 'Budget Period'
      WHERE title IS NULL;
    `;
    
    console.log(`Updated existing records with default title.`);
    
  } catch (error) {
    console.error('Error adding title column:', error);
    throw error;
  }
}

// Run the migration
addTitleColumn()
  .then(() => {
    console.log('Migration completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
