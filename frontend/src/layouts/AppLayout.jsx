import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAF9FF' }}>
      <CssBaseline />
      <Navbar onDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />
      
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 2.5, md: 3.5 },
          mt: '64px',
          width: '100%',
          maxWidth: '100%',
          backgroundColor: '#FAF9FF',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
