import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../../services/api";
import "./Auth.css";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const newErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    } else if (form.password.length > 50) {
      newErrors.password = "Password is too long (max 50 characters).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const response = await userService.login(form.email, form.password);
    setLoading(false);

    if (!response.success) {
      setSubmitError(response.message || "Login failed.");
      return;
    }

    navigate("/");
  };

  return (
    <div className="auth-container">

      {/* LEFT SIDE */}
      <div className="auth-left">

        {/* LOGO */}
        <div className="auth-logo">
          <img
            src="/images/QuickCookLogo.png"
            alt="QuickCook Logo"
            className="auth-logo-image"
          />
          <span>QuickCook</span>
        </div>

        <h2>Welcome Back!</h2>
        <p>Sign in to access your saved recipes and reviews.</p>

        {submitError && <div className="alert alert-danger">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'is-invalid' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'is-invalid' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="auth-forgot-row">
            <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
          </div>

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