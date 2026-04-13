import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userService } from "../../services/api";
import "./Profile.css";
import { playlistService } from "../../services/api";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    gender: "",
    address: "",
    profilePicture: null
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "liked") {
      loadUserRecipes();
    }
  }, [activeTab]);

    useEffect(() => {
      if (activeTab === "playlists") {
        loadPlaylists();
      }
    }, [activeTab]);
  const loadProfile = async () => {
    const res = await userService.getProfile();
    if (res.success) {
      setProfile(res.user);
      setImageLoadError(false);
      setAvatarVersion(Date.now());
      setEditForm({
        name: res.user.name || "",
        mobile: res.user.mobile || "",
        gender: res.user.gender || "",
        address: res.user.address || "",
        profilePicture: null
      });
    }
  };

  const getImageBaseUrl = () => {
    const configured = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
    return configured.endsWith("/api") ? configured.slice(0, -4) : configured;
  };

  const getProfileImageUrl = () => {
    if (!profile?.profilePicture) return "";

    const rawPath = String(profile.profilePicture).replace(/\\/g, "/");

    if (/^https?:\/\//i.test(rawPath)) {
      const separator = rawPath.includes("?") ? "&" : "?";
      return `${rawPath}${separator}v=${avatarVersion}`;
    }

    let normalizedPath = rawPath;
    if (rawPath.includes("/uploads/")) {
      normalizedPath = rawPath.slice(rawPath.indexOf("/uploads/"));
    } else if (rawPath.startsWith("uploads/")) {
      normalizedPath = `/${rawPath}`;
    } else if (rawPath.startsWith("backend/uploads/")) {
      normalizedPath = `/${rawPath.replace("backend/uploads/", "uploads/")}`;
    }

    return `${getImageBaseUrl()}${normalizedPath}?v=${avatarVersion}`;
  };

  const loadUserRecipes = async () => {
    setRecipesLoading(true);
    try {
      console.log('Fetching liked recipes...');
      const likedRes = await userService.getLikedRecipes();
      
      console.log('Liked recipes response:', likedRes);
      
      if (likedRes.success === false) {
        console.error('Error response:', likedRes.message);
        setLikedRecipes([]);
        return;
      }
      
      const recipes = Array.isArray(likedRes.likedRecipes) ? likedRes.likedRecipes : [];
      console.log('Setting liked recipes:', recipes);
      
      setLikedRecipes(recipes);
    } catch (err) {
      console.error('Error loading user recipes:', err);
      setLikedRecipes([]);
    } finally {
      setRecipesLoading(false);
    }
  };

    const loadPlaylists = async () => {
      setPlaylistsLoading(true);
      try {
        const result = await playlistService.getAllPlaylists();
        if (result.success) {
          setPlaylists(result.playlists || []);
        }
      } catch (err) {
        console.error('Error loading playlists:', err);
      } finally {
        setPlaylistsLoading(false);
      }
    };
  const handleRemoveFromLiked = async (recipeId) => {
    try {
      console.log('Removing from liked:', recipeId);
      const result = await userService.unlikeRecipe(recipeId);
      
      console.log('Unlike result:', result);
      
      if (result.success !== false) {
        await loadUserRecipes();
        console.log('Successfully removed from liked');
      } else {
        console.error('Error:', result.message);
        alert(result.message || 'Failed to remove from liked');
      }
    } catch (err) {
      console.error('Error removing from liked:', err);
      alert('Failed to remove from liked: ' + err.message);
    }
  };

    const handleDeletePlaylist = async (playlistId) => {
      if (window.confirm('Are you sure you want to delete this cook-list?')) {
        try {
          const result = await playlistService.deletePlaylist(playlistId);
          if (result.success) {
            setPlaylists(prev => prev.filter(p => p._id !== playlistId));
          }
        } catch (err) {
          console.error('Error deleting playlist:', err);
        }
      }
    };

    const handleRemoveRecipeFromPlaylist = async (playlistId, recipeId) => {
      try {
        const result = await playlistService.removeRecipeFromPlaylist(playlistId, recipeId);
        if (result.success) {
          // Update the playlists state
          setPlaylists(prev => prev.map(p => 
            p._id === playlistId 
              ? { ...p, recipes: p.recipes.filter(r => r._id !== recipeId) }
              : p
          ));
        }
      } catch (err) {
        console.error('Error removing recipe from playlist:', err);
      }
    };
  const handleLogout = () => {
    userService.logout();
    navigate("/");
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    setMessage("");
    setMessageType("");

    if (type === "file") {
      setEditForm({ ...editForm, profilePicture: files[0] });
    } else if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 12);
      setEditForm({ ...editForm, mobile: digitsOnly });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const openEditModal = () => {
    setMessage("");
    setMessageType("");
    setEditForm({
      name: profile?.name || "",
      mobile: profile?.mobile || "",
      gender: profile?.gender || "",
      address: profile?.address || "",
      profilePicture: null
    });
    setShowEditModal(true);
  };

  const validatePassword = (password) => {
    // Password must be at least 8 characters
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    // Must contain at least one number
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    // Must contain at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*).";
    }
    return null;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleSaveProfile = async () => {
    setMessage("");
    setMessageType("");

    const trimmedName = editForm.name.trim();
    const trimmedMobile = editForm.mobile.trim();
    const trimmedAddress = editForm.address.trim();

    if (!trimmedName) {
      setMessage("Name is required");
      setMessageType("error");
      return;
    }
    if (trimmedName.length < 2) {
      setMessage("Name must be at least 2 characters");
      setMessageType("error");
      return;
    }
    if (!/^\d{12}$/.test(trimmedMobile)) {
      setMessage("Mobile must be exactly 12 digits");
      setMessageType("error");
      return;
    }
    if (!editForm.gender) {
      setMessage("Select gender");
      setMessageType("error");
      return;
    }
    if (!trimmedAddress) {
      setMessage("Address is required");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("mobile", trimmedMobile);
    formData.append("gender", editForm.gender);
    formData.append("address", trimmedAddress);

    if (editForm.profilePicture) {
      formData.append("profilePicture", editForm.profilePicture);
    }

    setLoading(true);
    const res = await userService.updateProfile(formData);
    setLoading(false);

    if (res.success) {
      setProfile(res.user);
      setImageLoadError(false);
      setAvatarVersion(Date.now());
      setEditForm({
        name: res.user.name || "",
        mobile: res.user.mobile || "",
        gender: res.user.gender || "",
        address: res.user.address || "",
        profilePicture: null
      });
      setMessage("Profile updated successfully!");
      setMessageType("success");
      setTimeout(() => {
        setShowEditModal(false);
        setMessage("");
        setMessageType("");
      }, 1500);
    } else {
      setMessage(res.message || "Update failed");
      setMessageType("error");
    }
  };

  const handleChangePassword = async () => {
    setMessage("");
    setMessageType("");

    if (!passwordForm.oldPassword) {
      setMessage("Old password is required");
      setMessageType("error");
      return;
    }

    if (!passwordForm.newPassword) {
      setMessage("New password is required");
      setMessageType("error");
      return;
    }

    // Use the same validation as registration form
    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      setMessage(passwordError);
      setMessageType("error");
      return;
    }

    if (!passwordForm.confirmPassword) {
      setMessage("Please confirm your new password");
      setMessageType("error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("New passwords do not match");
      setMessageType("error");
      return;
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setMessage("New password must be different from old password");
      setMessageType("error");
      return;
    }

    setLoading(true);
    const res = await userService.changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword
    );
    setLoading(false);

    if (res.success) {
      setMessage("Password changed successfully!");
      setMessageType("success");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }, 1500);
    } else {
      setMessage(res.message || "Failed to change password");
      setMessageType("error");
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setMessage("");
    setMessageType("");
    setEditForm({
      name: profile?.name || "",
      mobile: profile?.mobile || "",
      gender: profile?.gender || "",
      address: profile?.address || "",
      profilePicture: null
    });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setMessage("");
    setMessageType("");
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const getCategoryBadge = (category) => {
    if (!category || typeof category === 'string') {
      return null;
    }

    if (!category.name) {
      return null;
    }

    return {
      label: category.name,
      color: category.color || '#dc3545'
    };
  };

  return (
    <div className="profile-page">
      {/* Hero Section - Similar to Home */}
      <div className="hero-section">
        <div className="container">
          <h1 className="display-4 fw-bold">Your <span className="text-warning">Profile</span></h1>
          <p className="lead fs-4">Manage your account and preferences.</p>
        </div>
      </div>

      {/* Profile Card Section */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {/* Tabs Navigation */}
            <div className="nav nav-tabs mb-4 profile-tabs" role="tablist">
              <button
                className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
                role="tab"
              >
                <i className="bi bi-person-circle me-2"></i>Profile
              </button>
              <button
                className={`nav-link ${activeTab === "liked" ? "active" : ""}`}
                onClick={() => setActiveTab("liked")}
                role="tab"
              >
                <i className="bi bi-heart-fill me-2"></i>Liked Recipes
              </button>
              <button
                className={`nav-link ${activeTab === "playlists" ? "active" : ""}`}
                onClick={() => setActiveTab("playlists")}
                role="tab"
              >
                <i className="bi bi-collection me-2"></i>Cook-lists
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
            <div className="profile-card shadow-lg">
              <div className="profile-card-header">
                <div className="avatar-large">
                  {profile?.profilePicture && !imageLoadError ? (
                    <img 
                      src={getProfileImageUrl()} 
                      alt="Profile" 
                      className="profile-picture-img"
                      onError={() => setImageLoadError(true)}
                      onLoad={() => setImageLoadError(false)}
                    />
                  ) : (
                    <span style={{ fontSize: '48px', fontWeight: 700, color: 'white' }}>
                      {profile?.name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div className="profile-card-info">
                  <h2>{profile?.name || "User"}</h2>
                  <p className="text-muted">{profile?.email}</p>
                  <div className="profile-details mt-3">
                    <span><strong>Mobile:</strong> {profile?.mobile || "N/A"}</span>
                    <span><strong>Gender:</strong> {profile?.gender || "N/A"}</span>
                    <span><strong>Address:</strong> {profile?.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="profile-card-actions">
                <button 
                  className="btn btn-warning fw-bold px-4 text-dark me-2"
                  onClick={openEditModal}
                >
                  <i className="bi bi-pencil-square me-2"></i>Edit Profile
                </button>
                <button 
                  className="btn btn-info fw-bold px-4 text-white me-2"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <i className="bi bi-key-fill me-2"></i>Change Password
                </button>
                <button 
                  className="btn btn-danger fw-bold px-4"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </div>
            </div>
            )}

            {/* Liked Recipes Tab */}
            {activeTab === "liked" && (
            <div className="recipes-container">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">
                  <i className="bi bi-heart-fill text-danger me-2"></i>Liked Recipes
                  <span className="badge bg-danger ms-2">{likedRecipes.length}</span>
                </h3>
              </div>

              {recipesLoading ? (
                <div className="text-center py-5">
                  <p className="text-muted">Loading recipes...</p>
                </div>
              ) : likedRecipes.length === 0 ? (
                <div className="alert alert-info text-center py-5">
                  <i className="bi bi-heart me-2"></i>
                  <p className="mb-2">No liked recipes yet</p>
                  <small className="text-muted">Start liking recipes to see them here!</small>
                </div>
              ) : (
                <div className="row g-4">
                  {likedRecipes.map((recipe) => (
                    (() => {
                      const categoryBadge = getCategoryBadge(recipe.category);
                      return (
                    <div className="col-md-6 col-lg-4" key={recipe._id}>
                      <div className="card shadow-sm h-100 border-0">
                        {recipe.image && (
                          <img src={recipe.image} className="card-img-top" alt={recipe.name} />
                        )}
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title fw-bold">{recipe.name}</h5>
                          <p className="card-text text-muted small flex-grow-1">
                            {recipe.description}
                          </p>
                          
                          {categoryBadge && (
                            <div className="mb-2">
                              <span className="badge" style={{ 
                                backgroundColor: categoryBadge.color
                              }}>
                                {categoryBadge.label}
                              </span>
                            </div>
                          )}

                          <div className="d-flex gap-2 mt-3">
                            <Link 
                              to={`/recipe/${recipe._id}`}
                              className="btn btn-sm btn-warning fw-bold text-dark flex-grow-1"
                            >
                              <i className="bi bi-eye me-1"></i>View
                            </Link>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveFromLiked(recipe._id)}
                              title="Remove from liked"
                            >
                              <i className="bi bi-heart-fill"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                      );
                    })()
                  ))}
                </div>
              )}
            </div>
            )}

              {/* Playlists Tab */}
              {activeTab === "playlists" && (
              <div className="playlists-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold">
                    <i className="bi bi-collection text-danger me-2"></i>My Cook-lists
                    <span className="badge bg-danger ms-2" style={{color: '#fff'}}>{playlists.length}</span>
                  </h3>
                </div>

                {playlistsLoading ? (
                  <div className="text-center py-5">
                    <p className="text-muted">Loading cook-lists...</p>
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="alert alert-info text-center py-5">
                    <i className="bi bi-collection me-2"></i>
                    <p className="mb-2">No cook-lists yet</p>
                    <small className="text-muted">Create a cook-list by saving recipes!</small>
                  </div>
                ) : (
                  <div className="playlists-list">
                    {playlists.map((playlist) => (
                      <div className="playlist-card card shadow-sm mb-4 border-0" key={playlist._id}>
                        <div className="card-header" style={{
                          backgroundColor: playlist.color || '#ff9547',
                          color: 'white',
                          padding: '15px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h5 className="mb-1">{playlist.name}</h5>
                            {playlist.description && (
                              <small>{playlist.description}</small>
                            )}
                          </div>
                          <div className="d-flex gap-2">
                            <span className="badge bg-light" style={{color: '#333'}}>
                              {playlist.recipes?.length || 0} recipes
                            </span>
                            <button
                              className="btn btn-sm btn-light text-danger"
                              onClick={() => handleDeletePlaylist(playlist._id)}
                              title="Delete cook-list"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </div>
                        <div className="card-body">
                          {!playlist.recipes || playlist.recipes.length === 0 ? (
                            <p className="text-muted text-center py-5">
                              <i className="bi bi-inbox me-2"></i>No recipes in this cook-list yet
                            </p>
                          ) : (
                            <div className="row g-3">
                              {playlist.recipes.map((recipe) => (
                                (() => {
                                  const categoryBadge = getCategoryBadge(recipe.category);
                                  return (
                                <div className="col-md-6 col-lg-4" key={recipe._id}>
                                  <div className="card h-100 border shadow-sm">
                                    {recipe.image && (
                                      <img src={recipe.image} className="card-img-top" alt={recipe.name} />
                                    )}
                                    <div className="card-body d-flex flex-column">
                                      <h6 className="card-title fw-bold">{recipe.name}</h6>
                                      <small className="card-text text-muted flex-grow-1">
                                        {recipe.description}
                                      </small>
                                      {categoryBadge && (
                                        <div className="mb-2 mt-2">
                                          <span className="badge" style={{ 
                                            backgroundColor: categoryBadge.color
                                          }}>
                                            {categoryBadge.label}
                                          </span>
                                        </div>
                                      )}
                                      <div className="d-flex gap-2 mt-2">
                                        <Link 
                                          to={`/recipe/${recipe._id}`}
                                          className="btn btn-sm btn-warning fw-bold text-dark flex-grow-1"
                                        >
                                          <i className="bi bi-eye me-1"></i>View
                                        </Link>
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={() => handleRemoveRecipeFromPlaylist(playlist._id, recipe._id)}
                                          title="Remove from cook-list"
                                        >
                                          <i className="bi bi-x-lg"></i>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                  );
                                })()
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header with Gradient */}
            <div className="modal-header-gradient">
              <h2>
                <i className="bi bi-pencil-square me-2"></i>Edit Your Profile
              </h2>
              <button 
                className="btn-close-new"
                onClick={closeEditModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body-new">
              {message && (
                <div className={`alert-custom ${messageType === "success" ? "alert-success-custom" : "alert-danger-custom"}`}>
                  <i className={`bi ${messageType === "success" ? "bi-check-circle" : "bi-exclamation-circle"} me-2`}></i>
                  {message}
                </div>
              )}

              <div className="form-row">
                <div className="form-group-new">
                  <label className="form-label-new">
                    <i className="bi bi-person-fill me-2 text-warning"></i>Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="form-control-new"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group-new">
                  <label className="form-label-new">
                    <i className="bi bi-telephone-fill me-2 text-warning"></i>Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={editForm.mobile}
                    onChange={handleEditChange}
                    className="form-control-new"
                    placeholder="12 digit mobile"
                    maxLength="12"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-new">
                  <label className="form-label-new">
                    <i className="bi bi-person-badge-fill me-2 text-warning"></i>Gender
                  </label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditChange}
                    className="form-control-new"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group-new">
                  <label className="form-label-new">
                    <i className="bi bi-geo-alt-fill me-2 text-warning"></i>Address
                  </label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="form-control-new"
                    placeholder="Enter your address"
                    rows="2"
                  ></textarea>
                </div>
              </div>

              <div className="form-group-new">
                <label className="form-label-new">
                  <i className="bi bi-image-fill me-2 text-warning"></i>Profile Picture
                </label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleEditChange}
                    className="file-input-new"
                    accept="image/*"
                    id="profilePictureInput"
                  />
                  <label htmlFor="profilePictureInput" className="file-label-new">
                    <i className="bi bi-cloud-arrow-up me-2"></i>
                    {editForm.profilePicture ? editForm.profilePicture.name : "Click to upload or drag image"}
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer-new">
              <button 
                className="btn-cancel-new"
                onClick={closeEditModal}
              >
                <i className="bi bi-x-circle me-2"></i>Cancel
              </button>
              <button 
                className="btn-save-new"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                <i className="bi bi-check-circle me-2"></i>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header with Gradient */}
            <div className="modal-header-gradient">
              <h2>
                <i className="bi bi-key-fill me-2"></i>Change Your Password
              </h2>
              <button 
                className="btn-close-new"
                onClick={closePasswordModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body-new">
              {message && (
                <div className={`alert-custom ${messageType === "success" ? "alert-success-custom" : "alert-danger-custom"}`}>
                  <i className={`bi ${messageType === "success" ? "bi-check-circle" : "bi-exclamation-circle"} me-2`}></i>
                  {message}
                </div>
              )}

              <div className="form-group-new">
                <label className="form-label-new">
                  <i className="bi bi-lock-fill me-2 text-warning"></i>Old Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  className="form-control-new"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-group-new">
                <label className="form-label-new">
                  <i className="bi bi-lock-fill me-2 text-warning"></i>New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="form-control-new"
                  placeholder="Enter your new password (min 8 characters)"
                />
              </div>

              <div className="form-group-new">
                <label className="form-label-new">
                  <i className="bi bi-lock-fill me-2 text-warning"></i>Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="form-control-new"
                  placeholder="Confirm your new password"
                />
              </div>

              <div className="password-strength-info mt-3 p-3 rounded" style={{backgroundColor: "#f8f9fa"}}>
                <p className="mb-1"><strong>Password Requirements:</strong></p>
                <ul className="mb-0" style={{fontSize: "0.9rem"}}>
                  <li>Minimum 8 characters</li>
                  <li>Must contain at least one uppercase letter</li>
                  <li>Must contain at least one lowercase letter</li>
                  <li>Must contain at least one number</li>
                  <li>Must contain at least one special character (!@#$%^&*)</li>
                  <li>Must be different from old password</li>
                  <li>Passwords must match in both fields</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer-new">
              <button 
                className="btn-cancel-new"
                onClick={closePasswordModal}
              >
                <i className="bi bi-x-circle me-2"></i>Cancel
              </button>
              <button 
                className="btn-save-new"
                onClick={handleChangePassword}
                disabled={loading}
              >
                <i className="bi bi-check-circle me-2"></i>
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;