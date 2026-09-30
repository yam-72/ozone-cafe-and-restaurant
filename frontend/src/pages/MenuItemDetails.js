import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMenuItem } from "../services/admin.service";
import { addToCart } from "../services/cart.service";
import "../styles/MenuItemDetails.css";

function MenuItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 useEffect(() => {
  async function loadItem() {
    try {
      setLoading(true);
      setError("");

      const data = await getMenuItem(id);

      setItem(data);
    } catch (err) {
      console.error("Failed to load menu item:", err);

      setItem(null);
      setError(err.message || "Failed to load menu item.");
    } finally {
      setLoading(false);
    }
  }

  loadItem();
}, [id]);

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

  function increaseQuantity() {
    setQuantity((current) => current + 1);
  }

  function decreaseQuantity() {
    setQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  }

  async function handleAddToCart() {
    if (!item || !item.isAvailable) {
      return;
    }

    try {
      setAdding(true);
      setError("");
      setSuccess("");

      await addToCart(item.id, quantity);

      setSuccess(
        `${item.name} added to your cart.`
      );
    } catch (err) {
      console.error("Failed to add item to cart:", err);

      setError(
        err?.message ||
          "Failed to add item to cart."
      );
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <main className="menu-details-page">
        <div className="menu-details-loading">
          <div className="menu-details-spinner" />
          <p>Loading menu item...</p>
        </div>
      </main>
    );
  }

  if (error && !item) {
    return (
      <main className="menu-details-page">
        <div className="menu-details-error">
          <div className="menu-details-error-icon">
            !
          </div>

          <h2>Unable to load item</h2>

          <p>{error}</p>

          <button
            className="menu-details-primary-btn"
            onClick={() => navigate("/menu")}
          >
            Back to Menu
          </button>
        </div>
      </main>
    );
  }

  if (!item) {
    return null;
  }

  const imageUrl = getImageUrl(item.imageUrl);

  return (
    <main className="menu-details-page">
      <div className="menu-details-container">

        {/* Back button */}
        <button
          className="menu-details-back"
          onClick={() => navigate("/menu")}
        >
          ← Back to Menu
        </button>

        <div className="menu-details-card">

          {/* Image */}
          <div className="menu-details-image-section">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="menu-details-image"
              />
            ) : (
              <div className="menu-details-image-placeholder">
                ☕
              </div>
            )}

            {!item.isAvailable && (
              <div className="menu-details-unavailable">
                Currently Unavailable
              </div>
            )}
          </div>

          {/* Information */}
          <div className="menu-details-content">

            <span className="menu-details-label">
              OZONE MENU
            </span>

            <h1>{item.name}</h1>

            {item.category?.name && (
              <span className="menu-details-category">
                {item.category.name}
              </span>
            )}

            <div className="menu-details-price">
              {Number(item.price).toFixed(2)} ETB
            </div>

            <div className="menu-details-divider" />

            <p className="menu-details-description">
              {item.description ||
                "A delicious selection from OZONE Cafe & Restaurant."}
            </p>

            {error && (
              <div className="menu-details-alert error">
                {error}
              </div>
            )}

            {success && (
              <div className="menu-details-alert success">
                ✓ {success}
              </div>
            )}

            {/* Quantity */}
            <div className="menu-details-quantity-row">
              <span>Quantity</span>

              <div className="quantity-control">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || adding}
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={adding}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              className="menu-details-cart-btn"
              onClick={handleAddToCart}
              disabled={!item.isAvailable || adding}
            >
              {adding
                ? "Adding to Cart..."
                : item.isAvailable
                ? `Add ${quantity} to Cart`
                : "Unavailable"}
            </button>

            {success && (
              <button
                className="menu-details-view-cart"
                onClick={() => navigate("/cart")}
              >
                View Cart →
              </button>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

export default MenuItemDetails;