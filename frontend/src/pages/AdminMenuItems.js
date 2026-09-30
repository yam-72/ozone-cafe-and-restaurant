import { useCallback, useEffect, useRef, useState } from "react";

import {
  createMenuItem,
  deleteMenuItem,
  getCategories,
  getMenuItems,
  updateMenuItem,
  uploadMenuItemImage,
} from "../services/admin.service";

import "../styles/AdminMenuItems.css";

const API_URL = "http://localhost:3000";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  isAvailable: true,
};

function AdminMenuItems() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availability, setAvailability] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [uploadingImageId, setUploadingImageId] = useState(null);

  const fileInputRef = useRef(null);
  const [imageItemId, setImageItemId] = useState(null);

  /*
   * =========================
   * LOAD CATEGORIES
   * =========================
   */

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setActionError(err.message || "Unable to load categories.");
    }
  }, []);

  /*
   * =========================
   * LOAD MENU ITEMS
   * =========================
   */

  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMenuItems({
        search,
        categoryId,
        isAvailable: availability,
      });

      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load menu items.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, availability]);

  /*
   * =========================
   * INITIAL LOAD
   * =========================
   */

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /*
   * =========================
   * LOAD MENU ITEMS
   * =========================
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMenuItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadMenuItems]);

  /*
   * =========================
   * CREATE MODAL
   * =========================
   */

  function openCreateModal() {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setActionError("");
    setSuccessMessage("");
    setModalOpen(true);
  }

  /*
   * =========================
   * EDIT MODAL
   * =========================
   */

  function openEditModal(item) {
    setEditingItem(item);

    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      categoryId: item.categoryId ? String(item.categoryId) : "",
      isAvailable: item.isAvailable !== false,
    });

    setActionError("");
    setSuccessMessage("");
    setModalOpen(true);
  }

  /*
   * =========================
   * CLOSE MODAL
   * =========================
   */

  function closeModal() {
    if (formLoading) return;

    setModalOpen(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setActionError("");
    setSuccessMessage("");
  }

  /*
   * =========================
   * FORM CHANGE
   * =========================
   */

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  /*
   * =========================
   * CREATE / UPDATE
   * =========================
   */

  async function handleSubmit(event) {
    event.preventDefault();

    setActionError("");
    setSuccessMessage("");

    if (!form.name.trim()) {
      setActionError("Menu item name is required.");
      return;
    }

    if (!form.categoryId) {
      setActionError("Please select a category.");
      return;
    }

    const numericPrice = Number(form.price);

    if (!form.price || Number.isNaN(numericPrice)) {
      setActionError("Please enter a valid price.");
      return;
    }

    if (numericPrice < 0.01) {
      setActionError("Price must be at least 0.01.");
      return;
    }

    try {
      setFormLoading(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: numericPrice,
        categoryId: Number(form.categoryId),
        isAvailable: form.isAvailable,
      };

      if (editingItem) {
        const updatedItem = await updateMenuItem(editingItem.id, payload);

        setMenuItems((current) =>
          current.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        );

        setSuccessMessage("Menu item updated successfully.");
      } else {
        const newItem = await createMenuItem(payload);

        setMenuItems((current) => [newItem, ...current]);

        setSuccessMessage("Menu item created successfully.");
      }

      setTimeout(() => {
        setModalOpen(false);
        setEditingItem(null);
        setForm(EMPTY_FORM);
        setSuccessMessage("");
      }, 700);
    } catch (err) {
      setActionError(err.message || "Unable to save menu item.");
    } finally {
      setFormLoading(false);
    }
  }

  /*
   * =========================
   * DELETE MODAL
   * =========================
   */

  function openDeleteModal(item) {
    setItemToDelete(item);
    setActionError("");
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (deleteLoading) return;

    setDeleteModalOpen(false);
    setItemToDelete(null);
    setActionError("");
  }

  /*
   * =========================
   * DELETE MENU ITEM
   * =========================
   */

  async function handleDelete() {
    if (!itemToDelete) return;

    try {
      setDeleteLoading(true);
      setActionError("");

      await deleteMenuItem(itemToDelete.id);

      setMenuItems((current) =>
        current.filter((item) => item.id !== itemToDelete.id),
      );

      setDeleteModalOpen(false);
      setItemToDelete(null);

      setSuccessMessage("Menu item deleted successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (err) {
      setActionError(err.message || "Unable to delete menu item.");
    } finally {
      setDeleteLoading(false);
    }
  }

  /*
   * =========================
   * IMAGE UPLOAD
   * =========================
   */

  function handleImageButton(itemId) {
    setImageItemId(itemId);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file || !imageItemId) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setActionError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setActionError("Image size must be 5MB or smaller.");
      return;
    }

    try {
      setUploadingImageId(imageItemId);
      setActionError("");

      const updatedItem = await uploadMenuItemImage(imageItemId, file);

      setMenuItems((current) =>
        current.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
      );

      setSuccessMessage("Menu item image updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (err) {
      setActionError(err.message || "Unable to upload menu item image.");
    } finally {
      setUploadingImageId(null);
      setImageItemId(null);
    }
  }

  /*
   * =========================
   * IMAGE URL
   * =========================
   */

  function getImageUrl(imageUrl) {
    if (!imageUrl) {
      return null;
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `${API_URL}${imageUrl}`;
  }

  /*
   * =========================
   * FORMAT PRICE
   * =========================
   */

  function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return price;
    }

    return `${numericPrice.toFixed(2)} ETB`;
  }

  /*
   * =========================
   * FORMAT DATE
   * =========================
   */

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /*
   * =========================
   * CLEAR FILTERS
   * =========================
   */

  function clearFilters() {
    setSearch("");
    setCategoryId("");
    setAvailability("");
  }

  const hasFilters =
    Boolean(search) || Boolean(categoryId) || Boolean(availability);

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <div className="admin-menu-items">
      {/* HEADER */}

      <div className="admin-menu-items__header">
        <div>
          <span className="admin-menu-items__eyebrow">MENU MANAGEMENT</span>

          <h1>Menu Items</h1>

          <p>
            Manage the food and drinks available at Ozone Cafe and Restaurant.
          </p>
        </div>

        <button
          type="button"
          className="admin-menu-items__add-button"
          onClick={openCreateModal}
        >
          <span>+</span>
          Add Menu Item
        </button>
      </div>

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="admin-menu-items__alert admin-menu-items__alert--success">
          {successMessage}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {actionError && (
        <div className="admin-menu-items__alert admin-menu-items__alert--error">
          {actionError}
        </div>
      )}

      {/* FILTERS */}

      <section className="admin-menu-items__filters">
        <div className="admin-menu-items__search">
          <label htmlFor="menu-search">Search</label>

          <div className="admin-menu-items__search-box">
            <span>⌕</span>

            <input
              id="menu-search"
              type="search"
              placeholder="Search menu items..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="menu-category">Category</label>

          <select
            id="menu-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">All categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="menu-availability">Availability</label>

          <select
            id="menu-availability"
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
          >
            <option value="">All items</option>

            <option value="true">Available</option>

            <option value="false">Unavailable</option>
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            className="admin-menu-items__clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </section>

      {/* SUMMARY */}

      <div className="admin-menu-items__summary">
        <strong>{loading ? "Loading..." : menuItems.length}</strong>

        <span>{menuItems.length === 1 ? "menu item" : "menu items"}</span>
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="admin-menu-items__grid">
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <div
              className="menu-item-card menu-item-card--skeleton"
              key={number}
            >
              <div className="skeleton skeleton-image" />

              <div className="menu-item-card__body">
                <div className="skeleton skeleton-line" />

                <div className="skeleton skeleton-line skeleton-line--short" />

                <div className="skeleton skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* ERROR */

        <div className="admin-menu-items__state">
          <div className="admin-menu-items__state-icon">!</div>

          <h2>Unable to load menu items</h2>

          <p>{error}</p>

          <button type="button" onClick={loadMenuItems}>
            Try again
          </button>
        </div>
      ) : menuItems.length === 0 ? (
        /* EMPTY */

        <div className="admin-menu-items__state">
          <div className="admin-menu-items__state-icon">☕</div>

          <h2>{hasFilters ? "No matching menu items" : "No menu items yet"}</h2>

          <p>
            {hasFilters
              ? "Try changing your filters or search term."
              : "Create your first menu item to get started."}
          </p>

          {hasFilters ? (
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          ) : (
            <button type="button" onClick={openCreateModal}>
              Add menu item
            </button>
          )}
        </div>
      ) : (
        /* MENU ITEMS */

        <div className="admin-menu-items__grid">
          {menuItems.map((item) => {
            const imageUrl = getImageUrl(item.imageUrl);

            return (
              <article className="menu-item-card" key={item.id}>
                {/* IMAGE */}

                <div className="menu-item-card__image">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.name} />
                  ) : (
                    <div className="menu-item-card__no-image">
                      <span>☕</span>
                      <small>No image</small>
                    </div>
                  )}

                  <span
                    className={`menu-item-card__availability ${
                      item.isAvailable
                        ? "menu-item-card__availability--available"
                        : "menu-item-card__availability--unavailable"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                {/* BODY */}

                <div className="menu-item-card__body">
                  <div className="menu-item-card__top">
                    <div>
                      <span className="menu-item-card__category">
                        {item.category?.name || "Uncategorized"}
                      </span>

                      <h2>{item.name}</h2>
                    </div>

                    <strong className="menu-item-card__price">
                      {formatPrice(item.price)}
                    </strong>
                  </div>

                  <p className="menu-item-card__description">
                    {item.description || "No description provided."}
                  </p>

                  <div className="menu-item-card__meta">
                    <span>Added {formatDate(item.createdAt)}</span>
                  </div>

                  {/* ACTIONS */}

                  <div className="menu-item-card__actions">
                    <button
                      type="button"
                      className="menu-item-card__button menu-item-card__button--image"
                      onClick={() => handleImageButton(item.id)}
                      disabled={uploadingImageId === item.id}
                    >
                      {uploadingImageId === item.id
                        ? "Uploading..."
                        : imageUrl
                          ? "Change image"
                          : "Add image"}
                    </button>

                    <button
                      type="button"
                      className="menu-item-card__button"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="menu-item-card__button menu-item-card__button--danger"
                      onClick={() => openDeleteModal(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* HIDDEN IMAGE INPUT */}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageChange}
      />

      {/* CREATE / EDIT MODAL */}

      {modalOpen && (
        <div
          className="admin-modal__backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="admin-modal">
            <div className="admin-modal__header">
              <div>
                <span className="admin-menu-items__eyebrow">MENU ITEM</span>

                <h2>{editingItem ? "Edit Menu Item" : "Create Menu Item"}</h2>
              </div>

              <button
                type="button"
                className="admin-modal__close"
                onClick={closeModal}
                disabled={formLoading}
              >
                ×
              </button>
            </div>

            <form className="admin-menu-form" onSubmit={handleSubmit}>
              {/* NAME */}

              <div className="admin-menu-form__field">
                <label htmlFor="menu-name">Name</label>

                <input
                  id="menu-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Cappuccino"
                  maxLength={150}
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="admin-menu-form__field">
                <label htmlFor="menu-description">Description</label>

                <textarea
                  id="menu-description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Describe the menu item..."
                  rows={4}
                />
              </div>

              {/* PRICE + CATEGORY */}

              <div className="admin-menu-form__row">
                <div className="admin-menu-form__field">
                  <label htmlFor="menu-price">Price</label>

                  <div className="admin-menu-form__price">
                    <input
                      id="menu-price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.price}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      required
                    />

                    <span>ETB</span>
                  </div>
                </div>

                <div className="admin-menu-form__field">
                  <label htmlFor="menu-category-form">Category</label>

                  <select
                    id="menu-category-form"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AVAILABILITY */}

              <label className="admin-menu-form__availability">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleFormChange}
                />

                <span>
                  <strong>Available for customers</strong>

                  <small>Customers can see and order this menu item.</small>
                </span>
              </label>

              {/* FORM ERROR */}

              {actionError && (
                <div className="admin-menu-form__error">{actionError}</div>
              )}

              {/* FORM SUCCESS */}

              {successMessage && (
                <div className="admin-menu-form__success">{successMessage}</div>
              )}

              {/* FOOTER */}

              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="admin-modal__cancel"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-modal__submit"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Saving..."
                    : editingItem
                      ? "Save Changes"
                      : "Create Menu Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {deleteModalOpen && itemToDelete && (
        <div
          className="admin-modal__backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleteLoading) {
              closeDeleteModal();
            }
          }}
        >
          <div className="admin-delete-modal">
            <div className="admin-delete-modal__icon">!</div>

            <h2>Delete menu item?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{itemToDelete.name}</strong>? This action cannot be
              undone.
            </p>

            {actionError && (
              <div className="admin-menu-form__error">{actionError}</div>
            )}

            <div className="admin-delete-modal__actions">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-delete-modal__confirm"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Menu Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMenuItems;
