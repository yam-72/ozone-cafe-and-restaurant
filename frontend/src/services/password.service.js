
import { apiFetch } from "./api";

export async function changePassword(passwordData) {
  return apiFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(passwordData),
  });
}