import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign';
import {
  fetchAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../api/announcementsApi';
import { fetchAllClubs } from '../../api/adminApi';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', club_id: '', source_location: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [annData, clubsData] = await Promise.all([
        fetchAllAnnouncements(),
        fetchAllClubs(),
      ]);
      setAnnouncements(annData || []);
      setClubs(clubsData || []);
    } catch (err) {
      setError('Failed to load announcements data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ title: '', content: '', club_id: '', source_location: 'Website Administration' });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      content: item.content,
      club_id: item.club_id || '',
      source_location: item.source_location || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      setSuccess('Announcement deleted successfully!');
      loadData();
    } catch (err) {
      setError('Failed to delete announcement.');
    }
  };

  const getClubName = (clubId) => {
    if (!clubId) return 'Platform Announcement';
    return clubs.find((c) => c.id === clubId)?.name || `Club #${clubId}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const selectedClub = clubs.find((c) => c.id === Number(form.club_id));
      const payload = {
        title: form.title,
        content: form.content,
        club_id: form.club_id ? Number(form.club_id) : null,
        club_name: selectedClub ? selectedClub.name : 'Platform Announcement',
        source_location: form.source_location || 'Website Administration',
        is_published: true,
      };

      if (editingItem) {
        await updateAnnouncement(editingItem.id, payload);
        setSuccess('Announcement updated successfully!');
      } else {
        await createAnnouncement(payload);
        setSuccess('Announcement published successfully!');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && announcements.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 6 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3.5}
        flexWrap="wrap"
        gap={2}
      >
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
            Platform Bulletins & Notices
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Broadcast platform-wide notifications or club-specific announcements.
          </Typography>
        </Box>
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
          sx={{ px: 2.5 }}
        >
          New Announcement
        </Button>
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

      {announcements.length === 0 ? (
        <EmptyState
          icon={<CampaignIcon />}
          title="No announcements yet"
          message="Publish news, schedules, or platform updates."
          action={
            <Button
              variant="primary"
              startIcon={<AddIcon />}
              onClick={openCreateModal}
            >
              Write First Announcement
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {announcements.map((ann) => (
            <Grid item xs={12} md={6} key={ann.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '22px',
                  border: '1px solid #E9E7F2',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    borderColor: '#4F2BCB',
                    boxShadow: '0 8px 24px rgba(79, 43, 203, 0.08)',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" mb={1.2} alignItems="flex-start" gap={1.5}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Chip
                      label={getClubName(ann.club_id)}
                      size="small"
                      sx={{
                        backgroundColor: '#F3F0FF',
                        color: '#4F2BCB',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                        border: '1px solid #D4CCF7',
                        mb: 0.8,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: '#20202A',
                        fontSize: '1.08rem',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {ann.title}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditModal(ann)}
                        sx={{ color: '#4F2BCB', backgroundColor: '#F3F0FF', borderRadius: '8px' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(ann.id)}
                        sx={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderRadius: '8px' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ color: '#5E5D6E', mb: 2, whiteSpace: 'pre-line', lineHeight: 1.7 }}
                >
                  {ann.content}
                </Typography>

                <Box
                  mt="auto"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pt={1.5}
                  borderTop="1px solid #F1EFF8"
                >
                  <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 600 }}>
                    Published: {new Date(ann.created_at).toLocaleDateString()}
                  </Typography>
                  {ann.source_location && (
                    <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 700 }}>
                      Source: {ann.source_location}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Write/Edit Announcement Dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            color: '#20202A',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {editingItem ? 'Edit Announcement' : 'Write Announcement'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.2} pt={1}>
              <FormControl fullWidth size="small">
                <InputLabel id="select-club-label">Target Club</InputLabel>
                <Select
                  labelId="select-club-label"
                  value={form.club_id}
                  label="Target Club"
                  onChange={(e) => setForm({ ...form, club_id: e.target.value })}
                >
                  <MenuItem value="">Platform / General</MenuItem>
                  {clubs.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Source Department / Location"
                name="source_location"
                placeholder="e.g. Website Administration"
                value={form.source_location}
                onChange={(e) => setForm({ ...form, source_location: e.target.value })}
              />

              <TextField
                fullWidth
                label="Title *"
                name="title"
                placeholder="e.g. Platform Maintenance Notice"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <TextField
                fullWidth
                label="Announcement Content *"
                name="content"
                multiline
                rows={5}
                placeholder="Write the body of your notice/announcement here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {editingItem ? 'Save Changes' : 'Publish Announcement'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AdminAnnouncements;
