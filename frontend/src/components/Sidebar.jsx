import React, { useContext } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { AuthContext } from '../context/AuthContext';
import { getImageUrl } from '../api/axiosInstance';

const DRAWER_WIDTH = 240;

// Nav items per role
const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard',      icon: <DashboardOutlinedIcon />,           path: '/admin/dashboard' },
    { label: 'Clubs',          icon: <BusinessOutlinedIcon />,            path: '/admin/clubs' },
    { label: 'Users',          icon: <PeopleAltOutlinedIcon />,           path: '/admin/users' },
    { label: 'Events',         icon: <EventOutlinedIcon />,               path: '/admin/events' },
    { label: 'Announcements',  icon: <CampaignOutlinedIcon />,            path: '/admin/announcements' },
    { label: 'Profile',        icon: <PersonOutlinedIcon />,              path: '/profile' },
  ],
  president: [
    { label: 'Dashboard',      icon: <DashboardOutlinedIcon />,           path: '/president/dashboard' },
    { label: 'My Club',        icon: <BusinessOutlinedIcon />,            path: '/president/club' },
    { label: 'Browse Clubs',   icon: <GroupsOutlinedIcon />,              path: '/clubs' },
    { label: 'Members',        icon: <GroupsOutlinedIcon />,              path: '/president/members' },
    { label: 'Manage Events',  icon: <EventOutlinedIcon />,               path: '/president/events' },
    { label: 'Manage Announcements', icon: <CampaignOutlinedIcon />,      path: '/president/announcements' },
    { label: 'All Events',     icon: <EventOutlinedIcon />,               path: '/events' },
    { label: 'Announcements Wall', icon: <CampaignOutlinedIcon />,        path: '/announcements' },
    { label: 'Profile',        icon: <PersonOutlinedIcon />,              path: '/profile' },
  ],
  secretary: [
    { label: 'Dashboard',      icon: <DashboardOutlinedIcon />,           path: '/secretary/dashboard' },
    { label: 'My Club',        icon: <BusinessOutlinedIcon />,            path: '/secretary/club' },
    { label: 'Browse Clubs',   icon: <GroupsOutlinedIcon />,              path: '/clubs' },
    { label: 'Members',        icon: <GroupsOutlinedIcon />,              path: '/secretary/members' },
    { label: 'Manage Events',  icon: <EventOutlinedIcon />,               path: '/secretary/events' },
    { label: 'Manage Announcements', icon: <CampaignOutlinedIcon />,      path: '/secretary/announcements' },
    { label: 'All Events',     icon: <EventOutlinedIcon />,               path: '/events' },
    { label: 'Announcements Wall', icon: <CampaignOutlinedIcon />,        path: '/announcements' },
    { label: 'Profile',        icon: <PersonOutlinedIcon />,              path: '/profile' },
  ],
  member: [
    { label: 'Dashboard',      icon: <DashboardOutlinedIcon />,           path: '/dashboard' },
    { label: 'Clubs',          icon: <GroupsOutlinedIcon />,              path: '/clubs' },
    { label: 'Events',         icon: <EventOutlinedIcon />,               path: '/events' },
    { label: 'Announcements',  icon: <CampaignOutlinedIcon />,            path: '/announcements' },
    { label: 'Profile',        icon: <PersonOutlinedIcon />,              path: '/profile' },
  ],
};

// Fallback roles use member nav
const getNavItems = (systemRole) =>
  NAV_ITEMS[systemRole] || NAV_ITEMS.member;

// Role display labels for the sidebar bottom pill
const ROLE_LABELS = {
  admin:          { label: 'Website Admin',  color: '#DC2626', bg: '#FEE2E2' },
  president:      { label: 'President',      color: '#B45309', bg: '#FEF3C7' },
  secretary:      { label: 'Secretary',      color: '#7C3AED', bg: '#F3F0FF' },
  vice_president: { label: 'Vice President', color: '#4F2BCB', bg: '#EEF2FF' },
  member:         { label: 'Member',         color: '#475569', bg: '#F1F5F9' },
};

const SidebarContent = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, systemRole, presidentOfClubs, secretaryOfClubs } = useContext(AuthContext);

  const navItems = getNavItems(systemRole);
  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';
  const roleInfo = ROLE_LABELS[systemRole] || ROLE_LABELS.member;

  // Club name shown under role
  let clubName = '';
  if (systemRole === 'president' && presidentOfClubs?.length > 0) {
    clubName = presidentOfClubs[0].club_name;
  } else if (systemRole === 'secretary' && secretaryOfClubs?.length > 0) {
    clubName = secretaryOfClubs[0].club_name;
  }

  const handleNav = (path) => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E9E7F2',
        pt: 1,
      }}
    >
      {/* Logo area (below top bar) */}
      <Box sx={{ px: 2.5, py: 2, mb: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: '#9DA0AE', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Navigation
        </Typography>
      </Box>

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1.5 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: '10px',
                  py: 1,
                  px: 1.5,
                  backgroundColor: isActive ? '#F3F0FF' : 'transparent',
                  color: isActive ? '#4F2BCB' : '#555565',
                  fontWeight: isActive ? 700 : 500,
                  '&:hover': {
                    backgroundColor: isActive ? '#ECEAFF' : '#FAF9FF',
                    color: '#4F2BCB',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#4F2BCB' : '#9DA0AE',
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      borderRadius: '4px',
                      backgroundColor: '#4F2BCB',
                      flexShrink: 0,
                      ml: 1,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User / Role bottom pill */}
      <Box
        sx={{
          p: 2,
          m: 2,
          borderRadius: '12px',
          backgroundColor: '#F7F6FC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #E9E7F2',
          cursor: 'pointer',
          '&:hover': { backgroundColor: '#ECEAFF' },
        }}
        onClick={() => handleNav('/profile')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Avatar
            src={getImageUrl(user?.avatar_url || user?.avatarUrl)}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: '#4F2BCB',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {user?.avatar_url || user?.avatarUrl ? null : initial}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#20202A',
                fontSize: '0.82rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.username || 'User'}
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                px: 0.8,
                py: 0.1,
                borderRadius: '20px',
                backgroundColor: roleInfo.bg,
                mt: 0.3,
              }}
            >
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: roleInfo.color }}>
                {roleInfo.label}
              </Typography>
            </Box>
            {clubName && (
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  color: '#777788',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mt: 0.2,
                }}
              >
                {clubName}
              </Typography>
            )}
          </Box>
        </Box>
        <ChevronRightIcon sx={{ fontSize: 18, color: '#9DA0AE', flexShrink: 0 }} />
      </Box>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', mt: '64px' },
        }}
      >
        <SidebarContent onItemClick={onMobileClose} />
      </Drawer>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            mt: '64px',
            height: 'calc(100vh - 64px)',
            borderRight: '1px solid #E9E7F2',
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </>
  );
};

export default Sidebar;
