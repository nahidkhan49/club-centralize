import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { fetchClubStats } from '../../api/adminApi';
import api, { getImageUrl, getClubLogoUrl } from '../../api/axiosInstance';
import Button from '../../components/Button';

const SecretaryDashboard = () => {
  const { user, secretaryOfClubs } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const myClubId = secretaryOfClubs?.[0]?.club_id;
  const myClubName = secretaryOfClubs?.[0]?.club_name || 'My Club';

  useEffect(() => {
    if (!myClubId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const [statsData, clubRes] = await Promise.all([
          fetchClubStats(myClubId),
          api.get(`/clubs/${myClubId}`),
        ]);
        setStats(statsData);
        setClub(clubRes.data);
      } catch (e) {
        console.error('Failed to load secretary stats', e);
        setError('Failed to load club information.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [myClubId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (!myClubId) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
        <Alert severity="warning">
          You are logged in as a Secretary but you are not assigned to any club. Please ask the Administrator to assign you to a club.
        </Alert>
      </Box>
    );
  }

  const { siteName, siteLogo } = useSiteSettings();

  return (
    <Box sx={{ maxWidth: 1150, mx: 'auto', pb: 5 }}>
      {/* 1. Purple Welcome Banner with Site and Club Logo */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #4F2BCB 100%)',
          borderRadius: '24px',
          p: { xs: 3, sm: 4, md: 4.5 },
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2.5,
          color: '#FFFFFF',
          boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ zIndex: 1, flex: 1, minWidth: 260 }}>
          <Box display="flex" alignItems="center" gap={1.2} mb={1}>
            <Avatar
              src={siteLogo}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.82rem',
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {siteName} • Secretary Dashboard
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.6rem', sm: '2.1rem', md: '2.4rem' },
              mb: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Welcome to {siteName}, {user?.username || 'Secretary'}! 👋
          </Typography>

          <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', fontWeight: 500 }}>
            Club: <strong>{myClubName}</strong>
          </Typography>
        </Box>

        <Avatar
          src={getClubLogoUrl(club)}
          variant="rounded"
          sx={{
            width: { xs: 68, sm: 84 },
            height: { xs: 68, sm: 84 },
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            color: '#4F2BCB',
            fontWeight: 800,
            fontSize: '2rem',
            border: '3px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          {club?.name?.charAt(0).toUpperCase() || <GroupsOutlinedIcon sx={{ fontSize: 38 }} />}
        </Avatar>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Pending Join Requests Alert Banner */}
      {Boolean(stats?.pending_requests_count && stats.pending_requests_count > 0) && (
        <Box
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: '18px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: '#FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#B45309',
                flexShrink: 0,
              }}
            >
              <HourglassEmptyIcon />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>
                {stats.pending_requests_count} Pending Join Request{stats.pending_requests_count > 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B45309' }}>
                Prospective members are waiting for your review to join {myClubName}.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="primary"
            onClick={() => navigate('/secretary/members')}
            sx={{
              backgroundColor: '#B45309',
              fontSize: '0.85rem',
              '&:hover': { backgroundColor: '#92400E' },
            }}
          >
            Review Requests
          </Button>
        </Box>
      )}

      {/* 2. Top Stats Row (4 Cards) */}
      <Grid container spacing={2.5} mb={4.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '18px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                backgroundColor: '#F3F0FF',
                color: '#4F2BCB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PeopleAltOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
                {stats?.member_count ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Members
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '18px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EventOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
                {stats?.event_count ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Events
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '18px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                backgroundColor: '#D1FAE5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CampaignOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
                {stats?.announcement_count ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase' }}>
                Announcements
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '18px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
                {stats?.total_registrations ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Registrations
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 3. Quick Management (2x2 Grid) */}
      <Box mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 2.5, textAlign: 'center' }}>
          Quick Management
        </Typography>

        <Grid container spacing={3}>
          {/* Card 1: Club Info */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              onClick={() => navigate('/secretary/club')}
              sx={{
                p: { xs: 3, md: 3.5 },
                borderRadius: '20px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 25px rgba(79,43,203,0.08)',
                  borderColor: '#4F2BCB',
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Club Info
              </Typography>
              <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
                View club branding, description, and details.
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#4F2BCB', fontWeight: 700, fontSize: '0.88rem' }}>
                Go <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Box>
            </Paper>
          </Grid>

          {/* Card 2: Manage Members */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              onClick={() => navigate('/secretary/members')}
              sx={{
                p: { xs: 3, md: 3.5 },
                borderRadius: '20px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 25px rgba(79,43,203,0.08)',
                  borderColor: '#4F2BCB',
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Manage Members
              </Typography>
              <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
                View daily member roster and profile details.
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#4F2BCB', fontWeight: 700, fontSize: '0.88rem' }}>
                Go <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Box>
            </Paper>
          </Grid>

          {/* Card 3: Manage Events */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              onClick={() => navigate('/secretary/events')}
              sx={{
                p: { xs: 3, md: 3.5 },
                borderRadius: '20px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 25px rgba(79,43,203,0.08)',
                  borderColor: '#4F2BCB',
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Manage Events
              </Typography>
              <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
                Create, edit casual events, and check registrations.
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#4F2BCB', fontWeight: 700, fontSize: '0.88rem' }}>
                Go <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Box>
            </Paper>
          </Grid>

          {/* Card 4: Announcements */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              onClick={() => navigate('/secretary/announcements')}
              sx={{
                p: { xs: 3, md: 3.5 },
                borderRadius: '20px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 25px rgba(79,43,203,0.08)',
                  borderColor: '#4F2BCB',
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Announcements
              </Typography>
              <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
                Publish announcements to club members.
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#4F2BCB', fontWeight: 700, fontSize: '0.88rem' }}>
                Go <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SecretaryDashboard;
