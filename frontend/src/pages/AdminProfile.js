import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  removeProfileImage,
  changeMyPassword,
} from "../services/admin.service";

import "../styles/AdminProfile.css";

const API_BASE_URL = "http://localhost:3000";

function AdminProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProfile();

      setProfile(data);

      setFullName(data.fullName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
    } catch (err) {
      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setError("");

      const data = await updateMyProfile({
        fullName,
        email,
        phone,
      });

      setProfile(data.user);
      setProfileMessage(
        data.message || "Profile updated successfully."
      );
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  function handleImageButton() {
    fileInputRef.current?.click();
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setProfileMessage("");

      const data = await uploadProfileImage(file);

      setProfile(data.user);
      setProfileMessage(
        data.message || "Profile image updated successfully."
      );
    } catch (err) {
      setError(
        err.message || "Unable to upload profile image."
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleRemoveImage() {
    try {
      setRemovingImage(true);
      setError("");
      setProfileMessage("");

      const data = await removeProfileImage();

      setProfile(data.user);
      setProfileMessage(
        data.message || "Profile image removed successfully."
      );
    } catch (err) {
      setError(
        err.message || "Unable to remove profile image."
      );
    } finally {
      setRemovingImage(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    setPasswordMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters long."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const data = await changeMyPassword(
        currentPassword,
        newPassword
      );

      setPasswordMessage(
        data.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      /*
       * The backend revokes all sessions after a successful
       * password change. We therefore ask the admin to log in
       * again rather than pretending the old session remains valid.
       */
      setTimeout(() => {
        localStorage.removeItem("ozone_access_token");
        localStorage.removeItem("ozone_refresh_token");
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(
        err.message || "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-profile-page">
        <div className="admin-profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="admin-profile-page">
        <div className="admin-profile-error">
          {error || "Profile could not be loaded."}
        </div>
      </div>
    );
  }

  const profileImage = profile.profileImage
    ? `${API_BASE_URL}${profile.profileImage}`
    : null;

  const initials =
    profile.fullName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "A";

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-container">

        <div className="admin-profile-header">
          <div>
            <p className="admin-profile-eyebrow">
              ACCOUNT
            </p>

            <h1>Admin Profile</h1>

            <p>
              Manage your personal information, profile
              photo, security, and account details.
            </p>
          </div>
        </div>

        {error && (
          <div className="profile-alert profile-alert-error">
            {error}
          </div>
        )}

        {profileMessage && (
          <div className="profile-alert profile-alert-success">
            {profileMessage}
          </div>
        )}

        <div className="admin-profile-grid">

          {/* PROFILE PHOTO */}
          <section className="profile-card profile-photo-card">
            <div className="profile-card-header">
              <div>
                <h2>Profile Photo</h2>
                <p>
                  Upload a photo that will represent your
                  administrator account.
                </p>
              </div>
            </div>

            <div className="profile-photo-area">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={profile.fullName}
                  className="profile-photo"
                />
              ) : (
                <div className="profile-photo profile-photo-placeholder">
                  {initials}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />

            <div className="profile-photo-actions">
              <button
                type="button"
                className="profile-button profile-button-primary"
                onClick={handleImageButton}
                disabled={uploadingImage}
              >
                {uploadingImage
                  ? "Uploading..."
                  : profileImage
                    ? "Change Photo"
                    : "Upload Photo"}
              </button>

              {profileImage && (
                <button
                  type="button"
                  className="profile-button profile-button-danger"
                  onClick={handleRemoveImage}
                  disabled={removingImage}
                >
                  {removingImage
                    ? "Removing..."
                    : "Remove Photo"}
                </button>
              )}
            </div>

            <p className="profile-image-help">
              JPG, PNG, GIF or other image formats. Maximum
              size: 5 MB.
            </p>
          </section>

          {/* ACCOUNT SUMMARY */}
          <section className="profile-card profile-summary-card">
            <div className="profile-card-header">
              <div>
                <h2>Account</h2>
                <p>Your current administrator account.</p>
              </div>
            </div>

            <div className="profile-summary">
              <div className="profile-summary-item">
                <span>Role</span>
                <strong>{profile.role}</strong>
              </div>

              <div className="profile-summary-item">
                <span>Status</span>

                <strong
                  className={
                    profile.isActive
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {profile.isActive
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>

              <div className="profile-summary-item">
                <span>Account Created</span>
                <strong>
                  {new Date(
                    profile.createdAt
                  ).toLocaleDateString()}
                </strong>
              </div>

              <div className="profile-summary-item">
                <span>Last Updated</span>
                <strong>
                  {new Date(
                    profile.updatedAt
                  ).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </section>

          {/* PERSONAL INFORMATION */}
          <section className="profile-card profile-personal-card">
            <div className="profile-card-header">
              <div>
                <h2>Personal Information</h2>
                <p>
                  Update the information associated with
                  your account.
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="profile-form-grid">

                <div className="profile-form-group">
                  <label htmlFor="fullName">
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    maxLength={100}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    maxLength={150}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    maxLength={20}
                    placeholder="Optional"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="profile-button profile-button-primary"
                disabled={savingProfile}
              >
                {savingProfile
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </form>
          </section>

          {/* SECURITY */}
          <section className="profile-card profile-security-card">
            <div className="profile-card-header">
              <div>
                <h2>Security</h2>
                <p>
                  Change your administrator password.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>

              <div className="profile-form-group">
                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                    className="password-toggle"
                  >
                    {showCurrentPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              <div className="profile-form-group">
                <label htmlFor="newPassword">
                  New Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    className="password-toggle"
                  >
                    {showNewPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              <div className="profile-form-group">
                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="password-toggle"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="profile-button profile-button-dark"
                disabled={changingPassword}
              >
                {changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>

              {passwordMessage && (
                <p className="password-success">
                  {passwordMessage}
                </p>
              )}
            </form>
          </section>

        </div>
      </div>
    </div>
  );
}

export default AdminProfile;