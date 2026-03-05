
import { useEffect, useState } from "react";

function Inventory() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  }, []);

  const deleteItem = (id) => {
    fetch(`http://localhost:8080/api/items/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        // remove deleted item from UI
        setItems(items.filter(item => item.product_id !== id));
      })
      .catch(err => console.error("Error deleting item:", err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Inventory Page</h1>

      {loading ? (
        <p>Loading inventory...</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.product_id}>
                <td>{item.product_id}</td>
                <td>{item.name}</td>
                <td>${item.price}</td>
                <td>
                  <button onClick={() => deleteItem(item.product_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}

    </div>
  );
}

export default Inventory;