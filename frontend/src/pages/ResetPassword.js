import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../services/auth.service";
import "../styles/ResetPassword.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();

  // Get token from URL
  const token = searchParams.get("token")?.trim();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  /*
   * Handle password reset
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous message
    setMessage("");

    /*
     * Check whether token exists
     */
    if (!token) {
      setStatus("error");
      setMessage(
        "This password reset link is invalid or missing."
      );
      return;
    }

    /*
     * Check password
     */
    if (!password) {
      setStatus("error");
      setMessage("Please enter your new password.");
      return;
    }

    /*
     * Check minimum password length
     */
    if (password.length < 8) {
      setStatus("error");
      setMessage(
        "Password must be at least 8 characters."
      );
      return;
    }

    /*
     * Check password confirmation
     */
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    /*
     * Send request to backend
     */
    try {
      setStatus("loading");

      console.log(
        "RESET TOKEN FROM URL:",
        token
      );

      console.log(
        "RESET TOKEN BEING SENT:",
        token
      );

      const data = await resetPassword(
        token,
        password
      );

      console.log(
        "RESET PASSWORD RESPONSE:",
        data
      );

      /*
       * Password reset succeeded
       */
      setStatus("success");

      setMessage(
        data.message ||
          "Password reset successful."
      );
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      setStatus("error");

      setMessage(
        error.message ||
          "Unable to reset your password."
      );
    }
  };

  /*
   * Status helpers
   */
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <main className="reset-page">
      <section className="reset-card">
        <div className="reset-card__content">

          {/* Icon */}
          <div className="reset-card__icon">
            🔑
          </div>

          {/* Title */}
          <h1>Reset Password</h1>

          {/* Description */}
          <p className="reset-card__description">
            Create a new password for your account.
            Make sure it is strong and secure.
          </p>

          {!isSuccess ? (
            <form
              className="reset-form"
              onSubmit={handleSubmit}
            >

              {/* =========================
                  NEW PASSWORD
              ========================== */}

              <div className="form-group">
                <label htmlFor="password">
                  New Password
                </label>

                <div className="password-wrapper">
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter new password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={isLoading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>

                <small>
                  Use at least 8 characters.
                </small>
              </div>

              {/* =========================
                  CONFIRM PASSWORD
              ========================== */}

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="password-wrapper">
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
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    disabled={isLoading}
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>
              </div>

              {/* =========================
                  MESSAGE
              ========================== */}

              {message && (
                <div
                  className={`reset-message reset-message--${status}`}
                  role="alert"
                >
                  {message}
                </div>
              )}

              {/* =========================
                  SUBMIT BUTTON
              ========================== */}

              <button
                type="submit"
                className="reset-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          ) : (
            /* =========================
               SUCCESS
            ========================== */

            <div className="reset-success">
              <div className="success-icon">
                ✓
              </div>

              <h2>
                Password Reset Successful
              </h2>

              <p>
                Your password has been changed
                successfully.
              </p>

              <Link
                to="/login"
                className="login-button"
              >
                Continue to Login
              </Link>
            </div>
          )}

          {/* =========================
              FOOTER
          ========================== */}

          {!isSuccess && (
            <div className="reset-footer">
              <Link to="/login">
                ← Back to Login
              </Link>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}

export default ResetPassword;

