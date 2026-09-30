import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/cart.service";

import "../styles/Cart.css";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [clearing, setClearing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const data = await getCart();

      setCart(data);
    } catch (err) {
      console.error("Failed to load cart:", err);

      setError(
        err?.message ||
          "Failed to load your cart. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

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

  async function handleQuantityChange(item, newQuantity) {
    if (newQuantity < 1) {
      return;
    }

    try {
      setUpdatingItem(item.id);
      setError("");
      setSuccess("");

      const updatedCart = await updateCartItem(
        item.id,
        newQuantity
      );

      setCart(updatedCart);
    } catch (err) {
      console.error(
        "Failed to update cart item:",
        err
      );

      setError(
        err?.message ||
          "Failed to update item quantity."
      );
    } finally {
      setUpdatingItem(null);
    }
  }

  async function handleRemove(item) {
    try {
      setRemovingItem(item.id);
      setError("");
      setSuccess("");

      const updatedCart =
        await removeCartItem(item.id);

      setCart(updatedCart);

      setSuccess(
        `${item.menuItem.name} was removed from your cart.`
      );
    } catch (err) {
      console.error(
        "Failed to remove cart item:",
        err
      );

      setError(
        err?.message ||
          "Failed to remove item from cart."
      );
    } finally {
      setRemovingItem(null);
    }
  }

  async function handleClearCart() {
    if (!cart?.items?.length) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear your entire cart?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);
      setError("");
      setSuccess("");

      await clearCart();

      setCart({
        ...cart,
        items: [],
        total: 0,
      });

      setSuccess("Your cart has been cleared.");
    } catch (err) {
      console.error(
        "Failed to clear cart:",
        err
      );

      setError(
        err?.message ||
          "Failed to clear your cart."
      );
    } finally {
      setClearing(false);
    }
  }

  function formatPrice(value) {
    return Number(value || 0).toFixed(2);
  }

  if (loading) {
    return (
      <main className="cart-page">
        <div className="cart-loading">
          <div className="cart-spinner" />
          <p>Loading your cart...</p>
        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="cart-page">
        <div className="cart-error-state">
          <div className="cart-error-icon">!</div>

          <h2>Unable to load your cart</h2>

          <p>{error}</p>

          <button
            className="cart-primary-btn"
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

  return (
    <main className="cart-page">
      <div className="cart-container">

        {/* Header */}
        <header className="cart-header">
          <div>
            <button
              className="cart-back-btn"
              onClick={() => navigate("/menu")}
            >
              ← Continue Shopping
            </button>

            <h1>Your Cart</h1>

            <p>
              {items.length === 0
                ? "Your cart is currently empty."
                : `${items.length} ${
                    items.length === 1
                      ? "item"
                      : "items"
                  } in your cart`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              className="cart-clear-btn"
              onClick={handleClearCart}
              disabled={clearing}
            >
              {clearing
                ? "Clearing..."
                : "Clear Cart"}
            </button>
          )}
        </header>

        {/* Alerts */}
        {error && (
          <div className="cart-alert cart-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="cart-alert cart-alert-success">
            ✓ {success}
          </div>
        )}

        {/* Empty cart */}
        {items.length === 0 ? (
          <section className="cart-empty">
            <div className="cart-empty-icon">
              🛒
            </div>

            <h2>Your cart is empty</h2>

            <p>
              Discover something delicious from
              the OZONE menu and add it to your
              cart.
            </p>

            <button
              className="cart-primary-btn"
              onClick={() => navigate("/menu")}
            >
              Explore Menu
            </button>
          </section>
        ) : (
          <section className="cart-layout">

            {/* Cart items */}
            <div className="cart-items-section">
              <div className="cart-section-heading">
                <h2>Order Items</h2>
              </div>

              <div className="cart-items">
                {items.map((item) => {
                  const imageUrl =
                    getImageUrl(
                      item.menuItem?.imageUrl
                    );

                  const isUpdating =
                    updatingItem === item.id;

                  const isRemoving =
                    removingItem === item.id;

                  return (
                    <article
                      className="cart-item"
                      key={item.id}
                    >
                      {/* Image */}
                      <div className="cart-item-image-wrapper">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              item.menuItem?.name
                            }
                            className="cart-item-image"
                          />
                        ) : (
                          <div className="cart-item-placeholder">
                            ☕
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="cart-item-info">
                        <h3>
                          {item.menuItem?.name}
                        </h3>

                        <p>
                          {item.menuItem
                            ?.description ||
                            "Deliciously prepared by OZONE."}
                        </p>

                        <span className="cart-item-price">
                          {formatPrice(
                            item.menuItem?.price
                          )}{" "}
                          ETB
                        </span>
                      </div>

                      {/* Controls */}
                      <div className="cart-item-actions">

                        <div className="cart-quantity-control">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              isUpdating ||
                              isRemoving ||
                              item.quantity <= 1
                            }
                          >
                            −
                          </button>

                          <span>
                            {isUpdating
                              ? "..."
                              : item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              isUpdating ||
                              isRemoving
                            }
                          >
                            +
                          </button>
                        </div>

                        <strong className="cart-item-subtotal">
                          {formatPrice(
                            item.subtotal
                          )}{" "}
                          ETB
                        </strong>

                        <button
                          className="cart-remove-btn"
                          type="button"
                          onClick={() =>
                            handleRemove(item)
                          }
                          disabled={
                            isUpdating ||
                            isRemoving
                          }
                        >
                          {isRemoving
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <aside className="cart-summary">
              <div className="cart-summary-inner">
                <h2>Order Summary</h2>

                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>
                    {formatPrice(total)} ETB
                  </span>
                </div>

                <div className="cart-summary-row">
                  <span>Delivery</span>
                  <span>Calculated later</span>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-total">
                  <span>Total</span>
                  <strong>
                    {formatPrice(total)} ETB
                  </strong>
                </div>

                <button
                  className="cart-checkout-btn"
                  onClick={() =>
                    navigate("/checkout")
                  }
                >
                  Proceed to Checkout
                  <span>→</span>
                </button>

                <button
                  className="cart-menu-btn"
                  onClick={() =>
                    navigate("/menu")
                  }
                >
                  Add More Items
                </button>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

export default Cart;