# Configuración de CloudFront usando AWS CLI
# Ejecutar estos comandos después de crear los buckets S3

# 1. Crear bucket S3 para el frontend
aws s3 mb s3://vocali-frontend-production --region eu-north-1

# 2. Configurar bucket para hosting web estático
aws s3 website s3://vocali-frontend-production \
  --index-document index.html \
  --error-document index.html

# 3. Configurar política del bucket
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::vocali-frontend-production/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket vocali-frontend-production \
  --policy file://bucket-policy.json

# 4. Crear distribución de CloudFront
cat > cloudfront-config.json << 'EOF'
{
  "CallerReference": "vocali-frontend-$(date +%s)",
  "Aliases": {
    "Quantity": 1,
    "Items": ["app.vocali.com"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-vocali-frontend",
        "DomainName": "vocali-frontend-production.s3.eu-north-1.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-vocali-frontend",
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
  "Comment": "Vocali Frontend Distribution",
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
