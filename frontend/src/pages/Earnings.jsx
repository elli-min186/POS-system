import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Navigate } from "react-router-dom";

function Earnings() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role") || "worker";

  if (role !== "owner") {
    return <Navigate to="/" replace />;
  }

  // Fetch invoices
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/invoices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          console.log("Token expired / invalid → clearing storage");

          localStorage.clear();
          localStorage.setItem("sessionExpired", "true");
          window.location.href = "/login";

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
        console.error("Error fetching invoices:", err);
        setLoading(false);
      });
  }, []);

  // Aggregate earnings by product
  const earningsRows = useMemo(() => {
    const map = {};

    invoices.forEach((inv) => {
      inv.items?.forEach((item) => {
        const key = item.product_id;

        if (!map[key]) {
          map[key] = {
            id: key,
            name: item.name,
            sku: item.sku || "N/A",
            unitsSold: 0,
            refundedUnits: 0,
            price: Number(item.price),
            total: 0,
          };
        }

        const refunded = item.refunded_quantity || 0;
        const actualSold = item.quantity - refunded;

        map[key].unitsSold += actualSold;
        map[key].refundedUnits += refunded;
        map[key].total += actualSold * item.price;
      });
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [invoices]);

  // Stats
  const totalRevenue = useMemo(
    () => earningsRows.reduce((sum, row) => sum + row.total, 0),
    [earningsRows]
  );

  const totalUnitsSold = useMemo(
    () => earningsRows.reduce((sum, row) => sum + row.unitsSold, 0),
    [earningsRows]
  );

  const totalInvoices = invoices.length;

  const totalRefundedValue = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      return (
        sum +
        (inv.items?.reduce((itemSum, item) => {
          return (
            itemSum +
            ((item.refunded_quantity || 0) * Number(item.price))
          );
        }, 0) || 0)
      );
    }, 0);
  }, [invoices]);

  const bestSeller = earningsRows[0];

  const topRevenueItem = earningsRows[0];

  return (
    <div className="container">
      <Sidebar showCategories={false} activePage="earnings" />

      <main className="main-content">
        <Header
          title="Earnings Report"
          tagText={`$${totalRevenue.toFixed(2)} Total Revenue`}
          extraTags={[
            `${totalUnitsSold} Units`,
            `${totalInvoices} Orders`,
            `Refunded: $${totalRefundedValue.toFixed(2)}`,
            bestSeller ? `Best: ${bestSeller.name}` : "Best: N/A",
            topRevenueItem
              ? `Top: $${topRevenueItem.total.toFixed(2)}`
              : "Top: N/A",
          ]}
        />

        {loading ? (
          <p style={{ padding: "20px" }}>Loading earnings...</p>
        ) : (
          <div className="shared-table-wrapper">
            <table className="shared-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Units Sold</th>
                  <th>Refunded</th>
                  <th>Price ($)</th>
                  <th>Total ($)</th>
                </tr>
              </thead>

              <tbody>
                {earningsRows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.sku}</td>
                    <td>{row.unitsSold}</td>
                    <td>{row.refundedUnits}</td>
                    <td>${row.price.toFixed(2)}</td>
                    <td>${row.total.toFixed(2)}</td>
                  </tr>
                ))}

                {earningsRows.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-shared">
                      No earnings data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default Earnings;