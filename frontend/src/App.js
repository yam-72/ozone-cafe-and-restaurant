import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Reservations from "./pages/Reservations";
import MenuItemDetails from "./pages/MenuItemDetails";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

import AdminUsers from "./pages/AdminUsers";
import AdminCategories from "./pages/AdminCategories";
import AdminProfile from "./pages/AdminProfile";
import AdminMenuItems from "./pages/AdminMenuItems";
import AdminOrders from "./pages/AdminOrders";
import AdminReservations from "./pages/AdminReservations";
import AdminAuditLogs from "./pages/AdminAuditLogs";

import Profile from "./pages/Profile";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* PUBLIC */}
          <Route
           path="/"
            element={<Home />}
                 />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />


          {/* CUSTOMER */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
         {/* CUSTOMER PROFILE */}
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

{/* CHANGE PASSWORD */}
<Route
  path="/change-password"
  element={
    <ProtectedRoute>
      <ChangePassword />
    </ProtectedRoute>
  }
/>
          <Route
         path="/menu"
              element={
                <ProtectedRoute>
      <Menu />
          </ProtectedRoute>
              }
            />
            <Route
             path="/menu/:id"
             element={
                <ProtectedRoute>
              <MenuItemDetails />
                 </ProtectedRoute>
                  }
                     />
                     <Route
                  path="/cart"
                     element={
                      <ProtectedRoute>
                   <Cart />
                </ProtectedRoute>
                       }
                   />
                <Route
            path="/checkout"
                  element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
                }
                      />
                      <Route
  path="/orders"
  element={
    <ProtectedRoute>
      <Orders />
    </ProtectedRoute>
  }
/>

<Route
  path="/orders/:id"
  element={
    <ProtectedRoute>
      <OrderDetails />
    </ProtectedRoute>
  }
/>
<Route
  path="/reservations"
  element={
    <ProtectedRoute>
      <Reservations />
    </ProtectedRoute>
  }
/>

          {/* ADMIN */}

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            {/* Dashboard */}

            <Route
              index
              element={<AdminDashboard />}
            />

            {/* These pages will be created next */}

            <Route
             path="users"
              element={<AdminUsers />}
              />

            <Route
             path="categories"
               element={<AdminCategories />}
                   />
                   <Route
             path="/admin/orders"
                element={<AdminOrders />}
                     />
                     <Route
                    path="/admin/reservations"
                  element={<AdminReservations />}
                   />
                   <Route
                    path="/admin/audit-logs"
                      element={<AdminAuditLogs />}
                           />
                   <Route
               path="profile"
             element={<AdminProfile />}
                    />

           <Route
           path="menu-items"
           element={<AdminMenuItems />}
           />

            <Route
              path="orders"
              element={
                <AdminPagePlaceholder
                  title="Orders"
                />
              }
            />

            <Route
              path="reservations"
              element={
                <AdminPagePlaceholder
                  title="Reservations"
                />
              }
            />

            <Route
              path="audit-logs"
              element={
                <AdminPagePlaceholder
                  title="Audit Logs"
                />
              }
            />
          </Route>


          {/* FALLBACK */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}


/*
  Temporary admin page.

  This prevents the sidebar links from
  redirecting to the login page while
  we build the real admin pages.
*/

function AdminPagePlaceholder({
  title,
}) {
  return (
    <section className="admin-panel">

      <div className="admin-panel-header">

        <div>
          <h2>
            {title}
          </h2>

          <p>
            This admin section is
            currently being built.
          </p>
        </div>

      </div>

      <div className="admin-empty">

        <span>🚧</span>

        <p>
          {title} management will
          appear here.
        </p>

      </div>

    </section>
  );
}

export default App;

