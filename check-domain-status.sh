#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Domain Setup Status Check ===${NC}\n"

# Expected IP
EXPECTED_IP="34.95.83.13"

# Check DNS resolution
echo -e "${YELLOW}1. DNS Resolution:${NC}"
CURRENT_IP=$(dig +short sportsdevil.co.uk A | head -1)
CURRENT_WWW_IP=$(dig +short www.sportsdevil.co.uk A | head -1)

if [ "$CURRENT_IP" == "$EXPECTED_IP" ]; then
    echo -e "  Root domain (@): ${GREEN}✓ Correctly pointing to $EXPECTED_IP${NC}"
else
    echo -e "  Root domain (@): ${RED}✗ Currently pointing to $CURRENT_IP (should be $EXPECTED_IP)${NC}"
fi

if [ "$CURRENT_WWW_IP" == "$EXPECTED_IP" ]; then
    echo -e "  WWW domain: ${GREEN}✓ Correctly pointing to $EXPECTED_IP${NC}"
else
    echo -e "  WWW domain: ${RED}✗ Currently pointing to $CURRENT_WWW_IP (should be $EXPECTED_IP)${NC}"
fi

# Check if DNS is proxied (Cloudflare)
if [[ "$CURRENT_IP" =~ ^104\.|^172\.6[4-7]\.|^188\.114\. ]]; then
    echo -e "  ${RED}⚠ WARNING: DNS appears to be proxied through Cloudflare (orange cloud)${NC}"
    echo -e "  ${YELLOW}Please set to DNS only (gray cloud) for certificate provisioning${NC}"
fi

# Check SSL certificate status
echo -e "\n${YELLOW}2. SSL Certificate Status:${NC}"
CERT_STATUS=$(gcloud compute ssl-certificates describe sports-devil-cert --format="value(managed.status)" 2>/dev/null)
DOMAIN_STATUS=$(gcloud compute ssl-certificates describe sports-devil-cert --format="value(managed.domainStatus[sportsdevil.co.uk])" 2>/dev/null)
WWW_STATUS=$(gcloud compute ssl-certificates describe sports-devil-cert --format="value(managed.domainStatus[www.sportsdevil.co.uk])" 2>/dev/null)

if [ "$CERT_STATUS" == "ACTIVE" ]; then
    echo -e "  Overall: ${GREEN}✓ Certificate is ACTIVE${NC}"
else
    echo -e "  Overall: ${YELLOW}⏳ Certificate is $CERT_STATUS${NC}"
fi

echo -e "  sportsdevil.co.uk: $DOMAIN_STATUS"
echo -e "  www.sportsdevil.co.uk: $WWW_STATUS"

# Test HTTP/HTTPS connectivity
echo -e "\n${YELLOW}3. Website Connectivity:${NC}"

# Test HTTP redirect
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L http://sportsdevil.co.uk 2>/dev/null)
if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "  HTTP: ${GREEN}✓ Site is accessible (Status: $HTTP_STATUS)${NC}"
else
    echo -e "  HTTP: ${YELLOW}Status code: $HTTP_STATUS${NC}"
fi

# Test HTTPS
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sportsdevil.co.uk 2>/dev/null)
if [ "$HTTPS_STATUS" == "200" ]; then
    echo -e "  HTTPS: ${GREEN}✓ Site is accessible via HTTPS (Status: $HTTPS_STATUS)${NC}"
else
    echo -e "  HTTPS: ${YELLOW}Status code: $HTTPS_STATUS${NC}"
fi

echo -e "\n${YELLOW}=== Summary ===${NC}"
if [ "$CERT_STATUS" == "ACTIVE" ] && [ "$HTTPS_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Your domain is fully configured and working!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "1. Go to Cloudflare and re-enable proxy (orange cloud) for both records"
    echo -e "2. Set SSL/TLS mode to 'Full (strict)' in Cloudflare"
    echo -e "3. Enable 'Always Use HTTPS' in Cloudflare Edge Certificates"
else
    echo -e "${YELLOW}⏳ Setup in progress...${NC}"
    echo -e "\nIf DNS is correct but certificate is still provisioning:"
    echo -e "- This is normal and can take 10-20 minutes"
    echo -e "- Run this script again in a few minutes to check status"
    echo -e "\nIf DNS is not pointing to $EXPECTED_IP:"
    echo -e "- Update your Cloudflare DNS records"
    echo -e "- Set both @ and www A records to: $EXPECTED_IP"
    echo -e "- Make sure proxy is OFF (gray cloud)"
fi
