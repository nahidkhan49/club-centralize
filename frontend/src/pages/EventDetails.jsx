import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getEvent, joinEvent, leaveEvent, deleteEvent } from '../api/eventApi';
import api, { getImageUrl } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const DEFAULT_EVENT_BANNER = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const EventDetails = () => {
  const { clubId, eventId } = useParams();
  const navigate = useNavigate();
  const { systemRole } = useAuth();
  const isAdmin = systemRole === 'admin';

  const [event, setEvent] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await getEvent(eventId);
      setEvent(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch event', err);
      setError(err?.response?.data?.detail || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubMembers = async () => {
    if (!clubId) return;
    try {
      const res = await api.get(`/clubs/${clubId}/members`);
      setClubMembers(res.data || []);
    } catch (err) {
      console.error('Failed to load club members', err);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchClubMembers();
  }, [eventId, clubId]);

  const handleJoin = async () => {
    try {
      setActionLoading(true);
      await joinEvent(eventId);
      await fetchEvent();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to join event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setActionLoading(true);
      await leaveEvent(eventId);
      await fetchEvent();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to leave event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteEvent(eventId);
      navigate(`/clubs/${clubId}`);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete event');
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const currentUserId = Number(localStorage.getItem('user_id'));
  const isParticipant = event?.participants?.some((p) => p.id === currentUserId || p.user_id === currentUserId);
  const isClubLeader = isAdmin || clubMembers.some(
    (m) => m.user_id === currentUserId && (m.role === 'president' || m.role === 'secretary')
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (error && !event) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        <Button variant="primary" onClick={() => navigate(`/clubs/${clubId}`)}>
          Back to Club
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 2 }}>
      {/* Top Navigation & Leader Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box
          component={RouterLink}
          to={`/clubs/${clubId}`}
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
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Club
        </Box>

        {isClubLeader && (
          <Box display="flex" gap={1.5}>
            <Button
              variant="ghost"
              component={RouterLink}
              to={`/clubs/${clubId}/events/${eventId}/edit`}
              startIcon={<EditIcon />}
              sx={{ color: '#4F2BCB' }}
            >
              Edit Event
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(true)}
              startIcon={<DeleteIcon />}
              sx={{
                color: '#EF4444',
                borderColor: '#FEE2E2',
                '&:hover': { backgroundColor: '#FEF2F2' },
              }}
            >
              Delete Event
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Header Area */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 4,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={getImageUrl(event?.image_url) || DEFAULT_EVENT_BANNER}
          alt={event?.title || 'Event poster'}
          onError={(e) => {
            e.target.src = DEFAULT_EVENT_BANNER;
          }}
          sx={{
            width: '100%',
            height: { xs: 200, sm: 300, md: 360 },
            objectFit: 'cover',
            borderBottom: '1px solid #E9E7F2',
            display: 'block',
          }}
        />

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.8rem', mb: 2 }}>
                {event?.title || event?.name}
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={3} alignItems="center">
                {event?.start_time && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarMonthIcon sx={{ fontSize: 20, color: '#4F2BCB' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                      {new Date(event.start_time).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                )}

                {event?.location && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOnIcon sx={{ fontSize: 20, color: '#777788' }} />
                    <Typography variant="body2" sx={{ color: '#777788' }}>
                      {event.location}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={4} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              {isParticipant ? (
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Chip
                    icon={<CheckCircleIcon style={{ color: '#10B981' }} />}
                    label="Registered"
                    sx={{ backgroundColor: '#E6F4EA', color: '#10B981', fontWeight: 700 }}
                  />
                  <Button
                    variant="ghost"
                    onClick={handleLeave}
                    disabled={actionLoading}
                    sx={{ color: '#EF4444' }}
                  >
                    Cancel Registration
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
                    px: 3.5,
                    py: 1.2,
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    '&:hover': { backgroundColor: '#39209A' },
                  }}
                >
                  {actionLoading ? 'Registering...' : 'Register for Event'}
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Tabs for About & Attendees */}
      <Box sx={{ borderBottom: 1, borderColor: '#E9E7F2', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#777788',
              '&.Mui-selected': { color: '#4F2BCB' },
            },
            '& .MuiTabs-indicator': { backgroundColor: '#4F2BCB', height: 3 },
          }}
        >
          <Tab label="About" />
          {isClubLeader && <Tab label={`Attendees (${event?.participants?.length || 0})`} />}
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: '20px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 1.5 }}>
                About This Event
              </Typography>
              <Typography variant="body1" sx={{ color: '#525266', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {event?.description || 'Join us for this exciting event hosted by the club!'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 2.5, fontSize: '1.05rem' }}>
                Event Schedule
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={1.5} alignItems="flex-start">
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#4F2BCB', mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A' }}>
                      Opening & Welcome
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#777788' }}>
                      Welcome remarks and attendee check-in.
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1.5} alignItems="flex-start">
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#4F2BCB', mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A' }}>
                      Keynote & Activities
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#777788' }}>
                      Main presentation and hands-on session.
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1.5} alignItems="flex-start">
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#4F2BCB', mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A' }}>
                      Q&A and Networking
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#777788' }}>
                      Open discussion and closing remarks.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && isClubLeader && (
        <Paper
          elevation={0}
          sx={{
            p: 3.5,
            borderRadius: '20px',
            border: '1px solid #E9E7F2',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 2.5 }}>
            Registered Attendees ({event?.participants?.length || 0})
          </Typography>

          {!event?.participants || event.participants.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#777788' }}>
              No registered attendees yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {event.participants.map((p) => (
                <Grid item xs={12} sm={6} md={4} key={p.id || p.user_id}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid #E9E7F2',
                      backgroundColor: '#FAF9FF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#4F2BCB', fontWeight: 700, fontSize: '0.9rem' }}>
                      {p.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A' }}>
                        {p.username}
                      </Typography>
                      {p.email && (
                        <Typography variant="caption" sx={{ color: '#777788' }}>
                          {p.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#20202A' }}>
          Delete Event?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#777788' }}>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={actionLoading}
            sx={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
          >
            {actionLoading ? 'Deleting...' : 'Delete Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetails;
