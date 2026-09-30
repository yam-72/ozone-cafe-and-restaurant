import { apiFetch } from "./api";

/* CREATE RESERVATION */
export async function createReservation(reservationData) {
  return apiFetch("/reservations", {
    method: "POST",
    body: JSON.stringify(reservationData),
  });
}

/* GET MY RESERVATIONS */
export async function getMyReservations() {
  return apiFetch("/reservations/my-reservations");
}

/* GET RESERVATION BY ID */
export async function getMyReservation(id) {
  return apiFetch(`/reservations/${id}`);
}

/* CHECK AVAILABILITY */
export async function getReservationAvailability(date) {
  return apiFetch(
    `/reservations/availability?date=${encodeURIComponent(date)}`
  );
}

/* CANCEL RESERVATION */
export async function cancelReservation(id) {
  return apiFetch(`/reservations/${id}`, {
    method: "DELETE",
  });
}