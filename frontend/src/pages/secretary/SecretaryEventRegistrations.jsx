import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, IconButton, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchEventParticipants } from '../../api/adminApi';
import api from '../../api/axiosInstance';

const SecretaryEventRegistrations = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [participantsData, eventRes] = await Promise.all([
        fetchEventParticipants(eventId),
        api.get(`/events/${eventId}`),
      ]);
      setParticipants(participantsData || []);
      setEvent(eventRes.data);
    } catch (err) {
      setError('Failed to load event participants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to cancel this member\'s registration?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/events/${eventId}/participants/${userId}`);
      setSuccess('Participant removed from event successfully.');
      const participantsData = await fetchEventParticipants(eventId);
      setParticipants(participantsData || []);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to remove participant.');
    } finally {
      setActionLoading(false);
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
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 2 }}>
      <Box
        onClick={() => navigate('/secretary/events')}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.8,
          color: '#4F2BCB',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          mb: 3,
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Events
      </Box>

      <Box mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
          Event Registrations (Secretary)
        </Typography>
        <Typography variant="body2" sx={{ color: '#777788' }}>
          Event: <strong>{event?.title}</strong> — {participants.length} registered participants.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E9E7F2' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F7F6FC' }}>
              <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Participant</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#20202A' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.id} sx={{ '&:hover': { backgroundColor: '#FAF9FF' } }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 36, height: 36, backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700, fontSize: '0.9rem' }}>
                      {p.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                      {p.username}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 1.2,
                      py: 0.3,
                      borderRadius: '20px',
                      backgroundColor: '#E6F4EA',
                      color: '#137333',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                    }}
                  >
                    Registered
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Cancel Registration">
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(p.id)}
                      disabled={actionLoading}
                      sx={{ color: '#EF4444' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {participants.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#9DA0AE' }}>
                    No registrations yet for this event.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SecretaryEventRegistrations;
