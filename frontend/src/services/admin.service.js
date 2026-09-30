import { apiFetch } from "./api";

/*
 * =========================
 * ADMIN DASHBOARD
 * =========================
 */

export async function getDashboardStats() {
  return apiFetch(
    "/admin/dashboard/stats"
  );
}

export async function getRecentAuditLogs() {
  return apiFetch(
    "/admin/audit-logs/recent"
  );
}

export async function getAuditLogs() {
  return apiFetch(
    "/admin/audit-logs"
  );
}


/*
 * =========================
 * ADMIN USERS
 * =========================
 */

export async function getUsers() {
  return apiFetch(
    "/users"
  );
}

export async function getUser(id) {
  return apiFetch(
    `/users/${id}`
  );
}

export async function updateUserStatus(
  id,
  isActive
) {
  return apiFetch(
    `/users/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        isActive,
      }),
    }
  );
}

export async function updateUserRole(
  id,
  role
) {
  return apiFetch(
    `/users/${id}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({
        role,
      }),
    }
  );
}

export async function deleteUser(id) {
  return apiFetch(
    `/users/${id}`,
    {
      method: "DELETE",
    }
  );
}


/*
 * =========================
 * ADMIN CATEGORIES
 * =========================
 */

export async function getCategories() {
  return apiFetch(
    "/categories"
  );
}

export async function getCategory(id) {
  return apiFetch(
    `/categories/${id}`
  );
}

export async function createCategory(
  name,
  description
) {
  return apiFetch(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
      }),
    }
  );
}

export async function updateCategory(
  id,
  name,
  description
) {
  return apiFetch(
    `/categories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name,
        description,
      }),
    }
  );
}

export async function deleteCategory(id) {
  return apiFetch(
    `/categories/${id}`,
    {
      method: "DELETE",
    }
  );
}


/*
 * =========================
 * CATEGORY IMAGE UPLOAD
 * =========================
 */

export async function uploadCategoryImage(
  categoryId,
  imageFile
) {
  const formData = new FormData();

  formData.append(
    "image",
    imageFile
  );

  return apiFetch(
    `/categories/${categoryId}/image`,
    {
      method: "POST",
      body: formData,
    }
  );
}
export async function getMyProfile() {
  return apiFetch("/users/me");
}

export async function updateMyProfile(profileData) {
  return apiFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
}

export async function uploadProfileImage(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  return apiFetch("/users/me/profile-image", {
    method: "POST",
    body: formData,
  });
}

export async function removeProfileImage() {
  return apiFetch("/users/me/profile-image", {
    method: "DELETE",
  });
}

export async function changeMyPassword(
  currentPassword,
  newPassword
) {
  return apiFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
}
export async function getMenuItems(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.append(
      "search",
      filters.search.trim()
    );
  }

  if (
    filters.categoryId !== undefined &&
    filters.categoryId !== null &&
    filters.categoryId !== ""
  ) {
    params.append(
      "categoryId",
      filters.categoryId
    );
  }

  if (
    filters.isAvailable !== undefined &&
    filters.isAvailable !== null &&
    filters.isAvailable !== ""
  ) {
    params.append(
      "isAvailable",
      filters.isAvailable
    );
  }

  if (
    filters.minPrice !== undefined &&
    filters.minPrice !== null &&
    filters.minPrice !== ""
  ) {
    params.append(
      "minPrice",
      filters.minPrice
    );
  }

  if (
    filters.maxPrice !== undefined &&
    filters.maxPrice !== null &&
    filters.maxPrice !== ""
  ) {
    params.append(
      "maxPrice",
      filters.maxPrice
    );
  }

  const queryString = params.toString();

  return apiFetch(
    `/menu-items${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
}


/* GET ONE MENU ITEM */
export async function getMenuItem(id) {
  return apiFetch(`/menu-items/${id}`);
}

export async function createMenuItem(menuItemData) {
  return apiFetch("/menu-items", {
    method: "POST",
    body: JSON.stringify(menuItemData),
  });
}

export async function updateMenuItem(id, menuItemData) {
  return apiFetch(`/menu-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(menuItemData),
  });
}

export async function deleteMenuItem(id) {
  return apiFetch(`/menu-items/${id}`, {
    method: "DELETE",
  });
}

export async function uploadMenuItemImage(menuItemId, imageFile) {
  const formData = new FormData();

  formData.append("image", imageFile);

  return apiFetch(`/menu-items/${menuItemId}/image`, {
    method: "POST",
    body: formData,
  });
}
/*
 * =========================
 * ADMIN ORDERS
 * =========================
 */

export async function getAdminOrders() {
  return apiFetch("/orders/admin/all");
}

export async function getAdminOrder(id) {
  return apiFetch(`/orders/admin/${id}`);
}

export async function getAdminOrderStats() {
  return apiFetch("/orders/admin/stats");
}

export async function updateAdminOrderStatus(
  id,
  status
) {
  return apiFetch(`/orders/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  });
}
/* ADMIN RESERVATIONS */

export async function getAdminReservations() {
  return apiFetch("/reservations/admin/all");
}

export async function getAdminReservation(id) {
  return apiFetch(`/reservations/admin/${id}`);
}

export async function updateAdminReservationStatus(id, status) {
  return apiFetch(`/reservations/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}