import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/api";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    gender: "",
    address: "",
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const res = await userService.getProfile();
    if (res.success) {
      setProfile(res.user);
      setEditForm({
        name: res.user.name,
        mobile: res.user.mobile,
        gender: res.user.gender,
        address: res.user.address,
        profilePicture: null
      });
    }
  };

  const handleLogout = () => {
    userService.logout();
    navigate("/");
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setEditForm({ ...editForm, profilePicture: files[0] });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      setMessage("Name is required");
      return;
    }
    if (!/^\d{10}$/.test(editForm.mobile)) {
      setMessage("Mobile must be 10 digits");
      return;
    }
    if (!editForm.gender) {
      setMessage("Select gender");
      return;
    }
    if (!editForm.address.trim()) {
      setMessage("Address is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("mobile", editForm.mobile);
    formData.append("gender", editForm.gender);
    formData.append("address", editForm.address);

    if (editForm.profilePicture) {
      formData.append("profilePicture", editForm.profilePicture);
    }

    setLoading(true);
    const res = await userService.updateProfile(formData);
    setLoading(false);

    if (res.success) {
      setMessage("Profile updated successfully!");
      setShowEditModal(false);
      loadProfile();
    } else {
      setMessage(res.message || "Update failed");
    }
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
            <div className="profile-card shadow-lg">
              <div className="profile-card-header">
                <div className="avatar-large">
                  {profile?.name?.charAt(0) || "U"}
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
                  onClick={() => setShowEditModal(true)}
                >
                  <i className="bi bi-pencil-square me-2"></i>Edit Profile
                </button>
                <button 
                  className="btn btn-danger fw-bold px-4"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header with Gradient */}
            <div className="modal-header-gradient">
              <h2>
                <i className="bi bi-pencil-square me-2"></i>Edit Your Profile
              </h2>
              <button 
                className="btn-close-new"
                onClick={() => setShowEditModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body-new">
              {message && (
                <div className={`alert-custom ${message.includes("successfully") ? "alert-success-custom" : "alert-danger-custom"}`}>
                  <i className={`bi ${message.includes("successfully") ? "bi-check-circle" : "bi-exclamation-circle"} me-2`}></i>
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
                    placeholder="10 digit mobile"
                    maxLength="10"
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
                onClick={() => setShowEditModal(false)}
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
    </div>
  );
};

export default Profile; 