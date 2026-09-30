import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getMyOrders,
  getOrderById,
} from "../services/order.service";

import "../styles/Orders.css";

function Orders() {
  const { accessToken, user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [detailsError, setDetailsError] =
    useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getMyOrders(accessToken);

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [accessToken]);

  const handleViewDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");

      const data = await getOrderById(
        orderId,
        accessToken
      );

      setSelectedOrder(data);
    } catch (err) {
      setDetailsError(
        err.message ||
          "Unable to load order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedOrder(null);
    setDetailsError("");
  };

  const formatPrice = (price) => {
    return Number(price || 0).toFixed(2);
  };

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusClass = (status) => {
    return (
      status?.toLowerCase() || "pending"
    );
  };

  const getStatusLabel = (status) => {
    if (!status) return "Pending";

    return (
      status.charAt(0) +
      status.slice(1).toLowerCase()
    );
  };

 const getItemImage = (menuItem) => {
  const imageUrl = menuItem?.imageUrl;

  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `http://localhost:3000${imageUrl}`;
  }

  return `http://localhost:3000/uploads/${imageUrl}`;
};

  if (!user) {
    return (
      <main className="orders-page">
        <div className="orders-auth-message">
          <div className="orders-message-icon">
            🔐
          </div>

          <h1>Sign in to view your orders</h1>

          <p>
            Please sign in to your OZONE account
            to see your order history.
          </p>

          <Link
            to="/login"
            className="orders-primary-button"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <section className="orders-header">
        <div>
          <span className="orders-eyebrow">
            OZONE CAFE & RESTAURANT
          </span>

          <h1>My Orders</h1>

          <p>
            Welcome back,{" "}
            <strong>
              {user.fullName || user.name || "Guest"}
            </strong>
            . Here's your order history.
          </p>
        </div>

        <Link
          to="/"
          className="orders-back-button"
        >
          ← Back Home
        </Link>
      </section>

      {loading && (
        <section className="orders-loading">
          <div className="orders-spinner"></div>

          <h2>Loading your orders...</h2>

          <p>
            We're getting your OZONE order
            history ready.
          </p>
        </section>
      )}

      {!loading && error && (
        <section className="orders-state orders-error">
          <div className="orders-state-icon">
            !
          </div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            type="button"
            className="orders-primary-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </section>
      )}

      {!loading &&
        !error &&
        orders.length === 0 && (
          <section className="orders-state orders-empty">
            <div className="orders-empty-icon">
              🛍
            </div>

            <h2>No orders yet</h2>

            <p>
              You haven't placed an order with
              OZONE yet.
            </p>

            <Link
              to="/menu"
              className="orders-primary-button"
            >
              Explore Our Menu
            </Link>
          </section>
        )}

      {!loading &&
        !error &&
        orders.length > 0 && (
          <section className="orders-list">
            {orders.map((order) => (
              <article
                className="order-card"
                key={order.id}
              >
                <div className="order-card-top">
                  <div>
                    <span className="order-number-label">
                      ORDER
                    </span>

                    <h2>
                      #{String(order.id).padStart(
                        4,
                        "0"
                      )}
                    </h2>
                  </div>

                  <span
                    className={`order-status order-status--${getStatusClass(
                      order.status
                    )}`}
                  >
                    <span className="status-dot"></span>
                    {getStatusLabel(
                      order.status
                    )}
                  </span>
                </div>

                <div className="order-date">
                  {formatDate(
                    order.createdAt
                  )}

                  <span>•</span>

                  {formatTime(
                    order.createdAt
                  )}
                </div>

                <div className="order-items-preview">
                  {order.items?.map(
                    (item, index) => {
                      const image =
                        getItemImage(
                          item.menuItem
                        );

                      return (
                        <div
                          className="order-item-preview"
                          key={
                            item.id ||
                            `${order.id}-${index}`
                          }
                        >
                          <div className="order-item-image">
                            {image ? (
                              <img
                                src={image}
                                alt={
                                  item.menuItem
                                    ?.name ||
                                  "Menu item"
                                }
                              />
                            ) : (
                              <span>
                                O
                              </span>
                            )}
                          </div>

                          <div className="order-item-info">
                            <h3>
                              {item.menuItem
                                ?.name ||
                                "Menu Item"}
                            </h3>

                            <p>
                              Qty:{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <span className="order-item-price">
                            {formatPrice(
                              item.subtotal
                            )}{" "}
                            ETB
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="order-card-bottom">
                  <div>
                    <span>Total</span>

                    <strong>
                      {formatPrice(
                        order.totalAmount
                      )}{" "}
                      ETB
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="order-details-button"
                    onClick={() =>
                      handleViewDetails(
                        order.id
                      )
                    }
                  >
                    View Details
                    <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

      {detailsLoading && (
        <div className="order-modal-backdrop">
          <div className="order-modal-loading">
            <div className="orders-spinner"></div>

            <p>
              Loading order details...
            </p>
          </div>
        </div>
      )}

      {selectedOrder && !detailsLoading && (
        <div
          className="order-modal-backdrop"
          onClick={closeDetails}
        >
          <div
            className="order-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="order-modal-close"
              onClick={closeDetails}
              aria-label="Close order details"
            >
              ×
            </button>

            <div className="order-modal-header">
              <span>
                ORDER #
                {String(
                  selectedOrder.id
                ).padStart(4, "0")}
              </span>

              <h2>Order Details</h2>

              <div
                className={`order-status order-status--${getStatusClass(
                  selectedOrder.status
                )}`}
              >
                <span className="status-dot"></span>
                {getStatusLabel(
                  selectedOrder.status
                )}
              </div>
            </div>

            {detailsError && (
              <div className="order-details-error">
                {detailsError}
              </div>
            )}

            <div className="order-modal-section">
              <h3>Order Items</h3>

              <div className="order-detail-items">
                {selectedOrder.items?.map(
                  (item, index) => {
                    const image =
                      getItemImage(
                        item.menuItem
                      );

                    return (
                      <div
                        className="order-detail-item"
                        key={
                          item.id ||
                          index
                        }
                      >
                        <div className="order-detail-image">
                          {image ? (
                            <img
                              src={image}
                              alt={
                                item.menuItem
                                  ?.name ||
                                "Menu item"
                              }
                            />
                          ) : (
                            <span>O</span>
                          )}
                        </div>

                        <div className="order-detail-info">
                          <h4>
                            {item.menuItem
                              ?.name ||
                              "Menu Item"}
                          </h4>

                          <p>
                            {item.quantity} ×{" "}
                            {formatPrice(
                              item.unitPrice
                            )}{" "}
                            ETB
                          </p>
                        </div>

                        <strong>
                          {formatPrice(
                            item.subtotal
                          )}{" "}
                          ETB
                        </strong>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="order-modal-section">
              <h3>Customer Information</h3>

              <div className="customer-details">
                <div>
                  <span>Name</span>
                  <strong>
                    {
                      selectedOrder.customerName
                    }
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {
                      selectedOrder.customerPhone
                    }
                  </strong>
                </div>

                {selectedOrder.deliveryAddress && (
                  <div>
                    <span>
                      Delivery Address
                    </span>

                    <strong>
                      {
                        selectedOrder.deliveryAddress
                      }
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <div className="order-modal-total">
              <span>Order Total</span>

              <strong>
                {formatPrice(
                  selectedOrder.totalAmount
                )}{" "}
                ETB
              </strong>
            </div>

            <div className="order-modal-date">
              Placed on{" "}
              {formatDate(
                selectedOrder.createdAt
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Orders;