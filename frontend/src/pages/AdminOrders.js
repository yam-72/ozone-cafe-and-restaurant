import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminOrders,
  getAdminOrderStats,
  getAdminOrder,
  updateAdminOrderStatus,
} from "../services/admin.service";

import "../styles/AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [stats, setStats] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [actionError, setActionError] =
    useState("");

  /*
   * ==========================================
   * ORDER STATUS OPTIONS
   * ==========================================
   */

  const orderStatuses = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED",
  ];

  /*
   * ==========================================
   * LOAD ORDERS
   * ==========================================
   */

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        ordersData,
        statsData,
      ] = await Promise.all([
        getAdminOrders(),
        getAdminOrderStats(),
      ]);

      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : []
      );

      setStats(statsData || null);
    } catch (error) {
      console.error(
        "ADMIN ORDERS LOAD ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /*
   * ==========================================
   * SEARCH + FILTER
   * ==========================================
   */

  const filteredOrders = useMemo(() => {
    const normalizedSearch =
      search
        .trim()
        .toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        String(order.id)
          .includes(normalizedSearch) ||
        order.customerName
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        order.customerPhone
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        order.user?.email
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  /*
   * ==========================================
   * VIEW ORDER DETAILS
   * ==========================================
   */

  const handleViewOrder = async (
    orderId
  ) => {
    try {
      setDetailsLoading(true);
      setActionError("");

      const order =
        await getAdminOrder(orderId);

      setSelectedOrder(order);
    } catch (error) {
      console.error(
        "ORDER DETAILS ERROR:",
        error
      );

      setActionError(
        error.message ||
          "Unable to load order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  /*
   * ==========================================
   * UPDATE ORDER STATUS
   * ==========================================
   */

  const handleStatusChange = async (
    orderId,
    status
  ) => {
    try {
      setActionLoading(
        `status-${orderId}`
      );

      setActionError("");

      const updatedOrder =
        await updateAdminOrderStatus(
          orderId,
          status
        );

      /*
       * Update order in table
       */

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (order) =>
              order.id === orderId
                ? updatedOrder
                : order
          )
      );

      /*
       * Update currently opened
       * order details.
       */

      if (
        selectedOrder?.id === orderId
      ) {
        setSelectedOrder(
          updatedOrder
        );
      }

      /*
       * Refresh statistics because
       * changing status can affect
       * pending/completed/cancelled.
       */

      const updatedStats =
        await getAdminOrderStats();

      setStats(updatedStats);
    } catch (error) {
      console.error(
        "ORDER STATUS UPDATE ERROR:",
        error
      );

      setActionError(
        error.message ||
          "Unable to update order status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * ==========================================
   * CLOSE ORDER DETAILS
   * ==========================================
   */

  const closeDetails = () => {
    if (detailsLoading) {
      return;
    }

    setSelectedOrder(null);
    setActionError("");
  };

  /*
   * ==========================================
   * FORMATTING
   * ==========================================
   */

  const formatCurrency = (
    amount
  ) => {
    return new Intl.NumberFormat(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(
      Number(amount) || 0
    );
  };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getItemCount = (
    order
  ) => {
    if (!order?.items) {
      return 0;
    }

    return order.items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );
  };

  const getStatusClass = (
    status
  ) => {
    return `order-status order-status--${(
      status || "pending"
    ).toLowerCase()}`;
  };

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <section className="admin-orders-page">

        <div className="admin-orders-loading">

          <div className="admin-spinner"></div>

          <p>
            Loading orders...
          </p>

        </div>

      </section>
    );
  }

  /*
   * ==========================================
   * MAIN PAGE
   * ==========================================
   */

  return (
    <section className="admin-orders-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="admin-orders-header">

        <div>
          <span className="admin-section-label">
            ORDER MANAGEMENT
          </span>

          <h2>
            Orders
          </h2>

          <p>
            View and manage customer
            orders at OZONE.
          </p>
        </div>

        <button
          className="admin-orders-refresh"
          onClick={loadOrders}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (
        <div className="admin-orders-error">

          <span>
            ⚠️
          </span>

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


      {/* =====================================
          STATISTICS
      ====================================== */}

      <div className="admin-orders-stats">

        <div className="admin-orders-stat-card">

          <div className="admin-orders-stat-icon">
            🛒
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {stats?.totalOrders ??
                orders.length}
            </strong>
          </div>

        </div>


        <div className="admin-orders-stat-card">

          <div className="admin-orders-stat-icon">
            ⏳
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {stats?.pendingOrders ??
                0}
            </strong>
          </div>

        </div>


        <div className="admin-orders-stat-card">

          <div className="admin-orders-stat-icon">
            ✓
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {stats?.completedOrders ??
                0}
            </strong>
          </div>

        </div>


        <div className="admin-orders-stat-card">

          <div className="admin-orders-stat-icon">
            ✕
          </div>

          <div>
            <span>
              Cancelled
            </span>

            <strong>
              {stats?.cancelledOrders ??
                0}
            </strong>
          </div>

        </div>


        <div className="admin-orders-stat-card">

          <div className="admin-orders-stat-icon">
            💰
          </div>

          <div>
            <span>
              Completed Revenue
            </span>

            <strong>
              {formatCurrency(
                stats?.totalRevenue
              )}
            </strong>

            <small>
              ETB
            </small>
          </div>

        </div>

      </div>


      {/* =====================================
          TOOLBAR
      ====================================== */}

      <div className="admin-orders-toolbar">

        <div className="admin-orders-search">

          <span>
            ⌕
          </span>

          <input
            type="search"
            placeholder="Search by order ID, customer, phone or email..."
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


        <div className="admin-orders-filter">

          <label htmlFor="order-status-filter">
            Status
          </label>

          <select
            id="order-status-filter"
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

            {orderStatuses.map(
              (status) => (
                <option
                  value={status}
                  key={status}
                >
                  {status}
                </option>
              )
            )}

          </select>

        </div>

      </div>


      {/* =====================================
          RESULTS
      ====================================== */}

      <div className="admin-orders-results">

        <span>
          Showing{" "}
          <strong>
            {filteredOrders.length}
          </strong>{" "}
          of{" "}
          <strong>
            {orders.length}
          </strong>{" "}
          orders
        </span>

      </div>


      {/* =====================================
          EMPTY
      ====================================== */}

      {filteredOrders.length === 0 ? (

        <div className="admin-orders-empty">

          <div className="admin-orders-empty-icon">
            🛒
          </div>

          <h3>
            No orders found
          </h3>

          <p>
            {orders.length === 0
              ? "There are no customer orders yet."
              : "Try changing your search or status filter."}
          </p>

        </div>

      ) : (

        /* ===================================
           TABLE
        ==================================== */

        <div className="admin-orders-table-wrapper">

          <table className="admin-orders-table">

            <thead>

              <tr>

                <th>
                  Order
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Items
                </th>

                <th>
                  Total
                </th>

                <th>
                  Status
                </th>

                <th>
                  Date
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredOrders.map(
                (order) => (

                  <tr key={order.id}>

                    {/* ORDER */}

                    <td>

                      <div className="order-id-cell">

                        <strong>
                          #{order.id}
                        </strong>

                        <span>
                          Order
                        </span>

                      </div>

                    </td>


                    {/* CUSTOMER */}

                    <td>

                      <div className="order-customer-cell">

                        <strong>
                          {order.customerName ||
                            order.user?.fullName ||
                            "Unknown customer"}
                        </strong>

                        <span>
                          {order.customerPhone ||
                            order.user?.phone ||
                            order.user?.email ||
                            "No contact"}
                        </span>

                      </div>

                    </td>


                    {/* ITEMS */}

                    <td>

                      <span className="order-items-count">

                        {getItemCount(order)}

                        {" "}

                        {getItemCount(order) === 1
                          ? "item"
                          : "items"}

                      </span>

                    </td>


                    {/* TOTAL */}

                    <td>

                      <strong className="order-total">
                        {formatCurrency(
                          order.totalAmount
                        )}{" "}
                        ETB
                      </strong>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={getStatusClass(
                          order.status
                        )}
                      >
                        <span></span>

                        {order.status}
                      </span>

                    </td>


                    {/* DATE */}

                    <td>

                      <span className="order-date">
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <button
                        className="order-view-button"
                        onClick={() =>
                          handleViewOrder(
                            order.id
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


      {/* =====================================
          ORDER DETAILS MODAL
      ====================================== */}

      {selectedOrder && (

        <div className="admin-modal-overlay">

          <div
            className="admin-modal admin-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
          >

            {/* MODAL HEADER */}

            <div className="admin-order-modal-header">

              <div>

                <span className="admin-section-label">
                  ORDER DETAILS
                </span>

                <h3 id="order-details-title">
                  Order #{selectedOrder.id}
                </h3>

              </div>

              <button
                className="admin-order-modal-close"
                onClick={closeDetails}
                disabled={
                  detailsLoading
                }
                aria-label="Close order details"
              >
                ×
              </button>

            </div>


            {/* ACTION ERROR */}

            {actionError && (
              <div className="admin-orders-error">

                <span>
                  ⚠️
                </span>

                <div>
                  <strong>
                    Action failed
                  </strong>

                  <p>
                    {actionError}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setActionError("")
                  }
                >
                  ×
                </button>

              </div>
            )}


            {/* CUSTOMER INFORMATION */}

            <div className="admin-order-details-section">

              <h4>
                Customer Information
              </h4>

              <div className="admin-order-customer-details">

                <div>
                  <span>
                    Name
                  </span>

                  <strong>
                    {selectedOrder.customerName ||
                      selectedOrder.user?.fullName ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Phone
                  </span>

                  <strong>
                    {selectedOrder.customerPhone ||
                      selectedOrder.user?.phone ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {selectedOrder.user?.email ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Delivery Address
                  </span>

                  <strong>
                    {selectedOrder.deliveryAddress ||
                      "Pickup / No address"}
                  </strong>
                </div>

              </div>

            </div>


            {/* ITEMS */}

            <div className="admin-order-details-section">

              <h4>
                Ordered Items
              </h4>

              <div className="admin-order-items">

                {selectedOrder.items?.map(
                  (item) => (

                    <div
                      className="admin-order-item"
                      key={item.id}
                    >

                      <div className="admin-order-item-image">

                        {item.menuItem?.imageUrl ? (

                          <img
                            src={`http://localhost:3000${item.menuItem.imageUrl}`}
                            alt={
                              item.menuItem?.name ||
                              "Menu item"
                            }
                          />

                        ) : (

                          <span>
                            🍽️
                          </span>

                        )}

                      </div>


                      <div className="admin-order-item-info">

                        <strong>
                          {item.menuItem?.name ||
                            `Menu Item #${item.menuItemId}`}
                        </strong>

                        <span>
                          {item.quantity} ×{" "}
                          {formatCurrency(
                            item.unitPrice
                          )}{" "}
                          ETB
                        </span>

                      </div>


                      <strong className="admin-order-item-subtotal">

                        {formatCurrency(
                          item.subtotal
                        )}{" "}
                        ETB

                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* TOTAL */}

            <div className="admin-order-total-row">

              <span>
                Total Amount
              </span>

              <strong>
                {formatCurrency(
                  selectedOrder.totalAmount
                )}{" "}
                ETB
              </strong>

            </div>


            {/* STATUS */}

            <div className="admin-order-status-section">

              <div>

                <span>
                  Current Status
                </span>

                <strong
                  className={getStatusClass(
                    selectedOrder.status
                  )}
                >
                  <span></span>

                  {selectedOrder.status}
                </strong>

              </div>


              <div className="admin-order-status-control">

                <label htmlFor="order-status">
                  Change Status
                </label>

                <select
                  id="order-status"
                  value={
                    selectedOrder.status
                  }
                  disabled={
                    actionLoading ===
                    `status-${selectedOrder.id}`
                  }
                  onChange={(event) =>
                    handleStatusChange(
                      selectedOrder.id,
                      event.target.value
                    )
                  }
                >

                  {orderStatuses.map(
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

                {actionLoading ===
                  `status-${selectedOrder.id}` && (
                  <small>
                    Updating status...
                  </small>
                )}

              </div>

            </div>


            {/* FOOTER */}

            <div className="admin-modal-actions">

              <button
                className="admin-modal-cancel"
                onClick={closeDetails}
                disabled={
                  actionLoading !== null
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}

export default AdminOrders;