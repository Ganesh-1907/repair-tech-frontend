import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  async list(collection) {
    const { data } = await apiClient.get(`/records/${collection}`);
    return data;
  },
  async get(collection, id) {
    const { data } = await apiClient.get(`/records/${collection}/${id}`);
    return data;
  },
  async create(collection, payload) {
    const { data } = await apiClient.post(`/records/${collection}`, payload);
    return data;
  },
  async update(collection, id, payload) {
    const { data } = await apiClient.put(`/records/${collection}/${id}`, payload);
    return data;
  },
  async patch(collection, id, payload) {
    const { data } = await apiClient.patch(`/records/${collection}/${id}`, payload);
    return data;
  },
  async remove(collection, id) {
    await apiClient.delete(`/records/${collection}/${id}`);
  },
  async reset(collection) {
    const { data } = await apiClient.post(`/records/${collection}/reset`);
    return data;
  },
};
