# 🚀 QUICK REFERENCE

## Development Mode (Hot Reload) 🔥

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Your changes to .py files will automatically reload the server!
# Just save the file and watch it restart in 1-2 seconds
```

## Production Mode 🏭

```bash
# Start production environment
docker-compose up -d --build

# View logs
docker-compose logs -f backend
```

## Which Mode to Use?

### Use **Development Mode** when:
- ✅ Writing/testing code
- ✅ Need instant feedback
- ✅ Running tests frequently
- ✅ Debugging issues

### Use **Production Mode** when:
- ✅ Deploying to server
- ✅ Final testing before release
- ✅ Need smallest image size
- ✅ Performance testing

## Fix Your Syntax Error First!

Before either mode works, fix the syntax error in main.py line 1137:

```bash
# Check the error
sed -n '1130,1145p' main.py

# Fix the unclosed parenthesis, then:
docker-compose -f docker-compose.dev.yml up -d --build
```

## After Fixing Syntax Error:

```bash
# Development mode - code changes auto-reload
docker-compose -f docker-compose.dev.yml up -d --build

# Test it works
curl http://localhost:7860/health

# Edit main.py and watch it reload!
echo "# test" >> main.py  # Server restarts automatically
```

**Read DEV_MODE.md for complete documentation!**
