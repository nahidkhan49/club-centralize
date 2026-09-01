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
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ForumIcon from '@mui/icons-material/Forum';

import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { fetchClubStats } from '../../api/adminApi';
import api, { getClubLogoUrl } from '../../api/axiosInstance';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import WelcomeBanner from '../../components/WelcomeBanner';

const SecretaryDashboard = () => {
  const { user, systemRole, secretaryOfClubs, presidentOfClubs } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const myClubId = secretaryOfClubs?.[0]?.club_id || presidentOfClubs?.[0]?.club_id;
  const myClubName = secretaryOfClubs?.[0]?.club_name || presidentOfClubs?.[0]?.club_name || 'My Club';

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
        <Alert severity="warning" sx={{ borderRadius: '14px' }}>
          You are logged in as a Secretary but you are not assigned to any club yet. Please contact the Platform Administrator to assign you to a club organization.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 6 }}>
      {/* Welcome Banner */}
      <WelcomeBanner
        username={user?.username}
        roleLabel="Club Secretary"
        action={
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="ghost"
              startIcon={<ForumIcon />}
              onClick={() => navigate(`/clubs/${myClubId}/chat`)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 800,
                fontSize: '0.85rem',
                backdropFilter: 'blur(8px)',
                '&:hover': { backgroundColor: '#FFFFFF', color: '#4F2BCB' },
              }}
            >
              Officer Chat Console
            </Button>
            <Button
              variant="ghost"
              startIcon={<BusinessOutlinedIcon />}
              onClick={() => navigate('/secretary/club')}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 800,
                fontSize: '0.85rem',
                backdropFilter: 'blur(8px)',
                '&:hover': { backgroundColor: '#FFFFFF', color: '#4F2BCB' },
              }}
            >
              Club Workspace
            </Button>
          </Stack>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* Pending Join Requests Alert Banner */}
      {Boolean(stats?.pending_requests_count && stats.pending_requests_count > 0) && (
        <Box
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: '20px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            boxShadow: '0 2px 8px rgba(180, 83, 9, 0.08)',
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
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#92400E' }}>
                {stats.pending_requests_count} Pending Join Request{stats.pending_requests_count > 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B45309', fontWeight: 600 }}>
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

      {/* Stats Grid */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          color: '#20202A',
          mb: 2.5,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Secretary Operations Overview
      </Typography>
      <Grid container spacing={3} mb={4.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Members"
            value={stats?.member_count ?? 0}
            icon={<PeopleAltOutlinedIcon />}
            iconColor="#4F2BCB"
            iconBg="#F3F0FF"
            subtitle="Active club members"
            onClick={() => navigate('/secretary/members')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Club Events"
            value={stats?.event_count ?? 0}
            icon={<EventOutlinedIcon />}
            iconColor="#059669"
            iconBg="#D1FAE5"
            subtitle="Workshops & meetups"
            onClick={() => navigate('/secretary/events')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registrations"
            value={stats?.total_registrations ?? 0}
            icon={<AssignmentTurnedInOutlinedIcon />}
            iconColor="#1D4ED8"
            iconBg="#DBEAFE"
            subtitle="Total attendee signups"
            onClick={() => navigate('/secretary/events')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Announcements"
            value={stats?.announcement_count ?? 0}
            icon={<CampaignOutlinedIcon />}
            iconColor="#B45309"
            iconBg="#FEF3C7"
            subtitle="Published bulletins"
            onClick={() => navigate('/secretary/announcements')}
          />
        </Grid>
      </Grid>

      {/* Fast Shortcuts Cards Grid */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          color: '#20202A',
          mb: 2.5,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Secretary Workspaces
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            onClick={() => navigate('/secretary/club')}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
              '&:hover': {
                borderColor: '#4F2BCB',
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 24px rgba(79, 43, 203, 0.08)',
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.8} mb={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BusinessOutlinedIcon />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Club Hub & Profile
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#5E5D6E', mb: 2, fontSize: '0.86rem' }}>
              Edit description, meeting schedule, location, cover banner, and gallery photos.
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#4F2BCB', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              Open Club Workspace →
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            onClick={() => navigate('/secretary/members')}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
              '&:hover': {
                borderColor: '#4F2BCB',
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 24px rgba(79, 43, 203, 0.08)',
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.8} mb={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: '#DBEAFE',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PeopleAltOutlinedIcon />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Member Management
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#5E5D6E', mb: 2, fontSize: '0.86rem' }}>
              Approve or reject prospective applicant join requests, assign roles, and manage members.
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#1D4ED8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              Manage Roster & Requests →
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            onClick={() => navigate('/secretary/events')}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
              '&:hover': {
                borderColor: '#4F2BCB',
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 24px rgba(79, 43, 203, 0.08)',
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.8} mb={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EventOutlinedIcon />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Events & Task Boards
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#5E5D6E', mb: 2, fontSize: '0.86rem' }}>
              Create workshops, track attendee registrations, and coordinate tasks with team members.
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              Open Events & Tasks →
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecretaryDashboard;
