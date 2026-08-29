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
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumIcon from '@mui/icons-material/Forum';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import { useAuth } from '../context/AuthContext';
import { fetchClubMessages, sendClubMessage, fetchChatParticipants, clearClubMessages } from '../api/adminApi';
import api, { getImageUrl } from '../api/axiosInstance';

const ClubChat = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, systemRole, memberships } = useAuth();
  
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
  const [selectedUser, setSelectedUser] = useState(null); // The member the officer is chatting with

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const messagesEndRef = useRef(null);

  const selectParticipant = (part) => {
    setSelectedUser(part);
    setMobileView('chat');
  };

  // Determine role and load club details
  const checkRoleAndLoadClub = async () => {
    try {
      setLoading(true);
      setError('');
      
      const clubRes = await api.get(`/clubs/${clubId}`);
      setClub(clubRes.data);

      // Check if user is officer (president/secretary) of this club, or superuser
      const isSuper = user?.is_superuser;
      const clubMembership = memberships.find((m) => Number(m.club_id) === Number(clubId));
      const hasOfficerRole = clubMembership && (clubMembership.role === 'president' || clubMembership.role === 'secretary');
      
      const officerFlag = isSuper || hasOfficerRole;
      setIsOfficer(officerFlag);

      if (officerFlag) {
        // Load chat participants (members who messaged)
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

  // Load message history
  const loadMessages = async () => {
    if (!clubId) return;
    try {
      // If officer, load messages of the selected member
      // If member, load messages of the current user
      const targetUserId = isOfficer ? selectedUser?.user_id : currentUserId;
      if (isOfficer && !targetUserId) return;

      const msgs = await fetchClubMessages(clubId, targetUserId);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load message history', err);
    }
  };

  // Poll for new messages every 4 seconds to make the chat feel alive
  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
      // Also refresh participant list if officer to get new alerts
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

  // Scroll to bottom
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
      
      // Update last message in local participants list if officer
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
    if (!window.confirm("Are you sure you want to delete this entire chat conversation? This action is permanent and cannot be undone.")) {
      return;
    }
    try {
      const targetUserId = isOfficer ? selectedUser?.user_id : null;
      await clearClubMessages(clubId, targetUserId);
      setMessages([]);
      
      // Update last message preview in roster list if officer
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', height: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 165px)' }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Header Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: '16px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
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
              sx={{ width: 40, height: 40, backgroundColor: '#F3F0FF', border: '1px solid #E0DBFF' }}
            >
              {club?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A' }}>
                {club?.name} Chatroom
              </Typography>
              <Typography variant="caption" sx={{ color: '#777788', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ForumIcon sx={{ fontSize: 12 }} />
                {isOfficer ? 'Personal Officer Console' : 'Direct Channel with Club Officers'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <IconButton onClick={loadMessages} sx={{ color: '#4F2BCB' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, flexShrink: 0 }}>{error}</Alert>}

      {/* Main Panel */}
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, height: '100%', overflow: 'hidden' }}>
        
        {/* LEFT: Sidebar of members (Only visible to Club Officers) */}
        {isOfficer && (!isMobile || mobileView === 'list') && (
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: '18px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Box p={2} sx={{ backgroundColor: '#FBFBFE', borderBottom: '1px solid #F0EFF8' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#444455' }}>
                  Member Channels ({participants.length})
                </Typography>
                <Typography variant="caption" sx={{ color: '#9DA0AE' }}>
                  Select a member to view their direct chat.
                </Typography>
              </Box>

              <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                {participants.length === 0 ? (
                  <Box display="flex" flexDirection="column" alignItems="center" py={8} px={2} textAlign="center">
                    <ForumIcon sx={{ fontSize: 40, color: '#D4CCF7', mb: 1.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#777788' }}>
                      No active chats
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9DA0AE' }}>
                      Chats will appear here as soon as members send messages.
                    </Typography>
                  </Box>
                ) : (
                  participants.map((part) => {
                    const isSelected = selectedUser?.user_id === part.user_id;
                    const dateStr = part.last_message_time
                      ? new Date(part.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <ListItem
                        button
                        key={part.user_id}
                        selected={isSelected}
                        onClick={() => selectParticipant(part)}
                        sx={{
                          borderRadius: '12px',
                          mb: 0.8,
                          '&.Mui-selected': {
                            backgroundColor: '#F3F0FF',
                            '&:hover': { backgroundColor: '#EAEAFF' },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={getImageUrl(part.avatar_url)} sx={{ backgroundColor: '#EAEAFF', color: '#4F2BCB', fontWeight: 800 }}>
                            {part.username?.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? '#4F2BCB' : '#20202A' }}>
                                {part.username}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#9DA0AE' }}>
                                {dateStr}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#777788',
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

        {(!isOfficer || !isMobile || mobileView === 'chat') && (
          /* RIGHT: Chat bubbles viewport */
          <Grid item xs={12} md={isOfficer ? 8 : 12} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: '18px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Conversation Header */}
              <Box p={2} sx={{ backgroundColor: '#FBFBFE', borderBottom: '1px solid #F0EFF8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  {isMobile && isOfficer && (
                    <IconButton onClick={() => setMobileView('list')} sx={{ color: '#4F2BCB', p: 0.5, mr: 0.5 }}>
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  <Avatar
                    src={isOfficer ? getImageUrl(selectedUser?.avatar_url) : getImageUrl(club?.logo_url)}
                    sx={{ width: 34, height: 34, backgroundColor: '#EAEAFF', color: '#4F2BCB', fontWeight: 800 }}
                  >
                    {isOfficer ? selectedUser?.username?.charAt(0).toUpperCase() : club?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A' }}>
                      {isOfficer ? selectedUser?.username : `Club Officers (${club?.name})`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                      Active Persistent Session
                    </Typography>
                  </Box>
                </Box>

                {/* Delete Conversation Button */}
                <Tooltip title="Delete Conversation History">
                  <IconButton
                    onClick={handleDeleteChat}
                    disabled={messages.length === 0}
                    sx={{
                      color: '#EF4444',
                      backgroundColor: '#FEF2F2',
                      '&:hover': { backgroundColor: '#FEE2E2' },
                      '&.Mui-disabled': { backgroundColor: 'transparent', color: '#C4C4D4' }
                    }}
                  >
                    <DeleteOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>

            {/* Messages Viewport */}
            <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: '#FAFAFD' }}>
              {messages.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContext="center" my="auto" py={6} textAlign="center">
                  <ForumIcon sx={{ fontSize: 44, color: '#D4CCF7', mb: 1.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#777788' }}>
                    Start of chat history
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9DA0AE', maxWidth: 280, mt: 0.5 }}>
                    Type a message below to begin chatting. Refreshing or logging out will not clear this chat.
                  </Typography>
                </Box>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId;
                  const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.8,
                          borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                          backgroundColor: isMe ? '#4F2BCB' : '#FFFFFF',
                          color: isMe ? '#FFFFFF' : '#20202A',
                          boxShadow: isMe ? '0 3px 10px rgba(79, 43, 203, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                          border: isMe ? 'none' : '1px solid #E9E7F2',
                        }}
                      >
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', fontWeight: 500, lineHeight: 1.5 }}>
                          {msg.content}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.6} mt={0.5} pl={isMe ? 0 : 0.5} pr={isMe ? 0.5 : 0} alignItems="center">
                        <Typography variant="caption" sx={{ color: '#9DA0AE', fontSize: '0.68rem', fontWeight: 600 }}>
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
            <Box component="form" onSubmit={handleSend} p={2} sx={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #F0EFF8', display: 'flex', gap: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isOfficer ? "Type a reply..." : "Send a message to the club officers..."}
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
                  '&:hover': { backgroundColor: '#39209A' },
                  '&.Mui-disabled': { backgroundColor: '#F0EFF8', color: '#C4C4D4' },
                }}
              >
                {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon sx={{ fontSize: 20 }} />}
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
