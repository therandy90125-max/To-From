# Testing Guide for ToAndFrom

Step-by-step testing procedure to verify all components work correctly.

---

## Pre-Test Checklist

Before starting tests, ensure you have:
- [ ] MariaDB installed and credentials ready (root/0000)
- [ ] Python 3.8+ with pip
- [ ] Java JDK 17+
- [ ] Node.js 16+
- [ ] All terminals ready to run commands

---

## TEST 1: MariaDB Connection

### 1.1 Start MariaDB Service

```powershell
# Windows
net start MariaDB

# Verify service is running
sc query MariaDB
```

**Expected Output:**
```
STATE              : 4  RUNNING
```

### 1.2 Create Database

```powershell
# Connect to MariaDB
mysql -u root -p
# Enter password: 0000
```

```sql
-- Inside MySQL prompt
CREATE DATABASE IF NOT EXISTS toandfrom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
USE toandfrom;
SELECT DATABASE();
EXIT;
```

**Expected Output:**
```
Query OK, 1 row affected
+--------------------+
| Database           |
+--------------------+
| toandfrom          |
+--------------------+
Database changed
+-----------+
| toandfrom |
+-----------+
```

### 1.3 Verify Connection Settings

Check `To-From/backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/toandfrom?useSSL=false&serverTimezone=Asia/Seoul
    username: root
    password: 0000
```

✅ **TEST 1 PASSED** if database created successfully

---

## TEST 2: Flask Backend

### 2.1 Install Dependencies

```powershell
cd To-From\python-backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate

# Verify activation (should show (venv) in prompt)
# Install requirements
pip install -r requirements.txt
```

**Expected Output:**
```
Successfully installed flask-3.0.0 qiskit-0.45.0 ...
```

### 2.2 Start Flask Server

```powershell
# Make sure you're in python-backend with venv activated
python app.py
```

**Expected Output:**
```
ToAndFrom Portfolio Optimization API 서버 시작
==================================================
API 엔드포인트:
   GET  /              - API 정보
   GET  /api/health    - 서버 상태
   POST /api/optimize  - 포트폴리오 최적화
   POST /api/optimize/batch - 배치 최적화
==================================================
서버 실행: http://localhost:5000
==================================================
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
```

### 2.3 Test Flask Endpoints

**Open a NEW terminal/PowerShell window:**

```powershell
# Test 1: Health check
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "ToAndFrom Portfolio Optimizer"
}
```

```powershell
# Test 2: Root endpoint
curl http://localhost:5000/
```

**Expected Response:**
```json
{
  "message": "✅ ToAndFrom Portfolio Optimization API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

```powershell
# Test 3: Simple optimization (Classical - Fast)
curl -X POST http://localhost:5000/api/optimize `
  -H "Content-Type: application/json" `
  -d '{\"tickers\":[\"AAPL\",\"GOOGL\"],\"risk_factor\":0.5,\"method\":\"classical\",\"period\":\"1mo\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "selected_tickers": ["AAPL", "GOOGL"],
    "weights": [0.5, 0.5],
    "expected_return": 0.xxxx,
    "risk": 0.xxxx,
    "sharpe_ratio": 0.xxxx,
    "method": "classical"
  }
}
```

✅ **TEST 2 PASSED** if all 3 endpoints return successful responses

---

## TEST 3: Spring Boot Backend

### 3.1 Build Spring Boot

**Open a NEW terminal:**

```powershell
cd To-From\backend

# Clean build (first time)
.\mvnw clean install -DskipTests
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time:  XX.XXX s
```

### 3.2 Start Spring Boot

```powershell
# Same terminal
.\mvnw spring-boot:run
```

**Expected Output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.3)

...
INFO ... : Tomcat started on port(s): 8080 (http)
INFO ... : Started ToandfromApplication in X.XXX seconds
```

**Watch for:**
- ✅ No MariaDB connection errors
- ✅ Port 8080 started successfully
- ✅ "Started ToandfromApplication" message

### 3.3 Verify Database Tables Created

**In a NEW terminal:**

```powershell
mysql -u root -p toandfrom
```

```sql
SHOW TABLES;
DESCRIBE portfolio_results;
DESCRIBE stock_weights;
EXIT;
```

**Expected Output:**
```
+---------------------+
| Tables_in_toandfrom |
+---------------------+
| portfolio_results   |
| stock_weights       |
+---------------------+
2 rows in set
```

### 3.4 Test Spring Boot Endpoints

**In a NEW terminal:**

```powershell
# Test 1: Flask health check via Spring Boot proxy
curl http://localhost:8080/api/portfolio/health/flask
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "ToAndFrom Portfolio Optimizer"
}
```

```powershell
# Test 2: Optimization via Spring Boot → Flask
curl -X POST http://localhost:8080/api/portfolio/optimize `
  -H "Content-Type: application/json" `
  -d '{\"tickers\":[\"AAPL\",\"MSFT\"],\"risk_factor\":0.5,\"method\":\"classical\",\"period\":\"1mo\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "selected_tickers": ["AAPL", "MSFT"],
    "weights": [...],
    ...
  }
}
```

```powershell
# Test 3: Optimization with auto-save
curl -X POST http://localhost:8080/api/portfolio/optimize `
  -H "Content-Type: application/json" `
  -d '{\"tickers\":[\"AAPL\",\"GOOGL\"],\"risk_factor\":0.5,\"method\":\"classical\",\"period\":\"1mo\",\"auto_save\":true}'
```

**Then verify in database:**
```sql
mysql -u root -p toandfrom
SELECT * FROM portfolio_results;
SELECT * FROM stock_weights;
EXIT;
```

**Expected:** Should see 1 row in `portfolio_results` and 2 rows in `stock_weights`

```powershell
# Test 4: Chatbot endpoint
curl -X POST http://localhost:8080/api/chatbot/chat `
  -H "Content-Type: application/json" `
  -d '{\"message\":\"What is Sharpe Ratio?\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "response": "샤프 비율(Sharpe Ratio)은 투자 수익률을 위험으로 조정한 지표입니다...",
  "language": "ko"
}
```

✅ **TEST 3 PASSED** if:
- Tables created automatically
- All 4 endpoints return successful responses
- Data saved to database when auto_save=true

---

## TEST 4: Frontend Integration

### 4.1 Install Frontend Dependencies

**Open a NEW terminal:**

```powershell
cd To-From\frontend

# Install packages
npm install
```

**Expected Output:**
```
added XXX packages in XXs
```

### 4.2 Start Frontend

```powershell
# Same terminal
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4.3 Manual Browser Testing

Open browser: http://localhost:5173

#### Test 4.3.1: Dashboard Quick Optimize

1. Navigate to Dashboard
2. In the "Optimizer" widget:
   - Enter tickers: `AAPL,GOOGL,MSFT`
   - Set target risk: `0.15`
   - Click "최적화" button
3. **Expected**: 
   - Loading indicator appears
   - After ~10-30 seconds, results appear in "Optimization Result" widget
   - Should show Sharpe Ratio and other metrics

**Open Browser DevTools (F12) → Network Tab:**
- ✅ Request goes to `http://localhost:5173/api/portfolio/optimize/with-weights`
- ✅ Request proxied to Spring Boot (8080), NOT Flask (5000)

#### Test 4.3.2: Portfolio Optimizer Page

1. Click "Go to Optimizer Page" button
2. Enter:
   - Tickers: `AAPL,GOOGL,MSFT`
   - Weights: `0.4,0.4,0.2`
   - Risk Factor: `0.5`
   - Method: `Classical Optimization (Fast)`
   - Period: `1 Month`
3. Click "🚀 Run Optimization"
4. **Expected**:
   - Results appear with original vs optimized comparison
   - Pie charts show weight distributions
   - Performance metrics show improvements

**Check DevTools Network:**
- ✅ Request to `/api/portfolio/optimize/with-weights`
- ✅ Proxied through Spring Boot

#### Test 4.3.3: Auto-Save Feature

1. Go to Settings page
2. Enable "Auto Save" checkbox
3. Verify: `localStorage.getItem('autoSave')` in DevTools Console should return `"true"`
4. Go back to Optimizer
5. Run optimization (same as above)
6. **Verify in database:**

```powershell
mysql -u root -p toandfrom
SELECT COUNT(*) FROM portfolio_results WHERE auto_saved = 1;
-- Should return: 1 (or more if you ran multiple times)
EXIT;
```

#### Test 4.3.4: Chatbot

1. Navigate to Chatbot page
2. Click quick question: "What is Sharpe Ratio?"
3. **Expected**: Bot responds with explanation
4. Type custom question: "What is portfolio optimization?"
5. **Expected**: Bot responds

**Check DevTools Network:**
- ✅ Request to `/api/chatbot/chat`
- ✅ Proxied through Spring Boot

✅ **TEST 4 PASSED** if:
- All pages load without errors
- Optimization returns results
- Auto-save writes to database
- Chatbot responds correctly
- All requests go through Spring Boot (port 8080)

---

## TEST 5: End-to-End Integration

### 5.1 Full Workflow Test

**Scenario: User optimizes portfolio with auto-save**

1. **Setup**: Enable auto-save in Settings
2. **Action**: Optimize portfolio (AAPL, GOOGL, MSFT with weights 0.4, 0.4, 0.2)
3. **Verify**:
   - Frontend displays results
   - Spring Boot logs show Flask request
   - Flask logs show optimization execution
   - Database has new records

### 5.2 Verify Data Flow

```sql
-- Check saved data
SELECT 
    id,
    tickers,
    method,
    expected_return,
    sharpe_ratio,
    auto_saved,
    created_at
FROM portfolio_results
ORDER BY created_at DESC
LIMIT 1;

-- Check stock weights
SELECT 
    sw.ticker,
    sw.weight,
    sw.is_optimized
FROM stock_weights sw
JOIN portfolio_results pr ON sw.portfolio_result_id = pr.id
ORDER BY pr.created_at DESC, sw.is_optimized DESC
LIMIT 10;
```

**Expected Output:**
```
+----+----------------------+-----------+------------------+--------------+------------+---------------------+
| id | tickers              | method    | expected_return  | sharpe_ratio | auto_saved | created_at          |
+----+----------------------+-----------+------------------+--------------+------------+---------------------+
|  1 | AAPL,GOOGL,MSFT      | classical |          0.12345 |       1.2345 |          1 | 2025-11-06 ...      |
+----+----------------------+-----------+------------------+--------------+------------+---------------------+

+--------+--------+--------------+
| ticker | weight | is_optimized |
+--------+--------+--------------+
| AAPL   | 0.5    |            1 |
| GOOGL  | 0.3    |            1 |
| MSFT   | 0.2    |            1 |
| AAPL   | 0.4    |            0 |
| GOOGL  | 0.4    |            0 |
| MSFT   | 0.2    |            0 |
+--------+--------+--------------+
```

✅ **TEST 5 PASSED** if data flows correctly through entire stack

---

## Troubleshooting Common Issues

### Issue 1: Spring Boot Can't Connect to MariaDB

**Error:** `Communications link failure`

**Solution:**
```powershell
# Verify MariaDB is running
sc query MariaDB

# Test connection manually
mysql -u root -p -h localhost -P 3306

# Check firewall
netsh advfirewall firewall show rule name=all | findstr 3306
```

### Issue 2: Spring Boot Can't Connect to Flask

**Error:** `Connection refused: connect`

**Solution:**
```powershell
# Verify Flask is running
curl http://localhost:5000/api/health

# Check if port is listening
netstat -ano | findstr :5000
```

### Issue 3: Frontend Can't Reach Spring Boot

**Error:** Network error in browser console

**Solution:**
1. Verify Spring Boot is running on 8080
2. Check Vite proxy configuration in `vite.config.js`:
   ```javascript
   proxy: {
     "/api": {
       target: "http://127.0.0.1:8080"
     }
   }
   ```

### Issue 4: Database Tables Not Created

**Error:** No tables in database

**Solution:**
Check `application.yml`:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Should be "update" or "create"
```

Restart Spring Boot and check logs for Hibernate DDL statements

---

## Test Results Summary

| Test | Component | Status | Notes |
|------|-----------|--------|-------|
| 1.1 | MariaDB Service | ⬜ | Service running |
| 1.2 | Database Creation | ⬜ | `toandfrom` database exists |
| 2.1 | Flask Dependencies | ⬜ | All packages installed |
| 2.2 | Flask Server | ⬜ | Running on port 5000 |
| 2.3 | Flask Endpoints | ⬜ | Health & optimize working |
| 3.1 | Spring Boot Build | ⬜ | Build successful |
| 3.2 | Spring Boot Server | ⬜ | Running on port 8080 |
| 3.3 | Database Tables | ⬜ | Tables auto-created |
| 3.4 | Spring Boot Endpoints | ⬜ | All endpoints working |
| 4.1 | Frontend Install | ⬜ | Dependencies installed |
| 4.2 | Frontend Server | ⬜ | Running on port 5173 |
| 4.3 | UI Functionality | ⬜ | All pages work |
| 5 | End-to-End Flow | ⬜ | Complete data flow verified |

✅ = Passed  
❌ = Failed  
⬜ = Not tested yet

---

## Next Steps After Testing

Once all tests pass:

1. **Performance Testing**: Test with quantum optimization (slower)
2. **Load Testing**: Multiple concurrent requests
3. **Error Handling**: Test with invalid data
4. **Security**: Add authentication/authorization
5. **Monitoring**: Set up logging and metrics

---

Good luck with testing! 🚀

Report any failing tests with:
- Error message
- Which test failed
- Console/log output

