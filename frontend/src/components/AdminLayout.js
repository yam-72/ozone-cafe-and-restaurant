import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/AdminDashboard.css";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigateAdmin = (path) => {
    closeSidebar();
    navigate(path);
  };

  const handleLogout = () => {
    closeSidebar();

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`admin-layout ${
        sidebarOpen
          ? "admin-layout--sidebar-open"
          : ""
      }`}
    >
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar--open"
            : ""
        }`}
      >
        {/* BRAND */}

        <div className="admin-brand">
          <div className="admin-brand__icon">
            ☕
          </div>

          <div className="admin-brand__text">
            <h2>OZONE</h2>
            <span>ADMIN PANEL</span>
          </div>

          <button
            className="admin-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        {/* NAVIGATION */}

        <nav
          className="admin-navigation"
          aria-label="Admin navigation"
        >
          <button
            className={`admin-nav-item ${
              isActive("/admin")
                ? "admin-nav-item--active"
                : ""
            }`}
            onClick={() =>
              navigateAdmin("/admin")
            }
          >
            <span>📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`admin-nav-item ${
              isActive("/admin/users")
                ? "admin-nav-item--active"
                : ""
            }`}
            onClick={() =>
              navigateAdmin("/admin/users")
            }
          >
            <span>👥</span>
            <span>Users</span>
          </button>

          <button
            className={`admin-nav-item ${
              isActive("/admin/categories")
                ? "admin-nav-item--active"
                : ""
            }`}
            onClick={() =>
              navigateAdmin(
                "/admin/categories"
              )
            }
          >
            <span>📂</span>
            <span>Categories</span>
          </button>

          <button
            className={`admin-nav-item ${
              isActive("/admin/menu-items")
                ? "admin-nav-item--active"
                : ""
            }`}
            onClick={() =>
              navigateAdmin(
                "/admin/menu-items"
              )
            }
          >
            <span>🍽️</span>
            <span>Menu Items</span>
          </button>

          <button
            className={`admin-nav-item ${
              isActive("/admin/orders")
                ? "admin-nav-item--active"
                : ""
            }`}
            onClick={() =>
              navigateAdmin("/admin/orders")
            }
          >
            <span>🛒</span>
            <span>Orders</span>
          </button>

          <button
            className={`admin-nav-item ${
              isActive("/admin/reservations")
                ? "admin-nav-item--active"
                : ""
            }`}
            onClick={() =>
              navigateAdmin(
                "/admin/reservations"
              )
            }
          >
            <span>📅</span>
            <span>Reservations</span>
          </button>

          <button
            className={`admin-nav-item ${
              isActive("/admin/audit-logs")
                ? "admin-nav-item--active"
                : ""
            }`}
            onClick={() =>
              navigateAdmin(
                "/admin/audit-logs"
              )
            }
          >
            <span>📝</span>
            <span>Audit Logs</span>
          </button>
        </nav>

        {/* BOTTOM NAVIGATION */}

        <div className="admin-sidebar-bottom">
          <button
            className="admin-nav-item"
         onClick={() =>
                    navigateAdmin("/dashboard")
           }
>
  <span>🏠</span>
  <span>Customer Site</span>
</button>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">
          <div className="admin-heading">

            <button
              className="admin-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div>
              <h1>
                {location.pathname ===
                "/admin"
                  ? "Dashboard"
                  : "Admin Panel"}
              </h1>

              <p>
                Welcome back,{" "}
                {user?.fullName ||
                  "Administrator"}
              </p>
            </div>
          </div>

          {/* ADMIN PROFILE */}

          <button
  type="button"
  onClick={() => {
    console.log("PROFILE CLICKED");
    navigate("/admin/profile");
  }}
  style={{
    cursor: "pointer",
    padding: "10px",
    border: "2px solid red",
    background: "white",
  }}
>
  <div className="admin-avatar">
    {user?.fullName
      ?.charAt(0)
      ?.toUpperCase() || "A"}
  </div>

  <div className="admin-profile-info">
    <strong>
      {user?.fullName || "Administrator"}
    </strong>

    <span>
      {user?.email}
    </span>
  </div>
</button>
        </header>

        {/* PAGE CONTENT */}

        <Outlet />

      </main>
    </div>
  );
}

export default AdminLayout;

