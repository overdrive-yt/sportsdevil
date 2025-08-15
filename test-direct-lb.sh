#!/bin/bash

echo "Testing direct connection to Load Balancer IP (34.95.83.13)..."
echo "=================================================="
echo ""

echo "1. Testing HTTP with Host header (should redirect to HTTPS):"
curl -sI -H "Host: sportsdevil.co.uk" http://34.95.83.13 | head -5

echo ""
echo "2. Testing if app responds through Load Balancer:"
response=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: sportsdevil.co.uk" http://34.95.83.13 -L --max-redirs 0)
echo "HTTP Response Code: $response"

echo ""
echo "3. Testing Cloud Run service directly:"
direct_response=$(curl -s -o /dev/null -w "%{http_code}" https://sports-devil-1052972248673.europe-west2.run.app)
echo "Direct Cloud Run Response: $direct_response"

echo ""
echo "4. Current DNS resolution:"
echo "sportsdevil.co.uk resolves to: $(dig +short sportsdevil.co.uk A | head -1)"
echo "www.sportsdevil.co.uk resolves to: $(dig +short www.sportsdevil.co.uk A | head -1)"

echo ""
echo "5. Checking with Cloudflare's DNS directly:"
echo "@ via Cloudflare NS: $(dig @grace.ns.cloudflare.com +short sportsdevil.co.uk A | head -1)"
echo "www via Cloudflare NS: $(dig @grace.ns.cloudflare.com +short www.sportsdevil.co.uk A | head -1)"

echo ""
echo "=================================================="
echo "DIAGNOSIS:"
if [[ $(dig +short sportsdevil.co.uk A | head -1) == "34.95.83.13" ]]; then
    echo "✅ DNS is correctly configured"
else
    echo "❌ DNS is NOT pointing to Load Balancer (34.95.83.13)"
    echo "   Please update Cloudflare DNS records!"
fi
