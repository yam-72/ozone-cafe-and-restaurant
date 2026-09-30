import { useEffect, useMemo, useState } from "react";
import {
  getAdminReservations,
  updateAdminReservationStatus,
} from "../services/admin.service";

import "../styles/AdminReservations.css";

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
];

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedReservation, setSelectedReservation] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminReservations();

      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load reservations:", err);

      setError(
        err?.message ||
          "Failed to load reservations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (reservationId, status) => {
    try {
      setUpdatingId(reservationId);
      setError("");

      const updatedReservation =
        await updateAdminReservationStatus(
          reservationId,
          status
        );

      setReservations((currentReservations) =>
        currentReservations.map((reservation) =>
          reservation.id === reservationId
            ? {
                ...reservation,
                ...updatedReservation,
              }
            : reservation
        )
      );

      if (
        selectedReservation &&
        selectedReservation.id === reservationId
      ) {
        setSelectedReservation((current) => ({
          ...current,
          ...updatedReservation,
        }));
      }
    } catch (err) {
      console.error(
        "Failed to update reservation status:",
        err
      );

      setError(
        err?.message ||
          "Failed to update reservation status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReservations = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const customerName =
        reservation.customerName?.toLowerCase() || "";

      const customerPhone =
        reservation.customerPhone?.toLowerCase() || "";

      const customerEmail =
        reservation.user?.email?.toLowerCase() || "";

      const reservationId =
        String(reservation.id).toLowerCase();

      const matchesSearch =
        !searchTerm ||
        customerName.includes(searchTerm) ||
        customerPhone.includes(searchTerm) ||
        customerEmail.includes(searchTerm) ||
        reservationId.includes(searchTerm);

      const matchesStatus =
        statusFilter === "ALL" ||
        reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, search, statusFilter]);

  const statistics = useMemo(() => {
    return {
      total: reservations.length,

      pending: reservations.filter(
        (reservation) =>
          reservation.status === "PENDING"
      ).length,

      confirmed: reservations.filter(
        (reservation) =>
          reservation.status === "CONFIRMED"
      ).length,

      rejected: reservations.filter(
        (reservation) =>
          reservation.status === "REJECTED"
      ).length,

      cancelled: reservations.filter(
        (reservation) =>
          reservation.status === "CANCELLED"
      ).length,

      completed: reservations.filter(
        (reservation) =>
          reservation.status === "COMPLETED"
      ).length,
    };
  }, [reservations]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCreatedAt = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() || "pending";
  };

  return (
    <div className="admin-reservations">
      <div className="admin-reservations__header">
        <div>
          <p className="admin-reservations__eyebrow">
            ADMINISTRATION
          </p>

          <h1>Reservations</h1>

          <p>
            Manage customer table reservations and
            reservation status.
          </p>
        </div>

        <button
          type="button"
          className="admin-reservations__refresh"
          onClick={fetchReservations}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="admin-reservations__error">
          <span>⚠</span>
          <p>{error}</p>

          <button
            type="button"
            onClick={fetchReservations}
          >
            Try Again
          </button>
        </div>
      )}

      <div className="reservation-stats">
        <div className="reservation-stat">
          <span className="reservation-stat__icon">
            📅
          </span>

          <div>
            <span>Total</span>
            <strong>{statistics.total}</strong>
          </div>
        </div>

        <div className="reservation-stat">
          <span className="reservation-stat__icon">
            ⏳
          </span>

          <div>
            <span>Pending</span>
            <strong>{statistics.pending}</strong>
          </div>
        </div>

        <div className="reservation-stat">
          <span className="reservation-stat__icon">
            ✓
          </span>

          <div>
            <span>Confirmed</span>
            <strong>{statistics.confirmed}</strong>
          </div>
        </div>

        <div className="reservation-stat">
          <span className="reservation-stat__icon">
            ✔
          </span>

          <div>
            <span>Completed</span>
            <strong>{statistics.completed}</strong>
          </div>
        </div>

        <div className="reservation-stat">
          <span className="reservation-stat__icon">
            ✕
          </span>

          <div>
            <span>Cancelled</span>
            <strong>{statistics.cancelled}</strong>
          </div>
        </div>
      </div>

      <div className="reservation-toolbar">
        <div className="reservation-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search customer, phone, email or ID..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="reservation-status-filter"
        >
          <option value="ALL">All statuses</option>

          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="reservation-state">
          <div className="reservation-spinner" />
          <h3>Loading reservations...</h3>
          <p>
            Please wait while we retrieve the reservations.
          </p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="reservation-state">
          <div className="reservation-state__icon">
            📅
          </div>

          <h3>
            {reservations.length === 0
              ? "No reservations yet"
              : "No reservations found"}
          </h3>

          <p>
            {reservations.length === 0
              ? "Customer reservations will appear here."
              : "Try changing your search or status filter."}
          </p>
        </div>
      ) : (
        <div className="reservation-table-wrapper">
          <table className="reservation-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReservations.map(
                (reservation) => (
                  <tr key={reservation.id}>
                    <td>
                      <span className="reservation-id">
                        #{reservation.id}
                      </span>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {reservation.customerName
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}
                        </div>

                        <div>
                          <strong>
                            {reservation.customerName ||
                              "Unknown"}
                          </strong>

                          <span>
                            {reservation.customerPhone ||
                              "No phone"}
                          </span>

                          {reservation.user?.email && (
                            <span>
                              {reservation.user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="reservation-datetime">
                        <strong>
                          {formatDate(
                            reservation.reservationDate
                          )}
                        </strong>

                        <span>
                          {formatTime(
                            reservation.reservationTime
                          )}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="guest-count">
                        👥 {reservation.guestCount}
                      </span>
                    </td>

                    <td>
                      <select
                        className={`reservation-status ${getStatusClass(
                          reservation.status
                        )}`}
                        value={reservation.status}
                        disabled={
                          updatingId === reservation.id
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            reservation.id,
                            event.target.value
                          )
                        }
                      >
                        {STATUS_OPTIONS.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td>
                      <span className="created-date">
                        {formatCreatedAt(
                          reservation.createdAt
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="view-reservation-btn"
                        onClick={() =>
                          setSelectedReservation(
                            reservation
                          )
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedReservation && (
        <div
          className="reservation-modal-overlay"
          onClick={() =>
            setSelectedReservation(null)
          }
        >
          <div
            className="reservation-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="reservation-modal__header">
              <div>
                <span>RESERVATION</span>

                <h2>
                  #{selectedReservation.id}
                </h2>
              </div>

              <button
                type="button"
                className="reservation-modal__close"
                onClick={() =>
                  setSelectedReservation(null)
                }
              >
                ×
              </button>
            </div>

            <div className="reservation-modal__status">
              <span>Status</span>

              <select
                className={`reservation-status ${getStatusClass(
                  selectedReservation.status
                )}`}
                value={selectedReservation.status}
                disabled={
                  updatingId ===
                  selectedReservation.id
                }
                onChange={(event) =>
                  handleStatusChange(
                    selectedReservation.id,
                    event.target.value
                  )
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="reservation-details">
              <div className="reservation-detail">
                <span>Customer</span>
                <strong>
                  {selectedReservation.customerName ||
                    "—"}
                </strong>
              </div>

              <div className="reservation-detail">
                <span>Phone</span>
                <strong>
                  {selectedReservation.customerPhone ||
                    "—"}
                </strong>
              </div>

              <div className="reservation-detail">
                <span>Email</span>
                <strong>
                  {selectedReservation.user?.email ||
                    "—"}
                </strong>
              </div>

              <div className="reservation-detail">
                <span>Date</span>
                <strong>
                  {formatDate(
                    selectedReservation.reservationDate
                  )}
                </strong>
              </div>

              <div className="reservation-detail">
                <span>Time</span>
                <strong>
                  {formatTime(
                    selectedReservation.reservationTime
                  )}
                </strong>
              </div>

              <div className="reservation-detail">
                <span>Guests</span>
                <strong>
                  {selectedReservation.guestCount}
                </strong>
              </div>

              <div className="reservation-detail reservation-detail--full">
                <span>Special Request</span>

                <p>
                  {selectedReservation.specialRequest ||
                    "No special request."}
                </p>
              </div>

              <div className="reservation-detail reservation-detail--full">
                <span>Created</span>

                <strong>
                  {formatCreatedAt(
                    selectedReservation.createdAt
                  )}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="reservation-modal__done"
              onClick={() =>
                setSelectedReservation(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReservations;