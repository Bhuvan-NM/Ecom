import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

interface RequireAdminProps {
  children: JSX.Element;
}

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth?.user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!auth.user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;
