import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getCustomerDashboard } from "../services/dashboard.service";

import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [dashboard, setDashboard] = useState({
    cart: null,
    orders: [],
    reservations: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const data =
      await getCustomerDashboard(accessToken);

    setDashboard(data);
  } catch (err) {
    console.error(
      "Failed to load customer dashboard:",
      err
    );

    setError(
      err?.message ||
        "Failed to load your dashboard."
    );
  } finally {
    setLoading(false);
  }
}, [accessToken]);

useEffect(() => {
  if (accessToken) {
    loadDashboard();
  }
}, [accessToken, loadDashboard]);
  /* =====================================================
     DATA
     ===================================================== */

  const orders = useMemo(
  () => dashboard.orders || [],
  [dashboard.orders]
);

const reservations = useMemo(
  () => dashboard.reservations || [],
  [dashboard.reservations]
);
  const cart = dashboard.cart;

  const cartItemCount = useMemo(() => {
    if (!cart?.items) {
      return 0;
    }

    return cart.items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [cart]);

  const totalSpent = useMemo(() => {
    return orders.reduce((total, order) => {
      return total + Number(
        order.totalAmount ||
        order.total ||
        0
      );
    }, 0);
  }, [orders]);

  const upcomingReservation = useMemo(() => {
    if (!reservations.length) {
      return null;
    }

    const today = new Date();

    const upcoming = reservations
      .filter((reservation) => {
        if (!reservation.reservationDate) {
          return false;
        }

        const reservationDate = new Date(
          reservation.reservationDate
        );

        return reservationDate >= today;
      })
      .sort((a, b) => {
        return (
          new Date(a.reservationDate) -
          new Date(b.reservationDate)
        );
      });

    return upcoming[0] || null;
  }, [reservations]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        return (
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
        );
      })
      .slice(0, 4);
  }, [orders]);

  /* =====================================================
     HELPERS
     ===================================================== */

  function getUserName() {
    if (!user) {
      return "Guest";
    }

    return (
      user.fullName ||
      user.full_name ||
      user.name ||
      user.email?.split("@")[0] ||
      "Guest"
    );
  }

  function formatCurrency(value) {
    return `${Number(value || 0).toFixed(2)} ETB`;
  }

  function formatDate(date) {
    if (!date) {
      return "Date unavailable";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStatusClass(status) {
    if (!status) {
      return "pending";
    }

    return String(status)
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />

          <p>
            Loading your OZONE dashboard...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <main className="dashboard-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="dashboard-header">
        <div className="dashboard-header-inner">

          <button
            type="button"
            className="dashboard-logo"
            onClick={() => navigate("/dashboard")}
          >
            <span className="dashboard-logo-mark">
              ☕
            </span>

            OZONE
          </button>

          <nav className="dashboard-nav">

            <button
              className="dashboard-nav-link active"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() => navigate("/menu")}
            >
              Menu
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() => navigate("/orders")}
            >
              Orders
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() => navigate("/reservations")}
            >
              Reservations
            </button>

          </nav>

          <button
            type="button"
            className="dashboard-profile-button"
            onClick={() => navigate("/profile")}
          >
            <span className="dashboard-profile-avatar">
              {getUserName()
                .charAt(0)
                .toUpperCase()}
            </span>

            <span className="dashboard-profile-name">
              {getUserName()}
            </span>
          </button>

        </div>
      </header>


      {/* =================================================
          MAIN
          ================================================= */}

      <section className="dashboard-container">

        {/* Error */}

        {error && (
          <div className="dashboard-alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadDashboard}
            >
              Try Again
            </button>
          </div>
        )}


        {/* =================================================
            WELCOME
            ================================================= */}

        <section className="dashboard-welcome">

          <div>

            <span className="dashboard-eyebrow">
              OZONE CAFE & RESTAURANT
            </span>

            <h1>
              Welcome back,{" "}
              <span>{getUserName()}</span> 👋
            </h1>

            <p>
              Here's what's happening with your
              OZONE experience.
            </p>

          </div>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() => navigate("/menu")}
          >
            Explore Menu
            <span>→</span>
          </button>

        </section>


        {/* =================================================
            STATISTICS
            ================================================= */}

        <section className="dashboard-stat-grid">

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              🛍️
            </div>

            <div>
              <span>Orders</span>

              <strong>
                {orders.length}
              </strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              🛒
            </div>

            <div>
              <span>Cart Items</span>

              <strong>
                {cartItemCount}
              </strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              🪑
            </div>

            <div>
              <span>Reservations</span>

              <strong>
                {reservations.length}
              </strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              💳
            </div>

            <div>
              <span>Total Spent</span>

              <strong>
                {formatCurrency(totalSpent)}
              </strong>
            </div>

          </div>

        </section>


        {/* =================================================
            CONTENT GRID
            ================================================= */}

        <section className="dashboard-content-grid">


          {/* =================================================
              RECENT ORDERS
              ================================================= */}

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>
                <span className="dashboard-section-label">
                  ACTIVITY
                </span>

                <h2>Recent Orders</h2>
              </div>

              <button
                type="button"
                onClick={() => navigate("/orders")}
              >
                View All →
              </button>

            </div>


            {recentOrders.length === 0 ? (

              <div className="dashboard-empty">

                <div className="dashboard-empty-icon">
                  🛍️
                </div>

                <h3>No orders yet</h3>

                <p>
                  Your orders will appear here
                  after you make a purchase.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/menu")}
                >
                  Browse Menu
                </button>

              </div>

            ) : (

              <div className="dashboard-orders">

                {recentOrders.map((order) => (

                  <button
                    type="button"
                    key={order.id}
                    className="dashboard-order-row"
                    onClick={() =>
                      navigate(
                        `/orders/${order.id}`
                      )
                    }
                  >

                    <div className="dashboard-order-icon">
                      #
                    </div>

                    <div className="dashboard-order-info">

                      <strong>
                        Order #{order.id}
                      </strong>

                      <span>
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                    </div>

                    <div className="dashboard-order-right">

                      <strong>
                        {formatCurrency(
                          order.totalAmount ||
                            order.total
                        )}
                      </strong>

                      <span
                        className={`dashboard-status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status ||
                          "PENDING"}
                      </span>

                    </div>

                  </button>

                ))}

              </div>

            )}

          </div>


          {/* =================================================
              UPCOMING RESERVATION
              ================================================= */}

          <div className="dashboard-panel dashboard-reservation-panel">

            <div className="dashboard-panel-header">

              <div>
                <span className="dashboard-section-label">
                  TABLE BOOKING
                </span>

                <h2>Upcoming Reservation</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/reservations")
                }
              >
                All →
              </button>

            </div>


            {upcomingReservation ? (

              <div className="dashboard-upcoming">

                <div className="dashboard-calendar">

                  <span>
                    {new Date(
                      upcomingReservation.reservationDate
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                      }
                    )}
                  </span>

                  <strong>
                    {new Date(
                      upcomingReservation.reservationDate
                    ).getDate()}
                  </strong>

                </div>


                <div className="dashboard-upcoming-info">

                  <h3>
                    OZONE Cafe & Restaurant
                  </h3>

                  <p>
                    📅{" "}
                    {formatDate(
                      upcomingReservation.reservationDate
                    )}
                  </p>

                  <p>
                    🕐{" "}
                    {upcomingReservation.reservationTime}
                  </p>

                  <p>
                    👥{" "}
                    {upcomingReservation.guestCount}{" "}
                    {upcomingReservation.guestCount === 1
                      ? "Guest"
                      : "Guests"}
                  </p>

                  <span
                    className={`dashboard-status ${getStatusClass(
                      upcomingReservation.status
                    )}`}
                  >
                    {upcomingReservation.status ||
                      "PENDING"}
                  </span>

                </div>

              </div>

            ) : (

              <div className="dashboard-empty">

                <div className="dashboard-empty-icon">
                  🪑
                </div>

                <h3>
                  No upcoming reservation
                </h3>

                <p>
                  Planning a meal with friends or
                  family?
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/reservations")
                  }
                >
                  Reserve a Table
                </button>

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            QUICK ACTIONS
            ================================================= */}

        <section className="dashboard-quick-section">

          <div className="dashboard-section-heading">

            <span className="dashboard-section-label">
              QUICK ACTIONS
            </span>

            <h2>
              What would you like to do?
            </h2>

          </div>


          <div className="dashboard-quick-grid">

            <button
              type="button"
              onClick={() => navigate("/menu")}
              className="dashboard-action-card"
            >
              <span className="dashboard-action-icon">
                ☕
              </span>

              <span>
                <strong>Browse Menu</strong>

                <small>
                  Discover something delicious
                </small>
              </span>

              <b>→</b>
            </button>


            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="dashboard-action-card"
            >
              <span className="dashboard-action-icon">
                🛒
              </span>

              <span>
                <strong>View Cart</strong>

                <small>
                  {cartItemCount} item
                  {cartItemCount === 1
                    ? ""
                    : "s"} in your cart
                </small>
              </span>

              <b>→</b>
            </button>


            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="dashboard-action-card"
            >
              <span className="dashboard-action-icon">
                📦
              </span>

              <span>
                <strong>My Orders</strong>

                <small>
                  Track your previous orders
                </small>
              </span>

              <b>→</b>
            </button>


            <button
              type="button"
              onClick={() =>
                navigate("/reservations")
              }
              className="dashboard-action-card"
            >
              <span className="dashboard-action-icon">
                🪑
              </span>

              <span>
                <strong>Reserve a Table</strong>

                <small>
                  Plan your next visit
                </small>
              </span>

              <b>→</b>
            </button>

          </div>

        </section>

      </section>
    </main>
  );
}

export default Dashboard;