let allProducts = [];
let cart = [];
const TAX_RATE = 0.13;

document.addEventListener("DOMContentLoaded", () => {
  fetchItems();
  updateClock();
  lucide.createIcons();
});

// GET
async function fetchItems() {
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Failed to load");
    allProducts = await res.json();

    renderProducts(allProducts);
    const countSpan = document.getElementById("total-count");
    if (countSpan) countSpan.innerText = `${allProducts.length} items`;
  } catch (err) {
    console.error("Error fetching items:", err);
  }
}

// POST
async function addNewProduct(event) {
  event.preventDefault();

  const name = document.getElementById("new-name").value;
  const brand = document.getElementById("new-brand").value;
  const category = document.getElementById("new-category").value;
  const storage = document.getElementById("new-storage").value;
  const color = document.getElementById("new-color").value;
  const price = parseFloat(document.getElementById("new-price").value);
  const stock = parseInt(document.getElementById("new-stock").value);
  const desc = document.getElementById("new-desc").value;

  // auto generate SKU
  // brand: first 3 letters
  const skuBrand = brand.substring(0, 3).toUpperCase();

  // model: last word of the name
  const nameParts = name.split(" ");
  const skuModel =
    nameParts.length > 0
      ? nameParts[nameParts.length - 1].toUpperCase()
      : "GEN";

  // color: first 2 letters and last letter
  let skuColor = "STD";
  if (color.length >= 3) {
    skuColor = (color.substring(0, 2) + color.slice(-1)).toUpperCase();
  } else if (color.length > 0) {
    skuColor = color.toUpperCase();
  }

  // storage: extract numbers
  const storageMatch = storage.match(/\d+/);
  const skuStorage = storageMatch ? storageMatch[0] : null;

  let generatedSku;
  if (skuStorage) {
    generatedSku = `${skuBrand}-${skuModel}-${skuStorage}-${skuColor}`;
  } else {
    generatedSku = `${skuBrand}-${skuModel}-${skuColor}`;
  }

  // create object
  const newItem = {
    sku: generatedSku,
    name: name,
    brand: brand,
    category: category,
    storage: storage || null,
    color: color || "Standard",
    price: price,
    stock_quantity: stock,
    description: desc || `${brand} ${name}`,
  };

  // send POST request
  try {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    if (res.ok) {
      toggleModal();
      fetchItems();
      document.querySelector("form").reset();
      alert(`Item Added! SKU: ${generatedSku}`);
    } else {
      alert("Error adding item");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to connect to server");
  }

  renderCart(); // to update UI
}

// logic

function renderProducts(products) {
    const container = document.getElementById("product-container");
    if (!container) return;
    
    container.innerHTML = "";

    products.forEach((item) => {
        const card = document.createElement("div");
        card.className = "card"; 
        
        card.onclick = () => addToCart(item);

        card.innerHTML = `
            <button class="delete-btn" onclick="event.stopPropagation(); deleteProduct(${item.product_id})">
                <i data-lucide="trash"></i>
            </button>
            
            <div class="card-content">
                <div class="card-icon">
                    <i data-lucide="${getIconByCategory(item.category)}"></i>
                </div>
                <div class="card-info">
                    <span class="brand">${item.brand}</span>
                    <h3 class="title">${item.name}</h3>
                    <span class="sku">${item.sku || 'SKU-000'}</span>
                </div>
                <div class="card-footer">
                    <span class="price">$${item.price.toFixed(2)}</span>
                    <span class="stock-badge">${item.stock_quantity} Left</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
}

// helper to pick icons
function getIconByCategory(cat) {
    const map = {
        'Laptops': 'laptop', 'Smartphones': 'tablet-smartphone', 'Tablets': 'tablet',
        'Accessories': 'keyboard', 'E-Readers': 'book-check', 'Storage': 'hard-drive',
        'Audio': 'headphones', 'Gaming': 'gamepad-2', 'Cameras': 'camera',
        'Wearables': 'watch', 'Monitors': 'monitor',
        'Smart Home': 'house', 'Networking': 'router', 'Drones': 'drone'
    };
    return map[cat] || 'box'; 
}

// logic for sidebar
function filterCategory(category) {
    document.querySelectorAll('.categories li').forEach(li => li.classList.remove('active'));
    
    // find  clicked category and add 'active'
    // we look for <li> that has this specific category in its onclick attribute
    const activeItem = Array.from(document.querySelectorAll('.categories li')).find(li => 
        li.getAttribute('onclick').includes(`'${category}'`) || 
        (category === 'all' && li.getAttribute('onclick').includes("'all'"))
    );
    if (activeItem) activeItem.classList.add('active');

    const title = document.getElementById("page-title");
    const countLabel = document.getElementById("total-count"); // get the count element

    if (category === 'all' || category === 'All') {
        renderProducts(allProducts);
        if (title) title.innerText = "All Items";
        if (countLabel) countLabel.innerText = allProducts.length + " items"; 
        
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
        if (title) title.innerText = category;
        if (countLabel) countLabel.innerText = filtered.length + " items"; 
    }
}

function searchProducts() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query)
    );
    renderProducts(filtered);
}

// cart logic

function addToCart(product) {
  const existingItem = cart.find(
    (item) => item.product_id === product.product_id,
  );

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  renderCart();
}

function renderCart() {
    const container = document.getElementById("cart-container");
    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align:center; padding:40px; color:#aaa;">
                <div style="margin-bottom:10px;"><i data-lucide="shopping-cart" size="40"></i></div>
                <p>No items in order</p>
            </div>`;
        updateTotals();
        if (window.lucide) lucide.createIcons();
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div class="item-details">
                <strong>${item.name}</strong>
                <div class="item-math">${item.quantity} x $${item.price.toFixed(2)}</div>
            </div>
            <div class="item-right">
                <span class="item-total">$${(item.price * item.quantity).toFixed(2)}</span>
                <button onclick="removeFromCart(${index})" class="remove-btn">
                    <i data-lucide="x" size="16"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });

    updateTotals();
    if (window.lucide) lucide.createIcons();
}

function updateTotals() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  document.getElementById("subtotal-price").innerText =
    `$${subtotal.toFixed(2)}`;
  document.getElementById("tax-price").innerText = `$${tax.toFixed(2)}`;
  document.getElementById("total-price").innerText = `$${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

// utils

function toggleModal() {
    const modal = document.getElementById("add-item-modal");
    if(modal) modal.classList.toggle("hidden");
}

function updateClock() {
  const now = new Date();
  document.getElementById("clock").innerText = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  setTimeout(updateClock, 1000);
}