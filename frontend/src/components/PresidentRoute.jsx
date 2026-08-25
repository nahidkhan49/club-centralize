import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/** Only president (and admin) can access president routes */
const PresidentRoute = () => {
  const { isAuthenticated, loading, systemRole } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (systemRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (systemRole !== 'president') {
    if (systemRole === 'secretary') return <Navigate to="/secretary/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default PresidentRoute;
