import React, { useContext, useState, useEffect } from 'react';
import api, { getImageUrl } from '../api/axiosInstance';
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
  InputBase,
  Divider,
} from '@mui/material';
import {
  NotificationsNoneOutlined,
  ShieldOutlined,
  Menu as MenuIcon,
  Search as SearchIcon,
  PersonOutlineOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import AndroidIcon from '@mui/icons-material/Android';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
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

  const [headerSearch, setHeaderSearch] = useState('');

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications/'),
        api.get('/notifications/unread-count'),
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
      const interval = setInterval(fetchNotifications, 6000);
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
        setNotifications((prev) =>
          prev.map((n) => (n.id === noti.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
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
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  function formatRelativeTime(dateString) {
    if (!dateString) return 'Recent';
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

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && headerSearch.trim()) {
      navigate(`/events?search=${encodeURIComponent(headerSearch.trim())}`);
      setHeaderSearch('');
    }
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 20px rgba(79, 43, 203, 0.15)',
        }}
      >
        <Toolbar
          sx={{
            height: 64,
            px: { xs: 1.5, sm: 2.5, md: 3.5 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
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
                borderRadius: '10px',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
              }}
            >
              <MenuIcon sx={{ fontSize: 24 }} />
            </IconButton>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => navigate('/dashboard')}
            >
              <Avatar
                src={siteLogo}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                  flexShrink: 0,
                }}
              >
                <ShieldOutlined sx={{ color: '#FFFFFF', fontSize: 22 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.05rem', sm: '1.2rem' },
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {siteName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  Campus Life Hub
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Center: Search Bar (Desktop) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '12px',
              px: 2,
              py: 0.6,
              width: { md: 280, lg: 360 },
              transition: 'all 0.2s ease',
              '&:focus-within': {
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                borderColor: 'rgba(255, 255, 255, 0.45)',
                boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.15)',
              },
            }}
          >
            <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Search events, clubs, announcements..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              sx={{
                color: '#FFFFFF',
                fontSize: '0.86rem',
                width: '100%',
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              }}
            />
          </Box>

          {/* Right Actions: Get App Chip + Notification Bell + User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.8 } }}>
            {/* APK Download Button */}
            <Tooltip title="Download Android Mobile App (.APK)">
              <Chip
                icon={<AndroidIcon style={{ color: '#FFFFFF', fontSize: 18 }} />}
                label="Get App (.APK)"
                clickable
                onClick={handleDownloadApk}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.28)',
                    transform: 'translateY(-1px)',
                  },
                }}
              />
            </Tooltip>

            {/* Notification Bell */}
            <IconButton
              onClick={handleNotiOpen}
              aria-label="notifications"
              sx={{
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                p: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <NotificationsNoneOutlined sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>

            {/* Notification Menu Dropdown */}
            <Menu
              anchorEl={notiAnchorEl}
              open={notiOpen}
              onClose={handleNotiClose}
              onClick={handleNotiClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  width: { xs: 300, sm: 380 },
                  maxHeight: 500,
                  borderRadius: '18px',
                  border: '1px solid #E9E7F2',
                  boxShadow: '0 16px 36px rgba(79, 43, 203, 0.14)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* Header */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#F8F7FD',
                  borderBottom: '1px solid #E9E7F2',
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A' }}>
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip
                      label={unreadCount}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                      }}
                    />
                  )}
                </Box>
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
                      backgroundColor: '#F3F0FF',
                      color: '#4F2BCB',
                      border: '1px solid #D4CCF7',
                      '&:hover': { backgroundColor: '#E0DBFF' },
                    }}
                  />
                )}
              </Box>

              {/* Roster of notifications */}
              <Box sx={{ overflowY: 'auto', flex: 1, maxHeight: 380 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
                    <NotificationsNoneOutlined sx={{ fontSize: 36, color: '#9DA0AE', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#8E90A2', fontWeight: 600 }}>
                      No notifications yet
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((noti) => (
                    <Box
                      key={noti.id}
                      onClick={() => handleNotificationClick(noti)}
                      sx={{
                        px: 2.5,
                        py: 1.6,
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F4F2FA',
                        backgroundColor: noti.is_read ? 'transparent' : 'rgba(79, 43, 203, 0.04)',
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(79, 43, 203, 0.08)',
                        },
                      }}
                    >
                      {/* Active Dot */}
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: noti.is_read ? 'transparent' : '#4F2BCB',
                          mt: 0.8,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: noti.is_read ? 600 : 800,
                            color: '#20202A',
                            fontSize: '0.86rem',
                          }}
                        >
                          {noti.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#5E5D6E',
                            fontSize: '0.8rem',
                            mt: 0.3,
                            lineHeight: 1.4,
                          }}
                        >
                          {noti.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#8E90A2',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            mt: 0.5,
                            display: 'block',
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

            {/* Profile Avatar Trigger */}
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0.5,
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              <Avatar
                src={getImageUrl(user?.avatar_url || user?.avatarUrl)}
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: '#EDE9FE',
                  color: '#4F2BCB',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: '2px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {user?.avatar_url || user?.avatarUrl ? null : initial}
              </Avatar>
            </IconButton>

            {/* Profile Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  borderRadius: '18px',
                  border: '1px solid #E9E7F2',
                  boxShadow: '0 16px 36px rgba(79, 43, 203, 0.14)',
                  p: 1,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1EFF8', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A' }}>
                  {username}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#4F2BCB',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.role || systemRole || 'Member'}
                </Typography>
              </Box>

              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setBrandingOpen(true);
                  }}
                  sx={{
                    fontSize: '0.88rem',
                    py: 1.2,
                    px: 2,
                    borderRadius: '10px',
                    gap: 1.2,
                    fontWeight: 600,
                    color: '#20202A',
                    '&:hover': { backgroundColor: '#F3F0FF', color: '#4F2BCB' },
                  }}
                >
                  <BrandingWatermarkOutlinedIcon fontSize="small" sx={{ color: '#4F2BCB' }} />
                  Site & APK Settings
                </MenuItem>
              )}

              <MenuItem
                onClick={handleProfile}
                sx={{
                  fontSize: '0.88rem',
                  py: 1.2,
                  px: 2,
                  borderRadius: '10px',
                  gap: 1.2,
                  fontWeight: 600,
                  color: '#20202A',
                  '&:hover': { backgroundColor: '#F3F0FF', color: '#4F2BCB' },
                }}
              >
                <PersonOutlineOutlined fontSize="small" sx={{ color: '#5E5D6E' }} />
                My Profile
              </MenuItem>

              <Divider sx={{ my: 0.5, borderColor: '#F1EFF8' }} />

              <MenuItem
                onClick={handleLogout}
                sx={{
                  fontSize: '0.88rem',
                  py: 1.2,
                  px: 2,
                  borderRadius: '10px',
                  gap: 1.2,
                  fontWeight: 700,
                  color: '#EF4444',
                  '&:hover': { backgroundColor: '#FEE2E2' },
                }}
              >
                <LogoutOutlined fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Admin Branding Modal */}
      {isAdmin && (
        <AdminBrandingModal
          open={brandingOpen}
          onClose={() => setBrandingOpen(false)}
        />
      )}
    </>
  );
}
