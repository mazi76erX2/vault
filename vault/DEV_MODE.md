# 🔥 Development Mode with Hot Reload

## Quick Start

### Start Development Environment
```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Stop
docker-compose -f docker-compose.dev.yml down
```

### What's Different in Dev Mode?

#### ✅ **Hot Reload Enabled**
- Changes to `.py` files automatically restart the server
- No need to rebuild Docker after code changes
- Instant feedback during development

#### ✅ **Source Code Mounted**
- `./app/` → `/app/app` (read-only)
- `./main.py` → `/app/main.py` (read-only)
- Changes on your host machine immediately reflect in container

#### ✅ **Debug Logging**
- `LOG_LEVEL=DEBUG` for detailed output
- See all SQL queries, API calls, etc.

#### ✅ **Dev Dependencies Included**
- pytest, black, ruff, mypy
- Can run tests inside container

---

## Usage Examples

### 1. Edit Code with Hot Reload

```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up -d

# Edit any file - server auto-restarts!
echo "# Testing hot reload" >> main.py

# Watch logs to see restart
docker-compose -f docker-compose.dev.yml logs -f backend
```

You'll see:
```
INFO:     Will watch for changes in these directories: ['/app']
INFO:     Uvicorn running on http://0.0.0.0:7860
INFO:     Application startup complete.
INFO:     Detected file change, reloading...
```

### 2. Run Tests Inside Container

```bash
# Run tests
docker-compose -f docker-compose.dev.yml exec backend pytest

# With coverage
docker-compose -f docker-compose.dev.yml exec backend pytest --cov

# Run specific test
docker-compose -f docker-compose.dev.yml exec backend pytest tests/test_api.py
```

### 3. Format Code

```bash
# Format with black
docker-compose -f docker-compose.dev.yml exec backend black .

# Lint with ruff
docker-compose -f docker-compose.dev.yml exec backend ruff check .

# Type check with mypy
docker-compose -f docker-compose.dev.yml exec backend mypy app/
```

### 4. Interactive Python Shell

```bash
# IPython shell
docker-compose -f docker-compose.dev.yml exec backend ipython

# Or regular Python
docker-compose -f docker-compose.dev.yml exec backend python
```

### 5. Database Access

```bash
# Access PostgreSQL
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d vault

# Run migrations
docker-compose -f docker-compose.dev.yml exec backend python -c "from app.database import init_db; init_db()"
```

---

## File Structure

```
vault/
├── docker-compose.yml       ← Production mode
├── docker-compose.dev.yml   ← Development mode (hot reload)
├── Dockerfile               ← Production build
├── Dockerfile.dev           ← Development build
├── main.py                  ← Mounted (hot reload)
└── app/                     ← Mounted (hot reload)
    ├── chat.py
    ├── database.py
    └── ...
```

---

## Performance Notes

### Hot Reload Watches These:
- `*.py` files
- Changes trigger automatic restart (~1-2 seconds)

### Not Watched (Need Rebuild):
- `pyproject.toml` (dependency changes)
- `uv.lock` (lockfile changes)
- System dependencies

### If You Change Dependencies:
```bash
# Rebuild dev image
docker-compose -f docker-compose.dev.yml up -d --build backend
```

---

## Troubleshooting

### Hot Reload Not Working?

1. **Check file permissions:**
   ```bash
   ls -la main.py app/
   ```

2. **Check logs for errors:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f backend
   ```

3. **Verify volumes are mounted:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend ls -la /app
   ```

### "Address already in use"?

```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Kill process on port 7860
lsof -ti:7860 | xargs kill -9  # Mac/Linux
# Or: netstat -ano | findstr :7860  # Windows

# Restart
docker-compose -f docker-compose.dev.yml up -d
```

### Container Keeps Restarting?

```bash
# Check for syntax errors
docker-compose -f docker-compose.dev.yml logs backend

# Fix the syntax error in main.py (line 1137!)
# Then it should auto-reload
```

---

## Production vs Development

| Feature | Production | Development |
|---------|-----------|-------------|
| **File** | docker-compose.yml | docker-compose.dev.yml |
| **Dockerfile** | Dockerfile | Dockerfile.dev |
| **Hot Reload** | ❌ No | ✅ Yes |
| **Source Mounted** | ❌ No | ✅ Yes |
| **Build Speed** | Slower (multi-stage) | Faster (single stage) |
| **Image Size** | Smaller | Larger |
| **Dev Dependencies** | ❌ Excluded | ✅ Included |
| **Logging** | INFO | DEBUG |
| **Use Case** | Deployment | Development |

---

## Switching Between Modes

### Development → Production
```bash
# Stop dev
docker-compose -f docker-compose.dev.yml down

# Start production
docker-compose up -d
```

### Production → Development
```bash
# Stop production
docker-compose down

# Start dev
docker-compose -f docker-compose.dev.yml up -d
```

---

## Commands Cheat Sheet

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d       # Start
docker-compose -f docker-compose.dev.yml down        # Stop
docker-compose -f docker-compose.dev.yml logs -f     # Logs
docker-compose -f docker-compose.dev.yml restart     # Restart
docker-compose -f docker-compose.dev.yml exec backend bash  # Shell

# Production
docker-compose up -d                                  # Start
docker-compose down                                   # Stop
docker-compose logs -f                                # Logs
docker-compose restart                                # Restart
docker-compose exec backend bash                      # Shell
```

---

**🎉 Now you can develop with instant feedback!**

Just save your files and the server automatically reloads.
