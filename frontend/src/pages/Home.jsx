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

import "../home.css";

function Home() {

  const TAX_RATE = 0.13;

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [time, setTime] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    sku: "",
    category: "",
    color: "",
    price: "",
    stock_quantity: ""
  });

  // FETCH PRODUCTS
  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then(res => res.json())
      .then(data => {
        setAllProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  }, []);

  // CLOCK
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // FILTER
  useEffect(() => {

    const filtered = allProducts.filter((p) => {

      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        p.category === selectedCategory;

      return matchesSearch && matchesCategory;

    });

    setFilteredProducts(filtered);

  }, [searchTerm, selectedCategory, allProducts]);

  const filterCategory = (category) => {
    setSelectedCategory(category);
  };

  // CART
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

  // FORM INPUT
  const handleChange = (e) => {

    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value
    });

  };

  // ADD PRODUCT API
  const addProduct = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch("http://localhost:8080/api/items", {

        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(newProduct)

      });

      const data = await response.json();

      if (response.ok) {

        setAllProducts([...allProducts, data]);

        setNewProduct({
          name: "",
          brand: "",
          sku: "",
          category: "",
          color: "",
          price: "",
          stock_quantity: ""
        });

        setShowModal(false);

      } else {

        console.error(data.error);

      }

    } catch (error) {

      console.error("Error adding product:", error);

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

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div>

          <div className="logo-area">

            <div className="logo-icon">
              <ShoppingCart size={20} />
            </div>

            <div>
              <h2>TechPOS</h2>
              <span className="subtitle">{time}</span>
            </div>

          </div>

          <nav className="categories">

            <h3>CATEGORIES</h3>

            <ul>

              {categories.map((cat) => (

                <li
                  key={cat.name}
                  className={selectedCategory === cat.name ? "active" : ""}
                  onClick={() => filterCategory(cat.name)}
                >

                  {cat.icon}
                  {cat.label || cat.name}

                </li>

              ))}

            </ul>

          </nav>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main-content">

        <header className="top-bar">

          <div className="header-left">

            <h1>
              {selectedCategory === "all"
                ? "All Items"
                : selectedCategory}
            </h1>

            <span className="tag">
              {filteredProducts.length} items
            </span>

          </div>

          <div className="search-bar">

            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>

          <div className="header-right">
            <span>{time}</span>
          </div>

        </header>

        {/* PRODUCTS */}

        <div className="product-grid">

          {filteredProducts.map((item) => (

            <div
              key={item.product_id}
              className="card"
              onClick={() => addToCart(item)}
            >

              <div className="card-content">

                <span className="brand">{item.brand}</span>
                <h3 className="title">{item.name}</h3>
                <span className="sku">{item.sku}</span>

                <div className="card-footer">

                  <span className="price">
                    ${Number(item.price).toFixed(2)}
                  </span>

                  <span className="stock-badge">
                    {item.stock_quantity} Left
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </main>

      {/* ORDER PANEL */}

      <aside className="order-panel">

        <div className="order-header">

          <h3>Current Order</h3>

          <button
            className="clear-cart-btn"
            onClick={clearCart}
          >
            Clear
          </button>

        </div>

        <div className="order-list">

          {cart.length === 0 ? (

            <div className="empty-state">

              <div className="icon-circle">
                <ShoppingCart size={28} />
              </div>

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

          <button
            className="checkout-btn"
            onClick={() => setShowModal(true)}
          >
            Add New Product
          </button>

        </div>

      </aside>

      {/* MODAL */}

      {showModal && (

        <div className="modal">

          <div className="modal-content">

            <div className="modal-header">

              <h3>Add Product</h3>

              <div
                className="close-modal"
                onClick={() => setShowModal(false)}
              >
                ✕
              </div>

            </div>

            <form onSubmit={addProduct}>

              <input name="name" placeholder="Name" value={newProduct.name} onChange={handleChange} required />
              <input name="brand" placeholder="Brand" value={newProduct.brand} onChange={handleChange} required />
              <input name="sku" placeholder="SKU" value={newProduct.sku} onChange={handleChange} required />
              <input name="category" placeholder="Category" value={newProduct.category} onChange={handleChange} required />
              <input name="color" placeholder="Color" value={newProduct.color} onChange={handleChange} required />
              <input name="price" type="number" placeholder="Price" value={newProduct.price} onChange={handleChange} required />
              <input name="stock_quantity" type="number" placeholder="Stock" value={newProduct.stock_quantity} onChange={handleChange} required />

              <button type="submit">
                Add Product
              </button>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}

export default Home;
