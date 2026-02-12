let allProducts = [];
let salesData = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  fetchSales();
  updateClock();
  lucide.createIcons();
});

async function fetchProducts() {
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Failed to fetch products");
    allProducts = await res.json();
    renderEarnings();
  } catch (err) {
    console.error(err);
  }
}

async function fetchSales() {
  try {
    const res = await fetch("/api/sales");
    if (!res.ok) throw new Error("Failed to fetch sales");
    salesData = await res.json();
    renderEarnings();
  } catch (err) {
    console.error(err);
  }
}

function renderEarnings() {
  if (allProducts.length === 0 || salesData.length === 0) return;

  const tbody = document.getElementById("earnings-body");
  tbody.innerHTML = "";

  let totalRevenue = 0;

  allProducts.forEach(product => {
    // Find the sales record for this product
    const sale = salesData.find(s => s.item === product.name) || { quantity: 0 };
    const unitsSold = sale.quantity;
    const revenue = +(unitsSold * product.price).toFixed(2);

    totalRevenue += revenue;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.sku || 'N/A'}</td>
      <td>${unitsSold}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>$${revenue.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  const totalLabel = document.getElementById("total-revenue");
  totalLabel.innerText = `$${totalRevenue.toFixed(2)} Total Revenue`;
}

// Clock
function updateClock() {
  const now = new Date();
  document.getElementById("clock").innerText = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  setTimeout(updateClock, 1000);
}
