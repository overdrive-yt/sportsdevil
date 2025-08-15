#!/bin/bash

# Google Cloud Run Deployment Script for Sports Devil
# This script automates the entire deployment process

set -e

# Configuration
PROJECT_ID="sportsdevil"
REGION="europe-west2"
SERVICE_NAME="sports-devil"
IMAGE_NAME="sports-devil"
REPOSITORY_NAME="sports-devil-repo"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Google Cloud Run Deployment${NC}"
echo "================================================"

# Step 1: Check billing status
echo -e "\n${YELLOW}Step 1: Checking billing status...${NC}"
BILLING_ENABLED=$(gcloud billing projects describe $PROJECT_ID --format="value(billingEnabled)")

if [ "$BILLING_ENABLED" != "True" ]; then
    echo -e "${RED}❌ Billing is not enabled for project $PROJECT_ID${NC}"
    echo -e "${YELLOW}Please enable billing at: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID${NC}"
    echo "After enabling billing, run this script again."
    exit 1
fi
echo -e "${GREEN}✅ Billing is enabled${NC}"

# Step 2: Enable required APIs
echo -e "\n${YELLOW}Step 2: Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    storage.googleapis.com \
    --project=$PROJECT_ID

echo -e "${GREEN}✅ APIs enabled${NC}"

# Step 3: Create Artifact Registry repository
echo -e "\n${YELLOW}Step 3: Creating Artifact Registry repository...${NC}"
gcloud artifacts repositories create $REPOSITORY_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Sports Devil" \
    --project=$PROJECT_ID || echo "Repository already exists"

# Configure Docker authentication
gcloud auth configure-docker ${REGION}-docker.pkg.dev

echo -e "${GREEN}✅ Artifact Registry configured${NC}"

# Step 4: Build Docker image
echo -e "\n${YELLOW}Step 4: Building Docker image...${NC}"
echo "This may take 5-10 minutes..."

# Build the image
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:latest .

echo -e "${GREEN}✅ Docker image built${NC}"

# Step 5: Push image to Artifact Registry
echo -e "\n${YELLOW}Step 5: Pushing image to Artifact Registry...${NC}"
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:latest

echo -e "${GREEN}✅ Image pushed to registry${NC}"

# Step 6: Generate secure NEXTAUTH_SECRET
echo -e "\n${YELLOW}Step 6: Generating secure NEXTAUTH_SECRET...${NC}"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✅ NEXTAUTH_SECRET generated${NC}"

# Step 7: Deploy to Cloud Run
echo -e "\n${YELLOW}Step 7: Deploying to Cloud Run...${NC}"

# Get the Cloud Run service URL (will be set after deployment)
SERVICE_URL=""

# Deploy the service with environment variables
gcloud run deploy $SERVICE_NAME \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/${IMAGE_NAME}:latest \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --port=3000 \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --concurrency=100 \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="DATABASE_URL=postgresql://postgres.fcntkadkakuxpequjxvz:YBE5NxXxL7wHCJH0@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1" \
    --set-env-vars="DIRECT_URL=postgresql://postgres.fcntkadkakuxpequjxvz:YBE5NxXxL7wHCJH0@aws-0-eu-west-2.pooler.supabase.com:5432/postgres" \
    --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=https://fcntkadkakuxpequjxvz.supabase.co" \
    --set-env-vars="NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbnRrYWRrYWt1eHBlcXVqeHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDk1OTYsImV4cCI6MjA3MDU4NTU5Nn0.eA4Qo40hBO9C0P2kxb_fn_0lenf_1gl0rKSHCKQpzRA" \
    --set-env-vars="NEXTAUTH_SECRET=$NEXTAUTH_SECRET" \
    --set-env-vars="STRIPE_SECRET_KEY=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" \
    --set-env-vars="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51K9eY9Il9c9ZTqpAgT1szOqOO7nWMpn1VF6twfcdMQbOu0fCCpdSQhaoy25cRXXXmmkRZE5auGsMnTfxhWKDjuZ800RZry0NXw" \
    --set-env-vars="STRIPE_WEBHOOK_SECRET=whsec_fVimApiKqlrZufKf6qCGdRLblrqDizJs" \
    --set-env-vars="GOOGLE_PLACES_API_KEY=AIzaSyCyrxI6SHF4Looaha4U6fuvG5MTFp650Bw" \
    --set-env-vars="GOOGLE_PLACE_ID=ChIJT1OoLtbNqoQRfYOj6P5ga18" \
    --set-env-vars="NEXT_PUBLIC_ELFSIGHT_WIDGET_ID=8d5ee4c6-7b98-46c5-ad41-29ed220b02d7" \
    --set-env-vars="SMTP_HOST=smtp.gmail.com" \
    --set-env-vars="SMTP_PORT=587" \
    --set-env-vars="SMTP_USER=pateljsk78@gmail.com" \
    --set-env-vars="SMTP_PASS=neba myaz odvf ixhu" \
    --set-env-vars="SPONSORSHIP_EMAIL=info@sportsdevil.co.uk" \
    --set-env-vars="NEXT_TELEMETRY_DISABLED=1" \
    --project=$PROJECT_ID

echo -e "${GREEN}✅ Service deployed${NC}"

# Step 8: Get service URL
echo -e "\n${YELLOW}Step 8: Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)" --project=$PROJECT_ID)

# Update NEXTAUTH_URL with the actual service URL
echo -e "\n${YELLOW}Updating NEXTAUTH_URL...${NC}"
gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --update-env-vars="NEXTAUTH_URL=$SERVICE_URL,NEXT_PUBLIC_APP_URL=$SERVICE_URL" \
    --project=$PROJECT_ID

echo -e "${GREEN}✅ Environment variables updated${NC}"

# Step 9: Display deployment information
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "\n${YELLOW}Service Information:${NC}"
echo -e "Service URL: ${GREEN}$SERVICE_URL${NC}"
echo -e "Service Name: $SERVICE_NAME"
echo -e "Region: $REGION"
echo -e "Project: $PROJECT_ID"
echo -e "\n${YELLOW}Important Notes:${NC}"
echo -e "1. Your application is now live at: ${GREEN}$SERVICE_URL${NC}"
echo -e "2. NEXTAUTH_SECRET has been generated and set"
echo -e "3. The service will scale from 0 to 10 instances based on traffic"
echo -e "4. To set up a custom domain, run:"
echo -e "   ${YELLOW}gcloud run domain-mappings create --service=$SERVICE_NAME --domain=sportsdevil.co.uk --region=$REGION${NC}"
echo -e "\n${YELLOW}Monitoring:${NC}"
echo -e "View logs: ${YELLOW}gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit=50${NC}"
echo -e "View metrics: ${YELLOW}https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics?project=$PROJECT_ID${NC}"
echo -e "\n${GREEN}Happy selling! 🏏${NC}"