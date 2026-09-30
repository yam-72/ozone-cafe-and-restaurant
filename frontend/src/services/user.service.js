import { apiFetch } from "./api";

/**
 * Get the currently authenticated user's profile.
 */
export async function getMyProfile() {
  return apiFetch("/users/me");
}

/**
 * Update the currently authenticated user's profile.
 */
export async function updateMyProfile(profileData) {
  return apiFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
}

/**
 * Upload/change the user's profile image.
 */
export async function uploadProfileImage(file) {
  const formData = new FormData();

  formData.append("image", file);

  return apiFetch("/users/me/profile-image", {
    method: "POST",
    body: formData,
  });
}

/**
 * Remove the user's profile image.
 */
export async function removeProfileImage() {
  return apiFetch("/users/me/profile-image", {
    method: "DELETE",
  });
}