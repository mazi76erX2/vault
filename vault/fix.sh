#!/bin/bash
# EMERGENCY FIX SCRIPT

set -e

echo "🔧 Fixing pyproject.toml and Docker setup..."
echo ""

# Step 1: Delete old uv.lock to regenerate fresh
echo "1️⃣  Cleaning old build artifacts..."
rm -f uv.lock
uv cache clean

# Step 2: Sync dependencies (this will work now with fixed pyproject.toml)
echo ""
echo "2️⃣  Syncing dependencies from pyproject.toml..."
source .venv/bin/activate 2>/dev/null || source venv/bin/activate 2>/dev/null || true
uv sync --no-dev

# Step 3: Generate lockfile
echo ""
echo "3️⃣  Generating uv.lock..."
uv lock

# Step 4: Verify files exist
echo ""
echo "4️⃣  Verifying files..."
ls -lh pyproject.toml uv.lock .dockerignore

# Step 5: Test that pyproject.toml is correct
echo ""
echo "5️⃣  Testing pyproject.toml structure..."
python -c "import tomllib; f = open('pyproject.toml', 'rb'); data = tomllib.load(f); print(f'✅ Project: {data["project"]["name"]}'); print(f'✅ Packages: {data["tool"]["hatch"]["build"]["targets"]["wheel"]["packages"]}'); f.close()"

# Step 6: Check .dockerignore includes pyproject.toml
echo ""
echo "6️⃣  Checking .dockerignore..."
if grep -q "!pyproject.toml" .dockerignore; then
    echo "✅ .dockerignore correctly includes pyproject.toml"
else
    echo "❌ ERROR: .dockerignore does not include pyproject.toml"
    exit 1
fi

# Step 7: Rebuild Docker
echo ""
echo "7️⃣  Rebuilding Docker containers..."
docker-compose down
docker-compose up -d --build

# Step 8: Wait and check health
echo ""
echo "8️⃣  Waiting for services to start..."
sleep 10

# Check services
echo ""
echo "9️⃣  Checking service health..."

echo -n "Qdrant: "
if curl -s http://localhost:6333/collections > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Not responding"
fi

echo -n "Backend: "
if curl -s http://localhost:7860/health > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Not responding (check logs: docker-compose logs backend)"
fi

echo ""
echo "🎉 Fix complete!"
echo ""
echo "Access your app at: http://localhost:7860"
echo "API docs: http://localhost:7860/docs"
echo ""
echo "If backend is not healthy, check logs:"
echo "  docker-compose logs -f backend"
