import { useState, useEffect } from 'react';
import { playlistService } from '../services/api';
import './PlaylistSelector.css';

const PlaylistSelector = ({ recipeId, isOpen, onClose, onSave }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('warning');

  const formatCreatedDate = (dateString) => {
    if (!dateString) return 'Recently created';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Recently created';
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (isOpen) {
      setMessage('');
      setMessageType('warning');
      setShowCreateNew(false);
      setNewPlaylistName('');
      loadPlaylists();
    }
  }, [isOpen]);

  const loadPlaylists = async () => {
    try {
      const result = await playlistService.getAllPlaylists();
      if (result.success) {
        setPlaylists(result.playlists || []);
        if (result.playlists && result.playlists.length > 0) {
          setSelectedPlaylist(result.playlists[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading playlists:', err);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setMessage('Please enter a cook-list name');
      setMessageType('warning');
      return;
    }

    setLoading(true);
    try {
      const result = await playlistService.createPlaylist(newPlaylistName, `Recipe collection`);
      if (result.success) {
        const newPlaylistId = result.playlist?._id;
        if (newPlaylistId) {
          const saveResult = await playlistService.addRecipeToPlaylist(newPlaylistId, recipeId);
          if (saveResult.success) {
            setMessage('Cook-list created and recipe saved successfully!');
            setMessageType('success');
            await loadPlaylists();
            setTimeout(() => {
              onClose();
              onSave && onSave();
            }, 900);
          } else {
            setMessage(saveResult.message || 'Cook-list created but recipe could not be saved');
            setMessageType('warning');
            await loadPlaylists();
            setShowCreateNew(false);
            setSelectedPlaylist(newPlaylistId);
          }
        } else {
          setMessage('Cook-list created, but something went wrong. Please try saving again.');
          setMessageType('warning');
          await loadPlaylists();
          setShowCreateNew(false);
        }
      } else {
        setMessage(result.message || 'Error creating cook-list');
        setMessageType('warning');
      }
    } catch (err) {
      setMessage('Error creating cook-list');
      setMessageType('warning');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPlaylist = async () => {
    if (!selectedPlaylist) {
      setMessage('Please select a cook-list');
      setMessageType('warning');
      return;
    }

    setLoading(true);
    try {
      const result = await playlistService.addRecipeToPlaylist(selectedPlaylist, recipeId);
      if (result.success) {
        setMessage('Recipe saved to cook-list!');
        setMessageType('success');
        setTimeout(() => {
          onClose();
          onSave && onSave();
        }, 1000);
      } else {
        setMessage(result.message || 'Error saving recipe');
        setMessageType('warning');
      }
    } catch (err) {
      setMessage('Error saving recipe');
      setMessageType('warning');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="playlist-modal-overlay" onClick={onClose}>
      <div className="playlist-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="playlist-modal-header">
          <h3>Save Recipe to Cook-list</h3>
          <button className="playlist-close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="playlist-modal-body">
          {message && (
            <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-warning'}`}>
              {message}
            </div>
          )}

          <div className="playlist-section-title">Past Created Cook-lists</div>

          {playlists.length > 0 ? (
            <div className="playlist-list">
              {playlists.map((playlist) => (
                <button
                  key={playlist._id}
                  type="button"
                  className={`playlist-item ${selectedPlaylist === playlist._id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlaylist(playlist._id)}
                >
                  <div className="playlist-item-main">
                    <span className="playlist-pin">📌</span>
                    <span className="playlist-name">{playlist.name}</span>
                  </div>
                  <div className="playlist-item-meta">
                    <span>{playlist.recipes?.length || 0} recipes</span>
                    <span>Created: {formatCreatedDate(playlist.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="no-playlists-msg">
              <p>No cook-lists yet. Create your first cook-list!</p>
            </div>
          )}

          {!showCreateNew && (
            <button
              className="btn btn-link-create"
              onClick={() => setShowCreateNew(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>Create New Cook-list
            </button>
          )}

          {showCreateNew && (
            <div className="form-group create-playlist-panel">
              <label>New Cook-list Name:</label>
              <input
                type="text"
                placeholder="e.g., Party Food, Quick Meals"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="form-control"
              />
              <div className="create-playlist-actions mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateNew(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreatePlaylist}
                  disabled={loading}
                >
                  Create & Save
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="playlist-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveToPlaylist}
            disabled={loading || !selectedPlaylist}
          >
            {loading ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSelector;
