import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../css/invoices.css" 
import { Navigate } from "react-router-dom";
import { socket } from "../socket";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);


  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "worker";
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role === "worker") {
    return <Navigate to="/" replace />;
  }
  const canRefund = role === "manager" || role === "owner";

  // State to track the quantity selected in the dropdown for each specific product
  const [refundQuantities, setRefundQuantities] = useState({});
  
  // State for sorting the table
  const [sortConfig, setSortConfig] = useState(null);

  // Fetch all invoices from the backend on component mount
  useEffect(() => {
    fetchInvoices(token, setInvoices, setLoading);
    socket.connect();

    function onConnect() {
      console.log('Connected to socket!');
    }

    function onDisconnect() {
      console.log('Disconnected from socket!');
    }

    function onInvoicesChanged(message) {
      console.log(message);
      setLoading(true);
      fetchInvoices(token, setInvoices, setLoading);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('checkoutCompleted', onInvoicesChanged);
    socket.on('refundProcessed', onInvoicesChanged);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('checkoutCompleted', onInvoicesChanged);
    }
  }, []);

  function fetchInvoices(token, setInvoices, setLoading) {
    fetch("http://localhost:8080/api/invoices", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
          console.log("Token expired / invalid → clearing storage");

          localStorage.clear();
          localStorage.setItem("sessionExpired", "true");
          window.location.href = "/login"; // or "/"

          throw new Error("Unauthorized");
        }

        if (!res.ok) throw new Error("Request failed");

        return res.json();
      })
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch invoices:", err);
        setLoading(false);
      });
  }

  // Logic to check if an invoice was created within the last 14 days
  const isRefundable = (dateString) => {
    const invoiceDate = new Date(dateString);
    const currentDate = new Date();
    const daysDifference = (currentDate - invoiceDate) / (1000 * 60 * 60 * 24);
    return daysDifference <= 14;
  };

  // Sends the refund request to the backend and updates the local state with the returned data
  const processRefund = async (invoiceId, itemsToRefund) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8080/api/invoices/${invoiceId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemsToRefund: itemsToRefund
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      setSelectedInvoice(data.invoice);
      setInvoices(prev =>
        prev.map(inv =>
          inv.invoice_id === invoiceId ? data.invoice : inv
        )
      );
      setRefundQuantities({});
    } else {
      alert(data.error || "Failed to process refund");
    }
  } catch (error) {
    console.error("Failed to process refund", error);
  }
};

  const getStatusClass = (status) => {
    if (status === "Fully Refunded") return "status-refunded";
    if (status === "Partially Refunded") return "status-partial";
    return "status-paid";
  };

  const handleQtyChange = (productId, val) => {
    setRefundQuantities(prev => ({ ...prev, [productId]: parseInt(val) }));
  };

  // Sorting Handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper to render sort arrows
  const getSortIndicator = (key) => {
    if (!sortConfig || sortConfig.key !== key) return " ↕";
    return sortConfig.direction === 'asc' ? " ↑" : " ↓";
  };

  // Create a sorted copy of the invoices array
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!sortConfig) return 0;

    let aVal, bVal;

    switch (sortConfig.key) {
      case 'invoice_id':
        aVal = a.invoice_id;
        bVal = b.invoice_id;
        break;
      case 'date':
        aVal = new Date(a.date || a.createdAt).getTime();
        bVal = new Date(b.date || b.createdAt).getTime();
        break;
      case 'status':
        aVal = a.status || "Paid";
        bVal = b.status || "Paid";
        break;
      case 'total':
        aVal = Number(a.total);
        bVal = Number(b.total);
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className={`container ${selectedInvoice ? "hide-mobile-nav" : ""}`}>
      <Sidebar activePage="invoices" showCategories={false} />

      {/* Conditionally hide the invoice list on mobile if an invoice is selected */}
      <main className={`main-content ${selectedInvoice ? 'hide-on-mobile' : ''}`}>
        <header className="top-bar">
          <div className="header-left">
            <h1>Sales Invoices</h1>
            <span className="tag">{invoices.length} total</span>
          </div>
        </header>

        {loading ? (
          <p>Loading invoices...</p>
        ) : (
          <div className="shared-table-wrapper">
            <table className="shared-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('invoice_id')} style={{cursor: 'pointer', userSelect: 'none'}}>
                    Invoice ID{getSortIndicator('invoice_id')}
                  </th>
                  <th onClick={() => handleSort('date')} style={{cursor: 'pointer', userSelect: 'none'}}>
                    Date{getSortIndicator('date')}
                  </th>
                  <th onClick={() => handleSort('status')} style={{cursor: 'pointer', userSelect: 'none'}}>
                    Status{getSortIndicator('status')}
                  </th>
                  <th>Total Items</th>
                  <th onClick={() => handleSort('total')} style={{cursor: 'pointer', userSelect: 'none'}}>
                    Total Paid{getSortIndicator('total')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.length === 0 ? (
                  <tr><td colSpan="5" className="empty-shared">No invoices found.</td></tr>
                ) : (
                  sortedInvoices.map((inv) => (
                    <tr
                      key={inv._id || inv.invoice_id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`clickable-row ${selectedInvoice?.invoice_id === inv.invoice_id ? "selected-row" : ""}`}
                    >
                      <td>#{inv.invoice_id}</td>
                      <td>{new Date(inv.date || inv.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(inv.status)}`}>
                          {inv.status || "Paid"}
                        </span>
                      </td>
                      <td>{inv.items?.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td><strong>${Number(inv.total).toFixed(2)}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Conditionally show full screen or hide entirely on mobile based on selection */}
      <aside className={`order-panel ${selectedInvoice ? 'full-screen-mobile' : 'hide-on-mobile'}`}>
        <div className="order-header">
          <h3>Invoice Details</h3>
          {selectedInvoice && (
            <button className="clear-cart-btn" onClick={() => setSelectedInvoice(null)}>Close</button>
          )}
        </div>

        <div className="order-list">
          {!selectedInvoice ? (
            <div className="empty-shared">Select an invoice to view details.</div>
          ) : (
            <>
              <div className="invoice-summary-box">
                <h4>Invoice #{selectedInvoice.invoice_id}</h4>
                <p>{new Date(selectedInvoice.date).toLocaleString()}</p>
              </div>

              {!isRefundable(selectedInvoice.date) && (
                <div className="warning-box">Past 14-day return window. No refunds allowed.</div>
              )}

              <div className="invoice-items-wrapper">
                {selectedInvoice.items.map(item => {
                  const refundedQty = item.refunded_quantity || 0;
                  const remainingQty = item.quantity - refundedQty;
                  const selectedQty = refundQuantities[item.product_id] || 1;

                  return (
                    <div key={item.product_id} className="invoice-item-row">
                      <div className="invoice-item-info">
                        <h4 className="invoice-item-title">{item.name}</h4>
                        <p className="item-meta">
                          {item.quantity} x ${item.price.toFixed(2)}
                          {remainingQty > 0 && remainingQty < item.quantity && (
                            <span className="remaining-qty">
                              ({remainingQty} remaining)
                            </span>
                          )}
                        </p>
                        {refundedQty > 0 && (
                          <span className="badge-refunded">
                            {refundedQty} Refunded
                          </span>
                        )}
                      </div>

                      <div className="invoice-item-actions">
                        {remainingQty > 0 && isRefundable(selectedInvoice.date) && canRefund ? (
                          <div className="refund-action-group">
                            {remainingQty > 1 && (
                              <select
                                value={selectedQty}
                                onChange={(e) => handleQtyChange(item.product_id, e.target.value)}
                                className="refund-select"
                              >
                                {[...Array(remainingQty)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                              </select>
                            )}
                            <button
                              onClick={() => processRefund(selectedInvoice.invoice_id, [{ id: item.product_id, qty: selectedQty }])}
                              className="btn-outline-primary"
                            >
                              Refund
                            </button>
                          </div>
                        ) : remainingQty === 0 ? (
                          <span className="badge-refunded">Fully Refunded</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {selectedInvoice && (
          <div className="invoice-totals">
            {(() => {
              const originalSubtotal = selectedInvoice.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
              }, 0);
              const originalTax = originalSubtotal * 0.13;
              const originalTotal = originalSubtotal + originalTax;

              const refundedSubtotal = selectedInvoice.items.reduce((sum, item) => {
                return sum + (item.price * (item.refunded_quantity || 0));
              }, 0);
              const refundedTax = refundedSubtotal * 0.13;
              const totalRefunded = refundedSubtotal + refundedTax;

              const currentTotal = Math.max(0, originalTotal - totalRefunded);

              return (
                <div className="order-total-section">
                  <div className="row">
                    <span>Subtotal</span>
                    <span>${originalSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="row">
                    <span>Tax (13%)</span>
                    <span>${originalTax.toFixed(2)}</span>
                  </div>
                  {totalRefunded > 0 && (
                    <div className="row text-danger">
                      <span>Total Refunded (Incl. Tax)</span>
                      <span>-${totalRefunded.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="total-row">
                    <span>Current Total</span>
                    <span>${currentTotal.toFixed(2)}</span>
                  </div>
                  
                  {isRefundable(selectedInvoice.date) &&
                  canRefund &&
                    selectedInvoice.items.some(item => item.quantity > (item.refunded_quantity || 0)) && (
                      <button
                        onClick={() => {
                          const allRemaining = selectedInvoice.items
                            .filter(item => item.quantity > (item.refunded_quantity || 0))
                            .map(item => ({
                              id: item.product_id,
                              qty: item.quantity - (item.refunded_quantity || 0)
                            }));
                          processRefund(selectedInvoice.invoice_id, allRemaining);
                        }}
                        className="submit-btn" style={{marginTop: "15px"}}>
                        Refund Entire Invoice
                      </button>
                    )}
                </div>
              );
            })()}
          </div>
        )}
      </aside>
    </div>
  );
}

export default Invoices;
