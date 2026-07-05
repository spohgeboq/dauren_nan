import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { dashboardPathForUser } from '../utils/authNavigation';

// Lazy load views (or import them directly for simplicity of development and typechecking)
import PublicHomeView from '../modules/public/PublicHomeView';
import DeliveryRequestSentView from '../modules/public/DeliveryRequestSentView';
import LoginView from '../modules/auth/LoginView';
import GoogleCallbackView from '../modules/auth/GoogleCallbackView';
import ApplicantDashboardView from '../modules/applicant/ApplicantDashboardView';
import ProfileView from '../modules/profile/ProfileView';
import ClientsView from '../modules/admin/clients/ClientsView';
import ProductsView from '../modules/admin/products/ProductsView';
import RecipesView from '../modules/admin/recipes/RecipesView';
import ProductionView from '../modules/production/ProductionView';
import RawMaterialsView from '../modules/admin/raw-materials/RawMaterialsView';
import UsersView from '../modules/admin/users/UsersView';
import RolesView from '../modules/admin/roles/RolesView';
import CategoriesView from '../modules/admin/categories/CategoriesView';
import ExpensesView from '../modules/admin/expenses/ExpensesView';
import ExpenseTypesView from '../modules/admin/expenses/ExpenseTypesView';
import VehiclesView from '../modules/admin/vehicles/VehiclesView';
import PurchasesView from '../modules/admin/purchases/PurchasesView';
import ReportsView from '../modules/admin/reports/ReportsView';
import EmployeeReportDetailView from '../modules/admin/reports/EmployeeReportDetailView';
import ClientReportDetailView from '../modules/admin/reports/ClientReportDetailView';
import RoutesView from '../modules/admin/deliveries/RoutesView';
import DeliveryView from '../modules/driver/DeliveryView';
import ClientOrdersView from '../modules/admin/orders/ClientOrdersView';
import DashboardView from '../modules/admin/DashboardView';
import POSView from '../modules/seller/pos/POSView';

// Layouts
import DriverLayout from '../layouts/DriverLayout';
import ClientLayout from '../layouts/ClientLayout';
import RouteView from '../modules/driver/RouteView';
import ReturnsView from '../modules/driver/ReturnsView';
import ClientDashboardView from '../modules/client/DashboardView';
import ClientOrders from '../modules/client/OrdersView';
import ClientHistoryView from '../modules/client/HistoryView';
import ClientPaymentsView from '../modules/client/PaymentsView';
import ClientProfileView from '../modules/client/ProfileView';

// Route guards
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="p-6 text-center">Загрузка...</div>;

  if (isAuthenticated && user) {
    const dashboard = dashboardPathForUser(user);
    const redirectPath = location.state?.from?.pathname || dashboard;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
}

function RequireAuth({ children, roles = [], permissions = [] }: RequireAuthProps) {
  const { isAuthenticated, isLoading, hasRole, hasPermission, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="p-6 text-center">Загрузка...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length && !hasRole(roles)) {
    return <Navigate to={dashboardPathForUser(user)} replace />;
  }

  if (permissions.length && !hasPermission(permissions)) {
    return <Navigate to={dashboardPathForUser(user)} replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public / Landing Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <PublicHomeView />
          )
        }
      />
      <Route path="/welcome" element={<PublicHomeView />} />
      <Route path="/delivery-request/sent" element={<DeliveryRequestSentView />} />

      {/* Guest Only Routes */}
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginView />
          </GuestOnly>
        }
      />
      <Route
        path="/auth/google/callback"
        element={
          <GuestOnly>
            <GoogleCallbackView />
          </GuestOnly>
        }
      />

      {/* Authenticated Routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardView />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfileView />
          </RequireAuth>
        }
      />
      <Route
        path="/applicant"
        element={
          <RequireAuth>
            <ApplicantDashboardView />
          </RequireAuth>
        }
      />

      {/* POS / Sales (Seller) */}
      <Route
        path="/pos"
        element={
          <RequireAuth permissions={['sales.create']}>
            <POSView />
          </RequireAuth>
        }
      />

      {/* Baker / Production */}
      <Route
        path="/production"
        element={
          <RequireAuth permissions={['production.create']}>
            <ProductionView />
          </RequireAuth>
        }
      />
      <Route
        path="/baker/production"
        element={
          <RequireAuth permissions={['production.create']}>
            <ProductionView />
          </RequireAuth>
        }
      />

      {/* Admin Panel Routes */}
      <Route
        path="/admin"
        element={
          <RequireAuth roles={['admin']}>
            <DashboardView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <RequireAuth permissions={['clients.create', 'clients.update', 'clients.delete']}>
            <ClientsView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/products"
        element={
          <RequireAuth permissions={['products.create', 'products.update', 'products.delete']}>
            <ProductsView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RequireAuth permissions={['products.create', 'products.update', 'products.delete']}>
            <CategoriesView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/recipes"
        element={
          <RequireAuth permissions={['recipes.view']}>
            <RecipesView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/production"
        element={
          <RequireAuth permissions={['production.create']}>
            <ProductionView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/raw-materials"
        element={
          <RequireAuth permissions={['raw-materials.view']}>
            <RawMaterialsView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAuth permissions={['users.view']}>
            <UsersView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <RequireAuth permissions={['settings.manage']}>
            <RolesView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/expenses"
        element={
          <RequireAuth permissions={['expenses.view']}>
            <ExpensesView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/expense-types"
        element={
          <RequireAuth permissions={['expenses.create', 'expenses.update', 'expenses.delete']}>
            <ExpenseTypesView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/vehicles"
        element={
          <RequireAuth permissions={['expenses.create', 'expenses.update', 'expenses.delete']}>
            <VehiclesView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/purchases"
        element={
          <RequireAuth permissions={['purchases.view']}>
            <PurchasesView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RequireAuth permissions={['reports.view']}>
            <ReportsView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/reports/employees/:role/:employeeId"
        element={
          <RequireAuth permissions={['reports.view']}>
            <EmployeeReportDetailView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/reports/clients/:clientId"
        element={
          <RequireAuth permissions={['reports.view']}>
            <ClientReportDetailView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/deliveries/routes"
        element={
          <RequireAuth permissions={['drivers.manage']}>
            <RoutesView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/deliveries/routes/:routeId/clients/:clientId/delivery"
        element={
          <RequireAuth permissions={['deliveries.create']}>
            <DeliveryView />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RequireAuth permissions={['drivers.manage']}>
            <ClientOrdersView />
          </RequireAuth>
        }
      />

      {/* Driver Layout & Sub-routes */}
      <Route
        path="/driver"
        element={
          <RequireAuth roles={['driver']} permissions={['deliveries.view']}>
            <DriverLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="route" replace />} />
        <Route path="route" element={<RouteView />} />
        <Route path="deliveries" element={<Navigate to="/driver/route" replace />} />
        <Route path="deliveries/:clientId" element={<DeliveryView />} />
        <Route path="returns" element={<ReturnsView />} />
      </Route>

      {/* Client Layout & Sub-routes */}
      <Route
        path="/client"
        element={
          <RequireAuth roles={['client']}>
            <ClientLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboardView />} />
        <Route path="orders" element={<ClientOrders />} />
        <Route path="history" element={<ClientHistoryView />} />
        <Route path="payments" element={<ClientPaymentsView />} />
        <Route path="profile" element={<ClientProfileView />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
