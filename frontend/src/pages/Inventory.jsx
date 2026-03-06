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
  Plus
} from "lucide-react";
import InventoryCard from "../components/InventoryCard";
import Sidebar from "../components/Sidebar";
import "../css/home.css";

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    category: "",
    storage: "",
    color: "",
    price: "",
    stock_quantity: "",
    description: ""
  });

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

  const fetchItems = () => {
    setLoading(true);

    fetch("http://localhost:8080/api/items")
      .then((res) => res.json())
      .then((data) => {
        const safeItems = Array.isArray(data) ? data : [];
        setItems(safeItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
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

  const inventoryCategories = categories.filter((cat) => cat.name !== "all");

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name || "",
      brand: item.brand || "",
      category: item.category || "",
      storage: item.storage || "",
      color: item.color || "",
      price: item.price ?? "",
      stock_quantity: item.stock_quantity ?? "",
      description: item.description || ""
    });
  };

  const confirmDeleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/items/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete item");
      }

      setItems((prev) => prev.filter((item) => item.product_id !== id));

      if (selectedItem && selectedItem.product_id === id) {
        setSelectedItem(null);
        setEditForm({
          name: "",
          brand: "",
          category: "",
          storage: "",
          color: "",
          price: "",
          stock_quantity: "",
          description: ""
        });
      }

      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert(err.message || "Failed to delete item");
    }
  };

  const handleChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
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

  const updateItem = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/items/${selectedItem.product_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...editForm,
            price: Number(editForm.price),
            stock_quantity: Number(editForm.stock_quantity)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update item");
      }

      setItems((prev) =>
        prev.map((item) =>
          item.product_id === selectedItem.product_id ? data : item
        )
      );

      setSelectedItem(data);
      setEditForm({
        name: data.name || "",
        brand: data.brand || "",
        category: data.category || "",
        storage: data.storage || "",
        color: data.color || "",
        price: data.price ?? "",
        stock_quantity: data.stock_quantity ?? "",
        description: data.description || ""
      });

      alert("Item updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      alert(error.message || "Failed to update item");
    }
  };

  return (
    <div className="container">
      <Sidebar
        time={time}
        showCategories={true}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
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
          <p>Loading inventory...</p>
        ) : (
          <div className="product-grid">
            {filteredItems.map((item) => (
              <InventoryCard
                key={item.product_id}
                item={item}
                onClick={() => handleSelectItem(item)}
                onDelete={(id, name) => setItemToDelete({ id, name })}
              />
            ))}
          </div>
        )}
      </main>

      <aside className="order-panel">
        {selectedItem ? (
          <>
            <div className="order-header">
              <h3>Edit Product</h3>
            </div>

            <div className="order-list">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={editForm.brand}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                >
                  {inventoryCategories.map((cat) => (
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
                  value={editForm.storage}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={editForm.color}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={editForm.stock_quantity}
                  onChange={handleEditChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>SKU</label>
                <input type="text" value={selectedItem.sku || ""} disabled />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows="4"
                />
              </div>
            </div>

            <div className="order-total-section">
              <button
                className="checkout-btn"
                type="button"
                onClick={updateItem}
              >
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="order-header">
              <h3>Product Details</h3>
            </div>

            <div className="order-list">
              <div className="empty-state">
                <p>Select a product card</p>
                <small>View and edit product details here</small>
              </div>
            </div>
          </>
        )}
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
                    {inventoryCategories.map((cat) => (
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

      {itemToDelete && (
        <div className="modal">
          <div className="modal-content confirm-modal">
            <div className="modal-header">
              <h3>Delete Product</h3>

              <span
                className="close-modal"
                onClick={() => setItemToDelete(null)}
              >
                &times;
              </span>
            </div>

            <p className="confirm-text">
              Are you sure you want to delete{" "}
              <strong>{itemToDelete.name}</strong>?
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="submit-btn delete-confirm-btn"
                onClick={() => confirmDeleteItem(itemToDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;