import React from 'react';
import { Box, Typography, Card, Grid } from '@mui/material';
import {
  GroupsOutlined,
  CalendarTodayOutlined,
  CampaignOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DeveloperIllustration from '../components/DeveloperIllustration';
import { useAuth } from '../context/AuthContext';

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
    bg: '#FEF3C7',
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

          {/* Right: Welcome Text */}
          <Grid item xs={12} md={7}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                color: '#20202A',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                lineHeight: 1.25,
                mb: 1.5,
              }}
            >
              Welcome to <br />
              <Box component="span" sx={{ color: '#4F2BCB' }}>
                Club Centralize!
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#6E6D7A',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                maxWidth: 480,
                lineHeight: 1.6,
              }}
            >
              Use the navigation menu to explore clubs, events, and your profile.
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* 4 Action Cards Grid */}
      <Grid container spacing={3}>
        {actionCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.id}>
            <Card
              elevation={0}
              onClick={() => navigate(card.path)}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: '16px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(79, 43, 203, 0.08)',
                  borderColor: '#C7B8FF',
                },
              }}
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: '14px',
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                {card.icon}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#20202A',
                  mb: 0.8,
                }}
              >
                {card.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#777788',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                }}
              >
                {card.subtitle}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
