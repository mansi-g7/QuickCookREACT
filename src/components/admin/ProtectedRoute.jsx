import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAdminLoggedIn, children }) => {
  // If not logged in, redirect to admin login page
  if (!isAdminLoggedIn) {
    // Clear any stale authentication data
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminRole');
    
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
