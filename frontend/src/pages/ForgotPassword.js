import { useState } from "react";
import { forgotPassword } from "../services/auth.service";
import "../styles/ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    try {
      setStatus("loading");

      const data = await forgotPassword(email.trim());

      setStatus("success");
      setMessage(
        data.message ||
          "Password reset request created."
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error.message ||
          "Unable to process your request."
      );
    }
  };

  const isLoading = status === "loading";

  return (
    <main className="forgot-page">
      <section className="forgot-card">
        <div className="forgot-card__content">

          <div className="forgot-card__icon">
            🔐
          </div>

          <h1>Forgot Password?</h1>

          <p className="forgot-card__description">
            Enter your email address and we'll
            help you reset your password.
          </p>

          <form
            className="forgot-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
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
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {message && (
              <div
                className={`form-message form-message--${status}`}
                role="alert"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="forgot-button"
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Sending...
                </>
              ) : (
                "Send Reset Request"
              )}
            </button>
          </form>

          <div className="forgot-footer">
            <a href="/login">
              ← Back to Login
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;