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
  Card,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

import { useAuth } from '../../context/AuthContext';
import { fetchEventParticipants, addEventParticipant, removeEventParticipant, getEvent } from '../../api/eventApi';
import { fetchClubMembers } from '../../api/adminApi';
import api, { getImageUrl } from '../../api/axiosInstance';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const PresidentEventRegistrations = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { presidentOfClubs } = useAuth();
  const myClubId = presidentOfClubs?.[0]?.club_id;

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
    if (!window.confirm(`Are you sure you want to remove ${username} from this event registration roster?`)) return;
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
    const headers = ['ID', 'Username', 'Email', 'Full Name', 'Role'];
    const rows = participants.map(p => [p.id, p.username, p.email, p.full_name || '', p.system_role]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `event_${eventId}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredParticipants = participants.filter(p =>
    p.username.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.full_name && p.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const existingUserIds = new Set(participants.map(p => p.id));
  const availableMembers = clubMembers.filter(m => !existingUserIds.has(m.user_id));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1150, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Top Back Link & Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={1.5}>
        <Box
          onClick={() => navigate('/president/events')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Event Management
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="ghost"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={exportCSV}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.85rem' }}
          >
            Export Registrations (.CSV)
          </Button>
          <Button
            variant="primary"
            startIcon={<PersonAddOutlinedIcon />}
            onClick={() => setAddModalOpen(true)}
            sx={{ backgroundColor: '#4F2BCB', fontSize: '0.85rem' }}
          >
            + Register Member
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Event Overview Hero Summary */}
      {event && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '20px',
            border: '1px solid #E9E7F2',
            backgroundColor: '#FFFFFF',
            mb: 3.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2.5,
          }}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1.2} mb={0.8}>
              <Chip
                label="Registration Management"
                size="small"
                sx={{ backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 800, fontSize: '0.75rem' }}
              />
              <Chip
                label={`${participants.length} Registered`}
                size="small"
                sx={{ backgroundColor: '#D1FAE5', color: '#059669', fontWeight: 800, fontSize: '0.75rem' }}
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#20202A', mb: 1 }}>
              {event.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={0.6}>
                <CalendarMonthIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                <Typography variant="body2" sx={{ color: '#6E6D7A', fontWeight: 600 }}>
                  {event.start_time ? new Date(event.start_time).toLocaleString() : 'TBD'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#CCD0DC' }}>•</Typography>
              <Box display="flex" alignItems="center" gap={0.6}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                <Typography variant="body2" sx={{ color: '#6E6D7A', fontWeight: 600 }}>
                  {event.location || 'Campus Center'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Registrations Search & Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* Search Bar */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #F0EFF8' }}>
          <TextField
            placeholder="Search registered attendees by name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9DA0AE' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: '#E9E7F2' } }}
          />
        </Box>

        {filteredParticipants.length === 0 ? (
          <Box p={4}>
            <EmptyState
              icon={<CheckCircleOutlineIcon />}
              title="No Registrations Found"
              message={search ? 'No participants match your search query.' : 'No members have registered for this event yet.'}
              action={
                <Button
                  variant="primary"
                  startIcon={<PersonAddOutlinedIcon />}
                  onClick={() => setAddModalOpen(true)}
                  sx={{ backgroundColor: '#4F2BCB' }}
                >
                  Register a Member
                </Button>
              }
            />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#FBFBFE' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#777788', fontSize: '0.8rem', textTransform: 'uppercase' }}>Participant</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#777788', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#777788', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#777788', fontSize: '0.8rem', textTransform: 'uppercase' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredParticipants.map((p) => (
                  <TableRow key={p.id} sx={{ '&:hover': { backgroundColor: '#F9F8FD' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          src={getImageUrl(p.avatar_url)}
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: '#EAEAFF',
                            color: '#4F2BCB',
                            fontWeight: 800,
                          }}
                        >
                          {p.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A' }}>
                            {p.full_name || p.username}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9DA0AE' }}>
                            @{p.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#555565', fontWeight: 500 }}>
                        {p.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Confirmed / Attending"
                        size="small"
                        sx={{
                          backgroundColor: '#D1FAE5',
                          color: '#059669',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          borderRadius: '8px',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove Registration">
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(p.id, p.username)}
                          sx={{ color: '#DC2626', backgroundColor: '#FEE2E2' }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add Member Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#20202A' }}>
          Register Club Member for Event
        </DialogTitle>
        <DialogContent dividers>
          <Box pt={1}>
            <TextField
              select
              label="Select Club Member"
              fullWidth
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              helperText="Choose a registered member from your club roster."
            >
              {availableMembers.length === 0 ? (
                <MenuItem disabled value="">
                  All club members are already registered!
                </MenuItem>
              ) : (
                availableMembers.map((m) => (
                  <MenuItem key={m.user_id} value={m.user_id}>
                    {m.username} ({m.role})
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="ghost" onClick={() => setAddModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddParticipant}
            disabled={submitting || !selectedUserId}
            sx={{ backgroundColor: '#4F2BCB' }}
          >
            {submitting ? 'Registering...' : 'Confirm Registration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PresidentEventRegistrations;
