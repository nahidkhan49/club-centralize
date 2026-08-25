import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import api from '../api/axiosInstance';
import { fetchEventsByClub, deleteEvent } from '../api/eventApi';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';

const Events = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [userClubMemberships, setUserClubMemberships] = useState({});
  const [selectedClubId, setSelectedClubId] = useState(clubId || 'all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Event Creation Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [targetClubForCreate, setTargetClubForCreate] = useState('');

  // Event Deletion State
  const [deleteEventItem, setDeleteEventItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const clubsRes = await api.get('/clubs');
      const clubsList = Array.isArray(clubsRes?.data) ? clubsRes.data : [];
      setClubs(clubsList);

      const currentUserId = Number(localStorage.getItem('user_id'));
      const membershipsMap = {};

      // Check memberships for each club to determine user role in each club
      await Promise.all(
        clubsList.map(async (c) => {
          try {
            const memRes = await api.get(`/clubs/${c.id}/members`);
            const memList = Array.isArray(memRes?.data) ? memRes.data : [];
            const myMem = memList.find((m) => m.user_id === currentUserId);
            if (myMem) {
              membershipsMap[c.id] = myMem.role;
            }
          } catch (err) {
            console.error(`Failed to fetch members for club ${c.id}`, err);
          }
        })
      );
      setUserClubMemberships(membershipsMap);

      if (clubId) {
        const evData = await fetchEventsByClub(clubId);
        setEvents(Array.isArray(evData) ? evData : []);
      } else {
        const allEventsPromises = clubsList.map(async (c) => {
          try {
            const res = await fetchEventsByClub(c.id);
            const evList = Array.isArray(res) ? res : [];
            return evList.map((ev) => ({ ...ev, clubName: c.name, club_id: c.id }));
          } catch {
            return [];
          }
        });
        const resolved = await Promise.all(allEventsPromises);
        setEvents(resolved.flat());
      }
    } catch (err) {
      console.error('Failed to load events', err);
      setError(err?.response?.data?.detail || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  const handleDeleteConfirmed = async () => {
    if (!deleteEventItem) return;
    try {
      setActionLoading(true);
      await deleteEvent(deleteEventItem.id);
      setDeleteEventItem(null);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    if (clubId) {
      navigate(`/clubs/${clubId}/events/create`);
    } else {
      // Find clubs where user is President, Vice President, or Secretary
      const leaderClubs = clubs.filter((c) => {
        const role = userClubMemberships[c.id];
        return role === 'president' || role === 'vice_president' || role === 'secretary';
      });

      if (leaderClubs.length > 0) {
        setTargetClubForCreate(String(leaderClubs[0].id));
        setCreateDialogOpen(true);
      } else if (clubs.length > 0) {
        setTargetClubForCreate(String(clubs[0].id));
        setCreateDialogOpen(true);
      } else {
        navigate('/clubs/create');
      }
    }
  };

  const handleConfirmCreateNavigation = () => {
    if (targetClubForCreate) {
      setCreateDialogOpen(false);
      navigate(`/clubs/${targetClubForCreate}/events/create`);
    }
  };

  const filteredEvents = (Array.isArray(events) ? events : []).filter((ev) => {
    const matchesSearch =
      (ev?.title || ev?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (ev?.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (ev?.location || '').toLowerCase().includes(search.toLowerCase());

    const matchesClub =
      selectedClubId === 'all' ||
      String(ev?.club_id || clubId) === String(selectedClubId);

    return matchesSearch && matchesClub;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 2 }}>
      {clubId && (
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
            mb: 2,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Club
        </Box>
      )}

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.8rem' }}>
            Upcoming Events
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788', mt: 0.5 }}>
            Discover and manage upcoming campus workshops, hackathons, and meetups.
          </Typography>
        </Box>

        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#4F2BCB',
            color: '#FFFFFF',
            px: 2.5,
            py: 1,
            borderRadius: '10px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(79, 43, 203, 0.2)',
            '&:hover': { backgroundColor: '#39209A' },
          }}
        >
          + Create Event
        </Button>
      </Box>

      {/* Search & Filters Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
        }}
      >
        <TextField
          placeholder="Search events by title, description, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            flexGrow: 1,
            backgroundColor: '#F3F6FC',
            borderRadius: '12px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E9E7F2' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C7B8FF' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4F2BCB' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#777788' }} />
              </InputAdornment>
            ),
          }}
        />

        {!clubId && Array.isArray(clubs) && clubs.length > 0 && (
          <TextField
            select
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            sx={{
              minWidth: 200,
              backgroundColor: '#F3F6FC',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E9E7F2' },
            }}
          >
            <MenuItem value="all">All Clubs</MenuItem>
            {clubs.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress sx={{ color: '#4F2BCB' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
      ) : filteredEvents.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px dashed #E9E7F2',
          }}
        >
          <EventAvailableIcon sx={{ fontSize: 56, color: '#9DA0AE', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 1 }}>
            No events found
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788', maxWidth: 400, mx: 'auto', mb: 3 }}>
            There are no upcoming events matching your criteria right now.
          </Typography>
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            startIcon={<AddIcon />}
            sx={{ backgroundColor: '#4F2BCB' }}
          >
            Create New Event
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((ev) => {
            const targetClubId = ev.club_id || clubId;
            const clubRole = userClubMemberships[targetClubId];
            const canManage =
              clubRole === 'president' ||
              clubRole === 'vice_president' ||
              clubRole === 'secretary';

            return (
              <Grid item xs={12} sm={6} md={4} key={ev.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    border: '1px solid #E9E7F2',
                    backgroundColor: '#FFFFFF',
                    position: 'relative',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(79, 43, 203, 0.08)',
                      borderColor: '#C7B8FF',
                    },
                  }}
                >
                  {ev.image_url && (
                    <Box
                      component="img"
                      src={ev.image_url}
                      alt={ev.title}
                      sx={{
                        width: '100%',
                        height: 140,
                        objectFit: 'cover',
                        borderRadius: '10px',
                        mb: 1.5,
                      }}
                    />
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    {ev.clubName && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: '#4F2BCB',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {ev.clubName}
                      </Typography>
                    )}

                    {/* Edit & Delete Options for Club Leaders */}
                    {canManage && (
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Edit Event">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/clubs/${targetClubId}/events/${ev.id}/edit`)}
                            sx={{ color: '#4F2BCB', '&:hover': { backgroundColor: '#F3F0FF' } }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Event">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteEventItem(ev)}
                            sx={{ color: '#EF4444', '&:hover': { backgroundColor: '#FEF2F2' } }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 1.5, fontSize: '1.1rem' }}>
                    {ev.title || ev.name}
                  </Typography>

                  {ev.date && (
                    <Box display="flex" alignItems="center" gap={1} mb={0.8}>
                      <CalendarMonthIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                      <Typography variant="body2" sx={{ color: '#6E6D7A' }}>
                        {new Date(ev.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  )}

                  {ev.location && (
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <LocationOnIcon sx={{ fontSize: 16, color: '#777788' }} />
                      <Typography variant="body2" sx={{ color: '#777788' }}>
                        {ev.location}
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#777788',
                      flexGrow: 1,
                      mb: 2.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {ev.description || 'Join us for this exciting university event!'}
                  </Typography>

                  <Box pt={1.5} borderTop="1px solid #E9E7F2" display="flex" justifyContent="space-between" alignItems="center">
                    {canManage && (
                      <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
                        Manager Permissions
                      </Typography>
                    )}
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => navigate(`/clubs/${targetClubId}/events/${ev.id}`)}
                      sx={{
                        backgroundColor: '#4F2BCB',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        fontWeight: 600,
                        px: 2,
                        ml: 'auto',
                        '&:hover': { backgroundColor: '#39209A' },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Choose Club for Event Creation Modal */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 1, maxWidth: 440, width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#20202A' }}>
          Select Club to Publish Event
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
            Choose which student organization you want to schedule this event for:
          </Typography>

          <TextField
            fullWidth
            select
            value={targetClubForCreate}
            onChange={(e) => setTargetClubForCreate(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#F3F6FC',
                borderRadius: '10px',
              },
            }}
          >
            {clubs.map((c) => {
              const role = userClubMemberships[c.id];
              const roleText = role ? ` (${role})` : '';
              return (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}{roleText}
                </MenuItem>
              );
            })}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="ghost" onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmCreateNavigation}
            sx={{ backgroundColor: '#4F2BCB' }}
          >
            Continue to Form
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deleteEventItem)}
        onClose={() => setDeleteEventItem(null)}
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#20202A' }}>
          Delete "{deleteEventItem?.title || deleteEventItem?.name}"?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#777788' }}>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="ghost" onClick={() => setDeleteEventItem(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={handleDeleteConfirmed}
            disabled={actionLoading}
            sx={{ backgroundColor: '#EF4444', color: '#FFFFFF', '&:hover': { backgroundColor: '#DC2626' } }}
          >
            {actionLoading ? 'Deleting...' : 'Delete Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Events;
