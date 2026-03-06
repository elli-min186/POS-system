import {
  ShoppingCart,
  Store,
  LayoutGrid,
  DollarSign,
  Boxes
} from "lucide-react";
import { Link } from "react-router-dom";

function Sidebar({
  time,
  showCategories = false,
  categories = [],
  selectedCategory = "all",
  onCategoryChange = () => {},
  activePage = "home"
}) {
  return (
    <aside className="sidebar">
      <div>
        <div className="logo-area">
          <div className="logo-icon">
            {activePage === "home" ? <ShoppingCart size={20} /> : <Store size={20} />}
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
          <li className={activePage === "home" ? "active" : ""}>
            <Link to="/" className="nav-link">
              <LayoutGrid size={18} />
              Home
            </Link>
          </li>

          <li className={activePage === "earnings" ? "active" : ""}>
            <Link to="/earnings" className="nav-link">
              <DollarSign size={18} />
              Earnings
            </Link>
          </li>

          <li className={activePage === "inventory" ? "active" : ""}>
            <Link to="/inventory" className="nav-link">
              <Boxes size={18} />
              Inventory
            </Link>
          </li>


          <li className={activePage === "addItem" ? "active" : ""}>
            <Link to="/addItem" className="nav-link">
              <Boxes size={18} />
              Add 
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
