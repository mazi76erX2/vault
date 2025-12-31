#!/bin/bash
# fix_all_imports.sh - Fix ALL import naming mismatches

set -e

echo "🔧 Fixing ALL import naming mismatches..."
echo ""

# Check if in vault directory
if [ ! -f "main.py" ]; then
    echo "❌ Not in vault directory"
    echo "Run from: cd vault/ && bash fix_all_imports.sh"
    exit 1
fi

echo "📁 Backing up before changes..."
timestamp=$(date +%Y%m%d_%H%M%S)
find app/ -name "*.py" -type f -exec cp {} {}.backup_${timestamp} \; 2>/dev/null || true

echo ""
echo "🔧 Fixing imports..."

# Counter
FIXED=0

# Fix ollama client
if grep -r "ollamaclient" app/ --include="*.py" -q 2>/dev/null; then
    echo "  Fixing: ollamaclient → ollama_client"
    find app/ -name "*.py" -type f -exec sed -i 's/ollamaclient/ollama_client/g' {} \;
    ((FIXED++))
fi

# Fix auth service
if grep -r "from app\.services\.authservice" app/ --include="*.py" -q 2>/dev/null; then
    echo "  Fixing: authservice → auth_service"
    find app/ -name "*.py" -type f -exec sed -i 's/from app\.services\.authservice/from app.services.auth_service/g' {} \;
    ((FIXED++))
fi

# Fix collector llm
if grep -r "collectorllm" app/ --include="*.py" -q 2>/dev/null; then
    echo "  Fixing: collectorllm → collector_llm"
    find app/ -name "*.py" -type f -exec sed -i 's/collectorllm/collector_llm/g' {} \;
    ((FIXED++))
fi

# Fix rag service
if grep -r "ragservice" app/ --include="*.py" -q 2>/dev/null; then
    echo "  Fixing: ragservice → rag_service"
    find app/ -name "*.py" -type f -exec sed -i 's/ragservice/rag_service/g' {} \;
    ((FIXED++))
fi

# Fix tenant service
if grep -r "tenantservice" app/ --include="*.py" -q 2>/dev/null; then
    echo "  Fixing: tenantservice → tenant_service"
    find app/ -name "*.py" -type f -exec sed -i 's/tenantservice/tenant_service/g' {} \;
    ((FIXED++))
fi

# Fix file extract
if grep -r "fileextract" app/ --include="*.py" -q 2>/dev/null; then
    echo "  Fixing: fileextract → file_extract"
    find app/ -name "*.py" -type f -exec sed -i 's/fileextract/file_extract/g' {} \;
    ((FIXED++))
fi

echo ""
echo "✅ Fixed $FIXED import patterns"
echo ""

echo "🔍 Verifying fixes..."
echo ""

# Check for remaining issues
ISSUES=0

patterns=(
    "ollamaclient"
    "from app.services.authservice"
    "collectorllm"
    "ragservice"
    "tenantservice"
    "fileextract"
)

for pattern in "${patterns[@]}"; do
    if grep -r "$pattern" app/ --include="*.py" 2>/dev/null | grep -v __pycache__ | grep -v ".backup_"; then
        echo "⚠️  Still found: $pattern"
        ((ISSUES++))
    fi
done

if [ $ISSUES -eq 0 ]; then
    echo "✅ No import issues found - all clean!"
    echo ""
    echo "🧹 Cleaning up backups..."
    find app/ -name "*.backup_${timestamp}" -delete
else
    echo "⚠️  Found $ISSUES remaining issues"
    echo "Review the files above and fix manually"
fi

echo ""
echo "🔄 Hot reload will restart the server automatically"
echo "   Watch logs: docker-compose -f docker-compose.dev.yml logs -f backend"
echo ""
echo "🎉 Import fixes complete!"
