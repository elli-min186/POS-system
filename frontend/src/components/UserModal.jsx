import { useEffect, useState } from "react";

function UserModal() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUserPassword, setNewUserPassword] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [users, setUsers] = useState([]);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("worker");

  const groupedUsers = {
    owner: [],
    manager: [],
    worker: [],
  };

  users.forEach((u) => {
    if (groupedUsers[u.role]) {
      groupedUsers[u.role].push(u);
    }
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8080/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    const openModal = async () => {
      setShowUserModal(true);
      setEditingUserId(null);
      setNewUserPassword("");
      setConfirmDeleteId(null);
      await fetchUsers();
    };

    window.addEventListener("openUserModal", openModal);
    return () => window.removeEventListener("openUserModal", openModal);
  }, []);

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("User created successfully!");
        setNewUsername("");
        setNewPassword("");
        setNewRole("worker");
        await fetchUsers();
      } else {
        alert(data.error || "Failed to create user");
      }
    } catch (err) {
      console.error("Create user error:", err);
    }
  };

  const handleDeleteUser = async (id, username) => {
    let currentUser = null;
  
    try {
      currentUser = JSON.parse(localStorage.getItem("user"));
    } catch {
      currentUser = null;
    }
  
    const currentUsername =
      localStorage.getItem("username") || currentUser?.username;
  
    if (username === currentUsername) {
      alert("You cannot delete yourself");
      return;
    }

  try {

    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((u) => u._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  const handleUpdatePassword = async (id) => {
    if (!newUserPassword) {
      alert("Enter a password first");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newUserPassword }),
      });

      alert("Password updated");
      setEditingUserId(null);
      setNewUserPassword("");
    } catch (err) {
      console.error("Update password error:", err);
    }
  };

  // ✅ FIXED RETURN
  if (!showUserModal) return null;

  return (
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

        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="worker">Worker</option>
          <option value="manager">Manager</option>
        </select>

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
                        className="password-inline-input"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                      />
                      <button className="save-btn" onClick={() => handleUpdatePassword(u._id)}>Save</button>
                      <button className="cancel-btn-small" onClick={() => setEditingUserId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        className="secondary-btn"
                        onClick={() => {
                          setEditingUserId(
                            editingUserId === u._id ? null : u._id
                          );
                          setNewUserPassword("");
                        }}
                      >
                        Reset
                      </button>

                      {confirmDeleteId === u._id ? (
                        <>
                          <button className="danger-btn" onClick={() => handleDeleteUser(u._id, u.username)}>Confirm</button>
                          <button className="cancel-btn-small" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="danger-btn" onClick={() => setConfirmDeleteId(u._id)}>Delete</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

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
                        className="password-inline-input"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                      />
                      <button className="save-btn" onClick={() => handleUpdatePassword(u._id)}>Save</button>
                      <button className="cancel-btn-small" onClick={() => setEditingUserId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        className="secondary-btn"
                        onClick={() => {
                          setEditingUserId(
                            editingUserId === u._id ? null : u._id
                          );
                          setNewUserPassword("");
                        }}
                      >
                        Reset
                      </button>

                      {confirmDeleteId === u._id ? (
                        <>
                          <button className="danger-btn" onClick={() => handleDeleteUser(u._id, u.username)}>Confirm</button>
                          <button className="cancel-btn-small" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="danger-btn" onClick={() => setConfirmDeleteId(u._id)}>Delete</button>
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
  );
}

export default UserModal;
