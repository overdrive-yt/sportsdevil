# Domain Setup Guide for sportsdevil.co.uk

## Current Deployment
Your website is currently live at: https://sports-devil-1052972248673.europe-west2.run.app

## Recommended: Cloudflare Setup (FREE with SSL)

### Step 1: Create Cloudflare Account
1. Go to https://cloudflare.com and sign up for a free account
2. Click "Add a Site" and enter: sportsdevil.co.uk
3. Select the FREE plan

### Step 2: Update Nameservers in Namecheap
1. Cloudflare will provide you with 2 nameservers (like `xxx.ns.cloudflare.com`)
2. In Namecheap:
   - Go to Domain List → Manage → Advanced DNS
   - Scroll to "PERSONAL DNS SERVER" section
   - Change dropdown from "Standard Nameservers" to "Custom DNS"
   - Enter the two Cloudflare nameservers
   - Save changes

### Step 3: Configure DNS in Cloudflare
Once nameservers are updated (can take 24-48 hours), in Cloudflare:

1. Go to DNS → Records
2. Delete any existing A or CNAME records for @ and www
3. Add these records:

**Root Domain:**
- Type: CNAME
- Name: @
- Target: sports-devil-1052972248673.europe-west2.run.app
- Proxy status: Proxied (orange cloud ON)
- TTL: Auto

**WWW Subdomain:**
- Type: CNAME
- Name: www
- Target: sports-devil-1052972248673.europe-west2.run.app
- Proxy status: Proxied (orange cloud ON)
- TTL: Auto

### Step 4: Configure SSL in Cloudflare
1. Go to SSL/TLS → Overview
2. Set encryption mode to "Full"
3. Go to SSL/TLS → Edge Certificates
4. Enable "Always Use HTTPS"

## Alternative: Direct Namecheap DNS (No SSL)

If you prefer to keep Namecheap DNS:

1. In Namecheap Advanced DNS tab
2. Click "ADD NEW RECORD"
3. Add:
   - Type: CNAME, Host: @, Value: sports-devil-1052972248673.europe-west2.run.app.
   - Type: CNAME, Host: www, Value: sports-devil-1052972248673.europe-west2.run.app.

**Warning**: This method will show SSL certificate warnings.

## DNS Propagation
- Changes can take 24-48 hours to propagate globally
- Check status at: https://www.whatsmydns.net/#CNAME/sportsdevil.co.uk

## Testing Your Domain
Once DNS is configured, test these URLs:
- http://sportsdevil.co.uk
- http://www.sportsdevil.co.uk
- https://sportsdevil.co.uk (only works with Cloudflare)
- https://www.sportsdevil.co.uk (only works with Cloudflare)

## Troubleshooting
- If site doesn't load after 48 hours, check DNS records
- Ensure nameservers are correctly set if using Cloudflare
- Clear browser cache and try incognito mode
- Use `nslookup sportsdevil.co.uk` to verify DNS resolution

## Support
- Cloudflare Support: https://support.cloudflare.com
- Namecheap Support: https://www.namecheap.com/support
- Google Cloud Run Docs: https://cloud.google.com/run/docs