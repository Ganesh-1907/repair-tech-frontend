import { apiClient } from './apiClient';

export const uploadFileToR2 = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/upload/file', formData);
  return data;
};

export const uploadFilesToR2 = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const { data } = await apiClient.post('/upload/files', formData);
  return data;
};

export const isImage = (name) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name || '');

export const isPdf = (name) => /\.pdf$/i.test(name || '');
