#!/bin/bash

# Script to set up Cloud Run with custom domain using Load Balancer
# This approach works with Cloudflare and provides proper SSL

PROJECT_ID="sportsdevil"
REGION="europe-west2"
SERVICE_NAME="sports-devil"
DOMAIN="sportsdevil.co.uk"

echo "Setting up Cloud Run with custom domain..."

# Step 1: Reserve a static IP address
echo "1. Reserving static IP address..."
gcloud compute addresses create sports-devil-ip \
    --global \
    --project=$PROJECT_ID || echo "IP already exists"

# Get the IP address
IP_ADDRESS=$(gcloud compute addresses describe sports-devil-ip --global --format="value(address)" --project=$PROJECT_ID)
echo "Static IP: $IP_ADDRESS"

# Step 2: Create a backend service for Cloud Run
echo "2. Creating NEG (Network Endpoint Group) for Cloud Run..."
gcloud compute network-endpoint-groups create sports-devil-neg \
    --region=$REGION \
    --network-endpoint-type=serverless \
    --cloud-run-service=$SERVICE_NAME \
    --project=$PROJECT_ID || echo "NEG already exists"

# Step 3: Create a backend service
echo "3. Creating backend service..."
gcloud compute backend-services create sports-devil-backend \
    --global \
    --project=$PROJECT_ID || echo "Backend service already exists"

# Step 4: Add the NEG to the backend service
echo "4. Adding NEG to backend service..."
gcloud compute backend-services add-backend sports-devil-backend \
    --global \
    --network-endpoint-group=sports-devil-neg \
    --network-endpoint-group-region=$REGION \
    --project=$PROJECT_ID || echo "Backend already added"

# Step 5: Create URL map
echo "5. Creating URL map..."
gcloud compute url-maps create sports-devil-lb \
    --default-service=sports-devil-backend \
    --global \
    --project=$PROJECT_ID || echo "URL map already exists"

# Step 6: Create HTTP proxy
echo "6. Creating HTTP proxy..."
gcloud compute target-http-proxies create sports-devil-http-proxy \
    --url-map=sports-devil-lb \
    --global \
    --project=$PROJECT_ID || echo "HTTP proxy already exists"

# Step 7: Create HTTPS proxy (for SSL)
echo "7. Creating managed SSL certificate..."
gcloud compute ssl-certificates create sports-devil-cert \
    --domains=$DOMAIN,www.$DOMAIN \
    --global \
    --project=$PROJECT_ID || echo "Certificate already exists"

echo "8. Creating HTTPS proxy..."
gcloud compute target-https-proxies create sports-devil-https-proxy \
    --url-map=sports-devil-lb \
    --ssl-certificates=sports-devil-cert \
    --global \
    --project=$PROJECT_ID || echo "HTTPS proxy already exists"

# Step 8: Create forwarding rules
echo "9. Creating HTTP forwarding rule..."
gcloud compute forwarding-rules create sports-devil-http-rule \
    --address=sports-devil-ip \
    --target-http-proxy=sports-devil-http-proxy \
    --global \
    --ports=80 \
    --project=$PROJECT_ID || echo "HTTP rule already exists"

echo "10. Creating HTTPS forwarding rule..."
gcloud compute forwarding-rules create sports-devil-https-rule \
    --address=sports-devil-ip \
    --target-https-proxy=sports-devil-https-proxy \
    --global \
    --ports=443 \
    --project=$PROJECT_ID || echo "HTTPS rule already exists"

echo ""
echo "================================================================"
echo "Load Balancer Setup Complete!"
echo "================================================================"
echo ""
echo "IMPORTANT: Update your DNS records:"
echo "1. In Cloudflare, change your DNS records to:"
echo "   - Type: A"
echo "   - Name: @"
echo "   - Value: $IP_ADDRESS"
echo "   - Proxy: OFF (gray cloud)"
echo ""
echo "   - Type: A"
echo "   - Name: www"
echo "   - Value: $IP_ADDRESS"
echo "   - Proxy: OFF (gray cloud)"
echo ""
echo "2. SSL certificate will be provisioned automatically (takes 10-15 minutes)"
echo "3. Your site will be available at https://$DOMAIN"
echo ""
echo "Note: This Load Balancer costs approximately $18/month"
echo "================================================================"