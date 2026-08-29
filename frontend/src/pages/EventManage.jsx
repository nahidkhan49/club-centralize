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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import AddTaskIcon from '@mui/icons-material/AddTask';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlagIcon from '@mui/icons-material/Flag';

import { useAuth } from '../context/AuthContext';
import { getEvent, fetchEventParticipants, fetchEventTasks, createEventTask, updateEventTask, deleteEventTask } from '../api/eventApi';
import api, { getImageUrl } from '../api/axiosInstance';
import Button from '../components/Button';

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} /> },
  in_progress: { label: 'In Progress', color: '#3B82F6', bg: '#DBEAFE', icon: <PlayArrowIcon sx={{ fontSize: 14 }} /> },
  completed: { label: 'Completed', color: '#10B981', bg: '#D1FAE5', icon: <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} /> },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: null },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#6B7280', bg: '#F3F4F6' },
  medium: { label: 'Medium', color: '#F59E0B', bg: '#FEF3C7' },
  high: { label: 'High', color: '#EF4444', bg: '#FEE2E2' },
  urgent: { label: 'Urgent', color: '#DC2626', bg: '#FEE2E2' },
};

const CATEGORIES = ['General', 'Logistics', 'Marketing', 'Technical', 'Finance', 'Content', 'Communication', 'Decoration', 'Photography', 'Food & Catering'];

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

  // Determine if current user is a leader (president/secretary/admin)
  const isLeader = systemRole === 'admin' || systemRole === 'president' || systemRole === 'secretary';

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

      const participantsData = await fetchEventParticipants(eventId).catch(() => []);
      setParticipants(participantsData || []);

      const tasksData = await fetchEventTasks(eventId).catch(() => []);
      setTasks(tasksData || []);

      const targetClubId = eventData?.club_id || clubId || myClubId;
      if (targetClubId) {
        try {
          const membersRes = await api.get(`/clubs/${targetClubId}/members`);
          if (Array.isArray(membersRes.data) && membersRes.data.length > 0) {
            setTeamMembers(membersRes.data);
          }
        } catch (e) { /* No members */ }
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

  // ===== Task CRUD =====
  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', assigned_to: '', priority: 'medium', category: '', status: 'pending', due_date: '' });
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
        assigned_to: taskForm.assigned_to || null,
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
      setSuccess('Task deleted.');
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

  // ===== CSV Export =====
  const exportCSV = () => {
    if (participants.length === 0) {
      alert('No registrations to export.');
      return;
    }
    const headers = ['ID', 'Username', 'Email'];
    const rows = participants.map((p) => [p.id, p.username || '', p.email || '']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
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

  // Filter tasks based on tab
  const getFilteredTasks = () => {
    switch (activeTab) {
      case 0: return tasks; // All
      case 1: return tasks.filter((t) => t.assigned_to === currentUserId); // My Tasks
      case 2: return tasks.filter((t) => t.status === 'pending'); // Pending
      case 3: return tasks.filter((t) => t.status === 'in_progress'); // In Progress
      case 4: return tasks.filter((t) => t.status === 'completed'); // Completed
      default: return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Back & Actions Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={1.5}>
        <Box
          onClick={() => navigate(backPath)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
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
              sx={{ backgroundColor: '#4F2BCB', fontSize: '0.85rem' }}
            >
              Assign Task
            </Button>
          )}
          <Button
            variant="ghost"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/clubs/${event?.club_id || clubId || myClubId}/events/${eventId}/edit`)}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.85rem' }}
          >
            Edit Event
          </Button>
          <Button
            variant="ghost"
            startIcon={<GroupIcon />}
            onClick={() => {
              const regPath = systemRole === 'president'
                ? `/president/events/${eventId}/registrations`
                : systemRole === 'secretary'
                ? `/secretary/events/${eventId}/registrations`
                : `/events/${eventId}/registrations`;
              navigate(regPath);
            }}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.85rem' }}
          >
            Registrations
          </Button>
          <Button
            variant="ghost"
            startIcon={<DownloadIcon />}
            onClick={exportCSV}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.85rem' }}
          >
            Export
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* ===== HERO BANNER ===== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            height: { xs: 140, sm: 180, md: 220 },
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%), url(${getImageUrl(event?.image_url) || DEFAULT_POSTER})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            p: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ color: '#FFFFFF', width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.2rem', sm: '1.6rem' }, mb: 0.5, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {event?.title || 'Event'}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              {eventDate && (
                <Box display="flex" alignItems="center" gap={0.6}>
                  <CalendarMonthIcon sx={{ fontSize: 15, opacity: 0.9 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.95 }}>
                    {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Typography>
                </Box>
              )}
              {event?.location && (
                <Box display="flex" alignItems="center" gap={0.6}>
                  <LocationOnIcon sx={{ fontSize: 15, opacity: 0.9 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.95 }}>
                    {event.location}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Stats Row */}
        <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label={event?.is_active ? 'Active' : 'Inactive'} size="small"
            sx={{ backgroundColor: event?.is_active ? '#D1FAE5' : '#FEE2E2', color: event?.is_active ? '#059669' : '#DC2626', fontWeight: 800, fontSize: '0.72rem' }} />
          <Chip label={`${participants.length} Registered`} size="small"
            sx={{ backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 800, fontSize: '0.72rem' }} />
          <Chip label={`${totalTasks} Tasks`} size="small"
            sx={{ backgroundColor: '#DBEAFE', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem' }} />
          <Chip label={`${progressPercent}% Complete`} size="small"
            sx={{ backgroundColor: '#D1FAE5', color: '#059669', fontWeight: 800, fontSize: '0.72rem' }} />
        </Box>
      </Paper>

      {/* ===== MAIN CONTENT ===== */}
      <Grid container spacing={3}>
        {/* LEFT: Task Management Workspace */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
            {/* Task Progress Bar */}
            <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A' }}>
                  <AssignmentIcon sx={{ fontSize: 20, mr: 0.8, verticalAlign: 'text-bottom', color: '#4F2BCB' }} />
                  Task Management
                </Typography>
                {isLeader && (
                  <Button variant="primary" size="small" startIcon={<AddTaskIcon sx={{ fontSize: 16 }} />}
                    onClick={openCreateTask}
                    sx={{ backgroundColor: '#4F2BCB', fontSize: '0.78rem', py: 0.5, px: 2 }}>
                    New Task
                  </Button>
                )}
              </Box>

              {totalTasks > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700 }}>
                      Progress: {completedTasks}/{totalTasks} tasks completed
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 800 }}>
                      {progressPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#F3F0FF',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #4F2BCB, #7C5CE7)',
                      },
                    }}
                  />
                  <Stack direction="row" spacing={2} mt={1}>
                    <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 700 }}>⏳ {pendingTasks} Pending</Typography>
                    <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 700 }}>🔄 {inProgressTasks} In Progress</Typography>
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>✅ {completedTasks} Completed</Typography>
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Task Filter Tabs */}
            <Box sx={{ borderBottom: '1px solid #F0EFF8', px: 2 }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', color: '#777788', minHeight: 42, py: 0.8,
                    '&.Mui-selected': { color: '#4F2BCB' } },
                  '& .MuiTabs-indicator': { backgroundColor: '#4F2BCB', height: 2.5 },
                }}>
                <Tab label={`All (${totalTasks})`} />
                <Tab label={`My Tasks (${tasks.filter((t) => t.assigned_to === currentUserId).length})`} />
                <Tab label={`Pending (${pendingTasks})`} />
                <Tab label={`In Progress (${inProgressTasks})`} />
                <Tab label={`Done (${completedTasks})`} />
              </Tabs>
            </Box>

            {/* Task List */}
            <Box sx={{ p: 2 }}>
              {filteredTasks.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: '#D4CCF7', mb: 1.5 }} />
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#777788', mb: 0.5 }}>
                    {activeTab === 0 ? 'No tasks yet' : 'No tasks in this category'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9DA0AE' }}>
                    {isLeader ? 'Click "New Task" to assign work to team members.' : 'No tasks have been assigned yet.'}
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {filteredTasks.map((task) => {
                    const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                    const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                    const isMyTask = task.assigned_to === currentUserId;

                    return (
                      <Paper
                        key={task.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '14px',
                          border: `1px solid ${isMyTask ? '#D4CCF7' : '#E9E7F2'}`,
                          backgroundColor: isMyTask ? '#FBFAFF' : '#FFFFFF',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: '#4F2BCB', boxShadow: '0 2px 12px rgba(79,43,203,0.08)' },
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
                          <Box sx={{ flex: 1 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.8}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A', fontSize: '0.9rem' }}>
                                {task.title}
                              </Typography>
                              {isMyTask && (
                                <Chip label="Assigned to you" size="small"
                                  sx={{ backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                              )}
                            </Box>

                            {task.description && (
                              <Typography variant="body2" sx={{ color: '#525266', mb: 1, lineHeight: 1.6, fontSize: '0.82rem' }}>
                                {task.description}
                              </Typography>
                            )}

                            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                              {/* Status Chip */}
                              <Chip
                                icon={statusConf.icon}
                                label={statusConf.label}
                                size="small"
                                sx={{ backgroundColor: statusConf.bg, color: statusConf.color, fontWeight: 800, fontSize: '0.7rem', borderRadius: '8px' }}
                              />
                              {/* Priority */}
                              <Chip
                                icon={<FlagIcon sx={{ fontSize: 12, color: `${priorityConf.color} !important` }} />}
                                label={priorityConf.label}
                                size="small"
                                sx={{ backgroundColor: priorityConf.bg, color: priorityConf.color, fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px' }}
                              />
                              {/* Category */}
                              {task.category && (
                                <Chip label={task.category} size="small"
                                  sx={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontWeight: 600, fontSize: '0.68rem', borderRadius: '8px' }} />
                              )}
                              {/* Due date */}
                              {task.due_date && (
                                <Typography variant="caption" sx={{ color: '#9DA0AE', fontWeight: 600 }}>
                                  📅 {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Typography>
                              )}
                              {/* Assignee */}
                              {task.assignee_name && (
                                <Box display="flex" alignItems="center" gap={0.4}>
                                  <Avatar
                                    src={getImageUrl(task.assignee_avatar)}
                                    sx={{ width: 18, height: 18, fontSize: '0.6rem', backgroundColor: '#EAEAFF', color: '#4F2BCB' }}
                                  >
                                    {task.assignee_name.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Typography variant="caption" sx={{ color: '#525266', fontWeight: 600 }}>
                                    {task.assignee_name}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>

                          {/* Actions */}
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                            {/* Quick status buttons */}
                            {(isLeader || isMyTask) && task.status !== 'completed' && (
                              <>
                                {task.status === 'pending' && (
                                  <Tooltip title="Start Task">
                                    <IconButton size="small" onClick={() => handleQuickStatusChange(task, 'in_progress')}
                                      sx={{ color: '#3B82F6', backgroundColor: '#EFF6FF', '&:hover': { backgroundColor: '#DBEAFE' } }}>
                                      <PlayArrowIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Mark Complete">
                                  <IconButton size="small" onClick={() => handleQuickStatusChange(task, 'completed')}
                                    sx={{ color: '#10B981', backgroundColor: '#ECFDF5', '&:hover': { backgroundColor: '#D1FAE5' } }}>
                                    <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {isLeader && (
                              <>
                                <Tooltip title="Edit Task">
                                  <IconButton size="small" onClick={() => openEditTask(task)}
                                    sx={{ color: '#4F2BCB', '&:hover': { backgroundColor: '#F3F0FF' } }}>
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Task">
                                  <IconButton size="small" onClick={() => handleDeleteTask(task.id)}
                                    sx={{ color: '#EF4444', '&:hover': { backgroundColor: '#FEE2E2' } }}>
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

        {/* RIGHT: Sidebar Info */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Quick Stats */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A', mb: 2 }}>
                Event Overview
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#F3F0FF', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#4F2BCB' }}>{participants.length}</Typography>
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, fontSize: '0.68rem' }}>Registered</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#DBEAFE', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#2563EB' }}>{totalTasks}</Typography>
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, fontSize: '0.68rem' }}>Total Tasks</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#D1FAE5', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#059669' }}>{completedTasks}</Typography>
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, fontSize: '0.68rem' }}>Completed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#FEF3C7', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#D97706' }}>
                      {eventDate ? (eventDate > new Date() ? Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24)) : 0) : '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, fontSize: '0.68rem' }}>Days Left</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Event Details */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A', mb: 1.5 }}>
                Event Details
              </Typography>
              <Stack spacing={1.2}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DA0AE', textTransform: 'uppercase', fontSize: '0.68rem' }}>Description</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#525266', lineHeight: 1.6, whiteSpace: 'pre-line', fontSize: '0.82rem' }}>
                    {event?.description || '—'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DA0AE', textTransform: 'uppercase', fontSize: '0.68rem' }}>Location</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>{event?.location || '—'}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DA0AE', textTransform: 'uppercase', fontSize: '0.68rem' }}>Date & Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    {eventDate ? eventDate.toLocaleString() : '—'}
                    {eventEndDate ? ` — ${eventEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Team Members */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A', mb: 1.5 }}>
                Club Team ({teamMembers.length})
              </Typography>
              {teamMembers.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#9DA0AE', textAlign: 'center', py: 2 }}>
                  No club members found.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {teamMembers.map((m, idx) => (
                    <Box key={m.user_id || idx} display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 30, height: 30, backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 800, fontSize: '0.8rem' }}>
                        {(m.username || 'M').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#20202A', display: 'block', lineHeight: 1.2 }}>
                          {m.username || `Member #${m.user_id}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#777788', fontSize: '0.68rem' }}>
                          {m.role || 'Member'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Recent Registrations */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A' }}>
                  Participants ({participants.length})
                </Typography>
                <Button variant="ghost" size="small"
                  onClick={() => {
                    const regPath = systemRole === 'president'
                      ? `/president/events/${eventId}/registrations`
                      : systemRole === 'secretary'
                      ? `/secretary/events/${eventId}/registrations`
                      : `/events/${eventId}/registrations`;
                    navigate(regPath);
                  }}
                  sx={{ color: '#4F2BCB', fontSize: '0.72rem' }}>
                  View All
                </Button>
              </Box>
              {participants.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#9DA0AE', textAlign: 'center', py: 2 }}>No registrations yet.</Typography>
              ) : (
                <Stack spacing={1}>
                  {participants.slice(0, 6).map((p) => (
                    <Box key={p.id} display="flex" alignItems="center" gap={1}>
                      <Avatar
                        src={getImageUrl(p.avatar_url)}
                        sx={{ width: 28, height: 28, backgroundColor: '#EAEAFF', color: '#4F2BCB', fontWeight: 800, fontSize: '0.75rem' }}
                      >
                        {(p.username || p.email || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#20202A' }}>
                        {p.username || p.email}
                      </Typography>
                    </Box>
                  ))}
                  {participants.length > 6 && (
                    <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                      +{participants.length - 6} more
                    </Typography>
                  )}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* ===== TASK CREATE/EDIT MODAL ===== */}
      <Dialog
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#20202A', pb: 0.5 }}>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} pt={1}>
            <TextField
              label="Task Title *"
              fullWidth
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Design event banner"
              InputProps={{ sx: { borderRadius: '12px' } }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Describe what needs to be done..."
              InputProps={{ sx: { borderRadius: '12px' } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Assign To"
                  fullWidth
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {teamMembers.map((m) => (
                    <MenuItem key={m.user_id} value={m.user_id}>
                      {m.username} ({m.role})
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
                  InputProps={{ sx: { borderRadius: '12px' } }}
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
                  label="Category"
                  fullWidth
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
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
                  InputProps={{ sx: { borderRadius: '12px' } }}
                >
                  <MenuItem value="pending">⏳ Pending</MenuItem>
                  <MenuItem value="in_progress">🔄 In Progress</MenuItem>
                  <MenuItem value="completed">✅ Completed</MenuItem>
                  <MenuItem value="cancelled">❌ Cancelled</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Due Date"
              type="datetime-local"
              fullWidth
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: '12px' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setTaskModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleTaskSave}
            disabled={submitting || !taskForm.title.trim()}
            sx={{ backgroundColor: '#4F2BCB' }}
          >
            {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManage;
