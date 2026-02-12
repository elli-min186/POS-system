// Load products when page loads
fetch('/api/items')
  .then(res => res.json())
  .then(products => {

    const table = document.getElementById('inventoryTable');

    products.forEach(product => {

      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${product.name}</td>
        <td>$${product.price}</td>
        <td>${product.stock_quantity}</td>

        <td>
          <button onclick="deleteProduct(${product.product_id})">

            ❌ Delete
          </button>
        </td>
      `;

      table.appendChild(row);

    });

  })
  .catch(err => console.error(err));


// Delete product
function deleteProduct(id) {

  if (!confirm("Delete this product?")) return;

  fetch(`/api/items/${id}`, {
    method: 'DELETE'
  })
  .then(res => {
    if (res.ok) {
      alert("Deleted!");
      location.reload();
    } else {
      alert("Delete failed");
    }
  });

}
