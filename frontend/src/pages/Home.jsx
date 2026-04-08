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
  ShoppingCart,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import "../css/home.css";
import Header from "../components/Header";
import { socket } from '../socket';

// Retrieve user role (may be used for conditional permissions)
const role = localStorage.getItem("role") || "worker";

function Home() {
  const TAX_RATE = 0.13;

  // ---------------- STATE ----------------
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUserPassword, setNewUserPassword] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [users, setUsers] = useState([]);
  const groupedUsers = {
    owner: [],
    manager: [],
    worker: []
  };

  users.forEach((u) => {
    if (groupedUsers[u.role]) {
      groupedUsers[u.role].push(u);
    }
  });

  // ---------------- FETCH PRODUCTS ----------------
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/items");
      const data = await res.json();
      setAllProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // ---------------- SOCKET & INITIAL FETCH ----------------
  useEffect(() => {
    fetchItems();

    // Connect to the socket server
    socket.connect();

    // Listener function
    function onInventoryUpdated() {
      console.log("External inventory change detected. Refreshing...");
      fetchItems();
    }

    // Subscribe to the event
    socket.on('inventoryUpdated', onInventoryUpdated);

    // CLEANUP: Unsubscribe and disconnect when user leaves the page
    return () => {
      socket.off('inventoryUpdated', onInventoryUpdated);
      socket.disconnect();
    };
  }, []);

  // ---------------- FILTER LOGIC ----------------
  // Filters products based on search text and selected category
  useEffect(() => {
    const filtered = allProducts.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_id?.toString().includes(searchTerm);

      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, allProducts]);

  // ---------------- CATEGORY CHANGE ----------------
  // Triggered when selecting a category from sidebar
  const filterCategory = (category) => {
    setSelectedCategory(category);
  };

  // ---------------- ADD TO CART ----------------
  // Adds a product to the cart, respecting stock limits
  const addToCart = (product) => {
    const existing = cart.find(
      (item) => item.product_id === product.product_id
    );

    const currentQty = existing ? existing.quantity : 0;

    // Prevent overselling
    if (currentQty >= product.stock_quantity) {
      alert("Not enough stock available");
      return;
    }

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

  // ---------------- REMOVE ITEM ----------------
  // Removes a product entirely from the cart
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // ---------------- UPDATE QUANTITY ----------------
  // Increases or decreases product quantity
  const updateQuantity = (product_id, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product_id === product_id) {
            const newQty = item.quantity + change;

            // Remove item completely if quantity <= 0
            if (newQty <= 0) return null;

            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // ------------- USER MANAGEMENT ---------------
  useEffect(() => {
    const openModal = async () => {
      setShowUserModal(true);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8080/api/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setUsers(data);
    };

    window.addEventListener("openUserModal", openModal);

    return () => window.removeEventListener("openUserModal", openModal);
  }, []);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("worker");

  const handleCreateUser = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8080/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        username: newUsername,
        password: newPassword,
        role: newRole
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("User created successfully!");
      setShowUserModal(false);
      setNewUsername("");
      setNewPassword("");
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
  }
  };

  const handleDeleteUser = async (id, username) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (username === currentUser.username) {
      alert("You cannot delete yourself");
      return;
    }

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8080/api/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setUsers(users.filter(u => u._id !== id));
    setConfirmDeleteId(null); // reset after delete
  };

  const handleUpdatePassword = async (id) => {
    if (!newUserPassword) {
      alert("Enter a password first");
      return;
    }

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8080/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ password: newUserPassword })
    });

    alert("Password updated");

    setEditingUserId(null);
    setNewUserPassword("");
  };


  // ---------------- CLEAR CART ----------------
  const clearCart = () => setCart([]);

  // ---------------- TOTAL CALCULATIONS ----------------
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // ---------------- CHECKOUT ----------------
  // Creates an invoice and completes the transaction
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    const token = localStorage.getItem("token");

    // Re-verify stock levels before processing
    for (let item of cart) {
      if (item.quantity > item.stock_quantity) {
        alert(`${item.name} is out of stock`);
        return;
      }
    }

    const invoiceData = {
      items: cart,
      subtotal: subtotal,
      tax: tax,
      total: total,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:8080/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Checkout failed");
        return;
      }

      alert("Payment successful! Invoice created.");
      clearCart();
      await fetchItems();
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  // ---------------- CATEGORY LIST ----------------
  const categories = [
    { name: "all", label: "All Items", icon: <LayoutGrid size={18} /> },
    { name: "Laptops", icon: <Laptop size={18} /> },
    {
      name: "Smartphones",
      label: "Phones",
      icon: <TabletSmartphone size={18} />,
    },
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
    { name: "Drones", icon: <Drone size={18} /> },
  ];

  // ---------------- UI ----------------
  return (
    <div className="container">
      <Sidebar
        showCategories={true}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={filterCategory}
        activePage="home"
      />

      <main className="main-content">
        <Header
          title={selectedCategory === "all" ? "All Items" : selectedCategory}
          tagText={filteredProducts.length + " items"}
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

      {/* ---------------- ORDER PANEL ---------------- */}
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
                <ShoppingCart />
              </div>
              <p>No items in order</p>
              <small>Tap products to add them here</small>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-details">
                  <strong>{item.name}</strong>

                  {/* Quantity Controls (Increment + Decrement) */}
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product_id, -1)}
                    >
                      −
                    </button>

                    <span className="qty-value">{item.quantity}</span>

                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product_id, 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-math">
                    ${item.price.toFixed(2)} each
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

        {/* ---------------- TOTAL SECTION ---------------- */}
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

      {/* ---------------- USER MODAL ---------------- */}
      {showUserModal && (
      <div className="user-modal-overlay">
        <div className="user-modal-card">
          <h2>Create User</h2>

          <input
            type="text"
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="worker">Worker</option>
            <option value="manager">Manager</option>
          </select>

          {/* ACTION BUTTONS */}
          <div className="user-modal-actions">
            <button className="submit-btn" onClick={handleCreateUser}>
              Create
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowUserModal(false)}
            >
              Cancel
            </button>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <h3>Users</h3>

          {/* OWNER */}
          {groupedUsers.owner.length > 0 && (
            <>
              <p style={{ fontWeight: "bold", marginTop: "10px" }}>Owner</p>
              {groupedUsers.owner.map((u) => (
                <div className="user-row" key={u._id}>
                  <span>{u.username}</span>
                </div>
              ))}
            </>
          )}

          {/* MANAGERS */}
          {groupedUsers.manager.length > 0 && (
            <>
              <p style={{ fontWeight: "bold", marginTop: "10px" }}>Managers</p>
              {groupedUsers.manager.map((u) => (
                <div className="user-row" key={u._id}>
                  <span>{u.username}</span>

                  <div className="user-actions">
                    {editingUserId === u._id ? (
                      <>
                        <input
                          type="password"
                          placeholder="New password"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          className="password-inline-input"
                        />

                        <button
                          className="save-btn"
                          onClick={() => handleUpdatePassword(u._id)}
                        >
                          Save
                        </button>

                        <button
                          className="cancel-btn-small"
                          onClick={() => {
                            setEditingUserId(null);
                            setNewUserPassword("");
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="secondary-btn"
                          onClick={() => setEditingUserId(u._id)}
                        >
                          Reset
                        </button>

                        {confirmDeleteId === u._id ? (
                          <>
                            <button
                              className="danger-btn"
                              onClick={() => handleDeleteUser(u._id, u.username)}
                            >
                              Confirm
                            </button>

                            <button
                              className="cancel-btn-small"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="danger-btn"
                            onClick={() => setConfirmDeleteId(u._id)}
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* WORKERS */}
          {groupedUsers.worker.length > 0 && (
            <>
              <p style={{ fontWeight: "bold", marginTop: "10px" }}>Workers</p>
              {groupedUsers.worker.map((u) => (
                <div className="user-row" key={u._id}>
                  <span>{u.username}</span>

                  <div className="user-actions">
                    {editingUserId === u._id ? (
                      <>
                        <input
                          type="password"
                          placeholder="New password"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          className="password-inline-input"
                        />

                        <button
                          className="save-btn"
                          onClick={() => handleUpdatePassword(u._id)}
                        >
                          Save
                        </button>

                        <button
                          className="cancel-btn-small"
                          onClick={() => {
                            setEditingUserId(null);
                            setNewUserPassword("");
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="secondary-btn"
                          onClick={() => setEditingUserId(u._id)}
                        >
                          Reset
                        </button>
                        
                        {confirmDeleteId === u._id ? (
                          <>
                            <button
                              className="danger-btn"
                              onClick={() => handleDeleteUser(u._id, u.username)}
                            >
                              Confirm
                            </button>

                            <button
                              className="cancel-btn-small"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="danger-btn"
                            onClick={() => setConfirmDeleteId(u._id)}
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    )}
    </div>
  );
}

export default Home;
