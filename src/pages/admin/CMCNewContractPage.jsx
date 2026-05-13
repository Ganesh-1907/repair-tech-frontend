import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowLeft, Save } from 'lucide-react';
import { api } from '../../services/apiClient';
import { normalizeContractDevices } from './contractDeviceFormUtils';
import './PlansCustomers.css';

const DEVICE_TYPES = ['Laptop', 'Desktop', 'Printer', 'CCTV', 'Server', 'UPS', 'Scanner', 'Total Maintenance'];

const createBlankDevice = (type = 'Laptop') => {
  switch (type) {
    case 'Laptop':
      return {
        type: 'Laptop',
        brand: '',
        model: '',
        location: '',
        configurations: [{ name: '', specification: '', serialNumber: '' }],
      };
    case 'Desktop':
    case 'Server':
      return {
        type,
        cpu: { subType: '', brand: '', model: '', config: '', location: '' },
        monitor: { subType: '', brand: '', serialNumber: '', location: '' },
      };
    case 'Printer':
      return { type: 'Printer', subType: '', brand: '', model: '', serialNumber: '', inputField: '', location: '' };
    case 'CCTV':
      return { type: 'CCTV', subType: '', brand: '', model: '', serialNumber: '', specs: [''], location: '' };
    case 'Total Maintenance':
      return {
        type: 'Total Maintenance',
        subDeviceType: 'Laptop',
        subDeviceData: createBlankDevice('Laptop'),
      };
    default:
      return { type, brand: '', model: '', serialNumber: '', location: '' };
  }
};

const generateContractId = (contracts) => {
  const year = new Date().getFullYear();
  const prefix = `CMC-${year}-`;
  const serials = contracts
    .filter(c => (c.contractId || c.id || '').startsWith(prefix))
    .map(c => {
      const parts = (c.contractId || c.id || '').split('-');
      return parseInt(parts[parts.length - 1]);
    })
    .filter(n => !isNaN(n));
  const next = serials.length > 0 ? Math.max(...serials) + 1 : 1001;
  return `${prefix}${next}`;
};

// ─── Device Field Sub-components ────────────────────────────────────────────

const LaptopFields = ({ device, onChange }) => {
  const updateConfig = (idx, field, value) => {
    const configs = [...device.configurations];
    configs[idx] = { ...configs[idx], [field]: value };
    onChange('configurations', configs);
  };
  const addConfig = () => onChange('configurations', [...device.configurations, { name: '', specification: '', serialNumber: '' }]);
  const removeConfig = (idx) => {
    if (device.configurations.length === 1) return;
    onChange('configurations', device.configurations.filter((_, i) => i !== idx));
  };

  return (
    <div className="device-fields-section">
      <div className="device-fields-row">
        <div className="form-group">
          <label>Brand</label>
          <input className="form-input" value={device.brand} onChange={e => onChange('brand', e.target.value)} placeholder="e.g. Dell, HP, Lenovo" />
        </div>
        <div className="form-group">
          <label>Model</label>
          <input className="form-input" value={device.model} onChange={e => onChange('model', e.target.value)} placeholder="e.g. Latitude 5420" />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input className="form-input" value={device.location} onChange={e => onChange('location', e.target.value)} placeholder="e.g. Floor 2" />
        </div>
      </div>
      <div className="config-table-section">
        <div className="config-table-header">
          <span className="config-table-title">Configuration</span>
        </div>
        <table className="config-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specification</th>
              <th>Serial Number</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {device.configurations.map((conf, idx) => (
              <tr key={idx}>
                <td><input className="form-input" value={conf.name} onChange={e => updateConfig(idx, 'name', e.target.value)} placeholder="e.g. RAM" /></td>
                <td><input className="form-input" value={conf.specification} onChange={e => updateConfig(idx, 'specification', e.target.value)} placeholder="e.g. 8GB DDR4" /></td>
                <td><input className="form-input" value={conf.serialNumber} onChange={e => updateConfig(idx, 'serialNumber', e.target.value)} placeholder="S/N" /></td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="device-action-button delete" onClick={() => removeConfig(idx)} title="Remove row"><Trash2 size={14} /></button>
                    {idx === device.configurations.length - 1 && (
                      <button className="device-action-button add" onClick={addConfig} title="Add row"><Plus size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DesktopServerFields = ({ device, onChange }) => {
  const updateCpu = (field, value) => onChange('cpu', { ...device.cpu, [field]: value });
  const updateMonitor = (field, value) => onChange('monitor', { ...device.monitor, [field]: value });
  return (
    <div className="device-fields-section">
      <div className="desktop-subsection">
        <div className="subsection-title">CPU</div>
        <div className="device-fields-row">
          <div className="form-group">
            <label>Type</label>
            <input className="form-input" value={device.cpu.subType} onChange={e => updateCpu('subType', e.target.value)} placeholder="e.g. Tower, Mini" />
          </div>
          <div className="form-group">
            <label>Brand</label>
            <input className="form-input" value={device.cpu.brand} onChange={e => updateCpu('brand', e.target.value)} placeholder="e.g. Dell" />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input className="form-input" value={device.cpu.model} onChange={e => updateCpu('model', e.target.value)} placeholder="e.g. OptiPlex 7000" />
          </div>
        </div>
        <div className="device-fields-row">
          <div className="form-group">
            <label>Configuration</label>
            <input className="form-input" value={device.cpu.config} onChange={e => updateCpu('config', e.target.value)} placeholder="e.g. i5, 16GB, 512GB SSD" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" value={device.cpu.location} onChange={e => updateCpu('location', e.target.value)} placeholder="e.g. Finance Dept" />
          </div>
          <div className="form-group" />
        </div>
      </div>
      <div className="desktop-subsection" style={{ marginTop: '20px' }}>
        <div className="subsection-title">Monitor</div>
        <div className="device-fields-row">
          <div className="form-group">
            <label>Type</label>
            <input className="form-input" value={device.monitor.subType} onChange={e => updateMonitor('subType', e.target.value)} placeholder="e.g. LED, IPS" />
          </div>
          <div className="form-group">
            <label>Brand</label>
            <input className="form-input" value={device.monitor.brand} onChange={e => updateMonitor('brand', e.target.value)} placeholder="e.g. Samsung" />
          </div>
          <div className="form-group">
            <label>Serial Number</label>
            <input className="form-input" value={device.monitor.serialNumber} onChange={e => updateMonitor('serialNumber', e.target.value)} placeholder="S/N" />
          </div>
        </div>
        <div className="device-fields-row">
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" value={device.monitor.location} onChange={e => updateMonitor('location', e.target.value)} placeholder="e.g. Floor 3" />
          </div>
          <div className="form-group" />
          <div className="form-group" />
        </div>
      </div>
    </div>
  );
};

const PrinterFields = ({ device, onChange }) => (
  <div className="device-fields-section">
    <div className="device-fields-row">
      <div className="form-group">
        <label>Type</label>
        <input className="form-input" value={device.subType} onChange={e => onChange('subType', e.target.value)} placeholder="e.g. Laser, Inkjet" />
      </div>
      <div className="form-group">
        <label>Brand</label>
        <input className="form-input" value={device.brand} onChange={e => onChange('brand', e.target.value)} placeholder="e.g. HP, Canon" />
      </div>
      <div className="form-group">
        <label>Model</label>
        <input className="form-input" value={device.model} onChange={e => onChange('model', e.target.value)} placeholder="e.g. LaserJet Pro" />
      </div>
    </div>
    <div className="device-fields-row">
      <div className="form-group">
        <label>Serial Number</label>
        <input className="form-input" value={device.serialNumber} onChange={e => onChange('serialNumber', e.target.value)} placeholder="S/N" />
      </div>
      <div className="form-group">
        <label>Input Field</label>
        <input className="form-input" value={device.inputField} onChange={e => onChange('inputField', e.target.value)} placeholder="e.g. A4, Legal" />
      </div>
      <div className="form-group">
        <label>Location</label>
        <input className="form-input" value={device.location} onChange={e => onChange('location', e.target.value)} placeholder="e.g. Reception" />
      </div>
    </div>
  </div>
);

const CCTVFields = ({ device, onChange }) => {
  const addSpec = () => onChange('specs', [...device.specs, '']);
  const updateSpec = (idx, value) => {
    const specs = [...device.specs];
    specs[idx] = value;
    onChange('specs', specs);
  };
  const removeSpec = (idx) => {
    if (device.specs.length === 1) return;
    onChange('specs', device.specs.filter((_, i) => i !== idx));
  };
  return (
    <div className="device-fields-section">
      <div className="device-fields-row">
        <div className="form-group">
          <label>Type</label>
          <input className="form-input" value={device.subType} onChange={e => onChange('subType', e.target.value)} placeholder="e.g. IP, Analog, PTZ" />
        </div>
        <div className="form-group">
          <label>Brand</label>
          <input className="form-input" value={device.brand} onChange={e => onChange('brand', e.target.value)} placeholder="e.g. Hikvision, Dahua" />
        </div>
        <div className="form-group">
          <label>Model</label>
          <input className="form-input" value={device.model} onChange={e => onChange('model', e.target.value)} placeholder="Model number" />
        </div>
      </div>
      <div className="device-fields-row">
        <div className="form-group">
          <label>Serial Number</label>
          <input className="form-input" value={device.serialNumber} onChange={e => onChange('serialNumber', e.target.value)} placeholder="S/N" />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input className="form-input" value={device.location} onChange={e => onChange('location', e.target.value)} placeholder="e.g. Main Gate" />
        </div>
        <div className="form-group" />
      </div>
      <div className="specs-section">
        <div className="specs-header">
          <span className="specs-title">Specifications</span>
          <button className="secondary-button" style={{ height: '30px', fontSize: '12px', padding: '0 12px' }} onClick={addSpec}>
            <Plus size={12} /> Add Spec
          </button>
        </div>
        {device.specs.map((spec, idx) => (
          <div key={idx} className="spec-row">
            <input className="form-input" value={spec} onChange={e => updateSpec(idx, e.target.value)} placeholder="e.g. 4MP, Night Vision, IR 30m" />
            <button className="device-action-button delete" onClick={() => removeSpec(idx)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TotalMaintenanceFields = ({ device, onReplace }) => {
  const sub = device.subDeviceType || 'Laptop';
  const subData = device.subDeviceData || createBlankDevice(sub);

  const handleSubTypeChange = (newType) => {
    onReplace({ ...device, subDeviceType: newType, subDeviceData: createBlankDevice(newType) });
  };

  const handleSubFieldChange = (field, value) => {
    onReplace({ ...device, subDeviceData: { ...subData, [field]: value } });
  };

  const renderSubFields = () => {
    switch (sub) {
      case 'Laptop': return <LaptopFields device={subData} onChange={handleSubFieldChange} />;
      case 'Desktop':
      case 'Server': return <DesktopServerFields device={subData} onChange={handleSubFieldChange} />;
      case 'Printer': return <PrinterFields device={subData} onChange={handleSubFieldChange} />;
      case 'CCTV': return <CCTVFields device={subData} onChange={handleSubFieldChange} />;
      default: return null;
    }
  };

  return (
    <div className="device-fields-section">
      <div className="form-group" style={{ marginBottom: '20px', maxWidth: '260px' }}>
        <label>Device Sub-Type</label>
        <select className="form-select" value={sub} onChange={e => handleSubTypeChange(e.target.value)}>
          {DEVICE_TYPES.filter(t => t !== 'Total Maintenance').map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      {renderSubFields()}
    </div>
  );
};

// ─── Device Accordion ────────────────────────────────────────────────────────

const getDeviceSummary = (d) => {
  if (d.type === 'Laptop') return `${d.brand || ''} ${d.model || ''}`.trim() || '';
  if (d.type === 'Desktop' || d.type === 'Server') return `${d.cpu?.brand || ''} ${d.cpu?.model || ''}`.trim() || '';
  if (d.type === 'Printer') return `${d.brand || ''} ${d.model || ''}`.trim() || '';
  if (d.type === 'CCTV') return `${d.brand || ''} ${d.model || ''}`.trim() || '';
  if (d.type === 'Total Maintenance') return `(${d.subDeviceType || 'Laptop'})`;
  return '';
};

const DeviceAccordion = ({ device, index, isOpen, onToggle, onUpdate, onRemove, onAdd }) => {
  const onChange = (field, value) => {
    if (field === 'type') {
      onUpdate(index, createBlankDevice(value));
    } else {
      onUpdate(index, { ...device, [field]: value });
    }
  };

  const renderFields = () => {
    switch (device.type) {
      case 'Laptop': return <LaptopFields device={device} onChange={onChange} />;
      case 'Desktop':
      case 'Server': return <DesktopServerFields device={device} onChange={onChange} />;
      case 'Printer': return <PrinterFields device={device} onChange={onChange} />;
      case 'CCTV': return <CCTVFields device={device} onChange={onChange} />;
      case 'Total Maintenance': return <TotalMaintenanceFields device={device} onReplace={(updated) => onUpdate(index, updated)} />;
      default: return null;
    }
  };

  const summary = getDeviceSummary(device);

  return (
    <div className={`device-accordion${isOpen ? ' open' : ''}`}>
      <div className="accordion-header" onClick={onToggle}>
        <div className="accordion-title-area">
          <span className="accordion-device-index">Device {index + 1}</span>
          <span className="accordion-device-type-badge">{device.type}</span>
          {summary && <span className="accordion-device-summary">{summary}</span>}
        </div>
        <div className="accordion-actions" onClick={e => e.stopPropagation()}>
          <select
            className="form-select accordion-type-select"
            value={device.type}
            onChange={e => onChange('type', e.target.value)}
            title="Change device type"
          >
            {DEVICE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <button className="accordion-remove-btn" onClick={() => onRemove(index)}>
            <Trash2 size={13} /> Remove
          </button>
          <button className="accordion-add-device-btn" onClick={onAdd} title="Add another device">
            <Plus size={14} /> Add Device
          </button>
          <span className="accordion-chevron">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="accordion-body">
          {renderFields()}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const CMCNewContractPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('id');

  const [cmcPlans, setCmcPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [openDevices, setOpenDevices] = useState(new Set([0]));

  const [form, setForm] = useState({
    companyName: '',
    gstNumber: '',
    primaryContact: { name: '', mobile: '', email: '' },
    secondaryContact: { name: '', mobile: '', email: '' },
    registeredAddress: '',
    contractId: '',
    cmcPlan: '',
    expiryDate: '',
    status: 'Active',
    devices: [createBlankDevice('Laptop')],
  });

  useEffect(() => {
    const load = async () => {
      try {
        if (editId?.startsWith('AMC-')) {
          navigate(`/admin/amc/new?id=${editId}`, { replace: true });
          return;
        }

        const [plansRes, contractsRes] = await Promise.allSettled([
          api.list('cmcPlans'),
          api.list('cmcContracts'),
        ]);
        const plans = plansRes.status === 'fulfilled' ? plansRes.value : [];
        const contracts = contractsRes.status === 'fulfilled' ? contractsRes.value : [];
        setCmcPlans(Array.isArray(plans) ? plans : []);

        if (editId) {
          const existing = await api.get('cmcContracts', editId);
          if (existing) {
            if (existing.contractType === 'AMC') {
              navigate(`/admin/amc/new?id=${editId}`, { replace: true });
              return;
            }
            const details = existing.cmcDetails || {};
            const devices = normalizeContractDevices(details.devices || existing.devices, createBlankDevice, DEVICE_TYPES);
            setForm({
              companyName: existing.customerName || existing.name || '',
              gstNumber: details.gstin || details.gst || existing.gstin || existing.gst || '',
              primaryContact: {
                name: details.authorizedPerson1 || details.contactPerson || existing.authorizedPerson1 || existing.contactPerson || '',
                mobile: details.primaryContact?.mobile || details.contact || details.contactPhone || existing.contact || existing.contactPhone || '',
                email: details.primaryContact?.email || details.email || existing.email || '',
              },
              secondaryContact: {
                name: details.authorizedPerson2 || existing.authorizedPerson2 || '',
                mobile: details.secondaryContact?.mobile || existing.secondaryContact?.mobile || '',
                email: details.secondaryContact?.email || existing.secondaryContact?.email || '',
              },
              registeredAddress: details.address || existing.address || '',
              contractId: existing.id || existing.contractId || '',
              cmcPlan: details.planName || existing.plan || '',
              expiryDate: (existing.endDate || existing.expiryDate || existing.expiry || '').split('T')[0],
              status: existing.status || 'Active',
              devices,
            });
            setOpenDevices(new Set(devices.map((_, i) => i)));
          }
        } else {
          setForm(f => ({ ...f, contractId: generateContractId(Array.isArray(contracts) ? contracts : []) }));
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    load();
  }, [editId, navigate]);

  const setContact = (type, field, value) => {
    setForm(f => ({ ...f, [type]: { ...f[type], [field]: value } }));
  };

  const addDevice = () => {
    const newIndex = form.devices.length;
    setForm(f => ({ ...f, devices: [...f.devices, createBlankDevice('Laptop')] }));
    setOpenDevices(prev => new Set([...prev, newIndex]));
  };

  const updateDevice = (index, updated) => {
    setForm(f => {
      const devices = [...f.devices];
      devices[index] = updated;
      return { ...f, devices };
    });
  };

  const removeDevice = (index) => {
    setForm(f => ({ ...f, devices: f.devices.filter((_, i) => i !== index) }));
    setOpenDevices(prev => {
      const next = new Set();
      prev.forEach(i => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const toggleDevice = (index) => {
    setOpenDevices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    if (!form.cmcPlan) errs.cmcPlan = 'Select a CMC plan';
    if (!form.expiryDate) errs.expiryDate = 'Expiry date is required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        id: form.contractId,
        contractType: 'CMC',
        customerId: form.companyName.replace(/\s+/g, '-').toLowerCase(),
        customerName: form.companyName,
        endDate: form.expiryDate,
        status: form.status,
        cmcDetails: {
          planName: form.cmcPlan,
          gstin: form.gstNumber,
          address: form.registeredAddress,
          authorizedPerson1: form.primaryContact.name,
          authorizedPerson2: form.secondaryContact.name,
          contact: form.primaryContact.mobile || form.primaryContact.email,
          primaryContact: form.primaryContact,
          secondaryContact: form.secondaryContact,
          devices: form.devices,
          locations: [],
        },
      };
      if (editId) {
        await api.update('cmcContracts', editId, payload);
      } else {
        await api.create('cmcContracts', payload);
      }
      navigate('/admin/cmc/inventory');
    } catch (err) {
      console.error('Failed to save CMC contract:', err);
      setErrors({ save: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="amc-new-page">
      <div className="amc-new-page-header">
        <button className="back-button" onClick={() => navigate('/admin/cmc/inventory')}>
          <ArrowLeft size={18} /> Back to CMC Inventory
        </button>
        <div className="amc-new-page-title">
          <h1>{editId ? 'Edit CMC Enrollment' : 'New CMC Enrollment'}</h1>
          <p>Register a new customer, contract details, and device registry.</p>
        </div>
        <div className="amc-new-page-actions">
          <button className="secondary-button" onClick={() => navigate('/admin/cmc/inventory')}>Cancel</button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : editId ? 'Update Enrollment' : 'Save Enrollment'}
          </button>
        </div>
      </div>

      {errors.save && <div className="form-error-banner">{errors.save}</div>}

      <div className="amc-new-page-body">
        {/* Section 1: Customer / Company */}
        <div className="amc-form-card card-customer">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title">1. Customer / Company</h2>
          </div>
          <div className="amc-form-card-body">
            <div className="form-row-2">
              <div className={`form-group${errors.companyName ? ' has-error' : ''}`}>
                <label>Company Name / Customer Name *</label>
                <input
                  className="form-input"
                  value={form.companyName}
                  onChange={e => { setForm(f => ({ ...f, companyName: e.target.value })); setErrors(p => ({ ...p, companyName: undefined })); }}
                  placeholder="Enter company or customer name"
                />
                {errors.companyName && <span className="field-error">{errors.companyName}</span>}
              </div>
              <div className="form-group">
                <label>GST Number</label>
                <input className="form-input" value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))} placeholder="GSTIN (optional)" />
              </div>
            </div>

            <div className="contact-section">
              <div className="contact-section-label">Primary Contact</div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" value={form.primaryContact.name} onChange={e => setContact('primaryContact', 'name', e.target.value)} placeholder="Contact person name" />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input className="form-input" value={form.primaryContact.mobile} onChange={e => setContact('primaryContact', 'mobile', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" value={form.primaryContact.email} onChange={e => setContact('primaryContact', 'email', e.target.value)} placeholder="email@company.com" />
                </div>
              </div>
            </div>

            <div className="contact-section secondary-contact-section">
              <div className="contact-section-label">
                Secondary Contact <span className="optional-tag">(Optional)</span>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" value={form.secondaryContact.name} onChange={e => setContact('secondaryContact', 'name', e.target.value)} placeholder="Contact person name" />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input className="form-input" value={form.secondaryContact.mobile} onChange={e => setContact('secondaryContact', 'mobile', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" value={form.secondaryContact.email} onChange={e => setContact('secondaryContact', 'email', e.target.value)} placeholder="email@company.com" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Registered Address</label>
              <textarea
                className="form-input"
                style={{ height: '72px', paddingTop: '10px', resize: 'vertical' }}
                value={form.registeredAddress}
                onChange={e => setForm(f => ({ ...f, registeredAddress: e.target.value }))}
                placeholder="Full company registered address"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contract Details */}
        <div className="amc-form-card card-contract">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title">2. Contract Details</h2>
          </div>
          <div className="amc-form-card-body">
            <div className="form-row-2">
              <div className="form-group">
                <label>CMC ID (Auto-generated)</label>
                <input
                  className="form-input"
                  value={form.contractId}
                  readOnly
                  style={{ background: 'var(--slate-50)', color: 'var(--text-muted)', cursor: 'default' }}
                />
              </div>
              <div className={`form-group${errors.cmcPlan ? ' has-error' : ''}`}>
                <label>CMC Plan *</label>
                <select
                  className="form-select"
                  value={form.cmcPlan}
                  onChange={e => { setForm(f => ({ ...f, cmcPlan: e.target.value })); setErrors(p => ({ ...p, cmcPlan: undefined })); }}
                >
                  <option value="">— Select Plan —</option>
                  {cmcPlans.filter(p => p.status !== 'Inactive').map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
                {errors.cmcPlan && <span className="field-error">{errors.cmcPlan}</span>}
              </div>
            </div>
            <div className="form-row-2">
              <div className={`form-group${errors.expiryDate ? ' has-error' : ''}`}>
                <label>Expiry Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.expiryDate}
                  onChange={e => { setForm(f => ({ ...f, expiryDate: e.target.value })); setErrors(p => ({ ...p, expiryDate: undefined })); }}
                />
                {errors.expiryDate && <span className="field-error">{errors.expiryDate}</span>}
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option>Active</option>
                  <option>Expired</option>
                  <option>Pending Approval</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Device Registry */}
        <div className="amc-form-card card-devices">
          <div className="amc-form-card-header device-registry-header">
            <h2 className="amc-form-section-title">3. Device Registry</h2>
            <button className="primary-button" style={{ height: '36px', fontSize: '13px' }} onClick={addDevice}>
              <Plus size={16} /> Add Device
            </button>
          </div>
          <div className="amc-form-card-body">
            {form.devices.length === 0 && (
              <div className="empty-devices-hint">
                No devices added. Click "Add Device" to register the first device.
              </div>
            )}
            <div className="device-accordion-list">
              {form.devices.map((device, index) => (
                <DeviceAccordion
                  key={index}
                  device={device}
                  index={index}
                  isOpen={openDevices.has(index)}
                  onToggle={() => toggleDevice(index)}
                  onUpdate={updateDevice}
                  onRemove={removeDevice}
                  onAdd={addDevice}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="amc-form-footer">
          <button className="secondary-button" onClick={() => navigate('/admin/cmc/inventory')}>Cancel</button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : editId ? 'Update Enrollment' : 'Save Enrollment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CMCNewContractPage;
