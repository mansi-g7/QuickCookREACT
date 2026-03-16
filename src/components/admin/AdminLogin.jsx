import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './AdminLogin.css';

const AdminLogin = ({ setIsAdminLoggedIn, setAdminName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      // Call API to login
      const response = await authService.login(username, password);
      
      if (response.success) {
        // Token is already stored in localStorage by authService.login()
        // Just update local state and navigate
        localStorage.setItem('adminLoggedIn', 'true');
        
        // Update parent state
        setIsAdminLoggedIn(true);
        setAdminName(response.user.username);
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server. Make sure backend is running on port 5000.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-wrapper">
        <div className="login-box">
          {/* Header */}
          <div className="login-header mb-5 text-center">
            <div className="admin-icon mb-3">
              <i className="bi bi-shield-lock"></i>
            </div>
            <h1 className="fw-bold text-danger mb-2">QuickCook Admin</h1>
            <p className="text-muted">Login to access the admin dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            {/* Username Field */}
            <div className="mb-4">
              <label htmlFor="username" className="form-label fw-semibold text-dark">
                <i className="bi bi-person me-2"></i>Username
              </label>
              <input
                type="text"
                className="form-control form-control-lg border-warning shadow-sm"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold text-dark">
                <i className="bi bi-lock me-2"></i>Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg border-warning shadow-sm"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-danger btn-lg w-100 fw-bold rounded-pill shadow-sm mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>Login
                </>
              )}
            </button>

           
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
