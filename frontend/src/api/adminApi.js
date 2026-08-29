import api from './axiosInstance';

/** Get platform-wide stats (admin only) */
export const fetchPlatformStats = async () => {
  const res = await api.get('/users/stats');
  return res.data;
};

/** Get all users (admin only) */
export const fetchAllUsers = async () => {
  const res = await api.get('/users/');
  return res.data;
};

/** Toggle superuser status (admin only) */
export const promoteUser = async (userId) => {
  const res = await api.patch(`/users/${userId}/promote`);
  return res.data;
};

/** Get all clubs (public) */
export const fetchAllClubs = async () => {
  const res = await api.get('/clubs/');
  return res.data;
};

/** Create club (admin only) */
export const createClub = async (clubData) => {
  const res = await api.post('/clubs/', clubData);
  return res.data;
};

/** Update club (admin only) */
export const updateClub = async (clubId, clubData) => {
  const res = await api.patch(`/clubs/${clubId}`, clubData);
  return res.data;
};

/** Upload image file */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/** Delete club (admin only) */
export const deleteClub = async (clubId) => {
  const res = await api.delete(`/clubs/${clubId}`);
  return res.data;
};

/** Assign a role to any user in a club (admin only - adds user if not a member) */
export const assignClubRole = async (clubId, userId, role) => {
  const res = await api.post(`/clubs/${clubId}/assign-role`, { user_id: userId, role });
  return res.data;
};

/** Remove a specific role (president or secretary) from a club (admin only) */
export const removeClubRole = async (clubId, role) => {
  const res = await api.delete(`/clubs/${clubId}/remove-role/${role}`);
  return res.data;
};

/** Get club members with roles */
export const fetchClubMembers = async (clubId) => {
  const res = await api.get(`/clubs/${clubId}/members`);
  return res.data;
};

/** Get club stats */
export const fetchClubStats = async (clubId) => {
  const res = await api.get(`/clubs/${clubId}/stats`);
  return res.data;
};

/** Get event participants */
export const fetchEventParticipants = async (eventId) => {
  const res = await api.get(`/events/${eventId}/participants`);
  return res.data;
};

/** Join event */
export const joinEvent = async (eventId) => {
  const res = await api.post(`/events/${eventId}/join`);
  return res.data;
};

/** Leave event */
export const leaveEvent = async (eventId) => {
  await api.delete(`/events/${eventId}/join`);
};

/** Join / Request to join a club */
export const requestJoinClub = async (clubId) => {
  const res = await api.post(`/clubs/${clubId}/join`);
  return res.data;
};

/** Get current user's join request & membership status for a club */
export const fetchMyClubRequest = async (clubId) => {
  const res = await api.get(`/clubs/${clubId}/my-request`);
  return res.data;
};

/** List membership requests for a club (president / secretary / admin only) */
export const fetchClubRequests = async (clubId, status = null) => {
  const url = status ? `/clubs/${clubId}/requests?status_filter=${status}` : `/clubs/${clubId}/requests`;
  const res = await api.get(url);
  return res.data;
};

/** Approve membership request (president / secretary / admin only) */
export const approveClubRequest = async (clubId, requestId) => {
  const res = await api.post(`/clubs/${clubId}/requests/${requestId}/approve`);
  return res.data;
};

/** Reject membership request (president / secretary / admin only) */
export const rejectClubRequest = async (clubId, requestId) => {
  const res = await api.post(`/clubs/${clubId}/requests/${requestId}/reject`);
  return res.data;
};

/** Leave a club */
export const leaveClub = async (clubId) => {
  const res = await api.delete(`/clubs/${clubId}/leave`);
  return res.data;
};

/** Update a member's role in a club (officer or admin) */
export const updateClubMemberRole = async (clubId, userId, role) => {
  const res = await api.patch(`/clubs/${clubId}/members/${userId}/role`, { role });
  return res.data;
};

/** Remove/delete a member from a club (officer or admin) */
export const removeClubMember = async (clubId, userId) => {
  const res = await api.delete(`/clubs/${clubId}/members/${userId}`);
  return res.data;
};

// ===== Personal Messaging between Club (Officers) and Members =====

/** Fetch chat message history. Optionally pass userId if officer viewing a specific member's channel. */
export const fetchClubMessages = async (clubId, userId = null) => {
  const url = userId ? `/clubs/${clubId}/messages?user_id=${userId}` : `/clubs/${clubId}/messages`;
  const res = await api.get(url);
  return res.data;
};

/** Send a chat message. Optionally pass userId if officer replying to a specific member's channel. */
export const sendClubMessage = async (clubId, content, userId = null) => {
  const res = await api.post(`/clubs/${clubId}/messages`, { content, user_id: userId });
  return res.data;
};

/** List all members who have exchanged messages with this club (officers/admins only) */
export const fetchChatParticipants = async (clubId) => {
  const res = await api.get(`/clubs/${clubId}/chat-participants`);
  return res.data;
};

/** Clear/Delete all messages in a chat conversation channel. */
export const clearClubMessages = async (clubId, userId = null) => {
  const url = userId ? `/clubs/${clubId}/messages?user_id=${userId}` : `/clubs/${clubId}/messages`;
  const res = await api.delete(url);
  return res.data;
};


/** Delete a user (admin only) */
export const deleteUser = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};


