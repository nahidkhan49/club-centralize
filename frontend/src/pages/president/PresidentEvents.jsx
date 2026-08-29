import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { useAuth } from '../../context/AuthContext';
import { fetchEventsByClub, deleteEvent } from '../../api/eventApi';
import { getImageUrl } from '../../api/axiosInstance';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PresidentEvents = () => {
  const { presidentOfClubs } = useAuth();
  const myClubId = presidentOfClubs?.[0]?.club_id;
  const myClubName = presidentOfClubs?.[0]?.club_name || 'My Club';
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Event date markers
  const eventDays = new Set(
    events
      .filter((ev) => ev.start_time)
      .map((ev) => {
        const d = new Date(ev.start_time);
        if (d.getFullYear() === year && d.getMonth() === month) {
          return d.getDate();
        }
        return null;
      })
      .filter(Boolean)
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1150, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
            Event Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788' }}>
            Club: <strong>{myClubName}</strong> — Schedule, review, and manage event registrations.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/clubs/${myClubId}/events/create`)}
            sx={{ backgroundColor: '#4F2BCB' }}
          >
            + Create New Event
          </Button>
          <Button
            variant="ghost"
            startIcon={<HowToRegOutlinedIcon />}
            onClick={() => navigate('/president/events/registrations')}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7' }}
          >
            Manage Registrations
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Main 2-Column Layout Matching Quadrant 3 */}
      <Grid container spacing={3.5}>
        {/* Left Column: Interactive Calendar Widget */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(79, 43, 203, 0.03)',
            }}
          >
            {/* Calendar Month Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <IconButton size="small" onClick={handlePrevMonth}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A' }}>
                {MONTH_NAMES[month]} {year}
              </Typography>
              <IconButton size="small" onClick={handleNextMonth}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Days of Week Header */}
            <Grid container spacing={1} mb={1}>
              {DAYS.map((day) => (
                <Grid item xs={12 / 7} key={day} textAlign="center">
                  <Typography variant="caption" sx={{ color: '#9DA0AE', fontWeight: 700, fontSize: '0.72rem' }}>
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Numbers Grid */}
            <Grid container spacing={1} mb={3}>
              {/* Empty slots for offset */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <Grid item xs={12 / 7} key={`empty-${i}`} />
              ))}

              {/* Days of Month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const hasEvent = eventDays.has(dayNum);
                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <Grid item xs={12 / 7} key={dayNum} textAlign="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        mx: 'auto',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: hasEvent || isToday ? 800 : 500,
                        backgroundColor: isToday ? '#4F2BCB' : hasEvent ? '#F3F0FF' : 'transparent',
                        color: isToday ? '#FFFFFF' : hasEvent ? '#4F2BCB' : '#20202A',
                        border: hasEvent && !isToday ? '1px solid #C7B8FF' : 'none',
                        cursor: hasEvent ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        '&:hover': hasEvent ? { backgroundColor: '#4F2BCB', color: '#FFFFFF' } : {},
                      }}
                    >
                      {dayNum}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* Buttons Below Calendar Matching Mockup */}
            <Stack spacing={1.5}>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(`/clubs/${myClubId}/events/create`)}
                sx={{ backgroundColor: '#4F2BCB', py: 1.1, borderRadius: '12px', fontWeight: 700 }}
              >
                Create New Event
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/president/events/registrations')}
                sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', py: 1.1, borderRadius: '12px', fontWeight: 700 }}
              >
                Manage Registrations
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column: Upcoming Events List */}
        <Grid item xs={12} md={7} lg={8}>
          <Box mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 2 }}>
              Upcoming Events ({events.length})
            </Typography>

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
              <Stack spacing={2}>
                {events.map((ev) => {
                  const evDate = ev.start_time ? new Date(ev.start_time) : new Date();
                  const day = evDate.getDate();
                  const monthName = evDate.toLocaleDateString(undefined, { month: 'short' });
                  const isDraft = !ev.is_active;

                  return (
                    <Paper
                      key={ev.id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '18px',
                        border: '1px solid #E9E7F2',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#4F2BCB',
                          boxShadow: '0 4px 18px rgba(79, 43, 203, 0.06)',
                        },
                      }}
                    >
                      {/* Left: Date Badge + Info */}
                      <Box display="flex" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '14px',
                            backgroundColor: '#F3F0FF',
                            border: '1px solid #E2D9FF',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Typography sx={{ fontWeight: 900, color: '#4F2BCB', fontSize: '1.2rem', lineHeight: 1 }}>
                            {day}
                          </Typography>
                          <Typography sx={{ fontWeight: 700, color: '#7C3AED', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                            {monthName}
                          </Typography>
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              color: '#20202A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              mb: 0.3,
                            }}
                          >
                            {ev.title || ev.name}
                          </Typography>

                          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <AccessTimeIcon sx={{ fontSize: 15, color: '#777788' }} />
                              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>
                                {evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#CCD0DC' }}>•</Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocationOnIcon sx={{ fontSize: 15, color: '#777788' }} />
                              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>
                                {ev.location || 'Campus Center'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Right: Status Pill & Action Buttons */}
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Chip
                          label={isDraft ? 'Draft' : 'Open for Registration'}
                          size="small"
                          sx={{
                            backgroundColor: isDraft ? '#FEF3C7' : '#D1FAE5',
                            color: isDraft ? '#B45309' : '#059669',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            borderRadius: '8px',
                          }}
                        />

                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/clubs/${myClubId}/events/${ev.id}`)}
                            sx={{ color: '#4F2BCB', '&:hover': { backgroundColor: '#F3F0FF' } }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Event">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/clubs/${myClubId}/events/${ev.id}/edit`)}
                            sx={{ color: '#0284C7', '&:hover': { backgroundColor: '#E0F2FE' } }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Event">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(ev.id)}
                            sx={{ color: '#DC2626', '&:hover': { backgroundColor: '#FEE2E2' } }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PresidentEvents;
