import { apiClient } from './apiClient';

const BASE = '/discounts';

export const discountService = {
  async getDashboard() {
    const { data } = await apiClient.get(`${BASE}/dashboard`);
    return data;
  },

  async list() {
    const { data } = await apiClient.get(BASE);
    return data;
  },

  async get(id) {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await apiClient.post(BASE, payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`${BASE}/${id}`, payload);
    return data;
  },

  async toggle(id) {
    const { data } = await apiClient.patch(`${BASE}/${id}/toggle`);
    return data;
  },

  async remove(id) {
    await apiClient.delete(`${BASE}/${id}`);
  },

  async validate(code, userIdentifier = '', orderAmount = 0) {
    const { data } = await apiClient.post(`${BASE}/validate`, {
      code,
      userIdentifier,
      orderAmount,
    });
    return data;
  },

  async recordUsage(id, userIdentifier = '', discountAmount = 0) {
    const { data } = await apiClient.post(`${BASE}/${id}/use`, {
      userIdentifier,
      discountAmount,
    });
    return data;
  },
};

export const COUPON_TYPES = [
  { value: 'all_users',      label: 'All Users',      color: '#4f46e5', bg: '#eef2ff' },
  { value: 'selected_users', label: 'Selected Users', color: '#0891b2', bg: '#ecfeff' },
  { value: 'welcome',        label: 'Welcome',        color: '#059669', bg: '#ecfdf5' },
  { value: 'limited_time',   label: 'Limited Time',   color: '#d97706', bg: '#fffbeb' },
];

export const getCouponTypeMeta = (value) =>
  COUPON_TYPES.find((t) => t.value === value) || {
    value,
    label: value,
    color: '#64748b',
    bg: '#f8fafc',
  };
