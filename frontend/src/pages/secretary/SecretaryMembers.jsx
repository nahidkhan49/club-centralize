import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, TextField,
  InputAdornment, Tabs, Tab, Badge, Chip, Stack, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import { useAuth } from '../../context/AuthContext';
import {
  fetchClubMembers,
  fetchClubRequests,
  approveClubRequest,
  rejectClubRequest
} from '../../api/adminApi';
import RoleChip from '../../components/RoleChip';
import Button from '../../components/Button';

const SecretaryMembers = () => {
  const { secretaryOfClubs, user: currentUser } = useAuth();
  const myClubId = secretaryOfClubs?.[0]?.club_id;
  const myClubName = secretaryOfClubs?.[0]?.club_name || 'My Club';

  const [tabIndex, setTabIndex] = useState(0);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    if (!myClubId) return;
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

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      (r.username && r.username.toLowerCase().includes(search.toLowerCase())) ||
      (r.user_email && r.user_email.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && members.length === 0 && requests.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 2 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
          Club Member Management (Secretary)
        </Typography>
        <Typography variant="body2" sx={{ color: '#777788' }}>
          Club: <strong>{myClubName}</strong> — Manage active member roster and review pending join requests.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#E9E7F2', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => {
            setTabIndex(val);
            setSearch('');
          }}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
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
              <Badge badgeContent={pendingRequestsCount} color="error" sx={{ '& .MuiBadge-badge': { right: -6, top: 4 } }}>
                <HowToRegOutlinedIcon fontSize="small" />
              </Badge>
            }
            iconPosition="start"
            label={`Join Requests (${requests.length})`}
          />
        </Tabs>
      </Box>

      {/* Tab 0: Active Members */}
      {tabIndex === 0 && (
        <Box>
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

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E9E7F2', overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: { xs: 500, sm: '100%' } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F7F6FC' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Club Role</TableCell>
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
                        No active members found matching the criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab 1: Join Requests */}
      {tabIndex === 1 && (
        <Box>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <TextField
              placeholder="Search join requests by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                flex: 1,
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

            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: { xs: 1, sm: 0 }, maxWidth: '100%' }}>
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                <Chip
                  key={status}
                  label={status === 'ALL' ? 'All Requests' : status.charAt(0) + status.slice(1).toLowerCase()}
                  onClick={() => setStatusFilter(status)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    backgroundColor: statusFilter === status ? '#4F2BCB' : '#FFFFFF',
                    color: statusFilter === status ? '#FFFFFF' : '#555565',
                    border: '1px solid',
                    borderColor: statusFilter === status ? '#4F2BCB' : '#E9E7F2',
                    '&:hover': {
                      backgroundColor: statusFilter === status ? '#39209A' : '#F3F0FF',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E9E7F2', overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: { xs: 650, sm: '100%' } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F7F6FC' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Applicant</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Requested On</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#20202A' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#20202A', textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';
                  const isProcessing = actionLoading === req.id;

                  return (
                    <TableRow key={req.id} sx={{ '&:hover': { backgroundColor: '#FAF9FF' } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 36, height: 36, backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700, fontSize: '0.9rem' }}>
                            {req.username ? req.username.charAt(0).toUpperCase() : '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                              {req.username} {req.user_id === currentUser?.id && '(You)'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{req.user_email || '—'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#555565' }}>
                          {new Date(req.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isPending && (
                          <Chip
                            icon={<HourglassEmptyIcon style={{ fontSize: 16, color: '#B45309' }} />}
                            label="Pending"
                            size="small"
                            sx={{ backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 700 }}
                          />
                        )}
                        {isApproved && (
                          <Tooltip title={req.reviewed_by_username ? `Approved by ${req.reviewed_by_username}` : ''}>
                            <Chip
                              icon={<CheckCircleOutlineIcon style={{ fontSize: 16, color: '#059669' }} />}
                              label="Approved"
                              size="small"
                              sx={{ backgroundColor: '#D1FAE5', color: '#059669', fontWeight: 700 }}
                            />
                          </Tooltip>
                        )}
                        {isRejected && (
                          <Tooltip title={req.reviewed_by_username ? `Declined by ${req.reviewed_by_username}` : ''}>
                            <Chip
                              icon={<HighlightOffIcon style={{ fontSize: 16, color: '#DC2626' }} />}
                              label="Rejected"
                              size="small"
                              sx={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontWeight: 700 }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {isPending && (
                            <>
                              <Button
                                variant="primary"
                                size="small"
                                disabled={isProcessing}
                                onClick={() => handleApprove(req.id)}
                                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  backgroundColor: '#059669',
                                  fontSize: '0.8rem',
                                  px: 1.8,
                                  py: 0.5,
                                  '&:hover': { backgroundColor: '#047857' },
                                }}
                              >
                                {isProcessing ? 'Saving...' : 'Approve'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="small"
                                disabled={isProcessing}
                                onClick={() => handleReject(req.id)}
                                startIcon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  color: '#DC2626',
                                  borderColor: '#FECACA',
                                  fontSize: '0.8rem',
                                  px: 1.8,
                                  py: 0.5,
                                  '&:hover': { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {isRejected && (
                            <Button
                              variant="ghost"
                              size="small"
                              disabled={isProcessing}
                              onClick={() => handleApprove(req.id)}
                              sx={{ color: '#059669', borderColor: '#A7F3D0', fontSize: '0.8rem' }}
                            >
                              Approve
                            </Button>
                          )}
                          {isApproved && (
                            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                              Active Member
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <HowToRegOutlinedIcon sx={{ fontSize: 36, color: '#9DA0AE', mb: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A' }}>
                        No membership requests found
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9DA0AE' }}>
                        {statusFilter === 'ALL'
                          ? 'There are no join requests for this club yet.'
                          : `No requests with status '${statusFilter}'.`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default SecretaryMembers;
