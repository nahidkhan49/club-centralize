import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Box, Paper, CircularProgress, Avatar, Chip, Divider } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../../context/AuthContext';
import { fetchPlatformStats, fetchAllClubs, fetchClubMembers } from '../../api/adminApi';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, clubsData] = await Promise.all([
          fetchPlatformStats().catch(() => null),
          fetchAllClubs().catch(() => []),
        ]);
        setStats(statsData);
        setClubs(Array.isArray(clubsData) ? clubsData.slice(0, 6) : []);
      } catch (e) {
        console.error('Failed to load admin dashboard', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

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
            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20, opacity: 0.8 }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.85 }}>
              Website Administrator
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 0.5 }}>
            Welcome back, {user?.username}! 👋
          </Typography>
          <Typography sx={{ opacity: 0.8, fontSize: '0.92rem' }}>
            Platform overview — manage clubs, users, events and announcements.
          </Typography>
        </Box>
        <Box
          sx={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 44, color: '#FFFFFF' }} />
        </Box>
      </Box>

      {/* Stats Grid */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 2 }}>
        Platform Overview
      </Typography>
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleAltOutlinedIcon />} label="Total Users" value={stats?.total_users ?? 0} color="#4F2BCB" bgColor="#F3F0FF" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<BusinessOutlinedIcon />} label="Total Clubs" value={stats?.total_clubs ?? 0} color="#0EA5E9" bgColor="#E0F2FE" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<EventOutlinedIcon />} label="Total Events" value={stats?.total_events ?? 0} color="#D97706" bgColor="#FEF3C7" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<CampaignOutlinedIcon />} label="Announcements" value={stats?.total_announcements ?? 0} color="#059669" bgColor="#D1FAE5" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<AdminPanelSettingsOutlinedIcon />} label="Presidents" value={stats?.total_presidents ?? 0} color="#DC2626" bgColor="#FEE2E2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<GroupsOutlinedIcon />} label="Secretaries" value={stats?.total_secretaries ?? 0} color="#7C3AED" bgColor="#EDE9FE" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleAltOutlinedIcon />} label="Members" value={stats?.total_members ?? 0} color="#475569" bgColor="#F1F5F9" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<EventOutlinedIcon />} label="Upcoming Events" value={stats?.upcoming_events ?? 0} color="#D97706" bgColor="#FEF9C3" />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <Button variant="primary" onClick={() => navigate('/admin/clubs')} sx={{ backgroundColor: '#4F2BCB' }}>
          Manage Clubs
        </Button>
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          Manage Users
        </Button>
        <Button variant="ghost" onClick={() => navigate('/admin/events')}>
          View Events
        </Button>
        <Button variant="ghost" onClick={() => navigate('/admin/announcements')}>
          Announcements
        </Button>
      </Box>

      {/* Clubs Overview */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A' }}>
          Clubs Overview
        </Typography>
        <Box
          onClick={() => navigate('/admin/clubs')}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4F2BCB', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
        >
          View all <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>
      <Grid container spacing={2.5}>
        {clubs.map((club) => (
          <Grid item xs={12} sm={6} md={4} key={club.id}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid #E9E7F2',
                cursor: 'pointer',
                '&:hover': { boxShadow: '0 4px 20px rgba(79,43,203,0.08)', borderColor: '#C7B8FF' },
              }}
              onClick={() => navigate('/admin/clubs')}
            >
              <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                <Avatar sx={{ backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700 }}>
                  {club.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A' }}>
                    {club.name}
                  </Typography>
                  {club.category && (
                    <Chip label={club.category} size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#F3F0FF', color: '#4F2BCB', mt: 0.3 }} />
                  )}
                </Box>
              </Box>
              <Chip
                label={club.is_active ? 'Active' : 'Inactive'}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  backgroundColor: club.is_active ? '#D1FAE5' : '#FEE2E2',
                  color: club.is_active ? '#059669' : '#DC2626',
                  fontWeight: 700,
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
