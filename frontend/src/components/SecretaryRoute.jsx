import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/** Secretary, President, and Admin can access secretary routes */
const SecretaryRoute = () => {
  const { isAuthenticated, loading, systemRole } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Admin, President, and Secretary are allowed
  if (systemRole === 'admin' || systemRole === 'president' || systemRole === 'secretary') {
    return <Outlet />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default SecretaryRoute;
