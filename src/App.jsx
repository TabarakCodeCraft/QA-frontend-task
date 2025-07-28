import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/homePage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import UserFormPage from "./pages/UserFormPage..jsx";
import apiService from "./services/api.js";

const App = () => {
  const [currentPage, setCurrentPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
//
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthToken(savedToken);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setCurrentPage("home");
        apiService.setToken(savedToken);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLoginSuccess = (loginData) => {
    
    const token = loginData.token;
    const user = loginData.user;
    
    if (token) {
      setAuthToken(token);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setCurrentPage("home");
      apiService.setToken(token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      console.error("No token received from login");
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    
    setAuthToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentPage("login");
    apiService.clearToken();
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <div>
        {!isLoggedIn ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage
                  token={authToken}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              } 
            />
            <Route 
              path="/user/create" 
              element={<UserFormPage />} 
            />
            <Route 
              path="/user/edit" 
              element={<UserFormPage />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;