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
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

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
  Urgent: { bg: '#FEE2E2', color: '#DC2626' },
  General: { bg: '#D1FAE5', color: '#059669' },
  'Event Notice': { bg: '#FEF3C7', color: '#D97706' },
  Achievement: { bg: '#E0F2FE', color: '#0284C7' },
  Election: { bg: '#F3F0FF', color: '#7C3AED' },
};

const PresidentAnnouncements = () => {
  const { presidentOfClubs, user } = useAuth();
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
    <Box sx={{ maxWidth: 1150, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
            Club Announcements
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788' }}>
            Club: <strong>{myClubName}</strong> — Broadcast categorized notices, alerts, and updates to all members.
          </Typography>
        </Box>
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
          sx={{ backgroundColor: '#4F2BCB' }}
        >
          + Create New Announcement
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3.5}>
        {/* Left Column: Announcements List */}
        <Grid item xs={12} md={8}>
          {/* Search Box & Category Filters */}
          <Box mb={2.5}>
            <TextField
              placeholder="Search announcements by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                mb: 1.5,
                '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: '#E9E7F2' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9DA0AE' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={1} overflow="auto" pb={0.5}>
              <Chip
                label="All Categories"
                size="small"
                clickable
                onClick={() => setSelectedTypeFilter('ALL')}
                sx={{
                  backgroundColor: selectedTypeFilter === 'ALL' ? '#4F2BCB' : '#FFFFFF',
                  color: selectedTypeFilter === 'ALL' ? '#FFFFFF' : '#6E6D7A',
                  fontWeight: 700,
                  border: '1px solid #E9E7F2',
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
                    backgroundColor: selectedTypeFilter === type ? '#4F2BCB' : '#FFFFFF',
                    color: selectedTypeFilter === type ? '#FFFFFF' : '#6E6D7A',
                    fontWeight: 700,
                    border: '1px solid #E9E7F2',
                  }}
                />
              ))}
            </Stack>
          </Box>

          {filteredAnnouncements.length === 0 ? (
            <EmptyState
              icon={<CampaignIcon />}
              title="No announcements found"
              message="Publish your first announcement to notify club members."
              action={
                <Button variant="primary" startIcon={<AddIcon />} onClick={openCreateModal} sx={{ backgroundColor: '#4F2BCB' }}>
                  Create Announcement
                </Button>
              }
            />
          ) : (
            <Stack spacing={2.5}>
              {filteredAnnouncements.map((item) => {
                const assignedTag = item.announcement_type || 'General';
                const tagConfig = TAG_CONFIG[assignedTag] || TAG_CONFIG.General;

                return (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '20px',
                      border: '1px solid #E9E7F2',
                      backgroundColor: '#FFFFFF',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#4F2BCB',
                        boxShadow: '0 6px 20px rgba(79, 43, 203, 0.06)',
                      },
                    }}
                  >
                    {/* Header Row */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5} mb={1}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.05rem' }}>
                        {item.title}
                      </Typography>

                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEditModal(item)} sx={{ color: '#0284C7' }}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: '#DC2626' }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    {/* Author & Date Subtitle */}
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <PersonOutlineIcon sx={{ fontSize: 16, color: '#777788' }} />
                      <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>
                        {user?.username || 'President'} • {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                      </Typography>
                    </Box>

                    {/* Content Description */}
                    <Typography variant="body2" sx={{ color: '#444455', lineHeight: 1.7, mb: 2.5 }}>
                      {item.content}
                    </Typography>

                    {/* Bottom Row with Selected Category Pill & Action Buttons */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                      <Chip
                        label={assignedTag}
                        size="small"
                        sx={{
                          backgroundColor: tagConfig.bg,
                          color: tagConfig.color,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          borderRadius: '8px',
                          height: 24,
                        }}
                      />

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => alert('Announcement marked as read.')}
                          sx={{ backgroundColor: '#4F2BCB', fontSize: '0.76rem', py: 0.4 }}
                        >
                          Mark as Read
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => alert('Announcement archived.')}
                          sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.76rem', py: 0.4 }}
                        >
                          Archive
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => openEditModal(item)}
                          sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.76rem', py: 0.4 }}
                        >
                          View Full Post
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Grid>

        {/* Right Column: Recent Activity Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              position: 'sticky',
              top: 80,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A', mb: 2 }}>
              Recent Activity
            </Typography>

            <Stack spacing={2}>
              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <VisibilityOutlinedIcon sx={{ fontSize: 18, color: '#4F2BCB', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#20202A', display: 'block' }}>
                    3 members viewed latest notices
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9DA0AE' }}>4 minutes ago</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <NotificationsActiveOutlinedIcon sx={{ fontSize: 18, color: '#0284C7', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#20202A', display: 'block' }}>
                    4 mentions raised in student bulletin
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9DA0AE' }}>1 hour ago</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: '#059669', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#20202A', display: 'block' }}>
                    Announcement broadcast synchronized
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9DA0AE' }}>Active</Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Modal for Create/Edit Announcement with Type Selector */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#20202A' }}>
          {editingItem ? 'Edit Announcement' : 'Publish New Announcement'}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
            <TextField
              label="Announcement Title"
              fullWidth
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            {/* Announcement Type Selector */}
            <TextField
              select
              label="Announcement Type / Category"
              fullWidth
              value={form.announcement_type || 'General'}
              onChange={(e) => setForm({ ...form, announcement_type: e.target.value })}
              helperText="Select priority level or notice category (e.g. Urgent, Event Notice, Election)."
            >
              {ANNOUNCEMENT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Announcement Details"
              fullWidth
              multiline
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting} sx={{ backgroundColor: '#4F2BCB' }}>
            {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Publish Announcement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PresidentAnnouncements;
