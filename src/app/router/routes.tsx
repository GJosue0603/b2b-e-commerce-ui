import { Navigate, type RouteObject } from 'react-router-dom'
import { UiShowcase } from '../UiShowcase'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { ProtectedRoute } from '../../features/auth/components'
import { AccountPage } from '../../features/account/pages/AccountPage'
import { DashboardAccountPage } from '../../features/account/pages/DashboardAccountPage'
import { MyOrdersPage } from '../../features/orders/pages/MyOrdersPage'
import { AccreditationRequestPage } from '../../features/accreditation/pages/AccreditationRequestPage'
import { AccreditationStatusPage } from '../../features/accreditation/pages/AccreditationStatusPage'
import {
  DemoAppFrame,
  DemoCartPage,
  DemoCheckoutPage,
  DemoCatalogPage,
  DemoDashboardLayout,
  DemoHomePage,
  DemoPaymentResultPage,
  DemoProductDetailPage,
  DemoStoreLayout,
} from '../demoSession'
import {
  AuthLayout,
} from '../../shared/layouts'
import {
  NotFoundPage,
} from '../../routes/RoutePlaceholder'
import { routePatterns } from './paths'
import { routePermissions } from '../../shared/navigation'
import { CategoriesPage } from '../../features/vendor/pages/CategoriesPage'
import { EditProductPage } from '../../features/vendor/pages/EditProductPage'
import { ProductsPage } from '../../features/vendor/pages/ProductsPage'
import { SalesDashboardPage } from '../../features/reports/pages/SalesDashboardPage'
import {
  AdminAccreditationDetailPage,
  AdminAccreditationsPage,
  AdminOrdersPage,
  AdminUsersPage,
} from '../../features/admin/pages'

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
    {
      path: '*',
      element: <NotFoundPage />,
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
    <ProtectedRoute allowedRoles={routePermissions.buyer}>
      <DemoStoreLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: routePatterns.checkout,
      element: <DemoCheckoutPage />,
    },
    {
      path: routePatterns.paymentResult,
      element: <DemoPaymentResultPage />,
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
      element: <AccreditationRequestPage />,
    },
    {
      path: routePatterns.accreditationStatus,
      element: <AccreditationStatusPage />,
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
    <ProtectedRoute allowedRoles={routePermissions.seller}>
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
      element: <ProductsPage />,
    },
    {
      path: routePatterns.sellerAccount,
      element: <DashboardAccountPage />,
    },
    {
      path: routePatterns.sellerProductCreate,
      element: <EditProductPage mode="create" />,
    },
    {
      path: routePatterns.sellerProductEdit,
      element: <EditProductPage mode="edit" />,
    },
    {
      path: routePatterns.sellerCategories,
      element: <CategoriesPage />,
    },
    {
      path: routePatterns.sellerReports,
      element: <SalesDashboardPage />,
    },
  ],
}

const administratorRoutes: RouteObject = {
  path: routePatterns.adminRoot,
  element: (
    <ProtectedRoute allowedRoles={routePermissions.administrator}>
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
      element: <AdminAccreditationsPage />,
    },
    {
      path: routePatterns.adminAccount,
      element: <DashboardAccountPage />,
    },
    {
      path: routePatterns.adminAccreditationDetail,
      element: <AdminAccreditationDetailPage />,
    },
    {
      path: routePatterns.adminUsers,
      element: <AdminUsersPage />,
    },
    {
      path: routePatterns.adminProducts,
      element: <ProductsPage supervision />,
    },
    {
      path: routePatterns.adminOrders,
      element: <AdminOrdersPage />,
    },
    {
      path: routePatterns.adminReports,
      element: <SalesDashboardPage />,
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
    ],
  },
]
