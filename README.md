# NexoTech

Frontend de una plataforma de comercio electrónico B2B construido con React,
TypeScript y Vite. Puede ejecutarse de dos formas:

- **Demo:** usa datos locales y no necesita el backend.
- **API:** conecta autenticación, catálogo, carrito, usuarios y categorías con el
  backend ASP.NET Core y MongoDB.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`.
- npm `10` o superior.
- Para el modo API: .NET SDK 10, MongoDB y el repositorio del backend.

Comprueba las versiones instaladas:

```bash
node --version
npm --version
dotnet --version
```

## Inicio rápido: modo demo

No requiere variables de entorno ni servicios externos.

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

### Usuarios demo

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Comprador | `camila.regular@nexotech.demo.test` | `Comprador123!` |
| Comprador PYME | `diego.pyme@nexotech.demo.test` | `CompradorPyme123!` |
| Vendedor | `vendedor@nexotech.demo.test` | `Vendedor123!` |
| Administrador | `admin@nexotech.demo.test` | `Admin123!` |

Estas cuentas solo existen en el frontend y no funcionan contra la API.

## Ejecución con el backend

Se recomienda mantener ambos repositorios en la misma carpeta:

```text
proyectos/
├── b2b-e-commerce-backend/
└── b2b-e-commerce-ui-migration/
```

### 1. Configurar el backend

En `b2b-e-commerce-backend`, crea los archivos locales a partir de sus
plantillas:

```bash
cp env.example .env
cp src/b2b-e-commerce-api/appSettings.yaml.token src/b2b-e-commerce-api/appSettings.yaml
cp src/b2b-e-commerce-email-worker/appSettings.yaml.token src/b2b-e-commerce-email-worker/appSettings.yaml
```

En PowerShell, usa `Copy-Item` en lugar de `cp`.

Completa únicamente con valores autorizados:

- `.env`: token de LocalStack.
- API `appSettings.yaml`: secreto JWT, conexión de MongoDB y nombre de base de
  datos.
- Worker `appSettings.yaml`: conexión SQS y SMTP.

No publiques estos archivos ni copies secretos en el README. Consulta el
`README.md` del repositorio `b2b-e-commerce-backend` para configurar MongoDB,
LocalStack y el envío de correos.

### 2. Iniciar servicios del backend

Para usar registro y verificación por correo, inicia LocalStack:

```bash
cd ../b2b-e-commerce-backend
docker compose up -d
```

Inicia la API con el perfil HTTPS:

```bash
dotnet run --project src/b2b-e-commerce-api/b2b-e-commerce-api.csproj --launch-profile https
```

La API debe responder en:

- API: `https://localhost:7053`
- Swagger: `https://localhost:7053/swagger`

Para completar el registro por correo, inicia también el worker en otra
terminal:

```bash
dotnet run --project src/b2b-e-commerce-email-worker/b2b-e-commerce-email-worker.csproj
```

El login de cuentas ya verificadas no requiere ejecutar el worker.

### 3. Configurar el frontend

Regresa al repositorio del frontend:

```bash
cd ../b2b-e-commerce-ui-migration
cp .env.example .env
```

Edita `.env` con estos valores:

```dotenv
VITE_API_BASE_URL=/v1
VITE_AUTH_MODE=api
VITE_CATALOG_DATA_MODE=api
VITE_CART_DATA_MODE=api
```

`/v1` utiliza el proxy de Vite configurado hacia
`https://localhost:7053`. El certificado local se acepta únicamente desde el
proxy de desarrollo.

### 4. Iniciar el frontend

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` e inicia sesión con una cuenta activa de MongoDB.
Las cuentas demo no funcionan cuando `VITE_AUTH_MODE=api`.

## Qué está conectado a la API

| Módulo | Estado |
| --- | --- |
| Registro, verificación, reenvío de código y login | API real |
| Productos y categorías públicas | API real en modo `api` |
| Carrito | API real en modo `api` |
| Directorio administrativo de usuarios | API real; requiere `ADMINISTRADOR` |
| Gestión administrativa de categorías | API real; requiere `ADMINISTRADOR` |
| Perfil, acreditación PYME, checkout, pagos y pedidos | Simulados o no disponibles en la API |
| Reportes | Datos demo |

El JWT se conserva en `sessionStorage`: al recargar la misma pestaña se restaura la sesión mientras el token siga vigente. Cerrar sesión elimina el token guardado. Cerrar la pestaña finaliza su almacenamiento de sesión.

## Variables de entorno

| Variable | Valores | Descripción |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/v1` | Ruta base de la API mediante el proxy local. |
| `VITE_AUTH_MODE` | `demo` / `api` | Fuente de autenticación. |
| `VITE_CATALOG_DATA_MODE` | `demo` / `api` | Fuente de productos y categorías. |
| `VITE_CART_DATA_MODE` | `demo` / `api` | Fuente del carrito. |

Para usar el carrito real, las tres variables de modo deben estar en `api`.
Después de cambiar `.env`, reinicia Vite.

## Comandos útiles

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Valida TypeScript y genera `dist/`. |
| `npm run preview` | Sirve localmente el build. |
| `npm run test` | Ejecuta las pruebas. |
| `npm run typecheck` | Comprueba los tipos. |
| `npm run lint` | Ejecuta ESLint. |

Validación recomendada antes de integrar cambios:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Solución de problemas

### El frontend muestra un error de red

- Confirma que la API esté activa en `https://localhost:7053`.
- Confirma que el frontend esté abierto desde `http://localhost:5173`.
- Reinicia Vite después de modificar `.env`.

### El login devuelve 401

- Las cuentas demo no existen en MongoDB.
- Usa una cuenta activa y verificada del backend.
- Verifica el correo y la contraseña; las contraseñas se almacenan como hashes
  PBKDF2 y no pueden recuperarse en texto plano.

### El registro no envía el código

- Confirma que LocalStack y el Email Worker estén ejecutándose.
- Revisa la configuración SQS y SMTP del backend.

### Una ruta administrativa devuelve 401 o 403

- Inicia sesión con una cuenta activa.
- Confirma que el usuario tenga el rol requerido en MongoDB.

### El navegador rechaza el certificado

Abre `https://localhost:7053/swagger` y acepta el certificado de desarrollo, o
confía en el certificado local de .NET:

```bash
dotnet dev-certs https --trust
```

## Seguridad

- `.env` y `.env.*` están ignorados por Git, excepto `.env.example`.
- No subas contraseñas, tokens, JWT ni cadenas de conexión.
- Usa únicamente credenciales de desarrollo autorizadas.
