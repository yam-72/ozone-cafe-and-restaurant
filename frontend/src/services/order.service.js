import { apiFetch } from "./api";

/**
 * Create a new order from the current user's cart
 */
export async function createOrder(checkoutData) {
  return apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(checkoutData),
  });
}

/**
 * Get the current user's orders
 */
export async function getMyOrders() {
  return apiFetch("/orders/my-orders");
}

/**
 * Get one order belonging to the current user
 */
export async function getOrderById(orderId) {
  return apiFetch(`/orders/${orderId}`);
}

/**
 * Get one order belonging to the current user
 */
export async function getMyOrder(orderId) {
  return getOrderById(orderId);
}