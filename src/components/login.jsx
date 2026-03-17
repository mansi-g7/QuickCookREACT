import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import "./Auth.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const response = await userService.login(form.email, form.password);
    setLoading(false);

    if (!response.success) {
      setError(response.message || "Login failed.");
      return;
    }

    setSuccess("Login successful!");
    navigate("/profile");
  };

  return (
    <div className="auth-container">

      {/* LEFT SIDE */}
      <div className="auth-left">

        {/* LOGO */}
        <div className="auth-logo">
          <div className="logo-box">🍳</div>
          <span>QuickCook</span>
        </div>

        <h2>Welcome Back!</h2>
        <p>Sign in to access your saved recipes and reviews.</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit">
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <div className="auth-footer">
          Don’t have an account? <Link to="/register">Sign Up Free</Link>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="overlay">
          <h1>Cooking is love made visible.</h1>
          <p>
            Cooking is like painting or writing a song. It’s how you combine
            flavors that sets you apart.
          </p>

          <div className="stats">
            <div>
              <h3>50k+</h3>
              <span>Active Users</span>
            </div>
            <div>
              <h3>120k</h3>
              <span>Recipes Shared</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;