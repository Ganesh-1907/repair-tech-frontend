import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowLeft, Save } from 'lucide-react';
import { api } from '../../services/apiClient';
import './PlansCustomers.css';

const COLLECTION = 'rentalCustomers';
const DEVICE_TYPES = ['Laptop', 'Desktop', 'Printer', 'CCTV', 'Server', 'Total Maintenance'];

const createBlankDevice = (type = 'Laptop') => {
  switch (type) {
    case 'Laptop':
      return {
        type: 'Laptop',
        brand: '',
        model: '',
        location: '',
        configurations: [{ name: '', specification: '' }],
      };
    case 'Desktop':
    case 'Server':
      return {
        type,
        cpu: { subType: '', brand: '', model: '', config: '', location: '' },
        monitor: { subType: '', brand: '', location: '' },
      };
    case 'Printer':
      return { type: 'Printer', subType: '', brand: '', model: '', inputField: '', location: '' };
    case 'CCTV':
      return { type: 'CCTV', subType: '', brand: '', model: '', specs: [''], location: '' };
    case 'Total Maintenance':
      return {
        type: 'Total Maintenance',
        subDeviceType: 'Laptop',
        subDeviceData: createBlankDevice('Laptop'),
      };
    default:
      return { type, brand: '', model: '', location: '' };
  }
};

const trimText = (value) => String(value || '').trim();

const joinParts = (parts) => parts.filter(Boolean).join(' | ');

const getDeviceBase = (device) => (
  device.type === 'Total Maintenance'
    ? { ...device.subDeviceData, type: device.subDeviceType || 'Laptop' }
    : device
);

const getDeviceSummary = (device) => {
  const base = getDeviceBase(device);
  if (base.type === 'Laptop') return `${base.brand || ''} ${base.model || ''}`.trim() || '';
  if (base.type === 'Desktop' || base.type === 'Server') return `${base.cpu?.brand || ''} ${base.cpu?.model || ''}`.trim() || '';
  if (base.type === 'Printer') return `${base.brand || ''} ${base.model || ''}`.trim() || '';
  if (base.type === 'CCTV') return `${base.brand || ''} ${base.model || ''}`.trim() || '';
  return '';
};

const getDeviceAssetType = (device) => {
  if (device.type === 'Total Maintenance') return device.subDeviceType || 'Laptop';
  return device.type || 'Device';
};

const getDeviceBrand = (device) => {
  const base = getDeviceBase(device);
  if (base.type === 'Desktop' || base.type === 'Server') return base.cpu?.brand || base.monitor?.brand || '';
  return base.brand || '';
};

const getDeviceModel = (device) => {
  const base = getDeviceBase(device);
  if (base.type === 'Desktop' || base.type === 'Server') return base.cpu?.model || '';
  return base.model || '';
};

const getDeviceLocation = (device) => {
  const base = getDeviceBase(device);
  if (base.type === 'Desktop' || base.type === 'Server') return base.cpu?.location || base.monitor?.location || '';
  return base.location || '';
};

const getDeviceSubType = (device) => {
  const base = getDeviceBase(device);
  if (base.type === 'Desktop' || base.type === 'Server') return base.cpu?.subType || base.monitor?.subType || '';
  return base.subType || '';
};

const getDeviceConfiguration = (device) => {
  const base = getDeviceBase(device);
  if (base.type === 'Laptop') {
    return (base.configurations || [])
      .map((row) => joinParts([row.name, row.specification]))
      .filter(Boolean)
      .join(' | ');
  }
  if (base.type === 'Desktop' || base.type === 'Server') {
    return joinParts([
      base.cpu?.subType && `CPU Type: ${base.cpu.subType}`,
      base.cpu?.brand && `CPU Brand: ${base.cpu.brand}`,
      base.cpu?.model && `CPU Model: ${base.cpu.model}`,
      base.cpu?.config && `CPU Config: ${base.cpu.config}`,
      base.monitor?.subType && `Monitor Type: ${base.monitor.subType}`,
      base.monitor?.brand && `Monitor Brand: ${base.monitor.brand}`,
    ]);
  }
  if (base.type === 'Printer') return joinParts([base.subType, base.inputField]);
  if (base.type === 'CCTV') return (base.specs || []).filter(Boolean).join(' | ');
  return '';
};

const buildRentalAssetPayloads = (devices, customer) => {
  const stamp = Date.now();
  const customerName = customer.companyName || customer.customerName || '';
  return devices.map((device, index) => {
    const id = `AST-${customer.id}-${stamp}-${index + 1}`;
    const assetType = getDeviceAssetType(device);
    const location = getDeviceLocation(device) || customer.address || '';
    const configuration = getDeviceConfiguration(device);
    return {
      id,
      assetId: id,
      customerId: customer.id,
      customerName,
      type: assetType,
      deviceType: assetType,
      brand: getDeviceBrand(device),
      model: getDeviceModel(device) || assetType,
      subType: getDeviceSubType(device),
      specs: configuration,
      configuration,
      configurations: configuration,
      customerLocation: location,
      location,
      quantity: 1,
      status: 'Registration Pending',
      installationStatus: 'Pending',
      deviceDetails: device,
      notes: device.type === 'Total Maintenance' ? `Total Maintenance - ${assetType}` : '',
    };
  });
};

const LaptopFields = ({ device, onChange }) => {
  const updateConfig = (idx, field, value) => {
    const configs = [...device.configurations];
    configs[idx] = { ...configs[idx], [field]: value };
    onChange('configurations', configs);
  };
  const addConfig = () => onChange('configurations', [...device.configurations, { name: '', specification: '' }]);
  const removeConfig = (idx) => {
    if (device.configurations.length === 1) return;
    onChange('configurations', device.configurations.filter((_, i) => i !== idx));
  };

  return (
    <div className="device-fields-section">
      <div className="device-fields-row">
        <div className="form-group">
          <label>Brand</label>
          <input className="form-input" value={device.brand} onChange={(e) => onChange('brand', e.target.value)} placeholder="e.g. Dell, HP, Lenovo" />
        </div>
        <div className="form-group">
          <label>Model</label>
          <input className="form-input" value={device.model} onChange={(e) => onChange('model', e.target.value)} placeholder="e.g. Latitude 5420" />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input className="form-input" value={device.location} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. Floor 2" />
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {device.configurations.map((conf, idx) => (
              <tr key={idx}>
                <td><input className="form-input" value={conf.name} onChange={(e) => updateConfig(idx, 'name', e.target.value)} placeholder="e.g. RAM" /></td>
                <td><input className="form-input" value={conf.specification} onChange={(e) => updateConfig(idx, 'specification', e.target.value)} placeholder="e.g. 8GB DDR4" /></td>
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
            <input className="form-input" value={device.cpu.subType} onChange={(e) => updateCpu('subType', e.target.value)} placeholder="e.g. Tower, Mini" />
          </div>
          <div className="form-group">
            <label>Brand</label>
            <input className="form-input" value={device.cpu.brand} onChange={(e) => updateCpu('brand', e.target.value)} placeholder="e.g. Dell" />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input className="form-input" value={device.cpu.model} onChange={(e) => updateCpu('model', e.target.value)} placeholder="e.g. OptiPlex 7000" />
          </div>
        </div>
        <div className="device-fields-row">
          <div className="form-group">
            <label>Configuration</label>
            <input className="form-input" value={device.cpu.config} onChange={(e) => updateCpu('config', e.target.value)} placeholder="e.g. i5, 16GB, 512GB SSD" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" value={device.cpu.location} onChange={(e) => updateCpu('location', e.target.value)} placeholder="e.g. Finance Dept" />
          </div>
          <div className="form-group" />
        </div>
      </div>
      <div className="desktop-subsection" style={{ marginTop: '20px' }}>
        <div className="subsection-title">Monitor</div>
        <div className="device-fields-row">
          <div className="form-group">
            <label>Type</label>
            <input className="form-input" value={device.monitor.subType} onChange={(e) => updateMonitor('subType', e.target.value)} placeholder="e.g. LED, IPS" />
          </div>
          <div className="form-group">
            <label>Brand</label>
            <input className="form-input" value={device.monitor.brand} onChange={(e) => updateMonitor('brand', e.target.value)} placeholder="e.g. Samsung" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" value={device.monitor.location} onChange={(e) => updateMonitor('location', e.target.value)} placeholder="e.g. Floor 3" />
          </div>
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
        <input className="form-input" value={device.subType} onChange={(e) => onChange('subType', e.target.value)} placeholder="e.g. Laser, Inkjet" />
      </div>
      <div className="form-group">
        <label>Brand</label>
        <input className="form-input" value={device.brand} onChange={(e) => onChange('brand', e.target.value)} placeholder="e.g. HP, Canon" />
      </div>
      <div className="form-group">
        <label>Model</label>
        <input className="form-input" value={device.model} onChange={(e) => onChange('model', e.target.value)} placeholder="e.g. LaserJet Pro" />
      </div>
    </div>
    <div className="device-fields-row">
      <div className="form-group">
        <label>Input Field</label>
        <input className="form-input" value={device.inputField} onChange={(e) => onChange('inputField', e.target.value)} placeholder="e.g. A4, Legal" />
      </div>
      <div className="form-group">
        <label>Location</label>
        <input className="form-input" value={device.location} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. Reception" />
      </div>
      <div className="form-group" />
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
          <input className="form-input" value={device.subType} onChange={(e) => onChange('subType', e.target.value)} placeholder="e.g. IP, Analog, PTZ" />
        </div>
        <div className="form-group">
          <label>Brand</label>
          <input className="form-input" value={device.brand} onChange={(e) => onChange('brand', e.target.value)} placeholder="e.g. Hikvision, Dahua" />
        </div>
        <div className="form-group">
          <label>Model</label>
          <input className="form-input" value={device.model} onChange={(e) => onChange('model', e.target.value)} placeholder="Model number" />
        </div>
      </div>
      <div className="device-fields-row">
        <div className="form-group">
          <label>Location</label>
          <input className="form-input" value={device.location} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. Main Gate" />
        </div>
        <div className="form-group" />
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
            <input className="form-input" value={spec} onChange={(e) => updateSpec(idx, e.target.value)} placeholder="e.g. 4MP, Night Vision, IR 30m" />
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
        <select className="form-select" value={sub} onChange={(e) => handleSubTypeChange(e.target.value)}>
          {DEVICE_TYPES.filter((type) => type !== 'Total Maintenance').map((type) => <option key={type}>{type}</option>)}
        </select>
      </div>
      {renderSubFields()}
    </div>
  );
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
        <div className="accordion-actions" onClick={(e) => e.stopPropagation()}>
          <select
            className="form-select accordion-type-select"
            value={device.type}
            onChange={(e) => onChange('type', e.target.value)}
            title="Change device type"
          >
            {DEVICE_TYPES.map((type) => <option key={type}>{type}</option>)}
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

const RentalNewCustomerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('id');

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [openDevices, setOpenDevices] = useState(new Set([0]));

  const [form, setForm] = useState({
    companyName: '',
    customerType: 'Corporate',
    gstNumber: '',
    primaryContact: { name: '', mobile: '', email: '' },
    secondaryContact: { name: '', mobile: '', email: '' },
    registeredAddress: '',
    billingAddress: '',
    notes: '',
    devices: [createBlankDevice('Laptop')],
  });

  useEffect(() => {
    if (!editId) return;
    const load = async () => {
      try {
        const existing = await api.get(COLLECTION, editId);
        if (existing) {
          setForm({
            companyName: existing.companyName || existing.customerName || '',
            customerType: existing.customerType || 'Corporate',
            gstNumber: existing.gstNumber || '',
            primaryContact: existing.primaryContact || {
              name: existing.authorizedPerson1 || '',
              mobile: existing.contactNumber || '',
              email: existing.email || '',
            },
            secondaryContact: existing.secondaryContact || {
              name: existing.authorizedPerson2 || '',
              mobile: '',
              email: '',
            },
            registeredAddress: existing.address || '',
            billingAddress: existing.billingAddress || '',
            notes: existing.notes || '',
            devices: Array.isArray(existing.devices) && existing.devices.length > 0
              ? existing.devices
              : [createBlankDevice('Laptop')],
          });
          if (existing.devices) {
            setOpenDevices(new Set(existing.devices.map((_, i) => i)));
          }
        }
      } catch (err) {
        console.error('Failed to load rental customer:', err);
      }
    };
    load();
  }, [editId]);

  const setContact = (type, field, value) => {
    setForm((current) => ({ ...current, [type]: { ...current[type], [field]: value } }));
  };

  const addDevice = () => {
    const newIndex = form.devices.length;
    setForm((current) => ({ ...current, devices: [...current.devices, createBlankDevice('Laptop')] }));
    setOpenDevices((current) => new Set([...current, newIndex]));
  };

  const updateDevice = (index, updated) => {
    setForm((current) => {
      const devices = [...current.devices];
      devices[index] = updated;
      return { ...current, devices };
    });
  };

  const removeDevice = (index) => {
    setForm((current) => ({ ...current, devices: current.devices.filter((_, i) => i !== index) }));
    setOpenDevices((current) => {
      const next = new Set();
      current.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const toggleDevice = (index) => {
    setOpenDevices((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.companyName.trim()) nextErrors.companyName = 'Company / customer name is required';
    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const registeredAddress = trimText(form.registeredAddress);
      const billingAddress = trimText(form.billingAddress) || registeredAddress;
      const primaryName = trimText(form.primaryContact.name);
      const primaryMobile = trimText(form.primaryContact.mobile);
      const primaryEmail = trimText(form.primaryContact.email);
      const companyName = trimText(form.companyName);
      const locations = registeredAddress
        ? [{
          id: `LOC-${Date.now()}-0`,
          locationName: 'Primary Location',
          address: registeredAddress,
          contactPerson: primaryName,
          phone: primaryMobile,
          email: primaryEmail,
          gstBranch: trimText(form.gstNumber),
        }]
        : [];

      const customerPayload = {
        customerType: form.customerType,
        companyName,
        customerName: primaryName || companyName,
        authorizedPerson1: primaryName,
        authorizedPerson2: trimText(form.secondaryContact.name),
        gstNumber: trimText(form.gstNumber),
        address: registeredAddress,
        registeredAddress,
        primaryAddress: registeredAddress,
        billingAddress,
        contactNumber: primaryMobile,
        email: primaryEmail,
        primaryContact: {
          name: primaryName,
          mobile: primaryMobile,
          email: primaryEmail,
        },
        secondaryContact: {
          name: trimText(form.secondaryContact.name),
          mobile: trimText(form.secondaryContact.mobile),
          email: trimText(form.secondaryContact.email),
        },
        notes: trimText(form.notes),
        status: 'Active',
        locations,
        devices: form.devices,
      };

      if (editId) {
        await api.update(COLLECTION, editId, customerPayload);
      } else {
        const savedCustomer = await api.create(COLLECTION, customerPayload);
        const assetPayloads = buildRentalAssetPayloads(form.devices, savedCustomer);
        await Promise.all(assetPayloads.map((asset) => api.create('rentalAssets', asset)));
      }
      navigate('/admin/rental/customers');
    } catch (err) {
      console.error('Failed to save rental customer:', err);
      setErrors({ save: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="amc-new-page">
      <div className="amc-new-page-header">
        <button className="back-button" onClick={() => navigate('/admin/rental/customers')}>
          <ArrowLeft size={18} /> Back to Rental Customers
        </button>
        <div className="amc-new-page-title">
          <h1>New Rental Customer</h1>
          <p>Register customer details and an AMC-style rental device registry.</p>
        </div>
        <div className="amc-new-page-actions">
          <button className="secondary-button" onClick={() => navigate('/admin/rental/customers')}>Cancel</button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>

      {errors.save && <div className="form-error-banner">{errors.save}</div>}

      <div className="amc-new-page-body">
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
                  onChange={(e) => {
                    setForm((current) => ({ ...current, companyName: e.target.value }));
                    setErrors((current) => ({ ...current, companyName: undefined }));
                  }}
                  placeholder="Enter company or customer name"
                />
                {errors.companyName && <span className="field-error">{errors.companyName}</span>}
              </div>
              <div className="form-group">
                <label>Customer Type</label>
                <select className="form-select" value={form.customerType} onChange={(e) => setForm((current) => ({ ...current, customerType: e.target.value }))}>
                  <option>Corporate</option>
                  <option>Individual</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>GST Number</label>
                <input
                  className="form-input"
                  value={form.gstNumber}
                  onChange={(e) => setForm((current) => ({ ...current, gstNumber: e.target.value }))}
                  placeholder="GSTIN (optional)"
                />
              </div>
              <div className="form-group" />
            </div>

            <div className="contact-section">
              <div className="contact-section-label">Primary Contact</div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" value={form.primaryContact.name} onChange={(e) => setContact('primaryContact', 'name', e.target.value)} placeholder="Contact person name" />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input className="form-input" value={form.primaryContact.mobile} onChange={(e) => setContact('primaryContact', 'mobile', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" value={form.primaryContact.email} onChange={(e) => setContact('primaryContact', 'email', e.target.value)} placeholder="email@company.com" />
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
                  <input className="form-input" value={form.secondaryContact.name} onChange={(e) => setContact('secondaryContact', 'name', e.target.value)} placeholder="Contact person name" />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input className="form-input" value={form.secondaryContact.mobile} onChange={(e) => setContact('secondaryContact', 'mobile', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" value={form.secondaryContact.email} onChange={(e) => setContact('secondaryContact', 'email', e.target.value)} placeholder="email@company.com" />
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Registered Address</label>
                <textarea
                  className="form-input"
                  style={{ height: '72px', paddingTop: '10px', resize: 'vertical' }}
                  value={form.registeredAddress}
                  onChange={(e) => setForm((current) => ({ ...current, registeredAddress: e.target.value }))}
                  placeholder="Full company registered address"
                />
              </div>
              <div className="form-group">
                <label>Billing Address <span className="optional-tag">(if different)</span></label>
                <textarea
                  className="form-input"
                  style={{ height: '72px', paddingTop: '10px', resize: 'vertical' }}
                  value={form.billingAddress}
                  onChange={(e) => setForm((current) => ({ ...current, billingAddress: e.target.value }))}
                  placeholder="Leave blank to use registered address"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes <span className="optional-tag">(Optional)</span></label>
              <textarea
                className="form-input"
                style={{ height: '60px', paddingTop: '10px', resize: 'vertical' }}
                value={form.notes}
                onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                placeholder="Any additional notes about this customer"
              />
            </div>
          </div>
        </div>

        <div className="amc-form-card card-devices">
          <div className="amc-form-card-header device-registry-header">
            <h2 className="amc-form-section-title">2. Device Registry</h2>
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
          <button className="secondary-button" onClick={() => navigate('/admin/rental/customers')}>Cancel</button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentalNewCustomerPage;
