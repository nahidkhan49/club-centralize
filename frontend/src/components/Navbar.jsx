import React, { useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
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
  Tooltip,
  Chip,
} from '@mui/material';
import { NotificationsNone, ShieldOutlined, Menu as MenuIcon } from '@mui/icons-material';
import AndroidIcon from '@mui/icons-material/Android';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getImageUrl } from '../api/axiosInstance';
import AdminBrandingModal from './AdminBrandingModal';

export default function Navbar({ onDrawerToggle }) {
  const { user, systemRole, logout } = useContext(AuthContext);
  const { siteName, siteLogo, apkUrl } = useSiteSettings();
  const username = user?.username || 'User';
  const initial = username.charAt(0).toUpperCase();
  const navigate = useNavigate();
  const isAdmin = systemRole === 'admin';

  const [anchorEl, setAnchorEl] = useState(null);
  const [brandingOpen, setBrandingOpen] = useState(false);
  const open = Boolean(anchorEl);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiAnchorEl, setNotiAnchorEl] = useState(null);
  const notiOpen = Boolean(notiAnchorEl);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications/'),
        api.get('/notifications/unread-count')
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(countRes.data?.unread_count || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotiOpen = (event) => {
    setNotiAnchorEl(event.currentTarget);
  };

  const handleNotiClose = () => {
    setNotiAnchorEl(null);
  };

  const handleNotificationClick = async (noti) => {
    try {
      if (!noti.is_read) {
        await api.post(`/notifications/${noti.id}/read`);
        setNotifications(prev =>
          prev.map(n => n.id === noti.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      handleNotiClose();
      if (noti.link) {
        navigate(noti.link);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  function formatRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
  }

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

  const handleDownloadApk = () => {
    if (apkUrl) {
      const link = document.createElement('a');
      link.href = apkUrl;
      link.setAttribute('download', `${siteName.toLowerCase().replace(/\s+/g, '-')}.apk`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Mobile app APK is not uploaded yet.');
    }
  };

  return (
    <>
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

          {/* Right actions: Download App Button + Notifications + Profile Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* APK Download Button in Main Bar */}
            <Tooltip title="Download Android Mobile App (.APK)">
              <Chip
                icon={<AndroidIcon style={{ color: '#FFFFFF', fontSize: 18 }} />}
                label="Get App (.APK)"
                clickable
                onClick={handleDownloadApk}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              />
            </Tooltip>

            <IconButton
              onClick={handleNotiOpen}
              sx={{ color: '#FFFFFF', opacity: 0.9, '&:hover': { opacity: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsNone sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notiAnchorEl}
              open={notiOpen}
              onClose={handleNotiClose}
              onClick={handleNotiClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  width: { xs: 280, sm: 360 },
                  maxHeight: 480,
                  borderRadius: 2,
                  border: '1px solid #E9E7F2',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
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
              {/* Header */}
              <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F7FD', borderBottom: '1px solid #E9E7F2' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A' }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Chip
                    label="Mark all read"
                    size="small"
                    clickable
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAllRead();
                    }}
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#ECEAFF',
                      color: '#4F2BCB',
                      border: '1px solid #C7B8FF',
                      '&:hover': { backgroundColor: '#D5CFFF' }
                    }}
                  />
                )}
              </Box>

              {/* Roster of notifications */}
              <Box sx={{ overflowY: 'auto', flex: 1, maxHeight: 380 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9DA0AE', fontWeight: 500 }}>
                      No notifications yet
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((noti) => (
                    <Box
                      key={noti.id}
                      onClick={() => handleNotificationClick(noti)}
                      sx={{
                        px: 2,
                        py: 1.5,
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F0EEFA',
                        backgroundColor: noti.is_read ? 'transparent' : 'rgba(79, 43, 203, 0.04)',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(79, 43, 203, 0.08)'
                        }
                      }}
                    >
                      {/* Active Dot */}
                      {!noti.is_read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#4F2BCB',
                            mt: 0.8,
                            flexShrink: 0
                          }}
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: noti.is_read ? 600 : 800,
                            color: '#20202A',
                            fontSize: '0.85rem'
                          }}
                        >
                          {noti.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#6E6D7A',
                            fontSize: '0.8rem',
                            mt: 0.3,
                            lineHeight: 1.4
                          }}
                        >
                          {noti.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#9DA0AE',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            mt: 0.5,
                            display: 'block'
                          }}
                        >
                          {formatRelativeTime(noti.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Menu>

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
                  minWidth: 200,
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
                  {user?.role || systemRole || 'Member'}
                </Typography>
              </Box>

              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setBrandingOpen(true);
                  }}
                  sx={{ fontSize: '0.9rem', py: 1, gap: 1 }}
                >
                  <BrandingWatermarkOutlinedIcon fontSize="small" sx={{ color: '#4F2BCB' }} />
                  Site & APK Settings
                </MenuItem>
              )}

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

      {/* Admin Branding Modal Trigger */}
      {isAdmin && (
        <AdminBrandingModal
          open={brandingOpen}
          onClose={() => setBrandingOpen(false)}
        />
      )}
    </>
  );
}
