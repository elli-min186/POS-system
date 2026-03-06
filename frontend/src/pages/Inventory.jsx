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
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
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
