// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1 className="display-4 fw-bold">Welcome to <span className="text-warning">QuickCook</span></h1>
          <p className="lead fs-4">Healthy eating starts with the right choices.</p>
          <a href="#explore" className="btn btn-warning fw-bold text-danger px-4 rounded-pill mt-3 shadow-sm">
            Explore Menu
          </a>
        </div>
      </div>

      {/* Categories Section */}
      <div id="explore" className="container py-5 my-5 text-center">
        <div className="mb-5">
          <h2 className="fw-bold">Explore Our <span className="text-danger">Kitchen</span></h2>
          <p className="text-muted">Discover delicious hand-picked recipes just for you.</p>
        </div>

        <div className="row g-4">
          {/* Category 1: Diet */}
          <div className="col-md-3">
            <div className="category-card shadow-sm">
              <div className="diet-icon">
                <i className="bi bi-apple"></i>
              </div>
              <h4 className="fw-bold">Diet Breakfast</h4>
              <p className="text-muted small">Healthy, green, and nutritious options to fuel your morning.</p>
              <Link to="/category/Diet" className="btn btn-outline-warning btn-sm rounded-pill px-4 mt-2 fw-bold text-dark">
                View Recipes
              </Link>
            </div>
          </div>

          {/* Category 2: Spicy */}
          <div className="col-md-3">
            <div className="category-card shadow-sm">
              <div className="standard-icon">
                <i className="bi bi-fire"></i>
              </div>
              <h4 className="fw-bold">Spicy Special</h4>
              <p className="text-muted small">For those who love a kick of heat in every bite.</p>
              <Link to="/category/Spicy" className="btn btn-outline-danger btn-sm rounded-pill px-4 mt-2">
                View Recipes
              </Link>
            </div>
          </div>

          {/* Category 3: Quick */}
          <div className="col-md-3">
            <div className="category-card shadow-sm">
              <div className="standard-icon" style={{ color: '#0d6efd', background: '#f0f7ff' }}>
                <i className="bi bi-lightning-charge"></i>
              </div>
              <h4 className="fw-bold" style={{ color: '#0d6efd' }}>Quick Bites</h4>
              <p className="text-muted small">Delicious meals ready in under 10 minutes.</p>
              <Link to="/category/Quick" className="btn btn-outline-primary btn-sm rounded-pill px-4 mt-2">
                View Recipes
              </Link>
            </div>
          </div>

          {/* Category 4: Desserts */}
          <div className="col-md-3">
            <div className="category-card shadow-sm">
              <div className="standard-icon" style={{ color: '#6f42c1', background: '#f8f4ff' }}>
                <i className="bi bi-cake2"></i>
              </div>
              <h4 className="fw-bold" style={{ color: '#6f42c1' }}>Desserts</h4>
              <p className="text-muted small">Sweet treats to perfectly end your meal.</p>
              <Link to="/category/Desserts" className="btn btn-outline-secondary btn-sm rounded-pill px-4 mt-2">
                View Recipes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-light py-5 border-top">
        <div className="container text-center">
          <h3 className="fw-bold mb-5">How <span className="text-danger">QuickCook</span> Works</h3>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="text-danger fs-1 mb-2">1</div>
              <h5 className="fw-bold">Check Your Fridge</h5>
              <p className="text-muted small">See what ingredients you have today.</p>
            </div>
            <div className="col-md-4 mb-4">
              <div className="text-danger fs-1 mb-2">2</div>
              <h5 className="fw-bold">Select Category</h5>
              <p className="text-muted small">Pick a collection that fits your mood.</p>
            </div>
            <div className="col-md-4 mb-4">
              <div className="text-danger fs-1 mb-2">3</div>
              <h5 className="fw-bold">Get Cooking!</h5>
              <p className="text-muted small">Follow simple steps to a great meal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;