import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
} from '@mui/material';
import { NotificationsNone, ShieldOutlined, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getImageUrl } from '../api/axiosInstance';

export default function Navbar({ onDrawerToggle }) {
  const { user, logout } = useContext(AuthContext);
  const { siteName, siteLogo } = useSiteSettings();
  const username = user?.username || 'User';
  const initial = username.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#4F2BCB',
        color: '#FFFFFF',
        height: 64,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar sx={{ height: 64, px: { xs: 1.5, sm: 3 }, display: 'flex', justifyContent: 'space-between' }}>
        {/* Left: Mobile Toggle + Brand Logo & Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              mr: { xs: 0.5, sm: 1 },
              p: 1,
            }}
          >
            <MenuIcon sx={{ fontSize: 24 }} />
          </IconButton>

          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            <Avatar
              src={siteLogo}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            >
              <ShieldOutlined sx={{ color: '#FFFFFF', fontSize: 20 }} />
            </Avatar>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1rem', sm: '1.15rem' },
                whiteSpace: 'nowrap',
              }}
            >
              {siteName}
            </Typography>
          </Box>
        </Box>

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton sx={{ color: '#FFFFFF', opacity: 0.9, '&:hover': { opacity: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
            <Badge variant="dot" color="error">
              <NotificationsNone sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
            <Avatar
              src={getImageUrl(user?.avatar_url || user?.avatarUrl)}
              sx={{
                width: 36,
                height: 36,
                backgroundColor: '#E0DBFF',
                color: '#4F2BCB',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '2px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              {user?.avatar_url || user?.avatarUrl ? null : initial}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                border: '1px solid #E9E7F2',
                overflow: 'visible',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 18,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A' }}>
                {username}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6E6D7A' }}>
                {user?.role || 'Member'}
              </Typography>
            </Box>
            <MenuItem onClick={handleProfile} sx={{ fontSize: '0.9rem', py: 1 }}>
              My Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ fontSize: '0.9rem', py: 1, color: '#EF4444' }}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
