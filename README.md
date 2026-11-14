# NexoTech B2B E-commerce

Frontend demostrativo de una plataforma de comercio electrónico B2B. Incluye una tienda pública, precios diferenciados para clientes PYME, compra y pago simulado, gestión de catálogo para vendedores y herramientas administrativas.

> El proyecto funciona actualmente con repositorios y datos mock en memoria. No se conecta a una API ni procesa pagos reales; al recargar la aplicación, los cambios realizados durante la sesión se restablecen.

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

### Transporte HTTP (infraestructura inicial)

La interfaz continúa usando los repositorios mock. Para preparar el cliente HTTP,
copia `.env.example` como `.env`; `VITE_API_BASE_URL=/v1` usa el proxy de desarrollo
de Vite hacia `https://localhost:7053`. El proxy omite la validación del certificado
HTTPS únicamente en el entorno local de desarrollo.

```bash
cp .env.example .env
npm run dev
```

La API debe estar ejecutándose con su perfil HTTPS para que las solicitudes
`/v1/*` puedan llegar al backend. Si no está disponible, el proxy devolverá un
error de conexión; la interfaz no sustituye ese error con datos mock. Esta
infraestructura todavía no conecta los servicios HTTP a las pantallas.

El cliente centralizado y los wrappers tipados de productos, categorías y
usuarios viven en `src/api`. Auth y carrito tienen únicamente contratos DTO
preparados; sus operaciones y flujos de UI se dejan para una fase posterior.
La implementación actual de `AppServices` sigue apuntando a los mocks.

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

- La autenticación y los permisos por rol son simulados en el navegador.
- Los datos y mutaciones existen solo durante la sesión actual.
- La pasarela de pago es un simulador local y no mueve dinero real.
- El proyecto no necesita secretos ni configuración de backend en su estado actual.

Para conectarlo a servicios reales, implemente los contratos de `AppServices` y entregue las nuevas dependencias mediante `AppServicesProvider`.
