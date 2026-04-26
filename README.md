# BLACKRAIN ERP

Sistema de gestión empresarial con React + Express + SQLite.

## Características

- ✅ Base de datos SQLite integrada (no requiere MySQL externo)
- ✅ Frontend y backend unificados en un solo servidor
- ✅ Datos persistentes en archivo `.db`
- ✅ Autenticación JWT
- ✅ Gestión de clientes, productos y ventas

## Deploy Rápido

### Opción 1: Render.com

1. Sube este proyecto a GitHub
2. Crea un nuevo Web Service en [Render.com](https://render.com)
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command**: `node backend/server.js`
   - **Node Version**: 18+
5. ¡Listo! La app estará disponible en el URL que te dé Render

### Opción 2: Railway.app

1. Sube este proyecto a GitHub
2. Crea un nuevo proyecto en [Railway.app](https://railway.app)
3. Despliega desde GitHub
4. Railway detectará automáticamente el `package.json`

### Opción 3: Local

```bash
# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install && npm run build

# Iniciar servidor
cd ../backend && node server.js
```

La app estará en: http://localhost:5000

## Credenciales de acceso

- **Email**: admin@erp.com
- **Password**: 1234

## Estructura del proyecto

```
ERPReact/
├── backend/
│   ├── server.js          # Servidor Express + SQLite
│   ├── blackrain_erp.db   # Base de datos (se crea automáticamente)
│   └── package.json
├── frontend/
│   ├── dist/              # Frontend compilado
│   └── src/
└── package.json
```

## Notas importantes

- La base de datos SQLite se crea automáticamente al iniciar el servidor
- Los datos se guardan en `backend/blackrain_erp.db`
- El frontend compilado se sirve estáticamente desde el backend
- No se requiere configuración de base de datos externa

