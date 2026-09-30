import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMyOrder } from "../services/order.service";
import "../styles/OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderCreated = location.state?.orderCreated;

useEffect(() => {
  async function loadOrder() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyOrder(id);

      setOrder(data);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err.message || "Failed to load this order.");
    } finally {
      setLoading(false);
    }
  }

  loadOrder();
}, [id]);

  function formatDate(date) {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatPrice(price) {
    return Number(price || 0).toFixed(2);
  }

  function getStatusClass(status) {
    return `order-details-status order-details-status--${String(
      status || ""
    )
      .toLowerCase()
      .replace("_", "-")}`;
  }

  function getImageUrl(imageUrl) {
    if (!imageUrl) return null;

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `http://localhost:3000${imageUrl}`;
  }

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-state">
          <div className="order-details-spinner"></div>

          <h2>Loading order...</h2>

          <p>We're getting your order details.</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="order-details-state order-details-state--error">
          <div className="order-details-error-icon">!</div>

          <h2>Order not found</h2>

          <p>{error || "We couldn't find this order."}</p>

          <div className="order-details-state__actions">
            <button onClick={() => navigate("/orders")}>
              My Orders
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/menu")}
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      {/* Header */}
      <header className="order-details-header">
        <div className="order-details-header__inner">
          <button
            className="order-details-logo"
            onClick={() => navigate("/dashboard")}
          >
            OZONE
          </button>

          <nav>
            <button onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>

            <button onClick={() => navigate("/menu")}>Menu</button>

            <button onClick={() => navigate("/orders")}>
              Orders
            </button>

            <button onClick={() => navigate("/cart")}>Cart</button>
          </nav>
        </div>
      </header>

      <main className="order-details-main">
        <div className="order-details-container">
          {/* Success */}
          {orderCreated && (
            <section className="order-success">
              <div className="order-success__icon">✓</div>

              <div>
                <strong>Order placed successfully!</strong>

                <p>
                  Thank you for ordering from OZONE. Your order has
                  been received.
                </p>
              </div>
            </section>
          )}

          {/* Back */}
          <button
            className="order-details-back"
            onClick={() => navigate("/orders")}
          >
            ← Back to My Orders
          </button>

          {/* Heading */}
          <section className="order-details-title">
            <div>
              <span>ORDER DETAILS</span>

              <h1>
                #{String(order.id).slice(0, 8).toUpperCase()}
              </h1>

              <p>{formatDate(order.createdAt)}</p>
            </div>

            <span className={getStatusClass(order.status)}>
              {order.status || "UNKNOWN"}
            </span>
          </section>

          <div className="order-details-layout">
            {/* Left */}
            <div className="order-details-main-column">
              {/* Items */}
              <section className="order-details-card">
                <div className="order-details-card__header">
                  <div>
                    <span>YOUR ORDER</span>
                    <h2>Order Items</h2>
                  </div>

                  <span>
                    {order.items?.length || 0} item
                    {order.items?.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="order-details-items">
                  {(order.items || []).map((item) => {
                    const imageUrl = getImageUrl(
                      item.menuItem?.imageUrl
                    );

                    return (
                      <div
                        className="order-details-item"
                        key={item.id}
                      >
                        <div className="order-details-item__image">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.menuItem?.name || "Menu item"}
                            />
                          ) : (
                            <span>🍽️</span>
                          )}
                        </div>

                        <div className="order-details-item__info">
                          <h3>
                            {item.menuItem?.name || "Menu Item"}
                          </h3>

                          {item.menuItem?.description && (
                            <p>{item.menuItem.description}</p>
                          )}

                          <span>
                            {item.quantity} ×{" "}
                            {formatPrice(item.unitPrice)} ETB
                          </span>
                        </div>

                        <strong>
                          {formatPrice(item.subtotal)} ETB
                        </strong>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="order-details-total">
                  <span>Total</span>

                  <strong>
                    {formatPrice(order.totalAmount)} ETB
                  </strong>
                </div>
              </section>

              {/* Customer information */}
              <section className="order-details-card">
                <div className="order-details-card__header">
                  <div>
                    <span>CUSTOMER INFORMATION</span>
                    <h2>Contact Details</h2>
                  </div>
                </div>

                <div className="order-customer-grid">
                  <div>
                    <span>Name</span>
                    <strong>{order.customerName}</strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>{order.customerPhone}</strong>
                  </div>

                  <div className="order-customer-grid__full">
                    <span>Delivery Address</span>

                    <strong>
                      {order.deliveryAddress || "Pickup / Not provided"}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            {/* Right */}
            <aside className="order-details-sidebar">
              <section className="order-summary-card">
                <span className="order-summary-card__label">
                  ORDER SUMMARY
                </span>

                <h2>Thank you!</h2>

                <p>
                  Your order has been recorded. You can return here
                  anytime to check its status.
                </p>

                <div className="order-summary-row">
                  <span>Order status</span>

                  <strong>{order.status}</strong>
                </div>

                <div className="order-summary-row">
                  <span>Items</span>

                  <strong>{order.items?.length || 0}</strong>
                </div>

                <div className="order-summary-row order-summary-row--total">
                  <span>Total</span>

                  <strong>
                    {formatPrice(order.totalAmount)} ETB
                  </strong>
                </div>

                <button
                  onClick={() => navigate("/orders")}
                  className="order-summary-primary"
                >
                  View My Orders
                </button>

                <button
                  onClick={() => navigate("/menu")}
                  className="order-summary-secondary"
                >
                  Continue Shopping
                </button>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderDetails;