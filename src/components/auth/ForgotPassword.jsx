import { useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetUrl('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    const response = await userService.forgotPassword(email);
    setLoading(false);

    if (!response.success) {
      setError(response.message || 'Unable to send reset email. Please try again.');
      return;
    }

    setSuccess('If that email exists in our system, a reset link has been sent.');
    setResetUrl(response.resetUrl || '');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Forgot password?</h2>
        <p className="auth-subtitle">
          Enter your email address to receive a password reset link.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {resetUrl && (
          <div className="alert alert-success">
            Development reset link: <a href={resetUrl}>{resetUrl}</a>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="form-control mb-4"
          />

          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <div className="auth-links mt-4 text-center">
            <Link to="/login" className="link-secondary">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
