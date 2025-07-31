# Vocali Backend

Backend para la plataforma de transcripción de audio Vocali, desarrollado con Node.js, Express y MySQL.

**Última actualización**: 31/07/2025 - Workflow actualizado a tar.gz

## Características

- 🔐 **Autenticación completa** con JWT y bcrypt
- 📁 **Subida de archivos** a AWS S3 (hasta 20MB)
- 🎵 **Gestión de archivos de audio** con URLs públicas
- 📝 **Sistema de transcripciones** con estados y estadísticas
- 📚 **API REST documentada** con Swagger
- 🔍 **Validación robusta** con Joi
- 🧪 **Tests unitarios** con Jest
- 📊 **Base de datos MySQL** con relaciones optimizadas
- 🛡️ **Middleware de seguridad** (helmet, rate limiting, CORS)

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/           # Configuración de BD y app
│   ├── controllers/      # Lógica de endpoints
│   ├── middleware/       # Autenticación, validación, upload
│   ├── models/           # Entidades y tipos
│   ├── routes/           # Definición de rutas
│   ├── schemas/          # Esquemas de validación
│   ├── services/         # Lógica de negocio
│   ├── swagger/          # Documentación API
│   ├── jobs/             # Tareas de limpieza
│   └── app.js            # Aplicación principal
├── tests/                # Tests unitarios
├── database/             # Scripts SQL
├── package.json
└── README.md
```

## Instalación

1. **Clonar el repositorio**

```bash
git clone <repo-url>
cd vocali/backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**

```bash
# Crear la base de datos MySQL
mysql -u root -p < database/init.sql
```

5. **Configurar AWS S3**

- Crear un bucket en S3
- Configurar las credenciales en .env
- Ajustar permisos del bucket para acceso público

## Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

### Tests

```bash
npm test                # Ejecutar tests
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Tests con coverage
```

### Linting

```bash
npm run lint           # Verificar código
npm run lint:fix       # Corregir automáticamente
```

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/logout-all` - Cerrar todas las sesiones
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios

- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/change-password` - Cambiar contraseña
- `DELETE /api/users/deactivate` - Desactivar cuenta

### Archivos

- `POST /api/files/upload` - Subir archivo de audio
- `GET /api/files` - Listar archivos del usuario
- `GET /api/files/:id` - Obtener archivo específico
- `GET /api/files/:id/download` - Obtener URL de descarga
- `DELETE /api/files/:id` - Eliminar archivo
- `GET /api/files/stats` - Estadísticas de archivos

### Transcripciones

- `GET /api/transcriptions` - Listar transcripciones
- `GET /api/transcriptions/:id` - Obtener transcripción específica
- `GET /api/transcriptions/file/:fileId` - Transcripción por archivo
- `POST /api/transcriptions/file/:fileId/retry` - Reintentar transcripción
- `DELETE /api/transcriptions/:id` - Eliminar transcripción
- `GET /api/transcriptions/stats` - Estadísticas de transcripciones

## Documentación API

La documentación completa de la API está disponible en:

- **Desarrollo**: http://localhost:3000/api-docs
- **JSON**: http://localhost:3000/api-docs.json

## Base de Datos

### Tablas Principales

1. **users** - Información de usuarios
2. **session_tokens** - Tokens de autenticación
3. **audio_files** - Metadatos de archivos
4. **transcriptions** - Transcripciones y estados

### Relaciones

- Un usuario puede tener múltiples archivos
- Un archivo tiene una transcripción
- Un usuario puede tener múltiples tokens de sesión

## Configuración

### Variables de Entorno

```env
# Servidor
NODE_ENV=development
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vocali_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=vocali-audio-files

# Archivos
MAX_FILE_SIZE=20971520
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/mp3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Rate limiting por IP
- ✅ Validación de entrada con Joi
- ✅ Headers de seguridad con Helmet
- ✅ CORS configurado
- ✅ Sanitización de datos

## Testing

Los tests incluyen:

- Tests de endpoints (auth, usuarios, archivos)
- Tests de modelos y entidades
- Tests de middleware
- Tests de servicios

Coverage objetivo: >80%

## Deployment

### Preparación para Producción

1. **Variables de entorno**

```bash
NODE_ENV=production
# Configurar todas las variables necesarias
```

2. **Base de datos**

```bash
# Asegurar que MySQL está configurado y optimizado
# Ejecutar migrations si las hay
```

3. **AWS S3**

```bash
# Configurar bucket con permisos apropiados
# Configurar CORS si es necesario
```

4. **Proceso**

```bash
npm run build  # Si tienes proceso de build
npm start
```

## Monitoreo

- Logs estructurados con Morgan
- Health check en `/health`
- Métricas de archivos y transcripciones
- Cleanup automático de tokens expirados

## Próximos Pasos

1. **Integración de transcripción real**

   - AWS Transcribe
   - Google Speech-to-Text
   - Azure Speech Services

2. **Mejoras de rendimiento**

   - Redis para cache
   - Queue para transcripciones
   - CDN para archivos

3. **Características adicionales**
   - Webhooks para notificaciones
   - Múltiples idiomas
   - Análisis de sentimientos

## Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## Licencia

MIT License - ver el archivo LICENSE para detalles.

## Soporte

Para soporte técnico o preguntas:

- Email: support@vocali.com
- Documentación: http://localhost:3000/api-docs
