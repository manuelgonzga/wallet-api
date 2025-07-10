#!/usr/bin/env node

import { sql } from "../src/config/db.js";
import { VALID_CURRENCIES } from "../src/constants/currencies.js";
import dotenv from "dotenv";

dotenv.config();

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.cyan}📊 ${msg}${colors.reset}`)
};

// Datos de prueba
const testUsers = [
  {
    user_id: 'test_user_001',
    username: 'alice_walker',
    currency_preference: 'USD'
  },
  {
    user_id: 'test_user_002', 
    username: 'bob_smith',
    currency_preference: 'EUR'
  },
  {
    user_id: 'test_user_003',
    username: 'carol_jones',
    currency_preference: 'GBP'
  }
];

const testTransactions = [
  // Transacciones para Alice (USD)
  { user_id: 'test_user_001', title: 'Coffee at Starbucks', amount: -4.50, category: 'Food & Drinks' },
  { user_id: 'test_user_001', title: 'Grocery Shopping', amount: -85.20, category: 'Shopping' },
  { user_id: 'test_user_001', title: 'Salary Deposit', amount: 3500.00, category: 'Work/Business' },
  { user_id: 'test_user_001', title: 'Netflix Subscription', amount: -15.99, category: 'Subscriptions' },
  { user_id: 'test_user_001', title: 'Gas Station', amount: -45.30, category: 'Transportation' },
  
  // Transacciones para Bob (EUR)
  { user_id: 'test_user_002', title: 'Restaurant Dinner', amount: -32.50, category: 'Food & Drinks' },
  { user_id: 'test_user_002', title: 'Movie Tickets', amount: -18.00, category: 'Entertainment' },
  { user_id: 'test_user_002', title: 'Freelance Payment', amount: 800.00, category: 'Work/Business' },
  { user_id: 'test_user_002', title: 'Electricity Bill', amount: -65.75, category: 'Bills' },
  { user_id: 'test_user_002', title: 'Books Purchase', amount: -24.99, category: 'Education' },
  
  // Transacciones para Carol (GBP)
  { user_id: 'test_user_003', title: 'Lunch Meeting', amount: -15.80, category: 'Food & Drinks' },
  { user_id: 'test_user_003', title: 'Train Ticket', amount: -22.40, category: 'Transportation' },
  { user_id: 'test_user_003', title: 'Client Payment', amount: 1200.00, category: 'Work/Business' },
  { user_id: 'test_user_003', title: 'Gym Membership', amount: -35.00, category: 'Sports' },
  { user_id: 'test_user_003', title: 'Pet Food', amount: -28.50, category: 'Pets' }
];

const testSettings = [
  {
    user_id: 'test_user_001',
    total_amount: 2000.00,
    period_days: 30,
    start_date: '2025-01-01'
  },
  {
    user_id: 'test_user_002', 
    total_amount: 1500.00,
    period_days: 15,
    start_date: '2025-01-10'
  },
  {
    user_id: 'test_user_003',
    total_amount: 2500.00,
    period_days: 45,
    start_date: '2024-12-15'
  }
];

async function cleanupTestData() {
  try {
    log.info("Cleaning up existing test data...");
    
    // Eliminar transacciones de prueba
    await sql`DELETE FROM transactions WHERE user_id LIKE 'test_user_%'`;
    
    // Eliminar configuraciones de prueba
    await sql`DELETE FROM user_settings WHERE user_id LIKE 'test_user_%'`;
    
    // Eliminar cuentas de prueba
    await sql`DELETE FROM account WHERE user_id LIKE 'test_user_%'`;
    
    log.success("Test data cleanup completed");
  } catch (error) {
    log.error(`Cleanup failed: ${error.message}`);
    throw error;
  }
}

async function insertTestAccounts() {
  try {
    log.info("Inserting test accounts...");
    
    for (const user of testUsers) {
      await sql`
        INSERT INTO account (user_id, username, currency_preference)
        VALUES (${user.user_id}, ${user.username}, ${user.currency_preference})
      `;
      log.data(`Account created: ${user.username} (${user.currency_preference})`);
    }
    
    log.success(`${testUsers.length} test accounts inserted`);
  } catch (error) {
    log.error(`Account insertion failed: ${error.message}`);
    throw error;
  }
}

async function insertTestSettings() {
  try {
    log.info("Inserting test user settings...");
    
    for (const setting of testSettings) {
      await sql`
        INSERT INTO user_settings (user_id, total_amount, period_days, start_date)
        VALUES (${setting.user_id}, ${setting.total_amount}, ${setting.period_days}, ${setting.start_date})
      `;
      log.data(`Settings created for ${setting.user_id}: ${setting.total_amount} over ${setting.period_days} days`);
    }
    
    log.success(`${testSettings.length} user settings inserted`);
  } catch (error) {
    log.error(`Settings insertion failed: ${error.message}`);
    throw error;
  }
}

async function insertTestTransactions() {
  try {
    log.info("Inserting test transactions...");
    
    for (const transaction of testTransactions) {
      await sql`
        INSERT INTO transactions (user_id, title, amount, category)
        VALUES (${transaction.user_id}, ${transaction.title}, ${transaction.amount}, ${transaction.category})
      `;
      
      const type = transaction.amount > 0 ? 'income' : 'expense';
      const symbol = transaction.amount > 0 ? '+' : '';
      log.data(`${type}: ${transaction.title} → ${symbol}${transaction.amount}`);
    }
    
    log.success(`${testTransactions.length} test transactions inserted`);
  } catch (error) {
    log.error(`Transaction insertion failed: ${error.message}`);
    throw error;
  }
}

async function verifyInsertedData() {
  try {
    log.info("Verifying inserted data...");
    
    // Verificar cuentas
    const accounts = await sql`SELECT COUNT(*) as count FROM account WHERE user_id LIKE 'test_user_%'`;
    log.data(`Accounts in DB: ${accounts[0].count}`);
    
    // Verificar configuraciones
    const settings = await sql`SELECT COUNT(*) as count FROM user_settings WHERE user_id LIKE 'test_user_%'`;
    log.data(`Settings in DB: ${settings[0].count}`);
    
    // Verificar transacciones
    const transactions = await sql`SELECT COUNT(*) as count FROM transactions WHERE user_id LIKE 'test_user_%'`;
    log.data(`Transactions in DB: ${transactions[0].count}`);
    
    // Verificar datos por usuario
    for (const user of testUsers) {
      const userTransactions = await sql`
        SELECT COUNT(*) as count, 
               SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income,
               SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as total_expenses
        FROM transactions 
        WHERE user_id = ${user.user_id}
      `;
      
      const userAccount = await sql`SELECT username, currency_preference FROM account WHERE user_id = ${user.user_id}`;
      
      if (userAccount.length > 0) {
        log.data(`${userAccount[0].username}: ${userTransactions[0].count} transactions, Income: +${userTransactions[0].total_income || 0}, Expenses: ${userTransactions[0].total_expenses || 0} ${userAccount[0].currency_preference}`);
      }
    }
    
    log.success("Data verification completed");
    
    if (accounts[0].count != testUsers.length || 
        settings[0].count != testSettings.length || 
        transactions[0].count != testTransactions.length) {
      throw new Error("Data count mismatch");
    }
    
  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
    throw error;
  }
}

async function testComplexQueries() {
  try {
    log.info("Testing complex queries...");
    
    // Test JOIN entre account y transactions
    const userSummary = await sql`
      SELECT a.username, a.currency_preference,
             COUNT(t.id) as transaction_count,
             SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_income,
             SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as total_spent
      FROM account a
      LEFT JOIN transactions t ON a.user_id = t.user_id
      WHERE a.user_id LIKE 'test_user_%'
      GROUP BY a.user_id, a.username, a.currency_preference
      ORDER BY a.username
    `;
    
    log.data("User Summary Report:");
    userSummary.forEach(user => {
      log.data(`  ${user.username}: ${user.transaction_count} trans, Income: ${user.total_income || 0}, Spent: ${user.total_spent || 0} ${user.currency_preference}`);
    });
    
    // Test JOIN con settings
    const userBudgets = await sql`
      SELECT a.username, s.total_amount, s.period_days,
             SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as spent,
             (s.total_amount - SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END)) as remaining
      FROM account a
      JOIN user_settings s ON a.user_id = s.user_id
      LEFT JOIN transactions t ON a.user_id = t.user_id
      WHERE a.user_id LIKE 'test_user_%'
      GROUP BY a.user_id, a.username, s.total_amount, s.period_days
    `;
    
    log.data("Budget Analysis:");
    userBudgets.forEach(budget => {
      const percentage = ((budget.spent || 0) / budget.total_amount * 100).toFixed(1);
      log.data(`  ${budget.username}: Spent ${budget.spent || 0}/${budget.total_amount} (${percentage}%) over ${budget.period_days} days`);
    });
    
    log.success("Complex queries test passed");
    
  } catch (error) {
    log.error(`Complex queries test failed: ${error.message}`);
    throw error;
  }
}

async function runDataImportTest() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 DATABASE IMPORT & FUNCTIONALITY TEST");
  console.log("=".repeat(60));

  try {
    await cleanupTestData();
    await insertTestAccounts();
    await insertTestSettings();
    await insertTestTransactions();
    await verifyInsertedData();
    await testComplexQueries();
    
    console.log("\n" + "=".repeat(60));
    log.success("🎉 ALL IMPORT TESTS PASSED! Database is fully functional.");
    console.log("=".repeat(60));
    
    log.warning("Note: Test data has been inserted. Use the cleanup option to remove it.");
    console.log("\nOptions:");
    console.log("- Keep test data: node scripts/data-import.js --keep");
    console.log("- Clean test data: node scripts/data-import.js --clean");
    
  } catch (error) {
    console.log("\n" + "=".repeat(60));
    log.error("🚨 IMPORT TEST FAILED!");
    log.error(`Error: ${error.message}`);
    console.log("=".repeat(60));
    
    // Intentar limpiar en caso de error
    try {
      await cleanupTestData();
      log.info("Cleanup completed after error");
    } catch (cleanupError) {
      log.error(`Cleanup after error failed: ${cleanupError.message}`);
    }
    
    process.exit(1);
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--clean')) {
  console.log("🧹 Cleaning test data...");
  cleanupTestData()
    .then(() => {
      log.success("Test data cleaned successfully!");
      process.exit(0);
    })
    .catch((error) => {
      log.error(`Cleanup failed: ${error.message}`);
      process.exit(1);
    });
} else if (args.includes('--keep')) {
  // Solo ejecutar las importaciones sin limpiar al final
  runDataImportTest().catch((error) => {
    log.error(`Import test crashed: ${error.message}`);
    process.exit(1);
  });
} else {
  // Ejecutar test completo y limpiar al final
  runDataImportTest()
    .then(async () => {
      log.info("Cleaning up test data...");
      await cleanupTestData();
      log.success("Test data cleaned. Database returned to original state.");
    })
    .catch((error) => {
      log.error(`Import test crashed: ${error.message}`);
      process.exit(1);
    });
}
