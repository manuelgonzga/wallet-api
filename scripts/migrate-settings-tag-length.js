import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function migrateSettingsTagLength() {
  try {
    console.log('🔧 Starting settings_tag length migration...');
    
    // Check current column length for transactions
    const checkTransactions = await sql`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' AND column_name = 'settings_tag'
    `;
    
    // Check current column length for user_settings
    const checkSettings = await sql`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'settings_tag'
    `;
    
    console.log('📊 Current settings_tag lengths:');
    console.log(`   - transactions: ${checkTransactions[0]?.character_maximum_length || 'N/A'}`);
    console.log(`   - user_settings: ${checkSettings[0]?.character_maximum_length || 'N/A'}`);
    
    // Update transactions table if needed
    if (checkTransactions[0]?.character_maximum_length === 50) {
      console.log('🔄 Updating transactions table...');
      await sql`ALTER TABLE transactions ALTER COLUMN settings_tag TYPE VARCHAR(100)`;
      console.log('✅ Transactions table updated');
    } else {
      console.log('ℹ️  Transactions table already has correct length');
    }
    
    // Update user_settings table if needed
    if (checkSettings[0]?.character_maximum_length === 50) {
      console.log('🔄 Updating user_settings table...');
      await sql`ALTER TABLE user_settings ALTER COLUMN settings_tag TYPE VARCHAR(100)`;
      console.log('✅ User_settings table updated');
    } else {
      console.log('ℹ️  User_settings table already has correct length');
    }
    
    // Verify changes
    const verifyTransactions = await sql`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' AND column_name = 'settings_tag'
    `;
    
    const verifySettings = await sql`
      SELECT character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'settings_tag'
    `;
    
    console.log('🔍 Verification - New settings_tag lengths:');
    console.log(`   - transactions: ${verifyTransactions[0]?.character_maximum_length}`);
    console.log(`   - user_settings: ${verifySettings[0]?.character_maximum_length}`);
    
    if (verifyTransactions[0]?.character_maximum_length === 100 && 
        verifySettings[0]?.character_maximum_length === 100) {
      console.log('🎉 Migration completed successfully!');
    } else {
      throw new Error('Migration verification failed');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateSettingsTagLength()
  .then(() => {
    console.log('✨ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
