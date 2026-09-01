import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Chip,
  Stack,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ForumIcon from '@mui/icons-material/Forum';

import { useAuth } from '../../context/AuthContext';
import {
  fetchClubMembers,
  fetchClubRequests,
  approveClubRequest,
  rejectClubRequest,
  updateClubMemberRole,
  removeClubMember,
} from '../../api/adminApi';
import { getImageUrl } from '../../api/axiosInstance';
import RoleChip from '../../components/RoleChip';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const PresidentMembers = () => {
  const navigate = useNavigate();
  const { presidentOfClubs } = useAuth();
  const myClubId = presidentOfClubs?.[0]?.club_id;
  const myClubName = presidentOfClubs?.[0]?.club_name || 'My Club';

  const [tabIndex, setTabIndex] = useState(0);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Dropdown menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Role dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('member');
  const [submittingRole, setSubmittingRole] = useState(false);

  const loadData = async (silent = false) => {
    if (!myClubId) {
      setLoading(false);
      return;
    }
    try {
      if (!silent) setLoading(true);
      const [membersData, requestsData] = await Promise.all([
        fetchClubMembers(myClubId),
        fetchClubRequests(myClubId),
      ]);
      setMembers(membersData || []);
      setRequests(requestsData || []);
    } catch (err) {
      if (!silent) setError('Failed to load member and request data.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData(true);
    }, 6000);
    return () => clearInterval(timer);
  }, [myClubId]);

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError('');
      await approveClubRequest(myClubId, requestId);
      setSuccess('Join request approved successfully! User is now an active member.');
      await loadData(true);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to approve request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError('');
      await rejectClubRequest(myClubId, requestId);
      setSuccess('Join request has been rejected.');
      await loadData(true);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to reject request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember || !newRole) return;
    setSubmittingRole(true);
    setError('');
    try {
      await updateClubMemberRole(myClubId, selectedMember.user_id, newRole);
      setSuccess(`Updated role for ${selectedMember.username} to ${newRole.toUpperCase()}.`);
      setRoleDialogOpen(false);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update member role.');
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleRemoveMemberClick = async (member) => {
    if (!member) return;
    if (member.user_id === Number(localStorage.getItem('user_id'))) {
      alert('You cannot remove yourself from the club roster.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${member.username} from this club?`))
      return;
    setError('');
    try {
      await removeClubMember(myClubId, member.user_id);
      setSuccess(`Successfully removed ${member.username} from the club.`);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to remove member.');
    }
  };

  const handleOpenMenu = (event, member) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const exportCSV = () => {
    if (members.length === 0) {
      alert('No members to export.');
      return;
    }
    const headers = ['User ID', 'Username', 'Email', 'Role', 'Department'];
    const rows = members.map((m) => [
      m.user_id,
      m.username || '',
      m.email || '',
      m.role || 'member',
      m.department || '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${myClubName}_members.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  const filteredMembers = members.filter(
    (m) =>
      m.username?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = requests.filter(
    (r) =>
      (r.username && r.username.toLowerCase().includes(search.toLowerCase())) ||
      (r.user_email && r.user_email.toLowerCase().includes(search.toLowerCase()))
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
      {/* Top Header */}
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
            Member Directory & Requests
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Club: <strong>{myClubName}</strong> — Manage member roster and review applicant join requests.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="primary"
            startIcon={<ForumIcon />}
            onClick={() => navigate(`/clubs/${myClubId}/chat`)}
            sx={{ px: 2.2 }}
          >
            Officer Chat
          </Button>
          <Button
            variant="ghost"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={exportCSV}
          >
            Export CSV
          </Button>
        </Stack>
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

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #E9E7F2', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: '#8E90A2',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              '&.Mui-selected': { color: '#4F2BCB' },
            },
            '& .MuiTabs-indicator': { backgroundColor: '#4F2BCB', height: 3, borderRadius: '3px' },
          }}
        >
          <Tab
            icon={<PeopleAltOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={`Active Members (${members.length})`}
          />
          <Tab
            icon={
              <Badge
                badgeContent={pendingRequestsCount}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.68rem', height: 18, minWidth: 18 } }}
              >
                <HowToRegOutlinedIcon fontSize="small" />
              </Badge>
            }
            iconPosition="start"
            label={`Join Requests (${pendingRequestsCount})`}
          />
        </Tabs>
      </Box>

      {/* Search Input */}
      <TextField
        fullWidth
        placeholder={
          tabIndex === 0
            ? 'Search active members by name or email...'
            : 'Search join requests by applicant name or email...'
        }
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

      {/* Tab 0: Active Members Table */}
      {tabIndex === 0 && (
        <>
          {filteredMembers.length === 0 ? (
            <EmptyState icon={<PeopleAltOutlinedIcon />} title="No members found" />
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
                    <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Member Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Email Address</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Club Role</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Department</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow
                      key={member.user_id}
                      sx={{
                        '&:hover': { backgroundColor: '#FAF9FF' },
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" gap={1.8}>
                          <Avatar
                            src={getImageUrl(member.avatar_url)}
                            sx={{
                              width: 38,
                              height: 38,
                              backgroundColor: '#EDE9FE',
                              color: '#4F2BCB',
                              fontWeight: 900,
                              fontSize: '0.95rem',
                            }}
                          >
                            {(member.username || 'M').charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color: '#20202A',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {member.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 500 }}>
                          {member.email || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <RoleChip role={member.role || 'member'} />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                          {member.department || 'General'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, member)}
                          sx={{ color: '#5E5D6E' }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Tab 1: Join Requests Table */}
      {tabIndex === 1 && (
        <>
          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={<HowToRegOutlinedIcon />}
              title="No pending join requests"
              message="Prospective club applicants will appear here for review."
            />
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
                    <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Applicant</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Email Address</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Request Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Applied Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#20202A', py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id} sx={{ '&:hover': { backgroundColor: '#FAF9FF' } }}>
                      <TableCell sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" gap={1.8}>
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              backgroundColor: '#EDE9FE',
                              color: '#4F2BCB',
                              fontWeight: 900,
                            }}
                          >
                            {(req.username || req.user_email || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color: '#20202A',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {req.username || `User #${req.user_id}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 500 }}>
                          {req.user_email || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={req.status}
                          size="small"
                          sx={{
                            backgroundColor:
                              req.status === 'APPROVED'
                                ? '#D1FAE5'
                                : req.status === 'REJECTED'
                                ? '#FEE2E2'
                                : '#FEF3C7',
                            color:
                              req.status === 'APPROVED'
                                ? '#059669'
                                : req.status === 'REJECTED'
                                ? '#DC2626'
                                : '#B45309',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 600 }}>
                          {req.created_at
                            ? new Date(req.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2 }}>
                        {req.status === 'PENDING' ? (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="primary"
                              size="small"
                              startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                              onClick={() => handleApprove(req.id)}
                              loading={actionLoading === req.id}
                              sx={{ py: 0.6, px: 1.5, fontSize: '0.76rem' }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="small"
                              startIcon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
                              onClick={() => handleReject(req.id)}
                              loading={actionLoading === req.id}
                              sx={{ py: 0.6, px: 1.5, fontSize: '0.76rem' }}
                            >
                              Reject
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#8E90A2' }}>
                            Decided
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Dropdown Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}
      >
        <MenuItem
          onClick={() => {
            if (selectedMember) {
              setNewRole(selectedMember.role || 'member');
              setRoleDialogOpen(true);
            }
            handleCloseMenu();
          }}
        >
          Change Member Role
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/clubs/${myClubId}/chat`);
            handleCloseMenu();
          }}
        >
          Send Officer Message
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleRemoveMemberClick(selectedMember);
            handleCloseMenu();
          }}
          sx={{ color: '#EF4444' }}
        >
          Remove from Club
        </MenuItem>
      </Menu>

      {/* Role Change Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle
          sx={{ fontWeight: 900, color: '#20202A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Update Member Role
        </DialogTitle>
        <DialogContent dividers>
          <Box pt={1}>
            <TextField
              select
              fullWidth
              label="Select Club Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="event_manager">🎯 Event Manager (Manage Club Events & Tasks)</MenuItem>
              <MenuItem value="vice_president">Vice President</MenuItem>
              <MenuItem value="treasurer">Treasurer</MenuItem>
              <MenuItem value="secretary">Secretary</MenuItem>
              <MenuItem value="president">President</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setRoleDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateRole} loading={submittingRole}>
            Save Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PresidentMembers;
