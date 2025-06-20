#!/bin/bash

# HICO Vault Unified Deployment Script
# Usage: ./deploy.sh [local|production]
# Default: local

set -e

# Configuration
MODE=${1:-local}
NAMESPACE="hico-vault"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Show usage
show_usage() {
    echo "HICO Vault Deployment Script"
    echo ""
    echo "Usage: $0 [local|production]"
    echo ""
    echo "Modes:"
    echo "  local      - Deploy to local kind cluster (default)"
    echo "  production - Deploy to production Kubernetes cluster"
    echo ""
    echo "Examples:"
    echo "  $0              # Deploy locally with kind"
    echo "  $0 local        # Deploy locally with kind"
    echo "  $0 production   # Deploy to production cluster"
    exit 0
}

# Check parameters
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_usage
fi

if [[ "$MODE" != "local" && "$MODE" != "production" ]]; then
    print_error "Invalid mode: $MODE"
    show_usage
fi

echo "🚀 Starting HICO Vault deployment in $MODE mode..."

# Common checks
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker."
    exit 1
fi
print_status "Docker is running"

# Mode-specific deployment
if [[ "$MODE" == "local" ]]; then
    echo ""
    print_info "=== LOCAL DEPLOYMENT (KIND) ==="
    
    # Check if kind is installed
    if ! command -v kind &> /dev/null; then
        print_warning "kind is not installed. Please install it:"
        echo "1. Download: https://github.com/kubernetes-sigs/kind/releases/latest"
        echo "2. Chocolatey: choco install kind"
        echo "3. Scoop: scoop install kind"
        print_error "Please install kind and run this script again."
        exit 1
    fi
    print_status "kind is available"

    # Delete existing cluster if it exists
    if kind get clusters 2>/dev/null | grep -q "hico-vault"; then
        echo "🗑️  Deleting existing hico-vault cluster..."
        kind delete cluster --name hico-vault
    fi

    # Create kind cluster
    echo "🏗️  Creating kind cluster..."
    if kind create cluster --config kind-config.yaml; then
        print_status "Kind cluster created successfully"
    else
        print_error "Failed to create kind cluster"
        exit 1
    fi

    # Verify cluster is ready
    echo "⏳ Waiting for cluster to be ready..."
    kubectl wait --for=condition=Ready nodes --all --timeout=300s
    print_status "Cluster is ready"

    # Build and load image into kind
    echo "🔨 Building and loading Docker image..."
    docker build -t hico-vault:local .
    kind load docker-image hico-vault:local --name hico-vault
    print_status "Docker image loaded into kind cluster"

    # Use local image configuration
    DOCKER_IMAGE="hico-vault:local"
    DEPLOYMENT_FILE="k8s-deployment-local.yaml"
    
    # Create local deployment with Never pull policy
    sed 's/hico-vault:latest/hico-vault:local/g; s/imagePullPolicy: Always/imagePullPolicy: Never/g' k8s-deployment.yaml > $DEPLOYMENT_FILE

else
    echo ""
    print_info "=== PRODUCTION DEPLOYMENT ==="
    
    # Check kubectl connection
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi

    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    print_status "Connected to Kubernetes cluster"

    # Build production image
    echo "🔨 Building Docker image..."
    if docker build -t hico-vault:latest .; then
        print_status "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi

    # Use production configuration
    DOCKER_IMAGE="hico-vault:latest"
    DEPLOYMENT_FILE="k8s-deployment.yaml"
fi

# Deploy to Kubernetes
echo "📦 Deploying to Kubernetes..."
if kubectl apply -f $DEPLOYMENT_FILE; then
    print_status "Main deployment applied successfully"
else
    print_error "Failed to apply main deployment"
    exit 1
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
print_status "PostgreSQL is ready"

# Run database migrations
echo "🔄 Running database migrations..."
if kubectl apply -f k8s-migration-job.yaml; then
    print_status "Migration job applied"
    
    # Wait for migration job to complete
    echo "⏳ Waiting for database migration to complete..."
    kubectl wait --for=condition=complete job/vault-db-migration -n $NAMESPACE --timeout=300s
    print_status "Database migration completed successfully"
else
    print_error "Failed to apply migration job"
    exit 1
fi

# Wait for all deployments to be ready
echo "⏳ Waiting for all services to be ready..."
kubectl wait --for=condition=available deployment/postgrest -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=available deployment/vault-backend -n $NAMESPACE --timeout=300s
print_status "All services are ready"

# Set up access based on mode
if [[ "$MODE" == "local" ]]; then
    # Set up NodePort for local access
    echo "🔗 Setting up local access..."
    kubectl patch service vault-backend-service -n $NAMESPACE -p '{"spec":{"type":"NodePort","ports":[{"port":7860,"targetPort":7860,"nodePort":30000}]}}'
    kubectl patch service postgrest-service -n $NAMESPACE -p '{"spec":{"type":"NodePort","ports":[{"port":3000,"targetPort":3000,"nodePort":30001}]}}'
    
    ACCESS_INFO="🔗 Access Information:
  - HICO Vault Backend: http://localhost:7860
  - PostgREST API: http://localhost:3000

🔧 Useful Commands:
  - View logs: kubectl logs -f deployment/vault-backend -n $NAMESPACE
  - Access database: kubectl exec -it deployment/postgres -n $NAMESPACE -- psql -U postgres
  - Stop cluster: kind delete cluster --name hico-vault"
else
    ACCESS_INFO="🔗 Access Information:
To access the application:
  1. Port forward: kubectl port-forward service/vault-backend-service 7860:7860 -n $NAMESPACE
  2. Then visit: http://localhost:7860

To access PostgREST API:
  1. Port forward: kubectl port-forward service/postgrest-service 3000:3000 -n $NAMESPACE
  2. Then visit: http://localhost:3000

🔧 Useful Commands:
  - View logs: kubectl logs -f deployment/vault-backend -n $NAMESPACE
  - Access database: kubectl exec -it deployment/postgres -n $NAMESPACE -- psql -U postgres"
fi

# Show final status
echo ""
echo "🎉 HICO Vault is now running in $MODE mode!"
echo ""
echo "📊 Service Information:"
kubectl get services -n $NAMESPACE

echo ""
echo "📦 Pod Status:"
kubectl get pods -n $NAMESPACE

echo ""
echo "$ACCESS_INFO"
echo ""

# Clean up temporary files
if [[ "$MODE" == "local" && -f "$DEPLOYMENT_FILE" ]]; then
    rm -f $DEPLOYMENT_FILE
fi

print_status "Deployment completed successfully!" 