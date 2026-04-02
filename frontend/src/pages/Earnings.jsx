import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Earnings() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching products:", err));

    fetch("http://localhost:8080/api/sales")
      .then((res) => res.json())
      .then((data) => setSales(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching sales:", err));
  }, []);


  const earningsRows = useMemo(() => {
    return products.map((product) => {
      const sale = sales.find((s) => s.item === product.name) || { quantity: 0 };
      const unitsSold = sale.quantity || 0;
      const revenue = +(unitsSold * Number(product.price)).toFixed(2);

      return {
        id: product.product_id ?? product._id,
        name: product.name,
        sku: product.sku || "N/A",
        unitsSold,
        price: Number(product.price),
        total: revenue,
      };
    });
  }, [products, sales]);

  const totalRevenue = useMemo(() => {
    return earningsRows.reduce((sum, row) => sum + row.total, 0);
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