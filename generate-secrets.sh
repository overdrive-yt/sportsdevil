#!/bin/bash

# Script to generate secure secrets for deployment

echo "🔐 Generating Secure Secrets for Deployment"
echo "==========================================="

echo ""
echo "1. NextAuth Secret (copy this value):"
echo "-------------------------------------"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "$NEXTAUTH_SECRET"

echo ""
echo "2. Complete Environment Variable Command:"
echo "----------------------------------------"
echo "gcloud run services update sports-devil --region=europe-west2 \\"
echo "  --set-env-vars=\"NEXTAUTH_SECRET=$NEXTAUTH_SECRET,NODE_ENV=production,NEXTAUTH_URL=https://sports-devil-1052972248673.europe-west2.run.app\""

echo ""
echo "3. DATABASE_URL Template (replace with your values):"
echo "----------------------------------------------------"
echo "DATABASE_URL=postgresql://username:password@host:port/database"

echo ""
echo "4. Sentry DSN (if you have one):"
echo "--------------------------------"
echo "NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id"

echo ""
echo "📋 Summary of Required Variables:"
echo "================================="
echo "✅ DATABASE_URL - Your PostgreSQL connection string"
echo "✅ NEXTAUTH_SECRET - Generated above: $NEXTAUTH_SECRET" 
echo "✅ NEXTAUTH_URL - https://sports-devil-1052972248673.europe-west2.run.app"
echo "✅ NODE_ENV - production"
echo "⚠️  NEXT_PUBLIC_SENTRY_DSN - Optional (or remove if not using Sentry)"

echo ""
echo "🚀 Ready to deploy! Set these environment variables first, then run ./deploy-to-gcp.sh"