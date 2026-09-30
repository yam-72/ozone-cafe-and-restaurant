import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMenuItems, getCategories } from "../services/admin.service";
import "../styles/Menu.css";

function Menu() {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    loadMenu();
    loadCategories();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMenuItems({
        isAvailable: true,
      });

      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load menu:", err);

      setError(
        err?.message ||
          "Unable to load the menu. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      setCategories(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load categories:",
        err
      );
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      item.description
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      !categoryId ||
      String(item.categoryId) ===
        String(categoryId);

    return (
      matchesSearch &&
      matchesCategory
    );
  });

  const getImageUrl = (imageUrl) => {
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
  };

  return (
    <div className="customer-menu">

      {/* ================= HEADER ================= */}

      <header className="menu-header">

        <button
          className="menu-logo"
          onClick={() => navigate("/dashboard")}
        >
          OZONE ☕
        </button>

        <nav className="menu-navigation">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <button className="active">
            Menu
          </button>

          <button
            onClick={() =>
              navigate("/orders")
            }
          >
            My Orders
          </button>

          <button
            onClick={() =>
              navigate("/reservations")
            }
          >
            Reservations
          </button>

        </nav>

        <div className="menu-header-actions">

          <button
            className="menu-cart-button"
            onClick={() =>
              navigate("/cart")
            }
          >
            🛒
          </button>

          <button
            className="menu-profile-button"
            onClick={() =>
              navigate("/profile")
            }
          >
            Profile
          </button>

        </div>

      </header>


      {/* ================= HERO ================= */}

      <section className="menu-hero">

        <span>
          OZONE CAFE & RESTAURANT
        </span>

        <h1>
          Explore Our Menu
        </h1>

        <p>
          Fresh food, quality ingredients,
          and carefully prepared drinks.
        </p>

      </section>


      {/* ================= FILTERS ================= */}

      <section className="menu-controls">

        <div className="menu-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search food or drinks..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>


        <div className="category-filters">

          <button
            className={
              !categoryId
                ? "category-filter active"
                : "category-filter"
            }
            onClick={() =>
              setCategoryId("")
            }
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              className={
                String(categoryId) ===
                String(category.id)
                  ? "category-filter active"
                  : "category-filter"
              }
              onClick={() =>
                setCategoryId(
                  String(category.id)
                )
              }
            >
              {category.name}
            </button>
          ))}

        </div>

      </section>


      {/* ================= CONTENT ================= */}

      <main className="menu-content">

        {loading && (
          <div className="menu-state">

            <div className="menu-spinner"></div>

            <h3>
              Loading our menu...
            </h3>

            <p>
              Please wait a moment.
            </p>

          </div>
        )}


        {!loading && error && (
          <div className="menu-state error-state">

            <div className="state-icon">
              ⚠️
            </div>

            <h3>
              Something went wrong
            </h3>

            <p>
              {error}
            </p>

            <button
              onClick={loadMenu}
              className="retry-button"
            >
              Try Again
            </button>

          </div>
        )}


        {!loading &&
          !error &&
          filteredItems.length === 0 && (
            <div className="menu-state">

              <div className="state-icon">
                🍽️
              </div>

              <h3>
                No menu items found
              </h3>

              <p>
                Try another search or category.
              </p>

            </div>
          )}


        {!loading &&
          !error &&
          filteredItems.length > 0 && (

            <div className="menu-grid">

              {filteredItems.map((item) => {

                const imageUrl =
                  getImageUrl(item.imageUrl);

                return (
                  <article
                    className="menu-card"
                    key={item.id}
                  >

                    <div className="menu-card-image">

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                        />
                      ) : (
                        <div className="menu-image-placeholder">
                          🍽️
                        </div>
                      )}

                      {!item.isAvailable && (
                        <span className="unavailable-badge">
                          Unavailable
                        </span>
                      )}

                    </div>


                    <div className="menu-card-body">

                      <div className="menu-card-category">
                        {item.category?.name ||
                          "OZONE"}
                      </div>

                      <h2>
                        {item.name}
                      </h2>

                      <p>
                        {item.description ||
                          "Freshly prepared at OZONE."}
                      </p>


                      <div className="menu-card-footer">

                        <strong>
                          {Number(item.price).toFixed(
                            2
                          )}{" "}
                          ETB
                        </strong>

                        <button
                          className="add-menu-button"
                          onClick={() => {
                            navigate(
                              `/menu/${item.id}`
                            );
                          }}
                        >
                          View
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

      </main>

    </div>
  );
}

export default Menu;