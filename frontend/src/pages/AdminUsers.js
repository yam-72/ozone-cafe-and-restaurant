import { useEffect, useMemo, useState } from "react";

import {
  getUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "../services/admin.service";

import { useAuth } from "../context/AuthContext";

import "../styles/AdminUsers.css";

function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [actionLoading, setActionLoading] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "USERS LOAD ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /*
   * Search + filters
   */

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      search
        .trim()
        .toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.fullName
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.phone
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          user.isActive === true) ||
        (statusFilter === "INACTIVE" &&
          user.isActive === false);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  /*
   * Change account status
   */

  const handleStatusChange = async (
    user
  ) => {
    try {
      setActionLoading(
        `status-${user.id}`
      );

      const result =
        await updateUserStatus(
          user.id,
          !user.isActive
        );

      const updatedUser =
        result.user;

      setUsers((currentUsers) =>
        currentUsers.map(
          (currentUser) =>
            currentUser.id === user.id
              ? {
                  ...currentUser,
                  ...updatedUser,
                  isActive:
                    updatedUser?.isActive ??
                    !user.isActive,
                }
              : currentUser
        )
      );
    } catch (error) {
      console.error(
        "USER STATUS ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to update user status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * Change role
   */

  const handleRoleChange = async (
    user,
    role
  ) => {
    if (user.role === role) {
      return;
    }

    try {
      setActionLoading(
        `role-${user.id}`
      );

      const result =
        await updateUserRole(
          user.id,
          role
        );

      const updatedUser =
        result.user;

      setUsers((currentUsers) =>
        currentUsers.map(
          (currentUser) =>
            currentUser.id === user.id
              ? {
                  ...currentUser,
                  ...updatedUser,
                  role:
                    updatedUser?.role ||
                    role,
                }
              : currentUser
        )
      );
    } catch (error) {
      console.error(
        "USER ROLE ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to update user role."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * Delete user
   */

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    if (
      deleteTarget.id ===
      currentUser?.id
    ) {
      setDeleteTarget(null);

      setError(
        "You cannot delete your own admin account."
      );

      return;
    }

    try {
      setActionLoading(
        `delete-${deleteTarget.id}`
      );

      await deleteUser(
        deleteTarget.id
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) =>
            user.id !==
            deleteTarget.id
        )
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error(
        "USER DELETE ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to delete user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * Date formatting
   */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  /*
   * User initials
   */

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((part) =>
        part.charAt(0)
      )
      .join("")
      .toUpperCase();
  };

  return (
    <section className="admin-users-page">

      {/* PAGE HEADER */}

      <div className="admin-users-header">

        <div>
          <h2>
            Users
          </h2>

          <p>
            Manage OZONE customer and
            administrator accounts.
          </p>
        </div>

        <button
          className="admin-users-refresh"
          onClick={loadUsers}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="admin-users-error">

          <span>⚠️</span>

          <div>
            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>
      )}


      {/* FILTERS */}

      <div className="admin-users-toolbar">

        <div className="admin-users-search">

          <span>⌕</span>

          <input
            type="search"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>


        <div className="admin-users-filter">

          <label htmlFor="role-filter">
            Role
          </label>

          <select
            id="role-filter"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All roles
            </option>

            <option value="USER">
              User
            </option>

            <option value="ADMIN">
              Admin
            </option>
          </select>

        </div>


        <div className="admin-users-filter">

          <label htmlFor="status-filter">
            Status
          </label>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>

        </div>

      </div>


      {/* RESULTS INFO */}

      <div className="admin-users-results">

        <span>
          Showing{" "}
          <strong>
            {filteredUsers.length}
          </strong>{" "}
          of{" "}
          <strong>
            {users.length}
          </strong>{" "}
          users
        </span>

      </div>


      {/* LOADING */}

      {loading ? (
        <div className="admin-users-loading">

          <div className="admin-spinner"></div>

          <p>
            Loading users...
          </p>

        </div>
      ) : filteredUsers.length === 0 ? (

        /* EMPTY */

        <div className="admin-users-empty">

          <div>
            👥
          </div>

          <h3>
            No users found
          </h3>

          <p>
            Try changing your search
            or filters.
          </p>

        </div>

      ) : (

        /* TABLE */

        <div className="admin-users-table-wrapper">

          <table className="admin-users-table">

            <thead>
              <tr>

                <th>
                  User
                </th>

                <th>
                  Contact
                </th>

                <th>
                  Role
                </th>

                <th>
                  Status
                </th>

                <th>
                  Joined
                </th>

                <th>
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredUsers.map(
                (user) => {

                  const isCurrentUser =
                    user.id ===
                    currentUser?.id;

                  return (
                    <tr key={user.id}>

                      {/* USER */}

                      <td>
                        <div className="user-cell">

                          <div className="user-avatar">
                            {getInitials(
                              user.fullName
                            )}
                          </div>

                          <div className="user-info">

                            <strong>
                              {user.fullName ||
                                "Unnamed User"}
                            </strong>

                            <span>
                              ID #{user.id}
                            </span>

                          </div>

                        </div>
                      </td>


                      {/* CONTACT */}

                      <td>
                        <div className="user-contact">

                          <span>
                            {user.email}
                          </span>

                          <small>
                            {user.phone ||
                              "No phone number"}
                          </small>

                        </div>
                      </td>


                      {/* ROLE */}

                      <td>

                        {isCurrentUser ? (
                          <span className="user-role-badge user-role-badge--admin">
                            ADMIN
                          </span>
                        ) : (
                          <select
                            className="user-role-select"
                            value={
                              user.role
                            }
                            disabled={
                              actionLoading ===
                              `role-${user.id}`
                            }
                            onChange={(
                              event
                            ) =>
                              handleRoleChange(
                                user,
                                event.target
                                  .value
                              )
                            }
                          >
                            <option value="USER">
                              USER
                            </option>

                            <option value="ADMIN">
                              ADMIN
                            </option>
                          </select>
                        )}

                      </td>


                      {/* STATUS */}

                      <td>

                        <button
                          className={`user-status ${
                            user.isActive
                              ? "user-status--active"
                              : "user-status--inactive"
                          }`}
                          onClick={() =>
                            handleStatusChange(
                              user
                            )
                          }
                          disabled={
                            actionLoading ===
                            `status-${user.id}`
                          }
                        >
                          <span></span>

                          {actionLoading ===
                          `status-${user.id}`
                            ? "Updating..."
                            : user.isActive
                              ? "Active"
                              : "Inactive"}
                        </button>

                      </td>


                      {/* DATE */}

                      <td>
                        <span className="user-date">
                          {formatDate(
                            user.createdAt
                          )}
                        </span>
                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="user-actions">

                          <button
                            className="user-delete-button"
                            disabled={
                              isCurrentUser ||
                              actionLoading ===
                                `delete-${user.id}`
                            }
                            onClick={() =>
                              setDeleteTarget(
                                user
                              )
                            }
                            title={
                              isCurrentUser
                                ? "You cannot delete your own account"
                                : "Delete user"
                            }
                          >
                            {actionLoading ===
                            `delete-${user.id}`
                              ? "..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>
      )}


      {/* DELETE MODAL */}

      {deleteTarget && (
        <div className="admin-modal-overlay">

          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
          >

            <div className="admin-modal-icon">
              ⚠️
            </div>

            <h3 id="delete-user-title">
              Delete user?
            </h3>

            <p>
              Are you sure you want to
              delete{" "}
              <strong>
                {deleteTarget.fullName}
              </strong>
              ?
            </p>

            <p className="admin-modal-warning">
              This action cannot be
              undone.
            </p>

            <div className="admin-modal-actions">

              <button
                className="admin-modal-cancel"
                onClick={() =>
                  setDeleteTarget(null)
                }
              >
                Cancel
              </button>

              <button
                className="admin-modal-delete"
                onClick={handleDelete}
                disabled={
                  actionLoading ===
                  `delete-${deleteTarget.id}`
                }
              >
                {actionLoading ===
                `delete-${deleteTarget.id}`
                  ? "Deleting..."
                  : "Delete User"}
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default AdminUsers;

