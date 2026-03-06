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
} 
from "lucide-react";
import InventoryCard from "../components/InventoryCard";
import Sidebar from "../components/Sidebar";
import "../css/home.css";

function Inventory() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
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

  const filteredItems = items.filter((item) => {
    return selectedCategory === "all" || item.category === selectedCategory;
  });

  const deleteItem = (id) => {
    fetch(`http://localhost:8080/api/items/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        setItems(items.filter((item) => item.product_id !== id));
      })
      .catch((err) => console.error("Error deleting item:", err));
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

          <div className="header-right">
            <span>{time}</span>
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
                onDelete={deleteItem}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Inventory;