/* --- STATE MANAGEMENT --- */
let db = []; // Will be populated from JSON
let cart = [];
let currentCategory = 'all';

/* --- DOM ELEMENTS --- */
const productGrid = document.getElementById('productGrid');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const subTotalEl = document.getElementById('subTotalDisplay');
const taxEl = document.getElementById('taxDisplay');
const totalEl = document.getElementById('totalDisplay');
const payBtnText = document.getElementById('payButtonText');
const cartCountBadge = document.getElementById('cartCount');
const searchInput = document.getElementById('searchInput');

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch Data
    fetchProducts();
    
    // 2. Start Clock
    startClock();
    
    // 3. Set Date
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('dateDisplay').textContent = new Date().toLocaleDateString('en-US', options);

    // 4. Initialize Static Icons
    lucide.createIcons();
});

async function fetchProducts() {
    try {
        const response = await fetch('/data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        db = await response.json();
        
        // Initialize App with Data
        updateCategoryCounts();
        renderProducts(db);
        renderCart();
        
    } catch (error) {
        console.error("Could not fetch products:", error);
        productGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:red;">Error loading products. Please ensure a local server is running.</div>`;
    }
}

function renderProducts(productsToRender) {
    productGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#9ca3af;">No products found.</div>`;
        return;
    }

    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        const colorClass = getBrandColor(product.brand);
        const initial = product.brand ? product.brand.substring(0, 2).toUpperCase() : '??';

        card.innerHTML = `
            <div class="card-img-placeholder ${colorClass}">
                ${initial}
            </div>
            <div class="card-brand">${product.brand}</div>
            <div class="card-title">${product.name}</div>
            <div class="card-code">${product.sku}</div>
            <div class="card-footer">
                <div class="price">$${product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                <div class="stock-badge">${product.stock_quantity} in stock</div>
            </div>
        `;
        
        card.onclick = () => addToCart(product);
        productGrid.appendChild(card);
    });

    // Update the header count
    document.getElementById('totalItemCount').textContent = `${productsToRender.length} items`;
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<div class="empty-state">Cart is empty</div>`;
        updateTotals(0);
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.qty}</p>
            </div>
            <div class="item-right">
                <div class="qty-control">
                    <div class="qty-btn" onclick="updateQty(${item.product_id}, -1)">-</div>
                    <div class="qty-val">${item.qty}</div>
                    <div class="qty-btn" onclick="updateQty(${item.product_id}, 1)">+</div>
                </div>
                <div class="item-total">$${itemTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                <i data-lucide="trash-2" class="trash-icon" onclick="removeFromCart(${item.product_id})"></i>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    updateTotals(subtotal);
    lucide.createIcons();
}

function addToCart(product) {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    renderCart();
}

function updateQty(productId, change) {
    const item = cart.find(i => i.product_id === productId);
    if (!item) return;
    item.qty += change;
    if (item.qty <= 0) removeFromCart(productId);
    else renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.product_id !== productId);
    renderCart();
}

function clearCart() {
    if(cart.length > 0 && confirm("Are you sure you want to clear the order?")) {
        cart = [];
        renderCart();
    }
}

function updateTotals(subtotal) {
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    subTotalEl.innerText = `$${subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    taxEl.innerText = `$${tax.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    totalEl.innerText = `$${total.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    payBtnText.innerText = `Pay $${total.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountBadge.innerText = totalItems;
}

function processPayment() {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }
    alert(`Payment Successful!\nTotal: ${totalEl.innerText}`);
    cart = [];
    renderCart();
}

/* --- FILTER & SEARCH --- */
function filterCategory(category, element) {
    currentCategory = category;
    
    // Reset active class
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    // Set new active class (handle null if called programmatically)
    if(element) element.classList.add('active');

    if (category === 'all') {
        renderProducts(db);
        document.getElementById('pageTitle').innerHTML = `All Items <span class="item-count">${db.length} items</span>`;
    } else {
        const filtered = db.filter(p => p.category === category);
        renderProducts(filtered);
        document.getElementById('pageTitle').innerHTML = `${category} <span class="item-count">${filtered.length} items</span>`;
    }
}

function searchProducts() {
    const term = searchInput.value.toLowerCase();
    const filtered = db.filter(p => 
        (p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)) &&
        (currentCategory === 'all' || p.category === currentCategory)
    );
    renderProducts(filtered);
}

/* --- UTILITIES --- */
function updateCategoryCounts() {
    const counts = {};
    db.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    
    // Safe update for elements that might not exist in your HTML
    const setSafeText = (id, text) => {
        const el = document.getElementById(id);
        if(el) el.innerText = text;
    };

    setSafeText('count-all', db.length);
    setSafeText('count-Laptops', counts['Laptops'] || 0);
    setSafeText('count-Smartphones', counts['Smartphones'] || 0);
    setSafeText('count-Tablets', counts['Tablets'] || 0);
    setSafeText('count-Audio', counts['Audio'] || 0);
    setSafeText('count-Accessories', counts['Accessories'] || 0);
}

function getBrandColor(brand) {
    if (!brand) return 'ph-orange';
    const b = brand.toLowerCase();
    if (['apple', 'samsung', 'dell'].includes(b)) return 'ph-blue';
    if (['sony', 'logitech'].includes(b)) return 'ph-purple';
    return 'ph-orange';
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        const clockText = document.getElementById('clock-text');
        if(clockText) clockText.innerText = now.toLocaleTimeString();
    }, 1000);
}