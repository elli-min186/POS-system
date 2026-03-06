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
  Drone
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import "../css/home.css";

function AddItem() {
  const [time, setTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [message, setMessage] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      name,
      brand,
      sku,
      category,
      price: Number(price),
      stock_quantity: Number(stockQuantity)
    };

    fetch("http://localhost:8080/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newItem)
    })
      .then((res) => res.json())
      .then(() => {
        setMessage("Item added successfully!");

        setName("");
        setBrand("");
        setSku("");
        setCategory("");
        setPrice("");
        setStockQuantity("");
      })
      .catch((err) => {
        console.error("Error adding item:", err);
        setMessage("Failed to add item.");
      });
  };

  return (
    <div className="container">
      <Sidebar
        time={time}
        showCategories={true}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        activePage="add"
      />

      <main className="main-content">
        <header className="top-bar">
          <div className="header-left">
            <h1>Add Item</h1>
            <span className="tag">Create new product</span>
          </div>

          <div className="header-right">
            <span>{time}</span>
          </div>
        </header>

        <div className="modal-content" style={{ margin: "0 auto" }}>
          <div className="modal-header">
            <h3>New Product</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                placeholder="Enter item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Brand</label>
                <input
                  type="text"
                  placeholder="Enter brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>SKU</label>
                <input
                  type="text"
                  placeholder="Enter SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Tablets">Tablets</option>
                  <option value="Accessories">Accessories</option>
                  <option value="E-Readers">E-Readers</option>
                  <option value="Audio">Audio</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Monitors">Monitors</option>
                  <option value="Cameras">Cameras</option>
                  <option value="Storage">Storage</option>
                  <option value="Smart Home">Smart Home</option>
                  <option value="Networking">Networking</option>
                  <option value="Drones">Drones</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Price</label>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                placeholder="Enter stock quantity"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="submit-btn">
                Add Item
              </button>
            </div>

            {message && (
              <p style={{ marginTop: "15px", color: "#2563eb", fontWeight: "500" }}>
                {message}
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddItem;
