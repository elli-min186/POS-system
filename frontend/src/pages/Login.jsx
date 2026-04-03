import { useState } from "react";
import { Store, EyeOff, Eye } from "lucide-react";
import "../css/login.css"
import loginImage from "../assets/login.jpg"

function Login() {

    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <div className="login-page">
            {/* Form Column */}
            <div className="login-form-column">

                <div className="login-header">
                    <div className="logo-icon">
                        <Store />
                    </div>
                    <h1>TechPOS</h1>
                    <p>Sign in to your account</p>
                </div>

                {/* Central Form Card */}
                <div className="login-card">
                    <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="username"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        {/* Password Field with Toggle */}
                        <div className="form-group password-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    required
                                />
                                {/* Password Toggle Button/Icon */}
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                                >
                                    {/* Eye Icon (Hide) */}
                                    {passwordVisible &&
                                        <Eye />
                                    }
                                    {/* Eye-Slash Icon (Show) */}
                                    {!passwordVisible &&
                                        <EyeOff />
                                    }
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">
                            Sign In
                        </button>
                    </form>
                </div>
            </div>

            {/* Illustration Column */}
            <div className="login-illustration-column">
                <img src={loginImage} alt="TechPOS Login Illustration" />
            </div>
        </div>
    );
};

export default Login;