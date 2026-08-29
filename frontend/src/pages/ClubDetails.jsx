import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Chip,
  Paper,
  Tabs,
  Tab,
  Stack,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ForumIcon from '@mui/icons-material/Forum';

import api, { getImageUrl, getClubLogoUrl } from '../api/axiosInstance';
import { fetchEventsByClub } from '../api/eventApi';
import { fetchMyClubRequest, requestJoinClub, leaveClub } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import EditClubModal from '../components/EditClubModal';

const ROLE_CONFIGS = {
  president: { label: 'President', bg: '#FEF3C7', color: '#B45309' },
  vice_president: { label: 'Vice President', bg: '#EEF2FF', color: '#4F2BCB' },
  secretary: { label: 'Secretary', bg: '#F3F0FF', color: '#7C3AED' },
  treasurer: { label: 'Treasurer', bg: '#E6F4EA', color: '#15803D' },
  member: { label: 'Member', bg: '#F1F5F9', color: '#475569' },
};

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
];

const DEFAULT_GALLERY = [
  { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80', title: 'Annual General Meeting' },
  { url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80', title: 'Interactive Workshop' },
  { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80', title: 'Hackathon & Presentations' },
  { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80', title: 'Club Social & Networking' },
];

const ClubDetails = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { systemRole, user } = useAuth();
  const isAdmin = systemRole === 'admin';

  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [myRequest, setMyRequest] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchClub = async () => {
    try {
      setLoadingClub(true);
      const response = await api.get(`/clubs/${clubId}`);
      setClub(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load club');
    } finally {
      setLoadingClub(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await api.get(`/clubs/${clubId}/members`);
      setMembers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchUserRequest = async () => {
    try {
      const data = await fetchMyClubRequest(clubId);
      setMyRequest(data);
    } catch (err) {
      console.error('Failed to fetch request status', err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await fetchEventsByClub(clubId);
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchClub();
    fetchMembers();
    fetchEvents();
    fetchUserRequest();
  }, [clubId]);

  const handleJoin = async () => {
    try {
      setActionLoading(true);
      setError(null);
      await requestJoinClub(clubId);
      setSuccessMsg('Membership request submitted successfully! Pending approval from club leadership.');
      await Promise.all([fetchMembers(), fetchUserRequest()]);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit join request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setActionLoading(true);
      setError(null);
      await leaveClub(clubId);
      setSuccessMsg('You have successfully left the club.');
      await Promise.all([fetchMembers(), fetchUserRequest()]);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to leave club');
    } finally {
      setActionLoading(false);
    }
  };

  const currentUserId = user?.id || Number(localStorage.getItem('user_id'));
  const myMembership = members.find((m) => m.user_id === currentUserId);
  const isMember = Boolean(myMembership);
  const myRole = myMembership?.role;

  const isClubManager =
    isAdmin || myRole === 'president' || myRole === 'secretary' || myRole === 'vice_president';

  const leadershipRoles = ['president', 'vice_president', 'secretary', 'treasurer'];
  const leadershipMembers = members.filter((m) => leadershipRoles.includes(m.role));

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

  if (loadingClub) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (error && !club) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 4, width: '100%' }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/clubs')}>
          Back to Clubs
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Top Back Link & Shortcuts */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={1.5}>
        <Box
          component={RouterLink}
          to="/clubs"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to All Clubs
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          {isClubManager && (
            <Button
              variant="ghost"
              startIcon={<EditOutlinedIcon />}
              onClick={() => setEditModalOpen(true)}
              sx={{ color: '#4F2BCB', borderColor: '#E9E7F2', fontSize: '0.85rem' }}
            >
              Edit Club Media
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="ghost"
              component={RouterLink}
              to="/admin/clubs"
              sx={{ color: '#4F2BCB', borderColor: '#E9E7F2', fontSize: '0.85rem' }}
            >
              Admin Management
            </Button>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* 1. HERO COVER BANNER (Integrated Crisp Header & Actions) */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #E9E7F2',
          mb: 4,
          boxShadow: '0 8px 30px rgba(79, 43, 203, 0.08)',
          position: 'relative',
          height: { xs: 270, sm: 320, md: 350 },
          backgroundImage: `linear-gradient(180deg, rgba(15, 10, 40, 0.15) 0%, rgba(15, 10, 40, 0.88) 100%), url(${coverUrl})`,
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
              }}
            />
          )}
          {isClubManager && (
            <Chip
              icon={<EditOutlinedIcon style={{ fontSize: 16, color: '#4F2BCB' }} />}
              label="Edit Media"
              clickable
              onClick={() => setEditModalOpen(true)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#4F2BCB',
                fontWeight: 800,
                fontSize: '0.82rem',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2.5,
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar
              src={logoUrl}
              variant="rounded"
              sx={{
                width: { xs: 72, sm: 96 },
                height: { xs: 72, sm: 96 },
                borderRadius: '20px',
                backgroundColor: '#FFFFFF',
                color: '#4F2BCB',
                fontWeight: 900,
                fontSize: '2.5rem',
                border: '3px solid #FFFFFF',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
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
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                  mb: 0.5,
                }}
              >
                {club?.name}
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={0.6}>
                  <GroupsOutlinedIcon sx={{ fontSize: 18, color: '#E0DBFF' }} />
                  <Typography variant="body2" sx={{ color: '#F3F0FF', fontWeight: 600 }}>
                    {members.length} Members
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>•</Typography>
                <Box display="flex" alignItems="center" gap={0.6}>
                  <EventIcon sx={{ fontSize: 18, color: '#E0DBFF' }} />
                  <Typography variant="body2" sx={{ color: '#F3F0FF', fontWeight: 600 }}>
                    {events.length} Events
                  </Typography>
                </Box>
                {club?.meeting_location && (
                  <>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>•</Typography>
                    <Typography variant="body2" sx={{ color: '#F3F0FF', fontWeight: 600 }}>
                      📍 {club.meeting_location}
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ alignSelf: { xs: 'flex-start', md: 'flex-end' } }}>
            {isMember ? (
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <Chip
                  icon={<CheckCircleOutlineIcon style={{ color: '#4F2BCB' }} />}
                  label={`Role: ${(myRole || 'member').replace('_', ' ').toUpperCase()}`}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#4F2BCB',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    backdropFilter: 'blur(8px)',
                    py: 2,
                    px: 1,
                  }}
                />
                <Button
                  variant="primary"
                  onClick={() => navigate(`/clubs/${clubId}/chat`)}
                  startIcon={<ForumIcon />}
                  sx={{
                    backgroundColor: '#4F2BCB',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    px: 3,
                    py: 0.8,
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(79, 43, 203, 0.25)',
                    '&:hover': { backgroundColor: '#39209A' },
                  }}
                >
                  {isClubManager ? 'Chat Console' : 'Chat with Club'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLeave}
                  disabled={actionLoading}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#EF4444',
                    borderColor: '#FECACA',
                    borderRadius: '10px',
                    px: 2.5,
                    py: 0.8,
                    fontWeight: 700,
                    '&:hover': { backgroundColor: '#FFFFFF', borderColor: '#EF4444' },
                  }}
                >
                  {actionLoading ? 'Leaving...' : 'Leave Club'}
                </Button>
              </Box>
            ) : myRequest?.status === 'PENDING' ? (
              <Chip
                icon={<HourglassEmptyIcon style={{ color: '#B45309' }} />}
                label="Request Pending Review"
                sx={{
                  backgroundColor: 'rgba(254, 243, 199, 0.95)',
                  color: '#B45309',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  py: 2,
                  px: 1.5,
                  borderRadius: '12px',
                  backdropFilter: 'blur(8px)',
                }}
              />
            ) : myRequest?.status === 'REJECTED' ? (
              <Box display="flex" alignItems="center" gap={1.5}>
                <Chip
                  icon={<CancelOutlinedIcon style={{ color: '#DC2626' }} />}
                  label="Declined"
                  sx={{
                    backgroundColor: 'rgba(254, 226, 226, 0.95)',
                    color: '#DC2626',
                    fontWeight: 800,
                  }}
                />
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  disabled={actionLoading}
                  sx={{
                    backgroundColor: '#4F2BCB',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    px: 3,
                    py: 0.8,
                    fontWeight: 700,
                  }}
                >
                  {actionLoading ? 'Submitting...' : 'Reapply'}
                </Button>
              </Box>
            ) : (
              <Button
                variant="primary"
                onClick={handleJoin}
                disabled={actionLoading}
                sx={{
                  backgroundColor: '#4F2BCB',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.2,
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(79, 43, 203, 0.4)',
                  '&:hover': { backgroundColor: '#39209A' },
                }}
              >
                {actionLoading ? 'Submitting Request...' : 'Join Club'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* 2. MAIN GRID (ABOUT US, LEADERSHIP TEAM, GALLERY, CONTACT) */}
      <Grid container spacing={3.5} mb={5}>
        <Grid item xs={12} md={7} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 3.5 },
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3.5,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                About Us
              </Typography>
              {isClubManager && (
                <Button
                  variant="ghost"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => setEditModalOpen(true)}
                  sx={{ fontSize: '0.78rem', color: '#4F2BCB' }}
                >
                  Edit
                </Button>
              )}
            </Box>
            <Typography variant="body1" sx={{ color: '#555565', lineHeight: 1.8, fontSize: '0.96rem' }}>
              {club?.description ||
                'Welcome to our club! We are dedicated to bringing students together through engaging workshops, competitions, skill-building events, and community initiatives.'}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 3.5 },
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                  Leadership Team
                </Typography>
                <Typography variant="body2" sx={{ color: '#777788' }}>
                  Elected and appointed officers leading club operations.
                </Typography>
              </Box>
              <Chip
                label={`${leadershipMembers.length} Officers`}
                size="small"
                sx={{ backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700 }}
              />
            </Box>

            {leadershipMembers.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9DA0AE', py: 2 }}>
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
                          border: '1px solid #F0EFF8',
                          backgroundColor: '#FBFBFE',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 4px 15px rgba(79, 43, 203, 0.06)',
                            borderColor: '#4F2BCB',
                          },
                        }}
                      >
                        <Avatar
                          src={getImageUrl(officer.avatar_url)}
                          sx={{
                            width: 48,
                            height: 48,
                            backgroundColor: '#EAEAFF',
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
                              fontWeight: 700,
                              color: '#20202A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {officer.username}
                          </Typography>
                          <Chip
                            label={roleConfig.label}
                            size="small"
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              backgroundColor: roleConfig.bg,
                              color: roleConfig.color,
                              height: 20,
                              px: 0.5,
                              mt: 0.3,
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

        <Grid item xs={12} md={5} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3.5,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <CollectionsOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                  Gallery
                </Typography>
              </Box>
              {isClubManager && (
                <Button
                  variant="ghost"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => setEditModalOpen(true)}
                  sx={{ fontSize: '0.78rem', color: '#4F2BCB' }}
                >
                  Manage
                </Button>
              )}
            </Box>

            <Grid container spacing={1.5}>
              {displayGallery.map((item, index) => (
                <Grid item xs={6} key={index}>
                  <Tooltip title={item.title || 'Photo'}>
                    <Box
                      sx={{
                        height: 100,
                        borderRadius: '12px',
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

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                Contact & Details
              </Typography>
              {isClubManager && (
                <Button
                  variant="ghost"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => setEditModalOpen(true)}
                  sx={{ fontSize: '0.78rem', color: '#4F2BCB' }}
                >
                  Edit
                </Button>
              )}
            </Box>

            <Stack spacing={2}>
              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <EmailOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700, textTransform: 'uppercase' }}>
                    Email Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    {club?.contact_email || 'contact@clubcentralize.edu'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <MeetingRoomOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700, textTransform: 'uppercase' }}>
                    Meeting Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    {club?.meeting_location || 'Student Center, Room 304'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <AccessTimeOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700, textTransform: 'uppercase' }}>
                    Regular Meetings
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    {club?.meeting_time || 'Every Thursday at 4:30 PM'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 3. TABS: EVENTS & MEMBER ROSTER */}
      <Box sx={{ borderBottom: 1, borderColor: '#E9E7F2', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#777788',
              '&.Mui-selected': { color: '#4F2BCB' },
            },
            '& .MuiTabs-indicator': { backgroundColor: '#4F2BCB', height: 3 },
          }}
        >
          <Tab icon={<EventIcon fontSize="small" />} iconPosition="start" label={`Club Events (${events.length})`} />
          <Tab icon={<GroupsOutlinedIcon fontSize="small" />} iconPosition="start" label={`All Members (${members.length})`} />
        </Tabs>
      </Box>

      {/* Tab 0: Events */}
      {activeTab === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1.5}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
              Upcoming & Recent Events
            </Typography>
            {isClubManager && (
              <Button
                variant="primary"
                onClick={() => navigate(`/clubs/${clubId}/events/create`)}
                startIcon={<AddIcon />}
                sx={{ backgroundColor: '#4F2BCB' }}
              >
                Create Event
              </Button>
            )}
          </Box>

          {loadingEvents ? (
            <CircularProgress sx={{ color: '#4F2BCB' }} />
          ) : events.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px dashed #E9E7F2',
              }}
            >
              <EventIcon sx={{ fontSize: 48, color: '#9DA0AE', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#20202A' }}>
                No events scheduled yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#777788' }}>
                Check back soon for workshops, seminars, and competitions.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {events.map((ev) => (
                <Grid item xs={12} sm={6} md={4} key={ev.id}>
                  <Card
                    sx={{
                      p: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      border: '1px solid #E9E7F2',
                    }}
                  >
                    {ev.image_url && (
                      <Box
                        component="img"
                        src={getImageUrl(ev.image_url)}
                        alt={ev.title}
                        sx={{
                          width: '100%',
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: '12px',
                          mb: 2,
                        }}
                      />
                    )}

                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 1 }}>
                      {ev.title || ev.name}
                    </Typography>

                    {ev.start_time && (
                      <Box display="flex" alignItems="center" gap={1} mb={0.8}>
                        <CalendarMonthIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                        <Typography variant="body2" sx={{ color: '#6E6D7A' }}>
                          {new Date(ev.start_time).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                    )}

                    {ev.location && (
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <LocationOnIcon sx={{ fontSize: 16, color: '#777788' }} />
                        <Typography variant="body2" sx={{ color: '#777788' }}>
                          {ev.location}
                        </Typography>
                      </Box>
                    )}

                    <Box mt="auto" pt={1}>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => navigate(`/clubs/${clubId}/events/${ev.id}`)}
                        sx={{ fontWeight: 700, color: '#4F2BCB' }}
                      >
                        View Event Details →
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 1: Member Roster */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 2.5 }}>
            Club Members Roster ({members.length})
          </Typography>

          {loadingMembers ? (
            <CircularProgress sx={{ color: '#4F2BCB' }} />
          ) : members.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#9DA0AE' }}>No members in this club yet.</Typography>
          ) : (
            <Grid container spacing={2.5}>
              {members.map((member) => {
                const roleInfo = ROLE_CONFIGS[member.role] || ROLE_CONFIGS.member;

                return (
                  <Grid item xs={12} sm={6} md={3} key={member.user_id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        height: '100%',
                        borderRadius: '16px',
                        border: '1px solid #E9E7F2',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Avatar
                        src={getImageUrl(member.avatar_url)}
                        sx={{
                          width: 52,
                          height: 52,
                          backgroundColor: '#E0DBFF',
                          color: '#4F2BCB',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          mb: 1.5,
                        }}
                      >
                        {member.username?.charAt(0).toUpperCase()}
                      </Avatar>

                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, color: '#20202A', fontSize: '0.95rem', mb: 0.8 }}
                      >
                        {member.username}
                      </Typography>

                      <Chip
                        label={roleInfo.label}
                        size="small"
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: roleInfo.bg,
                          color: roleInfo.color,
                          borderRadius: '12px',
                          height: 24,
                          px: 1,
                        }}
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Edit Club Modal */}
      {club && (
        <EditClubModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          club={club}
          onUpdated={(updated) => {
            setClub(updated);
            fetchClub();
          }}
        />
      )}
    </Box>
  );
};

export default ClubDetails;
