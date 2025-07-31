#!/bin/bash

# =============================================================================
# SCRIPT DE DEPLOYMENT MANUAL PARA VOCALI BACKEND
# =============================================================================

echo "🚀 Vocali Backend Manual Deployment Script"
echo "==========================================="

# Variables
BUCKET="vocali-deployments"
TIMESTAMP=${1:-$(date +%Y%m%d-%H%M%S)}
PACKAGE_NAME="vocali-backend-$TIMESTAMP.zip"

echo "📥 Downloading latest package from S3..."
echo "Package: $PACKAGE_NAME"

# Descargar el package
cd /tmp
aws s3 cp s3://$BUCKET/$PACKAGE_NAME ./ || {
    echo "❌ Error downloading package. Available packages:"
    aws s3 ls s3://$BUCKET/ | grep vocali-backend
    exit 1
}

echo "🛑 Stopping current application..."
pm2 stop vocali-backend 2>/dev/null || echo "No PM2 process to stop"
sudo systemctl stop vocali-backend 2>/dev/null || echo "No systemd service to stop"

echo "📁 Creating backup..."
sudo rm -rf /var/www/vocali-backend-backup 2>/dev/null || true
sudo mv /var/www/vocali-backend /var/www/vocali-backend-backup 2>/dev/null || echo "No previous version to backup"

echo "📦 Extracting new version..."
sudo mkdir -p /var/www/vocali-backend
sudo unzip -o $PACKAGE_NAME -d /var/www/vocali-backend/
sudo chown -R ubuntu:ubuntu /var/www/vocali-backend

echo "🔧 Installing dependencies..."
cd /var/www/vocali-backend
npm ci --only=production

echo "⚙️ Setting up environment..."
cp .env.example .env 2>/dev/null || echo "No .env.example found"

echo "🚀 Starting application..."
pm2 start src/app.js --name vocali-backend || pm2 restart vocali-backend

echo "✅ Deployment completed!"
echo "🔍 Checking status..."
pm2 list
sleep 5
curl -f http://localhost:3000/health && echo "✅ Health check passed!" || echo "⚠️ Health check failed"

echo ""
echo "🎯 Deployment Summary:"
echo "- Package: $PACKAGE_NAME"
echo "- Status: Check 'pm2 list' and 'curl http://localhost:3000/health'"
echo "- Logs: pm2 logs vocali-backend"
