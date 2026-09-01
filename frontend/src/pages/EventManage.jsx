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

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#B45309', bg: '#FEF3C7', icon: <HourglassEmptyIcon sx={{ fontSize: 13 }} /> },
  in_progress: { label: 'In Progress', color: '#1D4ED8', bg: '#DBEAFE', icon: <PlayArrowIcon sx={{ fontSize: 13 }} /> },
  completed: { label: 'Completed', color: '#059669', bg: '#D1FAE5', icon: <CheckCircleOutlinedIcon sx={{ fontSize: 13 }} /> },
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
  const [activeTab, setActiveTab] = useState(0);

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
    systemRole === 'admin' || systemRole === 'president' || systemRole === 'secretary';

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

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 0:
        return tasks;
      case 1:
        return tasks.filter((t) => t.assigned_to === currentUserId);
      case 2:
        return tasks.filter((t) => t.status === 'pending');
      case 3:
        return tasks.filter((t) => t.status === 'in_progress');
      case 4:
        return tasks.filter((t) => t.status === 'completed');
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 6 }}>
      {/* Back & Actions Header matching Image 4 */}
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
            startIcon={<GroupIcon />}
            onClick={() => {
              const regPath =
                systemRole === 'president'
                  ? `/president/events/${eventId}/registrations`
                  : systemRole === 'secretary'
                  ? `/secretary/events/${eventId}/registrations`
                  : `/events/${eventId}/registrations`;
              navigate(regPath);
            }}
          >
            Registrations ({participants.length})
          </Button>
          <Button
            variant="ghost"
            startIcon={<DownloadIcon />}
            onClick={exportCSV}
          >
            Export
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

      {/* Hero Banner matching Reference Image 4 */}
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
            height: { xs: 160, sm: 200, md: 240 },
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15, 10, 35, 0.75) 100%), url(${
              getImageUrl(event?.image_url) || DEFAULT_POSTER
            })`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Box sx={{ color: '#FFFFFF', width: '100%' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' },
                mb: 1,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textShadow: '0 2px 10px rgba(0,0,0,0.4)',
              }}
            >
              {event?.title || 'Event'}
            </Typography>
            <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap">
              {eventDate && (
                <Box display="flex" alignItems="center" gap={0.8}>
                  <CalendarMonthIcon sx={{ fontSize: 16, opacity: 0.95 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
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
                  <LocationOnIcon sx={{ fontSize: 16, opacity: 0.95 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    {event.location}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Stats Row */}
        <Box
          sx={{
            p: 2,
            px: 3,
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            alignItems: 'center',
            backgroundColor: '#F8F7FD',
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
            label={`${participants.length} Registered`}
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
            label={`${totalTasks} Total Tasks`}
            size="small"
            sx={{
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              fontWeight: 800,
              borderRadius: '8px',
            }}
          />
          <Chip
            label={`${progressPercent}% Tasks Completed`}
            size="small"
            sx={{
              backgroundColor: '#D1FAE5',
              color: '#059669',
              fontWeight: 800,
              borderRadius: '8px',
            }}
          />
        </Box>
      </Paper>

      {/* Main 2-Column Content matching Reference Image 4 */}
      <Grid container spacing={3.5}>
        {/* Left Column: Task Management Workspace */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(79, 43, 203, 0.03)',
            }}
          >
            {/* Header & Progress */}
            <Box sx={{ p: 3, pb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.8}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 900,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1.1rem',
                  }}
                >
                  <AssignmentIcon
                    sx={{ fontSize: 22, mr: 1, verticalAlign: 'text-bottom', color: '#4F2BCB' }}
                  />
                  Task Management Workspace
                </Typography>
                {isLeader && (
                  <Button
                    variant="primary"
                    size="small"
                    startIcon={<AddTaskIcon sx={{ fontSize: 16 }} />}
                    onClick={openCreateTask}
                    sx={{ py: 0.6, px: 1.8, borderRadius: '8px' }}
                  >
                    New Task
                  </Button>
                )}
              </Box>

              {totalTasks > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.8}>
                    <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 700 }}>
                      Progress: {completedTasks}/{totalTasks} tasks completed
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 900 }}>
                      {progressPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                      height: 9,
                      borderRadius: 5,
                      backgroundColor: '#F3F0FF',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(90deg, #4F2BCB, #7C3AED)',
                      },
                    }}
                  />
                  <Stack direction="row" spacing={2.5} mt={1.5}>
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
            </Box>

            {/* Filter Tabs */}
            <Box sx={{ borderBottom: '1px solid #F1EFF8', px: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    color: '#8E90A2',
                    minHeight: 44,
                    py: 1,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    '&.Mui-selected': { color: '#4F2BCB' },
                  },
                  '& .MuiTabs-indicator': { backgroundColor: '#4F2BCB', height: 3, borderRadius: '3px' },
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
            </Box>

            {/* Task List */}
            <Box sx={{ p: 2.5 }}>
              {filteredTasks.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 44, color: '#D4CCF7', mb: 1.5 }} />
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#20202A', mb: 0.5 }}>
                    {activeTab === 0 ? 'No tasks created yet' : 'No tasks in this category'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8E90A2' }}>
                    {isLeader
                      ? 'Click "New Task" to assign work items to team members.'
                      : 'No tasks have been assigned to you for this event.'}
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.8}>
                  {filteredTasks.map((task) => {
                    const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                    const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                    const isMyTask = task.assigned_to === currentUserId;

                    return (
                      <Paper
                        key={task.id}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: '16px',
                          border: `1px solid ${isMyTask ? '#D4CCF7' : '#E9E7F2'}`,
                          backgroundColor: isMyTask ? '#FAF9FF' : '#FFFFFF',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 6px rgba(79, 43, 203, 0.02)',
                          '&:hover': {
                            borderColor: '#4F2BCB',
                            boxShadow: '0 6px 18px rgba(79, 43, 203, 0.08)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                          <Box sx={{ flex: 1 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.8}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 800,
                                  color: '#20202A',
                                  fontSize: '0.96rem',
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}
                              >
                                {task.title}
                              </Typography>
                              {isMyTask && (
                                <Chip
                                  label="Assigned to you"
                                  size="small"
                                  sx={{
                                    backgroundColor: '#F3F0FF',
                                    color: '#4F2BCB',
                                    fontWeight: 800,
                                    fontSize: '0.68rem',
                                    height: 22,
                                    border: '1px solid #D4CCF7',
                                  }}
                                />
                              )}
                            </Box>

                            {task.description && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#5E5D6E',
                                  mb: 1.5,
                                  lineHeight: 1.6,
                                  fontSize: '0.84rem',
                                }}
                              >
                                {task.description}
                              </Typography>
                            )}

                            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" gap={0.5}>
                              {/* Status Chip */}
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
                              {/* Priority */}
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
                                  fontSize: '0.72rem',
                                  borderRadius: '8px',
                                }}
                              />
                              {/* Category */}
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
                              {/* Due Date */}
                              {task.due_date && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: '#8E90A2', fontWeight: 600, ml: 0.5 }}
                                >
                                  📅 {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Typography>
                              )}
                              {/* Assignee */}
                              {task.assignee_name && (
                                <Box display="flex" alignItems="center" gap={0.5} sx={{ ml: 0.5 }}>
                                  <Avatar
                                    src={getImageUrl(task.assignee_avatar)}
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      fontSize: '0.62rem',
                                      backgroundColor: '#F3F0FF',
                                      color: '#4F2BCB',
                                      fontWeight: 800,
                                    }}
                                  >
                                    {task.assignee_name.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: '#20202A', fontWeight: 700 }}
                                  >
                                    {task.assignee_name}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>

                          {/* Quick Actions */}
                          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexShrink: 0 }}>
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
                                      <PlayArrowIcon sx={{ fontSize: 18 }} />
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
                                    <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {isLeader && (
                              <>
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
                              </>
                            )}
                          </Stack>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Info Widgets matching Reference Image 4 */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Quick Stats Matrix */}
            <Paper
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: '22px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  mb: 2,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Event Overview
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      backgroundColor: '#F3F0FF',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#4F2BCB' }}>
                      {participants.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 700 }}>
                      Registered
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      backgroundColor: '#DBEAFE',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#1D4ED8' }}>
                      {totalTasks}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 700 }}>
                      Total Tasks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      backgroundColor: '#D1FAE5',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#059669' }}>
                      {completedTasks}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 700 }}>
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      backgroundColor: '#FEF3C7',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#B45309' }}>
                      {eventDate
                        ? eventDate > new Date()
                          ? Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24))
                          : 0
                        : '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 700 }}>
                      Days Left
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Event Details */}
            <Paper
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: '22px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  mb: 1.8,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Event Details
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: '#8E90A2',
                      textTransform: 'uppercase',
                      fontSize: '0.68rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Description
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: '#5E5D6E',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                      fontSize: '0.84rem',
                      mt: 0.3,
                    }}
                  >
                    {event?.description || 'No detailed description provided.'}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: '#F1EFF8' }} />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: '#8E90A2',
                      textTransform: 'uppercase',
                      fontSize: '0.68rem',
                    }}
                  >
                    Location / Venue
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#20202A', mt: 0.3 }}
                  >
                    {event?.location || 'University Main Auditorium'}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: '#F1EFF8' }} />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: '#8E90A2',
                      textTransform: 'uppercase',
                      fontSize: '0.68rem',
                    }}
                  >
                    Date & Time
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#20202A', mt: 0.3 }}
                  >
                    {eventDate ? eventDate.toLocaleString() : '—'}
                    {eventEndDate
                      ? ` — ${eventEndDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`
                      : ''}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Club Team Members */}
            <Paper
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: '22px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  mb: 1.8,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Club Team ({teamMembers.length})
              </Typography>
              {teamMembers.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#8E90A2', textAlign: 'center', py: 2 }}>
                  No team members found.
                </Typography>
              ) : (
                <Stack spacing={1.2}>
                  {teamMembers.slice(0, 6).map((m, idx) => (
                    <Box
                      key={m.user_id || idx}
                      display="flex"
                      alignItems="center"
                      gap={1.2}
                      sx={{
                        p: 1,
                        borderRadius: '12px',
                        backgroundColor: '#F8F7FD',
                        border: '1px solid #F1EFF8',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: '#F3F0FF',
                          color: '#4F2BCB',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                        }}
                      >
                        {(m.username || 'M').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: '#20202A',
                            display: 'block',
                            lineHeight: 1.2,
                          }}
                        >
                          {m.username || `Member #${m.user_id}`}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#5E5D6E', fontSize: '0.7rem', textTransform: 'capitalize' }}
                        >
                          {m.role?.replace('_', ' ') || 'Member'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Participants */}
            <Paper
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: '22px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.8}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 900,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Participants ({participants.length})
                </Typography>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => {
                    const regPath =
                      systemRole === 'president'
                        ? `/president/events/${eventId}/registrations`
                        : systemRole === 'secretary'
                        ? `/secretary/events/${eventId}/registrations`
                        : `/events/${eventId}/registrations`;
                    navigate(regPath);
                  }}
                  sx={{ color: '#4F2BCB', fontSize: '0.76rem' }}
                >
                  View All
                </Button>
              </Box>
              {participants.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#8E90A2', textAlign: 'center', py: 2 }}>
                  No registrations yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {participants.slice(0, 5).map((p) => (
                    <Box
                      key={p.id}
                      display="flex"
                      alignItems="center"
                      gap={1.2}
                      sx={{
                        p: 0.8,
                        borderRadius: '10px',
                        backgroundColor: '#FAF9FF',
                      }}
                    >
                      <Avatar
                        src={getImageUrl(p.avatar_url)}
                        sx={{
                          width: 30,
                          height: 30,
                          backgroundColor: '#EDE9FE',
                          color: '#4F2BCB',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                        }}
                      >
                        {(p.username || p.email || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: '#20202A' }}
                      >
                        {p.username || p.email}
                      </Typography>
                    </Box>
                  ))}
                  {participants.length > 5 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#4F2BCB',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'block',
                        pt: 0.5,
                      }}
                    >
                      +{participants.length - 5} more participants
                    </Typography>
                  )}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Task Create / Edit Dialog */}
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
