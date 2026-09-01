import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Paper,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import InsightsIcon from '@mui/icons-material/Insights';

import api, { getImageUrl } from '../api/axiosInstance';
import { fetchEventsByClub } from '../api/eventApi';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DEFAULT_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
];

const Events = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, systemRole } = useContext(AuthContext);
  const isOfficer = systemRole === 'president' || systemRole === 'secretary' || systemRole === 'admin';

  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(clubId || 'all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const clubsRes = await api.get('/clubs');
      const clubsList = Array.isArray(clubsRes?.data) ? clubsRes.data : [];
      setClubs(clubsList);

      let fetchedEvents = [];
      if (selectedClubId !== 'all') {
        fetchedEvents = await fetchEventsByClub(selectedClubId);
      } else {
        const eventsPromises = clubsList.map((c) =>
          fetchEventsByClub(c.id).catch(() => [])
        );
        const results = await Promise.all(eventsPromises);
        fetchedEvents = results.flat();
      }

      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClubId]);

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

  const filteredEvents = events.filter((ev) => {
    const titleMatch =
      (ev.title && ev.title.toLowerCase().includes(search.toLowerCase())) ||
      (ev.name && ev.name.toLowerCase().includes(search.toLowerCase())) ||
      (ev.description && ev.description.toLowerCase().includes(search.toLowerCase())) ||
      (ev.location && ev.location.toLowerCase().includes(search.toLowerCase()));

    if (!titleMatch) return false;

    if (selectedDateFilter) {
      if (!ev.start_time) return false;
      const d = new Date(ev.start_time);
      if (
        d.getFullYear() !== year ||
        d.getMonth() !== month ||
        d.getDate() !== selectedDateFilter
      ) {
        return false;
      }
    }

    if (filterType === 'UPCOMING') {
      return ev.start_time && new Date(ev.start_time) >= new Date();
    }
    if (filterType === 'PAST') {
      return ev.start_time && new Date(ev.start_time) < new Date();
    }
    return true;
  });

  const upcomingCount = events.filter((e) => e.start_time && new Date(e.start_time) >= new Date()).length;
  const thisMonthEvents = events.filter((e) => {
    if (!e.start_time) return false;
    const d = new Date(e.start_time);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 5 }}>
      {/* Header Bar matching Reference Image 3 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5} flexWrap="wrap" gap={2}>
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
            Club Events & Workshops
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Discover campus activities, guest seminars, competitions, and skill workshops.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          {isOfficer && (
            <Button
              variant="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/events/create')}
              sx={{ px: 2.5 }}
            >
              Create New Event
            </Button>
          )}
          <Button
            variant={filterType === 'ALL' && !selectedDateFilter ? 'subtle' : 'ghost'}
            onClick={() => {
              setFilterType('ALL');
              setSelectedDateFilter(null);
            }}
            sx={{ fontWeight: 700 }}
          >
            View All Events
          </Button>
          <Button
            variant={filterType === 'PAST' ? 'subtle' : 'ghost'}
            startIcon={<HistoryIcon />}
            onClick={() => {
              setFilterType('PAST');
              setSelectedDateFilter(null);
            }}
            sx={{ fontWeight: 700 }}
          >
            Past Events Archive
          </Button>
        </Stack>
      </Box>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '18px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 3.5,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
        }}
      >
        <TextField
          placeholder="Search events by title, keyword, or venue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            flex: 1,
            minWidth: { xs: '100%', sm: 260 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#8E90A2' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          size="small"
          value={selectedClubId}
          onChange={(e) => setSelectedClubId(e.target.value)}
          sx={{
            minWidth: { xs: '100%', sm: 220 },
          }}
        >
          <MenuItem value="all">All Student Clubs</MenuItem>
          {clubs.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* Main 2-Column Layout matching Reference Image 3 */}
      <Grid container spacing={3.5}>
        {/* Left Column: Interactive Calendar Widget */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(79, 43, 203, 0.04)',
              position: 'sticky',
              top: 80,
            }}
          >
            {/* Calendar Month Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <IconButton size="small" onClick={handlePrevMonth} sx={{ color: '#5E5D6E' }}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {MONTH_NAMES[month]} {year}
              </Typography>
              <IconButton size="small" onClick={handleNextMonth} sx={{ color: '#5E5D6E' }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Day of week labels */}
            <Grid container spacing={0.5} mb={1}>
              {DAYS.map((day) => (
                <Grid item xs={12 / 7} key={day} textAlign="center">
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#8E90A2',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Days Matrix */}
            <Grid container spacing={0.5} mb={3}>
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <Grid item xs={12 / 7} key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const hasEvent = eventDays.has(dayNum);
                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;
                const isSelected = selectedDateFilter === dayNum;

                return (
                  <Grid item xs={12 / 7} key={dayNum} textAlign="center">
                    <Box
                      onClick={() => {
                        if (hasEvent) {
                          setSelectedDateFilter(isSelected ? null : dayNum);
                        }
                      }}
                      sx={{
                        width: 34,
                        height: 34,
                        mx: 'auto',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.84rem',
                        fontWeight: isSelected || isToday || hasEvent ? 900 : 500,
                        backgroundColor: isSelected
                          ? '#4F2BCB'
                          : isToday
                          ? '#F3F0FF'
                          : hasEvent
                          ? '#EDE9FE'
                          : 'transparent',
                        color: isSelected
                          ? '#FFFFFF'
                          : isToday
                          ? '#4F2BCB'
                          : hasEvent
                          ? '#4F2BCB'
                          : '#20202A',
                        border: isSelected
                          ? 'none'
                          : isToday
                          ? '1.5px solid #4F2BCB'
                          : hasEvent
                          ? '1px solid #D4CCF7'
                          : 'none',
                        cursor: hasEvent ? 'pointer' : 'default',
                        transition: 'all 0.18s ease',
                        '&:hover': hasEvent
                          ? {
                              backgroundColor: '#4F2BCB',
                              color: '#FFFFFF',
                              transform: 'scale(1.08)',
                            }
                          : {},
                      }}
                    >
                      {dayNum}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* Quick Filter Buttons */}
            <Stack spacing={1.2}>
              <Button
                variant={filterType === 'UPCOMING' && !selectedDateFilter ? 'primary' : 'ghost'}
                fullWidth
                onClick={() => {
                  setFilterType('UPCOMING');
                  setSelectedDateFilter(null);
                }}
                sx={{ py: 1.1, borderRadius: '12px', fontWeight: 800 }}
              >
                Upcoming Events ({upcomingCount})
              </Button>
              <Button
                variant={filterType === 'ALL' && !selectedDateFilter ? 'subtle' : 'ghost'}
                fullWidth
                onClick={() => {
                  setFilterType('ALL');
                  setSelectedDateFilter(null);
                }}
                sx={{ py: 1.1, borderRadius: '12px', fontWeight: 800 }}
              >
                View All Events ({events.length})
              </Button>
              {selectedDateFilter && (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => setSelectedDateFilter(null)}
                  sx={{ py: 0.8, borderRadius: '12px', fontSize: '0.78rem' }}
                >
                  Clear Date Filter ({selectedDateFilter} {MONTH_NAMES[month]})
                </Button>
              )}
            </Stack>

            {/* Quick Stats Box matching Reference Image 3 */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: '16px',
                backgroundColor: '#F8F7FD',
                border: '1px solid #E9E7F2',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <InsightsIcon />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.86rem',
                  }}
                >
                  Monthly Schedule
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                  This month: <strong>{thisMonthEvents}</strong> events planned
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Featured Upcoming Events List */}
        <Grid item xs={12} md={7} lg={8}>
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '1.15rem',
                }}
              >
                Featured Events ({filteredEvents.length})
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label="All"
                  size="small"
                  clickable
                  onClick={() => {
                    setFilterType('ALL');
                    setSelectedDateFilter(null);
                  }}
                  sx={{
                    backgroundColor: filterType === 'ALL' && !selectedDateFilter ? '#4F2BCB' : '#F1F5F9',
                    color: filterType === 'ALL' && !selectedDateFilter ? '#FFFFFF' : '#475569',
                    fontWeight: 800,
                    borderRadius: '20px',
                    px: 1,
                  }}
                />
                <Chip
                  label="Upcoming"
                  size="small"
                  clickable
                  onClick={() => {
                    setFilterType('UPCOMING');
                    setSelectedDateFilter(null);
                  }}
                  sx={{
                    backgroundColor: filterType === 'UPCOMING' && !selectedDateFilter ? '#4F2BCB' : '#F1F5F9',
                    color: filterType === 'UPCOMING' && !selectedDateFilter ? '#FFFFFF' : '#475569',
                    fontWeight: 800,
                    borderRadius: '20px',
                    px: 1,
                  }}
                />
              </Stack>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress sx={{ color: '#4F2BCB' }} />
              </Box>
            ) : filteredEvents.length === 0 ? (
              <EmptyState
                icon={<CalendarMonthIcon />}
                title="No events found"
                message="Try adjusting your search query, club filter, or calendar selection."
              />
            ) : (
              <Stack spacing={2.2}>
                {filteredEvents.map((ev, index) => {
                  const evDate = ev.start_time ? new Date(ev.start_time) : new Date();
                  const day = evDate.getDate();
                  const monthName = evDate.toLocaleDateString(undefined, { month: 'short' });
                  const fallbackImg = DEFAULT_EVENT_IMAGES[index % DEFAULT_EVENT_IMAGES.length];
                  const posterUrl = ev.image_url ? getImageUrl(ev.image_url) : fallbackImg;
                  const isUpcoming = ev.start_time ? new Date(ev.start_time) >= new Date() : true;

                  return (
                    <Paper
                      key={ev.id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '20px',
                        border: '1px solid #E9E7F2',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2.5,
                        transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                        '&:hover': {
                          borderColor: '#4F2BCB',
                          boxShadow: '0 8px 24px rgba(79, 43, 203, 0.09)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => navigate(`/clubs/${ev.club_id || selectedClubId}/events/${ev.id}`)}
                    >
                      {/* Poster Thumbnail */}
                      <Box
                        sx={{
                          width: { xs: '100%', sm: 140 },
                          height: { xs: 150, sm: 100 },
                          borderRadius: '16px',
                          overflow: 'hidden',
                          position: 'relative',
                          flexShrink: 0,
                          backgroundColor: '#F3F0FF',
                        }}
                      >
                        <Box
                          component="img"
                          src={posterUrl}
                          alt={ev.title || 'Event poster'}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>

                      {/* Title & Metadata */}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            color: '#20202A',
                            fontSize: '1.05rem',
                            mb: 0.8,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {ev.title || ev.name}
                        </Typography>

                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={0.8}>
                          <Box
                            sx={{
                              px: 1.2,
                              py: 0.4,
                              borderRadius: '8px',
                              backgroundColor: '#F3F0FF',
                              color: '#4F2BCB',
                              fontWeight: 800,
                              fontSize: '0.76rem',
                              border: '1px solid #D4CCF7',
                            }}
                          >
                            {day} {monthName}
                          </Box>

                          <Box display="flex" alignItems="center" gap={0.5}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: '#8E90A2' }} />
                            <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                              {evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>

                          <Typography variant="caption" sx={{ color: '#CCD0DC' }}>•</Typography>

                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOnIcon sx={{ fontSize: 16, color: '#8E90A2' }} />
                            <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                              {ev.location || 'University Campus'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Right: Status Badge & Button */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'row', sm: 'column' },
                          alignItems: { xs: 'center', sm: 'flex-end' },
                          justifyContent: 'space-between',
                          gap: 1.5,
                          width: { xs: '100%', sm: 'auto' },
                          flexShrink: 0,
                        }}
                      >
                        <Chip
                          label={isUpcoming ? 'Registration Open' : 'Event Concluded'}
                          size="small"
                          sx={{
                            backgroundColor: isUpcoming ? '#D1FAE5' : '#F1F5F9',
                            color: isUpcoming ? '#059669' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '8px',
                            border: `1px solid ${isUpcoming ? '#A7F3D0' : '#E2E8F0'}`,
                          }}
                        />

                        <Button
                          variant="ghost"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/clubs/${ev.club_id || 1}/events/${ev.id}`);
                          }}
                          sx={{
                            color: '#4F2BCB',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                          }}
                        >
                          View Details →
                        </Button>
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

export default Events;
