import express from 'express';
import jwt from 'jsonwebtoken';
import Settings from '../models/Settings.js';

const router = express.Router();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'; // eslint-disable-line no-undef

// Middleware to verify admin token
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    // For admin, we use a special check
    if (token.startsWith('admin_token_')) {
      return next();
    }

    jwt.verify(token, JWT_SECRET);
    // Verify if user is admin - this would require checking user in database
    // For now, only admin_token_ is accepted
    return res.status(403).json({ success: false, message: 'Admin access required' });
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// @route   GET /api/settings
// @desc    Get all settings (public - anyone can view)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/settings
// @desc    Update settings (admin only)
// @access  Private - Admin
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body;

    // Whitelist of allowed fields to update
    const allowedFields = [
      'homePageTitle',
      'homePageSubtitle',
      'homePageDescription',
      'homePageCTA',
      'aboutPageTitle',
      'aboutPageContent',
      'aboutPageMission',
      'aboutPageVision',
      'contactPageTitle',
      'contactPageDescription',
      'contactPageEmail',
      'contactPagePhone',
      'contactPageAddress',
      'siteTitle',
      'siteDescription',
      'emailNotifications'
    ];

    // Filter only allowed fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (field in updates) {
        updateData[field] = updates[field];
      }
    });

    // Find or create settings and update
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(updateData);
    } else {
      Object.assign(settings, updateData);
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error during update' });
  }
});

// @route   GET /api/settings/reset
// @desc    Reset settings to defaults (admin only)
// @access  Private - Admin
router.post('/reset', authenticateAdmin, async (req, res) => {
  try {
    await Settings.deleteOne({});
    const settings = new Settings();
    await settings.save();

    res.json({
      success: true,
      message: 'Settings reset to defaults',
      settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
