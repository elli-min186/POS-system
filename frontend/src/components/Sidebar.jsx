import {
  Store,
  LayoutGrid,
  DollarSign,
  Boxes,
  ReceiptText,
  ShoppingCart
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Sidebar({
  showCategories = false,
  categories = [],
  selectedCategory = "all",
  onCategoryChange = () => { },
  activePage = "home"
}) {

  const role = localStorage.getItem("role") || "worker";

  const [time, setTime] = useState("");
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

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-area">
          <div className="logo-icon">
            {activePage === "home" ? (
              <ShoppingCart size={20} />
            ) : (
              <Store size={20} />
            )}
            <Store size={20} />
          </div>

          <div>
            <h2>TechPOS</h2>
            <span className="subtitle">{time}</span>
          </div>
        </div>

        {showCategories && (
          <nav className="categories">
            <h3>CATEGORIES</h3>

            <ul>
              {categories.map((cat) => (
                <li
                  key={cat.name}
                  className={selectedCategory === cat.name ? "active" : ""}
                  onClick={() => onCategoryChange(cat.name)}
                >
                  {cat.icon}
                  {cat.label || cat.name}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <div className="sidebar-bottom">
        <h3>NAVIGATION</h3>

        <ul>
          {/* Home (everyone) */}
          <li className={activePage === "home" ? "active" : ""}>
            <Link to="/" className="nav-link">
              <LayoutGrid size={18} />
              Home
            </Link>
          </li>

          {/* Inventory (Manager + Owner) */}
          {(role === "manager" || role === "owner") && (
            <li className={activePage === "inventory" ? "active" : ""}>
              <Link to="/inventory" className="nav-link">
                <Boxes size={18} />
                Inventory
              </Link>
            </li>
          )}

          {/* Invoices (Manager + Owner) */}
          {(role === "manager" || role === "owner") && (
            <li className={activePage === "invoices" ? "active" : ""}>
              <Link to="/invoices" className="nav-link">
                <ReceiptText size={18} />
                Invoices
              </Link>
            </li>
          )}

          {/* Earnings (OWNER ONLY) */}
          {role === "owner" && (
            <li className={activePage === "earnings" ? "active" : ""}>
              <Link to="/earnings" className="nav-link">
                <DollarSign size={18} />
                Earnings
              </Link>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;