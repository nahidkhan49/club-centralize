import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Chip, Tooltip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import { fetchEventsByClub, deleteEvent } from '../../api/eventApi';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const PresidentEvents = () => {
  const { presidentOfClubs } = useAuth();
  const myClubId = presidentOfClubs?.[0]?.club_id;
  const myClubName = presidentOfClubs?.[0]?.club_name || 'My Club';
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadEvents = async () => {
    if (!myClubId) return;
    try {
      setLoading(true);
      const data = await fetchEventsByClub(myClubId, { include_inactive: true });
      setEvents(data || []);
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [myClubId]);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(eventId);
      setSuccess('Event deleted successfully!');
      loadEvents();
    } catch (err) {
      setError('Failed to delete event.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
            Club Events
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788' }}>
            Club: <strong>{myClubName}</strong> — Manage events and registrations.
          </Typography>
        </Box>
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/clubs/${myClubId}/events/create`)}
          sx={{ backgroundColor: '#4F2BCB' }}
        >
          Create Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarMonthIcon />}
          title="No events found"
          message="Schedule your club's first workshop, seminar, or meetup."
          action={
            <Button
              variant="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/clubs/${myClubId}/events/create`)}
              sx={{ backgroundColor: '#4F2BCB' }}
            >
              Schedule Event
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {events.map((ev) => (
            <Grid item xs={12} sm={6} md={4} key={ev.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: '1px solid #E9E7F2',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  '&:hover': { boxShadow: '0 4px 20px rgba(79,43,203,0.08)' },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', fontSize: '1rem', mb: 1 }}>
                  {ev.title}
                </Typography>

                {ev.start_time && (
                  <Box display="flex" alignItems="center" gap={0.8} mb={0.5}>
                    <CalendarMonthIcon sx={{ fontSize: 14, color: '#4F2BCB' }} />
                    <Typography variant="body2" sx={{ color: '#6E6D7A', fontSize: '0.82rem' }}>
                      {new Date(ev.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                )}

                {ev.location && (
                  <Box display="flex" alignItems="center" gap={0.8} mb={2}>
                    <LocationOnIcon sx={{ fontSize: 14, color: '#777788' }} />
                    <Typography variant="body2" sx={{ color: '#777788', fontSize: '0.82rem' }}>
                      {ev.location}
                    </Typography>
                  </Box>
                )}

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={ev.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: ev.is_active ? '#D1FAE5' : '#FEE2E2',
                      color: ev.is_active ? '#059669' : '#DC2626',
                    }}
                  />
                </Box>

                <Box mt="auto" display="flex" justifyContent="space-between" alignItems="center" pt={1}>
                  <Button
                    variant="ghost"
                    size="small"
                    startIcon={<AssignmentIndIcon />}
                    onClick={() => navigate(`/president/events/${ev.id}/registrations`)}
                    sx={{ fontSize: '0.78rem', py: 0.5, borderColor: '#E9E7F2' }}
                  >
                    Registrations
                  </Button>
                  <Box>
                    <Tooltip title="Edit Event">
                      <IconButton size="small" onClick={() => navigate(`/clubs/${myClubId}/events/${ev.id}/edit`)} sx={{ color: '#4F2BCB' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Event">
                      <IconButton size="small" onClick={() => handleDelete(ev.id)} sx={{ color: '#EF4444' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PresidentEvents;
