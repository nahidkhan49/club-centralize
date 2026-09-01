import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Avatar,
  Stack,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';

import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { fetchPlatformStats, fetchAllClubs } from '../../api/adminApi';
import { getClubLogoUrl } from '../../api/axiosInstance';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import AdminBrandingModal from '../../components/AdminBrandingModal';
import WelcomeBanner from '../../components/WelcomeBanner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { siteName, siteLogo, welcomeBannerEnabled } = useSiteSettings();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);

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
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 6 }}>
      {/* Admin Quick Settings Bar */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="ghost"
          startIcon={<BrandingWatermarkOutlinedIcon />}
          onClick={() => setBrandingModalOpen(true)}
          sx={{ color: '#4F2BCB', fontSize: '0.85rem' }}
        >
          Customize Site & Banner
        </Button>
      </Box>

      {/* Hero Welcome Banner */}
      <WelcomeBanner
        username={user?.username}
        roleLabel="Platform Administrator"
        action={
          <Button
            variant="ghost"
            startIcon={<BrandingWatermarkOutlinedIcon />}
            onClick={() => setBrandingModalOpen(true)}
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
            Edit Branding & Logo
          </Button>
        }
      />

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
        Platform Overview
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clubs"
            value={stats?.total_clubs ?? 0}
            icon={<BusinessOutlinedIcon />}
            iconColor="#4F2BCB"
            iconBg="#F3F0FF"
            subtitle="Active university clubs"
            onClick={() => navigate('/admin/clubs')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.total_users ?? 0}
            icon={<PeopleAltOutlinedIcon />}
            iconColor="#1D4ED8"
            iconBg="#DBEAFE"
            subtitle="Platform student accounts"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Events"
            value={stats?.total_events ?? 0}
            icon={<EventOutlinedIcon />}
            iconColor="#059669"
            iconBg="#D1FAE5"
            subtitle="Scheduled workshops & events"
            onClick={() => navigate('/admin/events')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Announcements"
            value={stats?.total_announcements ?? 0}
            icon={<CampaignOutlinedIcon />}
            iconColor="#B45309"
            iconBg="#FEF3C7"
            subtitle="Official broadcasts & notices"
            onClick={() => navigate('/admin/announcements')}
          />
        </Grid>
      </Grid>

      {/* University Clubs Grid */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          borderRadius: '24px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 10px rgba(79, 43, 203, 0.03)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: '#20202A',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              University Student Clubs
            </Typography>
            <Typography variant="body2" sx={{ color: '#5E5D6E' }}>
              Active student organizations registered on {siteName}.
            </Typography>
          </Box>
          <Button
            variant="ghost"
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/admin/clubs')}
            sx={{ color: '#4F2BCB', fontWeight: 800 }}
          >
            Manage All Clubs
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {clubs.map((c) => {
            const logo = getClubLogoUrl(c);
            return (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Paper
                  elevation={0}
                  onClick={() => navigate(`/clubs/${c.id}`)}
                  sx={{
                    p: 2.5,
                    borderRadius: '18px',
                    border: '1px solid #E9E7F2',
                    backgroundColor: '#FAF9FF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                    '&:hover': {
                      borderColor: '#4F2BCB',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(79, 43, 203, 0.08)',
                      backgroundColor: '#FFFFFF',
                    },
                  }}
                >
                  <Avatar
                    src={logo}
                    variant="rounded"
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '14px',
                      backgroundColor: '#F3F0FF',
                      color: '#4F2BCB',
                      fontWeight: 900,
                      border: '1.5px solid #E0DBFF',
                    }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: '#20202A',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {c.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5E5D6E', display: 'block', fontWeight: 600 }}>
                      {c.category || 'General Club'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Admin Branding Modal */}
      <AdminBrandingModal
        open={brandingModalOpen}
        onClose={() => setBrandingModalOpen(false)}
      />
    </Box>
  );
};

export default AdminDashboard;
