import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { getCart } from "../services/cart.service";
import { createOrder } from "../services/order.service";
import { useAuth } from "../context/AuthContext";

import "../styles/Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const {
    user,
    accessToken,
  } = useAuth();

  const [cart, setCart] = useState(null);

  const [customerName, setCustomerName] =
    useState(user?.fullName || "");

  const [customerPhone, setCustomerPhone] =
    useState(user?.phone || "");

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getCart(accessToken);

      setCart(data);
    } catch (err) {
      console.error(
        "Failed to load cart:",
        err
      );

      setError(
        err?.message ||
          "Failed to load your cart."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      loadCart();
    }
  }, [accessToken, loadCart]);
  function getImageUrl(imageUrl) {
    if (!imageUrl) {
      return null;
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    return `http://localhost:3000${imageUrl}`;
  }

  function formatPrice(value) {
    return Number(value || 0).toFixed(2);
  }

  function validateForm() {
    const errors = {};

    const trimmedName =
      customerName.trim();

    const trimmedPhone =
      customerPhone.trim();

    if (!trimmedName) {
      errors.customerName =
        "Please enter your full name.";
    } else if (trimmedName.length < 2) {
      errors.customerName =
        "Name must contain at least 2 characters.";
    } else if (trimmedName.length > 100) {
      errors.customerName =
        "Name cannot exceed 100 characters.";
    }

    if (!trimmedPhone) {
      errors.customerPhone =
        "Please enter your phone number.";
    } else if (trimmedPhone.length > 20) {
      errors.customerPhone =
        "Phone number cannot exceed 20 characters.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    if (!cart?.items?.length) {
      setError(
        "Your cart is empty. Add some items before checking out."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const order = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress:
          deliveryAddress.trim() || undefined,
      });

      /*
       * The backend returns the complete
       * created order.
       */
      navigate(`/orders/${order.id}`, {
        replace: true,
        state: {
          orderCreated: true,
        },
      });
    } catch (err) {
      console.error(
        "Failed to create order:",
        err
      );

      setError(
        err?.message ||
          "We could not place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <main className="checkout-page">
        <div className="checkout-loading">
          <div className="checkout-spinner" />
          <p>Preparing checkout...</p>
        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="checkout-page">
        <div className="checkout-error-state">
          <div className="checkout-error-icon">
            !
          </div>

          <h2>Unable to load checkout</h2>

          <p>{error}</p>

          <button
            className="checkout-primary-btn"
            onClick={loadCart}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];
  const total = Number(cart?.total || 0);

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">
            🛒
          </div>

          <h2>Your cart is empty</h2>

          <p>
            Add some delicious items from the
            OZONE menu before checking out.
          </p>

          <button
            className="checkout-primary-btn"
            onClick={() => navigate("/menu")}
          >
            Browse Menu
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">

        {/* Header */}
        <header className="checkout-header">
          <button
            className="checkout-back-btn"
            onClick={() => navigate("/cart")}
          >
            ← Back to Cart
          </button>

          <span className="checkout-label">
            OZONE CAFE & RESTAURANT
          </span>

          <h1>Checkout</h1>

          <p>
            Complete your information and place
            your order.
          </p>
        </header>

        {error && (
          <div className="checkout-alert">
            {error}
          </div>
        )}

        <div className="checkout-layout">

          {/* Customer information */}
          <section className="checkout-form-card">
            <div className="checkout-card-heading">
              <span className="checkout-number">
                01
              </span>

              <div>
                <h2>Customer Information</h2>
                <p>
                  Where should we contact you?
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePlaceOrder}
              className="checkout-form"
            >
              <div className="checkout-field">
                <label htmlFor="customerName">
                  Full Name
                </label>

                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(event) => {
                    setCustomerName(
                      event.target.value
                    );

                    setFieldErrors((current) => ({
                      ...current,
                      customerName: "",
                    }));
                  }}
                  placeholder="Enter your full name"
                  disabled={placingOrder}
                />

                {fieldErrors.customerName && (
                  <span className="checkout-field-error">
                    {fieldErrors.customerName}
                  </span>
                )}
              </div>

              <div className="checkout-field">
                <label htmlFor="customerPhone">
                  Phone Number
                </label>

                <input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => {
                    setCustomerPhone(
                      event.target.value
                    );

                    setFieldErrors((current) => ({
                      ...current,
                      customerPhone: "",
                    }));
                  }}
                  placeholder="09XXXXXXXX"
                  disabled={placingOrder}
                />

                {fieldErrors.customerPhone && (
                  <span className="checkout-field-error">
                    {fieldErrors.customerPhone}
                  </span>
                )}
              </div>

              <div className="checkout-field">
                <label htmlFor="deliveryAddress">
                  Delivery Address
                  <span>Optional</span>
                </label>

                <textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(event) =>
                    setDeliveryAddress(
                      event.target.value
                    )
                  }
                  placeholder="Enter your delivery address"
                  rows="4"
                  disabled={placingOrder}
                />
              </div>

              <button
                type="submit"
                className="checkout-place-order-btn"
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <>
                    <span className="checkout-button-spinner" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <span>→</span>
                  </>
                )}
              </button>

              <p className="checkout-secure-note">
                Your order will initially be placed
                as pending and can be tracked from
                your Orders page.
              </p>
            </form>
          </section>

          {/* Order summary */}
          <aside className="checkout-summary">
            <div className="checkout-summary-card">

              <div className="checkout-card-heading">
                <span className="checkout-number">
                  02
                </span>

                <div>
                  <h2>Your Order</h2>
                  <p>
                    {items.length}{" "}
                    {items.length === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>
              </div>

              <div className="checkout-items">
                {items.map((item) => {
                  const imageUrl =
                    getImageUrl(
                      item.menuItem?.imageUrl
                    );

                  return (
                    <div
                      className="checkout-item"
                      key={item.id}
                    >
                      <div className="checkout-item-image">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              item.menuItem?.name
                            }
                          />
                        ) : (
                          <span>☕</span>
                        )}
                      </div>

                      <div className="checkout-item-info">
                        <h3>
                          {item.menuItem?.name}
                        </h3>

                        <p>
                          {item.quantity} ×{" "}
                          {formatPrice(
                            item.menuItem?.price
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
                })}
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-total-row">
                <span>Subtotal</span>

                <span>
                  {formatPrice(total)} ETB
                </span>
              </div>

              <div className="checkout-total-row checkout-delivery-row">
                <span>Delivery</span>

                <span>
                  Calculated later
                </span>
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-grand-total">
                <span>Total</span>

                <strong>
                  {formatPrice(total)} ETB
                </strong>
              </div>

              <button
                type="button"
                className="checkout-edit-cart"
                onClick={() => navigate("/cart")}
                disabled={placingOrder}
              >
                Edit Cart
              </button>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

export default Checkout;