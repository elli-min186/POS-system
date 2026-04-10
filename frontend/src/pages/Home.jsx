import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Laptop,
  TabletSmartphone,
  Tablet,
  Keyboard,
  BookCheck,
  Headphones,
  Watch,
  Gamepad2,
  Monitor,
  Camera,
  HardDrive,
  House,
  Router,
  Drone,
  ShoppingCart,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import "../css/home.css";
import Header from "../components/Header";
import { socket } from '../socket';

function Home() {
  const TAX_RATE = 0.13;
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileOrder, setShowMobileOrder] = useState(false);
  
  // ---------------- FETCH PRODUCTS ----------------
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/items");
      const data = await res.json();
      setAllProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // ---------------- SOCKET & INITIAL FETCH ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);
    
  useEffect(() => {
    fetchItems();

    // Connect to the socket server
    socket.connect();

    // Listener function
    function onInventoryUpdated() {
      console.log("External inventory change detected. Refreshing...");
      fetchItems();
    }

    // Subscribe to the event
    socket.on('inventoryUpdated', onInventoryUpdated);

    // CLEANUP: Unsubscribe and disconnect when user leaves the page
    return () => {
      socket.off('inventoryUpdated', onInventoryUpdated);
      socket.disconnect();
    };
  }, []);

  // ---------------- FILTER LOGIC ----------------
  // Filters products based on search text and selected category
  useEffect(() => {
    const filtered = allProducts.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_id?.toString().includes(searchTerm);

      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, allProducts]);

  // ---------------- CATEGORY CHANGE ----------------
  // Triggered when selecting a category from sidebar
  const filterCategory = (category) => {
    setSelectedCategory(category);
  };

  // ---------------- ADD TO CART ----------------
  // Adds a product to the cart, respecting stock limits
  const addToCart = (product) => {
    const existing = cart.find(
      (item) => item.product_id === product.product_id
    );

    const currentQty = existing ? existing.quantity : 0;

    // Prevent overselling
    if (currentQty >= product.stock_quantity) {
      alert("Not enough stock available");
      return;
    }

    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // ---------------- REMOVE ITEM ----------------
  // Removes a product entirely from the cart
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // ---------------- UPDATE QUANTITY ----------------
  // Increases or decreases product quantity
  const updateQuantity = (product_id, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product_id === product_id) {
            const newQty = item.quantity + change;

            // Remove item completely if quantity <= 0
            if (newQty <= 0) return null;

            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // ---------------- CLEAR CART ----------------
  const clearCart = () => setCart([]);

  // ---------------- TOTAL CALCULATIONS ----------------
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // ---------------- CHECKOUT ----------------
  // Creates an invoice and completes the transaction
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    const token = localStorage.getItem("token");

    // Re-verify stock levels before processing
    for (let item of cart) {
      if (item.quantity > item.stock_quantity) {
        alert(`${item.name} is out of stock`);
        return;
      }
    }

    const invoiceData = {
      items: cart,
      subtotal: subtotal,
      tax: tax,
      total: total,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:8080/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Checkout failed");
        return;
      }

      alert("Payment successful! Invoice created.");
      clearCart();
      await fetchItems();
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  // ---------------- CATEGORY LIST ----------------
  const categories = [
    { name: "all", label: "All Items", icon: <LayoutGrid size={18} /> },
    { name: "Laptops", icon: <Laptop size={18} /> },
    {
      name: "Smartphones",
      label: "Phones",
      icon: <TabletSmartphone size={18} />,
    },
    { name: "Tablets", icon: <Tablet size={18} /> },
    { name: "Accessories", icon: <Keyboard size={18} /> },
    { name: "E-Readers", icon: <BookCheck size={18} /> },
    { name: "Audio", icon: <Headphones size={18} /> },
    { name: "Wearables", icon: <Watch size={18} /> },
    { name: "Gaming", icon: <Gamepad2 size={18} /> },
    { name: "Monitors", icon: <Monitor size={18} /> },
    { name: "Cameras", icon: <Camera size={18} /> },
    { name: "Storage", icon: <HardDrive size={18} /> },
    { name: "Smart Home", icon: <House size={18} /> },
    { name: "Networking", icon: <Router size={18} /> },
    { name: "Drones", icon: <Drone size={18} /> },
  ];

  // ---------------- UI ----------------
  return (
    <div className="container">
      <Sidebar
        showCategories={true}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={filterCategory}
        activePage="home"
      />

      <main className="main-content">
        <Header
          title={selectedCategory === "all" ? "All Items" : selectedCategory}
          tagText={filteredProducts.length + " items"}
          showSearch={true}
          searchClass="home"
          searchPlaceholder="Search products..."
          searchValue={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="product-grid">
          {filteredProducts.map((item) => (
            <ProductCard
              key={item.product_id ?? item._id}
              item={item}
              onClick={() => addToCart(item)}
            />
          ))}
        </div>
      </main>

      {/* ---------------- ORDER PANEL ---------------- */}
      <aside className={`order-panel ${showMobileOrder ? "mobile-order-open" : ""}`}>
        <div className="order-header">
          <h3>Current Order</h3>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear
            </button>

            <button
              className="mobile-close-btn"
              onClick={() => setShowMobileOrder(false)}
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="order-list">
          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="icon-circle">
                <ShoppingCart />
              </div>
              <p>No items in order</p>
              <small>Tap products to add them here</small>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-details">
                  <strong>{item.name}</strong>

                  {/* Quantity Controls (Increment + Decrement) */}
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product_id, -1)}
                    >
                      −
                    </button>

                    <span className="qty-value">{item.quantity}</span>

                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product_id, 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-math">
                    ${item.price.toFixed(2)} each
                  </div>
                </div>

                <div className="item-right">
                  <span className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(index)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ---------------- TOTAL SECTION ---------------- */}
        <div className="order-total-section">
          <div className="row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="row">
            <span>Tax (13%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="total-row">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button className="submit-btn" onClick={handleCheckout}>
            Complete Payment
          </button>
        </div>
      </aside>
      <button
        className="mobile-order-toggle"
        onClick={() => setShowMobileOrder(true)}
        type="button"
      >
        View Order ({cart.length})
      </button>
    </div>
  );
}

export default Home;
