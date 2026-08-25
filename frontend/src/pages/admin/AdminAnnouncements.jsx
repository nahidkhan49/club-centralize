import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Tooltip, IconButton, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign';
import { fetchAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../api/announcementsApi';
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
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
            Platform Announcements
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788' }}>
            Manage announcements and broadcast notices across all clubs.
          </Typography>
        </Box>
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
          sx={{ backgroundColor: '#4F2BCB' }}
        >
          New Announcement
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

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
              sx={{ backgroundColor: '#4F2BCB' }}
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
                  borderRadius: '16px',
                  border: '1px solid #E9E7F2',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  '&:hover': { boxShadow: '0 4px 20px rgba(79,43,203,0.08)' },
                }}
              >
                <Box display="flex" justifyContent="space-between" mb={1} alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 800, textTransform: 'uppercase' }}>
                      {getClubName(ann.club_id)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', fontSize: '1.05rem', mt: 0.5 }}>
                      {ann.title}
                    </Typography>
                  </Box>
                  <Box sx={{ flexShrink: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEditModal(ann)} sx={{ color: '#4F2BCB' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(ann.id)} sx={{ color: '#EF4444' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: '#6E6D7A', mb: 2, whiteSpace: 'pre-line' }}>
                  {ann.content}
                </Typography>

                <Box mt="auto" display="flex" justifyContent="space-between" alignItems="center" pt={1.5}>
                  <Typography variant="caption" sx={{ color: '#9DA0AE', fontWeight: 600 }}>
                    Published: {new Date(ann.created_at).toLocaleDateString()}
                  </Typography>
                  {ann.source_location && (
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700 }}>
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
        PaperProps={{ sx: { borderRadius: '20px', p: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#20202A' }}>
          {editingItem ? 'Edit Announcement' : 'Write Announcement'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Select Club (Optional)
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="select-club-label">Target Club</InputLabel>
                <Select
                  labelId="select-club-label"
                  value={form.club_id}
                  label="Target Club"
                  onChange={(e) => setForm({ ...form, club_id: e.target.value })}
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="">Platform / General</MenuItem>
                  {clubs.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Source Department / Location
              </Typography>
              <TextField
                fullWidth
                name="source_location"
                placeholder="e.g. Website Administration"
                value={form.source_location}
                onChange={(e) => setForm({ ...form, source_location: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Title *
              </Typography>
              <TextField
                fullWidth
                name="title"
                placeholder="e.g. Platform Upgrade"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Announcement Content *
              </Typography>
              <TextField
                fullWidth
                name="content"
                multiline
                rows={5}
                placeholder="Write the body of your notice/announcement here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              sx={{ backgroundColor: '#4F2BCB' }}
            >
              {submitting ? 'Submitting...' : editingItem ? 'Save Changes' : 'Publish Announcement'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AdminAnnouncements;
