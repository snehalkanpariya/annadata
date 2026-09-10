import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

// Sample JWT tokens for demo/testing mode (Renter vs Provider)
// In a production setup, user would log in via POST /api/login
const DEMO_RENTER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjFhYmNkZWYxMjM0NTY3ODkwMTIzNCIsIm5hbWUiOiJSYW1lc2ggS3VtYXIiLCJyb2xlIjoiRkFSTUVSIiwiaWF0IjoxNTE2MjM5MDIyfQ.sample_renter_sig";
const DEMO_PROVIDER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjFhYmNkZWYxMjM0NTY3ODkwNTY3OCIsIm5hbWUiOiJTdXJlc2ggUGF0ZWwiLCJyb2xlIjoiUFJPVklERVIiLCJpYXQiOjE1MTYyMzkwMjJ9.sample_provider_sig";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [activeRole, setActiveRole] = useState("RENTER"); // 'RENTER' | 'PROVIDER'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("auth_token");
      const storedRole = await AsyncStorage.getItem("active_role");
      
      if (storedRole) {
        setActiveRole(storedRole);
      } else {
        await AsyncStorage.setItem("active_role", "RENTER");
      }

      if (storedToken) {
        setToken(storedToken);
      } else {
        // Set default demo token for seamless out-of-the-box usage
        const initialToken = DEMO_RENTER_TOKEN;
        await AsyncStorage.setItem("auth_token", initialToken);
        setToken(initialToken);
      }
    } catch (e) {
      console.warn("Failed to load auth state", e);
    } finally {
      setLoading(false);
    }
  };

  const setAuthToken = async (newToken) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem("auth_token", newToken);
        setToken(newToken);
      } else {
        await AsyncStorage.removeItem("auth_token");
        setToken(null);
      }
    } catch (e) {
      console.error("Error setting token:", e);
    }
  };

  const toggleUserRole = async (role) => {
    const targetRole = role || (activeRole === "RENTER" ? "PROVIDER" : "RENTER");
    try {
      await AsyncStorage.setItem("active_role", targetRole);
      setActiveRole(targetRole);
      
      // Auto switch demo token based on role for easy API testing
      const roleToken = targetRole === "RENTER" ? DEMO_RENTER_TOKEN : DEMO_PROVIDER_TOKEN;
      await setAuthToken(roleToken);
    } catch (e) {
      console.error("Error toggling role:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        activeRole,
        loading,
        setAuthToken,
        toggleUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
