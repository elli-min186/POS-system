import { useEffect, useState } from "react";

function Earnings() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/sales")
      .then((res) => res.json())
      .then((data) => setSales(data))
      .catch((err) => console.error("Error fetching sales:", err));
  }, []);

  return (
    <div>
      <h1>Earnings Page</h1>

      <table border="1">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, index) => (
            <tr key={index}>
              <td>{sale.item}</td>
              <td>${sale.price}</td>
              <td>{sale.quantity}</td>
              <td>${sale.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Earnings;
