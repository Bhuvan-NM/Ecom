import React, { useState, useContext } from "react";
import NavBar from "../components/NavBar";
import { AuthContext } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import Edit from "../assets/icons/Edit";
import ProfileImageSolid from "../assets/icons/ProfileImageSolid";
import Tick from "../assets/icons/Tick";

const Account = () => {
  const { user, logout, login } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [isEmailValid, setIsEmailValid] = useState(true);

  // State for edit mode and form data
  const [isEditing, setIsEditing] = useState(false);
  const [cardId, setCardId] = useState<String>("");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    password: "",
    phoneNumber: user?.phoneNumber || "",
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setIsEmailValid(emailRegex.test(e.target.value)); // ✅ Updates validation state
    }
  };

  // Handle edit toggle
  const handleEdit = (id: String) => {
    setIsEditing(true);

    setCardId(id);
  };

  // Handle save (update user info)
  const handleSave = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      // ✅ Only include non-empty password
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const response = await api.put("/auth/update", payload);

      // ✅ Update user context
      login(response.data.user, response.data.token);
      setIsEditing(false);
      setFormData({ ...formData, password: "" }); // clear password field
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
          <p className="profile-name">
            {isEditing && cardId === "Profile" ? (
              <>
                <div className="profile-input-name-container">
                  <div className="profile-input-Wrapper">
                    <input
                      type="text"
                      name="firstName"
                      className="profile-input"
                      placeholder="First Name"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="firstName"
                      className="profile-input-label"
                    >
                      First Name
                    </label>
                  </div>
                  <div className="profile-input-Wrapper">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      className="profile-input"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="lastName"
                      className="profile-input-label"
                    >
                      Last Name
                    </label>
                  </div>
                </div>
              </>
            ) : (
              `${user?.firstName} ${user?.lastName}`
            )}
          </p>

          <p className="profile-email">
            {isEditing && cardId === "Profile" ? (
              <>
                <div className="profile-input-Wrapper">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className={`profile-input input-email ${
                      isEmailValid ? "" : "invalid-border"
                    }`}
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label
                    htmlFor="email"
                    className="profile-input-label"
                  >
                    Email
                  </label>
                </div>
              </>
            ) : (
              `Email: ${user?.email}`
            )}
          </p>

          <p className="profile-password">
            {isEditing && cardId === "Profile" ? (
              <>
                <div className="profile-input-Wrapper">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="profile-input input-password"
                    placeholder="Enter New Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label
                    htmlFor="password"
                    className="profile-input-label"
                  >
                    Password
                  </label>
                </div>
              </>
            ) : (
              `Password: ********`
            )}
          </p>

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
            <p className="account_card-contactInfo-PhoneNumber">
              Phone Number: {user?.phoneNumber}
            </p>
          )}
        </div>

        <div className="account_card-orderHistory">
          <h3>Order History</h3>
          {/* Order history logic here */}
        </div>

        {user?.isAdmin && (
          <button
            className="account__admin-link"
            onClick={() => navigate("/admin")}
          >
            Go to Admin Portal
          </button>
        )}
      </div>
    </div>
  );
};

export default Account;
