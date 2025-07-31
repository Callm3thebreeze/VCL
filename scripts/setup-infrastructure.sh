#!/bin/bash

# Script de configuración inicial para el despliegue
# Ejecutar una sola vez para configurar la infraestructura

set -e

echo "🚀 Configurando infraestructura de Vocali..."

# Variables
REGION="eu-north-1"
FRONTEND_BUCKET="vocali-frontend-production"
DEPLOYMENT_BUCKET="vocali-deployments"
DOMAIN="app.vocali.com"

# 1. Crear buckets S3
echo "📦 Creando buckets S3..."
aws s3 mb s3://$FRONTEND_BUCKET --region $REGION
aws s3 mb s3://$DEPLOYMENT_BUCKET --region $REGION

# 2. Configurar bucket del frontend para web hosting
echo "🌐 Configurando web hosting..."
aws s3 website s3://$FRONTEND_BUCKET \
  --index-document index.html \
  --error-document index.html

# 3. Configurar política del bucket
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$FRONTEND_BUCKET/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $FRONTEND_BUCKET \
  --policy file:///tmp/bucket-policy.json

# 4. Crear certificado SSL (si el dominio está disponible)
echo "🔒 Creando certificado SSL..."
CERT_ARN=$(aws acm request-certificate \
  --domain-name $DOMAIN \
  --validation-method DNS \
  --region us-east-1 \
  --output text --query CertificateArn)

echo "Certificado creado: $CERT_ARN"
echo "⚠️  IMPORTANTE: Debes validar el certificado en la consola de AWS"

# 5. Crear distribución de CloudFront
echo "☁️ Creando distribución de CloudFront..."
cat > /tmp/cloudfront-config.json << EOF
{
  "CallerReference": "vocali-frontend-$(date +%s)",
  "Aliases": {
    "Quantity": 1,
    "Items": ["$DOMAIN"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$FRONTEND_BUCKET",
        "DomainName": "$FRONTEND_BUCKET.s3-website.$REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$FRONTEND_BUCKET",
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
  "Comment": "Vocali Frontend Distribution",
  "Enabled": true,
  "PriceClass": "PriceClass_100",
  "ViewerCertificate": {
    "ACMCertificateArn": "$CERT_ARN",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
EOF

DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file:///tmp/cloudfront-config.json \
  --output text --query Distribution.Id)

echo "CloudFront Distribution creada: $DISTRIBUTION_ID"

# 6. Crear Launch Template para EC2
echo "🖥️ Creando Launch Template para EC2..."
aws ec2 create-launch-template \
  --launch-template-name vocali-backend-template \
  --launch-template-data '{
    "ImageId": "ami-0989fb15ce71ba39e",
    "InstanceType": "t3.micro",
    "SecurityGroupIds": ["sg-xxxxxxxxx"],
    "IamInstanceProfile": {"Name": "EC2-CodeDeploy-Role"},
    "UserData": "'$(base64 -w 0 << 'USERDATA'
#!/bin/bash
yum update -y
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git codedeploy-agent
npm install -g pm2
systemctl start codedeploy-agent
systemctl enable codedeploy-agent
USERDATA
)'"
  }'

# 7. Mostrar información importante
echo "✅ Configuración completada!"
echo ""
echo "📋 Información importante:"
echo "Frontend Bucket: s3://$FRONTEND_BUCKET"
echo "CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "Certificado SSL ARN: $CERT_ARN"
echo ""
echo "🔧 Próximos pasos:"
echo "1. Validar el certificado SSL en la consola de AWS"
echo "2. Configurar los DNS para apuntar a CloudFront"
echo "3. Agregar los secrets al repositorio de GitHub"
echo "4. Configurar la instancia EC2 para el backend"
echo ""
echo "📝 Secrets para GitHub:"
echo "S3_BUCKET_NAME=$FRONTEND_BUCKET"
echo "CLOUDFRONT_DISTRIBUTION_ID=$DISTRIBUTION_ID"
echo "CLOUDFRONT_DOMAIN=$DOMAIN"
