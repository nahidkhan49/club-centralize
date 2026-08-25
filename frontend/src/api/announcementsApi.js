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

/** Create an announcement */
export const createAnnouncement = async (data) => {
  const res = await api.post('/announcements/', data);
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
