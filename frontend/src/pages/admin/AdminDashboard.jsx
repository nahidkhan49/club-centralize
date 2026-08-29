import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6 }}>
      {/* Admin Quick Settings Bar */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="ghost"
          startIcon={<BrandingWatermarkOutlinedIcon />}
          onClick={() => setBrandingModalOpen(true)}
          sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.85rem' }}
        >
          Customize Site & Banner
        </Button>
      </Box>

      {welcomeBannerEnabled ? (
        <WelcomeBanner username={user?.username} roleLabel="Platform Admin" />
      ) : (
        /* Welcome Banner with Website Logo & Branding Controls */
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4F2BCB 0%, #6838EE 100%)',
            borderRadius: '24px',
            p: { xs: 3, sm: 4, md: 4.5 },
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2.5,
            color: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(79, 43, 203, 0.25)',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Box display="flex" alignItems="center" gap={1} mb={0.8}>
              <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20, opacity: 0.9 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Website Administrator
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.6rem', sm: '2.1rem' }, mb: 0.8 }}>
              Welcome to {siteName}, {user?.username}! 👋
            </Typography>
            <Typography sx={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: 500 }}>
              Platform overview — manage clubs, users, branding, events, and announcements.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Button
              variant="ghost"
              startIcon={<BrandingWatermarkOutlinedIcon />}
              onClick={() => setBrandingModalOpen(true)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 700,
                fontSize: '0.85rem',
                backdropFilter: 'blur(8px)',
                '&:hover': { backgroundColor: '#FFFFFF', color: '#4F2BCB' },
              }}
            >
              Edit Website Name & Logo
            </Button>

            <Avatar
              src={siteLogo}
              variant="rounded"
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                borderRadius: '20px',
                backgroundColor: '#FFFFFF',
                color: '#4F2BCB',
                fontWeight: 900,
                fontSize: '2rem',
                border: '3px solid rgba(255,255,255,0.6)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                flexShrink: 0,
              }}
            >
              {siteName?.charAt(0).toUpperCase()}
            </Avatar>
          </Stack>
        </Box>
      )}

      {/* Stats Grid */}
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 2.5 }}>
        Platform Overview
      </Typography>
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clubs"
            value={stats?.total_clubs ?? 0}
            icon={<BusinessOutlinedIcon />}
            iconColor="#4F2BCB"
            iconBg="#F3F0FF"
            subtitle="Registered campus clubs"
            onClick={() => navigate('/admin/clubs')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.total_users ?? 0}
            icon={<PeopleAltOutlinedIcon />}
            iconColor="#0284C7"
            iconBg="#E0F2FE"
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
            subtitle="Workshops and seminars"
            onClick={() => navigate('/admin/events')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Announcements"
            value={stats?.total_announcements ?? 0}
            icon={<CampaignOutlinedIcon />}
            iconColor="#D97706"
            iconBg="#FEF3C7"
            subtitle="Active broadcasts"
            onClick={() => navigate('/admin/announcements')}
          />
        </Grid>
      </Grid>

      {/* Recent Clubs Roster with Dynamic Logos */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
              University Clubs
            </Typography>
            <Typography variant="body2" sx={{ color: '#777788' }}>
              Active student organizations on {siteName}.
            </Typography>
          </Box>
          <Button
            variant="ghost"
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/admin/clubs')}
            sx={{ color: '#4F2BCB', fontWeight: 700 }}
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
                    borderRadius: '16px',
                    border: '1px solid #E9E7F2',
                    backgroundColor: '#FBFBFE',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#4F2BCB',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(79, 43, 203, 0.08)',
                    },
                  }}
                >
                  <Avatar
                    src={logo}
                    variant="rounded"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      backgroundColor: '#F3F0FF',
                      color: '#4F2BCB',
                      fontWeight: 800,
                      border: '1.5px solid #E2D9FF',
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
                      }}
                    >
                      {c.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#777788', display: 'block' }}>
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
