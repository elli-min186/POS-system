import { useState } from "react";

function AddItem() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const addItem = (e) => {
    e.preventDefault();

    fetch("http://localhost:8080/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, price: price }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Item added!");
        // stay on this page:
        // clear the form so it feels successful
        setName("");
        setPrice("");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Add Item</h1>

      <form onSubmit={addItem}>
        <div>
          <p>Item Name</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <br />

        <div>
          <p>Price</p>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Add Item</button>
      </form>
    </div>
  );
}

export default AddItem;