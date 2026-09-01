import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddTaskIcon from '@mui/icons-material/AddTask';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlagIcon from '@mui/icons-material/Flag';
import SearchIcon from '@mui/icons-material/Search';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';

import { useAuth } from '../context/AuthContext';
import {
  getEvent,
  fetchEventParticipants,
  fetchEventTasks,
  createEventTask,
  updateEventTask,
  deleteEventTask,
} from '../api/eventApi';
import api, { getImageUrl } from '../api/axiosInstance';
import Button from '../components/Button';
import RoleChip from '../components/RoleChip';
import EmptyState from '../components/EmptyState';

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#B45309',
    bg: '#FEF3C7',
    icon: <HourglassEmptyIcon sx={{ fontSize: 13 }} />,
  },
  in_progress: {
    label: 'In Progress',
    color: '#1D4ED8',
    bg: '#DBEAFE',
    icon: <PlayArrowIcon sx={{ fontSize: 13 }} />,
  },
  completed: {
    label: 'Completed',
    color: '#059669',
    bg: '#D1FAE5',
    icon: <CheckCircleOutlinedIcon sx={{ fontSize: 13 }} />,
  },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2', icon: null },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#475569', bg: '#F1F5F9' },
  medium: { label: 'Medium', color: '#B45309', bg: '#FEF3C7' },
  high: { label: 'High', color: '#DC2626', bg: '#FEE2E2' },
  urgent: { label: 'Urgent', color: '#991B1B', bg: '#FEE2E2' },
};

const CATEGORIES = [
  'General',
  'Logistics',
  'Marketing',
  'Technical',
  'Finance',
  'Content',
  'Communication',
  'Decoration',
  'Photography',
  'Food & Catering',
];

const EventManage = () => {
  const { clubId, eventId } = useParams();
  const navigate = useNavigate();
  const { user, systemRole, presidentOfClubs, secretaryOfClubs } = useAuth();
  const myClubId = presidentOfClubs?.[0]?.club_id || secretaryOfClubs?.[0]?.club_id;
  const currentUserId = Number(localStorage.getItem('user_id'));

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Main Section Tabs: 0: Tasks, 1: Club Team, 2: Participants, 3: Event Overview
  const [mainSectionTab, setMainSectionTab] = useState(0);

  // Task Filter Tabs
  const [taskFilterTab, setTaskFilterTab] = useState(0);

  // Searches
  const [taskSearch, setTaskSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');

  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    category: '',
    status: 'pending',
    due_date: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const isLeader =
    systemRole === 'admin' ||
    systemRole === 'president' ||
    systemRole === 'secretary' ||
    systemRole === 'event_manager' ||
    teamMembers.some(
      (m) =>
        m.user_id === currentUserId &&
        (m.role === 'president' || m.role === 'secretary' || m.role === 'event_manager' || m.role === 'vice_president')
    );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      let eventData = null;
      try {
        eventData = await getEvent(eventId);
        setEvent(eventData);
      } catch (e) {
        console.warn('Could not fetch single event', e);
      }

      const [participantsData, tasksData] = await Promise.all([
        fetchEventParticipants(eventId).catch(() => []),
        fetchEventTasks(eventId).catch(() => []),
      ]);
      setParticipants(participantsData || []);
      setTasks(tasksData || []);

      const targetClubId = eventData?.club_id || clubId || myClubId;
      if (targetClubId) {
        try {
          const membersRes = await api.get(`/clubs/${targetClubId}/members`);
          if (Array.isArray(membersRes.data) && membersRes.data.length > 0) {
            setTeamMembers(membersRes.data);
          }
        } catch (e) {
          /* No members */
        }
      }
    } catch (err) {
      console.error('Failed to load event management details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      assigned_to: '',
      priority: 'medium',
      category: '',
      status: 'pending',
      due_date: '',
    });
    setTaskModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      priority: task.priority || 'medium',
      category: task.category || '',
      status: task.status || 'pending',
      due_date: task.due_date ? task.due_date.slice(0, 16) : '',
    });
    setTaskModalOpen(true);
  };

  const handleTaskSave = async () => {
    if (!taskForm.title.trim()) {
      setError('Task title is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...taskForm,
        assigned_to: taskForm.assigned_to ? Number(taskForm.assigned_to) : null,
        due_date: taskForm.due_date || null,
        category: taskForm.category || null,
      };

      if (editingTask) {
        await updateEventTask(eventId, editingTask.id, payload);
        setSuccess('Task updated successfully!');
      } else {
        await createEventTask(eventId, payload);
        setSuccess('Task created successfully!');
      }
      setTaskModalOpen(false);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteEventTask(eventId, taskId);
      setSuccess('Task deleted successfully.');
      loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete task.');
    }
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      await updateEventTask(eventId, task.id, { status: newStatus });
      loadData();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update status.');
    }
  };

  const exportCSV = () => {
    if (participants.length === 0) {
      alert('No registrations to export.');
      return;
    }
    const headers = ['ID', 'Username', 'Email'];
    const rows = participants.map((p) => [p.id, p.username || '', p.email || '']);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `event_${eventId}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  const eventDate = event?.start_time ? new Date(event.start_time) : null;
  const eventEndDate = event?.end_time ? new Date(event.end_time) : null;

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const backPath =
    systemRole === 'president'
      ? '/president/events'
      : systemRole === 'secretary'
      ? '/secretary/events'
      : systemRole === 'admin'
      ? '/admin/events'
      : '/events';

  // Filtered Tasks
  const getFilteredTasks = () => {
    let list = tasks;
    if (taskFilterTab === 1) {
      list = list.filter((t) => t.assigned_to === currentUserId);
    } else if (taskFilterTab === 2) {
      list = list.filter((t) => t.status === 'pending');
    } else if (taskFilterTab === 3) {
      list = list.filter((t) => t.status === 'in_progress');
    } else if (taskFilterTab === 4) {
      list = list.filter((t) => t.status === 'completed');
    }

    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.assignee_name?.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const filteredTasks = getFilteredTasks();

  // Filtered Team Members
  const filteredTeam = teamMembers.filter(
    (m) =>
      m.username?.toLowerCase().includes(teamSearch.toLowerCase()) ||
      m.email?.toLowerCase().includes(teamSearch.toLowerCase()) ||
      m.role?.toLowerCase().includes(teamSearch.toLowerCase())
  );

  // Filtered Participants
  const filteredParticipants = participants.filter(
    (p) =>
      p.username?.toLowerCase().includes(participantSearch.toLowerCase()) ||
      p.email?.toLowerCase().includes(participantSearch.toLowerCase()) ||
      String(p.id).includes(participantSearch)
  );

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 6 }}>
      {/* Top Header & Navigation */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={1.5}
      >
        <Box
          onClick={() => navigate(backPath)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Events
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          {isLeader && (
            <Button
              variant="primary"
              startIcon={<AddTaskIcon />}
              onClick={openCreateTask}
              sx={{ px: 2.2 }}
            >
              Assign Task
            </Button>
          )}
          <Button
            variant="ghost"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate(`/clubs/${event?.club_id || clubId || myClubId}/events/${eventId}/edit`)
            }
          >
            Edit Event
          </Button>
          <Button
            variant="ghost"
            startIcon={<DownloadIcon />}
            onClick={exportCSV}
          >
            Export Registrations (.CSV)
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

      {/* Hero Event Banner */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 3.5,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(79, 43, 203, 0.04)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            height: { xs: 180, sm: 220, md: 250 },
            backgroundImage: `linear-gradient(180deg, rgba(15, 10, 40, 0.1) 0%, rgba(15, 10, 35, 0.72) 100%), url(${
              getImageUrl(event?.image_url) || DEFAULT_POSTER
            })`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Box
            sx={{
              color: '#FFFFFF',
              width: '100%',
              p: { xs: 1.5, sm: 2 },
              borderRadius: '18px',
              backgroundColor: 'rgba(15, 8, 48, 0.35)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' },
                mb: 1,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {event?.title || 'Event Management Console'}
            </Typography>
            <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap" gap={1}>
              {eventDate && (
                <Box display="flex" alignItems="center" gap={0.8}>
                  <CalendarMonthIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
                    {eventDate.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Typography>
                </Box>
              )}
              {event?.location && (
                <Box display="flex" alignItems="center" gap={0.8}>
                  <LocationOnIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
                    {event.location}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Live Stat Badges Bar */}
        <Box
          sx={{
            p: 2,
            px: 3,
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            alignItems: 'center',
            backgroundColor: '#F8F7FD',
            borderTop: '1px solid #E9E7F2',
          }}
        >
          <Chip
            label={event?.is_active ? 'Active Event' : 'Inactive'}
            size="small"
            sx={{
              backgroundColor: event?.is_active ? '#D1FAE5' : '#FEE2E2',
              color: event?.is_active ? '#059669' : '#DC2626',
              fontWeight: 800,
              borderRadius: '8px',
            }}
          />
          <Chip
            label={`${participants.length} Registered Attendees`}
            size="small"
            sx={{
              backgroundColor: '#F3F0FF',
              color: '#4F2BCB',
              fontWeight: 800,
              borderRadius: '8px',
              border: '1px solid #D4CCF7',
            }}
          />
          <Chip
            label={`${teamMembers.length} Club Team Members`}
            size="small"
            sx={{
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              fontWeight: 800,
              borderRadius: '8px',
            }}
          />
          <Chip
            label={`${totalTasks} Total Tasks (${progressPercent}% Done)`}
            size="small"
            sx={{
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              fontWeight: 800,
              borderRadius: '8px',
            }}
          />
        </Box>
      </Paper>

      {/* Main Feature Tabs (Tasks, Club Team, Participants, Overview) */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 3.5,
          p: 1,
          boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
        }}
      >
        <Tabs
          value={mainSectionTab}
          onChange={(e, val) => setMainSectionTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.92rem',
              color: '#8E90A2',
              minHeight: 48,
              borderRadius: '12px',
              px: 2.5,
              py: 1,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              '&.Mui-selected': {
                color: '#4F2BCB',
                backgroundColor: '#F3F0FF',
              },
            },
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          <Tab
            icon={<AssignmentIcon sx={{ fontSize: 19 }} />}
            iconPosition="start"
            label={`Event Tasks (${tasks.length})`}
          />
          <Tab
            icon={<PeopleAltOutlinedIcon sx={{ fontSize: 19 }} />}
            iconPosition="start"
            label={`Club Team (${teamMembers.length})`}
          />
          <Tab
            icon={<HowToRegOutlinedIcon sx={{ fontSize: 19 }} />}
            iconPosition="start"
            label={`Registered Attendees (${participants.length})`}
          />
          <Tab
            icon={<EventAvailableOutlinedIcon sx={{ fontSize: 19 }} />}
            iconPosition="start"
            label="Overview & Logistics"
          />
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* SECTION 1: EVENT TASKS (HORIZONTAL CARDS GRID) */}
      {/* ========================================================================= */}
      {mainSectionTab === 0 && (
        <Box>
          {/* Workspace Controls & Progress */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3,
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Actionable Task Items ({filteredTasks.length})
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.3 }}>
                  Assign duties, track deliverables, and coordinate logistics with club organizers.
                </Typography>
              </Box>

              {isLeader && (
                <Button
                  variant="primary"
                  size="small"
                  startIcon={<AddTaskIcon sx={{ fontSize: 17 }} />}
                  onClick={openCreateTask}
                  sx={{ px: 2.2, py: 0.9, borderRadius: '12px' }}
                >
                  Create Task
                </Button>
              )}
            </Box>

            {/* Task Progress Bar */}
            {totalTasks > 0 && (
              <Box sx={{ mb: 2.5, p: 2, borderRadius: '16px', backgroundColor: '#FAF9FF', border: '1px solid #F1EFF8' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="caption" sx={{ color: '#20202A', fontWeight: 800 }}>
                    Overall Task Completion ({completedTasks}/{totalTasks} Tasks)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 900, fontSize: '0.85rem' }}>
                    {progressPercent}% Done
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#E9E7F2',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: 'linear-gradient(90deg, #4F2BCB 0%, #7C3AED 100%)',
                    },
                  }}
                />
                <Stack direction="row" spacing={3} mt={1.5} flexWrap="wrap">
                  <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 800 }}>
                    ⏳ {pendingTasks} Pending
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 800 }}>
                    🔄 {inProgressTasks} In Progress
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800 }}>
                    ✅ {completedTasks} Completed
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Filter Tabs & Search Bar */}
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Tabs
                value={taskFilterTab}
                onChange={(e, v) => setTaskFilterTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    color: '#8E90A2',
                    minHeight: 40,
                    py: 0.8,
                    borderRadius: '10px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    '&.Mui-selected': { color: '#4F2BCB', backgroundColor: '#F3F0FF' },
                  },
                  '& .MuiTabs-indicator': { display: 'none' },
                }}
              >
                <Tab label={`All (${totalTasks})`} />
                <Tab
                  label={`My Tasks (${tasks.filter((t) => t.assigned_to === currentUserId).length})`}
                />
                <Tab label={`Pending (${pendingTasks})`} />
                <Tab label={`In Progress (${inProgressTasks})`} />
                <Tab label={`Done (${completedTasks})`} />
              </Tabs>

              <TextField
                size="small"
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 260 },
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#FFFFFF' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#8E90A2', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>

          {/* Tasks Horizontal Grid Layout */}
          {filteredTasks.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                py: 8,
                px: 3,
                textAlign: 'center',
                borderRadius: '22px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 48, color: '#D4CCF7', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 0.5 }}>
                No tasks matching criteria
              </Typography>
              <Typography variant="body2" sx={{ color: '#8E90A2' }}>
                {isLeader
                  ? 'Click "Create Task" to assign actionable duties to team members.'
                  : 'No tasks currently match this filter.'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {filteredTasks.map((task) => {
                const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const isMyTask = task.assigned_to === currentUserId;

                return (
                  <Grid item xs={12} sm={6} lg={4} key={task.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderRadius: '20px',
                        border: `1.5px solid ${isMyTask ? '#D4CCF7' : '#E9E7F2'}`,
                        backgroundColor: isMyTask ? '#FAF9FF' : '#FFFFFF',
                        transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
                        boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 28px rgba(79, 43, 203, 0.09)',
                          borderColor: '#4F2BCB',
                        },
                      }}
                    >
                      {/* Top Chips: Status, Priority, Category */}
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1.8}>
                          <Chip
                            icon={statusConf.icon}
                            label={statusConf.label}
                            size="small"
                            sx={{
                              backgroundColor: statusConf.bg,
                              color: statusConf.color,
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              borderRadius: '8px',
                            }}
                          />
                          <Stack direction="row" spacing={0.8}>
                            <Chip
                              icon={
                                <FlagIcon
                                  sx={{ fontSize: 12, color: `${priorityConf.color} !important` }}
                                />
                              }
                              label={priorityConf.label}
                              size="small"
                              sx={{
                                backgroundColor: priorityConf.bg,
                                color: priorityConf.color,
                                fontWeight: 800,
                                fontSize: '0.7rem',
                                borderRadius: '8px',
                              }}
                            />
                            {task.category && (
                              <Chip
                                label={task.category}
                                size="small"
                                sx={{
                                  backgroundColor: '#F1F5F9',
                                  color: '#475569',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  borderRadius: '8px',
                                }}
                              />
                            )}
                          </Stack>
                        </Box>

                        {/* Title & Description */}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            color: '#20202A',
                            fontSize: '1.02rem',
                            mb: 0.8,
                            lineHeight: 1.35,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {task.title}
                        </Typography>

                        {task.description && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#5E5D6E',
                              mb: 2,
                              lineHeight: 1.55,
                              fontSize: '0.84rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Card Bottom: Assignee, Due Date, Quick Controls */}
                      <Box sx={{ pt: 1.8, borderTop: '1px solid #F1EFF8', mt: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.2}>
                          {/* Assignee */}
                          <Box display="flex" alignItems="center" gap={0.8}>
                            <Avatar
                              src={getImageUrl(task.assignee_avatar)}
                              sx={{
                                width: 26,
                                height: 26,
                                fontSize: '0.72rem',
                                backgroundColor: '#F3F0FF',
                                color: '#4F2BCB',
                                fontWeight: 800,
                              }}
                            >
                              {(task.assignee_name || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#20202A', fontWeight: 800, display: 'block', lineHeight: 1.1 }}>
                                {task.assignee_name || 'Unassigned'}
                              </Typography>
                              {isMyTask && (
                                <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 700, fontSize: '0.64rem' }}>
                                  (Assigned to You)
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Due Date */}
                          {task.due_date && (
                            <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 700 }}>
                              📅 {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Typography>
                          )}
                        </Box>

                        {/* Action Buttons */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Stack direction="row" spacing={0.8}>
                            {(isLeader || isMyTask) && task.status !== 'completed' && (
                              <>
                                {task.status === 'pending' && (
                                  <Tooltip title="Start Working">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleQuickStatusChange(task, 'in_progress')}
                                      sx={{
                                        color: '#1D4ED8',
                                        backgroundColor: '#EFF6FF',
                                        borderRadius: '8px',
                                        '&:hover': { backgroundColor: '#DBEAFE' },
                                      }}
                                    >
                                      <PlayArrowIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Mark as Completed">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleQuickStatusChange(task, 'completed')}
                                    sx={{
                                      color: '#059669',
                                      backgroundColor: '#ECFDF5',
                                      borderRadius: '8px',
                                      '&:hover': { backgroundColor: '#D1FAE5' },
                                    }}
                                  >
                                    <CheckCircleOutlinedIcon sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>

                          {isLeader && (
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Edit Task">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditTask(task)}
                                  sx={{
                                    color: '#4F2BCB',
                                    borderRadius: '8px',
                                    '&:hover': { backgroundColor: '#F3F0FF' },
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Task">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteTask(task.id)}
                                  sx={{
                                    color: '#EF4444',
                                    borderRadius: '8px',
                                    '&:hover': { backgroundColor: '#FEE2E2' },
                                  }}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CLUB TEAM & ORGANIZERS (HORIZONTAL CARDS GRID) */}
      {/* ========================================================================= */}
      {mainSectionTab === 1 && (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3,
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Event Organizing Team ({filteredTeam.length})
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.3 }}>
                  Club officers, executives, and active committee members executing this event.
                </Typography>
              </Box>

              <TextField
                size="small"
                placeholder="Search team members..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 280 },
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#FFFFFF' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#8E90A2', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>

          {filteredTeam.length === 0 ? (
            <EmptyState icon={<PeopleAltOutlinedIcon />} title="No team members found" />
          ) : (
            <Grid container spacing={2.5}>
              {filteredTeam.map((m, idx) => {
                const initial = (m.username || 'M').charAt(0).toUpperCase();
                const assignedTaskCount = tasks.filter((t) => t.assigned_to === m.user_id).length;

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={m.user_id || idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '20px',
                        border: '1px solid #E9E7F2',
                        backgroundColor: '#FFFFFF',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'all 0.22s ease',
                        boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 28px rgba(79, 43, 203, 0.09)',
                          borderColor: '#D4CCF7',
                        },
                      }}
                    >
                      <Avatar
                        src={getImageUrl(m.avatar_url)}
                        sx={{
                          width: 58,
                          height: 58,
                          backgroundColor: '#F3F0FF',
                          color: '#4F2BCB',
                          fontWeight: 900,
                          fontSize: '1.4rem',
                          border: '2px solid #E0DBFF',
                          mb: 1.5,
                        }}
                      >
                        {initial}
                      </Avatar>

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                          color: '#20202A',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '0.98rem',
                          lineHeight: 1.2,
                          mb: 0.4,
                        }}
                      >
                        {m.username}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{ color: '#8E90A2', mb: 1.5, display: 'block', wordBreak: 'break-all' }}
                      >
                        {m.email}
                      </Typography>

                      <Box mb={2}>
                        <RoleChip role={m.role} />
                      </Box>

                      <Divider sx={{ width: '100%', my: 1, borderColor: '#F1EFF8' }} />

                      <Box display="flex" justifyContent="space-between" width="100%" px={1} mt={0.5}>
                        <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                          Assigned Tasks:
                        </Typography>
                        <Chip
                          label={`${assignedTaskCount} Tasks`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            backgroundColor: assignedTaskCount > 0 ? '#DBEAFE' : '#F1F5F9',
                            color: assignedTaskCount > 0 ? '#1D4ED8' : '#64748B',
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: REGISTERED PARTICIPANTS (HORIZONTAL CARDS GRID) */}
      {/* ========================================================================= */}
      {mainSectionTab === 2 && (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3,
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Registered Event Attendees ({filteredParticipants.length})
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.3 }}>
                  Confirmed campus participants enrolled for this event session.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <TextField
                  size="small"
                  placeholder="Search participants..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  sx={{
                    width: { xs: '100%', sm: 260 },
                    '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#FFFFFF' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#8E90A2', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="ghost"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={exportCSV}
                  sx={{ borderRadius: '12px' }}
                >
                  Export CSV
                </Button>
              </Stack>
            </Box>
          </Paper>

          {filteredParticipants.length === 0 ? (
            <EmptyState icon={<HowToRegOutlinedIcon />} title="No participants found" />
          ) : (
            <Grid container spacing={2.5}>
              {filteredParticipants.map((p) => {
                const initial = (p.username || p.email || 'U').charAt(0).toUpperCase();

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '20px',
                        border: '1px solid #E9E7F2',
                        backgroundColor: '#FFFFFF',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'all 0.22s ease',
                        boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 28px rgba(79, 43, 203, 0.09)',
                          borderColor: '#D4CCF7',
                        },
                      }}
                    >
                      <Avatar
                        src={getImageUrl(p.avatar_url)}
                        sx={{
                          width: 54,
                          height: 54,
                          backgroundColor: '#EDE9FE',
                          color: '#4F2BCB',
                          fontWeight: 900,
                          fontSize: '1.3rem',
                          border: '2px solid #E0DBFF',
                          mb: 1.5,
                        }}
                      >
                        {initial}
                      </Avatar>

                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: '#20202A',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '0.96rem',
                          mb: 0.3,
                        }}
                      >
                        {p.username || 'Student Member'}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{ color: '#8E90A2', mb: 1.8, display: 'block', wordBreak: 'break-all' }}
                      >
                        {p.email}
                      </Typography>

                      <Box mt="auto" width="100%">
                        <Chip
                          icon={<CheckCircleOutlinedIcon style={{ fontSize: 13, color: '#059669' }} />}
                          label="Confirmed Attendee"
                          size="small"
                          sx={{
                            backgroundColor: '#D1FAE5',
                            color: '#059669',
                            fontWeight: 800,
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            width: '100%',
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: EVENT OVERVIEW & LOGISTICS (GRID STATS & DETAILS) */}
      {/* ========================================================================= */}
      {mainSectionTab === 3 && (
        <Grid container spacing={3.5}>
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '22px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  mb: 2.5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Event Logistics & Timetable
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#8E90A2', textTransform: 'uppercase' }}>
                    Venue Location
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A', mt: 0.4 }}>
                    {event?.location || 'University Campus'}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: '#F1EFF8' }} />

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#8E90A2', textTransform: 'uppercase' }}>
                    Scheduled Start
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A', mt: 0.4 }}>
                    {eventDate ? eventDate.toLocaleString() : '—'}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: '#F1EFF8' }} />

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#8E90A2', textTransform: 'uppercase' }}>
                    Scheduled End
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A', mt: 0.4 }}>
                    {eventEndDate ? eventEndDate.toLocaleString() : '—'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '22px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  mb: 2,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Detailed Description & Brief
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: '#5E5D6E',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  fontSize: '0.92rem',
                }}
              >
                {event?.description || 'No extended description has been provided for this event.'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Task Create / Edit Dialog Modal */}
      <Dialog
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            color: '#20202A',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            pb: 1,
          }}
        >
          {editingTask ? 'Edit Task' : 'Assign New Task'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} pt={1}>
            <TextField
              label="Task Title *"
              fullWidth
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Venue setup & sound system management"
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Detail the actionable steps required for this task..."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Assign To"
                  fullWidth
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {teamMembers.map((m) => (
                    <MenuItem key={m.user_id} value={m.user_id}>
                      {m.username || `User #${m.user_id}`} ({m.role || 'Member'})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Priority"
                  fullWidth
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <MenuItem value="low">🟢 Low</MenuItem>
                  <MenuItem value="medium">🟡 Medium</MenuItem>
                  <MenuItem value="high">🔴 High</MenuItem>
                  <MenuItem value="urgent">🚨 Urgent</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Category / Department"
                  fullWidth
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                >
                  <MenuItem value="">
                    <em>General</em>
                  </MenuItem>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                >
                  <MenuItem value="pending">⏳ Pending</MenuItem>
                  <MenuItem value="in_progress">🔄 In Progress</MenuItem>
                  <MenuItem value="completed">✅ Completed</MenuItem>
                  <MenuItem value="cancelled">❌ Cancelled</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Due Date & Time"
              type="datetime-local"
              fullWidth
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setTaskModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleTaskSave} loading={submitting}>
            {editingTask ? 'Save Changes' : 'Assign Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManage;
