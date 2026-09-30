import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  // Get loginUser from AuthContext
  const { loginUser } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Show or hide password
  const [showPassword, setShowPassword] = useState(false);

  // Status and message
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous message
    setMessage("");
    setStatus("idle");

    // Validate email
    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }

    // Validate password
    if (!password) {
      setStatus("error");
      setMessage("Please enter your password.");
      return;
    }

    try {
      setStatus("loading");

      console.log("LOGIN EMAIL:", email);

      // Send login request to backend
      const data = await login(
        email.trim(),
        password
      );

      console.log("LOGIN RESPONSE:", data);

      // Make sure the backend returned a user
      if (!data?.user) {
        throw new Error(
          "Login succeeded, but user information was not returned."
        );
      }

      // Show the returned role for debugging
      console.log(
        "LOGGED-IN USER:",
        data.user
      );

      console.log(
        "USER ROLE:",
        data.user.role
      );

      // Save authentication information
      loginUser({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });

      setStatus("success");
      setMessage("Login successful.");

      // Redirect based on user role
      setTimeout(() => {
        if (data.user.role === "ADMIN") {
          navigate("/admin", {
            replace: true,
          });
        } else {
          navigate("/dashboard", {
            replace: true,
          });
        }
      }, 500);

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setStatus("error");

      setMessage(
        error.message ||
          "Unable to login."
      );
    }
  };

  const isLoading =
    status === "loading";

  return (
    <main className="login-page">
      <section className="login-card">

        <div className="login-card__content">

          {/* ICON */}
          <div className="login-card__icon">
            ☕
          </div>

          {/* TITLE */}
          <h1>Welcome Back</h1>

          <p className="login-card__description">
            Sign in to your OZONE account.
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* =========================
                EMAIL
            ========================== */}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />

            </div>

            {/* =========================
                PASSWORD
            ========================== */}

            <div className="form-group">

              <label htmlFor="password">
                Password
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
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
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

            </div>

            {/* =========================
                FORGOT PASSWORD
            ========================== */}

            <div className="login-forgot">

              <Link to="/forgot-password">
                Forgot password?
              </Link>

            </div>

            {/* =========================
                MESSAGE
            ========================== */}

            {message && (
              <div
                className={`login-message login-message--${status}`}
                role="alert"
              >
                {message}
              </div>
            )}

            {/* =========================
                LOGIN BUTTON
            ========================== */}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          {/* =========================
              REGISTER
          ========================== */}

          <div className="login-footer">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

        </div>

      </section>
    </main>
  );
}

export default Login;
