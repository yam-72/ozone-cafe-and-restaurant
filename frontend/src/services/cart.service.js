import { apiFetch } from "./api";

/**
 * Get the current user's cart
 */
export async function getCart() {
  return apiFetch("/carts");
}

/**
 * Add a menu item to the cart
 */
export async function addToCart(menuItemId, quantity = 1) {
  return apiFetch("/carts/items", {
    method: "POST",
    body: JSON.stringify({
      menuItemId,
      quantity,
    }),
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(cartItemId, quantity) {
  return apiFetch(`/carts/items/${cartItemId}`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity,
    }),
  });
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(cartItemId) {
  return apiFetch(`/carts/items/${cartItemId}`, {
    method: "DELETE",
  });
}

/**
 * Clear the entire cart
 */
export async function clearCart() {
  return apiFetch("/carts", {
    method: "DELETE",
  });
}