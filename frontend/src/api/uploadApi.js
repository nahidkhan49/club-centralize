import api from './axiosInstance';

/**
 * Upload an image file to the backend.
 * @param {File} file - The file object from input type="file"
 * @returns {Promise<string>} The relative static URL of the uploaded image
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};
