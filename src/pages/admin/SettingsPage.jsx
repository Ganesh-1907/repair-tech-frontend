import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, RefreshCw, Check, Lock } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { invalidateLeadSettingsCache } from '../../hooks/useLeadSettings';
import { invalidateExpenseSettingsCache, EXPENSE_SETTINGS_ID } from '../../hooks/useExpenseSettings';

const SETTINGS_ID = 'lead-options';

const BUILT_IN_DEVICE_TYPES = ['Laptop', 'Desktop', 'Server', 'Printer', 'CCTV', 'VPS'];

const DEFAULTS = {
  serviceTypes: ['Walk-in', 'Onsite service'],
  sources: ['Google', 'FB', 'Insta', 'Walkin'],
  devices: ['Laptop', 'Desktop', 'Server', 'Printer', 'CCTV', 'VPS'],
};

const EXPENSE_DEFAULTS = {
  expenseCategories: ['Salaries', 'Purchases', 'Rent', 'Utilities', 'Travel', 'Others'],
  paymentModes: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'],
  vendorPayeeOptions: [
    'Technician Salary', 'Support Staff Salary', 'Admin Salary', 'Delivery Staff Salary',
    'Device Purchase Vendor', 'Spare Parts Vendor', 'Consumables Vendor', 'Necessary Office Purchase Vendor',
    'Shop Rent Owner', 'Office Rent Owner', 'Warehouse Rent Owner',
    'Electricity Board', 'Internet Provider', 'Water Utility Provider', 'Cloud Service Provider',
    'Field Team Reimbursement', 'Fuel Station Vendor', 'Travel Agency', 'Local Transport Vendor',
    'Miscellaneous Vendor', 'Service Partner', 'Other Payee',
  ],
};

const Section = ({ title, description, items, onAdd, onRemove, saving, builtIn = [] }) => {
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
          {items.map((item) => {
            const isBuiltIn = builtIn.includes(item);
            return (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px 5px 14px',
                background: isBuiltIn ? '#f0f9ff' : '#f1f5f9',
                border: `1px solid ${isBuiltIn ? '#bae6fd' : '#e2e8f0'}`,
                borderRadius: 99, fontSize: '0.83rem', fontWeight: 600, color: '#334155',
              }}>
                {item}
                {isBuiltIn ? (
                  <span title="Built-in — cannot be removed" style={{ display: 'flex', alignItems: 'center', padding: 2, color: '#94a3b8' }}>
                    <Lock size={11} />
                  </span>
                ) : (
                  <button
                    onClick={() => onRemove(item)}
                    disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', padding: 2, background: 'none', border: 'none', cursor: saving ? 'default' : 'pointer', color: '#ef4444', borderRadius: 4 }}
                    title={`Remove ${item}`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
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

const TABS = [
  { id: 'lead', label: 'Lead Settings', icon: '📋' },
  { id: 'expense', label: 'Expense / Payment Settings', icon: '💰' },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('lead');
  const [serviceTypes, setServiceTypes] = useState([]);
  const [sources, setSources] = useState([]);
  const [devices, setDevices] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const recordIdRef = useRef(null);

  const [expenseCategories, setExpenseCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [vendorPayeeOptions, setVendorPayeeOptions] = useState([]);
  const [expenseRecordId, setExpenseRecordId] = useState(null);
  const expenseRecordIdRef = useRef(null);

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
          const saved = record.devices?.length ? record.devices : [];
          const merged = Array.from(new Set([...BUILT_IN_DEVICE_TYPES, ...saved.filter(d => !BUILT_IN_DEVICE_TYPES.includes(d))]));
          setDevices(merged);
        } else {
          setServiceTypes([...DEFAULTS.serviceTypes]);
          setSources([...DEFAULTS.sources]);
          setDevices([...DEFAULTS.devices]);
        }

        const expenseRecord = all.find((r) => r.settingsId === EXPENSE_SETTINGS_ID);
        if (expenseRecord) {
          expenseRecordIdRef.current = expenseRecord.id;
          setExpenseRecordId(expenseRecord.id);
          setExpenseCategories(expenseRecord.expenseCategories?.length ? expenseRecord.expenseCategories : [...EXPENSE_DEFAULTS.expenseCategories]);
          setPaymentModes(expenseRecord.paymentModes?.length ? expenseRecord.paymentModes : [...EXPENSE_DEFAULTS.paymentModes]);
          setVendorPayeeOptions(expenseRecord.vendorPayeeOptions?.length ? expenseRecord.vendorPayeeOptions : [...EXPENSE_DEFAULTS.vendorPayeeOptions]);
        } else {
          const defaultCategories = [...EXPENSE_DEFAULTS.expenseCategories];
          const defaultPaymentModes = [...EXPENSE_DEFAULTS.paymentModes];
          const defaultVendors = [...EXPENSE_DEFAULTS.vendorPayeeOptions];
          setExpenseCategories(defaultCategories);
          setPaymentModes(defaultPaymentModes);
          setVendorPayeeOptions(defaultVendors);
          apiClient.post('/records/appSettings', {
            settingsId: EXPENSE_SETTINGS_ID,
            expenseCategories: defaultCategories,
            paymentModes: defaultPaymentModes,
            vendorPayeeOptions: defaultVendors,
          }).then((res) => {
            const newId = res.data?.id || null;
            expenseRecordIdRef.current = newId;
            setExpenseRecordId(newId);
            invalidateExpenseSettingsCache();
          }).catch(() => {});
        }
      })
      .catch(() => {
        setServiceTypes([...DEFAULTS.serviceTypes]);
        setSources([...DEFAULTS.sources]);
        setDevices([...DEFAULTS.devices]);
        setExpenseCategories([...EXPENSE_DEFAULTS.expenseCategories]);
        setPaymentModes([...EXPENSE_DEFAULTS.paymentModes]);
        setVendorPayeeOptions([...EXPENSE_DEFAULTS.vendorPayeeOptions]);
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
    if (BUILT_IN_DEVICE_TYPES.includes(v)) return;
    const updated = devices.filter((x) => x !== v);
    setDevices(updated);
    persist(serviceTypes, sources, updated);
  };

  const persistExpense = async (newCategories, newPaymentModes, newVendorPayeeOptions) => {
    setSaving(true);
    setSaved(false);
    setError('');
    const payload = {
      settingsId: EXPENSE_SETTINGS_ID,
      expenseCategories: newCategories,
      paymentModes: newPaymentModes,
      vendorPayeeOptions: newVendorPayeeOptions,
    };
    try {
      const currentId = expenseRecordIdRef.current;
      if (currentId) {
        await apiClient.put(`/records/appSettings/${currentId}`, payload);
      } else {
        const res = await apiClient.post('/records/appSettings', payload);
        const newId = res.data?.id || null;
        expenseRecordIdRef.current = newId;
        setExpenseRecordId(newId);
      }
      invalidateExpenseSettingsCache();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to save. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddExpenseCategory = (v) => {
    const updated = [...expenseCategories, v];
    setExpenseCategories(updated);
    persistExpense(updated, paymentModes, vendorPayeeOptions);
  };
  const handleRemoveExpenseCategory = (v) => {
    const updated = expenseCategories.filter((x) => x !== v);
    setExpenseCategories(updated);
    persistExpense(updated, paymentModes, vendorPayeeOptions);
  };

  const handleAddPaymentMode = (v) => {
    const updated = [...paymentModes, v];
    setPaymentModes(updated);
    persistExpense(expenseCategories, updated, vendorPayeeOptions);
  };
  const handleRemovePaymentMode = (v) => {
    const updated = paymentModes.filter((x) => x !== v);
    setPaymentModes(updated);
    persistExpense(expenseCategories, updated, vendorPayeeOptions);
  };

  const handleAddVendorPayee = (v) => {
    const updated = [...vendorPayeeOptions, v];
    setVendorPayeeOptions(updated);
    persistExpense(expenseCategories, paymentModes, updated);
  };
  const handleRemoveVendorPayee = (v) => {
    const updated = vendorPayeeOptions.filter((x) => x !== v);
    setVendorPayeeOptions(updated);
    persistExpense(expenseCategories, paymentModes, updated);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading settings...
      </div>
    );
  }

  const statusIndicator = (
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
  );

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Settings</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
            Changes are saved automatically when you add or remove options.
          </p>
        </div>
        {statusIndicator}
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: 28,
        gap: 0,
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                border: 'none',
                borderBottom: isActive ? '3px solid #6366f1' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                fontSize: '0.93rem',
                fontWeight: isActive ? 800 : 600,
                background: 'transparent',
                color: isActive ? '#6366f1' : '#94a3b8',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 8,
                background: isActive ? '#eef2ff' : '#f1f5f9',
                fontSize: '0.85rem',
              }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'lead' && (
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
            description="Options shown in Device dropdown. Built-in types (locked) cannot be removed."
            items={devices}
            onAdd={handleAddDevice}
            onRemove={handleRemoveDevice}
            saving={saving}
            builtIn={BUILT_IN_DEVICE_TYPES}
          />
        </div>
      )}

      {activeTab === 'expense' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Section
            title="Expense Categories"
            description="Options shown in Category dropdown for expenses and payments"
            items={expenseCategories}
            onAdd={handleAddExpenseCategory}
            onRemove={handleRemoveExpenseCategory}
            saving={saving}
          />
          <Section
            title="Payment Modes"
            description="Options shown in Payment Mode dropdown for expenses and payments"
            items={paymentModes}
            onAdd={handleAddPaymentMode}
            onRemove={handleRemovePaymentMode}
            saving={saving}
          />
          <Section
            title="Vendor & Payee Options"
            description="Options shown in Vendor and Payee dropdown when adding/editing an expense"
            items={vendorPayeeOptions}
            onAdd={handleAddVendorPayee}
            onRemove={handleRemoveVendorPayee}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
