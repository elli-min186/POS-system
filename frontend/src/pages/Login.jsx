import { useState } from "react";
import { Store, EyeOff, Eye } from "lucide-react";
import "../css/login.css";
import loginImage from "../assets/login.jpg";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch (err) {
      setError("Server is not responding. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-column">
        <div className="login-header">
          <div className="logo-icon">
            <Store />
          </div>
          <h1>TechPOS</h1>
          <p>Sign in to your account</p>
        </div>

        <div className="login-card">
          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>

      <div className="login-illustration-column">
        <img src={loginImage} alt="TechPOS Login Illustration" />
      </div>
    </div>
  );
}

export default Login;
