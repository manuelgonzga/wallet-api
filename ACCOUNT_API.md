# API de Account - Documentación

## Descripción
Nueva tabla y API para gestionar preferencias de la cuenta del usuario, incluyendo nombre de usuario y preferencia de moneda.

## Tabla de base de datos
```sql
CREATE TABLE account (
  user_id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  currency_preference VARCHAR(10) NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Endpoints disponibles

### 1. Obtener monedas válidas
**GET** `/api/account/currencies`
- **Descripción**: Obtiene la lista de monedas válidas
- **Autenticación**: No requerida
- **Respuesta**:
```json
[
  { "code": "EUR", "name": "Euro", "symbol": "€" },
  { "code": "USD", "name": "US Dollar", "symbol": "$" },
  ...
]
```

### 2. Obtener información de la cuenta
**GET** `/api/account/:userId`
- **Descripción**: Obtiene la información de la cuenta de un usuario específico
- **Autenticación**: Requerida (JWT)
- **Parámetros**: `userId` (string)
- **Respuesta**:
```json
{
  "user_id": "user_123",
  "username": "john_doe",
  "currency_preference": "USD",
  "created_at": "2025-01-10T10:00:00Z",
  "updated_at": "2025-01-10T10:00:00Z"
}
```

### 3. Crear o actualizar cuenta
**POST** `/api/account`
- **Descripción**: Crea una nueva cuenta o actualiza una existente (upsert)
- **Autenticación**: Requerida (JWT)
- **Body**:
```json
{
  "user_id": "user_123",
  "username": "john_doe",
  "currency_preference": "USD"
}
```
- **Respuesta**: Cuenta creada/actualizada

### 4. Actualizar nombre de usuario
**PUT** `/api/account/:userId/username`
- **Descripción**: Actualiza solo el nombre de usuario
- **Autenticación**: Requerida (JWT)
- **Parámetros**: `userId` (string)
- **Body**:
```json
{
  "username": "new_username"
}
```

### 5. Actualizar preferencia de moneda
**PUT** `/api/account/:userId/currency`
- **Descripción**: Actualiza solo la preferencia de moneda
- **Autenticación**: Requerida (JWT)
- **Parámetros**: `userId` (string)
- **Body**:
```json
{
  "currency_preference": "EUR"
}
```

### 6. Eliminar cuenta completa
**POST** `/api/account/delete-account`
- **Descripción**: Elimina completamente la cuenta del usuario (incluye Clerk y todas las tablas)
- **Autenticación**: Requerida (JWT)

## Monedas soportadas
- EUR (Euro) - €
- USD (US Dollar) - $
- GBP (British Pound) - £
- JPY (Japanese Yen) - ¥
- CAD (Canadian Dollar) - C$
- AUD (Australian Dollar) - A$
- CHF (Swiss Franc) - CHF
- CNY (Chinese Yuan) - ¥
- MXN (Mexican Peso) - $
- BRL (Brazilian Real) - R$

## Validaciones
- `user_id`: Requerido, string
- `username`: Requerido, máximo 100 caracteres
- `currency_preference`: Requerido, debe ser una de las monedas válidas

## Archivos principales
- `/src/config/db.js` - Configuración de base de datos y migración
- `/src/controllers/accountController.js` - Lógica de negocio
- `/src/routes/accountRoute.js` - Definición de rutas
- `/src/constants/currencies.js` - Constantes y utilidades de monedas

## Ejemplos de uso

### Crear una cuenta
```bash
curl -X POST http://localhost:5001/api/account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_id": "user_123",
    "username": "john_doe",
    "currency_preference": "USD"
  }'
```

### Obtener información de cuenta
```bash
curl -X GET http://localhost:5001/api/account/user_123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Actualizar moneda
```bash
curl -X PUT http://localhost:5001/api/account/user_123/currency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currency_preference": "EUR"
  }'
```
