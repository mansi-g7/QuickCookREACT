import express from 'express';
import jwt from 'jsonwebtoken';
import ContactMessage from '../models/ContactMessage.js';
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
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    if (!message || message.trim().length < 15) {
      return res.status(400).json({ success: false, message: 'Message must be at least 15 characters' });
    }

    const contactMessage = await ContactMessage.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully',
      contactMessage
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit contact message' });
  }
});

router.get('/', requireAdminToken, async (req, res) => {
  try {
    const contactMessages = await ContactMessage.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: contactMessages.length,
      contactMessages
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch contact messages', contactMessages: [] });
  }
});

router.delete('/:id', requireAdminToken, async (req, res) => {
  try {
    const deletedMessage = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }

    return res.json({ success: true, message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Delete contact message error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete contact message' });
  }
});

export default router;
