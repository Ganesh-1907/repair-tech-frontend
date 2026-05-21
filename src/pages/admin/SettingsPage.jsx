import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, RefreshCw, Check } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { invalidateLeadSettingsCache } from '../../hooks/useLeadSettings';

const SETTINGS_ID = 'lead-options';

const DEFAULTS = {
  serviceTypes: ['Walk-in', 'Onsite service'],
  sources: ['Google', 'FB', 'Insta', 'Walkin'],
  devices: ['Laptop', 'Desktop', 'CCTV'],
};

const Section = ({ title, description, items, onAdd, onRemove, saving }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const val = input.trim();
    if (!val || items.includes(val)) return;
    onAdd(val);
    setInput('');
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #f1f5f9',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{title}</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>{description}</p>
        </div>
        <span style={{
          fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
          background: '#e2e8f0', padding: '3px 10px', borderRadius: 99,
        }}>{items.length} options</span>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 40, marginBottom: 14 }}>
          {items.length === 0 && (
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', alignSelf: 'center' }}>No options yet. Add one below.</span>
          )}
          {items.map((item) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px 5px 14px',
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: 99, fontSize: '0.83rem', fontWeight: 600, color: '#334155',
            }}>
              {item}
              <button
                onClick={() => onRemove(item)}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', padding: 2, background: 'none', border: 'none', cursor: saving ? 'default' : 'pointer', color: '#ef4444', borderRadius: 4 }}
                title={`Remove ${item}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={`Add new ${title.toLowerCase()} option...`}
            style={{
              flex: 1, padding: '8px 12px',
              border: '1px solid #e2e8f0', borderRadius: 8,
              fontSize: '0.84rem', outline: 'none',
              color: '#0f172a', background: '#fff',
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim() || saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: input.trim() && !saving ? '#6366f1' : '#e2e8f0',
              color: input.trim() && !saving ? '#fff' : '#94a3b8',
              border: 'none', cursor: input.trim() && !saving ? 'pointer' : 'default',
              fontSize: '0.82rem', fontWeight: 700,
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [sources, setSources] = useState([]);
  const [devices, setDevices] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const recordIdRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSettings = () => {
    setLoading(true);
    apiClient.get('/records/appSettings')
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        const record = all.find((r) => r.settingsId === SETTINGS_ID);
        if (record) {
          recordIdRef.current = record.id;
          setRecordId(record.id);
          setServiceTypes(record.serviceTypes?.length ? record.serviceTypes : [...DEFAULTS.serviceTypes]);
          setSources(record.sources?.length ? record.sources : [...DEFAULTS.sources]);
          setDevices(record.devices?.length ? record.devices : [...DEFAULTS.devices]);
        } else {
          setServiceTypes([...DEFAULTS.serviceTypes]);
          setSources([...DEFAULTS.sources]);
          setDevices([...DEFAULTS.devices]);
        }
      })
      .catch(() => {
        setServiceTypes([...DEFAULTS.serviceTypes]);
        setSources([...DEFAULTS.sources]);
        setDevices([...DEFAULTS.devices]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSettings(); }, []);

  const persist = async (newServiceTypes, newSources, newDevices) => {
    setSaving(true);
    setSaved(false);
    setError('');
    const payload = { settingsId: SETTINGS_ID, serviceTypes: newServiceTypes, sources: newSources, devices: newDevices };
    try {
      const currentId = recordIdRef.current;
      if (currentId) {
        await apiClient.put(`/records/appSettings/${currentId}`, payload);
      } else {
        const res = await apiClient.post('/records/appSettings', payload);
        const newId = res.data?.id || null;
        recordIdRef.current = newId;
        setRecordId(newId);
      }
      invalidateLeadSettingsCache();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to save. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddServiceType = (v) => {
    const updated = [...serviceTypes, v];
    setServiceTypes(updated);
    persist(updated, sources, devices);
  };
  const handleRemoveServiceType = (v) => {
    const updated = serviceTypes.filter((x) => x !== v);
    setServiceTypes(updated);
    persist(updated, sources, devices);
  };

  const handleAddSource = (v) => {
    const updated = [...sources, v];
    setSources(updated);
    persist(serviceTypes, updated, devices);
  };
  const handleRemoveSource = (v) => {
    const updated = sources.filter((x) => x !== v);
    setSources(updated);
    persist(serviceTypes, updated, devices);
  };

  const handleAddDevice = (v) => {
    const updated = [...devices, v];
    setDevices(updated);
    persist(serviceTypes, sources, updated);
  };
  const handleRemoveDevice = (v) => {
    const updated = devices.filter((x) => x !== v);
    setDevices(updated);
    persist(serviceTypes, sources, updated);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading settings...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 780 }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Lead Settings</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
            Changes are saved automatically when you add or remove options.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 600, minWidth: 100, justifyContent: 'flex-end' }}>
          {saving && (
            <span style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: 5 }}>
              <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…
            </span>
          )}
          {saved && !saving && (
            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Saved
            </span>
          )}
          {error && !saving && (
            <span style={{ color: '#dc2626' }}>{error}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section
          title="Service Types"
          description="Options shown in Service Type dropdown (e.g. Walk-in, Onsite service)"
          items={serviceTypes}
          onAdd={handleAddServiceType}
          onRemove={handleRemoveServiceType}
          saving={saving}
        />
        <Section
          title="Sources"
          description="Options shown in Source dropdown (e.g. Google, FB, Instagram)"
          items={sources}
          onAdd={handleAddSource}
          onRemove={handleRemoveSource}
          saving={saving}
        />
        <Section
          title="Devices"
          description="Options shown in Device dropdown (e.g. Laptop, Desktop, CCTV)"
          items={devices}
          onAdd={handleAddDevice}
          onRemove={handleRemoveDevice}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
