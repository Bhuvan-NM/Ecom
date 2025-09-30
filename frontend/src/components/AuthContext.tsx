import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  profilePicture?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (storedUser && token) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("user");
      }
    }

    if (!token) {
      return;
    }

    let isSubscribed = true;

    (async () => {
      try {
        const response = await axios.get("http://localhost:1337/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (isSubscribed && response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
      } catch (error) {
        if (isSubscribed) {
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
          setUser(null);
        }
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("authToken", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
