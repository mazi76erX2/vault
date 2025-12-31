#!/bin/bash

echo "🚀  Vault Jenkins Build Script"
echo "=================================="

# Set error handling
set -e

# Function to print section headers
print_section() {
    echo ""
    echo "=================================================="
    echo "🔧 $1"
    echo "=================================================="
}

# Function to handle errors
handle_error() {
    echo "❌ Build failed at: $1"
    exit 1
}

# Build Generic Components
print_section "Building Generic Components (Storybook)"
cd generic-components || handle_error "Failed to enter generic-components directory"

# Use Jenkins-specific target that skips Docker
ant Build-Jenkins || handle_error "Generic components build failed"

print_section "Building Dependencies Package"
ant Build-Dependency || handle_error "Dependencies build failed"

# Build Vault UI
print_section "Building Vault UI Frontend"
cd ../vault-ui || handle_error "Failed to enter vault-ui directory"

# Install generic components dependency
ant Install-Generic-Components || handle_error "Failed to install generic components"

# Build the frontend
ant Build-Vault-UI || handle_error "Vault UI build failed"

print_section "Build Summary"
echo "✅ Generic Components: Storybook built successfully"
echo "✅ Dependencies: Package created successfully"  
echo "✅ Vault UI: Frontend built successfully"
echo ""
echo "📦 Artifacts created:"
echo "   - generic-components/storybook-static/ (Storybook UI)"
echo "   - dependencies/generic-components-1.0.0.tgz (NPM package)"
echo "   - vault-ui/dist/ (Frontend build)"
echo ""
echo "🎉 Jenkins Build Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Deploy storybook-static to web server"
echo "   2. Use vault-ui/dist for frontend deployment"
echo "   3. Build Docker images manually if needed:"
echo "      cd generic-components && docker build . -t truechart/vault-storybook"
echo "      cd vault-ui && docker build . -t truechart/vault-ui" 