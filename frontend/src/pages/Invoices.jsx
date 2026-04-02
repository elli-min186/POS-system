import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../css/home.css";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container">
      <Sidebar activePage="invoices" showCategories={false} />

      <main className="main-content" style={{ padding: "2rem", width: "100%" }}>
        <header className="top-bar">
          <div className="header-left">
            <h1>Sales Invoices</h1>
            <span className="tag">{invoices.length} total</span>
          </div>
        </header>

        {loading ? (
          <p>Loading invoices...</p>
        ) : (
          <div className="invoice-table-container">
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Total Items</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", paddingTop: "2rem" }}>
                      No invoices found. Make a sale first!
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id || inv.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px 0" }}>{inv._id || inv.id}</td>
                      <td>{new Date(inv.date || inv.createdAt).toLocaleString()}</td>
                      <td>
                        {inv.items?.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td>${Number(inv.subtotal).toFixed(2)}</td>
                      <td>${Number(inv.tax).toFixed(2)}</td>
                      <td><strong>${Number(inv.total).toFixed(2)}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default Invoices;