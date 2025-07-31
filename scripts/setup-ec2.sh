#!/bin/bash

# Script para configurar PM2 en la instancia EC2
# Ejecutar una vez en la instancia EC2

set -e

echo "🔧 Configurando servidor para Vocali Backend..."

# Actualizar sistema
sudo yum update -y

# Instalar Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar y configurar CodeDeploy agent
sudo yum install -y ruby wget
cd /home/ec2-user
wget https://aws-codedeploy-eu-north-1.s3.eu-north-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto

# Configurar nginx
sudo yum install -y nginx
sudo systemctl enable nginx

# Crear configuración nginx para Vocali
sudo tee /etc/nginx/conf.d/vocali.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.vocali.com api-dev.vocali.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Iniciar nginx
sudo systemctl start nginx

# Crear directorio para la aplicación
sudo mkdir -p /opt/vocali
sudo chown ec2-user:ec2-user /opt/vocali

echo "✅ Servidor configurado correctamente"
echo "📝 Próximos pasos:"
echo "1. Configurar CodeDeploy Application"
echo "2. Hacer primer deployment desde GitHub Actions"
echo "3. Configurar SSL con Let's Encrypt"
