// src/components/Contact.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Contact.css';
import { initialContactFormData, validateContactForm } from './contactValidation';
import { contactMessageService } from '../services/api';

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialContactFormData);
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        const userToken = localStorage.getItem('token');
        if (!userToken) {
            setSubmitError('Please login first to send a message.');
            navigate('/login');
            return;
        }

        const validationErrors = validateContactForm(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitted(false);
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await contactMessageService.submitContactMessage(formData);

            if (!result.success) {
                setIsSubmitted(false);
                setSubmitError(result.message || 'Failed to submit contact message. Please try again.');
                return;
            }

            setErrors({});
            setIsSubmitted(true);
            setFormData(initialContactFormData);
        } finally {
            setIsSubmitting(false);
        }
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
                                    <form onSubmit={handleSubmit} noValidate>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label" htmlFor="contactFullName">Full Name</label>
                                                <input
                                                    id="contactFullName"
                                                    name="fullName"
                                                    type="text"
                                                    className={`form-control rounded-pill p-2 ${errors.fullName ? 'is-invalid' : ''}`}
                                                    placeholder="John Doe"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    aria-invalid={Boolean(errors.fullName)}
                                                />
                                                {errors.fullName && <div className="contact-error-text mt-1">{errors.fullName}</div>}
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label" htmlFor="contactEmail">Email Address</label>
                                                <input
                                                    id="contactEmail"
                                                    name="email"
                                                    type="email"
                                                    className={`form-control rounded-pill p-2 ${errors.email ? 'is-invalid' : ''}`}
                                                    placeholder="john@example.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    aria-invalid={Boolean(errors.email)}
                                                />
                                                {errors.email && <div className="contact-error-text mt-1">{errors.email}</div>}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="contactSubject">Subject</label>
                                            <select
                                                id="contactSubject"
                                                name="subject"
                                                className={`form-select rounded-pill p-2 ${errors.subject ? 'is-invalid' : ''}`}
                                                value={formData.subject}
                                                onChange={handleChange}
                                                aria-invalid={Boolean(errors.subject)}
                                            >
                                                <option value="General Inquiry">General Inquiry</option>
                                                <option value="Technical Support">Technical Support</option>
                                                <option value="Recipe Suggestion">Recipe Suggestion</option>
                                                <option value="Partnership/Collaboration">Partnership/Collaboration</option>
                                            </select>
                                            {errors.subject && <div className="contact-error-text mt-1">{errors.subject}</div>}
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label" htmlFor="contactMessage">Your Message</label>
                                            <textarea
                                                id="contactMessage"
                                                name="message"
                                                className={`form-control rounded-4 p-3 ${errors.message ? 'is-invalid' : ''}`}
                                                rows="4"
                                                placeholder="How can we help you today?"
                                                value={formData.message}
                                                onChange={handleChange}
                                                aria-invalid={Boolean(errors.message)}
                                            ></textarea>
                                            {errors.message && <div className="contact-error-text mt-1">{errors.message}</div>}
                                        </div>
                                        {isSubmitted && (
                                            <div className="alert alert-success py-2" role="alert">
                                                Thank you! Your message has been sent.
                                            </div>
                                        )}
                                        {submitError && (
                                            <div className="alert alert-danger py-2" role="alert">
                                                {submitError}
                                            </div>
                                        )}
                                        <button type="submit" className="btn btn-danger btn-lg rounded-pill px-5 shadow" disabled={isSubmitting}>
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </button>
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