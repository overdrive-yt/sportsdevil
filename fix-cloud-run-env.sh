#!/bin/bash

# Script to fix Google Cloud Run environment variables
# Run this script to configure the missing environment variables

echo "🔧 Fixing Google Cloud Run Environment Variables..."

SERVICE_NAME="sports-devil"
REGION="europe-west2"

echo "📋 Current environment variables:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format="table(spec.template.spec.template.spec.containers[0].env[].name,spec.template.spec.template.spec.containers[0].env[].value)"

echo ""
echo "🚨 REQUIRED ACTIONS:"
echo ""
echo "1. Set DATABASE_URL (CRITICAL - this is why APIs are failing):"
echo "   gcloud run services update $SERVICE_NAME --region=$REGION \\"
echo "     --set-env-vars=\"DATABASE_URL=postgresql://username:password@host:port/database\""
echo ""
echo "2. Set NEXT_PUBLIC_SENTRY_DSN (to fix JavaScript errors):"
echo "   gcloud run services update $SERVICE_NAME --region=$REGION \\"
echo "     --set-env-vars=\"NEXT_PUBLIC_SENTRY_DSN=your_actual_sentry_dsn\""
echo ""
echo "3. Set other required environment variables:"
echo "   gcloud run services update $SERVICE_NAME --region=$REGION \\"
echo "     --set-env-vars=\"NEXTAUTH_URL=https://sports-devil-1052972248673.europe-west2.run.app,NEXTAUTH_SECRET=your_nextauth_secret,NODE_ENV=production\""
echo ""
echo "4. If you want to disable Sentry temporarily:"
echo "   gcloud run services update $SERVICE_NAME --region=$REGION \\"
echo "     --remove-env-vars=\"NEXT_PUBLIC_SENTRY_DSN\""
echo ""
echo "💡 To get your current environment variables and update them all at once:"
echo "   Create a .env file with your production values and use:"
echo "   gcloud run services update $SERVICE_NAME --region=$REGION --env-vars-file=.env"
echo ""
echo "🔄 After updating environment variables, the service will automatically redeploy."