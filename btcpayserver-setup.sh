#!/bin/bash

# ========================================
# BTCPayServer - AUTOMATED SETUP
# 0% Fees | Full Control | Lightning Network
# ========================================

echo "🚀 Starting BTCPayServer installation..."
echo ""
echo "Requirements:"
echo "- VPS with Ubuntu 22.04 (min 2GB RAM)"
echo "- Domain name pointing to VPS IP"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone BTCPayServer Docker
echo "📥 Downloading BTCPayServer..."
cd ~
git clone https://github.com/btcpayserver/btcpayserver-docker
cd btcpayserver-docker

# Set environment variables
echo "⚙️ Configuring BTCPayServer..."
export BTCPAY_HOST="pay.messubouw.com"
export REVERSEPROXY_DEFAULT_HOST="$BTCPAY_HOST"
export NBITCOIN_NETWORK="mainnet"
export BTCPAYGEN_CRYPTO1="btc"
export BTCPAYGEN_LIGHTNING="lnd"
export BTCPAY_ENABLE_SSH=true
export LETSENCRYPT_EMAIL="info.messubouw@gmail.com"

# Generate configuration
./btcpay-setup.sh -i

echo ""
echo "✅ BTCPayServer installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Wait 10-15 minutes for Bitcoin node to sync"
echo "2. Open https://pay.messubouw.com"
echo "3. Create admin account"
echo "4. Go to 'Stores' → Create new store"
echo "5. Store Settings → Access Tokens → Create new token"
echo "6. Copy API key for MessuBouw integration"
echo ""
echo "🔐 SSH into your VPS anytime:"
echo "   ssh admin@pay.messubouw.com"
echo ""
echo "💡 Monitor logs:"
echo "   docker logs btcpayserver-docker_btcpayserver_1 -f"
echo ""
