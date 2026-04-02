import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../css/invoices.css" // Assumes you kept the merged CSS

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // State to track the quantity selected in the dropdown for each specific product
  const [refundQuantities, setRefundQuantities] = useState({});

  // Fetch all invoices from the backend on component mount
  useEffect(() => {
    fetch("http://localhost:8080/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch invoices:", err);
        setLoading(false);
      });
  }, []);

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
      const response = await fetch(`http://localhost:8080/api/invoices/${invoiceId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemsToRefund })
      });

      const data = await response.json();

      if (response.ok) {
        // Backend returns the updated invoice object
        setSelectedInvoice(data.invoice);
        // Update the invoice list so the status badges change immediately
        setInvoices((prev) =>
          prev.map((inv) => inv.invoice_id === invoiceId ? data.invoice : inv)
        );
        // Reset dropdown quantities to 1 for the next interaction
        setRefundQuantities({});
      } else {
        alert(data.error || "Failed to process refund");
      }
    } catch (error) {
      console.error("Failed to process refund", error);
    }
  };

  // Dynamic CSS classes based on the invoice status string
  const getStatusClass = (status) => {
    if (status === "Fully Refunded") return "status-refunded";
    if (status === "Partially Refunded") return "status-partial";
    return "status-paid";
  };

  // Update specific product's refund quantity in state when dropdown changes
  const handleQtyChange = (productId, val) => {
    setRefundQuantities(prev => ({ ...prev, [productId]: parseInt(val) }));
  };

  return (
    <div className="container">
      <Sidebar activePage="invoices" showCategories={false} />

      <main className="main-content">
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
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total Items</th>
                  <th>Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan="5" className="empty-shared">No invoices found.</td></tr>
                ) : (
                  invoices.map((inv) => (
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

      <aside className="order-panel">
        <div className="order-header">
          <h3>Invoice Details</h3>
          {selectedInvoice && (
            <button className="clear-cart-btn" onClick={() => setSelectedInvoice(null)}>Close</button>
          )}
        </div>

        {/* 1. SCROLLABLE AREA: Only the items go in here */}
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
                        {remainingQty > 0 && isRefundable(selectedInvoice.date) ? (
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

        {/* 2. STICKY BOTTOM AREA: Sits outside the scrollable list, rendered conditionally */}
        {selectedInvoice && (
          <div className="invoice-totals">
            {(() => {
              const originalSubtotal = selectedInvoice.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
              }, 0);
              const originalTax = originalSubtotal * 0.13;
              const originalTotal = originalSubtotal + originalTax;

              // REFUND MATH
              const refundedSubtotal = selectedInvoice.items.reduce((sum, item) => {
                return sum + (item.price * (item.refunded_quantity || 0));
              }, 0);
              const refundedTax = refundedSubtotal * 0.13;
              const totalRefunded = refundedSubtotal + refundedTax;

              // FINAL BALANCE
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
                  
                  {/* Show "Refund Entire Invoice" only if there are items left to refund */}
                  {isRefundable(selectedInvoice.date) &&
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