# NexoTech B2B E-commerce

Frontend demostrativo de una plataforma de comercio electrónico B2B. Incluye una tienda pública, precios diferenciados para clientes PYME, compra y pago simulado, gestión de catálogo para vendedores y herramientas administrativas.

> El modo demostrativo utiliza repositorios y datos mock en memoria. El catálogo y la autenticación pueden configurarse por separado para usar la API; carrito, checkout, pagos y demás módulos continúan siendo simulados.

## Funcionalidades

### Tienda y compradores

- Inicio, búsqueda, filtros por categoría y detalle de productos.
- Carrito con control de cantidades y resumen de compra.
- Registro, inicio de sesión y edición del perfil.
- Checkout protegido y simulación de pagos aprobados, rechazados o cancelados.
- Historial y detalle de pedidos.
- Solicitud, consulta e historial de acreditación PYME.
- Precios PYME cuando la acreditación del comprador está vigente.

### Vendedores

- Creación y edición de productos.
- Administración de productos y categorías.
- Dashboard de ventas, rankings e inventario bajo.
- Edición de la cuenta desde el panel.

### Administradores

- Revisión de solicitudes de acreditación PYME.
- Consulta de usuarios, productos, pedidos y reportes.
- Supervisión del catálogo y edición de la cuenta.

## Tecnologías

- React 19 y TypeScript 6.
- Vite 8.
- React Router 7.
- Vitest, Testing Library y jsdom.
- ESLint 10.
- CSS modularizado por área y design tokens propios.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`.
- npm `>=10`.

## Instalación y ejecución

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la URL local de la aplicación, normalmente `http://localhost:5173`.

No se requieren variables de entorno para ejecutar la versión demostrativa.

### Fuente del catálogo y transporte HTTP

El catálogo público puede usar `VITE_CATALOG_DATA_MODE=demo` (mocks) o
`VITE_CATALOG_DATA_MODE=api` (productos y categorías del backend). El modo `demo`
es el predeterminado. Copia `.env.example` como `.env`; `VITE_API_BASE_URL=/v1`
usa el proxy de desarrollo de Vite hacia `https://localhost:7053`. El proxy omite
la validación del certificado HTTPS únicamente en el entorno local de desarrollo.

```bash
cp .env.example .env
npm run dev
```

Para usar el modo `api`, cambia `VITE_CATALOG_DATA_MODE` a `api` y reinicia Vite.
La API debe estar ejecutándose con su perfil HTTPS para que las solicitudes
`/v1/*` puedan llegar al backend. Si no está disponible, el catálogo muestra el
estado de error existente y no usa mocks como fallback.

La selección de fuente solo afecta al catálogo público (inicio, catálogo y detalle).
El cliente HTTP tipado está en `src/api` e incluye autorización Bearer cuando hay
una sesión API activa. Las mutaciones de productos no se conectan porque la API
no las ofrece.

### Autenticación

`VITE_AUTH_MODE=demo` conserva la autenticación demostrativa predeterminada.
Configura `VITE_AUTH_MODE=api` para usar registro, verificación de correo,
reenvío de código e inicio de sesión en `/v1/autenticacion/*`. El registro no
inicia sesión: el usuario verifica el correo y después inicia sesión.

En modo API el JWT se guarda **solo en memoria**. No se persiste en
`localStorage`, `sessionStorage` ni cookies: recargar la página cierra la sesión,
y no hay refresh token ni endpoint remoto de logout. Esto reduce la exposición
persistente del bearer ante XSS, pero un XSS activo todavía podría acceder al
token mientras la aplicación está abierta. El vencimiento se lee del claim `exp`;
los demás claims decodificados se usan únicamente para estado y navegación de
interfaz. Esa decodificación no verifica la firma ni sustituye la autorización del
backend.

La API actual no incluye un endpoint de perfil (`/me`), así que algunas vistas de
cuenta no pueden mostrar nombre y teléfono reales. Carrito, checkout, pagos,
pedidos, acreditación y operaciones de administración continúan usando mocks;
la autenticación real no los convierte en operaciones reales.

## Usuarios de prueba

Desde `/ingresar` se puede acceder con cualquiera de estos perfiles:

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Comprador regular | `camila.regular@nexotech.demo.test` | `Comprador123!` |
| Comprador PYME | `diego.pyme@nexotech.demo.test` | `CompradorPyme123!` |
| Vendedor | `vendedor@nexotech.demo.test` | `Vendedor123!` |
| Administrador | `admin@nexotech.demo.test` | `Admin123!` |

En desarrollo, el checkout también muestra un selector local para probar los resultados de pago `aprobado`, `rechazado` y `cancelado`.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo con recarga en caliente. |
| `npm run build` | Valida TypeScript y genera el build de producción en `dist/`. |
| `npm run preview` | Sirve localmente el build de producción. |
| `npm run test` | Ejecuta la suite de pruebas una vez. |
| `npm run typecheck` | Comprueba los tipos sin generar artefactos. |
| `npm run lint` | Ejecuta ESLint sobre el repositorio. |

Para validar todos los controles principales antes de integrar cambios:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Rutas principales

| Área | Rutas |
| --- | --- |
| Pública | `/`, `/catalogo`, `/producto/:productId`, `/carrito` |
| Autenticación | `/ingresar`, `/registro` |
| Comprador | `/checkout`, `/pago/resultado`, `/mi-cuenta`, `/mis-pedidos`, `/acreditacion/*` |
| Vendedor | `/vendedor/productos`, `/vendedor/categorias`, `/vendedor/reportes`, `/vendedor/cuenta` |
| Administración | `/admin/acreditaciones`, `/admin/usuarios`, `/admin/productos`, `/admin/pedidos`, `/admin/reportes`, `/admin/cuenta` |

La ruta `/componentes` está disponible únicamente en desarrollo y presenta los componentes compartidos de la interfaz.

## Estructura del proyecto

```text
src/
├── app/          # Composición, router, proveedores y sesión demo
├── domain/       # Tipos y reglas de negocio independientes de React
├── features/     # Módulos por capacidad: catálogo, carrito, checkout, etc.
├── mocks/        # Fixtures y adaptadores en memoria
├── routes/       # Vistas auxiliares y página 404
├── services/     # Contratos de repositorios y pasarelas
├── shared/       # UI, layouts, navegación, estilos y utilidades comunes
└── test/         # Configuración y helpers de pruebas
```

La UI consume contratos definidos en `src/services`. La implementación demostrativa de esos contratos vive en `src/mocks`, lo que permite sustituir los mocks por adaptadores HTTP sin acoplar las páginas a una API específica. Las reglas de precios y reportes se mantienen en `src/domain` para que puedan probarse de forma aislada.

## Estado de la integración

- La autenticación puede ser demostrativa o usar el flujo JWT real, según `VITE_AUTH_MODE`.
- Las comprobaciones de rol del frontend solo controlan la navegación; el backend debe validar los JWT y permisos en cada endpoint.
- Los datos y mutaciones existen solo durante la sesión actual.
- La pasarela de pago es un simulador local y no mueve dinero real.
- El proyecto no necesita secretos ni configuración de backend en su estado actual.

Para conectarlo a servicios reales, implemente los contratos de `AppServices` y entregue las nuevas dependencias mediante `AppServicesProvider`.
