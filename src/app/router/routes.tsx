import { Navigate, type RouteObject } from 'react-router-dom'
import { UiShowcase } from '../UiShowcase'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { ProtectedRoute } from '../../features/auth/components'
import { AccountPage } from '../../features/account/pages/AccountPage'
import { MyOrdersPage } from '../../features/orders/pages/MyOrdersPage'
import {
  DemoAppFrame,
  DemoCartPage,
  DemoCatalogPage,
  DemoDashboardLayout,
  DemoHomePage,
  DemoProductDetailPage,
  DemoStoreLayout,
} from '../demoSession'
import {
  AuthLayout,
} from '../../shared/layouts'
import {
  NotFoundPage,
  RoutePlaceholder,
} from '../../routes/RoutePlaceholder'
import { routePatterns } from './paths'

const publicStoreRoutes: RouteObject = {
  element: <DemoStoreLayout />,
  children: [
    {
      path: routePatterns.home,
      element: <DemoHomePage />,
    },
    {
      path: routePatterns.catalog,
      element: <DemoCatalogPage />,
    },
    {
      path: routePatterns.productDetail,
      element: <DemoProductDetailPage />,
    },
    {
      path: routePatterns.cart,
      element: <DemoCartPage />,
    },
    ...(import.meta.env.DEV
      ? [
          {
            path: '/componentes',
            element: <UiShowcase />,
          } satisfies RouteObject,
        ]
      : []),
  ],
}

const buyerRoutes: RouteObject = {
  element: (
    <ProtectedRoute allowedRoles={['comprador']}>
      <DemoStoreLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: routePatterns.checkout,
      element: (
        <RoutePlaceholder
          audience="Comprador"
          description="Revisión previa a la pasarela de pago externa."
          title="Revisar y pagar"
        />
      ),
    },
    {
      path: routePatterns.paymentResult,
      element: (
        <RoutePlaceholder
          audience="Comprador"
          description="Resultado simulado de la verificación del pago."
          title="Resultado del pago"
        />
      ),
    },
    {
      path: routePatterns.account,
      element: <AccountPage />,
    },
    {
      path: routePatterns.orders,
      element: <MyOrdersPage />,
    },
    {
      path: routePatterns.accreditationRequest,
      element: (
        <RoutePlaceholder
          audience="Comprador"
          description="Formulario para solicitar acreditación PYME o MicroPYME."
          title="Solicitar acreditación"
        />
      ),
    },
    {
      path: routePatterns.accreditationStatus,
      element: (
        <RoutePlaceholder
          audience="Comprador"
          description="Consulta del estado y vigencia de la acreditación."
          title="Mi acreditación PYME"
        />
      ),
    },
  ],
}

const authRoutes: RouteObject = {
  element: <AuthLayout />,
  children: [
    {
      path: routePatterns.signIn,
      element: <LoginPage />,
    },
    {
      path: routePatterns.signUp,
      element: <RegisterPage />,
    },
  ],
}

const sellerRoutes: RouteObject = {
  path: routePatterns.sellerRoot,
  element: (
    <ProtectedRoute allowedRoles={['vendedor']}>
      <DemoDashboardLayout fallbackRole="vendedor" />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <Navigate replace to={routePatterns.sellerProducts} />,
    },
    {
      path: routePatterns.sellerProducts,
      element: (
        <RoutePlaceholder
          audience="Vendedor"
          description="Administración del catálogo, precios e inventario."
          title="Productos e inventario"
        />
      ),
    },
    {
      path: routePatterns.sellerProductCreate,
      element: (
        <RoutePlaceholder
          audience="Vendedor"
          description="Registro de un producto del catálogo de NexoTech."
          title="Nuevo producto"
        />
      ),
    },
    {
      path: routePatterns.sellerProductEdit,
      element: (
        <RoutePlaceholder
          audience="Vendedor"
          description="Edición de datos, precios y existencias del producto."
          title="Editar producto"
        />
      ),
    },
    {
      path: routePatterns.sellerCategories,
      element: (
        <RoutePlaceholder
          audience="Vendedor"
          description="Organización de las categorías del catálogo propio."
          title="Categorías"
        />
      ),
    },
    {
      path: routePatterns.sellerReports,
      element: (
        <RoutePlaceholder
          audience="Vendedor"
          description="Consulta analítica de ventas e inventario."
          title="Análisis de ventas"
        />
      ),
    },
  ],
}

const administratorRoutes: RouteObject = {
  path: routePatterns.adminRoot,
  element: (
    <ProtectedRoute allowedRoles={['administrador']}>
      <DemoDashboardLayout fallbackRole="administrador" />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <Navigate replace to={routePatterns.adminAccreditations} />,
    },
    {
      path: routePatterns.adminAccreditations,
      element: (
        <RoutePlaceholder
          audience="Administrador"
          description="Listado de solicitudes pendientes, aprobadas y rechazadas."
          title="Solicitudes PYME"
        />
      ),
    },
    {
      path: routePatterns.adminAccreditationDetail,
      element: (
        <RoutePlaceholder
          audience="Administrador"
          description="Revisión manual y decisión administrativa."
          title="Revisar solicitud PYME"
        />
      ),
    },
    {
      path: routePatterns.adminUsers,
      element: (
        <RoutePlaceholder
          audience="Administrador"
          description="Gestión de compradores, vendedores y administradores."
          title="Usuarios"
        />
      ),
    },
    {
      path: routePatterns.adminProducts,
      element: (
        <RoutePlaceholder
          audience="Administrador"
          description="Supervisión administrativa del catálogo."
          title="Productos"
        />
      ),
    },
    {
      path: routePatterns.adminOrders,
      element: (
        <RoutePlaceholder
          audience="Administrador"
          description="Consulta de pedidos originados por pagos aprobados."
          title="Pedidos"
        />
      ),
    },
    {
      path: routePatterns.adminReports,
      element: (
        <RoutePlaceholder
          audience="Administrador"
          description="Análisis consolidado de ventas e inventario."
          title="Análisis de ventas"
        />
      ),
    },
  ],
}

export const routeDefinitions: RouteObject[] = [
  {
    element: <DemoAppFrame />,
    children: [
      publicStoreRoutes,
      buyerRoutes,
      authRoutes,
      sellerRoutes,
      administratorRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
