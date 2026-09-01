import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';

import { useAuth } from '../../context/AuthContext';
import {
  fetchEventParticipants,
  addEventParticipant,
  removeEventParticipant,
  getEvent,
} from '../../api/eventApi';
import { fetchClubMembers } from '../../api/adminApi';
import api, { getImageUrl } from '../../api/axiosInstance';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const SecretaryEventRegistrations = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { secretaryOfClubs, presidentOfClubs } = useAuth();
  const myClubId = secretaryOfClubs?.[0]?.club_id || presidentOfClubs?.[0]?.club_id;

  const [participants, setParticipants] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      let eventData = null;
      try {
        eventData = await getEvent(eventId);
        setEvent(eventData);
      } catch (e) {
        console.warn('Could not fetch single event by id, trying all events fallback', e);
        const allRes = await api.get('/events/?limit=200').catch(() => ({ data: [] }));
        eventData = (allRes.data || []).find((ev) => String(ev.id) === String(eventId));
        if (eventData) setEvent(eventData);
      }

      const participantsData = await fetchEventParticipants(eventId).catch(() => []);
      setParticipants(participantsData || []);

      const targetClubId = eventData?.club_id || myClubId;
      if (targetClubId) {
        const membersData = await fetchClubMembers(targetClubId).catch(() => []);
        setClubMembers(membersData || []);
      }
    } catch (err) {
      console.error('Failed to load event registration details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleAddParticipant = async () => {
    if (!selectedUserId) {
      setError('Please select a club member to register.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addEventParticipant(eventId, selectedUserId);
      setSuccess('Member registered for event successfully!');
      setAddModalOpen(false);
      setSelectedUserId('');
      loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to add member to event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId, username) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${username} from this event registration roster?`
      )
    )
      return;
    try {
      await removeEventParticipant(eventId, userId);
      setSuccess(`Removed ${username} from event registration.`);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to remove participant.');
    }
  };

  const exportCSV = () => {
    if (participants.length === 0) {
      alert('No registrations to export.');
      return;
    }
    const headers = ['ID', 'Username', 'Email', 'Full Name'];
    const rows = participants.map((p) => [
      p.id,
      p.username,
      p.email,
      p.full_name || '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `event_${eventId}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredParticipants = participants.filter(
    (p) =>
      (p.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const existingUserIds = new Set(participants.map((p) => p.id));
  const availableMembers = clubMembers.filter((m) => !existingUserIds.has(m.user_id));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 6 }}>
      {/* Top Back Link & Actions */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
        flexWrap="wrap"
        gap={1.5}
      >
        <Box
          onClick={() => navigate('/secretary/events')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Events
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="ghost"
            startIcon={<AssignmentIcon />}
            onClick={() => navigate(`/clubs/${event?.club_id || myClubId}/events/${eventId}/manage`)}
          >
            Task Board
          </Button>
          <Button
            variant="ghost"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={exportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            startIcon={<PersonAddOutlinedIcon />}
            onClick={() => setAddModalOpen(true)}
            sx={{ px: 2.2 }}
          >
            + Register Member
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Event Overview Hero Summary */}
      {event && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '22px',
            border: '1px solid #E9E7F2',
            backgroundColor: '#FFFFFF',
            mb: 3.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2.5,
            boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
          }}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1.2} mb={0.8}>
              <Chip
                label="Registration Management"
                size="small"
                sx={{
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              />
              <Chip
                label={`${participants.length} Registered`}
                size="small"
                sx={{
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: '#20202A',
                mb: 1,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {event.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={0.6}>
                <CalendarMonthIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                  {event.start_time ? new Date(event.start_time).toLocaleString() : 'TBD'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#CCD0DC' }}>•</Typography>
              <Box display="flex" alignItems="center" gap={0.6}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                  {event.location || 'Campus Center'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Search Input */}
      <TextField
        fullWidth
        placeholder="Search registered attendees by name or email..."
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

      {/* Registrations Table */}
      {filteredParticipants.length === 0 ? (
        <EmptyState
          icon={<HowToRegOutlinedIcon />}
          title="No registered attendees"
          message="Members who register for this event will appear here."
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '22px',
            border: '1px solid #E9E7F2',
            boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8F7FD' }}>
                <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Attendee</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Full Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredParticipants.map((p) => (
                <TableRow
                  key={p.id}
                  sx={{
                    '&:hover': { backgroundColor: '#FAF9FF' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.8}>
                      <Avatar
                        src={getImageUrl(p.avatar_url)}
                        sx={{
                          width: 38,
                          height: 38,
                          backgroundColor: '#EDE9FE',
                          color: '#4F2BCB',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                        }}
                      >
                        {(p.username || p.email || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: '#20202A',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {p.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 500 }}>
                      {p.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                      {p.full_name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Tooltip title="Remove Attendee">
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(p.id, p.username)}
                        sx={{
                          color: '#EF4444',
                          backgroundColor: '#FEF2F2',
                          borderRadius: '8px',
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Manual Registration Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            color: '#20202A',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Register Club Member for Event
        </DialogTitle>
        <DialogContent dividers>
          <Box pt={1}>
            <TextField
              select
              fullWidth
              label="Select Member"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              helperText="Choose a registered club member to add to this event's attendee roster."
            >
              {availableMembers.length === 0 ? (
                <MenuItem disabled value="">
                  <em>All club members are already registered</em>
                </MenuItem>
              ) : (
                availableMembers.map((m) => (
                  <MenuItem key={m.user_id} value={m.user_id}>
                    {m.username} ({m.email || 'No email'}) — {m.role}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setAddModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddParticipant}
            loading={submitting}
            disabled={availableMembers.length === 0}
          >
            Confirm Registration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecretaryEventRegistrations;
