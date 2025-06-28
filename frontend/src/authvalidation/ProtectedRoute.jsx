import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children,allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  console.log("Token:", token);
  console.log("Role:", role);
  console.log("AllowedRole:", allowedRole);


  if (!token || role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
