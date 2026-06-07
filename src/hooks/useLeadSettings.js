import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

const DEFAULTS = {
  serviceTypes: ['Walk-in', 'Onsite service'],
  sources: ['Google', 'FB', 'Insta', 'Website', 'Walkin'],
  devices: ['Laptop', 'Desktop', 'CCTV'],
};

const SETTINGS_ID = 'lead-options';

let cache = null;

export const invalidateLeadSettingsCache = () => { cache = null; };

export const useLeadSettings = () => {
  const [settings, setSettings] = useState(cache || DEFAULTS);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setSettings(cache);
      return;
    }
    setLoading(true);
    apiClient.get('/records/appSettings')
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        const record = all.find((r) => r.settingsId === SETTINGS_ID);
        if (record) {
          const merged = {
            serviceTypes: record.serviceTypes?.length ? record.serviceTypes : DEFAULTS.serviceTypes,
            sources: Array.from(new Set([...(record.sources?.length ? record.sources : DEFAULTS.sources), 'Website'])),
            devices: record.devices?.length ? record.devices : DEFAULTS.devices,
          };
          cache = merged;
          setSettings(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
};

export const saveLeadSettings = async (newSettings) => {
  const res = await apiClient.get('/records/appSettings');
  const all = Array.isArray(res.data) ? res.data : [];
  const existing = all.find((r) => r.settingsId === SETTINGS_ID);
  const payload = { settingsId: SETTINGS_ID, ...newSettings };
  let result;
  if (existing) {
    result = await apiClient.put(`/records/appSettings/${existing.id}`, payload);
  } else {
    result = await apiClient.post('/records/appSettings', payload);
  }
  cache = newSettings;
  return result.data;
};
