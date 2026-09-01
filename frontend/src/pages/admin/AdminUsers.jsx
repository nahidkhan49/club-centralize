import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
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

  useEffect(() => {
    load();
  }, []);

  const getUserRole = (userId, isAdmin) => {
    if (isAdmin) return 'admin';
    const userMemberships = memberships.filter((m) => m.user_id === userId);
    if (userMemberships.some((m) => m.role === 'president')) return 'president';
    if (userMemberships.some((m) => m.role === 'secretary')) return 'secretary';
    if (userMemberships.some((m) => m.role === 'vice_president')) return 'vice_president';
    return 'member';
  };

  const getUserClubs = (userId) => {
    return memberships
      .filter((m) => m.user_id === userId)
      .map((m) => `${m.club_name} (${m.role})`);
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
    if (
      !window.confirm(
        `Are you sure you want to delete user "${username}"? This action is permanent and will remove their profile, messages, memberships, and related records.`
      )
    ) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await deleteUser(userId);
      setSuccess(`User "${username}" was successfully deleted.`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to delete user');
    }
  };

  const currentUserId = Number(localStorage.getItem('user_id'));

  const filtered = (Array.isArray(users) ? users : []).filter(
    (u) =>
      (u?.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (u?.email || '').toLowerCase().includes(search.toLowerCase())
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
      <Box mb={3.5}>
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
          User Accounts & Permissions
        </Typography>
        <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
          {users.length} registered campus student & administrator accounts.
        </Typography>
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

      <TextField
        fullWidth
        placeholder="Search users by name, username, or email address..."
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
        <EmptyState icon={<PersonOutlinedIcon />} title="No users found" />
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
                <TableCell sx={{ fontWeight: 800, color: '#20202A', borderBottom: '1px solid #E9E7F2', py: 2 }}>
                  User Account
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#20202A', borderBottom: '1px solid #E9E7F2', py: 2 }}>
                  Email Address
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#20202A', borderBottom: '1px solid #E9E7F2', py: 2 }}>
                  System Role
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#20202A', borderBottom: '1px solid #E9E7F2', py: 2 }}>
                  Club Affiliations
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#20202A', borderBottom: '1px solid #E9E7F2', py: 2 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => {
                const role = getUserRole(u.id, u.is_superuser);
                const userClubs = getUserClubs(u.id);
                return (
                  <TableRow
                    key={u.id}
                    sx={{
                      '&:hover': { backgroundColor: '#FAF9FF' },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center" gap={1.8}>
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            backgroundColor: '#F3F0FF',
                            color: '#4F2BCB',
                            fontWeight: 900,
                            fontSize: '0.95rem',
                          }}
                        >
                          {u.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color: '#20202A',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {u.username}
                          </Typography>
                          {u.full_name && (
                            <Typography variant="caption" sx={{ color: '#8E90A2' }}>
                              {u.full_name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 500 }}>
                        {u.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <RoleChip role={role} />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {userClubs.length === 0 ? (
                        <Typography variant="caption" sx={{ color: '#8E90A2' }}>
                          No club memberships
                        </Typography>
                      ) : (
                        <Box display="flex" gap={0.8} flexWrap="wrap">
                          {userClubs.slice(0, 2).map((c, i) => (
                            <Chip
                              key={i}
                              label={c}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: '#F3F0FF',
                                color: '#4F2BCB',
                                borderRadius: '6px',
                              }}
                            />
                          ))}
                          {userClubs.length > 2 && (
                            <Chip
                              label={`+${userClubs.length - 2} more`}
                              size="small"
                              sx={{ fontSize: '0.7rem', borderRadius: '6px' }}
                            />
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Tooltip title={u.is_superuser ? 'Revoke Admin Privileges' : 'Make Administrator'}>
                        <IconButton
                          size="small"
                          onClick={() => handlePromote(u.id)}
                          sx={{
                            color: u.is_superuser ? '#DC2626' : '#4F2BCB',
                            backgroundColor: u.is_superuser ? '#FEF2F2' : '#F3F0FF',
                            borderRadius: '8px',
                            mr: 1,
                          }}
                        >
                          <AdminPanelSettingsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {u.id !== currentUserId && (
                        <Tooltip title="Delete User Account">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            sx={{
                              color: '#EF4444',
                              backgroundColor: '#FEF2F2',
                              borderRadius: '8px',
                            }}
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
