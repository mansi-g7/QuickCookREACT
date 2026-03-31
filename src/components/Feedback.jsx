import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feedback.css';
import { initialFeedbackFormData, validateFeedbackForm } from './feedbackValidation';
import { feedbackService } from '../services/api';

const Feedback = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFeedbackFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A high-quality, professional culinary background image
  const imageUrl = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=2070";

  const leftPanelStyle = {
    // Note: Use double quotes inside the url() to handle the complex online URL
    backgroundImage: `linear-gradient(rgba(183, 28, 28, 0.85), rgba(183, 28, 28, 0.85)), url("${imageUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingSelect = (emoji) => {
    setFormData((prev) => ({
      ...prev,
      rating: emoji
    }));

    if (errors.rating) {
      setErrors((prev) => ({
        ...prev,
        rating: ''
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    const userToken = localStorage.getItem('token');
    if (!userToken) {
      setSubmitError('Please login first to send feedback.');
      navigate('/login');
      return;
    }

    const validationErrors = validateFeedbackForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitted(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await feedbackService.submitFeedback(formData);

      if (!result.success) {
        setIsSubmitted(false);
        setSubmitError(result.message || 'Failed to submit feedback. Please try again.');
        return;
      }

      setErrors({});
      setIsSubmitted(true);
      setFormData(initialFeedbackFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container my-5 feedback-container">
      <div className="card shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <div className="row g-0">
          
          {/* Left Panel with Online Image */}
          <div className="col-md-5 d-flex flex-column justify-content-center align-items-center text-white p-5 text-center" 
               style={leftPanelStyle}>
            <div className="mb-4" style={{ fontSize: '4rem' }}>👨‍🍳</div>
            <h2 className="fw-bold display-6 mb-3">QuickCook</h2>
            <p className="lead" style={{ opacity: '0.9' }}>
              Your feedback is the secret ingredient to our success! 
            </p>
            <hr className="w-25 border-2 mt-4" style={{ borderColor: '#ffc107' }} />
          </div>

          {/* Right Form Panel */}
          <div className="col-md-7 p-5 bg-light">
            <h3 className="fw-bold mb-4" style={{ color: '#d32f2f' }}>Rate Your Experience</h3>

            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small text-uppercase" htmlFor="feedbackName">Your Name</label>
                  <input
                    id="feedbackName"
                    name="name"
                    type="text"
                    className={`form-control feedback-input p-3 ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <div className="error-text mt-1">{errors.name}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small text-uppercase" htmlFor="feedbackEmail">Email Address</label>
                  <input
                    id="feedbackEmail"
                    name="email"
                    type="email"
                    className={`form-control feedback-input p-3 ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <div className="error-text mt-1">{errors.email}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-uppercase">How was the experience?</label>
                <div className="d-flex justify-content-between p-3 bg-white shadow-sm" style={{ borderRadius: '10px' }}>
                  {['😞', '😐', '🙂', '😊', '😍'].map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`btn emoji-btn fs-2 p-0 ${formData.rating === emoji ? 'active' : ''}`}
                      onClick={() => handleRatingSelect(emoji)}
                      aria-label={`Rate ${index + 1}`}
                      aria-pressed={formData.rating === emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {errors.rating && <div className="error-text mt-1">{errors.rating}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-uppercase" htmlFor="feedbackMessage">Message</label>
                <textarea
                  id="feedbackMessage"
                  name="message"
                  className={`form-control feedback-input p-3 ${errors.message ? 'is-invalid' : ''}`}
                  rows="3"
                  placeholder="What can we improve?"
                  value={formData.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                ></textarea>
                {errors.message && <div className="error-text mt-1">{errors.message}</div>}
              </div>

              {isSubmitted && (
                <div className="alert alert-success py-2" role="alert">
                  Thanks for your feedback. We appreciate your time.
                </div>
              )}

              {submitError && (
                <div className="alert alert-danger py-2" role="alert">
                  {submitError}
                </div>
              )}

              <button type="submit" className="btn submit-btn fw-bold w-100 py-3 text-white" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Feedback 🚀'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;