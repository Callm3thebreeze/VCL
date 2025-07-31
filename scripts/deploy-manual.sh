#!/bin/bash

# Script de deploy manual para testing
# Usar solo para pruebas antes del deploy automático

set -e

echo "🚀 Deploy manual de Vocali..."

# Variables de entorno (configurar antes de ejecutar)
# export FRONTEND_BUCKET="vocali-frontend-production"
# export CLOUDFRONT_DISTRIBUTION_ID_PROD="E1234567890ABC"
# export EC2_INSTANCE_ID="i-1234567890abcdef0"

FRONTEND_BUCKET="${FRONTEND_BUCKET:-vocali-frontend-production}"
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID_PROD:-}"
BACKEND_INSTANCE="${EC2_INSTANCE_ID:-}"

# Validar variables requeridas
if [ -z "$DISTRIBUTION_ID" ]; then
    echo "❌ Error: CLOUDFRONT_DISTRIBUTION_ID_PROD no está configurado"
    echo "💡 Ejecuta: export CLOUDFRONT_DISTRIBUTION_ID_PROD=tu_distribution_id"
    exit 1
fi

if [ "$1" = "backend" ] && [ -z "$BACKEND_INSTANCE" ]; then
    echo "❌ Error: EC2_INSTANCE_ID no está configurado para deploy del backend"
    echo "💡 Ejecuta: export EC2_INSTANCE_ID=tu_instance_id"
    exit 1
fi

# Build y deploy del frontend
echo "🎨 Building frontend..."
cd frontend
npm ci
npm run generate

echo "📤 Uploading to S3..."
aws s3 sync .output/public/ s3://$FRONTEND_BUCKET --delete --cache-control max-age=31536000,public

echo "🔄 Invalidating CloudFront..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

cd ..

# Deploy del backend (si se especifica)
if [ "$1" = "backend" ]; then
  echo "🔧 Deploying backend..."
  cd backend
  
  # Crear package para deployment
  zip -r ../vocali-backend-$(date +%Y%m%d-%H%M%S).zip . \
    -x "node_modules/*" ".git/*" "uploads/*" "temp/*" "*.log"
  
  # Subir a S3 para CodeDeploy
  aws s3 cp ../vocali-backend-*.zip s3://vocali-deployments/
  
  echo "📡 Backend package uploaded. Deploy via CodeDeploy in AWS Console."
  cd ..
fi

echo "✅ Deploy completed!"
echo "🌐 Frontend: Check CloudFront distribution"
echo "📱 Backend: Check EC2 instance status"
