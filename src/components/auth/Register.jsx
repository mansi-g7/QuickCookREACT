import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../../services/api";
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

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateMobile = (mobile) =>
    /^\d{10}$/.test(mobile);

  const validatePassword = (password) => {
    // Password must be at least 8 characters
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    // Must contain at least one number
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    // Must contain at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*).";
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, profilePicture: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const newErrors = {};

    // Field-level validations
    if (!form.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!form.email) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.mobile) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!validateMobile(form.mobile)) {
      newErrors.mobile = "Mobile must be 10 digits.";
    }

    if (!form.gender) {
      newErrors.gender = "Please select a gender.";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required.";
    } else if (form.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else {
      const passwordError = validatePassword(form.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!form.terms) {
      newErrors.terms = "You must accept Terms & Conditions.";
    }

    // If there are errors, display them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
      setSubmitError(response.message || "Registration failed");
      return;
    }

    // After successful registration, automatically log in the user
    navigate("/");
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

        {submitError && <div className="alert alert-danger">{submitError}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>

          <div>
            <input 
              name="name" 
              placeholder="Full Name" 
              onChange={handleChange}
              className={errors.name ? 'is-invalid' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div>
            <input 
              name="email" 
              placeholder="Email" 
              onChange={handleChange}
              className={errors.email ? 'is-invalid' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div>
            <input 
              name="mobile" 
              placeholder="Mobile Number" 
              onChange={handleChange}
              className={errors.mobile ? 'is-invalid' : ''}
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          {/* ROW */}
          <div className="row-group">
            <div>
              <select 
                name="gender" 
                onChange={handleChange}
                className={errors.gender ? 'is-invalid' : ''}
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>

            <div>
              <textarea 
                name="address" 
                placeholder="Address" 
                onChange={handleChange}
                className={errors.address ? 'is-invalid' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              onChange={handleChange}
              className={errors.password ? 'is-invalid' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div>
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              onChange={handleChange}
              className={errors.confirmPassword ? 'is-invalid' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <input type="file" name="profilePicture" onChange={handleChange} />

          {/* TERMS */}
          <div className="terms">
            <input 
              type="checkbox" 
              name="terms" 
              onChange={handleChange}
            />
            <label>I agree to Terms & Conditions</label>
            {errors.terms && <span className="error-text">{errors.terms}</span>}
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