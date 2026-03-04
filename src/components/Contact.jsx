// src/components/Contact.jsx
import React from 'react';
import './Contact.css';

const Contact = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // You would typically handle API calls here
        alert("Thank you! Your message has been sent.");
    };

    return (
        <div className="contact-page">
            {/* Header Section */}
            <div className="contact-hero text-center shadow">
                <div className="container">
                    <h1 className="display-3 fw-bold">Let's <span className="text-dark">Connect</span></h1>
                    <p className="lead fs-4">Have questions about QuickCook? We're here to help!</p>
                </div>
            </div>

            <div className="container mt-5">
                {/* Contact Form Section */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="row g-0">
                                <div className="col-lg-7 p-5">
                                    <h2 className="fw-bold mb-4">Send Us a <span className="text-danger">Message</span></h2>
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Full Name</label>
                                                <input type="text" className="form-control rounded-pill p-2" placeholder="John Doe" required />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email Address</label>
                                                <input type="email" className="form-control rounded-pill p-2" placeholder="john@example.com" required />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Subject</label>
                                            <select className="form-select rounded-pill p-2">
                                                <option>General Inquiry</option>
                                                <option>Technical Support</option>
                                                <option>Recipe Suggestion</option>
                                                <option>Partnership/Collaboration</option>
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label">Your Message</label>
                                            <textarea className="form-control rounded-4 p-3" rows="4" placeholder="How can we help you today?"></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-danger btn-lg rounded-pill px-5 shadow">Send Message</button>
                                    </form>
                                </div>

                                <div className="col-lg-5 bg-warning p-5 d-flex flex-column justify-content-center text-dark">
                                    <h3 className="fw-bold mb-3">We Value Your Feedback!</h3>
                                    <p>Our team at <strong>QuickCook</strong> aims to reply to all inquiries within 24 hours. Your suggestions help us make recipe discovery better for everyone.</p>
                                    <div className="mt-4">
                                        <i className="bi bi-quote display-1 opacity-25"></i>
                                        <p className="fst-italic fs-5">"Cooking is a craft, but sharing it is an art."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info Cards */}
                <div className="row g-4 justify-content-center my-5 py-4">
                    <div className="col-md-4">
                        <div className="card contact-card h-100 p-4 shadow-sm text-center">
                            <div className="icon-box mx-auto"><i className="bi bi-geo-alt-fill"></i></div>
                            <h4 className="fw-bold">Our Location</h4>
                            <p className="text-muted">123 Culinary Drive, Foodie City,<br />Gujarat, India</p>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card contact-card h-100 p-4 shadow-sm text-center">
                            <div className="icon-box mx-auto"><i className="bi bi-envelope-heart-fill"></i></div>
                            <h4 className="fw-bold">Email Us</h4>
                            <p className="text-muted">General: info@quickcook.com<br />Support: support@quickcook.com</p>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card contact-card h-100 p-4 shadow-sm text-center">
                            <div className="icon-box mx-auto"><i className="bi bi-telephone-inbound-fill"></i></div>
                            <h4 className="fw-bold">Call Us</h4>
                            <p className="text-muted">Mon-Fri: 9am - 6pm<br />+91 98765 43210</p>
                        </div>
                    </div>
                </div>

                {/* Why Reach Out & Socials */}
                <div className="row mt-5 pt-5 align-items-center mb-5">
                    <div className="col-lg-6">
                        <h2 className="fw-bold text-danger">Why Reach Out to <span className="text-warning">Us?</span></h2>
                        <p className="text-muted fs-5 mt-3">
                            We are constantly looking for ways to improve the <strong>QuickCook</strong> experience. Whether you're a developer wanting to collaborate or a user with a new recipe idea, we value your input.
                        </p>
                        <ul className="list-unstyled mt-4">
                            <li className="mb-3"><i className="bi bi-check-circle-fill text-success me-2"></i> Fast response within 24 hours</li>
                            <li className="mb-3"><i className="bi bi-check-circle-fill text-success me-2"></i> Technical support for recipe uploads</li>
                            <li className="mb-3"><i className="bi bi-check-circle-fill text-success me-2"></i> Feedback and suggestions portal</li>
                        </ul>
                    </div>
                    <div className="col-lg-6">
                        <div className="bg-light p-5 rounded-4 border-start border-5 border-warning shadow-sm">
                            <h3 className="fw-bold mb-4">Follow Our Journey</h3>
                            <p className="text-muted mb-4">Stay updated with the latest recipes and features by following us on social media.</p>
                            <div className="d-flex">
                                <a href="#" className="social-btn shadow-sm"><i className="bi bi-facebook"></i></a>
                                <a href="#" className="social-btn shadow-sm"><i className="bi bi-instagram"></i></a>
                                <a href="#" className="social-btn shadow-sm"><i className="bi bi-twitter-x"></i></a>
                                <a href="#" className="social-btn shadow-sm"><i className="bi bi-linkedin"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;