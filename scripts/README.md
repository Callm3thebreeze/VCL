# 🚀 Scripts de Deploy - Vocali

## 📋 Scripts Disponibles

### `deploy-manual.sh`

Script para deploy manual cuando GitHub Actions no esté disponible.

**Uso:**

```bash
# 1. Configurar variables de entorno
cp .env.deploy.example .env.deploy
# Editar .env.deploy con valores reales

# 2. Cargar variables
source .env.deploy

# 3. Deploy solo frontend
./scripts/deploy-manual.sh

# 4. Deploy frontend + backend
./scripts/deploy-manual.sh backend
```

### `setup-infrastructure.sh`

Configuración inicial de buckets S3 y CloudFront.

### `setup-cloudfront.sh`

Comandos para configurar CloudFront manualmente.

### `setup-ec2.sh`

Configuración inicial del servidor EC2.

## 🔐 Seguridad

- ✅ Scripts NO contienen credenciales hardcodeadas
- ✅ Usan variables de entorno para valores sensibles
- ✅ Archivo `.env.deploy.example` como template
- ✅ `.env.deploy` está en `.gitignore`

## 🛠️ Variables Requeridas

```bash
# Frontend
FRONTEND_BUCKET="vocali-frontend-production"
CLOUDFRONT_DISTRIBUTION_ID_PROD="E1234567890ABC"

# Backend (solo si usas deploy backend)
EC2_INSTANCE_ID="i-1234567890abcdef0"
S3_DEPLOYMENT_BUCKET="vocali-deployments-production"
```

## 📚 GitHub Actions vs Scripts Manuales

| Escenario      | Usar             |
| -------------- | ---------------- |
| Deploy normal  | GitHub Actions   |
| Hotfix urgente | Scripts manuales |
| Debugging      | Scripts manuales |
| Testing local  | Scripts manuales |
| Setup inicial  | Scripts de setup |
