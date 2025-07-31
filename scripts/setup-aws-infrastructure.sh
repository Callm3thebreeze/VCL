#!/bin/bash

# Script para configurar toda la infraestructura de Vocali en AWS
# Ejecutar después de instalar y configurar AWS CLI

set -e

echo "🚀 Configurando infraestructura de Vocali en AWS..."
echo "📍 Región: eu-north-1"

# Variables
REGION="eu-north-1"
PROJECT_NAME="vocali"

# Buckets S3
FRONTEND_DEV_BUCKET="${PROJECT_NAME}-frontend-develop"
FRONTEND_PROD_BUCKET="${PROJECT_NAME}-frontend-production"
DEPLOYMENT_DEV_BUCKET="${PROJECT_NAME}-deployments-develop"
DEPLOYMENT_PROD_BUCKET="${PROJECT_NAME}-deployments-production"

echo ""
echo "📦 Creando buckets S3..."

# Crear buckets para frontend
echo "   - Frontend develop: $FRONTEND_DEV_BUCKET"
aws s3 mb s3://$FRONTEND_DEV_BUCKET --region $REGION

echo "   - Frontend production: $FRONTEND_PROD_BUCKET"
aws s3 mb s3://$FRONTEND_PROD_BUCKET --region $REGION

# Crear buckets para deployments
echo "   - Deployments develop: $DEPLOYMENT_DEV_BUCKET"
aws s3 mb s3://$DEPLOYMENT_DEV_BUCKET --region $REGION

echo "   - Deployments production: $DEPLOYMENT_PROD_BUCKET"
aws s3 mb s3://$DEPLOYMENT_PROD_BUCKET --region $REGION

echo ""
echo "🌐 Configurando buckets para hosting web..."

# Configurar buckets de frontend para web hosting
for bucket in $FRONTEND_DEV_BUCKET $FRONTEND_PROD_BUCKET; do
    echo "   - Configurando $bucket"
    
    # Habilitar hosting web
    aws s3 website s3://$bucket \
        --index-document index.html \
        --error-document index.html
    
    # Crear política del bucket
    cat > /tmp/bucket-policy-$bucket.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$bucket/*"
    }
  ]
}
EOF
    
    # Aplicar política
    aws s3api put-bucket-policy \
        --bucket $bucket \
        --policy file:///tmp/bucket-policy-$bucket.json
        
    # Limpiar archivo temporal
    rm /tmp/bucket-policy-$bucket.json
done

echo ""
echo "☁️ Creando distribuciones de CloudFront..."

# Función para crear distribución CloudFront
create_cloudfront_distribution() {
    local bucket_name=$1
    local domain=$2
    local env=$3
    
    echo "   - Creando distribución para $domain ($env)"
    
    cat > /tmp/cloudfront-config-$env.json << EOF
{
  "CallerReference": "${PROJECT_NAME}-${env}-$(date +%s)",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$bucket_name",
        "DomainName": "$bucket_name.s3-website.$REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$bucket_name",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Comment": "Vocali Frontend Distribution - $env",
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

    # Crear distribución
    local distribution_id=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/cloudfront-config-$env.json \
        --output text --query Distribution.Id)
    
    echo "   ✅ Distribución creada: $distribution_id"
    echo "   📝 Anota este ID para GitHub: CLOUDFRONT_DISTRIBUTION_ID$([ "$env" = "production" ] && echo "_PROD" || echo "")=$distribution_id"
    
    # Limpiar archivo temporal
    rm /tmp/cloudfront-config-$env.json
    
    return 0
}

# Crear distribuciones CloudFront
create_cloudfront_distribution $FRONTEND_DEV_BUCKET "dev.vocali.com" "develop"
create_cloudfront_distribution $FRONTEND_PROD_BUCKET "app.vocali.com" "production"

echo ""
echo "✅ Infraestructura base creada exitosamente!"
echo ""
echo "📋 Información para GitHub Variables:"
echo "======================================"
echo "S3_FRONTEND_BUCKET=$FRONTEND_DEV_BUCKET"
echo "S3_FRONTEND_BUCKET_PROD=$FRONTEND_PROD_BUCKET"
echo "S3_DEPLOYMENT_BUCKET=$DEPLOYMENT_DEV_BUCKET"
echo "S3_DEPLOYMENT_BUCKET_PROD=$DEPLOYMENT_PROD_BUCKET"
echo ""
echo "🔧 Próximos pasos:"
echo "1. Configurar variables en GitHub (usar los valores de arriba)"
echo "2. Configurar instancia EC2 para el backend"
echo "3. Configurar dominios DNS"
echo "4. Hacer primer deployment"
echo ""
echo "📖 Ver documentación completa en: docs/github-variables.md"
