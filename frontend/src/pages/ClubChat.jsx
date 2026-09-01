import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumIcon from '@mui/icons-material/Forum';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import { useAuth } from '../context/AuthContext';
import {
  fetchClubMessages,
  sendClubMessage,
  fetchChatParticipants,
  clearClubMessages,
} from '../api/adminApi';
import api, { getImageUrl } from '../api/axiosInstance';

const ClubChat = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, memberships } = useAuth();

  const currentUserId = Number(localStorage.getItem('user_id'));

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Officer state
  const [isOfficer, setIsOfficer] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileView, setMobileView] = useState('list');

  const messagesEndRef = useRef(null);

  const selectParticipant = (part) => {
    setSelectedUser(part);
    setMobileView('chat');
  };

  const checkRoleAndLoadClub = async () => {
    try {
      setLoading(true);
      setError('');

      const clubRes = await api.get(`/clubs/${clubId}`);
      setClub(clubRes.data);

      const isSuper = user?.is_superuser;
      const clubMembership = memberships.find((m) => Number(m.club_id) === Number(clubId));
      const hasOfficerRole =
        clubMembership &&
        (clubMembership.role === 'president' || clubMembership.role === 'secretary');

      const officerFlag = isSuper || hasOfficerRole;
      setIsOfficer(officerFlag);

      if (officerFlag) {
        const parts = await fetchChatParticipants(clubId).catch(() => []);
        setParticipants(parts);
        if (parts.length > 0) {
          setSelectedUser(parts[0]);
        }
      }
    } catch (err) {
      setError('Failed to initialize chat workspace.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRoleAndLoadClub();
  }, [clubId, memberships]);

  const loadMessages = async () => {
    if (!clubId) return;
    try {
      const targetUserId = isOfficer ? selectedUser?.user_id : currentUserId;
      if (isOfficer && !targetUserId) return;

      const msgs = await fetchClubMessages(clubId, targetUserId);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load message history', err);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
      if (isOfficer) {
        fetchChatParticipants(clubId)
          .then((parts) => {
            setParticipants(parts);
          })
          .catch(() => {});
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [clubId, isOfficer, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const targetUserId = isOfficer ? selectedUser?.user_id : null;
      const sentMsg = await sendClubMessage(clubId, content.trim(), targetUserId);
      setMessages((prev) => [...prev, sentMsg]);
      setContent('');

      if (isOfficer && selectedUser) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.user_id === selectedUser.user_id
              ? { ...p, last_message: content.trim(), last_message_time: new Date().toISOString() }
              : p
          )
        );
      }
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this conversation history? This action is permanent.'
      )
    ) {
      return;
    }
    try {
      const targetUserId = isOfficer ? selectedUser?.user_id : null;
      await clearClubMessages(clubId, targetUserId);
      setMessages([]);

      if (isOfficer && selectedUser) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.user_id === selectedUser.user_id
              ? { ...p, last_message: null, last_message_time: null }
              : p
          )
        );
      }
    } catch (err) {
      setError('Failed to clear conversation.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="65vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1320,
        mx: 'auto',
        width: '100%',
        height: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 150px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: '18px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#4F2BCB' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              src={getImageUrl(club?.logo_url)}
              variant="rounded"
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: '#F3F0FF',
                color: '#4F2BCB',
                fontWeight: 900,
                border: '1px solid #E0DBFF',
              }}
            >
              {club?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {club?.name} Chatroom
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#5E5D6E',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                }}
              >
                <ForumIcon sx={{ fontSize: 13, color: '#4F2BCB' }} />
                {isOfficer
                  ? 'Leadership Officer Console'
                  : 'Direct Communication with Club Leadership'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton onClick={loadMessages} sx={{ color: '#4F2BCB' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', flexShrink: 0 }}>
          {error}
        </Alert>
      )}

      {/* Main Chat Panel */}
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, height: '100%', overflow: 'hidden' }}>
        {/* Left: Member Roster for Officers */}
        {isOfficer && (!isMobile || mobileView === 'list') && (
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: '20px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              }}
            >
              <Box p={2} sx={{ backgroundColor: '#F8F7FD', borderBottom: '1px solid #F1EFF8' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 900,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Member Channels ({participants.length})
                </Typography>
                <Typography variant="caption" sx={{ color: '#8E90A2' }}>
                  Select a member to view their direct chat.
                </Typography>
              </Box>

              <List sx={{ flex: 1, overflowY: 'auto', p: 1.2 }}>
                {participants.length === 0 ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    py={8}
                    px={2}
                    textAlign="center"
                  >
                    <ForumIcon sx={{ fontSize: 40, color: '#D4CCF7', mb: 1.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#5E5D6E' }}>
                      No active member chats
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8E90A2' }}>
                      Chats will appear here as soon as members send messages.
                    </Typography>
                  </Box>
                ) : (
                  participants.map((part) => {
                    const isSelected = selectedUser?.user_id === part.user_id;
                    const dateStr = part.last_message_time
                      ? new Date(part.last_message_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '';

                    return (
                      <ListItem
                        button
                        key={part.user_id}
                        selected={isSelected}
                        onClick={() => selectParticipant(part)}
                        sx={{
                          borderRadius: '14px',
                          mb: 0.8,
                          p: 1.2,
                          '&.Mui-selected': {
                            backgroundColor: '#F3F0FF',
                            border: '1px solid #D4CCF7',
                            '&:hover': { backgroundColor: '#EDE9FE' },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={getImageUrl(part.avatar_url)}
                            sx={{
                              backgroundColor: '#EDE9FE',
                              color: '#4F2BCB',
                              fontWeight: 800,
                            }}
                          >
                            {part.username?.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 800,
                                  color: isSelected ? '#4F2BCB' : '#20202A',
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}
                              >
                                {part.username}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#8E90A2' }}>
                                {dateStr}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#5E5D6E',
                                display: 'block',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {part.last_message || 'Start chatting...'}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })
                )}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Right: Message Stream Viewport */}
        {(!isOfficer || !isMobile || mobileView === 'chat') && (
          <Grid
            item
            xs={12}
            md={isOfficer ? 8 : 12}
            sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
          >
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: '20px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              }}
            >
              {/* Conversation Header */}
              <Box
                p={2}
                sx={{
                  backgroundColor: '#F8F7FD',
                  borderBottom: '1px solid #F1EFF8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  {isMobile && isOfficer && (
                    <IconButton
                      onClick={() => setMobileView('list')}
                      sx={{ color: '#4F2BCB', p: 0.5, mr: 0.5 }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  <Avatar
                    src={
                      isOfficer
                        ? getImageUrl(selectedUser?.avatar_url)
                        : getImageUrl(club?.logo_url)
                    }
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: '#EDE9FE',
                      color: '#4F2BCB',
                      fontWeight: 800,
                    }}
                  >
                    {isOfficer
                      ? selectedUser?.username?.charAt(0).toUpperCase()
                      : club?.name?.charAt(0).toUpperCase()}
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
                      {isOfficer ? selectedUser?.username : `Club Officers (${club?.name})`}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.6,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: '#10B981',
                          display: 'inline-block',
                        }}
                      ></span>
                      Persistent Direct Channel
                    </Typography>
                  </Box>
                </Box>

                <Tooltip title="Delete Conversation History">
                  <IconButton
                    onClick={handleDeleteChat}
                    disabled={messages.length === 0}
                    sx={{
                      color: '#EF4444',
                      backgroundColor: '#FEE2E2',
                      borderRadius: '8px',
                      '&:hover': { backgroundColor: '#FECACA' },
                      '&.Mui-disabled': { backgroundColor: 'transparent', color: '#C4C4D4' },
                    }}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Messages Viewport */}
              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  backgroundColor: '#FAF9FF',
                }}
              >
                {messages.length === 0 ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    my="auto"
                    py={6}
                    textAlign="center"
                  >
                    <ForumIcon sx={{ fontSize: 44, color: '#D4CCF7', mb: 1.5 }} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800, color: '#20202A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Start of conversation
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8E90A2', maxWidth: 300, mt: 0.5 }}>
                      Type a message below to begin chatting with club leadership.
                    </Typography>
                  </Box>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    const timeStr = new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                            backgroundColor: isMe ? '#4F2BCB' : '#FFFFFF',
                            color: isMe ? '#FFFFFF' : '#20202A',
                            boxShadow: isMe
                              ? '0 4px 14px rgba(79, 43, 203, 0.2)'
                              : '0 2px 8px rgba(0,0,0,0.04)',
                            border: isMe ? 'none' : '1px solid #E9E7F2',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ wordBreak: 'break-word', fontWeight: 500, lineHeight: 1.55 }}
                          >
                            {msg.content}
                          </Typography>
                        </Box>
                        <Stack
                          direction="row"
                          spacing={0.6}
                          mt={0.5}
                          pl={isMe ? 0 : 0.5}
                          pr={isMe ? 0.5 : 0}
                          alignItems="center"
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: '#8E90A2', fontSize: '0.7rem', fontWeight: 600 }}
                          >
                            {isMe ? 'You' : msg.sender_name} • {timeStr}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Footer */}
              <Box
                component="form"
                onSubmit={handleSend}
                p={2}
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderTop: '1px solid #F1EFF8',
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isOfficer
                      ? 'Type a reply to this member...'
                      : 'Send a message to the club officers...'
                  }
                  disabled={sending}
                  autoComplete="off"
                  InputProps={{
                    sx: { borderRadius: '12px' },
                  }}
                />
                <IconButton
                  type="submit"
                  disabled={!content.trim() || sending}
                  sx={{
                    backgroundColor: '#4F2BCB',
                    color: '#FFFFFF',
                    p: 1.2,
                    borderRadius: '12px',
                    '&:hover': { backgroundColor: '#39209A' },
                    '&.Mui-disabled': { backgroundColor: '#F3F0FF', color: '#C4C4D4' },
                  }}
                >
                  {sending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SendIcon sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ClubChat;
