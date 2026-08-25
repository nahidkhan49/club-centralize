import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../../context/AuthContext';
import { fetchClubStats } from '../../api/adminApi';
import StatCard from '../../components/StatCard';
import api from '../../api/axiosInstance';

const PresidentDashboard = () => {
  const { user, systemRole, presidentOfClubs, secretaryOfClubs } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isPresident = systemRole === 'president';
  const myClubId = isPresident ? presidentOfClubs?.[0]?.club_id : secretaryOfClubs?.[0]?.club_id;
  const myClubName = isPresident ? (presidentOfClubs?.[0]?.club_name || 'My Club') : (secretaryOfClubs?.[0]?.club_name || 'My Club');

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
        console.error('Failed to load president stats', e);
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
          You are logged in as a {isPresident ? 'President' : 'Secretary'} but you are not assigned to any club. Please ask the Administrator to assign you to a club.
        </Alert>
      </Box>
    );
  }

  const pathPrefix = isPresident ? '/president' : '/secretary';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Welcome Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4F2BCB 0%, #7C3AED 100%)',
          borderRadius: '20px',
          p: { xs: 3, md: 4 },
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          color: '#FFFFFF',
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.85 }}>
              {isPresident ? 'President' : 'Secretary'} Dashboard
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 0.5 }}>
            Welcome back, {user?.username}! 👋
          </Typography>
          <Typography sx={{ opacity: 0.9, fontSize: '0.92rem' }}>
            Club: <strong>{myClubName}</strong>
          </Typography>
        </Box>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PeopleAltOutlinedIcon sx={{ fontSize: 40, color: '#FFFFFF' }} />
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleAltOutlinedIcon />}
            label="Total Members"
            value={stats?.member_count ?? 0}
            color="#4F2BCB"
            bgColor="#F3F0FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventOutlinedIcon />}
            label="Total Events"
            value={stats?.event_count ?? 0}
            color="#0EA5E9"
            bgColor="#E0F2FE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CampaignOutlinedIcon />}
            label="Announcements"
            value={stats?.announcement_count ?? 0}
            color="#059669"
            bgColor="#D1FAE5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssignmentTurnedInOutlinedIcon />}
            label="Total Registrations"
            value={stats?.total_registrations ?? 0}
            color="#D97706"
            bgColor="#FEF3C7"
          />
        </Grid>
      </Grid>

      {/* Quick Action Navigation */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 2.5 }}>
        Quick Management
      </Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            onClick={() => navigate(`${pathPrefix}/club`)}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #E9E7F2',
              cursor: 'pointer',
              '&:hover': { boxShadow: '0 4px 20px rgba(79,43,203,0.08)', borderColor: '#4F2BCB' },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#20202A', mb: 0.5 }}>
              Club Info
            </Typography>
            <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
              View club branding, description, and details.
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#4F2BCB', fontWeight: 600, fontSize: '0.85rem' }}>
              Go <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            onClick={() => navigate(`${pathPrefix}/members`)}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #E9E7F2',
              cursor: 'pointer',
              '&:hover': { boxShadow: '0 4px 20px rgba(79,43,203,0.08)', borderColor: '#4F2BCB' },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#20202A', mb: 0.5 }}>
              Manage Members
            </Typography>
            <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
              View club member roster and profile details.
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#4F2BCB', fontWeight: 600, fontSize: '0.85rem' }}>
              Go <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            onClick={() => navigate(`${pathPrefix}/events`)}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #E9E7F2',
              cursor: 'pointer',
              '&:hover': { boxShadow: '0 4px 20px rgba(79,43,203,0.08)', borderColor: '#4F2BCB' },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#20202A', mb: 0.5 }}>
              Manage Events
            </Typography>
            <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
              Create, edit, cancel events, and check registrations.
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#4F2BCB', fontWeight: 600, fontSize: '0.85rem' }}>
              Go <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            onClick={() => navigate(`${pathPrefix}/announcements`)}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #E9E7F2',
              cursor: 'pointer',
              '&:hover': { boxShadow: '0 4px 20px rgba(79,43,203,0.08)', borderColor: '#4F2BCB' },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#20202A', mb: 0.5 }}>
              Announcements
            </Typography>
            <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
              Publish announcements to club members.
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#4F2BCB', fontWeight: 600, fontSize: '0.85rem' }}>
              Go <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PresidentDashboard;
