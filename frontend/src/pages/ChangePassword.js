
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword } from "../services/password.service";
import { useAuth } from "../context/AuthContext";
import "../styles/ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function togglePassword(field) {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError("Your new password must be different from your current password.");
      return;
    }

    try {
      setLoading(true);

      const response = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setSuccess(response.message || "Password changed successfully.");

      // The backend revokes all active sessions after a password change.
      // Log out locally and ask the user to sign in again.
      setTimeoutLogout();
    } catch (err) {
      setError(err.message || "Unable to change your password.");
    } finally {
      setLoading(false);
    }
  }

  function setTimeoutLogout() {
    // Allow the success message to be visible before leaving the page.
    window.setTimeout(() => {
      logout();
      navigate("/login", {
        replace: true,
        state: { message: "Your password was changed. Please log in again." },
      });
    }, 1500);
  }

  return (
    <main className="change-password-page">
      <section className="change-password-card">
        <Link to="/profile" className="change-password-back">
          <span aria-hidden="true">←</span> Back to Profile
        </Link>

        <div className="change-password-heading">
          <div className="change-password-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <circle cx="12" cy="15.5" r="1" />
              <path d="M12 16.5v1.5" />
            </svg>
          </div>

          <p className="change-password-eyebrow">ACCOUNT SECURITY</p>
          <h1>Change Password</h1>
          <p>
            Choose a strong password to help keep your OZONE account secure.
          </p>
        </div>

        {error && (
          <div className="change-password-alert error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="change-password-alert success" role="status">
            {success}
            <br />
            <small>Redirecting you to login...</small>
          </div>
        )}

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="change-password-field">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="password-input-wrap">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                placeholder="Enter your current password"
                value={form.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading || !!success}
              />
              <button
                type="button"
                className="password-visibility"
                onClick={() => togglePassword("current")}
                aria-label={showPasswords.current ? "Hide password" : "Show password"}
              >
                {showPasswords.current ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="change-password-field">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrap">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Enter your new password"
                value={form.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading || !!success}
              />
              <button
                type="button"
                className="password-visibility"
                onClick={() => togglePassword("new")}
                aria-label={showPasswords.new ? "Hide password" : "Show password"}
              >
                {showPasswords.new ? "Hide" : "Show"}
              </button>
            </div>
            <small>Use at least 8 characters.</small>
          </div>

          <div className="change-password-field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrap">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm your new password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading || !!success}
              />
              <button
                type="button"
                className="password-visibility"
                onClick={() => togglePassword("confirm")}
                aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
              >
                {showPasswords.confirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="change-password-submit"
            disabled={loading || !!success}
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>

        <div className="change-password-note">
          <span aria-hidden="true">ⓘ</span>
          For your security, changing your password will sign you out of your
          active sessions.
        </div>
      </section>
    </main>
  );
}

export default ChangePassword;