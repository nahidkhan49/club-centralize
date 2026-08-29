import api from './axiosInstance';

/** List published announcements, optionally filtered by club */
export const fetchAnnouncements = async (clubId = null) => {
  const params = clubId ? { club_id: clubId } : {};
  const res = await api.get('/announcements/', { params });
  return res.data;
};

/** List all announcements (including unpublished) for managers */
export const fetchAllAnnouncements = async (clubId = null) => {
  const params = clubId ? { club_id: clubId } : {};
  const res = await api.get('/announcements/all', { params });
  return res.data;
};

/** Create an announcement (supports createAnnouncement(clubId, form) or createAnnouncement(payload)) */
export const createAnnouncement = async (clubIdOrData, maybeData) => {
  let payload;
  if (typeof clubIdOrData === 'object' && clubIdOrData !== null) {
    payload = clubIdOrData;
  } else {
    payload = { ...(maybeData || {}), club_id: Number(clubIdOrData) };
  }
  const res = await api.post('/announcements/', payload);
  return res.data;
};

/** Update an announcement */
export const updateAnnouncement = async (id, data) => {
  const res = await api.patch(`/announcements/${id}`, data);
  return res.data;
};

/** Delete an announcement */
export const deleteAnnouncement = async (id) => {
  await api.delete(`/announcements/${id}`);
};
