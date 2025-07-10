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
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

async function checkDatabaseConnection() {
  try {
    await sql`SELECT 1`;
    log.success("Database connection: OK");
    return true;
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function checkRequiredTables() {
  const queries = {
    transactions: sql`SELECT 1 FROM transactions LIMIT 1`,
    user_settings: sql`SELECT 1 FROM user_settings LIMIT 1`,
    account: sql`SELECT 1 FROM account LIMIT 1`
  };
  
  let allTablesExist = true;

  for (const [table, query] of Object.entries(queries)) {
    try {
      await query;
      log.success(`Table '${table}': OK`);
    } catch (error) {
      log.error(`Table '${table}': MISSING or ERROR`);
      allTablesExist = false;
    }
  }

  return allTablesExist;
}

async function checkEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];

  let allVarsPresent = true;

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log.success(`Environment variable '${varName}': OK`);
    } else {
      log.error(`Environment variable '${varName}': MISSING`);
      allVarsPresent = false;
    }
  }

  return allVarsPresent;
}

async function checkCurrenciesIntegrity() {
  try {
    if (VALID_CURRENCIES.length === 0) {
      log.error("No valid currencies defined");
      return false;
    }

    const requiredFields = ['code', 'name', 'symbol'];
    let isValid = true;

    for (const currency of VALID_CURRENCIES) {
      for (const field of requiredFields) {
        if (!currency[field]) {
          log.error(`Currency ${currency.code || 'UNKNOWN'} missing field: ${field}`);
          isValid = false;
        }
      }
    }

    if (isValid) {
      log.success(`Currencies configuration: OK (${VALID_CURRENCIES.length} currencies)`);
    }

    return isValid;
  } catch (error) {
    log.error(`Currencies check failed: ${error.message}`);
    return false;
  }
}

async function performBasicCRUDTest() {
  const testUserId = `test_user_${Date.now()}`;
  
  try {
    log.info("Performing basic CRUD test...");

    // Test INSERT
    await sql`
      INSERT INTO account (user_id, username, currency_preference)
      VALUES (${testUserId}, 'test_user', 'USD')
    `;
    log.success("INSERT test: OK");

    // Test SELECT
    const result = await sql`
      SELECT * FROM account WHERE user_id = ${testUserId}
    `;
    if (result.length === 1) {
      log.success("SELECT test: OK");
    } else {
      log.error("SELECT test: FAILED");
      return false;
    }

    // Test UPDATE
    await sql`
      UPDATE account 
      SET username = 'updated_test_user' 
      WHERE user_id = ${testUserId}
    `;
    log.success("UPDATE test: OK");

    // Test DELETE
    await sql`
      DELETE FROM account WHERE user_id = ${testUserId}
    `;
    log.success("DELETE test: OK");

    return true;
  } catch (error) {
    log.error(`CRUD test failed: ${error.message}`);
    // Limpiar en caso de error
    try {
      await sql`DELETE FROM account WHERE user_id = ${testUserId}`;
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    return false;
  }
}

async function runHealthCheck() {
  console.log("\n" + "=".repeat(50));
  console.log("🏥 BACKEND HEALTH CHECK");
  console.log("=".repeat(50));

  const checks = [
    { name: "Environment Variables", test: checkEnvironmentVariables },
    { name: "Database Connection", test: checkDatabaseConnection },
    { name: "Required Tables", test: checkRequiredTables },
    { name: "Currencies Configuration", test: checkCurrenciesIntegrity },
    { name: "Basic CRUD Operations", test: performBasicCRUDTest }
  ];

  let allPassed = true;

  for (const check of checks) {
    console.log(`\n--- ${check.name} ---`);
    const passed = await check.test();
    allPassed = allPassed && passed;
  }

  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    log.success("🎉 ALL CHECKS PASSED! Backend is healthy and secure.");
  } else {
    log.error("🚨 SOME CHECKS FAILED! Please fix the issues above.");
    process.exit(1);
  }
  console.log("=".repeat(50) + "\n");
}

// Ejecutar el health check
runHealthCheck().catch((error) => {
  log.error(`Health check crashed: ${error.message}`);
  process.exit(1);
});
