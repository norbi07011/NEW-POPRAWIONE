# 🚀 BTCPayServer Deployment Guide

## 🎯 OVERVIEW

This guide walks through deploying **BTCPayServer** for MessuBouw crypto payments.

**Total Setup Time:** 30-45 minutes  
**Monthly Cost:** €5-10 (VPS hosting)  
**Transaction Fees:** 0% ✅

---

## 📋 PREREQUISITES

- [ ] VPS with Ubuntu 22.04 (min 2GB RAM, 50GB SSD)
- [ ] Domain name (e.g., `pay.messubouw.com`)
- [ ] SSH access to VPS
- [ ] Bitcoin wallet address (for receiving payments)

### Recommended VPS Providers:

**Option 1: DigitalOcean** (EASIEST)
- $6/month Droplet (2GB RAM, 50GB SSD)
- Sign up: https://digitalocean.com
- Use code `DO10` for $10 credit

**Option 2: Hetzner** (CHEAPEST)
- €4.50/month CX21 (2 vCPU, 4GB RAM)
- Sign up: https://hetzner.com

**Option 3: Railway** (NO CREDIT CARD)
- $5/month starter plan
- Sign up: https://railway.app

---

## 🛠️ STEP 1: SETUP VPS

### 1.1 Create Droplet (DigitalOcean)

```bash
# In DigitalOcean dashboard:
1. Click "Create" → "Droplets"
2. Choose Ubuntu 22.04 LTS
3. Plan: Basic ($6/mo - 2GB RAM)
4. Datacenter: Amsterdam (closest to Netherlands)
5. Authentication: SSH Key (add your public key)
6. Hostname: btcpay-messubouw
7. Click "Create Droplet"

# Wait 55 seconds for provisioning
```

### 1.2 Point Domain to VPS

```bash
# In your domain registrar (e.g., Namecheap, GoDaddy):
1. Go to DNS settings
2. Add A record:
   Host: pay
   Type: A
   Value: [Your VPS IP address]
   TTL: 300

# Wait 5-10 minutes for DNS propagation
# Test: ping pay.messubouw.com
```

---

## 🐳 STEP 2: INSTALL BTCPAYSERVER

### 2.1 SSH into VPS

```bash
# From your local machine:
ssh root@[VPS_IP_ADDRESS]

# Or using DigitalOcean console:
# Droplet → Access → Launch Droplet Console
```

### 2.2 Run Automated Installer

```bash
# Download and run installer
curl -fsSL https://raw.githubusercontent.com/norbi07011/NEW-POPRAWIONE/main/btcpayserver-setup.sh -o btcpayserver-setup.sh
chmod +x btcpayserver-setup.sh
sudo ./btcpayserver-setup.sh

# The script will:
# 1. Install Docker + Docker Compose
# 2. Clone BTCPayServer repository
# 3. Configure environment variables
# 4. Start all services (Bitcoin node, NBXplorer, BTCPayServer, LND)
# 5. Setup SSL with Let's Encrypt

# ⏱️ Installation takes 10-15 minutes
```

### 2.3 Wait for Bitcoin Sync

```bash
# Check Bitcoin sync status
docker logs btcpayserver-docker_bitcoind_1 -f

# Look for:
# "progress=1.000000" = Fully synced ✅
# "progress=0.250000" = 25% synced (wait longer)

# Sync time: 4-6 hours (first time only)
# TIP: Use Bitcoin Knots for faster sync (pruned mode)
```

---

## ⚙️ STEP 3: CONFIGURE BTCPAYSERVER

### 3.1 Access Dashboard

```bash
# Open in browser:
https://pay.messubouw.com

# First visit:
1. Click "Register"
2. Email: your_email@messubouw.com
3. Password: [strong password]
4. Click "Create Account"
```

### 3.2 Create Store

```bash
# In BTCPayServer dashboard:
1. Click "Stores" → "Create a new store"
2. Store Name: MessuBouw
3. Default Currency: EUR
4. Click "Create"
```

### 3.3 Setup Bitcoin Wallet

```bash
# In Store Settings:
1. Click "Wallets" → "Bitcoin" → "Setup"
2. Choose "Import from wallet file"
3. Paste your xpub/zpub key (extended public key)
   - Get from your Bitcoin wallet (e.g., Electrum, BlueWallet)
   - Or generate new: "Generate new wallet" → Save seed phrase!
4. Click "Continue"
5. Confirm derivation path: m/84'/0'/0' (Native SegWit)
6. Click "Import"

# ✅ Wallet connected! Payments will forward to this wallet.
```

### 3.4 Enable Lightning Network (Optional)

```bash
# In Store Settings:
1. Click "Lightning" → "Setup"
2. Connection type: "Use internal node"
3. Click "Save"

# Open Lightning channels (for instant payments):
# Lightning → Open channel → 0.01 BTC capacity
# Recommended channel: ACINQ, LightningLabs, OpenNode
```

---

## 🔑 STEP 4: GENERATE API KEYS

### 4.1 Create API Key

```bash
# In BTCPayServer dashboard:
1. Click "Account" → "Manage Account" → "API Keys"
2. Click "Generate Key"
3. Label: MessuBouw App
4. Permissions:
   ✅ btcpay.store.canviewinvoices
   ✅ btcpay.store.cancreateinvoice
   ✅ btcpay.store.canmodifyinvoices
   ✅ btcpay.store.webhooks.canmodifywebhooks
5. Click "Generate API Key"
6. Copy key: [xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx]

# ⚠️ SAVE THIS KEY! You can't see it again.
```

### 4.2 Get Store ID

```bash
# In Store Settings:
1. Click "Store Settings" → "General"
2. Look for "Store ID": [xxxxxxxxxxxxxxxxxxxxxxxx]
3. Copy this ID
```

### 4.3 Update Environment Variables

```bash
# On your LOCAL machine (MessuBouw project):
# Edit .env.btcpay file:

BTCPAY_URL=https://pay.messubouw.com
BTCPAY_STORE_ID=[paste_store_id_here]
BTCPAY_API_KEY=[paste_api_key_here]
```

---

## 🔔 STEP 5: SETUP WEBHOOK

### 5.1 Create Webhook

```bash
# In BTCPayServer dashboard:
1. Click "Store Settings" → "Webhooks"
2. Click "Create Webhook"
3. Payload URL: https://messubouw.com/api/webhook/btcpay
4. Secret: [auto-generated - copy this!]
5. Events:
   ✅ InvoiceSettled
   ✅ InvoiceProcessing
   ✅ InvoiceExpired
   ✅ InvoiceInvalid
6. Click "Add webhook"
```

### 5.2 Update Webhook Secret

```bash
# In .env.btcpay:
BTCPAY_WEBHOOK_SECRET=[paste_secret_here]
```

---

## 📧 STEP 6: SETUP EMAIL SERVICE

### 6.1 Sign up for Resend.com

```bash
# Go to: https://resend.com/signup
1. Sign up with email
2. Verify email
3. Go to "API Keys"
4. Click "Create API Key"
5. Name: MessuBouw
6. Permission: Sending access
7. Click "Create"
8. Copy key: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6.2 Add Email Credentials

```bash
# In .env.btcpay:
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6.3 Verify Domain (Optional)

```bash
# In Resend dashboard:
1. Go to "Domains"
2. Click "Add Domain"
3. Domain: messubouw.com
4. Add DNS records (TXT, MX, DKIM)
5. Click "Verify"

# Now you can send from: noreply@messubouw.com
# Without verification: emails sent from onboarding@resend.dev
```

---

## 💾 STEP 7: SETUP DATABASE

### 7.1 Run Migration

```bash
# In Supabase dashboard:
1. Go to SQL Editor
2. Click "New query"
3. Paste contents of: database-migrations/licenses-table.sql
4. Click "Run"

# ✅ Licenses table created with RLS policies
```

### 7.2 Test Database

```bash
# In Supabase SQL Editor:
SELECT * FROM licenses;

# Should show 3 test licenses:
# - MESSUBOUW-FREE-2025-TEST1
# - MESSUBOUW-STARTER-2025-TEST2
# - MESSUBOUW-PRO-2025-TEST3
```

---

## 🧪 STEP 8: TEST PAYMENT FLOW

### 8.1 Start Dev Server

```bash
# In MessuBouw project:
npm run dev

# Open: http://localhost:5173/pricing
```

### 8.2 Create Test Payment

```bash
# In browser:
1. Go to /pricing
2. Click "Pay with Bitcoin" on STARTER plan
3. Should redirect to BTCPayServer checkout
4. URL should be: https://pay.messubouw.com/i/[invoice_id]
```

### 8.3 Test Payment (Testnet)

```bash
# OPTION 1: Use BTCPayServer test mode
# In Store Settings → General → Network: Testnet
# Get testnet BTC from: https://coinfaucet.eu/en/btc-testnet/

# OPTION 2: Pay with real BTC (small amount)
# Use Lightning Network: €0.01 payment = 100 sats (~€0.01 fee)
```

### 8.4 Verify Webhook

```bash
# After payment:
# 1. Check BTCPayServer logs:
docker logs btcpayserver-docker_btcpayserver_1 -f | grep webhook

# 2. Check your app logs (Vercel/Railway):
# Should see: "License created: MESSUBOUW-STARTER-2025-XXXXXX"

# 3. Check email inbox:
# Should receive license key email
```

---

## 🚀 STEP 9: DEPLOY TO PRODUCTION

### 9.1 Deploy API Endpoints

**Option A: Vercel** (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd messu-bouw-restored
vercel deploy --prod

# Set environment variables in Vercel dashboard:
# Settings → Environment Variables
# Add all variables from .env.btcpay
```

**Option B: Railway**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up

# Set environment variables:
railway variables set BTCPAY_URL=https://pay.messubouw.com
railway variables set BTCPAY_API_KEY=xxx
railway variables set BTCPAY_STORE_ID=xxx
# ... (add all variables)
```

**Option C: Cloudflare Workers**

```bash
# Install Wrangler
npm i -g wrangler

# Login
wrangler login

# Deploy
wrangler deploy src/api/create-payment.ts
wrangler deploy src/api/webhook/btcpay.ts

# Set secrets:
wrangler secret put BTCPAY_API_KEY
wrangler secret put BTCPAY_WEBHOOK_SECRET
wrangler secret put RESEND_API_KEY
```

### 9.2 Update Webhook URL

```bash
# In BTCPayServer dashboard:
1. Go to Store Settings → Webhooks
2. Edit webhook
3. Update URL to production:
   https://messubouw.com/api/webhook/btcpay
   (not localhost!)
4. Click "Update"
```

### 9.3 Test Production Payment

```bash
# Make real payment:
1. Go to https://messubouw.com/pricing
2. Click "Pay with Bitcoin"
3. Send minimum amount: €1 (for testing)
4. Wait for confirmation
5. Check email for license key
6. Verify in Supabase: SELECT * FROM licenses ORDER BY created_at DESC LIMIT 1;
```

---

## 📊 STEP 10: MONITORING

### 10.1 BTCPayServer Dashboard

```bash
# Monitor payments:
https://pay.messubouw.com/invoices

# Check wallet balance:
Store Settings → Wallets → Bitcoin

# View analytics:
Dashboard → Analytics
```

### 10.2 Email Logs

```bash
# Resend dashboard:
https://resend.com/emails

# Check delivery status:
- Delivered: ✅
- Bounced: ❌ (check email validity)
- Opened: 👀 (tracking enabled)
```

### 10.3 Database Monitoring

```bash
# Supabase dashboard:
https://supabase.com/dashboard/project/[project_id]/editor

# Query recent sales:
SELECT * FROM recent_sales LIMIT 10;

# Revenue by plan:
SELECT * FROM revenue_by_plan;
```

### 10.4 VPS Health

```bash
# SSH into VPS
ssh root@[VPS_IP]

# Check disk space
df -h

# Check running services
docker ps

# Check Bitcoin node
docker logs btcpayserver-docker_bitcoind_1 --tail 50

# Check BTCPayServer logs
docker logs btcpayserver-docker_btcpayserver_1 --tail 50
```

---

## 🔒 SECURITY CHECKLIST

- [ ] VPS firewall enabled (only ports 22, 80, 443, 9735 open)
- [ ] SSH key authentication (disable password auth)
- [ ] BTCPayServer admin password is strong (20+ chars)
- [ ] API keys stored in environment variables (not in code)
- [ ] Webhook secret is unique (not default)
- [ ] Database RLS policies enabled
- [ ] HTTPS/SSL enabled (Let's Encrypt)
- [ ] Regular backups scheduled (daily)

### Enable Firewall

```bash
# On VPS:
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 9735/tcp # Lightning Network
sudo ufw enable
```

### Disable Password SSH

```bash
# Edit SSH config:
sudo nano /etc/ssh/sshd_config

# Change:
PasswordAuthentication no
PubkeyAuthentication yes

# Restart SSH:
sudo systemctl restart sshd
```

---

## 🆘 TROUBLESHOOTING

### Problem: Bitcoin node not syncing

```bash
# Check logs:
docker logs btcpayserver-docker_bitcoind_1 -f

# Solution 1: Restart Bitcoin node
docker restart btcpayserver-docker_bitcoind_1

# Solution 2: Check disk space
df -h
# If <10% free, upgrade VPS storage

# Solution 3: Enable pruning (saves disk space)
# Edit: ~/btcpayserver-docker/.env
# Add: BTCPAYGEN_BITCOIN_PRUNE=550
# Restart: btcpay-restart.sh
```

### Problem: Payment not confirming

```bash
# Check invoice status:
# BTCPayServer → Invoices → [invoice_id]

# Status "New" = Payment not received
# Status "Paid" = Payment received, waiting confirmation
# Status "Settled" = Confirmed (webhook should fire)

# Force webhook delivery:
# Invoices → [invoice_id] → Delivery → Redeliver
```

### Problem: Webhook not firing

```bash
# Test webhook manually:
curl -X POST https://messubouw.com/api/webhook/btcpay \
  -H "Content-Type: application/json" \
  -H "btcpay-sig: sha256=test" \
  -d '{
    "type": "InvoiceSettled",
    "invoiceId": "test123"
  }'

# Check webhook logs in BTCPayServer:
# Store Settings → Webhooks → [webhook] → Recent Deliveries

# Common issues:
# - Webhook URL incorrect (check production URL)
# - Signature verification failing (check secret)
# - Server not responding (check deployment logs)
```

### Problem: Email not sending

```bash
# Check Resend API key:
curl https://api.resend.com/emails \
  -H "Authorization: Bearer ${RESEND_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "MessuBouw <noreply@messubouw.com>",
    "to": ["your_email@example.com"],
    "subject": "Test Email",
    "html": "<p>This is a test</p>"
  }'

# If 401 Unauthorized = API key invalid
# If 422 Unprocessable = Email format wrong
# If 200 = Email sent successfully
```

---

## 💰 PRICING BREAKDOWN

### VPS Hosting: €5-10/month

- DigitalOcean: $6/month
- Hetzner: €4.50/month
- Railway: $5/month

### Domain: €10/year

- Namecheap: ~€8/year
- GoDaddy: ~€12/year

### Email Service: FREE

- Resend: FREE (3000 emails/month)
- Upgrade: $20/month (50k emails)

### Total Monthly Cost: €5-10

**Revenue Breakeven:**
- 1 STARTER sale = €9.99 → 2 months VPS paid ✅
- 1 PRO sale = €29.99 → 6 months VPS paid ✅

**No transaction fees** = 100% profit after VPS costs!

---

## 📈 SCALING

### When to upgrade VPS:

- **< 100 payments/month:** 2GB RAM ✅
- **100-500 payments/month:** 4GB RAM
- **500+ payments/month:** 8GB RAM + Load balancer

### Optimizations:

1. **Enable pruning** (reduce disk usage)
   ```bash
   # In .env:
   BTCPAYGEN_BITCOIN_PRUNE=550
   ```

2. **Use Lightning Network** (instant payments, lower fees)
   ```bash
   # Open channels with high-liquidity nodes
   ```

3. **CDN for static assets** (faster page load)
   ```bash
   # Cloudflare CDN (free)
   ```

---

## ✅ DEPLOYMENT COMPLETE!

You now have:

✅ BTCPayServer running on VPS  
✅ Bitcoin wallet connected  
✅ Lightning Network enabled  
✅ API endpoints deployed  
✅ Webhook configured  
✅ Email delivery working  
✅ Database schema created  
✅ Pricing page live  

**Next steps:**

1. Test with real €1 payment
2. Share pricing page with beta testers
3. Monitor first week of sales
4. Optimize based on user feedback

**Support:**
- BTCPayServer docs: https://docs.btcpayserver.org
- Community: https://chat.btcpayserver.org
- MessuBouw: support@messubouw.com

🚀 **Ready to accept Bitcoin payments with 0% fees!**
