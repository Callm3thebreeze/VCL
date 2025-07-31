# 🚀 VOCALI - GUÍA COMPLETA DE DEPLOY EC2 + CODEDEPLOY

Esta guía te llevará paso a paso para configurar un deploy automático completo usando EC2 + CodeDeploy.

## 📋 **RESUMEN DE ARCHIVOS CREADOS**

```
aws/
├── create-ec2-backend.sh       # Crear instancia EC2
├── user-data-backend.sh        # Script de inicialización de EC2
└── create-codedeploy.sh        # Configurar CodeDeploy

backend/
├── appspec.yml                 # Configuración de CodeDeploy
└── scripts/
    ├── stop_application.sh     # Detener app antes del deploy
    ├── install_dependencies.sh # Instalar dependencias
    ├── setup_environment.sh    # Configurar entorno
    ├── start_application.sh    # Iniciar aplicación
    └── validate_service.sh     # Validar que funciona
```

## 🎯 **PROCESO COMPLETO - EJECUTAR EN ORDEN**

### **PASO 1: Crear Instancia EC2**

```bash
cd aws
./create-ec2-backend.sh
```

**Resultado esperado:**

- ✅ Instancia EC2 creada
- ✅ Security groups configurados
- ✅ Key pair descargado (.pem)
- ✅ IP pública asignada

**Guarda estos datos:** Instance ID, IP pública, Key file

---

### **PASO 2: Configurar CodeDeploy**

```bash
./create-codedeploy.sh
```

**Resultado esperado:**

- ✅ IAM roles creados
- ✅ CodeDeploy application creada
- ✅ Deployment group configurado

**Guarda estos datos:**

- Application Name: `vocali-backend-app`
- Deployment Group: `vocali-backend-group`

---

### **PASO 3: Asociar IAM Role a EC2**

```bash
# Obtener Instance ID del paso 1
INSTANCE_ID="i-1234567890abcdef0"  # Reemplazar con tu Instance ID

# Asociar instance profile
aws ec2 associate-iam-instance-profile \
  --instance-id $INSTANCE_ID \
  --iam-instance-profile Name=EC2CodeDeployInstanceRole
```

---

### **PASO 4: Configurar Variables en GitHub**

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions

**VARIABLES (Variables tab):**

```
S3_DEPLOYMENT_BUCKET = vocali-deployments
CODEDEPLOY_APPLICATION = vocali-backend-app
CODEDEPLOY_GROUP = vocali-backend-group
```

**SECRETS (Secrets tab):**

```
AWS_ACCESS_KEY_ID = tu-access-key
AWS_SECRET_ACCESS_KEY = tu-secret-key
OPENAI_API_KEY = tu-openai-key (opcional)
```

---

### **PASO 5: Hacer Commit de los Archivos**

```bash
# Desde el directorio raíz del proyecto
git add backend/appspec.yml backend/scripts/
git commit -m "feat: Agregar configuración de CodeDeploy

- appspec.yml para configuración de deploy
- Scripts de deploy para EC2
- Configuración completa de PM2 + Nginx"

git push origin develop
```

---

### **PASO 6: Verificar Deploy Automático**

1. **Trigger del workflow:** El push debería disparar automáticamente el workflow
2. **Monitorear en GitHub:** Actions → Vocali Backend Develop Deployment
3. **Monitorear en AWS:** CodeDeploy → Applications → vocali-backend-app
4. **Verificar resultado:** Visitar `http://TU-IP-PUBLICA/health`

---

## 🔍 **VERIFICACIÓN Y TROUBLESHOOTING**

### **Conectar a EC2**

```bash
# Usar el archivo .pem del paso 1
ssh -i vocali-backend-key.pem ubuntu@TU-IP-PUBLICA
```

### **Verificar Estado en EC2**

```bash
# Estado de PM2
sudo -u vocali pm2 status

# Logs de la aplicación
sudo -u vocali pm2 logs vocali-backend

# Estado de Nginx
systemctl status nginx

# Health check local
curl http://localhost:3000/health
```

### **Verificar CodeDeploy**

```bash
# Estado del agente
sudo service codedeploy-agent status

# Logs del deploy
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log
```

### **Logs Importantes**

- **Setup de EC2:** `/var/log/vocali-setup.log`
- **Aplicación:** `/var/www/vocali-backend/logs/app.log`
- **CodeDeploy:** `/var/log/aws/codedeploy-agent/`
- **Nginx:** `/var/log/nginx/`

---

## 🎯 **URLs FINALES**

Una vez completado el setup, tu aplicación estará disponible en:

- **Health Check:** `http://TU-IP-PUBLICA/health`
- **API Endpoints:** `http://TU-IP-PUBLICA/api/`
- **API Docs:** `http://TU-IP-PUBLICA/api-docs`
- **Frontend:** `https://TU-DOMINIO-FRONTEND` (desde S3/CloudFront)

---

## ⚡ **COMANDOS RÁPIDOS**

```bash
# Crear todo desde cero
cd aws
./create-ec2-backend.sh
./create-codedeploy.sh

# Asociar role a EC2 (reemplazar INSTANCE_ID)
aws ec2 associate-iam-instance-profile \
  --instance-id INSTANCE_ID \
  --iam-instance-profile Name=EC2CodeDeployInstanceRole

# Hacer deploy manual (si es necesario)
git add . && git commit -m "deploy" && git push origin develop
```

---

## 🆘 **SI ALGO FALLA**

1. **EC2 no responde:** Verificar Security Groups (puertos 22, 80, 443, 3000)
2. **CodeDeploy falla:** Verificar logs en `/var/log/aws/codedeploy-agent/`
3. **App no inicia:** Verificar logs en `/var/www/vocali-backend/logs/`
4. **Nginx error:** Verificar configuración con `nginx -t`

---

## 📚 **PRÓXIMOS PASOS OPCIONALES**

1. **Dominio personalizado:** Configurar Route 53 + certificado SSL
2. **Base de datos:** Configurar RDS MySQL
3. **Monitoreo:** Configurar CloudWatch
4. **Backup:** Configurar snapshots de EC2
5. **Escalabilidad:** Configurar Auto Scaling Group

---

**¡Tu pipeline de deploy automático está listo!** 🎉

Cada push a `develop` ahora:

1. ✅ Ejecuta tests
2. ✅ Crea package ZIP
3. ✅ Sube a S3
4. ✅ Ejecuta CodeDeploy
5. ✅ Reinicia aplicación en EC2
6. ✅ Valida que funciona
