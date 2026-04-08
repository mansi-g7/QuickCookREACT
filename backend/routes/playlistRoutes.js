import express from 'express';
import Playlist from '../models/Playlist.js';
import Recipe from '../models/Recipe.js';
import { authenticateToken } from './userRoutes.js';

const router = express.Router();

// Create a new playlist
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Cook-list name is required' });
    }

    // Check if playlist with same name already exists for this user
    const existingPlaylist = await Playlist.findOne({ user: userId, name });
    if (existingPlaylist) {
      return res.status(400).json({ success: false, message: 'Cook-list with this name already exists' });
    }

    const newPlaylist = new Playlist({
      user: userId,
      name,
      description: description || '',
      color: color || '#ff9547',
      recipes: []
    });

    await newPlaylist.save();
    res.json({ success: true, message: 'Cook-list created successfully', playlist: newPlaylist });
  } catch (err) {
    console.error('Error creating playlist:', err);
    res.status(500).json({ success: false, message: 'Error creating cook-list' });
  }
});

// Get all playlists for a user
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const playlists = await Playlist.find({ user: userId }).populate({
      path: 'recipes',
      populate: {
        path: 'category',
        select: 'name color'
      }
    });
    
    res.json({ 
      success: true, 
      playlists,
      count: playlists.length 
    });
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).json({ success: false, message: 'Error fetching cook-lists' });
  }
});

// Get a specific playlist
router.get('/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId }).populate({
      path: 'recipes',
      populate: {
        path: 'category',
        select: 'name color'
      }
    });
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Cook-list not found' });
    }

    res.json({ success: true, playlist });
  } catch (err) {
    console.error('Error fetching playlist:', err);
    res.status(500).json({ success: false, message: 'Error fetching cook-list' });
  }
});

// Update playlist info
router.put('/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description, color } = req.body;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Cook-list not found' });
    }

    if (name && name !== playlist.name) {
      const existingPlaylist = await Playlist.findOne({ user: userId, name });
      if (existingPlaylist) {
        return res.status(400).json({ success: false, message: 'Cook-list with this name already exists' });
      }
      playlist.name = name;
    }

    if (description !== undefined) playlist.description = description;
    if (color) playlist.color = color;
    playlist.updatedAt = Date.now();

    await playlist.save();
    res.json({ success: true, message: 'Cook-list updated successfully', playlist });
  } catch (err) {
    console.error('Error updating playlist:', err);
    res.status(500).json({ success: false, message: 'Error updating cook-list' });
  }
});

// Delete playlist
router.delete('/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, user: userId });
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Cook-list not found' });
    }

    res.json({ success: true, message: 'Cook-list deleted successfully' });
  } catch (err) {
    console.error('Error deleting playlist:', err);
    res.status(500).json({ success: false, message: 'Error deleting cook-list' });
  }
});

// Add recipe to playlist
router.post('/:playlistId/add-recipe/:recipeId', authenticateToken, async (req, res) => {
  try {
    const { playlistId, recipeId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Cook-list not found' });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if recipe already in playlist
    if (playlist.recipes.includes(recipeId)) {
      return res.status(400).json({ success: false, message: 'Recipe already in cook-list' });
    }

    playlist.recipes.push(recipeId);
    playlist.updatedAt = Date.now();
    await playlist.save();

    // Increment savesCount on recipe
    recipe.savesCount = (recipe.savesCount || 0) + 1;
    await recipe.save();

    res.json({ success: true, message: 'Recipe added to cook-list' });
  } catch (err) {
    console.error('Error adding recipe to playlist:', err);
    res.status(500).json({ success: false, message: 'Error adding recipe to cook-list' });
  }
});

// Remove recipe from playlist
router.post('/:playlistId/remove-recipe/:recipeId', authenticateToken, async (req, res) => {
  try {
    const { playlistId, recipeId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Cook-list not found' });
    }

    const recipeIndex = playlist.recipes.indexOf(recipeId);
    if (recipeIndex === -1) {
      return res.status(400).json({ success: false, message: 'Recipe not in cook-list' });
    }

    playlist.recipes.splice(recipeIndex, 1);
    playlist.updatedAt = Date.now();
    await playlist.save();

    // Decrement savesCount on recipe
    const recipe = await Recipe.findById(recipeId);
    if (recipe) {
      recipe.savesCount = Math.max(0, (recipe.savesCount || 1) - 1);
      await recipe.save();
    }

    res.json({ success: true, message: 'Recipe removed from cook-list' });
  } catch (err) {
    console.error('Error removing recipe from playlist:', err);
    res.status(500).json({ success: false, message: 'Error removing recipe from cook-list' });
  }
});

// Check if recipe is in any playlist
router.get('/check/:recipeId', authenticateToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const playlists = await Playlist.find({ 
      user: userId, 
      recipes: recipeId 
    });

    res.json({ 
      success: true, 
      inPlaylist: playlists.length > 0,
      playlists: playlists.map(p => ({ _id: p._id, name: p.name }))
    });
  } catch (err) {
    console.error('Error checking recipe in playlists:', err);
    res.status(500).json({ success: false, message: 'Error checking recipe' });
  }
});

export default router;
