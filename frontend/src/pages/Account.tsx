import React, { useState, useContext } from "react";
import NavBar from "components/NavBar";
import { AuthContext } from "components/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Edit from "assets/icons/Edit";
import ProfileImageSolid from "assets/icons/ProfileImageSolid";
import Tick from "assets/icons/Tick";

const Account = () => {
  const { user, logout, login } = useContext(AuthContext)!;
  const navigate = useNavigate();

  // State for edit mode and form data
  const [isEditing, setIsEditing] = useState(false);
  const [cardId, setCardId] = useState<String>("");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle edit toggle
  const handleEdit = (id: String) => {
    setIsEditing(true);

    setCardId(id);
  };

  // Handle save (update user info)
  const handleSave = async () => {
    try {
      const response = await axios.put(
        "http://localhost:1337/auth/update",
        formData,
        { withCredentials: true } // ✅ Cookie-based authentication
      );

      // ✅ Update global state with new user data
      login(response.data.user, response.data.token);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update profile.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="account_main">
      <NavBar />

      <div className="account_container">
        <div className="account_card-profile">
          {isEditing ? (
            <>
              <span
                className="profile-edit"
                onClick={handleSave}
              >
                <Tick className="profile-edit" />
              </span>
            </>
          ) : (
            <>
              <span
                className="profile-edit"
                onClick={() => {
                  handleEdit("Profile");
                }}
              >
                <Edit className="profile-edit" />
              </span>
            </>
          )}

          <span className="profile-image">
            <ProfileImageSolid className="profile-image" />
          </span>
          <h2 className="profile-title">
            {isEditing && cardId === "Profile" ? (
              <>
                <input
                  type="text"
                  name="firstName"
                  className="profile-input"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="lastName"
                  className="profile-input"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </>
            ) : (
              `${user?.firstName} ${user?.lastName}`
            )}
          </h2>

          <form action="">
            <p className="profile-email">
              {isEditing && cardId === "Profile" ? (
                <input
                  type="email"
                  name="email"
                  className="profile-input input-email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              ) : (
                `Email: ${user?.email}`
              )}
            </p>
          </form>
          <button
            className="profile-logoutBtn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="account_card-contactInfo">
          <h3>Contact Info</h3>
          {isEditing && cardId === "Contact" ? (
            <input
              type="tel"
              name="phoneNumber"
              onChange={handleChange}
            />
          ) : (
            <p>{}</p>
          )}
        </div>

        <div className="account_card-orderHistory">
          <h3>Order History</h3>
          {/* Order history logic here */}
        </div>
      </div>
    </div>
  );
};

export default Account;
