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
        <h1>Admin Portal</h1>
        <p>{statusMessage}</p>
        <p>
          Use this space to build out dashboards, inventory managers, and other
          tools only administrators should access.
        </p>
      </main>
    </div>
  );
};

export default Admin;
