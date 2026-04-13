import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAdminLoggedIn, children }) => {
  const hasPersistedAdminSession =
    localStorage.getItem('adminLoggedIn') === 'true' &&
    Boolean(localStorage.getItem('adminToken'));

  if (!isAdminLoggedIn && !hasPersistedAdminSession) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
