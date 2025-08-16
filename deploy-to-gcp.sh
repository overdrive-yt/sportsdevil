#!/bin/bash

# Sports Devil - Optimized Google Cloud Run Deployment Script
# This script handles the complete deployment process in one go

set -e  # Exit on any error

echo "🚀 Starting Sports Devil deployment to Google Cloud Run..."

# Configuration
PROJECT_ID="sportsdevil"
SERVICE_NAME="sports-devil"
REGION="europe-west2"
DOCKERFILE_PATH="."

# Environment Variables for Production
ENV_VARS="DATABASE_URL=postgresql://postgres:thisisasupersafepassword@db.fcntkadkakuxpequjxvz.supabase.co:5432/postgres,NEXTAUTH_URL=https://sportsdevil.co.uk,NEXTAUTH_SECRET=eKaP/XiMiM8XAK8edYfoDO/0K2y6SJlTTHGdJHzXNYM=,STRIPE_SECRET_KEY=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,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51K9eY9Il9c9ZTqpAgT1szOqOO7nWMpn1VF6twfcdMQbOu0fCCpdSQhaoy25cRXXXmmkRZE5auGsMnTfxhWKDjuZ800RZry0NXw,STRIPE_WEBHOOK_SECRET=whsec_fVimApiKqlrZufKf6qCGdRLblrqDizJs,GOOGLE_PLACES_API_KEY=AIzaSyCyrxI6SHF4Looaha4U6fuvG5MTFp650Bw,GOOGLE_PLACE_ID=ChIJT1OoLtbNqoQRfYOj6P5ga18,NEXT_PUBLIC_ELFSIGHT_WIDGET_ID=8d5ee4c6-7b98-46c5-ad41-29ed220b02d7,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=pateljsk78@gmail.com,SMTP_PASS=neba myaz odvf ixhu,SPONSORSHIP_EMAIL=info@sportsdevil.co.uk,NODE_OPTIONS=--max-old-space-size=4096,NEXT_TELEMETRY_DISABLED=1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not authenticated with gcloud. Run: gcloud auth login"
    exit 1
fi

# Check if correct project is set
CURRENT_PROJECT=$(gcloud config get-value project)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    print_warning "Current project is $CURRENT_PROJECT, switching to $PROJECT_ID"
    gcloud config set project $PROJECT_ID
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Consider committing them first."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Optional: Run build locally first to catch errors early
print_status "Running local build test..."
if ! npm run build > /dev/null 2>&1; then
    print_error "Local build failed. Fix errors before deploying."
    exit 1
fi
print_success "Local build successful"

# Get current version for deployment tracking
CURRENT_COMMIT=$(git rev-parse --short HEAD)
APP_VERSION="v$(date +%Y%m%d)-${CURRENT_COMMIT}"
FULL_ENV_VARS="${ENV_VARS},NEXT_PUBLIC_APP_VERSION=${APP_VERSION}"

print_status "Deploying version: $APP_VERSION"

# Deploy to Cloud Run
print_status "Deploying to Cloud Run..."
print_status "Service: $SERVICE_NAME | Region: $REGION | Project: $PROJECT_ID"

gcloud run deploy $SERVICE_NAME \
  --source $DOCKERFILE_PATH \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="$FULL_ENV_VARS" \
  --timeout=900s \
  --memory=2Gi \
  --cpu=2 \
  --max-instances=10 \
  --min-instances=0

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    print_success "Service URL: $SERVICE_URL"
    
    # Test if the service is responding
    print_status "Testing deployment..."
    if curl -s -f $SERVICE_URL > /dev/null; then
        print_success "Service is responding correctly!"
    else
        print_warning "Service deployed but may not be responding correctly"
    fi
    
    print_success "🎉 Deployment complete! Your site is live at https://sportsdevil.co.uk"
    
else
    print_error "Deployment failed!"
    exit 1
fi