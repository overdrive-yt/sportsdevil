#!/bin/bash

# Fast Firebase Hosting setup for Cloud Run with custom domain
# This works perfectly with Cloudflare!

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Firebase Hosting for your domain${NC}"
echo "================================================"

# Step 1: Login to Firebase
echo -e "\n${YELLOW}Step 1: Login to Firebase${NC}"
echo "This will open a browser window for authentication"
firebase login

# Step 2: Initialize Firebase project
echo -e "\n${YELLOW}Step 2: Initializing Firebase project${NC}"
firebase init hosting --project sportsdevil

# Step 3: Deploy to Firebase
echo -e "\n${YELLOW}Step 3: Deploying to Firebase Hosting${NC}"
firebase deploy --only hosting --project sportsdevil

# Step 4: Add custom domain
echo -e "\n${YELLOW}Step 4: Adding custom domain${NC}"
firebase hosting:channel:deploy production --project sportsdevil

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Firebase Hosting Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Firebase will provide you with DNS records"
echo -e "2. Add these DNS records in Cloudflare"
echo -e "3. Your site will be live at https://sportsdevil.co.uk"
echo -e "\n${GREEN}This is the fastest solution and works great with Cloudflare!${NC}"