import React, { createContext, useState, useEffect } from "react";
import api from "../lib/api";

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
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;

    (async () => {
      try {
        if (!token) {
          return;
        }

        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
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
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
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
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
