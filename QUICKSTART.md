# QuantaFolio Navigator - Quickstart Guide

## Prerequisites Checklist

- [ ] Docker Desktop installed and running
- [ ] Git installed
- [ ] 8GB+ RAM available
- [ ] Ports 5000, 5173, 8080, 8082 free

## One-Command Setup

### First Time Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd quantafolio-navigator

# 2. Create environment file
cp .env.example .env
# Edit .env and add your ALPHA_VANTAGE_API_KEY

# 3. Start everything
chmod +x start.sh stop.sh
./start.sh
```

### Daily Usage

```bash
# Start
./start.sh

# Stop
./stop.sh

# View logs
docker-compose logs -f

# Restart single service
docker-compose restart backend
```

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main UI |
| Backend | http://localhost:8080 | REST API |
| Quantum | http://localhost:5000 | Optimization |
| H2 Console | http://localhost:8082 | Database |

## Health Check

```bash
curl http://localhost:5000/api/health  # Quantum
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:5173  # Frontend
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process using port 8080
lsof -ti:8080 | xargs kill -9

# Or for Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Service Won't Start

```bash
# View logs
docker-compose logs <service-name>

# Rebuild container
docker-compose build --no-cache <service-name>
docker-compose up -d <service-name>
```

### Database Issues

```bash
# Reset H2 database
docker-compose down -v
./start.sh
```

### Docker Not Running

1. Start Docker Desktop
2. Wait for it to fully start
3. Run `./start.sh` again

### Permission Denied

```bash
chmod +x start.sh stop.sh
```

---

**Ready to start? Run `./start.sh` and open http://localhost:5173 in your browser!** 🚀

