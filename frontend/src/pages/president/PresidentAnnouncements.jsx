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
  Chip,
  Stack,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useAuth } from '../../context/AuthContext';
import {
  fetchAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../api/announcementsApi';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const ANNOUNCEMENT_TYPES = ['General', 'Urgent', 'Event Notice', 'Achievement', 'Election'];

const TAG_CONFIG = {
  Urgent: { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
  General: { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  'Event Notice': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  Achievement: { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' },
  Election: { bg: '#F3F0FF', color: '#7C3AED', border: '#DDD6FE' },
};

const PresidentAnnouncements = () => {
  const { presidentOfClubs } = useAuth();
  const myClubId = presidentOfClubs?.[0]?.club_id;
  const myClubName = presidentOfClubs?.[0]?.club_name || 'My Club';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', announcement_type: 'General' });
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncements = async () => {
    if (!myClubId) return;
    try {
      setLoading(true);
      const data = await fetchAllAnnouncements(myClubId);
      setAnnouncements(data || []);
    } catch (err) {
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [myClubId]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ title: '', content: '', announcement_type: 'General' });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      content: item.content,
      announcement_type: item.announcement_type || 'General',
    });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      setSuccess('Announcement deleted successfully!');
      loadAnnouncements();
    } catch (err) {
      setError('Failed to delete announcement.');
    }
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
      if (editingItem) {
        await updateAnnouncement(editingItem.id, form);
        setSuccess('Announcement updated successfully!');
      } else {
        await createAnnouncement(myClubId, form);
        setSuccess('Announcement published successfully!');
      }
      setModalOpen(false);
      loadAnnouncements();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const type = a.announcement_type || 'General';
    const matchesType = selectedTypeFilter === 'ALL' || type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 6 }}>
      {/* Header Bar */}
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
            Club Bulletins & Announcements
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Club: <strong>{myClubName}</strong> — Broadcast categorized notices, schedules, and official alerts to members.
          </Typography>
        </Box>
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
          sx={{ px: 2.5 }}
        >
          + Create Announcement
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

      <Grid container spacing={3.5}>
        {/* Left Column: Announcements List */}
        <Grid item xs={12} md={8}>
          {/* Search Box & Category Filters */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '18px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3,
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <TextField
              placeholder="Search announcements by keywords or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 1.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#8E90A2' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={1} overflow="auto" pb={0.5}>
              <Chip
                label="All"
                size="small"
                clickable
                onClick={() => setSelectedTypeFilter('ALL')}
                sx={{
                  backgroundColor: selectedTypeFilter === 'ALL' ? '#4F2BCB' : '#F8F7FD',
                  color: selectedTypeFilter === 'ALL' ? '#FFFFFF' : '#5E5D6E',
                  fontWeight: 800,
                  borderRadius: '10px',
                  py: 1.6,
                }}
              />
              {ANNOUNCEMENT_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  size="small"
                  clickable
                  onClick={() => setSelectedTypeFilter(type)}
                  sx={{
                    backgroundColor: selectedTypeFilter === type ? '#4F2BCB' : '#F8F7FD',
                    color: selectedTypeFilter === type ? '#FFFFFF' : '#5E5D6E',
                    fontWeight: 800,
                    borderRadius: '10px',
                    py: 1.6,
                  }}
                />
              ))}
            </Stack>
          </Paper>

          {filteredAnnouncements.length === 0 ? (
            <EmptyState
              icon={<CampaignIcon />}
              title="No announcements found"
              message="Publish your first announcement to notify club members."
              action={
                <Button variant="primary" startIcon={<AddIcon />} onClick={openCreateModal}>
                  Create Announcement
                </Button>
              }
            />
          ) : (
            <Stack spacing={2.2}>
              {filteredAnnouncements.map((item) => {
                const assignedTag = item.announcement_type || 'General';
                const tagConfig = TAG_CONFIG[assignedTag] || TAG_CONFIG.General;

                return (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '22px',
                      border: '1px solid #E9E7F2',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                      transition: 'all 0.22s ease',
                      '&:hover': {
                        borderColor: '#4F2BCB',
                        boxShadow: '0 8px 24px rgba(79, 43, 203, 0.08)',
                      },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" mb={1} alignItems="flex-start" gap={1.5}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Chip
                          label={assignedTag}
                          size="small"
                          sx={{
                            backgroundColor: tagConfig.bg,
                            color: tagConfig.color,
                            border: `1px solid ${tagConfig.border}`,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '6px',
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
                          {item.title}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEditModal(item)}
                            sx={{ color: '#4F2BCB', backgroundColor: '#F3F0FF', borderRadius: '8px' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id)}
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
                      {item.content}
                    </Typography>

                    <Box
                      mt="auto"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      pt={1.5}
                      borderTop="1px solid #F1EFF8"
                    >
                      <Box display="flex" alignItems="center" gap={0.6}>
                        <AccessTimeIcon sx={{ fontSize: 15, color: '#8E90A2' }} />
                        <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 600 }}>
                          Published: {new Date(item.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Grid>

        {/* Right Column: Bulletin Guidelines */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#F8F7FD',
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.2} mb={2}>
              <InfoOutlinedIcon sx={{ color: '#4F2BCB' }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Broadcast Best Practices
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#5E5D6E', lineHeight: 1.7, fontSize: '0.86rem' }}>
              • Use <strong>Urgent</strong> tags for time-sensitive deadlines, venue changes, or emergency updates.
              <br />
              • Use <strong>Event Notice</strong> to highlight registration openings and schedules.
              <br />
              • Announcements posted here are instantly visible to all student members in the public club directory feed.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

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
          {editingItem ? 'Edit Announcement' : 'Create Club Announcement'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.2} pt={1}>
              <TextField
                select
                fullWidth
                label="Category Tag"
                value={form.announcement_type}
                onChange={(e) => setForm({ ...form, announcement_type: e.target.value })}
              >
                {ANNOUNCEMENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Title *"
                placeholder="e.g. Workshop Venue Relocation Notice"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <TextField
                fullWidth
                label="Announcement Content *"
                multiline
                rows={5}
                placeholder="Detail the bulletin message for all club members..."
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

export default PresidentAnnouncements;
