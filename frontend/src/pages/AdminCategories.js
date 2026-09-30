import {
  useEffect,
  useState,
} from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
} from "../services/admin.service";

import "../styles/AdminCategories.css";

function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [uploadingCategoryId, setUploadingCategoryId] =
    useState(null);

  const [showModal, setShowModal] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [name, setName] = useState("");

  const [description, setDescription] =
    useState("");

  /*
   * ==========================================
   * LOAD CATEGORIES
   * ==========================================
   */

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();

      setCategories(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "CATEGORIES LOAD ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /*
   * ==========================================
   * CREATE MODAL
   * ==========================================
   */

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setActionError("");
    setShowModal(true);
  };

  /*
   * ==========================================
   * EDIT MODAL
   * ==========================================
   */

  const openEditModal = (category) => {
    setEditingCategory(category);

    setName(category.name || "");

    setDescription(
      category.description || ""
    );

    setActionError("");
    setShowModal(true);
  };

  /*
   * ==========================================
   * CLOSE CREATE / EDIT MODAL
   * ==========================================
   */

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setShowModal(false);
    setEditingCategory(null);
    setName("");
    setDescription("");
    setActionError("");
  };

  /*
   * ==========================================
   * CREATE / UPDATE CATEGORY
   * ==========================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    const trimmedDescription =
      description.trim();

    if (!trimmedName) {
      setActionError(
        "Category name is required."
      );

      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setError("");

      if (editingCategory) {
        /*
         * UPDATE CATEGORY
         */

        const updatedCategory =
          await updateCategory(
            editingCategory.id,
            trimmedName,
            trimmedDescription
          );

        setCategories(
          (currentCategories) =>
            currentCategories.map(
              (category) =>
                category.id ===
                editingCategory.id
                  ? updatedCategory
                  : category
            )
        );
      } else {
        /*
         * CREATE CATEGORY
         */

        const newCategory =
          await createCategory(
            trimmedName,
            trimmedDescription
          );

        setCategories(
          (currentCategories) => [
            ...currentCategories,
            newCategory,
          ]
        );
      }

      /*
       * Close manually instead of calling
       * closeModal() while actionLoading
       * is still true.
       */

      setShowModal(false);
      setEditingCategory(null);
      setName("");
      setDescription("");
      setActionError("");
    } catch (error) {
      console.error(
        "CATEGORY SAVE ERROR:",
        error
      );

      setActionError(
        error.message ||
          "Unable to save category."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * ==========================================
   * UPLOAD / CHANGE CATEGORY IMAGE
   * ==========================================
   */

  const handleImageUpload = async (
    categoryId,
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Check image type
     */

    if (!file.type.startsWith("image/")) {
      setActionError(
        "Please select a valid image file."
      );

      event.target.value = "";

      return;
    }

    /*
     * Backend allows maximum 5 MB.
     */

    const maxFileSize =
      5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setActionError(
        "Image size must be less than 5 MB."
      );

      event.target.value = "";

      return;
    }

    try {
      setUploadingCategoryId(categoryId);
      setActionError("");
      setError("");

      /*
       * Upload image to backend.
       *
       * Backend returns the updated
       * category including the new
       * imageUrl.
       */

      const updatedCategory =
        await uploadCategoryImage(
          categoryId,
          file
        );

      /*
       * Replace the old category with
       * the updated category.
       */

      setCategories(
        (currentCategories) =>
          currentCategories.map(
            (category) =>
              category.id === categoryId
                ? updatedCategory
                : category
          )
      );
    } catch (error) {
      console.error(
        "CATEGORY IMAGE UPLOAD ERROR:",
        error
      );

      setActionError(
        error.message ||
          "Unable to upload category image."
      );
    } finally {
      setUploadingCategoryId(null);

      /*
       * Allows selecting the same
       * image again.
       */

      event.target.value = "";
    }
  };

  /*
   * ==========================================
   * DELETE MODAL
   * ==========================================
   */

  const openDeleteModal = (category) => {
    setDeleteTarget(category);
    setActionError("");
  };

  const closeDeleteModal = () => {
    if (actionLoading) {
      return;
    }

    setDeleteTarget(null);
    setActionError("");
  };

  /*
   * ==========================================
   * DELETE CATEGORY
   * ==========================================
   */

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setError("");

      await deleteCategory(
        deleteTarget.id
      );

      /*
       * Remove the category from the
       * current page.
       */

      setCategories(
        (currentCategories) =>
          currentCategories.filter(
            (category) =>
              category.id !==
              deleteTarget.id
          )
      );

      /*
       * Close delete modal after
       * successful deletion.
       */

      setDeleteTarget(null);
      setActionError("");
    } catch (error) {
      console.error(
        "CATEGORY DELETE ERROR:",
        error
      );

      /*
       * Keep the modal open so the
       * admin can see why deletion
       * failed.
       */

      setActionError(
        error.message ||
          "Unable to delete category."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <section className="admin-categories-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="admin-categories-header">

        <div>
          <span className="admin-section-label">
            MENU MANAGEMENT
          </span>

          <h2>
            Categories
          </h2>

          <p>
            Create and manage the
            categories used by your
            OZONE menu.
          </p>
        </div>

        <div className="admin-categories-header-actions">

          <button
            className="admin-categories-refresh"
            onClick={loadCategories}
            disabled={loading}
          >
            ↻ Refresh
          </button>

          <button
            className="admin-categories-add"
            onClick={openCreateModal}
          >
            + Add Category
          </button>

        </div>

      </div>

      {/* =====================================
          GENERAL ERROR
      ====================================== */}

      {error && (
        <div className="admin-categories-error">

          <span>
            ⚠️
          </span>

          <div>
            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            onClick={() =>
              setError("")
            }
            aria-label="Close error"
          >
            ×
          </button>

        </div>
      )}

      {/* =====================================
          SUMMARY
      ====================================== */}

      <div className="admin-categories-summary">

        <div>
          <span>
            Total Categories
          </span>

          <strong>
            {categories.length}
          </strong>
        </div>

        <div>
          <span>
            Menu Organization
          </span>

          <strong>
            Active
          </strong>
        </div>

      </div>

      {/* =====================================
          LOADING
      ====================================== */}

      {loading ? (

        <div className="admin-categories-loading">

          <div className="admin-spinner"></div>

          <p>
            Loading categories...
          </p>

        </div>

      ) : categories.length === 0 ? (

        /* ===================================
           EMPTY STATE
        ==================================== */

        <div className="admin-categories-empty">

          <div className="admin-categories-empty-icon">
            📂
          </div>

          <h3>
            No categories yet
          </h3>

          <p>
            Create your first category
            to organize the OZONE menu.
          </p>

          <button
            onClick={openCreateModal}
          >
            + Create Category
          </button>

        </div>

      ) : (

        /* ===================================
           CATEGORY GRID
        ==================================== */

        <div className="admin-categories-grid">

          {categories.map(
            (category) => (

              <article
                className="admin-category-card"
                key={category.id}
              >

                {/* =========================
                    CATEGORY IMAGE
                ========================== */}

                <div className="admin-category-image-wrapper">

                  {category.imageUrl ? (

                    <img
                      src={`http://localhost:3000${category.imageUrl}`}
                      alt={category.name}
                      className="admin-category-image"
                    />

                  ) : (

                    <div className="admin-category-image-placeholder">

                      <span>
                        🍽️
                      </span>

                      <p>
                        No image
                      </p>

                    </div>

                  )}

                  <span className="admin-category-id">
                    #{category.id}
                  </span>

                </div>

                {/* =========================
                    CATEGORY INFORMATION
                ========================== */}

                <div className="admin-category-card-content">

                  <h3>
                    {category.name}
                  </h3>

                  <p>
                    {category.description ||
                      "No description provided."}
                  </p>

                </div>

                {/* =========================
                    ACTIONS
                ========================== */}

                <div className="admin-category-card-footer">

                  {/* CHANGE / UPLOAD IMAGE */}

                  <label
                    className="admin-category-upload"
                  >

                    {uploadingCategoryId ===
                    category.id
                      ? "Uploading..."
                      : category.imageUrl
                        ? "Change Image"
                        : "Upload Image"}

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={
                        uploadingCategoryId ===
                        category.id
                      }
                      onChange={(event) =>
                        handleImageUpload(
                          category.id,
                          event
                        )
                      }
                    />

                  </label>

                  {/* EDIT */}

                  <button
                    className="admin-category-edit"
                    onClick={() =>
                      openEditModal(category)
                    }
                    disabled={
                      uploadingCategoryId ===
                      category.id
                    }
                  >
                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    className="admin-category-delete"
                    onClick={() =>
                      openDeleteModal(category)
                    }
                    disabled={
                      uploadingCategoryId ===
                      category.id
                    }
                  >
                    Delete
                  </button>

                </div>

              </article>

            )
          )}

        </div>

      )}

      {/* =====================================
          CREATE / EDIT MODAL
      ====================================== */}

      {showModal && (

        <div className="admin-modal-overlay">

          <div
            className="admin-modal admin-category-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
          >

            <div className="admin-modal-icon">
              {editingCategory
                ? "✏️"
                : "📂"}
            </div>

            <h3 id="category-modal-title">

              {editingCategory
                ? "Edit Category"
                : "Create Category"}

            </h3>

            <p>

              {editingCategory
                ? "Update the category information below."
                : "Add a new category to organize your menu."}

            </p>

            {/* ACTION ERROR */}

            {actionError && (
              <div className="admin-categories-error">

                <span>
                  ⚠️
                </span>

                <div>
                  <strong>
                    Action failed
                  </strong>

                  <p>
                    {actionError}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setActionError("")
                  }
                  aria-label="Close error"
                >
                  ×
                </button>

              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="admin-category-form"
            >

              {/* CATEGORY NAME */}

              <div className="admin-category-field">

                <label htmlFor="category-name">
                  Category Name
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Breakfast"
                  maxLength={100}
                  disabled={actionLoading}
                  autoFocus
                />

              </div>

              {/* DESCRIPTION */}

              <div className="admin-category-field">

                <label htmlFor="category-description">
                  Description
                </label>

                <textarea
                  id="category-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe this menu category..."
                  rows={4}
                  disabled={actionLoading}
                />

              </div>

              {/* MODAL ACTIONS */}

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-modal-cancel"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-modal-save"
                  disabled={actionLoading}
                >

                  {actionLoading
                    ? "Saving..."
                    : editingCategory
                      ? "Save Changes"
                      : "Create Category"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================
          DELETE MODAL
      ====================================== */}

      {deleteTarget && (

        <div className="admin-modal-overlay">

          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
          >

            <div className="admin-modal-icon">
              ⚠️
            </div>

            <h3 id="delete-category-title">
              Delete category?
            </h3>

            <p>
              Are you sure you want to
              delete{" "}

              <strong>
                {deleteTarget.name}
              </strong>
              ?
            </p>

            <p className="admin-modal-warning">
              If menu items are using this
              category, the deletion will
              be blocked.
            </p>

            {/* DELETE ERROR */}

            {actionError && (
              <div className="admin-categories-error">

                <span>
                  ⚠️
                </span>

                <div>
                  <strong>
                    Deletion blocked
                  </strong>

                  <p>
                    {actionError}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setActionError("")
                  }
                  aria-label="Close error"
                >
                  ×
                </button>

              </div>
            )}

            <div className="admin-modal-actions">

              <button
                className="admin-modal-cancel"
                onClick={closeDeleteModal}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                className="admin-modal-delete"
                onClick={handleDelete}
                disabled={actionLoading}
              >

                {actionLoading
                  ? "Deleting..."
                  : "Delete Category"}

              </button>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}

export default AdminCategories;
