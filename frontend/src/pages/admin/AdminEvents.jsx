import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { fetchAllClubs } from '../../api/adminApi';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, clubsData] = await Promise.all([
          api.get('/events/?limit=200'),
          fetchAllClubs(),
        ]);
        setEvents(eventsRes.data || []);
        setClubs(clubsData || []);
      } catch (e) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getClubName = (clubId) => clubs.find((c) => c.id === clubId)?.name || `Club #${clubId}`;

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      getClubName(e.club_id).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 6 }}>
      <Box mb={3.5}>
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
          All Club Events & Workshops
        </Typography>
        <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
          {events.length} registered campus events across all student organizations.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      <TextField
        fullWidth
        placeholder="Search events by title, keyword, or club name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3.5,
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#8E90A2' }} />
            </InputAdornment>
          ),
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={<EventOutlinedIcon />} title="No events found" />
      ) : (
        <Grid container spacing={3}>
          {filtered.map((ev) => (
            <Grid item xs={12} sm={6} md={4} key={ev.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '22px',
                  border: '1px solid #E9E7F2',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                  transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
                  '&:hover': {
                    borderColor: '#4F2BCB',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 10px 24px rgba(79, 43, 203, 0.08)',
                  },
                }}
                onClick={() => navigate(`/clubs/${ev.club_id}/events/${ev.id}`)}
              >
                <Chip
                  label={getClubName(ev.club_id)}
                  size="small"
                  sx={{
                    mb: 1.5,
                    backgroundColor: '#F3F0FF',
                    color: '#4F2BCB',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    borderRadius: '8px',
                    alignSelf: 'flex-start',
                    border: '1px solid #D4CCF7',
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: '#20202A',
                    fontSize: '1.05rem',
                    mb: 1.5,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {ev.title}
                </Typography>

                {ev.start_time && (
                  <Box display="flex" alignItems="center" gap={0.8} mb={0.8}>
                    <CalendarMonthIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                    <Typography variant="body2" sx={{ color: '#5E5D6E', fontSize: '0.84rem', fontWeight: 600 }}>
                      {new Date(ev.start_time).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Box>
                )}

                {ev.location && (
                  <Box display="flex" alignItems="center" gap={0.8} mb={1.5}>
                    <LocationOnIcon sx={{ fontSize: 16, color: '#8E90A2' }} />
                    <Typography variant="body2" sx={{ color: '#5E5D6E', fontSize: '0.84rem' }}>
                      {ev.location}
                    </Typography>
                  </Box>
                )}

                <Box mt="auto" pt={1.5} borderTop="1px solid #F1EFF8" display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={ev.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: ev.is_active ? '#D1FAE5' : '#FEE2E2',
                      color: ev.is_active ? '#059669' : '#DC2626',
                      borderRadius: '6px',
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clubs/${ev.club_id}/events/${ev.id}/manage`);
                    }}
                    sx={{ fontSize: '0.78rem', color: '#4F2BCB', fontWeight: 800 }}
                  >
                    Manage Tasks →
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminEvents;
