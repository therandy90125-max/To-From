# ToAndFrom Setup Guide

Complete guide to set up and run the ToAndFrom Quantum Portfolio Optimization project.

## Prerequisites

### 1. MariaDB
- **Version**: 10.5+ recommended
- **Installation**: Download from https://mariadb.org/download/
- **Default Port**: 3306

### 2. Python
- **Version**: 3.8+ (3.10 recommended)
- **Required for**: Flask backend with Qiskit

### 3. Java
- **Version**: JDK 17+ (JDK 25 configured in this project)
- **Required for**: Spring Boot backend

### 4. Node.js
- **Version**: 16+ (18+ recommended)
- **Required for**: React frontend with Vite

---

## Step 1: Database Setup (MariaDB)

### Start MariaDB Service

**Windows:**
```powershell
# Start MariaDB service
net start MariaDB

# Or use Services GUI (services.msc)
# Find "MariaDB" and click Start
```

**Linux/Mac:**
```bash
# Start MariaDB
sudo systemctl start mariadb
# or
sudo service mariadb start
```

### Create Database

```sql
# Connect to MariaDB
mysql -u root -p

# Create database
CREATE DATABASE IF NOT EXISTS toandfrom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify database exists
SHOW DATABASES;

# Exit
EXIT;
```

### Verify Connection

Test the connection with the credentials in `application.yml`:
- **URL**: `jdbc:mariadb://localhost:3306/toandfrom`
- **Username**: `root`
- **Password**: `0000`

If you need different credentials, update `To-From/backend/src/main/resources/application.yml`

---

## Step 2: Python Backend (Flask)

### Install Dependencies

```bash
cd To-From/python-backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### Start Flask Server

```bash
# Make sure you're in python-backend directory
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
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
```

### Test Flask API

```powershell
# Test health endpoint
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ToAndFrom Portfolio Optimizer"
}
```

---

## Step 3: Java Backend (Spring Boot)

### Build and Run

```bash
cd To-From/backend

# Clean and install dependencies (first time only)
mvnw clean install

# Run Spring Boot application
mvnw spring-boot:run
```

**Alternative (if Maven is installed globally):**
```bash
mvn spring-boot:run
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
INFO ... : Started ToandfromApplication in X.XXX seconds
```

### Database Tables Auto-Creation

Spring Boot will automatically create these tables on first run (using Hibernate DDL):
- `portfolio_results` - stores optimization results
- `stock_weights` - stores stock weights (original & optimized)

### Test Spring Boot API

```powershell
# Test health endpoint
curl http://localhost:8080/api/portfolio/health/flask
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ToAndFrom Portfolio Optimizer"
}
```

---

## Step 4: Frontend (React + Vite)

### Install Dependencies

```bash
cd To-From/frontend

# Install npm packages (first time only)
npm install
```

### Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Access Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## Verification Checklist

### ✅ All Services Running

| Service | Port | Status Check |
|---------|------|--------------|
| MariaDB | 3306 | `mysql -u root -p -e "SELECT 1;"` |
| Flask | 5000 | http://localhost:5000/api/health |
| Spring Boot | 8080 | http://localhost:8080/api/portfolio/health/flask |
| React/Vite | 5173 | http://localhost:5173 |

### ✅ Service Communication

1. **Frontend → Spring Boot**: Open browser DevTools Network tab, all `/api/*` requests should go to port 8080
2. **Spring Boot → Flask**: Check Spring Boot console logs for Flask API calls
3. **Spring Boot → MariaDB**: Check database tables were created:
   ```sql
   USE toandfrom;
   SHOW TABLES;
   -- Should see: portfolio_results, stock_weights
   ```

### ✅ Feature Testing

1. **Portfolio Optimization**:
   - Navigate to Optimizer page
   - Enter tickers: `AAPL,GOOGL,MSFT`
   - Enter weights: `0.4,0.4,0.2`
   - Click "Optimize"
   - Should see results with improved weights

2. **Auto-Save**:
   - Go to Settings page
   - Enable "Auto Save"
   - Run optimization
   - Check database: `SELECT * FROM portfolio_results;`
   - Should see saved record

3. **Chatbot**:
   - Navigate to Chatbot page
   - Ask: "What is Sharpe Ratio?"
   - Should receive explanation

---

## Troubleshooting

### MariaDB Connection Issues

**Error**: `Connection refused` or `Access denied`

**Solutions**:
1. Verify MariaDB is running: `net start MariaDB` (Windows) or `sudo systemctl status mariadb` (Linux)
2. Check credentials in `application.yml`
3. Reset password if needed:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY '0000';
   FLUSH PRIVILEGES;
   ```

### Flask Not Starting

**Error**: `ModuleNotFoundError: No module named 'qiskit'`

**Solution**:
```bash
pip install qiskit qiskit-aer flask flask-cors yfinance numpy pandas
```

### Spring Boot Build Errors

**Error**: `MariaDB driver not found`

**Solution**:
```bash
mvnw clean install -U
```

### Port Already in Use

**Error**: `Port XXXX is already in use`

**Solutions**:
```powershell
# Windows - Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### Frontend Build Issues

**Error**: `npm install` fails

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## Quick Start Script

### Windows (PowerShell)

Create `start-all.ps1`:
```powershell
# Start MariaDB
net start MariaDB

# Start Flask (in new terminal)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd To-From\python-backend; python app.py"

# Wait for Flask to start
Start-Sleep -Seconds 5

# Start Spring Boot (in new terminal)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd To-From\backend; .\mvnw spring-boot:run"

# Wait for Spring Boot to start
Start-Sleep -Seconds 10

# Start Frontend (in new terminal)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd To-From\frontend; npm run dev"

Write-Host "All services starting... Check each terminal for status."
```

### Linux/Mac (Bash)

Create `start-all.sh`:
```bash
#!/bin/bash

# Start MariaDB
sudo systemctl start mariadb

# Start Flask
cd python-backend
gnome-terminal -- bash -c "python app.py; exec bash"
cd ..

# Wait for Flask
sleep 5

# Start Spring Boot
cd backend
gnome-terminal -- bash -c "./mvnw spring-boot:run; exec bash"
cd ..

# Wait for Spring Boot
sleep 10

# Start Frontend
cd frontend
gnome-terminal -- bash -c "npm run dev; exec bash"
cd ..

echo "All services started!"
```

---

## Production Deployment Notes

### Environment Variables

Create `.env` files for each service:

**Backend (.env)**:
```
SPRING_DATASOURCE_URL=jdbc:mariadb://your-db-host:3306/toandfrom
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password
FLASK_API_URL=http://your-flask-host:5000
```

**Frontend (.env.production)**:
```
VITE_API_URL=https://your-api-domain.com
```

### Security Considerations

1. **Change default passwords** in `application.yml`
2. **Configure CORS** to allow only your production domain
3. **Use HTTPS** for all API endpoints
4. **Enable authentication** for API endpoints
5. **Use environment variables** for sensitive data

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in each service console
3. Verify all prerequisites are installed
4. Ensure all ports are available

Happy optimizing! 🚀

