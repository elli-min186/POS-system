import { useState } from "react";
import { Store, EyeOff, Eye } from "lucide-react";
import "../css/login.css"
import loginImage from "../assets/login.jpg"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Login() {

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

     // 1. Check for session expiration
    useEffect(() => {
        if (localStorage.getItem("sessionExpired") === "true") {
            setError("Your session has expired. Please log in again.");
            localStorage.removeItem("sessionExpired");
        }
    }, []);


    // 2. Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. The Submit Function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset error

        try {
            const response = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // SUCCESS: Save the token and user info
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.user.role);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                // Redirect to home
                window.location.href = "/"; 
            } else {
                // FAIL: Show the error from your backend
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Server is not responding. Is it running?");
        }
    };

    return (
        <div className="login-page">
            <div className="login-form-column">
                <div className="login-header">
                    <div className="logo-icon"><Store /></div>
                    <h1>TechPOS</h1>
                    <p>Sign in to your account</p>
                </div>

                <div className="login-card">
                    {/* Display Error Message if it exists */}
                    {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Username"
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
};

export default Login;

