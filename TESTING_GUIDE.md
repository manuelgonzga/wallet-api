# 🧪 Database Testing & Import Scripts

## 📋 Available Test Scripts

### 1. **Quick Database Test**
```bash
npm run quick-test
```
**What it does:**
- ✅ Checks all table record counts
- ✅ Tests INSERT operations on all tables
- ✅ Tests SELECT operations 
- ✅ Verifies data integrity
- ✅ Automatic cleanup
- ⏱️ **Duration:** ~5 seconds

**Example Output:**
```
🔍 Quick Database Test
📊 Table 'account': 0 records
📊 Table 'user_settings': 0 records  
📊 Table 'transactions': 0 records
🧪 Testing INSERT operations...
✅ Account INSERT: OK
✅ Settings INSERT: OK
✅ Transaction INSERT: OK
🔍 Testing SELECT operations...
✅ Account SELECT: Found 1 record(s)
✅ Settings SELECT: Found 1 record(s) 
✅ Transactions SELECT: Found 1 record(s)
📋 Account: test_user (EUR)
📋 Transaction: Test Coffee → -3.5€
🧹 Cleaning up test data...
✅ Cleanup completed
🎉 Database is working perfectly!
```

---

### 2. **Comprehensive Health Check**
```bash
npm run health-check
```
**What it does:**
- ✅ Environment variables verification
- ✅ Database connection test
- ✅ Table existence verification
- ✅ Currency configuration validation
- ✅ Full CRUD operations test
- ⏱️ **Duration:** ~10 seconds

**Checks performed:**
- Database connectivity
- All required tables present
- Valid currency configurations
- INSERT/SELECT/UPDATE/DELETE operations

---

### 3. **Import Validation Test**
```bash
npm run test-imports
```
**What it does:**
- ✅ Tests all module imports
- ✅ Verifies server dependencies
- ✅ Checks route configurations
- ✅ Validates middleware loading
- ⏱️ **Duration:** ~3 seconds

---

### 4. **Full Data Import Test**
```bash
npm run data-import
```
**What it does:**
- ✅ Creates 3 test users with different currencies
- ✅ Inserts 15 realistic transactions
- ✅ Creates user settings for each user
- ✅ Tests complex JOIN queries
- ✅ Generates user summary reports
- ✅ Auto-cleanup after testing
- ⏱️ **Duration:** ~15 seconds

**Test Data Created:**
- **Alice Walker (USD):** 5 transactions, $3,500 income, $150.99 expenses
- **Bob Smith (EUR):** 5 transactions, €800 income, €141.24 expenses  
- **Carol Jones (GBP):** 5 transactions, £1,200 income, £101.70 expenses

---

### 5. **Data Import (Keep Data)**
```bash
npm run data-import -- --keep
```
**What it does:**
- Same as above but **keeps test data** for manual inspection
- Useful for frontend testing with real data
- **Remember to clean up:** `npm run data-clean`

---

### 6. **Clean Test Data**
```bash
npm run data-clean
```
**What it does:**
- ✅ Removes all test data (users starting with 'test_user_')
- ✅ Cleans transactions, settings, and accounts
- ✅ Safe - only removes test data, keeps real data

---

## 🎯 **Recommended Testing Workflow**

### **Daily Development:**
```bash
npm run quick-test
```

### **Before Deployment:**
```bash
npm run health-check
npm run test-imports  
npm run data-import
```

### **Manual Testing Setup:**
```bash
npm run data-import -- --keep
# Do your manual testing...
npm run data-clean
```

---

## 📊 **Test Data Structure**

### **Accounts Table:**
```sql
user_id: test_user_001, test_user_002, test_user_003
username: alice_walker, bob_smith, carol_jones
currency_preference: USD, EUR, GBP
```

### **Transaction Categories Tested:**
- Food & Drinks
- Shopping  
- Work/Business
- Subscriptions
- Transportation
- Entertainment
- Bills
- Education
- Sports
- Pets

### **Realistic Amounts:**
- Income: $800 - $3,500
- Expenses: $3.50 - $85.20
- Mixed positive/negative transactions

---

## 🔍 **What Each Test Validates**

| Test | Database | CRUD | Security | Performance | Data Integrity |
|------|----------|------|----------|-------------|----------------|
| quick-test | ✅ | ✅ | ❌ | ❌ | ✅ |
| health-check | ✅ | ✅ | ❌ | ❌ | ✅ |
| test-imports | ❌ | ❌ | ❌ | ✅ | ❌ |
| data-import | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## 🚀 **Success Indicators**

### **All Tests Should Show:**
- ✅ Green checkmarks for all operations
- ✅ Correct record counts
- ✅ No error messages
- ✅ Data consistency across tables
- ✅ Proper JOIN query results

### **If Tests Fail:**
1. Check database connection
2. Verify environment variables
3. Ensure tables exist
4. Check data permissions

---

**🎉 Ready to test! Run `npm run quick-test` to get started.**
