import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  removeProfileImage,
} from "../services/user.service";

import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProfile();

      setProfile(data);

      setFormData({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);

      setError(
        err?.message ||
          "Failed to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await updateMyProfile({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      const updatedUser = response.user;

      setProfile(updatedUser);

      setFormData({
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });

      setEditing(false);

      setSuccess(
        "Your profile was updated successfully."
      );
    } catch (err) {
      console.error("Failed to update profile:", err);

      setError(
        err?.message ||
          "Failed to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setFormData({
      fullName: profile?.fullName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });

    setEditing(false);
    setError("");
    setSuccess("");
  }

  function handleChooseImage() {
    fileInputRef.current?.click();
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile image must be smaller than 5 MB."
      );
      return;
    }

    try {
      setUploadingImage(true);

      const response =
        await uploadProfileImage(file);

      setProfile(response.user);

      setSuccess(
        "Profile image updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to upload profile image:",
        err
      );

      setError(
        err?.message ||
          "Failed to upload profile image."
      );
    } finally {
      setUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemoveImage() {
    setError("");
    setSuccess("");

    try {
      setRemovingImage(true);

      const response =
        await removeProfileImage();

      setProfile(response.user);

      setSuccess(
        "Profile image removed successfully."
      );
    } catch (err) {
      console.error(
        "Failed to remove profile image:",
        err
      );

      setError(
        err?.message ||
          "Failed to remove profile image."
      );
    } finally {
      setRemovingImage(false);
    }
  }

  function getProfileImageUrl(imageUrl) {
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
  }

  function getInitials(name) {
    if (!name) {
      return "U";
    }

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner"></div>

          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-error-state">
          <div className="profile-error-icon">
            !
          </div>

          <h2>Unable to load profile</h2>

          <p>
            {error ||
              "Something went wrong while loading your profile."}
          </p>

          <button
            className="profile-primary-button"
            onClick={loadProfile}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getProfileImageUrl(
    profile.profileImage
  );

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* HEADER */}

        <div className="profile-header">
          <div>
            <button
              className="profile-back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </button>

            <h1>My Profile</h1>

            <p>
              Manage your personal information
              and account settings.
            </p>
          </div>
        </div>

        {/* NOTIFICATIONS */}

        {error && (
          <div className="profile-alert profile-alert-error">
            <span>!</span>
            <p>{error}</p>

            <button
              onClick={() => setError("")}
              type="button"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="profile-alert profile-alert-success">
            <span>✓</span>
            <p>{success}</p>

            <button
              onClick={() => setSuccess("")}
              type="button"
            >
              ×
            </button>
          </div>
        )}

        <div className="profile-grid">
          {/* LEFT SIDE */}

          <aside className="profile-sidebar">
            <div className="profile-card profile-user-card">
              <div className="profile-avatar-wrapper">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={profile.fullName}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar profile-avatar-placeholder">
                    {getInitials(
                      profile.fullName
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="profile-camera-button"
                  onClick={handleChooseImage}
                  disabled={uploadingImage}
                  aria-label="Change profile image"
                >
                  {uploadingImage ? "..." : "✎"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </div>

              <h2>{profile.fullName}</h2>

              <p className="profile-user-email">
                {profile.email}
              </p>

              <span
                className={`profile-role ${
                  profile.role === "ADMIN"
                    ? "profile-role-admin"
                    : ""
                }`}
              >
                {profile.role === "ADMIN"
                  ? "Administrator"
                  : "Customer"}
              </span>

              <div className="profile-image-actions">
                <button
                  type="button"
                  onClick={handleChooseImage}
                  disabled={uploadingImage}
                  className="profile-secondary-button"
                >
                  {uploadingImage
                    ? "Uploading..."
                    : "Change Photo"}
                </button>

                {profile.profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={removingImage}
                    className="profile-remove-button"
                  >
                    {removingImage
                      ? "Removing..."
                      : "Remove"}
                  </button>
                )}
              </div>
            </div>

            <div className="profile-card profile-account-card">
              <h3>Account</h3>

              <div className="profile-account-row">
                <span>Status</span>

                <span
                  className={
                    profile.isActive
                      ? "profile-status-active"
                      : "profile-status-inactive"
                  }
                >
                  <span className="profile-status-dot"></span>

                  {profile.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className="profile-account-row">
                <span>Role</span>
                <strong>
                  {profile.role}
                </strong>
              </div>

              <div className="profile-account-row">
                <span>Member since</span>
                <strong>
                  {formatDate(
                    profile.createdAt
                  )}
                </strong>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE */}

          <main className="profile-main">
            <section className="profile-card">
              <div className="profile-section-header">
                <div>
                  <span className="profile-section-label">
                    ACCOUNT
                  </span>

                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Update the information
                    associated with your OZONE
                    account.
                  </p>
                </div>

                {!editing && (
                  <button
                    type="button"
                    className="profile-primary-button"
                    onClick={() => {
                      setEditing(true);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form
                  className="profile-form"
                  onSubmit={handleSaveProfile}
                >
                  <div className="profile-form-group">
                    <label htmlFor="fullName">
                      Full Name
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={
                        formData.fullName
                      }
                      onChange={handleChange}
                      maxLength={100}
                      disabled={saving}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="email">
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength={150}
                      disabled={saving}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={20}
                      disabled={saving}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-cancel-button"
                      onClick={
                        handleCancelEdit
                      }
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="profile-primary-button"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-information">
                  <div className="profile-info-row">
                    <div className="profile-info-icon">
                      ◉
                    </div>

                    <div>
                      <span>
                        Full Name
                      </span>

                      <strong>
                        {profile.fullName}
                      </strong>
                    </div>
                  </div>

                  <div className="profile-info-row">
                    <div className="profile-info-icon">
                      @
                    </div>

                    <div>
                      <span>
                        Email Address
                      </span>

                      <strong>
                        {profile.email}
                      </strong>
                    </div>
                  </div>

                  <div className="profile-info-row">
                    <div className="profile-info-icon">
                      ☎
                    </div>

                    <div>
                      <span>
                        Phone Number
                      </span>

                      <strong>
                        {profile.phone ||
                          "No phone number added"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="profile-card profile-security-card">
              <div className="profile-section-header">
                <div>
                  <span className="profile-section-label">
                    SECURITY
                  </span>

                  <h2>
                    Account Security
                  </h2>

                  <p>
                    Keep your account secure and
                    manage your password.
                  </p>
                </div>
              </div>

              <div className="profile-security-row">
                <div className="profile-security-icon">
                  🔒
                </div>

                <div className="profile-security-content">
                  <h3>Password</h3>

                  <p>
                    Your password is securely
                    protected.
                  </p>
                </div>

                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={() =>
                    navigate(
                      "/change-password"
                    )
                  }
                >
                  Change Password
                </button>
              </div>
            </section>

            <section className="profile-card profile-danger-card">
              <div>
                <span className="profile-section-label">
                  SESSION
                </span>

                <h2>Sign Out</h2>

                <p>
                  Sign out of your OZONE account
                  on this device.
                </p>
              </div>

              <button
                type="button"
                className="profile-logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Profile;
