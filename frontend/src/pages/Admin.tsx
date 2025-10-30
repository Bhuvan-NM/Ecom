import React, { useEffect, useState } from "react";
import api from "../lib/api";
import NavBar from "../components/NavBar";
import Dashboard from "../subPages/adminPages/Dashboard";
import Inventory from "../subPages/adminPages/Inventory";
import Orders from "../subPages/adminPages/Orders";
import Users from "../subPages/adminPages/Users";
import Settings from "../subPages/adminPages/Settings";

const Admin: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState("Loading admin tools...");
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setStatusMessage("Missing authentication token");
      return;
    }

    const fetchAdminStatus = async () => {
      try {
        const response = await api.get("/auth/admin/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStatusMessage(response.data?.message ?? "Admin data loaded");
      } catch (error) {
        setStatusMessage("Unable to load admin data");
      }
    };

    fetchAdminStatus();
  }, []);

  const menuItems = ["Dashboard", "Inventory", "Orders", "Users", "Settings"];

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

  const handleSelect = (item: string) => {
    setActiveSection(item);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <div className="admin-portal">
      <NavBar />
      <main className="admin-portal__content">
        <div className="adminPortalContainer">
          <h1 className="adminPortalHeading">Admin Portal</h1>
          {isMenuOpen && (
            <div
              className="adminPortalFloatingMenu__overlay"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
          <div
            className={`adminPortalFloatingMenu${
              isMenuOpen ? " adminPortalFloatingMenu--open" : ""
            }`}
          >
            <button
              type="button"
              className="adminPortalFloatingMenu__trigger"
              aria-label={isMenuOpen ? "Close admin navigation" : "Open admin navigation"}
              aria-expanded={isMenuOpen ? "true" : "false"}
              onClick={toggleMenu}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="adminPortalFloatingMenu__bubble">
              <p className="adminPortalFloatingMenu__status">{statusMessage}</p>
              <ul className="adminPortalFloatingMenu__list">
                {menuItems.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      className={`adminPortalFloatingMenu__item${
                        activeSection === item ? " adminPortalFloatingMenu__item--active" : ""
                      }`}
                      onClick={() => handleSelect(item)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="adminPortalMain">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
