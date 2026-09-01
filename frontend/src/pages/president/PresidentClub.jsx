import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EventIcon from '@mui/icons-material/Event';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useAuth } from '../../context/AuthContext';
import api, { getImageUrl, getClubLogoUrl } from '../../api/axiosInstance';
import { fetchClubMembers, fetchClubStats } from '../../api/adminApi';
import Button from '../../components/Button';
import EditClubModal from '../../components/EditClubModal';

const ROLE_CONFIGS = {
  president: { label: 'President', bg: '#FEF3C7', color: '#B45309' },
  vice_president: { label: 'Vice President', bg: '#EEF2FF', color: '#4F2BCB' },
  secretary: { label: 'Secretary', bg: '#F3F0FF', color: '#7C3AED' },
  treasurer: { label: 'Treasurer', bg: '#D1FAE5', color: '#059669' },
  member: { label: 'Member', bg: '#F1F5F9', color: '#475569' },
};

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
];

const DEFAULT_GALLERY = [
  { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80', title: 'Executive Meeting' },
  { url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80', title: 'Orientation & Workshop' },
  { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80', title: 'Competitions & Projects' },
  { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80', title: 'Annual Celebration' },
];

const PresidentClub = () => {
  const { presidentOfClubs } = useAuth();
  const navigate = useNavigate();
  const myClubId = presidentOfClubs?.[0]?.club_id;
  const myClubName = presidentOfClubs?.[0]?.club_name || 'My Club';

  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadClubDetails = async () => {
    if (!myClubId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [clubRes, membersData, statsData] = await Promise.all([
        api.get(`/clubs/${myClubId}`),
        fetchClubMembers(myClubId),
        fetchClubStats(myClubId),
      ]);
      setClub(clubRes.data);
      setMembers(membersData || []);
      setStats(statsData);
    } catch (err) {
      setError('Failed to fetch club information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubDetails();
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
        <Alert severity="warning">You are not assigned as President of any active club.</Alert>
      </Box>
    );
  }

  const rawCover = club?.cover_url || DEFAULT_COVERS[(club?.id || 0) % DEFAULT_COVERS.length];
  const coverUrl = getImageUrl(rawCover);
  const logoUrl = getClubLogoUrl(club);

  let displayGallery = DEFAULT_GALLERY;
  if (club?.gallery) {
    try {
      const parsed = typeof club.gallery === 'string' ? JSON.parse(club.gallery) : club.gallery;
      if (Array.isArray(parsed) && parsed.length > 0) {
        displayGallery = parsed;
      }
    } catch (e) {
      displayGallery = DEFAULT_GALLERY;
    }
  }

  const leadershipRoles = ['president', 'vice_president', 'secretary', 'treasurer'];
  const leadershipMembers = members.filter((m) => leadershipRoles.includes(m.role));

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Header Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3.5}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: '#20202A',
              fontSize: { xs: '1.5rem', sm: '1.85rem' },
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            Organization Profile & Media
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Club: <strong>{myClubName}</strong> — Manage public profile, branding cover, gallery, and meeting logistics.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="ghost"
            startIcon={<OpenInNewIcon />}
            onClick={() => navigate(`/clubs/${myClubId}`)}
          >
            Public Page
          </Button>
          <Button
            variant="primary"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setEditModalOpen(true)}
            sx={{ px: 2.5 }}
          >
            Edit Club & Media
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* Hero Cover Banner */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #E9E7F2',
          mb: 4,
          boxShadow: '0 8px 32px rgba(79, 43, 203, 0.08)',
          position: 'relative',
          height: { xs: 270, sm: 310, md: 350 },
          backgroundImage: `linear-gradient(180deg, rgba(15, 10, 40, 0.05) 0%, rgba(15, 10, 40, 0.58) 100%), url(${coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 2.5, sm: 3.5 },
          boxSizing: 'border-box',
        }}
      >
        <Box display="flex" justifyContent="flex-end" gap={1}>
          {club?.category && (
            <Chip
              label={club.category}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#4F2BCB',
                fontWeight: 800,
                fontSize: '0.82rem',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2.5,
            width: '100%',
            p: { xs: 2, sm: 2.5 },
            borderRadius: '20px',
            backgroundColor: 'rgba(15, 8, 48, 0.38)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar
              src={logoUrl}
              variant="rounded"
              sx={{
                width: { xs: 72, sm: 96 },
                height: { xs: 72, sm: 96 },
                borderRadius: '22px',
                backgroundColor: '#FFFFFF',
                color: '#4F2BCB',
                fontWeight: 900,
                fontSize: '2.5rem',
                border: '3.5px solid #FFFFFF',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
                flexShrink: 0,
              }}
            >
              {club?.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#FFFFFF',
                  fontSize: { xs: '1.5rem', sm: '2.1rem' },
                  letterSpacing: '-0.02em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
                  mb: 0.8,
                }}
              >
                {club?.name}
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={0.5}>
                <Box display="flex" alignItems="center" gap={0.6}>
                  <GroupsOutlinedIcon sx={{ fontSize: 18, color: '#E0DBFF' }} />
                  <Typography variant="body2" sx={{ color: '#F3F0FF', fontWeight: 700 }}>
                    {members.length} Members
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>•</Typography>
                <Box display="flex" alignItems="center" gap={0.6}>
                  <EventIcon sx={{ fontSize: 18, color: '#E0DBFF' }} />
                  <Typography variant="body2" sx={{ color: '#F3F0FF', fontWeight: 700 }}>
                    {stats?.event_count ?? 0} Events
                  </Typography>
                </Box>
                {club?.meeting_location && (
                  <>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>•</Typography>
                    <Typography variant="body2" sx={{ color: '#F3F0FF', fontWeight: 700 }}>
                      📍 {club.meeting_location}
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Grid: About Us, Leadership, Gallery, Contact */}
      <Grid container spacing={3.5}>
        <Grid item xs={12} md={7} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 3.5 },
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3.5,
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.8}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                About the Organization
              </Typography>
              <Button
                variant="ghost"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setEditModalOpen(true)}
                sx={{ fontSize: '0.78rem' }}
              >
                Edit
              </Button>
            </Box>
            <Typography
              variant="body1"
              sx={{ color: '#5E5D6E', lineHeight: 1.8, fontSize: '0.94rem' }}
            >
              {club?.description ||
                'Welcome to our club! We are dedicated to bringing students together through engaging workshops, competitions, skill-building events, and community initiatives.'}
            </Typography>
          </Paper>

          {/* Leadership Team */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 3.5 },
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Leadership Team
                </Typography>
                <Typography variant="body2" sx={{ color: '#777788' }}>
                  Elected officers leading club activities and operations.
                </Typography>
              </Box>
              <Chip
                label={`${leadershipMembers.length} Officers`}
                size="small"
                sx={{
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  fontWeight: 800,
                  borderRadius: '8px',
                }}
              />
            </Box>

            {leadershipMembers.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#8E90A2', py: 2 }}>
                No leadership roles assigned yet.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {leadershipMembers.map((officer) => {
                  const roleConfig = ROLE_CONFIGS[officer.role] || ROLE_CONFIGS.member;
                  return (
                    <Grid item xs={12} sm={6} key={officer.user_id}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          border: '1px solid #F1EFF8',
                          backgroundColor: '#F8F7FD',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 4px 15px rgba(79, 43, 203, 0.08)',
                            borderColor: '#D4CCF7',
                          },
                        }}
                      >
                        <Avatar
                          src={getImageUrl(officer.avatar_url)}
                          sx={{
                            width: 46,
                            height: 46,
                            backgroundColor: '#EDE9FE',
                            color: '#4F2BCB',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                          }}
                        >
                          {officer.username?.charAt(0).toUpperCase()}
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
                            {officer.username}
                          </Typography>
                          <Chip
                            label={roleConfig.label}
                            size="small"
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              backgroundColor: roleConfig.bg,
                              color: roleConfig.color,
                              height: 22,
                              px: 0.5,
                              mt: 0.3,
                              borderRadius: '6px',
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Sidebar Gallery & Contact */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3.5,
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <CollectionsOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 22 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Gallery Photos
                </Typography>
              </Box>
              <Button
                variant="ghost"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setEditModalOpen(true)}
                sx={{ fontSize: '0.78rem' }}
              >
                Manage
              </Button>
            </Box>

            <Grid container spacing={1.5}>
              {displayGallery.map((item, index) => (
                <Grid item xs={6} key={index}>
                  <Tooltip title={item.title || 'Photo'}>
                    <Box
                      sx={{
                        height: 105,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        '&:hover img': { transform: 'scale(1.08)' },
                      }}
                    >
                      <Box
                        component="img"
                        src={getImageUrl(item.url || item)}
                        alt={item.title || 'Photo'}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Contact & Venue */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Contact & Details
              </Typography>
              <Button
                variant="ghost"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setEditModalOpen(true)}
                sx={{ fontSize: '0.78rem' }}
              >
                Edit
              </Button>
            </Box>

            <Stack spacing={2.2}>
              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <EmailOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Email Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                    {club?.contact_email || 'contact@clubcentralize.edu'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <MeetingRoomOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Meeting Venue
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                    {club?.meeting_location || 'Student Activity Center'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <AccessTimeOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Regular Meetings
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                    {club?.meeting_time || 'Every Thursday at 4:30 PM'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Club Modal */}
      {club && (
        <EditClubModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          club={club}
          onUpdated={(updated) => {
            setClub(updated);
            loadClubDetails();
          }}
        />
      )}
    </Box>
  );
};

export default PresidentClub;
