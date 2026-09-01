import React from 'react';
import { Box, Typography, Card, Grid, Avatar, Stack } from '@mui/material';
import {
  GroupsOutlined,
  CalendarTodayOutlined,
  CampaignOutlined,
  PersonOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ForumIcon from '@mui/icons-material/Forum';
import WelcomeBanner from '../components/WelcomeBanner';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const actionCards = [
  {
    id: 'clubs',
    title: 'Explore Clubs',
    subtitle: 'Discover, join, and collaborate with student organizations.',
    icon: <GroupsOutlined sx={{ fontSize: 28, color: '#4F2BCB' }} />,
    bg: '#F3F0FF',
    path: '/clubs',
    badge: 'Directory',
  },
  {
    id: 'events',
    title: 'Upcoming Events',
    subtitle: 'Competitions, workshops, seminars, and club activities.',
    icon: <CalendarTodayOutlined sx={{ fontSize: 26, color: '#10B981' }} />,
    bg: '#D1FAE5',
    path: '/events',
    badge: 'Live',
  },
  {
    id: 'announcements',
    title: 'Announcements',
    subtitle: 'Stay in the loop with university-wide and club notices.',
    icon: <CampaignOutlined sx={{ fontSize: 28, color: '#F59E0B' }} />,
    bg: '#FEF3C7',
    path: '/announcements',
    badge: 'Updates',
  },
  {
    id: 'profile',
    title: 'Your Profile',
    subtitle: 'Manage your personal details, avatar, and memberships.',
    icon: <PersonOutlined sx={{ fontSize: 28, color: '#0EA5E9' }} />,
    bg: '#DBEAFE',
    path: '/profile',
    badge: 'Account',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, systemRole, memberships, loading } = useAuth();
  const { siteName, siteLogo, tagline, welcomeBannerEnabled } = useSiteSettings();

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
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 5 }}>
      {/* Top Banner */}
      {welcomeBannerEnabled ? (
        <WelcomeBanner
          username={user?.username}
          roleLabel="Campus Member"
          actionButton={
            <Button
              variant="subtle"
              onClick={() => navigate('/clubs')}
              sx={{ backgroundColor: '#FFFFFF', color: '#4F2BCB', fontWeight: 800 }}
            >
              Explore Clubs →
            </Button>
          }
        />
      ) : (
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            mb: 4,
            borderRadius: '24px',
            border: '1px solid #E9E7F2',
            background: 'linear-gradient(135deg, #4F2BCB 0%, #6838EE 60%, #7C3AED 100%)',
            color: '#FFFFFF',
            boxShadow: '0 12px 36px rgba(79, 43, 203, 0.2)',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={3}>
            <Box display="flex" alignItems="center" gap={{ xs: 2, sm: 3 }}>
              <Avatar
                src={siteLogo}
                variant="rounded"
                sx={{
                  width: { xs: 60, sm: 72 },
                  height: { xs: 60, sm: 72 },
                  borderRadius: '20px',
                  border: '2.5px solid rgba(255, 255, 255, 0.6)',
                  backgroundColor: '#FFFFFF',
                  color: '#4F2BCB',
                  fontWeight: 900,
                  fontSize: '1.8rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  flexShrink: 0,
                }}
              >
                {siteName?.charAt(0) || 'C'}
              </Avatar>

              <Box>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    color: '#FFFFFF',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.3rem' },
                    lineHeight: 1.2,
                    letterSpacing: '-0.025em',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Welcome to {siteName}!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 0.5, fontWeight: 500, fontSize: '0.95rem' }}
                >
                  {tagline || 'Your central hub for university student organizations, events, and campus life.'}
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                variant="subtle"
                onClick={() => navigate('/clubs')}
                sx={{ backgroundColor: '#FFFFFF', color: '#4F2BCB', fontWeight: 800 }}
              >
                Browse Clubs
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/events')}
                sx={{ color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.4)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' } }}
              >
                Upcoming Events
              </Button>
            </Stack>
          </Box>
        </Card>
      )}

      {/* Quick Action Navigation Cards Matching Image 1 */}
      <Box mb={4}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#20202A',
            mb: 2.2,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.15rem',
          }}
        >
          Quick Navigation
        </Typography>
        <Grid container spacing={2.5}>
          {actionCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.id}>
              <Card
                elevation={0}
                onClick={() => navigate(card.path)}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '20px',
                  border: '1px solid #E9E7F2',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(79, 43, 203, 0.09)',
                    borderColor: '#D4CCF7',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '14px',
                      backgroundColor: card.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.3,
                      borderRadius: '6px',
                      backgroundColor: '#F8F7FD',
                      border: '1px solid #E9E7F2',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#8E90A2',
                      textTransform: 'uppercase',
                    }}
                  >
                    {card.badge}
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: '#20202A',
                    mb: 0.8,
                    fontSize: '1.05rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: '#5E5D6E', lineHeight: 1.55, flex: 1, fontSize: '0.84rem' }}
                >
                  {card.subtitle}
                </Typography>

                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.6}
                  mt={2}
                  pt={1.5}
                  borderTop="1px solid #F4F2FA"
                  sx={{ color: '#4F2BCB', fontWeight: 800, fontSize: '0.82rem' }}
                >
                  Explore <ArrowForwardOutlined sx={{ fontSize: 14 }} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Joined Clubs Direct Chat Channels */}
      {memberships && memberships.length > 0 && (
        <Box sx={{ mt: 4.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.2}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#20202A',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.15rem',
              }}
            >
              Your Active Clubs & Messages
            </Typography>
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate('/clubs')}
              sx={{ fontSize: '0.8rem', color: '#4F2BCB' }}
            >
              View All Clubs
            </Button>
          </Box>

          <Grid container spacing={2.5}>
            {memberships.map((m) => (
              <Grid item xs={12} sm={6} md={4} key={m.club_id}>
                <Card
                  elevation={0}
                  onClick={() => navigate(`/clubs/${m.club_id}/chat`)}
                  sx={{
                    p: 2.5,
                    borderRadius: '18px',
                    border: '1px solid #E9E7F2',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(79, 43, 203, 0.08)',
                      borderColor: '#D4CCF7',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.8}>
                    <Avatar
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: '14px',
                        backgroundColor: '#F3F0FF',
                        color: '#4F2BCB',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        border: '1.5px solid #E0DBFF',
                      }}
                    >
                      {m.club_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: '#20202A',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {m.club_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: '#5E5D6E', fontWeight: 600, textTransform: 'capitalize' }}
                      >
                        Role: {m.role?.replace('_', ' ') || 'Member'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: '#F3F0FF',
                      color: '#4F2BCB',
                      p: 1.1,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s',
                      '&:hover': { backgroundColor: '#EDE9FE' },
                    }}
                  >
                    <ForumIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
