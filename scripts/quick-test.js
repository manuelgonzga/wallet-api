import { sql } from "../src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

async function quickDatabaseTest() {
  try {
    console.log("🔍 Quick Database Test\n");
    
    // Verificar todas las tablas
    const tableCounts = {
      account: await sql`SELECT COUNT(*) as count FROM account`,
      user_settings: await sql`SELECT COUNT(*) as count FROM user_settings`,
      transactions: await sql`SELECT COUNT(*) as count FROM transactions`
    };
    
    for (const [table, result] of Object.entries(tableCounts)) {
      console.log(`📊 Table '${table}': ${result[0].count} records`);
    }
    
    // Insertar un registro de prueba rápido
    const testUserId = `quick_test_${Date.now()}`;
    
    console.log("\n🧪 Testing INSERT operations...");
    
    // Insertar cuenta de prueba
    await sql`
      INSERT INTO account (user_id, username, currency_preference)
      VALUES (${testUserId}, 'test_user', 'EUR')
    `;
    console.log("✅ Account INSERT: OK");
    
    // Insertar configuración de prueba
    await sql`
      INSERT INTO user_settings (user_id, total_amount, period_days)
      VALUES (${testUserId}, 1000.00, 30)
    `;
    console.log("✅ Settings INSERT: OK");
    
    // Insertar transacción de prueba
    await sql`
      INSERT INTO transactions (user_id, title, amount, category)
      VALUES (${testUserId}, 'Test Coffee', -3.50, 'Food & Drinks')
    `;
    console.log("✅ Transaction INSERT: OK");
    
    console.log("\n🔍 Testing SELECT operations...");
    
    // Verificar datos insertados
    const account = await sql`SELECT * FROM account WHERE user_id = ${testUserId}`;
    const settings = await sql`SELECT * FROM user_settings WHERE user_id = ${testUserId}`;
    const transactions = await sql`SELECT * FROM transactions WHERE user_id = ${testUserId}`;
    
    console.log(`✅ Account SELECT: Found ${account.length} record(s)`);
    console.log(`✅ Settings SELECT: Found ${settings.length} record(s)`);
    console.log(`✅ Transactions SELECT: Found ${transactions.length} record(s)`);
    
    if (account.length > 0) {
      console.log(`📋 Account: ${account[0].username} (${account[0].currency_preference})`);
    }
    
    if (transactions.length > 0) {
      console.log(`📋 Transaction: ${transactions[0].title} → ${transactions[0].amount}€`);
    }
    
    console.log("\n🧹 Cleaning up test data...");
    
    // Limpiar datos de prueba
    await sql`DELETE FROM transactions WHERE user_id = ${testUserId}`;
    await sql`DELETE FROM user_settings WHERE user_id = ${testUserId}`;
    await sql`DELETE FROM account WHERE user_id = ${testUserId}`;
    
    console.log("✅ Cleanup completed");
    
    console.log("\n🎉 Database is working perfectly!");
    
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    process.exit(1);
  }
}

quickDatabaseTest();
