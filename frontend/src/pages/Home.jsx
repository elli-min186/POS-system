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
    category: "Smartphones",
    storage: "",
    color: "",
    price: "",
    stock_quantity: "10",
    description: ""
  });

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  }, []);

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

  const handleChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value
    });
  };

  const generateSku = (brand, name, storage, color) => {
    const safeBrand = (brand || "GEN").trim();
    const safeName = (name || "ITEM").trim();
    const safeStorage = (storage || "").trim();
    const safeColor = (color || "STD").trim();

    const skuBrand = safeBrand.substring(0, 3).toUpperCase();

    const nameParts = safeName.split(" ").filter(Boolean);
    const skuModel =
      nameParts.length > 0
        ? nameParts[nameParts.length - 1].toUpperCase()
        : "GEN";

    let skuColor = "STD";
    if (safeColor.length >= 3) {
      skuColor = (safeColor.substring(0, 2) + safeColor.slice(-1)).toUpperCase();
    } else if (safeColor.length > 0) {
      skuColor = safeColor.toUpperCase();
    }

    const storageMatch = safeStorage.match(/\d+/);
    const skuStorage = storageMatch ? storageMatch[0] : null;

    return skuStorage
      ? `${skuBrand}-${skuModel}-${skuStorage}-${skuColor}`
      : `${skuBrand}-${skuModel}-${skuColor}`;
  };

  const addProduct = async (e) => {
    e.preventDefault();

    const generatedSku = generateSku(
      newProduct.brand,
      newProduct.name,
      newProduct.storage,
      newProduct.color
    );

    const productToSend = {
      sku: generatedSku,
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      storage: newProduct.storage || null,
      color: newProduct.color || "Standard",
      price: Number(newProduct.price),
      stock_quantity: Number(newProduct.stock_quantity),
      description:
        newProduct.description || `${newProduct.brand} ${newProduct.name}`
    };

    try {
      const response = await fetch("http://localhost:8080/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productToSend)
      });

      const data = await response.json();

      if (response.ok) {
        setAllProducts([...allProducts, data]);

        setNewProduct({
          name: "",
          brand: "",
          category: "Smartphones",
          storage: "",
          color: "",
          price: "",
          stock_quantity: "10",
          description: ""
        });

        setShowModal(false);
      } else {
        console.error(data.error);
        alert(data.error || "Error adding item");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to connect to server");
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

  const productCategories = categories.filter((cat) => cat.name !== "all");

  return (
    <div className="container">
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

      <main className="main-content">
        <header className="top-bar">
          <div className="header-left">
            <h1>
              {selectedCategory === "all" ? "All Items" : selectedCategory}
            </h1>

            <span className="tag">{filteredProducts.length} items</span>
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

      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ width: "500px" }}>
            <div className="modal-header">
              <h3>Add New Product</h3>

              <span
                className="close-modal"
                onClick={() => setShowModal(false)}
              >
                &times;
              </span>
            </div>

            <form onSubmit={addProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. iPhone 15"
                  />
                </div>

                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={newProduct.brand}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Apple"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={handleChange}
                    required
                  >
                    {productCategories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.label || cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Storage</label>
                  <input
                    type="text"
                    name="storage"
                    value={newProduct.storage}
                    onChange={handleChange}
                    placeholder="e.g. 128GB"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Colour</label>
                  <input
                    type="text"
                    name="color"
                    value={newProduct.color}
                    onChange={handleChange}
                    placeholder="e.g. Black Titanium"
                  />
                </div>

                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity (QTY)</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={newProduct.stock_quantity}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={generateSku(
                      newProduct.brand,
                      newProduct.name,
                      newProduct.storage,
                      newProduct.color
                    )}
                    disabled
                    placeholder="Auto-generated"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Product description..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="submit-btn">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;