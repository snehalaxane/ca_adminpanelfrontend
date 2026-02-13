import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/me`, {
          credentials: "include",
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/admin/logout`, {
      method: "POST",
      credentials: "include",
    });

    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>; // or spinner
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
