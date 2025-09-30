import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";

const Admin: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState("Loading admin tools...");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setStatusMessage("Missing authentication token");
      return;
    }

    const fetchAdminStatus = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1337/auth/admin/overview",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        setStatusMessage(response.data?.message ?? "Admin data loaded");
      } catch (error) {
        setStatusMessage("Unable to load admin data");
      }
    };

    fetchAdminStatus();
  }, []);

  return (
    <div className="admin-portal">
      <NavBar />
      <main className="admin-portal__content">
        <div className="adminPortalContainer">
          <h1 className="adminPortalHeading">Admin Portal</h1>
          <div className="adminPortalSidebar">
            <ul className="adminPortalSidebarList">
              <li className="adminPortalSidebarItem active">Dashboard</li>
              <li className="adminPortalSidebarItem">Inventory</li>
              <li className="adminPortalSidebarItem">Orders</li>
              <li className="adminPortalSidebarItem">Users</li>
              <li className="adminPortalSidebarItem">Settings</li>
            </ul>
          </div>
          <div className="adminPortalMain">
            <h2 className="adminPortalSubheading">Dashboard</h2>
            <p className="adminPortalStatusMessage">{statusMessage}</p>
            {/* Additional admin dashboard content can go here */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
