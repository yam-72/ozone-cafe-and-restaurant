import { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../services/admin.service";
import "../styles/AdminAuditLogs.css";

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAuditLogs();

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);

      setError(
        err?.message ||
          "Failed to load audit logs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  /*
   * Collect available action types from the actual
   * records returned by the backend.
   */
  const actionTypes = useMemo(() => {
    const actions = logs
      .map((log) => log.action)
      .filter(Boolean);

    return [...new Set(actions)].sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return logs.filter((log) => {
      const action =
        log.action?.toLowerCase() || "";

      const description =
        log.description?.toLowerCase() || "";

      const email =
        log.user?.email?.toLowerCase() || "";

      const userName =
        log.user?.fullName?.toLowerCase() || "";

      const ipAddress =
        log.ipAddress?.toLowerCase() || "";

      const matchesSearch =
        !searchTerm ||
        action.includes(searchTerm) ||
        description.includes(searchTerm) ||
        email.includes(searchTerm) ||
        userName.includes(searchTerm) ||
        ipAddress.includes(searchTerm);

      const matchesAction =
        actionFilter === "ALL" ||
        log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const formatDate = (date) => {
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
      second: "2-digit",
    });
  };

  const getInitial = (user) => {
    const name =
      user?.fullName ||
      user?.email ||
      "S";

    return name.charAt(0).toUpperCase();
  };

  const getActionClass = (action) => {
    if (!action) return "default";

    const normalized = action.toLowerCase();

    if (
      normalized.includes("delete") ||
      normalized.includes("remove")
    ) {
      return "danger";
    }

    if (
      normalized.includes("login") ||
      normalized.includes("auth")
    ) {
      return "auth";
    }

    if (
      normalized.includes("create") ||
      normalized.includes("register")
    ) {
      return "create";
    }

    if (
      normalized.includes("update") ||
      normalized.includes("change")
    ) {
      return "update";
    }

    if (
      normalized.includes("password") ||
      normalized.includes("reset")
    ) {
      return "security";
    }

    if (
      normalized.includes("order") ||
      normalized.includes("reservation")
    ) {
      return "activity";
    }

    return "default";
  };

  return (
    <div className="admin-audit-logs">
      <div className="admin-audit-logs__header">
        <div>
          <p className="admin-audit-logs__eyebrow">
            ADMINISTRATION
          </p>

          <h1>Audit Logs</h1>

          <p>
            Monitor important activities and changes
            made throughout the OZONE system.
          </p>
        </div>

        <button
          type="button"
          className="admin-audit-logs__refresh"
          onClick={fetchLogs}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="audit-error">
          <span>⚠</span>

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchLogs}
          >
            Try Again
          </button>
        </div>
      )}

      <div className="audit-summary">
        <div className="audit-summary__card">
          <div className="audit-summary__icon">
            ◉
          </div>

          <div>
            <span>Total Events</span>
            <strong>{logs.length}</strong>
          </div>
        </div>

        <div className="audit-summary__card">
          <div className="audit-summary__icon">
            ◇
          </div>

          <div>
            <span>Action Types</span>
            <strong>{actionTypes.length}</strong>
          </div>
        </div>

        <div className="audit-summary__card">
          <div className="audit-summary__icon">
            ✓
          </div>

          <div>
            <span>Visible Events</span>
            <strong>{filteredLogs.length}</strong>
          </div>
        </div>
      </div>

      <div className="audit-toolbar">
        <div className="audit-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search action, user, email, IP..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={actionFilter}
          onChange={(event) =>
            setActionFilter(event.target.value)
          }
          className="audit-action-filter"
        >
          <option value="ALL">
            All actions
          </option>

          {actionTypes.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="audit-state">
          <div className="audit-spinner" />

          <h3>Loading audit logs...</h3>

          <p>
            Retrieving system activity.
          </p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="audit-state">
          <div className="audit-state__icon">
            ◌
          </div>

          <h3>
            {logs.length === 0
              ? "No audit logs yet"
              : "No matching logs"}
          </h3>

          <p>
            {logs.length === 0
              ? "System activity will appear here."
              : "Try changing your search or action filter."}
          </p>
        </div>
      ) : (
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>Description</th>
                <th>IP Address</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log, index) => (
                <tr
                  key={
                    log.id ??
                    `${log.createdAt}-${index}`
                  }
                >
                  <td>
                    <span
                      className={`audit-action ${getActionClass(
                        log.action
                      )}`}
                    >
                      {log.action || "UNKNOWN"}
                    </span>
                  </td>

                  <td>
                    <div className="audit-user">
                      <div className="audit-user__avatar">
                        {getInitial(log.user)}
                      </div>

                      <div>
                        <strong>
                          {log.user?.fullName ||
                            "System User"}
                        </strong>

                        <span>
                          {log.user?.email || "—"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="audit-description">
                      {log.description ||
                        log.details ||
                        log.message ||
                        "No description"}
                    </span>
                  </td>

                  <td>
                    <code className="audit-ip">
                      {log.ipAddress || "—"}
                    </code>
                  </td>

                  <td>
                    <span className="audit-date">
                      {formatDate(log.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminAuditLogs;