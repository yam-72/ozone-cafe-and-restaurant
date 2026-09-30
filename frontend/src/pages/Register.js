import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth.service";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [status, setStatus] =
    useState("idle");

  const [message, setMessage] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!fullName.trim()) {
      setStatus("error");
      setMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }

    if (!password) {
      setStatus("error");
      setMessage("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    try {
      setStatus("loading");

      const data = await register(
        fullName.trim(),
        email.trim(),
        password,
        phone.trim()
      );

      console.log(
        "REGISTRATION RESPONSE:",
        data
      );

      setStatus("success");
      setMessage(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      setStatus("error");

      setMessage(
        error.message ||
          "Unable to create your account."
      );
    }
  };

  const isLoading =
    status === "loading";

  return (
    <main className="register-page">
      <section className="register-card">

        <div className="register-card__content">

          <div className="register-card__icon">
            ☕
          </div>

          <h1>Create Account</h1>

          <p className="register-card__description">
            Create your OZONE account.
          </p>

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label htmlFor="fullName">
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                placeholder="Enter your full name"
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

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

            <div className="form-group">
              <label htmlFor="phone">
                Phone
                <span className="optional">
                  {" "}
                  (Optional)
                </span>
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                placeholder="Enter your phone number"
                disabled={isLoading}
                autoComplete="tel"
              />
            </div>

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
                  placeholder="At least 8 characters"
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
            </div>

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

            {message && (
              <div
                className={`register-message register-message--${status}`}
                role="alert"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          <div className="register-footer">
            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign In
            </Link>
          </div>

        </div>

      </section>
    </main>
  );
}

export default Register;