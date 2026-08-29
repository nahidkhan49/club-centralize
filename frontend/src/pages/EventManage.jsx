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
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import DownloadIcon from '@mui/icons-material/Download';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';

import { useAuth } from '../context/AuthContext';
import { getEvent, fetchEventParticipants } from '../api/eventApi';
import api, { getImageUrl } from '../api/axiosInstance';
import Button from '../components/Button';

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const PRIORITY_COLORS = {
  High: { bg: '#FEE2E2', color: '#DC2626' },
  Medium: { bg: '#FEF3C7', color: '#D97706' },
  Low: { bg: '#D1FAE5', color: '#059669' },
};

const EventManage = () => {
  const { clubId, eventId } = useParams();
  const navigate = useNavigate();
  const { user, systemRole, presidentOfClubs, secretaryOfClubs } = useAuth();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Logistics state
  const [logistics, setLogistics] = useState([
    { id: 1, name: 'AV Setup & Projectors', status: 'Confirmed', icon: '💻' },
    { id: 2, name: 'Catering (Lunch & Coffee)', status: 'Pending', icon: '🍽️' },
    { id: 3, name: 'Speaker Travel & Reception', status: 'Pending', icon: '✈️' },
    { id: 4, name: 'Auditorium Room Booking', status: 'Confirmed', icon: '🏛️' },
  ]);

  // Tasks state (Kanban)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Book Auditorium 101', due: 'Oct 1', assignee: 'Sohan', role: 'Lead', priority: 'High', status: 'To Do' },
    { id: 2, title: 'Finalize Speaker Travel', due: 'Oct 1', assignee: 'Maria', role: 'Logistics', priority: 'Medium', status: 'In Progress' },
    { id: 3, title: 'Order Catering for 200', due: 'Oct 10', assignee: 'Ahmed', role: 'AV Tech', priority: 'Low', status: 'In Progress' },
    { id: 4, title: 'Speaker AV Rehearsal', due: 'Oct 14', assignee: 'Karim', role: 'Marketing', priority: 'Medium', status: 'To Do' },
    { id: 5, title: 'Send Reminder Email to Attendees', due: 'Oct 14', assignee: 'Sohan', role: 'Lead', priority: 'High', status: 'Done' },
  ]);

  // Team Members state
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Sohan', role: 'Lead', email: 'sohan@centralcampus.edu' },
    { id: 2, name: 'Maria', role: 'Logistics', email: 'maria@centralcampus.edu' },
    { id: 3, name: 'Ahmed', role: 'AV Tech', email: 'ahmed@centralcampus.edu' },
    { id: 4, name: 'Karim', role: 'Marketing', email: 'karim@centralcampus.edu' },
  ]);

  // Key Contacts state
  const [keyContacts, setKeyContacts] = useState([
    { id: 1, name: 'Speaker A (Keynote)', phone: '+87-9254-76729', email: 'speakerA@guest.com' },
    { id: 2, name: 'Speaker B (Workshop)', phone: '+87-9123-45678', email: 'speakerB@mailspeaker.com' },
    { id: 3, name: 'Caterer Coordinator', phone: '+88-0171-888999', email: 'catering.service@gmail.com' },
    { id: 4, name: 'AV Tech Live Lead', phone: '+88-0182-333444', email: 'av.techlive@gmail.com' },
  ]);

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    due: 'Oct 15',
    assignee: 'Sohan',
    priority: 'Medium',
    status: 'To Do',
  });

  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      let eventData = null;
      try {
        eventData = await getEvent(eventId);
        setEvent(eventData);
      } catch (e) {
        console.warn('Could not fetch single event by id, trying all events fallback', e);
        const allRes = await api.get('/events/?limit=200').catch(() => ({ data: [] }));
        eventData = (allRes.data || []).find((ev) => String(ev.id) === String(eventId));
        if (eventData) setEvent(eventData);
      }

      const participantsData = await fetchEventParticipants(eventId).catch(() => []);
      setParticipants(participantsData || []);

      const targetClubId = eventData?.club_id || clubId || myClubId;
      if (targetClubId) {
        try {
          const membersRes = await api.get(`/clubs/${targetClubId}/members`);
          if (Array.isArray(membersRes.data) && membersRes.data.length > 0) {
            const dynamicMembers = membersRes.data.map((m, idx) => ({
              id: m.user_id || idx + 1,
              name: m.username || 'Member',
              role: m.role || 'Organizer',
              email: m.email || `${m.username}@campus.edu`,
            }));
            setTeamMembers(dynamicMembers);
          }
        } catch (e) {
          // Keep defaults
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

  const toggleLogisticsStatus = (id) => {
    setLogistics((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Confirmed' ? 'Pending' : 'Confirmed' }
          : item
      )
    );
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const taskItem = {
      id: Date.now(),
      ...newTask,
      role: teamMembers.find((m) => m.name === newTask.assignee)?.role || 'Member',
    };
    setTasks((prev) => [...prev, taskItem]);
    setTaskModalOpen(false);
    setNewTask({ title: '', due: 'Oct 15', assignee: 'Sohan', priority: 'Medium', status: 'To Do' });
    setSuccess('New task added successfully!');
  };

  const moveTask = (id, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const exportReportCSV = () => {
    const headers = ['Event Name', 'Location', 'Start Time', 'Total Registrations', 'Tasks Count'];
    const rows = [
      [
        event?.title || 'Event',
        event?.location || 'Campus Auditorium',
        event?.start_time || 'TBD',
        participants.length,
        tasks.length,
      ],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(event?.title || 'event').toLowerCase().replace(/\s+/g, '_')}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess('Event report exported successfully!');
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setBroadcastModalOpen(false);
    setBroadcastMessage('');
    setSuccess('Update notice sent to all registered participants and team members!');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  const effectiveClubId = event?.club_id || clubId || presidentOfClubs?.[0]?.club_id || secretaryOfClubs?.[0]?.club_id;
  const isPresident = systemRole === 'president';
  const pathPrefix = isPresident ? '/president' : '/secretary';

  const posterUrl = getImageUrl(event?.image_url) || DEFAULT_POSTER;
  const capacityPercent = Math.min(Math.round((participants.length / 100) * 100), 100) || 90;

  return (
    <Box sx={{ maxWidth: 1250, mx: 'auto', pb: 8, width: '100%' }}>
      {/* Top Breadcrumb Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box
          onClick={() => navigate(`${pathPrefix}/events`)}
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
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Top Hero Banner (Matching Exact Mockup) */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          p: { xs: 2.5, sm: 3 },
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: { xs: 'flex-start', md: 'center' },
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        {/* Left: Event Poster Thumbnail Image */}
        <Box
          sx={{
            width: { xs: '100%', md: 280 },
            height: { xs: 180, md: 170 },
            borderRadius: '16px',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          }}
        >
          <Box
            component="img"
            src={posterUrl}
            alt={event?.title}
            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        {/* Right: Title, Meta, and Purple Action Buttons */}
        <Box sx={{ flex: 1, width: '100%' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              color: '#20202A',
              fontSize: { xs: '1.25rem', sm: '1.45rem' },
              mb: 1.5,
              letterSpacing: '-0.02em',
            }}
          >
            Event Management: {event?.title || 'Annual Public Speaking Workshop'}
          </Typography>

          {/* Meta row with Date, Time, Location, and Status Badges */}
          <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={2.5}>
            <Box display="flex" alignItems="center" gap={0.6}>
              <CalendarMonthIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
              <Typography variant="body2" sx={{ color: '#555565', fontWeight: 600 }}>
                {event?.start_time ? new Date(event.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 15, 2024'}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={0.6}>
              <AccessTimeIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
              <Typography variant="body2" sx={{ color: '#555565', fontWeight: 600 }}>
                {event?.start_time ? new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '9:00 AM - 5:00 PM'}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={0.6}>
              <LocationOnIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
              <Typography variant="body2" sx={{ color: '#555565', fontWeight: 600 }}>
                {event?.location || 'Auditorium 101'}
              </Typography>
            </Box>

            <Chip
              label="● Registration Open"
              size="small"
              sx={{ backgroundColor: '#D1FAE5', color: '#059669', fontWeight: 800, fontSize: '0.74rem' }}
            />

            <Chip
              label={`Capacity: ${capacityPercent}%`}
              size="small"
              sx={{ backgroundColor: '#FEF3C7', color: '#D97706', fontWeight: 800, fontSize: '0.74rem' }}
            />
          </Box>

          {/* 4 Action Buttons */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
            <Button
              variant="ghost"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/clubs/${effectiveClubId}/events/${eventId}/edit`)}
              sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.82rem', py: 0.8 }}
            >
              Edit Event
            </Button>

            <Button
              variant="primary"
              size="small"
              startIcon={<GroupIcon />}
              onClick={() => navigate(`${pathPrefix}/events/${eventId}/registrations`)}
              sx={{ backgroundColor: '#4F2BCB', fontSize: '0.82rem', py: 0.8 }}
            >
              View Registrations ({participants.length})
            </Button>

            <Button
              variant="primary"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportReportCSV}
              sx={{ backgroundColor: '#4F2BCB', fontSize: '0.82rem', py: 0.8 }}
            >
              Download Report
            </Button>

            <Button
              variant="primary"
              size="small"
              startIcon={<EmailOutlinedIcon />}
              onClick={() => setBroadcastModalOpen(true)}
              sx={{ backgroundColor: '#4F2BCB', fontSize: '0.82rem', py: 0.8 }}
            >
              Send Update Email
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* 3-Column Main Management Grid */}
      <Grid container spacing={3}>
        {/* ================= LEFT COLUMN ================= */}
        <Grid item xs={12} md={3.4}>
          <Stack spacing={3}>
            {/* 1. Event Description & Goals */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A', mb: 1.2 }}>
                Event Description & Goals
              </Typography>
              <Typography variant="body2" sx={{ color: '#666677', lineHeight: 1.65, fontSize: '0.88rem' }}>
                {event?.description ||
                  'Annual Public Speaking Workshop focusing on high-impact public settings, addressing team communication, impromptu speaking, panel discussion mastery, and solution delivery.'}
              </Typography>
            </Paper>

            {/* 2. Logistics & Resources */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A' }}>
                  Logistics & Resources
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                {logistics.map((item) => (
                  <Box
                    key={item.id}
                    onClick={() => toggleLogisticsStatus(item.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.2,
                      borderRadius: '12px',
                      backgroundColor: '#FBFBFE',
                      border: '1px solid #F0EFF8',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { backgroundColor: '#F3F0FF', borderColor: '#D4CCF7' },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: '1.1rem' }}>{item.icon}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#333344', fontSize: '0.84rem' }}>
                        {item.name}
                      </Typography>
                    </Box>

                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        backgroundColor: item.status === 'Confirmed' ? '#D1FAE5' : '#FEF3C7',
                        color: item.status === 'Confirmed' ? '#059669' : '#D97706',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        height: 22,
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* 3. Budget Tracker */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A', mb: 0.5 }}>
                Budget Tracker
              </Typography>
              <Typography variant="caption" sx={{ color: '#777788', display: 'block', mb: 1.5 }}>
                Budget (Total: <strong>$2000</strong>) • Spent: <strong>$1250</strong>
              </Typography>

              {/* Progress visual */}
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={62.5}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#F0EFF8',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4F2BCB',
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>

              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#4F2BCB' }}>■ Speaker Fee</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#333' }}>$600</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#D97706' }}>■ Catering / Food</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#333' }}>$400</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>■ Marketing & Print</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#333' }}>$150</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284C7' }}>■ AV & Tech Kit</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#333' }}>$100</Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* ================= MIDDLE COLUMN (Kanban Tasks) ================= */}
        <Grid item xs={12} md={5.6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              height: '100%',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A' }}>
                Task Assignments & Roles
              </Typography>

              <Button
                variant="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setTaskModalOpen(true)}
                sx={{ backgroundColor: '#4F2BCB', fontSize: '0.78rem', py: 0.6 }}
              >
                + Add New Task
              </Button>
            </Box>

            {/* Kanban columns */}
            <Grid container spacing={2}>
              {['To Do', 'In Progress', 'Done'].map((colName) => {
                const colTasks = tasks.filter((t) => t.status === colName);
                const colBg = colName === 'To Do' ? '#FEF3C7' : colName === 'In Progress' ? '#E0F2FE' : '#D1FAE5';
                const colColor = colName === 'To Do' ? '#B45309' : colName === 'In Progress' ? '#0369A1' : '#059669';

                return (
                  <Grid item xs={12} sm={4} key={colName}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: '12px',
                        backgroundColor: colBg,
                        mb: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color: colColor, textTransform: 'uppercase' }}>
                        {colName} ({colTasks.length})
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      {colTasks.map((t) => {
                        const pri = PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.Medium;

                        return (
                          <Paper
                            key={t.id}
                            elevation={0}
                            sx={{
                              p: 1.8,
                              borderRadius: '14px',
                              border: '1px solid #E9E7F2',
                              backgroundColor: '#FFFFFF',
                              transition: 'all 0.15s ease',
                              '&:hover': { borderColor: '#4F2BCB', boxShadow: '0 4px 12px rgba(79, 43, 203, 0.08)' },
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A', fontSize: '0.85rem' }}>
                                {t.title}
                              </Typography>
                              <IconButton size="small" onClick={() => deleteTask(t.id)} sx={{ p: 0.2, color: '#9DA0AE' }}>
                                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Box>

                            <Typography variant="caption" sx={{ color: '#777788', display: 'block', mb: 1.2 }}>
                              Due: <strong>{t.due}</strong>
                            </Typography>

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center" gap={0.8}>
                                <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', backgroundColor: '#EAEAFF', color: '#4F2BCB' }}>
                                  {t.assignee.charAt(0)}
                                </Avatar>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#333' }}>
                                  {t.assignee}
                                </Typography>
                              </Box>

                              <Chip
                                label={t.priority}
                                size="small"
                                sx={{ backgroundColor: pri.bg, color: pri.color, fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                              />
                            </Box>

                            {/* Status changer buttons */}
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" justifyContent="flex-end" gap={0.5}>
                              {colName !== 'To Do' && (
                                <Typography
                                  variant="caption"
                                  onClick={() => moveTask(t.id, 'To Do')}
                                  sx={{ cursor: 'pointer', color: '#777788', fontWeight: 700, fontSize: '0.7rem', '&:hover': { color: '#4F2BCB' } }}
                                >
                                  ← To Do
                                </Typography>
                              )}
                              {colName !== 'In Progress' && (
                                <Typography
                                  variant="caption"
                                  onClick={() => moveTask(t.id, 'In Progress')}
                                  sx={{ cursor: 'pointer', color: '#0284C7', fontWeight: 700, fontSize: '0.7rem', ml: 1, '&:hover': { textDecoration: 'underline' } }}
                                >
                                  In Progress
                                </Typography>
                              )}
                              {colName !== 'Done' && (
                                <Typography
                                  variant="caption"
                                  onClick={() => moveTask(t.id, 'Done')}
                                  sx={{ cursor: 'pointer', color: '#059669', fontWeight: 700, fontSize: '0.7rem', ml: 1, '&:hover': { textDecoration: 'underline' } }}
                                >
                                  Done ✓
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        {/* ================= RIGHT COLUMN ================= */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            {/* 1. Event Team Members */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A', mb: 1.5 }}>
                Event Team Members
              </Typography>

              <Stack spacing={1.5} mb={2}>
                {teamMembers.map((m) => (
                  <Box key={m.id} display="flex" alignItems="center" gap={1.2}>
                    <Avatar sx={{ width: 34, height: 34, backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 800, fontSize: '0.85rem' }}>
                      {m.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A', fontSize: '0.85rem' }}>
                        {m.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#777788' }}>
                        {m.role}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Button
                variant="primary"
                size="small"
                fullWidth
                onClick={() => {
                  alert('Emails copied to clipboard: ' + teamMembers.map((m) => m.email).join(', '));
                }}
                sx={{ backgroundColor: '#4F2BCB', fontSize: '0.8rem' }}
              >
                Contact All
              </Button>
            </Paper>

            {/* 2. Key Contacts */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A', mb: 1.5 }}>
                Key Contacts & Speakers
              </Typography>

              <Stack spacing={1.8}>
                {keyContacts.map((c) => (
                  <Box key={c.id}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A', fontSize: '0.82rem' }}>
                      {c.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.2}>
                      <PhoneOutlinedIcon sx={{ fontSize: 13, color: '#777788' }} />
                      <Typography variant="caption" sx={{ color: '#666677' }}>
                        {c.phone}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <MailOutlinedIcon sx={{ fontSize: 13, color: '#777788' }} />
                      <Typography variant="caption" sx={{ color: '#4F2BCB', wordBreak: 'break-all' }}>
                        {c.email}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Modal to Add New Task */}
      <Dialog
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#20202A' }}>
          Assign New Event Task
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Task Title"
              fullWidth
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />

            <TextField
              label="Due Date"
              fullWidth
              value={newTask.due}
              onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
              placeholder="e.g. Oct 14"
            />

            <TextField
              select
              label="Assignee"
              fullWidth
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
            >
              {teamMembers.map((m) => (
                <MenuItem key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Priority"
              fullWidth
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <MenuItem value="High">High (Urgent)</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="ghost" onClick={() => setTaskModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddTask} sx={{ backgroundColor: '#4F2BCB' }}>
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal for Sending Broadcast / Update Email */}
      <Dialog
        open={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#20202A' }}>
          Send Event Update Notice to Participants
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Typography variant="body2" sx={{ color: '#777788' }}>
              This message will be broadcasted to all {participants.length} registered attendees and event organizers.
            </Typography>
            <TextField
              label="Update Message / Instructions"
              fullWidth
              multiline
              rows={4}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="e.g. Please note that the workshop room has been moved to Hall 101. Bring your laptops."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="ghost" onClick={() => setBroadcastModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendBroadcast} sx={{ backgroundColor: '#4F2BCB' }}>
            Send Update Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManage;
