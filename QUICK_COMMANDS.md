# QuantaFolio Navigator - Quick Commands Guide

## Development Scripts

### Start All Services

```powershell
.\start-dev.ps1
```

Launches all three services in separate PowerShell windows:

- Quantum Service (Flask) - Port 5000
- Backend (Spring Boot + Maven) - Port 8080
- Frontend (React + Vite) - Port 5173

---

### Stop All Services

```powershell
.\stop-dev.ps1
```

Gracefully stops all running services by port.

---

### Restart All Services

```powershell
.\restart-dev.ps1
```

Stops and restarts all services (equivalent to stop + start).

---

### Check Service Status

```powershell
.\check-services.ps1
```

Displays health status of all services with HTTP health checks.

---

### Check Port Usage

```powershell
.\check-ports.ps1
```

Shows which processes are using ports 5000, 8080, and 5173.

---

## Manual Commands

### Backend (Spring Boot + Maven)

```powershell
# Start
cd backend
.\mvnw.cmd spring-boot:run

# Clean build
.\mvnw.cmd clean install

# Skip tests
.\mvnw.cmd spring-boot:run -DskipTests

# Or use dedicated script
.\start-spring-boot.ps1
```

---

### Frontend (React + Vite)

```powershell
# Start dev server
cd frontend
npm run dev

# Build for production
npm run build

# Install dependencies
npm install
```

---

### Quantum Service (Flask)

```powershell
# Start
cd python-backend
python app.py

# Install dependencies
pip install -r requirements.txt
```

**Note:** The Flask service is located in `python-backend` directory (not `quantum_service`).

---

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React UI |
| **Backend API** | http://localhost:8080 | Spring Boot REST API |
| **Quantum Service** | http://localhost:5000 | Flask Quantum Optimizer |
| **Flask Health** | http://localhost:5000/api/health | Flask Health Check |
| **Backend Health** | http://localhost:8080/actuator/health | Spring Boot Health Check |
| **API Docs** | http://localhost:8080/swagger-ui.html | Swagger UI (if enabled) |
| **H2 Console** | http://localhost:8080/h2-console | Database Console |

---

## Troubleshooting

### Port Already in Use

```powershell
# Check what's using a port
Get-NetTCPConnection -LocalPort 8080

# Kill process by PID
Stop-Process -Id <PID> -Force

# Or use stop script
.\stop-dev.ps1

# Or use port check script
.\check-ports.ps1
```

---

### Backend Won't Start

```powershell
# Check Java version (needs Java 17+)
java -version

# Clean Maven cache
cd backend
.\mvnw.cmd clean

# Check logs
.\mvnw.cmd spring-boot:run

# Verify Maven Wrapper exists
Test-Path .\mvnw.cmd
```

**Important:** This project uses **Maven**, not Gradle. Use `.\mvnw.cmd`, not `./gradlew`.

---

### Frontend Build Errors

```powershell
# Clear node_modules and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
npm install

# Check Node version (needs Node 16+)
node -version
```

---

### Quantum Service Import Errors

```powershell
# Reinstall Python dependencies
cd python-backend
pip install -r requirements.txt --force-reinstall

# Check Python version (needs Python 3.8+)
python --version

# Verify Flask app
python -c "import flask; print(flask.__version__)"
```

---

## Database Access

### H2 Console (In-Memory)

- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (leave empty)

---

## Environment Variables

### Backend (application.properties or application.yml)

```properties
server.port=8080

spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
```

---

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8080
VITE_QUANTUM_API_URL=http://localhost:5000
```

---

### Quantum Service (Flask)

```env
FLASK_APP=app.py
FLASK_ENV=development
PORT=5000
PYTHONIOENCODING=utf-8
PYTHONUTF8=1
```

**Note:** Windows users should set `PYTHONIOENCODING=utf-8` to avoid encoding issues.

---

## Common Tasks

### Add New Maven Dependency

```powershell
# Edit backend/pom.xml, then:
cd backend
.\mvnw.cmd clean install
```

---

### Update Frontend Dependencies

```powershell
cd frontend
npm update
npm audit fix
```

---

### Test Backend API

```powershell
# Health check
curl http://localhost:8080/actuator/health

# Stock search
curl "http://localhost:8080/api/stocks/search?query=AAPL"

# Portfolio optimization
curl -X POST http://localhost:8080/api/optimize `
  -H "Content-Type: application/json" `
  -d '{"tickers":["AAPL","GOOGL"],"initialWeights":[0.5,0.5],"riskFactor":0.5}'
```

---

### Test Flask Quantum Service

```powershell
# Health check
curl http://localhost:5000/api/health

# Portfolio optimization
curl -X POST http://localhost:5000/api/optimize `
  -H "Content-Type: application/json" `
  -d '{"tickers":["AAPL","GOOGL","MSFT"],"risk_factor":0.5,"method":"quantum","period":"1y"}'
```

---

## Production Deployment

### Build All

```powershell
# Backend JAR
cd backend
.\mvnw.cmd clean package

# Frontend static files
cd frontend
npm run build
```

---

### Run Production Build

```powershell
# Backend
java -jar backend/target/toandfrom-0.0.1-SNAPSHOT.jar

# Frontend (requires static server)
cd frontend/dist
npx serve -s .
```

---

## Project Structure

```
To-From/
├── backend/              # Spring Boot Backend (Maven)
│   ├── mvnw.cmd          # Maven Wrapper
│   ├── pom.xml           # Maven dependencies
│   └── src/
├── frontend/             # React + Vite Frontend
│   ├── package.json
│   └── src/
├── python-backend/       # Flask Quantum Service
│   ├── app.py           # Flask application
│   ├── optimizer.py     # Quantum optimizer
│   └── requirements.txt
├── start-dev.ps1        # Start all services
├── stop-dev.ps1         # Stop all services
├── restart-dev.ps1      # Restart all services
├── check-services.ps1   # Health check
└── check-ports.ps1      # Port usage check
```

---

## Additional Resources

- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [React Docs](https://react.dev)
- [Qiskit Docs](https://qiskit.org/documentation/)
- [Maven Wrapper Docs](https://maven.apache.org/wrapper/)
- [Flask Docs](https://flask.palletsprojects.com/)

---

## Quick Reference

| Task | Command |
|------|---------|
| Start all | `.\start-dev.ps1` |
| Stop all | `.\stop-dev.ps1` |
| Restart all | `.\restart-dev.ps1` |
| Check status | `.\check-services.ps1` |
| Check ports | `.\check-ports.ps1` |
| Backend only | `cd backend; .\mvnw.cmd spring-boot:run` |
| Frontend only | `cd frontend; npm run dev` |
| Flask only | `cd python-backend; python app.py` |
