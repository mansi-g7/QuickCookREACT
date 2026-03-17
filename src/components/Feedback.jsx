import React from 'react';
import './Feedback.css';

const Feedback = () => {
  // A high-quality, professional culinary background image
  const imageUrl = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=2070";

  const leftPanelStyle = {
    // Note: Use double quotes inside the url() to handle the complex online URL
    backgroundImage: `linear-gradient(rgba(183, 28, 28, 0.85), rgba(183, 28, 28, 0.85)), url("${imageUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
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

            <form>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small text-uppercase">Your Name</label>
                  <input type="text" className="form-control feedback-input p-3" placeholder="Enter name" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small text-uppercase">Email Address</label>
                  <input type="email" className="form-control feedback-input p-3" placeholder="Enter email" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-uppercase">How was the experience?</label>
                <div className="d-flex justify-content-between p-3 bg-white shadow-sm" style={{ borderRadius: '10px' }}>
                  {['😞', '😐', '🙂', '😊', '😍'].map((emoji, index) => (
                    <button key={index} type="button" className="btn emoji-btn fs-2 p-0">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-uppercase">Message</label>
                <textarea className="form-control feedback-input p-3" rows="3" placeholder="What can we improve?"></textarea>
              </div>

              <button type="button" className="btn submit-btn fw-bold w-100 py-3 text-white">
                Send Feedback 🚀
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;