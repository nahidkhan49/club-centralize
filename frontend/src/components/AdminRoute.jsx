import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/** Only admin (is_superuser) can access */
const AdminRoute = () => {
  const { isAuthenticated, loading, systemRole } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (systemRole !== 'admin') {
    // Redirect to their appropriate dashboard
    if (systemRole === 'president') return <Navigate to="/president/dashboard" replace />;
    if (systemRole === 'secretary') return <Navigate to="/secretary/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default AdminRoute;
