import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  DialogContentText,
  Stack,
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
  fetchAllClubs,
  fetchClubMembers,
  assignClubRole,
  removeClubRole,
  deleteClub,
  fetchAllUsers,
  fetchClubStats,
} from '../../api/adminApi';
import { getClubLogoUrl } from '../../api/axiosInstance';
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
              fetchClubStats(c.id).catch(() => ({ member_count: 0, event_count: 0 })),
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

  useEffect(() => {
    loadData();
  }, []);

  const openAssignModal = (club, role) => {
    setAssignModal({ open: true, club, role });
    setSelectedUserId('');
    setError('');
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }
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
    if (!window.confirm(`Are you sure you want to remove the current ${role} of ${club.name}?`))
      return;
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

  const filtered = (Array.isArray(clubs) ? clubs : []).filter(
    (c) =>
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
            Club Management (Admin)
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Centralized control center to create, update, assign leadership, and manage all university clubs.
          </Typography>
        </Box>
        <Button
          variant="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clubs/create')}
          sx={{ px: 2.8 }}
        >
          + Create Club
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search Input */}
      <TextField
        fullWidth
        placeholder="Search clubs by name, keywords, or category..."
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
        <EmptyState
          icon={<BusinessOutlinedIcon />}
          title="No clubs found"
          message="Create the first club to get started."
          action={
            <Button
              variant="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/clubs/create')}
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
                    borderRadius: '22px',
                    border: '1px solid #E9E7F2',
                    backgroundColor: '#FFFFFF',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                    transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
                    '&:hover': {
                      boxShadow: '0 10px 28px rgba(79, 43, 203, 0.08)',
                      borderColor: '#D4CCF7',
                    },
                  }}
                >
                  {/* Top Bar: Logo, Name, Actions */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.8}>
                      <Avatar
                        src={getClubLogoUrl(club)}
                        variant="rounded"
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: '14px',
                          backgroundColor: '#F3F0FF',
                          color: '#4F2BCB',
                          fontWeight: 900,
                          fontSize: '1.25rem',
                          border: '1.5px solid #E0DBFF',
                        }}
                      >
                        {club.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 900,
                            color: '#20202A',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '1.05rem',
                          }}
                        >
                          {club.name}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={0.3}>
                          {club.category && (
                            <Chip
                              label={club.category}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                backgroundColor: '#F3F0FF',
                                color: '#4F2BCB',
                                borderRadius: '6px',
                              }}
                            />
                          )}
                          {club.department && (
                            <Chip
                              label={`${club.department} Dept`}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                borderRadius: '6px',
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Public Page">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/clubs/${club.id}`)}
                          sx={{ color: '#4F2BCB' }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Club">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/clubs/${club.id}/edit`)}
                          sx={{ color: '#5E5D6E' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Club">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteModal({ open: true, club })}
                          sx={{ color: '#EF4444' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* Club Stats Counters */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      backgroundColor: '#F8F7FD',
                      display: 'flex',
                      gap: 2,
                      mb: 2.5,
                      border: '1px solid #F1EFF8',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={0.8} sx={{ flex: 1 }}>
                      <GroupsIcon sx={{ color: '#4F2BCB', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 700 }}>
                        <strong>{stats.member_count ?? members.length}</strong> Members
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: '#E9E7F2' }} />
                    <Box display="flex" alignItems="center" gap={0.8} sx={{ flex: 1 }}>
                      <EventIcon sx={{ color: '#059669', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 700 }}>
                        <strong>{stats.event_count ?? 0}</strong> Events
                      </Typography>
                    </Box>
                  </Box>

                  {/* Leadership Assignments */}
                  <Box sx={{ mt: 'auto' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: '#8E90A2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontSize: '0.68rem',
                        display: 'block',
                        mb: 1.2,
                      }}
                    >
                      Club Leadership Roster
                    </Typography>

                    <Stack spacing={1.2}>
                      {/* President Slot */}
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '12px',
                          border: '1px solid #F1EFF8',
                          backgroundColor: president ? '#FFFFFF' : '#FAFAFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <RoleChip role="president" />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: president ? '#20202A' : '#8E90A2',
                              fontSize: '0.85rem',
                            }}
                          >
                            {president ? president.username : 'No President Assigned'}
                          </Typography>
                        </Box>
                        {president ? (
                          <Tooltip title="Remove President">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveRole(club, 'president')}
                              sx={{ color: '#EF4444' }}
                            >
                              <PersonRemoveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="subtle"
                            size="small"
                            onClick={() => openAssignModal(club, 'president')}
                            startIcon={<PersonAddIcon sx={{ fontSize: 14 }} />}
                            sx={{ py: 0.4, px: 1.2, fontSize: '0.74rem' }}
                          >
                            Assign
                          </Button>
                        )}
                      </Box>

                      {/* Secretary Slot */}
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '12px',
                          border: '1px solid #F1EFF8',
                          backgroundColor: secretary ? '#FFFFFF' : '#FAFAFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <RoleChip role="secretary" />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: secretary ? '#20202A' : '#8E90A2',
                              fontSize: '0.85rem',
                            }}
                          >
                            {secretary ? secretary.username : 'No Secretary Assigned'}
                          </Typography>
                        </Box>
                        {secretary ? (
                          <Tooltip title="Remove Secretary">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveRole(club, 'secretary')}
                              sx={{ color: '#EF4444' }}
                            >
                              <PersonRemoveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="subtle"
                            size="small"
                            onClick={() => openAssignModal(club, 'secretary')}
                            startIcon={<PersonAddIcon sx={{ fontSize: 14 }} />}
                            sx={{ py: 0.4, px: 1.2, fontSize: '0.74rem' }}
                          >
                            Assign
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Assign Role Dialog */}
      <Dialog
        open={assignModal.open}
        onClose={() => setAssignModal({ open: false, club: null, role: 'president' })}
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
          Assign {assignModal.role === 'president' ? 'President' : 'Secretary'} for {assignModal.club?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Box pt={1}>
            <TextField
              select
              fullWidth
              label="Select User Account"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              helperText="Choose a registered student account to assign this leadership role."
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.username} {u.email ? `(${u.email})` : ''}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            variant="ghost"
            onClick={() => setAssignModal({ open: false, club: null, role: 'president' })}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign} loading={actionLoading}>
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Club Dialog */}
      <Dialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, club: null })}
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#20202A' }}>Delete Club Organization?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#5E5D6E' }}>
            Are you sure you want to permanently delete <strong>{deleteModal.club?.name}</strong>?
            This will delete all associated events, announcements, and memberships.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setDeleteModal({ open: false, club: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteClub} loading={actionLoading}>
            Delete Organization
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminClubs;
