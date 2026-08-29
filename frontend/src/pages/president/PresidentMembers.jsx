import React, { useEffect, useState } from 'react';
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
  Checkbox,
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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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

const ROLE_COLOR_MAP = {
  president: { bg: '#FEF3C7', color: '#B45309' },
  vice_president: { bg: '#EEF2FF', color: '#4F2BCB' },
  secretary: { bg: '#F3F0FF', color: '#7C3AED' },
  treasurer: { bg: '#E6F4EA', color: '#15803D' },
  member: { bg: '#F1F5F9', color: '#475569' },
};

const PresidentMembers = () => {
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
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Options dropdown menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Role dialog & submission states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('member');
  const [submittingRole, setSubmittingRole] = useState(false);

  const loadData = async () => {
    if (!myClubId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [membersData, requestsData] = await Promise.all([
        fetchClubMembers(myClubId),
        fetchClubRequests(myClubId),
      ]);
      setMembers(membersData || []);
      setRequests(requestsData || []);
    } catch (err) {
      setError('Failed to load member and request data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [myClubId]);

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError('');
      await approveClubRequest(myClubId, requestId);
      setSuccess('Join request approved successfully! User is now an active member.');
      await loadData();
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
      await loadData();
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
      alert("You cannot remove yourself from the club roster.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${member.username} from this club?`)) return;
    setError('');
    try {
      await removeClubMember(myClubId, member.user_id);
      setSuccess(`Successfully removed ${member.username} from the club.`);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to remove member.');
    }
  };


  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(members.map((m) => m.user_id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleOpenMenu = (event, member) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedMember(null);
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
    <Box sx={{ maxWidth: 1150, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Top Header & Tabs */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
            Member Roster
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788' }}>
            Club: <strong>{myClubName}</strong> — View roster and review prospective member join requests.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            onClick={() => alert('Invite member link copied to clipboard!')}
            sx={{ backgroundColor: '#4F2BCB' }}
          >
            Add Member
          </Button>
          <Button
            variant="ghost"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={() => alert('Exporting member roster to CSV...')}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7' }}
          >
            Export
          </Button>
          <Button
            variant="ghost"
            startIcon={<EmailOutlinedIcon />}
            onClick={() => alert('Opening bulk email broadcast composer...')}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7' }}
          >
            Send Message
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Tabs for Active Members vs Pending Requests */}
      <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E9E7F2', mb: 3, backgroundColor: '#FFFFFF' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#777788',
              '&.Mui-selected': { color: '#4F2BCB' },
            },
            '& .MuiTabs-indicator': { backgroundColor: '#4F2BCB', height: 3 },
          }}
        >
          <Tab
            icon={<PeopleAltOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={`Active Members (${members.length})`}
          />
          <Tab
            icon={
              <Badge badgeContent={pendingRequestsCount} color="warning">
                <HowToRegOutlinedIcon fontSize="small" />
              </Badge>
            }
            iconPosition="start"
            label={`Join Requests (${requests.length})`}
          />
        </Tabs>
      </Paper>

      {/* Search Input Bar */}
      <Box mb={3}>
        <TextField
          placeholder="Search by name, role, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
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
      </Box>

      {/* Tab 0: Active Members Table (Matching Mockup Quadrant 4) */}
      {tabIndex === 0 && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '20px',
            border: '1px solid #E9E7F2',
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#FBFBFE' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={members.length > 0 && selectedUsers.length === members.length}
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < members.length}
                    onChange={handleSelectAll}
                    sx={{ color: '#C4C4D4', '&.Mui-checked': { color: '#4F2BCB' } }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#444455', fontSize: '0.85rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#444455', fontSize: '0.85rem' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#444455', fontSize: '0.85rem' }}>Email / Contact</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#444455', fontSize: '0.85rem' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#444455', fontSize: '0.85rem' }}>Options</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#9DA0AE' }}>
                    No members found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => {
                  const isSelected = selectedUsers.includes(member.user_id);
                  const roleConfig = ROLE_COLOR_MAP[member.role] || ROLE_COLOR_MAP.member;

                  return (
                    <TableRow
                      key={member.user_id}
                      hover
                      selected={isSelected}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectOne(member.user_id)}
                          sx={{ color: '#C4C4D4', '&.Mui-checked': { color: '#4F2BCB' } }}
                        />
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            src={getImageUrl(member.avatar_url)}
                            sx={{
                              width: 38,
                              height: 38,
                              backgroundColor: '#EAE6FD',
                              color: '#4F2BCB',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                            }}
                          >
                            {member.username?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A' }}>
                              {member.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={member.role.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: roleConfig.bg,
                            color: roleConfig.color,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '8px',
                            height: 24,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6E6D7A' }}>
                          {member.email}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label="Open"
                          size="small"
                          sx={{
                            backgroundColor: '#D1FAE5',
                            color: '#059669',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '8px',
                            height: 24,
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          variant="ghost"
                          size="small"
                          endIcon={<KeyboardArrowDownIcon />}
                          onClick={(e) => handleOpenMenu(e, member)}
                          sx={{ color: '#4F2BCB', borderColor: '#E9E7F2', fontSize: '0.78rem', py: 0.4 }}
                        >
                          Options
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 1: Membership Join Requests Review Table */}
      {tabIndex === 1 && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '20px',
            border: '1px solid #E9E7F2',
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#FBFBFE' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#444455' }}>Applicant</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#444455' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#444455' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#444455' }}>Requested At</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#444455' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#9DA0AE' }}>
                    No membership requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';

                  return (
                    <TableRow key={req.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            src={getImageUrl(req.avatar_url)}
                            sx={{
                              width: 38,
                              height: 38,
                              backgroundColor: '#F3F0FF',
                              color: '#4F2BCB',
                              fontWeight: 800,
                            }}
                          >
                            {req.username?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A' }}>
                            {req.username}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6E6D7A' }}>
                          {req.user_email}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={req.status}
                          size="small"
                          sx={{
                            backgroundColor: isPending ? '#FEF3C7' : isApproved ? '#D1FAE5' : '#FEE2E2',
                            color: isPending ? '#B45309' : isApproved ? '#059669' : '#DC2626',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '8px',
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#777788' }}>
                          {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Recent'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {isPending ? (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="primary"
                              size="small"
                              startIcon={<CheckCircleOutlineIcon />}
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoading === req.id}
                              sx={{ backgroundColor: '#059669', fontSize: '0.78rem', py: 0.5 }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="small"
                              startIcon={<HighlightOffIcon />}
                              onClick={() => handleReject(req.id)}
                              disabled={actionLoading === req.id}
                              sx={{ color: '#DC2626', borderColor: '#FECACA', fontSize: '0.78rem', py: 0.5 }}
                            >
                              Reject
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#9DA0AE', fontStyle: 'italic' }}>
                            Reviewed
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Options Dropdown Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: '12px', minWidth: 160, mt: 1 },
        }}
      >
        <MenuItem onClick={() => {
          if (selectedMember?.email) {
            window.location.href = `mailto:${selectedMember.email}`;
          }
          handleCloseMenu();
        }}>
          Send Email
        </MenuItem>
        <MenuItem onClick={() => {
          setNewRole(selectedMember?.role || 'member');
          setRoleDialogOpen(true);
          setMenuAnchor(null);
        }} sx={{ color: '#4F2BCB' }}>
          Change Role
        </MenuItem>
        <MenuItem onClick={() => {
          handleRemoveMemberClick(selectedMember);
          handleCloseMenu();
        }} sx={{ color: '#EF4444' }}>
          Remove from Club
        </MenuItem>
      </Menu>

      {/* Change Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#20202A' }}>
          Change Role: {selectedMember?.username}
        </DialogTitle>
        <DialogContent dividers>
          <Box pt={1}>
            <TextField
              select
              label="Select Member Role"
              fullWidth
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              helperText="Assign a new role to this member. Note: Assigning President will transfer your President status."
            >
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="vice_president">Vice President</MenuItem>
              <MenuItem value="secretary">Secretary</MenuItem>
              <MenuItem value="treasurer">Treasurer</MenuItem>
              <MenuItem value="president">President</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="ghost" onClick={() => setRoleDialogOpen(false)} disabled={submittingRole}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateRole}
            disabled={submittingRole}
            sx={{ backgroundColor: '#4F2BCB' }}
          >
            {submittingRole ? 'Saving...' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PresidentMembers;
