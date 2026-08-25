import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContext';
import { fetchClubMembers } from '../../api/adminApi';
import RoleChip from '../../components/RoleChip';

const SecretaryMembers = () => {
  const { secretaryOfClubs, user: currentUser } = useAuth();
  const myClubId = secretaryOfClubs?.[0]?.club_id;
  const myClubName = secretaryOfClubs?.[0]?.club_name || 'My Club';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadMembers = async () => {
    if (!myClubId) return;
    try {
      setLoading(true);
      const data = await fetchClubMembers(myClubId);
      setMembers(data || []);
    } catch (err) {
      setError('Failed to load club members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [myClubId]);

  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && members.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 2 }}>
      <Box mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
          Club Members (Secretary)
        </Typography>
        <Typography variant="body2" sx={{ color: '#777788' }}>
          Club: <strong>{myClubName}</strong> — View roster and member profiles.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TextField
        fullWidth
        placeholder="Search members by username or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            '& fieldset': { borderColor: '#E9E7F2' },
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

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E9E7F2' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F7F6FC' }}>
              <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Role Badge</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.map((m) => (
              <TableRow key={m.user_id} sx={{ '&:hover': { backgroundColor: '#FAF9FF' } }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 36, height: 36, backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700, fontSize: '0.9rem' }}>
                      {m.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                      {m.username} {m.user_id === currentUser?.id && '(You)'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>
                  <RoleChip role={m.role} />
                </TableCell>
              </TableRow>
            ))}
            {filteredMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#9DA0AE' }}>
                    No members found matching the criteria.
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

export default SecretaryMembers;
