import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDashboardStats,
  getRecentAuditLogs,
} from "../services/admin.service";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [activities, setActivities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardData,
        activityData,
      ] = await Promise.all([
        getDashboardStats(),
        getRecentAuditLogs(),
      ]);

      setStats(dashboardData);

      setActivities(
        activityData || []
      );
    } catch (error) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(
      date
    ).toLocaleString();
  };

  const getActivityIcon = (action) => {
    if (!action) {
      return "•";
    }

    if (action.includes("LOGIN")) {
      return "🔐";
    }

    if (action.includes("ORDER")) {
      return "🛒";
    }

    if (action.includes("MENU")) {
      return "🍽️";
    }

    if (action.includes("CATEGORY")) {
      return "📂";
    }

    if (action.includes("PASSWORD")) {
      return "🔑";
    }

    if (action.includes("ACCOUNT")) {
      return "👤";
    }

    return "•";
  };

  /* LOADING */

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>

        <p>
          Loading dashboard...
        </p>
      </div>
    );
  }

  /* ERROR */

  if (error) {
    return (
      <div className="admin-error">
        <div>
          <strong>
            Unable to load dashboard
          </strong>

          <p>{error}</p>
        </div>

        <button
          onClick={loadDashboard}
        >
          Retry
        </button>
      </div>
    );
  }

  /* DASHBOARD */

  return (
    <>
      {/* STATISTICS */}

      <section className="admin-stat-grid">

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            👥
          </div>

          <div>
            <span>
              Total Customers
            </span>

            <strong>
              {stats?.customers
                ?.total ?? 0}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            🍽️
          </div>

          <div>
            <span>
              Menu Items
            </span>

            <strong>
              {stats?.menu
                ?.total ?? 0}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            🛒
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {stats?.orders
                ?.total ?? 0}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            📅
          </div>

          <div>
            <span>
              Reservations
            </span>

            <strong>
              {stats?.reservations
                ?.total ?? 0}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            💰
          </div>

          <div>
            <span>
              Revenue
            </span>

            <strong>
              {formatCurrency(
                stats?.revenue?.total
              )}
            </strong>

            <small>
              ETB
            </small>
          </div>
        </div>

      </section>

      {/* ORDER + RESERVATION */}

      <section className="admin-content-grid">

        {/* ORDERS */}

        <div className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <h2>
                Order Overview
              </h2>

              <p>
                Current order status
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
            >
              View Orders
            </button>

          </div>

          <div className="order-status-grid">

            <div>
              <span>
                Pending
              </span>

              <strong>
                {stats?.orders
                  ?.pending ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Confirmed
              </span>

              <strong>
                {stats?.orders
                  ?.confirmed ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Preparing
              </span>

              <strong>
                {stats?.orders
                  ?.preparing ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Ready
              </span>

              <strong>
                {stats?.orders
                  ?.ready ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {stats?.orders
                  ?.completed ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Cancelled
              </span>

              <strong>
                {stats?.orders
                  ?.cancelled ?? 0}
              </strong>
            </div>

          </div>
        </div>

        {/* RESERVATIONS */}

        <div className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <h2>
                Reservations
              </h2>

              <p>
                Reservation summary
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  "/admin/reservations"
                )
              }
            >
              View
            </button>

          </div>

          <div className="reservation-summary">

            <div>
              <span>
                Pending
              </span>

              <strong>
                {stats?.reservations
                  ?.pending ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Confirmed
              </span>

              <strong>
                {stats?.reservations
                  ?.confirmed ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {stats?.reservations
                  ?.completed ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Cancelled
              </span>

              <strong>
                {stats?.reservations
                  ?.cancelled ?? 0}
              </strong>
            </div>

          </div>
        </div>

      </section>

      {/* RECENT ACTIVITY */}

      <section className="admin-panel admin-activity-panel">

        <div className="admin-panel-header">

          <div>
            <h2>
              Recent Activity
            </h2>

            <p>
              Latest actions recorded
              by the system
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                "/admin/audit-logs"
              )
            }
          >
            View All
          </button>

        </div>

        {activities.length === 0 ? (
          <div className="admin-empty">

            <span>📝</span>

            <p>
              No recent activity
              recorded.
            </p>

          </div>
        ) : (
          <div className="activity-list">

            {activities
              .slice(0, 10)
              .map((activity) => (
                <div
                  className="activity-item"
                  key={activity.id}
                >
                  <div className="activity-icon">
                    {getActivityIcon(
                      activity.action
                    )}
                  </div>

                  <div className="activity-content">

                    <strong>
                      {activity.description ||
                        activity.action}
                    </strong>

                    <span>
                      {activity.action}
                    </span>

                  </div>

                  <time>
                    {formatDate(
                      activity.createdAt
                    )}
                  </time>
                </div>
              ))}

          </div>
        )}

      </section>
    </>
  );
}

export default AdminDashboard;

