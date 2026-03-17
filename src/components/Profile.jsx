import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import "./Profile.css";

const Profile = () => {

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {

      const res = await userService.getProfile();

      if (res.success) {
        setProfile(res.user);
      }

    };

    loadProfile();

  }, [navigate]);

  const handleLogout = () => {

    userService.logout();
    navigate("/login");

  };

  return (

    <div className="profile-page">

      <div className="profile-hero">

        <div className="profile-hero-content">

          <div className="avatar-circle">
            {profile?.name?.charAt(0) || "U"}
          </div>

          <div className="profile-info">

            <h2>{profile?.name || "User"}</h2>

            <p>Food lover and cooking enthusiast!</p>

            <div className="profile-meta">

              <span>{profile?.email}</span>

              <span>Joined March 2026</span>

            </div>

          </div>

          <div className="profile-actions">

            <button className="btn btn-light">Edit Profile</button>

            <button
              className="btn btn-outline-light"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </div>

  );
};

export default Profile;