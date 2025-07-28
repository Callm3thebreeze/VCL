# Tests de Vocali Backend

Esta carpeta contiene todos los tests para el backend de Vocali, organizados por tipo y funcionalidad.

## Estructura de Tests

```
tests/
├── api/                    # Tests de API endpoints
│   ├── basic-endpoints-test.js     # Tests básicos de endpoints
│   └── complete-api-test.js        # Test completo del flujo de API
├── integration/            # Tests de integración
│   ├── database-connection-test.js # Test de conectividad de BD
│   └── app-test.js                # Test básico del servidor
├── unit/                   # Tests unitarios (futuro)
├── test-runner.js         # Script maestro para ejecutar tests
└── README.md              # Esta documentación
```

## Cómo Ejecutar los Tests

### 1. Ejecutar Todos los Tests

```bash
cd tests
node test-runner.js
```

### 2. Ejecutar Tests Específicos

```bash
# Test de base de datos
node test-runner.js database

# Test básico del servidor
node test-runner.js app

# Test de endpoints básicos
node test-runner.js endpoints

# Test completo de API
node test-runner.js complete
```

### 3. Ejecutar Tests Individuales

```bash
# Test de conexión a BD
node integration/database-connection-test.js

# Test básico del servidor
node integration/app-test.js

# Test de endpoints básicos
node api/basic-endpoints-test.js

# Test completo de API
node api/complete-api-test.js
```

## Descripción de Tests

### API Tests (`/api`)

#### `basic-endpoints-test.js`

- **Propósito**: Prueba endpoints básicos sin flujo completo
- **Incluye**: Health check, documentación, registro simple, login básico
- **Uso**: Verificación rápida de endpoints fundamentales

#### `complete-api-test.js`

- **Propósito**: Test completo del flujo de usuario
- **Incluye**: Registro → Login → Perfil → Transcripciones → Actualizar → Logout
- **Uso**: Validación completa del workflow de la aplicación

### Integration Tests (`/integration`)

#### `database-connection-test.js`

- **Propósito**: Verificar conectividad y estructura de BD
- **Incluye**: Conexión, tablas, conteos, estructura
- **Uso**: Validar que la base de datos esté correctamente configurada

#### `app-test.js`

- **Propósito**: Test básico del servidor Express
- **Incluye**: Health check, documentación, middleware de auth
- **Uso**: Verificar que el servidor está funcionando correctamente

## Prerequisites

### Antes de Ejecutar Tests

1. **Servidor corriendo**: `npm start` en el directorio backend
2. **Base de datos activa**: `npm run db:start`
3. **Dependencias instaladas**: `npm install`

### Variables de Entorno

Asegúrate de que el archivo `.env` esté configurado con:

```env
DB_HOST=localhost
DB_PORT=3307
DB_NAME=vocali_db
DB_USER=vocali_user
DB_PASSWORD=password123
JWT_SECRET=your-secret-key
```

## Ejemplos de Uso

### Test Rápido

```bash
# Verificar que todo funciona básicamente
node test-runner.js basic
```

### Test Completo antes de Deploy

```bash
# Ejecutar todos los tests
node test-runner.js
```

### Debug de Problemas Específicos

```bash
# Solo test de BD si hay problemas de conexión
node test-runner.js database

# Solo test de API si hay problemas de endpoints
node test-runner.js complete
```

## Salida Esperada

Los tests exitosos mostrarán:

- ✅ para tests que pasan
- ❌ para tests que fallan
- ℹ️ para información adicional
- 🎉 para completación exitosa

### Ejemplo de Salida Exitosa:

```
🧪 Running All Vocali Backend Tests...
==================================================

🗄️  PHASE 1: Database Connection Tests
==================================================
✅ Database connection established
✅ Query executed successfully
✅ Found 4 tables: users, session_tokens, audio_files, transcriptions
...

🎉 ALL TESTS COMPLETED SUCCESSFULLY! 🎉
```

## Troubleshooting

### Error: "Connection refused"

- Verificar que el servidor esté corriendo (`npm start`)
- Verificar puerto 3000 disponible

### Error: "Database connection failed"

- Verificar que Docker esté corriendo (`docker ps`)
- Verificar base de datos activa (`npm run db:start`)

### Error: "Authentication failed"

- Verificar variable JWT_SECRET en .env
- Verificar que las tablas de usuarios existan

## Añadir Nuevos Tests

Para añadir nuevos tests:

1. **Tests de API**: Crear en `/api/` para nuevos endpoints
2. **Tests de Integración**: Crear en `/integration/` para nuevos servicios
3. **Tests Unitarios**: Crear en `/unit/` para funciones específicas
4. **Actualizar test-runner.js**: Añadir nuevos tests al runner principal

### Ejemplo de Nuevo Test:

```javascript
// tests/api/new-feature-test.js
async function testNewFeature() {
  console.log('🆕 Testing New Feature...');
  // Test implementation
}

if (require.main === module) {
  testNewFeature();
}

module.exports = { testNewFeature };
```
