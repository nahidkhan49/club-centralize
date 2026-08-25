import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, Avatar, Chip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, CircularProgress, Alert, Divider, IconButton, Tooltip,
  DialogContentText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GroupsIcon from '@mui/icons-material/Groups';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllClubs, fetchClubMembers, assignClubRole, removeClubRole,
  deleteClub, fetchAllUsers, fetchClubStats
} from '../../api/adminApi';
import RoleChip from '../../components/RoleChip';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const AdminClubs = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState({ open: false, club: null, role: 'president' });
  const [deleteModal, setDeleteModal] = useState({ open: false, club: null });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clubMembers, setClubMembers] = useState({});
  const [clubStats, setClubStats] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [clubsData, usersData] = await Promise.all([fetchAllClubs(), fetchAllUsers()]);
      const validClubs = Array.isArray(clubsData) ? clubsData : [];
      const validUsers = Array.isArray(usersData) ? usersData : [];
      setClubs(validClubs);
      setUsers(validUsers);

      const membersMap = {};
      const statsMap = {};
      await Promise.all(
        validClubs.map(async (c) => {
          try {
            const [m, s] = await Promise.all([
              fetchClubMembers(c.id),
              fetchClubStats(c.id).catch(() => ({ member_count: 0, event_count: 0 }))
            ]);
            membersMap[c.id] = Array.isArray(m) ? m : [];
            statsMap[c.id] = s || {};
          } catch {
            membersMap[c.id] = [];
            statsMap[c.id] = {};
          }
        })
      );
      setClubMembers(membersMap);
      setClubStats(statsMap);
    } catch (e) {
      setError('Failed to load clubs data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAssignModal = (club, role) => {
    setAssignModal({ open: true, club, role });
    setSelectedUserId('');
    setError('');
  };

  const handleAssign = async () => {
    if (!selectedUserId) { setError('Please select a user'); return; }
    setActionLoading(true);
    setError('');
    try {
      await assignClubRole(assignModal.club.id, Number(selectedUserId), assignModal.role);
      setSuccess(`Successfully assigned ${assignModal.role} for ${assignModal.club.name}`);
      setAssignModal({ open: false, club: null, role: 'president' });
      await loadData();
    } catch (e) {
      console.error('Assign role error:', e?.response?.data || e);
      const detail = e?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(', ')
        : detail || e?.message || 'Failed to assign role.';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveRole = async (club, role) => {
    if (!window.confirm(`Are you sure you want to remove the current ${role} of ${club.name}?`)) return;
    setActionLoading(true);
    setError('');
    try {
      await removeClubRole(club.id, role);
      setSuccess(`Successfully removed ${role} from ${club.name}`);
      await loadData();
    } catch (e) {
      console.error('Remove role error:', e?.response?.data || e);
      const detail = e?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(', ')
        : detail || e?.message || `Failed to remove ${role}.`;
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClub = async () => {
    if (!deleteModal.club) return;
    setActionLoading(true);
    setError('');
    try {
      await deleteClub(deleteModal.club.id);
      setSuccess(`Successfully deleted club "${deleteModal.club.name}"`);
      setDeleteModal({ open: false, club: null });
      await loadData();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to delete club.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = (Array.isArray(clubs) ? clubs : []).filter((c) =>
    (c?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c?.category || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 2 }}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.8rem' }}>
            Club Management (Admin)
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788', mt: 0.5 }}>
            Centralized control center to create, update, assign leadership, and manage all university clubs.
          </Typography>
        </Box>
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clubs/create')}
          sx={{
            backgroundColor: '#4F2BCB',
            color: '#FFFFFF',
            px: 3,
            py: 1,
            borderRadius: '10px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(79, 43, 203, 0.25)',
          }}
        >
          + Create Club
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search Input */}
      <TextField
        fullWidth
        placeholder="Search clubs by name or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3.5,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            '& fieldset': { borderColor: '#E9E7F2' },
            '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#9DA0AE' }} />
            </InputAdornment>
          ),
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BusinessOutlinedIcon />}
          title="No clubs found"
          message="Create the first club to get started."
          action={
            <Button
              variant="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/clubs/create')}
              sx={{ backgroundColor: '#4F2BCB' }}
            >
              Create Club
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {filtered.map((club) => {
            const members = clubMembers[club.id] || [];
            const stats = clubStats[club.id] || {};
            const president = members.find((m) => m.role === 'president');
            const secretary = members.find((m) => m.role === 'secretary');

            return (
              <Grid item xs={12} md={6} key={club.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '18px',
                    border: '1px solid #E9E7F2',
                    backgroundColor: '#FFFFFF',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(79, 43, 203, 0.08)',
                      borderColor: '#D4CCF7',
                    },
                  }}
                >
                  {/* Top Header: Logo + Name + Category + Action Icons */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={club.logo_url || ''}
                        variant="rounded"
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: '12px',
                          backgroundColor: '#F3F0FF',
                          color: '#4F2BCB',
                          fontWeight: 800,
                          fontSize: '1.3rem',
                          border: '1px solid #E2D9FF',
                        }}
                      >
                        {club.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.05rem', lineHeight: 1.2, mb: 0.5 }}>
                          {club.name}
                        </Typography>
                        <Box display="flex" gap={0.8} alignItems="center" flexWrap="wrap">
                          {club.category && (
                            <Chip
                              label={club.category}
                              size="small"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                backgroundColor: '#F3F0FF',
                                color: '#4F2BCB',
                                height: 20,
                              }}
                            />
                          )}
                          <Chip
                            label={club.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              backgroundColor: club.is_active ? '#D1FAE5' : '#FEE2E2',
                              color: club.is_active ? '#059669' : '#DC2626',
                              height: 20,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box display="flex" gap={0.5}>
                      <Tooltip title="View Club Public Details">
                        <IconButton size="small" onClick={() => navigate(`/clubs/${club.id}`)} sx={{ color: '#6E6D7A' }}>
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Core Info & Logo">
                        <IconButton size="small" onClick={() => navigate(`/clubs/${club.id}/edit`)} sx={{ color: '#4F2BCB' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Club">
                        <IconButton size="small" onClick={() => setDeleteModal({ open: true, club })} sx={{ color: '#EF4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#777788',
                      fontSize: '0.86rem',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {club.description || 'No description provided.'}
                  </Typography>

                  <Divider sx={{ borderColor: '#F3F0FF', mb: 2 }} />

                  {/* Club Leadership Info */}
                  <Box display="flex" flexDirection="column" gap={1.2} mb={2.5}>
                    {/* President Row */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: '#777788', fontWeight: 600, fontSize: '0.82rem' }}>
                        President:
                      </Typography>
                      {president ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A', fontSize: '0.88rem' }}>
                            {president.username}
                          </Typography>
                          <RoleChip role="president" />
                          <Tooltip title="Remove President">
                            <IconButton size="small" onClick={() => handleRemoveRole(club, 'president')} sx={{ color: '#EF4444', p: 0.2 }}>
                              <PersonRemoveIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Chip label="Unassigned" size="small" sx={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#FEF2F2', color: '#EF4444' }} />
                      )}
                    </Box>

                    {/* Secretary Row */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: '#777788', fontWeight: 600, fontSize: '0.82rem' }}>
                        Secretary:
                      </Typography>
                      {secretary ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A', fontSize: '0.88rem' }}>
                            {secretary.username}
                          </Typography>
                          <RoleChip role="secretary" />
                          <Tooltip title="Remove Secretary">
                            <IconButton size="small" onClick={() => handleRemoveRole(club, 'secretary')} sx={{ color: '#EF4444', p: 0.2 }}>
                              <PersonRemoveIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Chip label="Unassigned" size="small" sx={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#F3F0FF', color: '#777788' }} />
                      )}
                    </Box>

                    {/* Stats summary */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" pt={0.5}>
                      <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#777788', fontSize: '0.82rem' }}>
                        <GroupsIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                        <span><strong>{stats.member_count ?? members.length}</strong> members</span>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} sx={{ color: '#777788', fontSize: '0.82rem' }}>
                        <EventIcon sx={{ fontSize: 16, color: '#0EA5E9' }} />
                        <span><strong>{stats.event_count ?? 0}</strong> events</span>
                      </Box>
                    </Box>
                  </Box>

                  {/* Role Assignment Action Buttons */}
                  <Box mt="auto" display="flex" gap={1} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="ghost"
                      startIcon={<PersonAddIcon />}
                      onClick={() => openAssignModal(club, 'president')}
                      sx={{
                        fontSize: '0.8rem',
                        py: 0.6,
                        color: '#B45309',
                        borderColor: '#FEF3C7',
                        backgroundColor: '#FFFBEB',
                        '&:hover': { backgroundColor: '#FEF3C7' },
                      }}
                    >
                      {president ? 'Change President' : 'Assign President'}
                    </Button>
                    <Button
                      size="small"
                      variant="ghost"
                      startIcon={<PersonAddIcon />}
                      onClick={() => openAssignModal(club, 'secretary')}
                      sx={{
                        fontSize: '0.8rem',
                        py: 0.6,
                        color: '#4F2BCB',
                        borderColor: '#E9E7F2',
                        backgroundColor: '#F7F6FC',
                        '&:hover': { backgroundColor: '#F3F0FF' },
                      }}
                    >
                      {secretary ? 'Change Secretary' : 'Assign Secretary'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Assign Leadership Role Modal */}
      <Dialog
        open={assignModal.open}
        onClose={() => setAssignModal({ ...assignModal, open: false })}
        PaperProps={{ sx: { borderRadius: '18px', p: 1.5, minWidth: { xs: 320, sm: 440 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#20202A' }}>
          Assign {assignModal.role === 'president' ? 'Club President' : 'Club Secretary'}
          <Typography variant="body2" sx={{ color: '#777788', mt: 0.5, fontWeight: 500 }}>
            Target Club: <strong>{assignModal.club?.name}</strong>
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <Typography variant="body2" sx={{ color: '#6E6D7A', mb: 2.5, fontSize: '0.88rem' }}>
            Select any registered user on the platform. If the user is not currently in the club, they will be automatically enrolled as {assignModal.role}.
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="select-user-label">Select User</InputLabel>
            <Select
              labelId="select-user-label"
              value={selectedUserId}
              label="Select User"
              onChange={(e) => setSelectedUserId(e.target.value)}
              sx={{ borderRadius: '10px' }}
            >
              {users.length === 0 ? (
                <MenuItem disabled value="">
                  No users available
                </MenuItem>
              ) : (
                users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.username} ({u.email}) {u.is_superuser && ' — [Admin]'}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="ghost" onClick={() => setAssignModal({ ...assignModal, open: false })}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={actionLoading}
            sx={{ backgroundColor: '#4F2BCB' }}
          >
            {actionLoading ? 'Assigning...' : `Confirm & Assign ${assignModal.role === 'president' ? 'President' : 'Secretary'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Club Confirmation Dialog */}
      <Dialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, club: null })}
        PaperProps={{ sx: { borderRadius: '18px', p: 1.5, maxWidth: 440 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626' }}>
          Delete "{deleteModal.club?.name}"?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#6E6D7A', fontSize: '0.9rem' }}>
            Are you sure you want to permanently delete this club?
            <br /><br />
            This action will remove the club record along with all its events, announcements, and memberships. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, club: null })}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={handleDeleteClub}
            disabled={actionLoading}
            sx={{
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#DC2626' },
            }}
          >
            {actionLoading ? 'Deleting...' : 'Yes, Delete Club'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminClubs;
