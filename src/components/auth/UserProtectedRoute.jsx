import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const UserProtectedRoute = ({ children }) => {
  const location = useLocation();
  const userToken = localStorage.getItem('token');

  if (!userToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default UserProtectedRoute;
