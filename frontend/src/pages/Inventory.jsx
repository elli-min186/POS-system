import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ProductCard from "../components/ProductCard";
import "../css/home.css";

function Inventory() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
    fetchItems();
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
    const filtered = items.filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const fetchItems = () => {
    setLoading(true);

    fetch("http://localhost:8080/api/items")
      .then((res) => res.json())
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
        setItems(safeData);
        setFilteredItems(safeData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/items/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setItems((prev) => prev.filter((item) => item.product_id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item");
    }
  };

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

      if (!response.ok) {
        throw new Error(data.error || "Failed to add item");
      }

      setItems((prev) => [...prev, data]);

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
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error.message || "Failed to add item");
    }
  };

  const inventoryCategories = [
    "Smartphones",
    "Laptops",
    "Tablets",
    "Accessories",
    "E-Readers",
    "Audio",
    "Wearables",
    "Gaming",
    "Monitors",
    "Cameras",
    "Storage",
    "Smart Home",
    "Networking",
    "Drones"
  ];

  return (
    <div className="container">
      <Sidebar
        time={time}
        showCategories={false}
        activePage="inventory"
      />

      <main className="main-content">
        <header className="top-bar">
          <div className="header-left">
            <h1>Inventory</h1>
            <span className="tag">{filteredItems.length} items</span>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="header-right">
            <button
              className="checkout-btn inventory-add-btn"
              onClick={() => setShowModal(true)}
              type="button"
            >
              <Plus size={18} />
              Add New Product
            </button>
          </div>
        </header>

        {loading ? (
          <div className="empty-state">
            <p>Loading inventory...</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.product_id ?? item._id}
                item={item}
              >
                <button
                  className="delete-btn inventory-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.product_id);
                  }}
                  type="button"
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
              </ProductCard>
            ))}
          </div>
        )}
      </main>

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
                    {inventoryCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
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
                  <label>Color</label>
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
                  <label>Stock Qty</label>
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

export default Inventory;