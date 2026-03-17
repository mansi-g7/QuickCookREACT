import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset link is missing or invalid.');
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const response = await userService.resetPassword(token, form.password, form.confirmPassword);
    setLoading(false);

    if (!response.success) {
      setError(response.message || 'Failed to reset password.');
      return;
    }

    setSuccess('Password reset successful! Redirecting to login...');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset password</h2>
        <p className="auth-subtitle">
          Choose a new password to secure your account.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
            className="form-control mb-3"
          />

          <label className="form-label" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="••••••••"
            className="form-control mb-4"
          />

          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Reset password'}
          </button>

          <div className="auth-links mt-4 text-center">
            <Link to="/login" className="link-secondary">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
