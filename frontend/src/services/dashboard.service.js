import { getCart } from "./cart.service";
import { getMyOrders } from "./order.service";
import { getMyReservations } from "./reservation.service";

export async function getCustomerDashboard() {
  const [
    cart,
    orders,
    reservations,
  ] = await Promise.all([
    getCart(),
    getMyOrders(),
    getMyReservations(),
  ]);

  return {
    cart,
    orders: Array.isArray(orders)
      ? orders
      : [],
    reservations: Array.isArray(reservations)
      ? reservations
      : [],
  };
}