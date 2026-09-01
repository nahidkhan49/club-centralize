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
  Chip,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { AuthContext } from '../context/AuthContext';
import { useLiveUpdates } from '../context/LiveUpdatesContext';
import { getImageUrl } from '../api/axiosInstance';

const DRAWER_WIDTH = 254;

const ROLE_LABELS = {
  admin: { label: 'Platform Admin', color: '#DC2626', bg: '#FEE2E2' },
  president: { label: 'President', color: '#B45309', bg: '#FEF3C7' },
  secretary: { label: 'Secretary', color: '#7C3AED', bg: '#F3F0FF' },
  vice_president: { label: 'Vice President', color: '#4F2BCB', bg: '#EEF2FF' },
  treasurer: { label: 'Treasurer', color: '#059669', bg: '#D1FAE5' },
  event_manager: { label: 'Event Manager', color: '#0284C7', bg: '#E0F2FE' },
  member: { label: 'Campus Member', color: '#475569', bg: '#F1F5F9' },
};

const SidebarContent = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, systemRole, presidentOfClubs, secretaryOfClubs, memberships } = useContext(AuthContext);
  const { pendingJoinRequestsCount, unreadNotificationsCount } = useLiveUpdates();

  const isPresident =
    systemRole === 'president' || (Array.isArray(presidentOfClubs) && presidentOfClubs.length > 0);
  const isSecretary =
    !isPresident &&
    (systemRole === 'secretary' || (Array.isArray(secretaryOfClubs) && secretaryOfClubs.length > 0));
  const isAdmin = systemRole === 'admin';

  const myClubId = isPresident
    ? presidentOfClubs?.[0]?.club_id
    : isSecretary
    ? secretaryOfClubs?.[0]?.club_id
    : null;

  const myClubName = isPresident
    ? presidentOfClubs?.[0]?.club_name
    : isSecretary
    ? secretaryOfClubs?.[0]?.club_name
    : '';

  // Dynamic Navigation Sections based on Role
  let sections = [];

  if (isAdmin) {
    sections = [
      {
        title: 'OVERVIEW',
        items: [
          { label: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/admin/dashboard' },
        ],
      },
      {
        title: 'MANAGEMENT',
        items: [
          { label: 'All Clubs', icon: <BusinessOutlinedIcon />, path: '/admin/clubs' },
          { label: 'User Directory', icon: <PeopleAltOutlinedIcon />, path: '/admin/users' },
          { label: 'Events Hub', icon: <EventOutlinedIcon />, path: '/admin/events' },
          { label: 'Announcements', icon: <CampaignOutlinedIcon />, path: '/admin/announcements' },
        ],
      },
      {
        title: 'ACCOUNT',
        items: [
          { label: 'My Profile', icon: <PersonOutlinedIcon />, path: '/profile' },
        ],
      },
    ];
  } else if (isPresident) {
    sections = [
      {
        title: 'OVERVIEW',
        items: [
          { label: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/president/dashboard' },
          { label: 'My Club Hub', icon: <BusinessOutlinedIcon />, path: '/president/club' },
        ],
      },
      {
        title: 'CLUB OPERATIONS',
        items: [
          {
            label: 'Member Roster',
            icon: <PeopleAltOutlinedIcon />,
            path: '/president/members',
            badge: pendingJoinRequestsCount > 0 ? pendingJoinRequestsCount : null,
            badgeColor: '#EF4444',
          },
          { label: 'Manage Events', icon: <EventOutlinedIcon />, path: '/president/events' },
          { label: 'Broadcasts', icon: <CampaignOutlinedIcon />, path: '/president/announcements' },
          ...(myClubId
            ? [{ label: 'Club Chat', icon: <ForumOutlinedIcon />, path: `/clubs/${myClubId}/chat` }]
            : []),
        ],
      },
      {
        title: 'CAMPUS',
        items: [
          { label: 'Browse Clubs', icon: <GroupsOutlinedIcon />, path: '/clubs' },
          { label: 'Campus Events', icon: <EventOutlinedIcon />, path: '/events' },
          { label: 'Notice Wall', icon: <CampaignOutlinedIcon />, path: '/announcements' },
        ],
      },
      {
        title: 'ACCOUNT',
        items: [
          { label: 'My Profile', icon: <PersonOutlinedIcon />, path: '/profile' },
        ],
      },
    ];
  } else if (isSecretary) {
    sections = [
      {
        title: 'OVERVIEW',
        items: [
          { label: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/secretary/dashboard' },
          { label: 'My Club Hub', icon: <BusinessOutlinedIcon />, path: '/secretary/club' },
        ],
      },
      {
        title: 'CLUB OPERATIONS',
        items: [
          {
            label: 'Member Roster',
            icon: <PeopleAltOutlinedIcon />,
            path: '/secretary/members',
            badge: pendingJoinRequestsCount > 0 ? pendingJoinRequestsCount : null,
            badgeColor: '#EF4444',
          },
          { label: 'Manage Events', icon: <EventOutlinedIcon />, path: '/secretary/events' },
          { label: 'Broadcasts', icon: <CampaignOutlinedIcon />, path: '/secretary/announcements' },
          ...(myClubId
            ? [{ label: 'Club Chat', icon: <ForumOutlinedIcon />, path: `/clubs/${myClubId}/chat` }]
            : []),
        ],
      },
      {
        title: 'CAMPUS',
        items: [
          { label: 'Browse Clubs', icon: <GroupsOutlinedIcon />, path: '/clubs' },
          { label: 'Campus Events', icon: <EventOutlinedIcon />, path: '/events' },
          { label: 'Notice Wall', icon: <CampaignOutlinedIcon />, path: '/announcements' },
        ],
      },
      {
        title: 'ACCOUNT',
        items: [
          { label: 'My Profile', icon: <PersonOutlinedIcon />, path: '/profile' },
        ],
      },
    ];
  } else {
    // Regular Member: Keep existing navigation structure (DO NOT add Chat to main sidebar)
    sections = [
      {
        title: 'OVERVIEW',
        items: [
          { label: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/dashboard' },
        ],
      },
      {
        title: 'CAMPUS LIFE',
        items: [
          { label: 'Student Clubs', icon: <GroupsOutlinedIcon />, path: '/clubs' },
          { label: 'Events & Workshops', icon: <EventOutlinedIcon />, path: '/events' },
          { label: 'Announcements', icon: <CampaignOutlinedIcon />, path: '/announcements' },
        ],
      },
      {
        title: 'ACCOUNT',
        items: [
          { label: 'My Profile', icon: <PersonOutlinedIcon />, path: '/profile' },
        ],
      },
    ];
  }

  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';
  const roleInfo =
    ROLE_LABELS[isPresident ? 'president' : isSecretary ? 'secretary' : systemRole] ||
    ROLE_LABELS.member;

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
        overflowY: 'auto',
      }}
    >
      {/* Navigation Sections */}
      <Box sx={{ flex: 1, py: 2, px: 2 }}>
        {sections.map((section, idx) => (
          <Box key={section.title} sx={{ mb: idx === sections.length - 1 ? 0 : 2.5 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                mb: 1,
                display: 'block',
                color: '#8E90A2',
                fontWeight: 800,
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {section.title}
            </Typography>

            <List disablePadding>
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' &&
                    item.path !== '/admin/dashboard' &&
                    item.path !== '/president/dashboard' &&
                    item.path !== '/secretary/dashboard' &&
                    location.pathname.startsWith(item.path + '/'));

                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.6 }}>
                    <ListItemButton
                      onClick={() => handleNav(item.path)}
                      sx={{
                        borderRadius: '12px',
                        py: 1.1,
                        px: 1.6,
                        backgroundColor: isActive ? '#F3F0FF' : 'transparent',
                        color: isActive ? '#4F2BCB' : '#5E5D6E',
                        fontWeight: isActive ? 800 : 600,
                        transition: 'all 0.18s ease',
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: isActive ? '#EDE9FE' : '#FAF9FF',
                          color: '#4F2BCB',
                          transform: 'translateX(2px)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 34,
                          color: isActive ? '#4F2BCB' : '#8E90A2',
                          '& .MuiSvgIcon-root': { fontSize: 20 },
                          transition: 'color 0.18s ease',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.88rem',
                          fontWeight: isActive ? 800 : 600,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 20,
                            minWidth: 20,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            backgroundColor: item.badgeColor || '#EF4444',
                            color: '#FFFFFF',
                            mr: isActive ? 1.5 : 0,
                          }}
                        />
                      )}
                      {isActive && (
                        <Box
                          sx={{
                            width: 5,
                            height: 22,
                            borderRadius: '4px',
                            backgroundColor: '#4F2BCB',
                            position: 'absolute',
                            right: 6,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* User / Role Profile Card in Sidebar Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #F1EFF8' }}>
        <Box
          onClick={() => handleNav('/profile')}
          sx={{
            p: 1.5,
            borderRadius: '14px',
            backgroundColor: '#F8F7FD',
            border: '1px solid #E9E7F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#F3F0FF',
              borderColor: '#D4CCF7',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(79, 43, 203, 0.08)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
            <Avatar
              src={getImageUrl(user?.avatar_url || user?.avatarUrl)}
              sx={{
                width: 38,
                height: 38,
                backgroundColor: '#4F2BCB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.92rem',
                border: '1.5px solid #FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            >
              {user?.avatar_url || user?.avatarUrl ? null : initial}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: '#20202A',
                  fontSize: '0.84rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}
              >
                {user?.username || 'User'}
              </Typography>
              <Box
                sx={{
                  display: 'inline-block',
                  px: 0.8,
                  py: 0.1,
                  borderRadius: '6px',
                  backgroundColor: roleInfo.bg,
                  mt: 0.3,
                }}
              >
                <Typography sx={{ fontSize: '0.64rem', fontWeight: 800, color: roleInfo.color }}>
                  {roleInfo.label}
                </Typography>
              </Box>
              {myClubName && (
                <Typography
                  sx={{
                    fontSize: '0.66rem',
                    color: '#5E5D6E',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mt: 0.2,
                  }}
                >
                  {myClubName}
                </Typography>
              )}
            </Box>
          </Box>

          <ChevronRightIcon sx={{ fontSize: 18, color: '#8E90A2', flexShrink: 0 }} />
        </Box>
      </Box>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            mt: '64px',
            height: 'calc(100vh - 64px)',
            borderRight: '1px solid #E9E7F2',
          },
        }}
      >
        <SidebarContent onItemClick={onMobileClose} />
      </Drawer>

      {/* Desktop Permanent Drawer */}
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
