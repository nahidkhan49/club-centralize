import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Tooltip, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { fetchAllUsers, promoteUser, fetchAllClubs, deleteUser } from '../../api/adminApi';
import api from '../../api/axiosInstance';
import RoleChip from '../../components/RoleChip';
import EmptyState from '../../components/EmptyState';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [usersData, clubsData] = await Promise.all([fetchAllUsers(), fetchAllClubs()]);
      const validUsers = Array.isArray(usersData) ? usersData : [];
      const validClubs = Array.isArray(clubsData) ? clubsData : [];
      setUsers(validUsers);
      setClubs(validClubs);
      // Load all memberships for role display
      const allMemberships = [];
      await Promise.all(
        validClubs.map(async (c) => {
          try {
            const res = await api.get(`/clubs/${c.id}/members`);
            const memList = Array.isArray(res?.data) ? res.data : [];
            memList.forEach((m) => allMemberships.push({ ...m, club_name: c.name }));
          } catch {}
        })
      );
      setMemberships(allMemberships);
    } catch (e) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getUserRole = (userId, isAdmin) => {
    if (isAdmin) return 'admin';
    const userMemberships = memberships.filter((m) => m.user_id === userId);
    if (userMemberships.some((m) => m.role === 'president')) return 'president';
    if (userMemberships.some((m) => m.role === 'secretary')) return 'secretary';
    if (userMemberships.some((m) => m.role === 'vice_president')) return 'vice_president';
    return 'member';
  };

  const getUserClubs = (userId) => {
    return memberships.filter((m) => m.user_id === userId).map((m) => `${m.club_name} (${m.role})`);
  };

  const handlePromote = async (userId) => {
    try {
      const res = await promoteUser(userId);
      setSuccess(`${res.message}`);
      load();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to change admin status');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action is permanent and will remove their profile and all active memberships.`)) {
      return;
    }
    try {
      await deleteUser(userId);
      setSuccess(`User "${username}" was successfully deleted.`);
      load();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to delete user');
    }
  };

  const currentUserId = Number(localStorage.getItem('user_id'));

  const filtered = (Array.isArray(users) ? users : []).filter((u) =>
    (u?.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress sx={{ color: '#4F2BCB' }} /></Box>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>User Management</Typography>
        <Typography variant="body2" sx={{ color: '#777788' }}>{users.length} registered users</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TextField
        fullWidth
        placeholder="Search users by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#FFFFFF', '& fieldset': { borderColor: '#E9E7F2' } } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9DA0AE' }} /></InputAdornment> }}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={<PersonOutlinedIcon />} title="No users found" />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E9E7F2' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F7F6FC' }}>
                <TableCell sx={{ fontWeight: 700, color: '#20202A', borderBottom: '1px solid #E9E7F2' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#20202A', borderBottom: '1px solid #E9E7F2' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#20202A', borderBottom: '1px solid #E9E7F2' }}>System Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#20202A', borderBottom: '1px solid #E9E7F2' }}>Clubs</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#20202A', borderBottom: '1px solid #E9E7F2' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => {
                const role = getUserRole(u.id, u.is_superuser);
                const userClubs = getUserClubs(u.id);
                return (
                  <TableRow key={u.id} sx={{ '&:hover': { backgroundColor: '#FAF9FF' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 36, height: 36, backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700, fontSize: '0.9rem' }}>
                          {u.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>{u.username}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#6E6D7A' }}>{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <RoleChip role={role} />
                    </TableCell>
                    <TableCell>
                      {userClubs.length === 0 ? (
                        <Typography variant="body2" sx={{ color: '#9DA0AE', fontSize: '0.8rem' }}>No clubs</Typography>
                      ) : (
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {userClubs.slice(0, 2).map((c, i) => (
                            <Chip key={i} label={c} size="small" sx={{ fontSize: '0.65rem', backgroundColor: '#F3F0FF', color: '#4F2BCB', height: 20 }} />
                          ))}
                          {userClubs.length > 2 && <Chip label={`+${userClubs.length - 2}`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={u.is_superuser ? 'Revoke Admin' : 'Make Admin'}>
                        <IconButton
                          size="small"
                          onClick={() => handlePromote(u.id)}
                          sx={{ color: u.is_superuser ? '#DC2626' : '#4F2BCB' }}
                        >
                          <AdminPanelSettingsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {u.id !== currentUserId && (
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            sx={{ color: '#EF4444', ml: 1 }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminUsers;
