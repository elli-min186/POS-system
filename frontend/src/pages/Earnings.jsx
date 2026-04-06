import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Navigate } from "react-router-dom";

function Earnings() {
  // invoices state
  const [invoices, setInvoices] = useState([]);

  // owner-only page
  const role = localStorage.getItem("role") || "worker";

  if (role !== "owner") {
  return <Navigate to="/" replace />;
  }

  // fetch invoices once
  useEffect(() => {
  const token = localStorage.getItem("token");

  fetch("http://localhost:8080/api/invoices", {
    headers: {
      Authorization: `Bearer ${token}` // ⭐ REQUIRED
    }
  })
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((data) => setInvoices(Array.isArray(data) ? data : []))
    .catch((err) => console.error("Error fetching invoices:", err));
}, []);


  // aggregate items by product
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
          price: Number(item.price),
          total: 0,
        };
      }

      const refunded = item.refunded_quantity || 0;
      const actualSold = item.quantity - refunded;

      map[key].unitsSold += actualSold;
      map[key].total += actualSold * item.price;
    });
  });

  return Object.values(map);
  }, [invoices]);

  const totalRevenue = useMemo(() => {
    return earningsRows.reduce((sum, row) => sum + row.total, 0);
  }, [earningsRows]);

  const totalUnitsSold = useMemo(() => {
  return earningsRows.reduce((sum, row) => sum + row.unitsSold, 0);
  }, [earningsRows]);

  const bestSeller = useMemo(() => {
    return [...earningsRows].sort((a, b) => b.unitsSold - a.unitsSold)[0];
  }, [earningsRows]);

  const topRevenueItem = useMemo(() => {
    return [...earningsRows].sort((a, b) => b.total - a.total)[0];
  }, [earningsRows]);

  return (
    <div className="container">
      <Sidebar
        showCategories={false}
        activePage="earnings"
      />

      <main className="main-content">
        <Header
          title="Earnings Report"
          titleId="page-title"
          tagText={`$${totalRevenue.toFixed(2)} Total Revenue`}
          tagId="total-revenue"
          extraTags={[
            `${totalUnitsSold} Units`,
            bestSeller ? `Best: ${bestSeller.name}` : "Best: N/A",
            topRevenueItem
              ? `Top: $${topRevenueItem.total.toFixed(2)}`
              : "Top: N/A",
          ]}
        />

        <div className="shared-table-wrapper">
          <table className="shared-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Units Sold</th>
                <th>Price ($)</th>
                <th>Total ($)</th>
              </tr>
            </thead>

            <tbody>
              {earningsRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.sku}</td>
                  <td>{row.unitsSold}</td>
                  <td>${row.price.toFixed(2)}</td>
                  <td>${row.total.toFixed(2)}</td>
                </tr>
              ))}

              {earningsRows.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-shared">
                    No earnings data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Earnings;