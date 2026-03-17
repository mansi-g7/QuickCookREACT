import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import "./Login.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    address: "",
    password: "",
    confirmPassword: "",
    profilePicture: null,
    terms: false
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateMobile = (mobile) =>
    /^\d{10}$/.test(mobile);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, profilePicture: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required");
    if (!validateEmail(form.email)) return setError("Invalid email");
    if (!validateMobile(form.mobile)) return setError("Mobile must be 10 digits");
    if (!form.gender) return setError("Select gender");
    if (!form.address.trim()) return setError("Address required");
    if (form.password.length < 6) return setError("Password min 6 chars");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");
    if (!form.terms) return setError("Accept terms & conditions");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("mobile", form.mobile);
    formData.append("gender", form.gender);
    formData.append("address", form.address);
    formData.append("password", form.password);

    if (form.profilePicture) {
      formData.append("profilePicture", form.profilePicture);
    }

    setLoading(true);
    const response = await userService.register(formData);
    setLoading(false);

    if (!response.success) {
      setError(response.message || "Registration failed");
      return;
    }

    navigate("/profile");
  };

  return (
    <div className="auth-container">

      {/* LEFT */}
      <div className="auth-left">

        <div className="auth-logo">
          <div className="logo-box">🍳</div>
          <span>QuickCook</span>
        </div>

        <h2>Create Account</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          <input name="name" placeholder="Full Name" onChange={handleChange} />

          <input name="email" placeholder="Email" onChange={handleChange} />

          <input name="mobile" placeholder="Mobile Number" onChange={handleChange} />

          {/* ROW */}
          <div className="row-group">
            <select name="gender" onChange={handleChange}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <textarea name="address" placeholder="Address" onChange={handleChange}/>
          </div>

          <input type="password" name="password" placeholder="Password" onChange={handleChange} />

          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />

          <input type="file" name="profilePicture" onChange={handleChange} />

          {/* TERMS */}
          <div className="terms">
            <input type="checkbox" name="terms" onChange={handleChange}/>
            <label>I agree to Terms & Conditions</label>
          </div>

          <button type="submit">
            {loading ? "Creating..." : "Sign Up"}
          </button>

        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>

      </div>

      {/* RIGHT */}
      <div className="auth-right"></div>

    </div>
  );
};

export default Register;