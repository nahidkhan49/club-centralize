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

