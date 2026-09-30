import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createReservation,
  getReservationAvailability,
  getMyReservations,
} from "../services/reservation.service";
import "../styles/Reservations.css";

function Reservations() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    reservationDate: "",
    reservationTime: "",
    guestCount: 2,
    specialRequest: "",
  });

  const [reservations, setReservations] = useState([]);
  const [availability, setAvailability] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -------------------------------------------------------
     Load customer's reservations
  ------------------------------------------------------- */

  useEffect(() => {
    async function loadReservations() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyReservations();

        setReservations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load reservations:", err);

        setError(
          err.message || "Failed to load your reservations."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, []);

  /* -------------------------------------------------------
     Handle form changes
  ------------------------------------------------------- */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "guestCount"
          ? Number(value)
          : value,
    }));

    setError("");
    setSuccess("");
  }

  /* -------------------------------------------------------
     Check availability
  ------------------------------------------------------- */

  async function handleCheckAvailability() {
    if (!form.reservationDate) {
      setError("Please select a reservation date.");
      return;
    }

    try {
      setCheckingAvailability(true);
      setError("");
      setAvailability(null);

      const data = await getReservationAvailability(
        form.reservationDate
      );

      setAvailability(data);
    } catch (err) {
      console.error(
        "Failed to check availability:",
        err
      );

      setError(
        err.message ||
          "Failed to check reservation availability."
      );
    } finally {
      setCheckingAvailability(false);
    }
  }

  /* -------------------------------------------------------
     Submit reservation
  ------------------------------------------------------- */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.customerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.customerPhone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!form.reservationDate) {
      setError("Please select a reservation date.");
      return;
    }

    if (!form.reservationTime) {
      setError("Please select a reservation time.");
      return;
    }

    if (
      form.guestCount < 1 ||
      form.guestCount > 20
    ) {
      setError(
        "Guest count must be between 1 and 20."
      );
      return;
    }

    try {
      setSubmitting(true);

      const data = await createReservation({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        reservationDate: form.reservationDate,
        reservationTime: form.reservationTime,
        guestCount: Number(form.guestCount),
        specialRequest:
          form.specialRequest.trim() || undefined,
      });

      setSuccess(
        "Your reservation has been created successfully."
      );

      setReservations((current) => [
        data,
        ...current,
      ]);

      setForm((current) => ({
        ...current,
        reservationDate: "",
        reservationTime: "",
        guestCount: 2,
        specialRequest: "",
      }));

      setAvailability(null);
    } catch (err) {
      console.error(
        "Failed to create reservation:",
        err
      );

      setError(
        err.message ||
          "Failed to create reservation."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* -------------------------------------------------------
     Helpers
  ------------------------------------------------------- */

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  function getStatusClass(status) {
    if (!status) return "";

    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */

  return (
    <main className="reservations-page">

      {/* HEADER */}

      <header className="reservations-header">
        <div className="reservations-header-inner">

          <button
            className="reservations-logo"
            onClick={() => navigate("/dashboard")}
          >
            OZONE☕
            <span>CAFE & RESTAURANT</span>
          </button>

          <nav className="reservations-nav">
            <button
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/menu")}
            >
              Menu
            </button>

            <button
              onClick={() => navigate("/orders")}
            >
              Orders
            </button>

            <button
              className="active"
              onClick={() =>
                navigate("/reservations")
              }
            >
              Reservations
            </button>

            <button
              onClick={() => navigate("/cart")}
            >
              Cart
            </button>
          </nav>

        </div>
      </header>

      {/* HERO */}

      <section className="reservations-hero">
        <div className="reservations-hero-content">

          <span className="reservations-eyebrow">
            OZONE EXPERIENCE
          </span>

          <h1>
            Reserve Your
            <br />
            <em>Table</em>
          </h1>

          <p>
            Take a moment to enjoy good food,
            warm coffee, and a beautiful
            atmosphere. Reserve your table
            at OZONE.
          </p>

        </div>
      </section>

      {/* MAIN */}

      <section className="reservations-main">

        <div className="reservation-layout">

          {/* FORM */}

          <div className="reservation-card">

            <div className="reservation-card-heading">
              <span>01</span>

              <div>
                <h2>Make a Reservation</h2>

                <p>
                  Tell us when you'd like to
                  visit.
                </p>
              </div>
            </div>

            {error && (
              <div className="reservation-alert error">
                {error}
              </div>
            )}

            {success && (
              <div className="reservation-alert success">
                ✓ {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="reservation-form"
            >

              {/* NAME */}

              <div className="form-field">
                <label htmlFor="customerName">
                  Your Name
                </label>

                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  placeholder="Enter your name"
                  value={form.customerName}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>

              {/* PHONE */}

              <div className="form-field">
                <label htmlFor="customerPhone">
                  Phone Number
                </label>

                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  placeholder="09XXXXXXXX"
                  value={form.customerPhone}
                  onChange={handleChange}
                  maxLength={20}
                />
              </div>

              <div className="form-row">

                {/* DATE */}

                <div className="form-field">
                  <label htmlFor="reservationDate">
                    Date
                  </label>

                  <input
                    id="reservationDate"
                    name="reservationDate"
                    type="date"
                    value={form.reservationDate}
                    onChange={handleChange}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                  />
                </div>

                {/* TIME */}

                <div className="form-field">
                  <label htmlFor="reservationTime">
                    Time
                  </label>

                  <input
                    id="reservationTime"
                    name="reservationTime"
                    type="time"
                    value={form.reservationTime}
                    onChange={handleChange}
                  />
                </div>

              </div>

              {/* GUEST COUNT */}

              <div className="form-field">
                <label htmlFor="guestCount">
                  Number of Guests
                </label>

                <select
                  id="guestCount"
                  name="guestCount"
                  value={form.guestCount}
                  onChange={handleChange}
                >
                  {Array.from(
                    { length: 20 },
                    (_, index) => index + 1
                  ).map((number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number}{" "}
                      {number === 1
                        ? "Guest"
                        : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              {/* AVAILABILITY */}

              <button
                type="button"
                className="availability-button"
                onClick={handleCheckAvailability}
                disabled={checkingAvailability}
              >
                {checkingAvailability
                  ? "Checking..."
                  : "Check Availability"}
              </button>

              {availability && (
                <div className="availability-box">
                  <div className="availability-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Availability checked
                    </strong>

                    <p>
                      {typeof availability ===
                      "string"
                        ? availability
                        : "Please choose an available time and continue with your reservation."}
                    </p>
                  </div>
                </div>
              )}

              {/* SPECIAL REQUEST */}

              <div className="form-field">
                <label htmlFor="specialRequest">
                  Special Request
                  <span>Optional</span>
                </label>

                <textarea
                  id="specialRequest"
                  name="specialRequest"
                  placeholder="Birthday, window table, special occasion..."
                  value={form.specialRequest}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                />
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="reservation-submit"
                disabled={submitting}
              >
                {submitting
                  ? "Reserving Table..."
                  : "Reserve My Table"}
              </button>

            </form>

          </div>

          {/* INFORMATION */}

          <aside className="reservation-info">

            <div className="reservation-info-card">

              <span className="reservation-info-number">
                02
              </span>

              <h3>
                A table
                <br />
                waiting for you.
              </h3>

              <p>
                Whether you're meeting friends,
                enjoying a quiet coffee, or
                celebrating something special,
                OZONE is ready to welcome you.
              </p>

              <div className="reservation-divider" />

              <div className="reservation-detail">
                <span>OPENING HOURS</span>
                <strong>
                  Mon — Sun
                  <br />
                  8:00 AM — 10:00 PM
                </strong>
              </div>

              <div className="reservation-detail">
                <span>RESERVATION</span>
                <strong>
                  Up to 20 guests
                </strong>
              </div>

            </div>

          </aside>

        </div>

        {/* MY RESERVATIONS */}

        <section className="my-reservations">

          <div className="section-heading">
            <div>
              <span>
                YOUR VISITS
              </span>

              <h2>
                My Reservations
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="reservation-loading">
              <div className="reservation-spinner" />
              <p>
                Loading your reservations...
              </p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="reservation-empty">
              <div>☕</div>

              <h3>
                No reservations yet
              </h3>

              <p>
                Your upcoming reservations
                will appear here.
              </p>
            </div>
          ) : (
            <div className="reservation-list">

              {reservations.map((reservation) => (
                <article
                  key={reservation.id}
                  className="reservation-item"
                >

                  <div className="reservation-date">
                    <span>
                      {reservation.reservationDate
                        ? new Date(
                            reservation.reservationDate
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                            }
                          )
                        : "---"}
                    </span>

                    <strong>
                      {reservation.reservationDate
                        ? new Date(
                            reservation.reservationDate
                          ).getDate()
                        : "--"}
                    </strong>
                  </div>

                  <div className="reservation-item-content">

                    <div>
                      <h3>
                        {reservation.reservationTime}
                      </h3>

                      <p>
                        {reservation.guestCount}{" "}
                        {reservation.guestCount === 1
                          ? "Guest"
                          : "Guests"}
                      </p>
                    </div>

                    <span
                      className={`reservation-status ${getStatusClass(
                        reservation.status
                      )}`}
                    >
                      {reservation.status}
                    </span>

                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

      </section>

    </main>
  );
}

export default Reservations;