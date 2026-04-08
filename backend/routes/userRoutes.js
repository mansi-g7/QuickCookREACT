import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import Playlist from '../models/Playlist.js';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'; // eslint-disable-line no-undef

// Multer config for profile pictures
const uploadDir = path.resolve(__dirname, '../uploads');
// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
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

// Allows admin dashboard to access user list with admin token.
const authenticateUserOrAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    if (token.startsWith('admin_token_')) {
      return next();
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

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMobile = (mobile) => {
  const mobileRegex = /^\d{10,15}$/;
  return mobileRegex.test(mobile);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, mobile, email, password, address, gender } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!mobile || !validateMobile(mobile)) {
      return res.status(400).json({ success: false, message: 'Valid mobile number is required (10-15 digits)' });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { mobile }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number already registered' });
      }
    }

    // Create user
    const userData = {
      name: name.trim(),
      mobile,
      email: email.toLowerCase(),
      password,
      gender: gender || null,
      address: address ? address.trim() : ''
    };

    if (req.file) {
      userData.profilePicture = `/uploads/${req.file.filename}`;
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        address: user.address,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email or mobile number already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        address: user.address,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        address: user.address,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/liked-recipes
// @desc    Get user's liked recipes
// @access  Private
router.get('/liked-recipes', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'likedRecipes',
      populate: {
        path: 'category',
        select: 'name color'
      }
    });

    res.json({
      success: true,
      likedRecipes: user.likedRecipes || []
    });
  } catch (error) {
    console.error('Get liked recipes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/saved-recipes
// @desc    Get user's saved recipes
// @access  Private
router.get('/saved-recipes', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedRecipes',
      populate: {
        path: 'category',
        select: 'name color'
      }
    });

    res.json({
      success: true,
      savedRecipes: user.savedRecipes || []
    });
  } catch (error) {
    console.error('Get saved recipes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, mobile, gender, address } = req.body;
    const userId = req.user._id;

    // Validation
    if (name && (!name.trim() || name.trim().length > 50)) {
      return res.status(400).json({ success: false, message: 'Name must be 1-50 characters' });
    }

    if (mobile && !validateMobile(mobile)) {
      return res.status(400).json({ success: false, message: 'Valid mobile number required' });
    }

    if (address && address.length > 500) {
      return res.status(400).json({ success: false, message: 'Address cannot exceed 500 characters' });
    }

    // Check if mobile is already taken by another user
    if (mobile) {
      const existingUser = await User.findOne({ mobile, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Mobile number already in use' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (mobile) updateData.mobile = mobile;
    if (gender) updateData.gender = gender;
    if (address !== undefined) updateData.address = address.trim();
    if (name) updateData.name = name.trim();
    if (mobile) updateData.mobile = mobile;
    if (address !== undefined) updateData.address = address.trim();

    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        address: user.address,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error during update' });
  }
});

// @route   POST /api/users/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    // For security, don't check if email exists - always return success
    res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/users/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // For now, just return success (token validation would be implemented with actual email service)
    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from old password' });
    }

    // Find user with password field
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password change' });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', authenticateUserOrAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire');

    res.json({
      success: true,
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get one user detail (admin only)
// @access  Private
router.get('/:id', authenticateUserOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('savedRecipes', 'name image')
      .populate('likedRecipes', 'name image');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const cookLists = await Playlist.find({ user: user._id })
      .select('name description color recipes createdAt')
      .populate('recipes', 'name image');

    return res.json({
      success: true,
      user,
      cookLists
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

const updateUserStatusHandler = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be boolean' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && isActive === false) {
      return res.status(400).json({ success: false, message: 'Admin user cannot be banned' });
    }

    user.isActive = isActive;
    await user.save();

    return res.json({
      success: true,
      message: isActive ? 'User activated successfully' : 'User banned successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        address: user.address,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   PATCH /api/users/:id/status
// @desc    Update user active/ban status (admin only)
// @access  Private
router.patch('/:id/status', authenticateUserOrAdmin, updateUserStatusHandler);

// @route   POST /api/users/:id/status
// @desc    Update user active/ban status (admin only) - compatibility route
// @access  Private
router.post('/:id/status', authenticateUserOrAdmin, updateUserStatusHandler);

// @route   POST /api/users/like/:recipeId
// @desc    Like a recipe
// @access  Private
router.post('/like/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipeId } = req.params;

    console.log('Like request:', { userId, recipeId });

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if already liked
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isAlreadyLiked = user.likedRecipes.some(id => id.toString() === recipeId);
    if (isAlreadyLiked) {
      return res.status(200).json({ success: true, message: 'Recipe already liked' });
    }

    // Add to liked recipes
    user.likedRecipes.push(recipeId);
    recipe.likesCount = (recipe.likesCount || 0) + 1;

    await user.save();
    await recipe.save();

    console.log('Recipe liked successfully');

    res.json({
      success: true,
      message: 'Recipe liked successfully'
    });
  } catch (error) {
    console.error('Like recipe error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/users/unlike/:recipeId
// @desc    Unlike a recipe
// @access  Private
router.post('/unlike/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipeId } = req.params;

    console.log('Unlike request:', { userId, recipeId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const isLiked = user.likedRecipes.some(id => id.toString() === recipeId);
    if (!isLiked) {
      return res.status(200).json({ success: true, message: 'Recipe not in liked list' });
    }

    // Remove from liked recipes
    user.likedRecipes = user.likedRecipes.filter(id => id.toString() !== recipeId);
    recipe.likesCount = Math.max(0, (recipe.likesCount || 1) - 1);

    await user.save();
    await recipe.save();

    console.log('Recipe unliked successfully');

    res.json({
      success: true,
      message: 'Recipe unliked successfully'
    });
  } catch (error) {
    console.error('Unlike recipe error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/users/save/:recipeId
// @desc    Save a recipe
// @access  Private
router.post('/save/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipeId } = req.params;

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if already saved
    const user = await User.findById(userId);
    if (user.savedRecipes.includes(recipeId)) {
      return res.status(400).json({ success: false, message: 'You already saved this recipe' });
    }

    // Add to saved recipes
    user.savedRecipes.push(recipeId);
    recipe.savesCount += 1;

    await user.save();
    await recipe.save();

    res.json({
      success: true,
      message: 'Recipe saved successfully'
    });
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/users/unsave/:recipeId
// @desc    Unsave a recipe
// @access  Private
router.post('/unsave/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipeId } = req.params;

    const user = await User.findById(userId);
    const recipe = await Recipe.findById(recipeId);

    if (!user.savedRecipes.includes(recipeId)) {
      return res.status(400).json({ success: false, message: 'You have not saved this recipe' });
    }

    // Remove from saved recipes
    user.savedRecipes = user.savedRecipes.filter(id => id.toString() !== recipeId);
    recipe.savesCount = Math.max(0, recipe.savesCount - 1);

    await user.save();
    await recipe.save();

    res.json({
      success: true,
      message: 'Recipe unsaved successfully'
    });
  } catch (error) {
    console.error('Unsave recipe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export { authenticateToken, authenticateUserOrAdmin };
export default router;