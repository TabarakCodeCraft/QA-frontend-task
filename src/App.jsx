import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/homePage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import UserFormPage from "./pages/UserFormPage.jsx";
import apiService from "./services/api.js";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isTokenExpired = (token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp < currentTime + 300;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  };

  // Function to clear authentication data
  const clearAuthData = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    apiService.clearToken();
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
  };

  // Check for existing token on app initialization
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const savedToken = localStorage.getItem("authToken");
        const savedUser = localStorage.getItem("currentUser");

        if (savedToken && savedUser) {
          // Check if token is expired
          if (isTokenExpired(savedToken)) {
            console.log("Token expired, clearing auth data");
            clearAuthData();
          } else {
            // Token is valid, restore authentication state
            try {
              const user = JSON.parse(savedUser);
              setAuthToken(savedToken);
              setCurrentUser(user);
              setIsLoggedIn(true);
              apiService.setToken(savedToken);
              console.log("Authentication restored from localStorage");
            } catch (error) {
              console.error("Error parsing saved user data:", error);
              clearAuthData();
            }
          }
        }
      } catch (error) {
        console.error("Error checking existing auth:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingAuth();
  }, []);

  // Set up token expiration checking interval
  useEffect(() => {
    if (isLoggedIn && authToken) {
      const checkTokenInterval = setInterval(() => {
        if (isTokenExpired(authToken)) {
          console.log("Token expired during session, logging out");
          handleLogout();
        }
      }, 60000); // Check every minute

      return () => clearInterval(checkTokenInterval);
    }
  }, [isLoggedIn, authToken]);

  const handleLoginSuccess = (loginData) => {
    console.log("Login successful:", loginData);

    const token = loginData.token;
    const user = loginData.user;

    if (token && user) {
      // Check if the new token is valid
      if (isTokenExpired(token)) {
        console.error("Received expired token from server");
        return;
      }

      setAuthToken(token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      apiService.setToken(token);

      // Save to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      console.log("Authentication data saved to localStorage");
    } else {
      console.error("Invalid login data received:", {
        token: !!token,
        user: !!user,
      });
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    clearAuthData();
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isLoggedIn ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/"
          element={
            isLoggedIn ? (
              <HomePage
                onLogout={handleLogout}
                token={authToken}
                currentUser={currentUser}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/user/create"
          element={
            isLoggedIn ? (
              <UserFormPage
                token={authToken}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/user/edit"
          element={
            isLoggedIn ? (
              <UserFormPage
                token={authToken}
                currentUser={currentUser}
                onLogout={handleLogout}
                isEditing={true}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
