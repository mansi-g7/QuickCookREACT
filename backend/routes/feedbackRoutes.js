import express from 'express';
import jwt from 'jsonwebtoken';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'; // eslint-disable-line no-undef

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const requireAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token || !token.startsWith('admin_token_')) {
    return res.status(401).json({ success: false, message: 'Admin authorization required' });
  }

  next();
};

const requireUserToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token || token.startsWith('admin_token_')) {
      return res.status(401).json({ success: false, message: 'User login required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

router.post('/', requireUserToken, async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    if (!rating) {
      return res.status(400).json({ success: false, message: 'Rating is required' });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters' });
    }

    const feedback = await Feedback.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating,
      message: message.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

router.get('/', requireAdminToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    console.error('Get feedbacks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch feedbacks', feedbacks: [] });
  }
});

router.delete('/:id', requireAdminToken, async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!deletedFeedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    return res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete feedback' });
  }
});

export default router;
