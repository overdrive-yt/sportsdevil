#!/bin/bash

# Test script to verify Google Cloud Run deployment readiness
# This script will help identify and fix the root cause of the 500 errors

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVICE_NAME="sports-devil"
REGION="europe-west2"
SERVICE_URL="https://sports-devil-1052972248673.europe-west2.run.app"

echo -e "${YELLOW}🔍 Testing Google Cloud Run Deployment Issues...${NC}"
echo "================================================"

# Check Docker
echo -e "\n${YELLOW}Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
    docker --version
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker daemon is running
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
else
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo "Please start Docker Desktop"
    exit 1
fi

# Check gcloud
echo -e "\n${YELLOW}Checking gcloud CLI...${NC}"
if command -v gcloud &> /dev/null; then
    echo -e "${GREEN}✅ gcloud CLI is installed${NC}"
    gcloud --version | head -n 1
else
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    exit 1
fi

# Check authentication
echo -e "\n${YELLOW}Checking gcloud authentication...${NC}"
ACCOUNT=$(gcloud config get-value account 2>/dev/null)
if [ -n "$ACCOUNT" ]; then
    echo -e "${GREEN}✅ Authenticated as: $ACCOUNT${NC}"
else
    echo -e "${RED}❌ Not authenticated${NC}"
    echo "Run: gcloud auth login"
    exit 1
fi

# Check project
echo -e "\n${YELLOW}Checking project configuration...${NC}"
PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -n "$PROJECT" ]; then
    echo -e "${GREEN}✅ Project set to: $PROJECT${NC}"
else
    echo -e "${RED}❌ No project set${NC}"
    echo "Run: gcloud config set project PROJECT_ID"
    exit 1
fi

# Check required files
echo -e "\n${YELLOW}Checking required files...${NC}"
FILES=("Dockerfile" ".dockerignore" "package.json" "next.config.mjs")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file is missing${NC}"
        exit 1
    fi
done

# Check Next.js standalone output
echo -e "\n${YELLOW}Checking Next.js configuration...${NC}"
if grep -q "output: 'standalone'" next.config.mjs; then
    echo -e "${GREEN}✅ Standalone output is enabled${NC}"
else
    echo -e "${RED}❌ Standalone output is not enabled${NC}"
    echo "Please ensure next.config.mjs has: output: 'standalone'"
    exit 1
fi

# Test critical API endpoints that are failing
echo -e "\n${YELLOW}Testing failing API endpoints...${NC}"
ENDPOINTS=(
    "/api/products?limit=50&sort=name"
    "/api/analytics/best-sellers?limit=8"
    "/api/analytics/new-arrivals?limit=8"
    "/api/auth/session"
)

for endpoint in "${ENDPOINTS[@]}"; do
    echo ""
    echo "Testing: $SERVICE_URL$endpoint"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL$endpoint" || echo "failed")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✅ $endpoint - OK (200)${NC}"
    elif [ "$response" -eq 500 ]; then
        echo -e "${RED}❌ $endpoint - Internal Server Error (500)${NC}"
        echo "   This indicates a server-side issue (likely database connection)"
    elif [ "$response" -eq 404 ]; then
        echo -e "${YELLOW}⚠️  $endpoint - Not Found (404)${NC}"
    else
        echo -e "${YELLOW}⚠️  $endpoint - Response: $response${NC}"
    fi
done

# Check environment variables
echo -e "\n${YELLOW}Checking current environment variables...${NC}"
echo "Getting environment variables from Cloud Run service..."

if gcloud run services describe $SERVICE_NAME --region=$REGION --format="table(spec.template.spec.template.spec.containers[0].env[].name,spec.template.spec.template.spec.containers[0].env[].value)" 2>/dev/null; then
    echo -e "${GREEN}✅ Successfully retrieved environment variables${NC}"
else
    echo -e "${RED}❌ Failed to retrieve environment variables${NC}"
    echo "Make sure you're authenticated: gcloud auth login"
fi

echo -e "\n${RED}================================================${NC}"
echo -e "${RED}🚨 CRITICAL FIXES NEEDED FOR 500 ERRORS:${NC}"
echo -e "${RED}================================================${NC}"
echo ""

echo "1. ${RED}Fix Database Connection (CRITICAL):${NC}"
echo "   The 500 errors suggest database connectivity issues."
echo "   Run: ./fix-cloud-run-env.sh for detailed commands"
echo ""

echo "2. ${RED}Fix Sentry Configuration:${NC}"
echo "   Invalid Sentry DSN causing JavaScript errors"
echo ""

echo "3. ${YELLOW}After fixing environment variables:${NC}"
echo "   - The service will automatically redeploy"
echo "   - Run this script again to verify fixes"
echo ""

echo -e "${YELLOW}🔧 Run ./fix-cloud-run-env.sh for detailed fix commands${NC}"