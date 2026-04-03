import { useEffect, useState } from "react";
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
  ShoppingCart
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import "../css/home.css";
import Header from "../components/Header";

const role = localStorage.getItem("role") || "worker";

function Home() {
  const TAX_RATE = 0.13;

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const filtered = allProducts.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, allProducts]);

  const filterCategory = (category) => {
    setSelectedCategory(category);
  };

  const addToCart = (product) => {
    const existing = cart.find(
      (item) => item.product_id === product.product_id
    );

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

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");

    const invoiceData = {
      items: cart,
      subtotal: subtotal,
      tax: tax,
      total: total,
      date: new Date().toISOString()
    };

    try {
      const response = await fetch("http://localhost:8080/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        alert("Payment successful! Invoice created.");
        clearCart(); // Clear the cart after a successful order
      } else {
        alert("Failed to create invoice.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  const categories = [
    { name: "all", label: "All Items", icon: <LayoutGrid size={18} /> },
    { name: "Laptops", icon: <Laptop size={18} /> },
    { name: "Smartphones", label: "Phones", icon: <TabletSmartphone size={18} /> },
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
    { name: "Drones", icon: <Drone size={18} /> }
  ];

  return (
    <div className="container">
      <Sidebar
        role={role}
        showCategories={true}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={filterCategory}
        activePage="home"
      />

      <main className="main-content">
        <Header
          title={selectedCategory === "all" ? "All Items" : selectedCategory}
          tagText={`${filteredProducts.length} items`}
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

      <aside className="order-panel">
        <div className="order-header">
          <h3>Current Order</h3>
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear
          </button>
        </div>

        <div className="order-list">
          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="icon-circle"><ShoppingCart /></div>
              <p>No items in order</p>
              <small>Tap products to add them here</small>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-details">
                  <strong>{item.name}</strong>
                  <div className="item-math">
                    {item.quantity} x ${item.price.toFixed(2)}
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
    </div>
  );
}

export default Home;