import React from 'react';
import { Box, Typography, Card, Grid, Avatar } from '@mui/material';
import {
  GroupsOutlined,
  CalendarTodayOutlined,
  CampaignOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DeveloperIllustration from '../components/DeveloperIllustration';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const actionCards = [
  {
    id: 'clubs',
    title: 'Explore Clubs',
    subtitle: 'Discover and join amazing clubs.',
    icon: <GroupsOutlined sx={{ fontSize: 32, color: '#4F2BCB' }} />,
    bg: '#F3F0FF',
    path: '/clubs',
  },
  {
    id: 'events',
    title: 'Upcoming Events',
    subtitle: 'Check out events happening soon.',
    icon: <CalendarTodayOutlined sx={{ fontSize: 30, color: '#10B981' }} />,
    bg: '#E6F4EA',
    path: '/events',
  },
  {
    id: 'announcements',
    title: 'Announcements',
    subtitle: 'Stay updated with latest news.',
    icon: <CampaignOutlined sx={{ fontSize: 32, color: '#F59E0B' }} />,
    bg: '#FEF3F0FF',
    path: '/announcements',
  },
  {
    id: 'profile',
    title: 'Your Profile',
    subtitle: 'Manage your profile and preferences.',
    icon: <PersonOutlined sx={{ fontSize: 32, color: '#0EA5E9' }} />,
    bg: '#E0F2FE',
    path: '/profile',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { systemRole, loading } = useAuth();
  const { siteName, siteLogo, tagline } = useSiteSettings();

  React.useEffect(() => {
    if (!loading) {
      if (systemRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (systemRole === 'president') {
        navigate('/president/dashboard', { replace: true });
      } else if (systemRole === 'secretary') {
        navigate('/secretary/dashboard', { replace: true });
      }
    }
  }, [systemRole, loading, navigate]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 2 }}>
      {/* Top Banner Card */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(79, 43, 203, 0.03)',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          {/* Left: Illustration */}
          <Grid item xs={12} md={5} display="flex" justifyContent="center">
            <DeveloperIllustration />
          </Grid>

          {/* Right: Welcome Text with Website Logo */}
          <Grid item xs={12} md={7}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                src={siteLogo}
                variant="rounded"
                sx={{
                  width: { xs: 54, sm: 64 },
                  height: { xs: 54, sm: 64 },
                  borderRadius: '16px',
                  border: '2px solid #E9E7F2',
                  boxShadow: '0 4px 15px rgba(79, 43, 203, 0.1)',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                {siteName?.charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    color: '#20202A',
                    fontSize: { xs: '1.6rem', sm: '2.1rem', md: '2.4rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Welcome to{' '}
                  <Box component="span" sx={{ color: '#4F2BCB' }}>
                    {siteName}!
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ color: '#777788', mt: 0.5, fontWeight: 500 }}>
                  {tagline}
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: '#6E6D7A',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Your central hub for university student life. Join registered organizations, participate in upcoming campus events, view announcements, and connect with peer leaders.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box
                component="button"
                onClick={() => navigate('/clubs')}
                sx={{
                  backgroundColor: '#4F2BCB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  px: 3,
                  py: 1.2,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 43, 203, 0.25)',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: '#39209A',
                  },
                }}
              >
                Browse Clubs
              </Box>
              <Box
                component="button"
                onClick={() => navigate('/events')}
                sx={{
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  border: '1px solid #E0DBFF',
                  borderRadius: '10px',
                  px: 3,
                  py: 1.2,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: '#EAEAFF',
                  },
                }}
              >
                Upcoming Events
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Action Cards Grid */}
      <Grid container spacing={3}>
        {actionCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.id}>
            <Card
              elevation={0}
              onClick={() => navigate(card.path)}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: '16px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(79, 43, 203, 0.08)',
                  borderColor: '#C7B8FF',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 1, fontSize: '1.1rem' }}>
                {card.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#777788', lineHeight: 1.5, flex: 1 }}>
                {card.subtitle}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
