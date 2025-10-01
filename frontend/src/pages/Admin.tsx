import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Dashboard from "../subPages/adminPages/Dashboard";
import Inventory from "../subPages/adminPages/Inventory";
import Orders from "../subPages/adminPages/Orders";
import Users from "../subPages/adminPages/Users";
import Settings from "../subPages/adminPages/Settings";

const Admin: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState("Loading admin tools...");
  const [activeSection, setActiveSection] = useState("Dashboard"); // NEW

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

  // Function to render content based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return <Dashboard />;
      case "Inventory":
        return <Inventory />;
      case "Orders":
        return <Orders />;
      case "Users":
        return <Users />;
      case "Settings":
        return <Settings />;
      default:
        return <p>Select a section from the sidebar.</p>;
    }
  };

  return (
    <div className="admin-portal">
      <NavBar />
      <main className="admin-portal__content">
        <div className="adminPortalContainer">
          <h1 className="adminPortalHeading">Admin Portal</h1>
          <div className="adminPortalSidebar">
            <ul className="adminPortalSidebarList">
              {["Dashboard", "Inventory", "Orders", "Users", "Settings"].map(
                (item) => (
                  <li
                    key={item}
                    className={`adminPortalSidebarItem adminPortalSidebarItem--${item.toLowerCase()}`}
                    onClick={() => setActiveSection(item)}
                    style={{ cursor: "pointer" }}
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="adminPortalMain">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
