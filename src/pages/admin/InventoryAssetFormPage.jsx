import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Plus, Save, Trash2 } from 'lucide-react';
import { assetManagementService } from '../../services/assetManagementService';
import { useLeadSettings } from '../../hooks/useLeadSettings';
import { useToast } from '../../context/ToastContext';
import './PlansCustomers.css';
import '../InventoryPremiumStyles.css';

const ASSET_STATUSES = ['Active', 'In repair', 'Replaced', 'Idle'];

const normalizeAssetStatus = (status) => {
  if (status === 'Available' || status === 'Rented' || status === 'Sold') return 'Active';
  if (status === 'Under Repair') return 'In repair';
  return status || 'Idle';
};

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
    default:
      return { type, brand: '', model: '', location: '' };
  }
};

const trimText = (value) => String(value || '').trim();
const joinParts = (parts) => parts.filter(Boolean).join(' | ');

const splitConfigText = (value) => {
  const rows = String(value || '')
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, ...rest] = entry.split(':');
      return rest.length
        ? { name: trimText(name), specification: trimText(rest.join(':')) }
        : { name: 'Configuration', specification: entry };
    });
  return rows.length ? rows : [{ name: '', specification: '' }];
};

const getDeviceBrand = (device) => {
  if (device.type === 'Desktop' || device.type === 'Server') return device.cpu?.brand || device.monitor?.brand || '';
  return device.brand || '';
};

const getDeviceModel = (device) => {
  if (device.type === 'Desktop' || device.type === 'Server') return device.cpu?.model || '';
  return device.model || '';
};

const getDeviceLocation = (device) => {
  if (device.type === 'Desktop' || device.type === 'Server') return device.cpu?.location || device.monitor?.location || '';
  return device.location || '';
};

const getDeviceSubType = (device) => {
  if (device.type === 'Desktop' || device.type === 'Server') return device.cpu?.subType || device.monitor?.subType || '';
  return device.subType || '';
};

const getDeviceConfiguration = (device) => {
  if (device.type === 'Laptop') {
    return (device.configurations || [])
      .map((row) => joinParts([row.name, row.specification]))
      .filter(Boolean)
      .join(' | ');
  }
  if (device.type === 'Desktop' || device.type === 'Server') {
    return joinParts([
      device.cpu?.subType && `CPU Type: ${device.cpu.subType}`,
      device.cpu?.brand && `CPU Brand: ${device.cpu.brand}`,
      device.cpu?.model && `CPU Model: ${device.cpu.model}`,
      device.cpu?.config && `CPU Config: ${device.cpu.config}`,
      device.monitor?.subType && `Monitor Type: ${device.monitor.subType}`,
      device.monitor?.brand && `Monitor Brand: ${device.monitor.brand}`,
    ]);
  }
  if (device.type === 'Printer') return joinParts([device.subType, device.inputField]);
  if (device.type === 'CCTV') return (device.specs || []).filter(Boolean).join(' | ');
  return '';
};

const assetToDeviceDetails = (asset = {}) => {
  if (asset.deviceDetails && typeof asset.deviceDetails === 'object') return asset.deviceDetails;
  const type = asset.type || 'Laptop';
  const config = asset.configuration || asset.configurations || '';
  if (type === 'Laptop') {
    return {
      ...createBlankDevice('Laptop'),
      brand: asset.brand || '',
      model: asset.model || '',
      location: asset.location || '',
      configurations: splitConfigText(config),
    };
  }
  if (type === 'Desktop' || type === 'Server') {
    return {
      ...createBlankDevice(type),
      cpu: {
        subType: asset.subType || '',
        brand: asset.brand || '',
        model: asset.model || '',
        config,
        location: asset.location || '',
      },
      monitor: { subType: '', brand: '', location: asset.location || '' },
    };
  }
  if (type === 'Printer') {
    return {
      ...createBlankDevice('Printer'),
      subType: asset.subType || '',
      brand: asset.brand || '',
      model: asset.model || '',
      inputField: config,
      location: asset.location || '',
    };
  }
  if (type === 'CCTV') {
    return {
      ...createBlankDevice('CCTV'),
      subType: asset.subType || '',
      brand: asset.brand || '',
      model: asset.model || '',
      specs: String(config || '').split('|').map((row) => row.trim()).filter(Boolean).length
        ? String(config).split('|').map((row) => row.trim()).filter(Boolean)
        : [''],
      location: asset.location || '',
    };
  }
  return { ...createBlankDevice(type), brand: asset.brand || '', model: asset.model || '', location: asset.location || '' };
};

const validateDevice = (device) => {
  const errors = {};
  if (device.type === 'Laptop') {
    if (!device.brand?.trim()) errors.brand = 'Brand is required';
    if (!device.model?.trim()) errors.model = 'Model is required';
  } else if (device.type === 'Desktop' || device.type === 'Server') {
    if (!device.cpu?.subType?.trim()) errors.cpuSubType = 'CPU Type is required';
    if (!device.cpu?.brand?.trim()) errors.cpuBrand = 'CPU Brand is required';
    if (!device.cpu?.model?.trim()) errors.cpuModel = 'CPU Model is required';
    if (!device.cpu?.config?.trim()) errors.cpuConfig = 'CPU Configuration is required';
    if (!device.monitor?.subType?.trim()) errors.monitorSubType = 'Monitor Type is required';
    if (!device.monitor?.brand?.trim()) errors.monitorBrand = 'Monitor Brand is required';
  } else if (device.type === 'Printer') {
    if (!device.subType?.trim()) errors.subType = 'Printer type is required';
    if (!device.brand?.trim()) errors.brand = 'Brand is required';
    if (!device.model?.trim()) errors.model = 'Model is required';
    if (!device.inputField?.trim()) errors.inputField = 'Input field is required';
  } else if (device.type === 'CCTV') {
    if (!device.subType?.trim()) errors.subType = 'CCTV type is required';
    if (!device.brand?.trim()) errors.brand = 'Brand is required';
    if (!device.model?.trim()) errors.model = 'Model is required';
  }
  return errors;
};

const LaptopFields = ({ device, onChange, errors = {} }) => {
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
        <div className={`form-group${errors.brand ? ' has-error' : ''}`}>
          <label>Brand *</label>
          <input className="form-input" value={device.brand} onChange={(e) => onChange('brand', e.target.value)} placeholder="e.g. Dell, HP, Lenovo" />
          {errors.brand && <span className="field-error">{errors.brand}</span>}
        </div>
        <div className={`form-group${errors.model ? ' has-error' : ''}`}>
          <label>Model *</label>
          <input className="form-input" value={device.model} onChange={(e) => onChange('model', e.target.value)} placeholder="e.g. Latitude 5420" />
          {errors.model && <span className="field-error">{errors.model}</span>}
        </div>
        <div className="form-group">
          <label>Location</label>
          <input className="form-input" value={device.location} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. Shelf A / Floor 2" />
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
                    <button type="button" className="device-action-button delete" onClick={() => removeConfig(idx)} title="Remove row"><Trash2 size={14} /></button>
                    {idx === device.configurations.length - 1 && (
                      <button type="button" className="device-action-button add" onClick={addConfig} title="Add row"><Plus size={14} /></button>
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

const DesktopServerFields = ({ device, onChange, errors = {} }) => {
  const updateCpu = (field, value) => onChange('cpu', { ...device.cpu, [field]: value });
  const updateMonitor = (field, value) => onChange('monitor', { ...device.monitor, [field]: value });
  return (
    <div className="device-fields-section">
      <div className="desktop-subsection">
        <div className="subsection-title">CPU</div>
        <div className="device-fields-row">
          <div className={`form-group${errors.cpuSubType ? ' has-error' : ''}`}>
            <label>Type *</label>
            <input className="form-input" value={device.cpu.subType} onChange={(e) => updateCpu('subType', e.target.value)} placeholder="e.g. Tower, Mini" />
            {errors.cpuSubType && <span className="field-error">{errors.cpuSubType}</span>}
          </div>
          <div className={`form-group${errors.cpuBrand ? ' has-error' : ''}`}>
            <label>Brand *</label>
            <input className="form-input" value={device.cpu.brand} onChange={(e) => updateCpu('brand', e.target.value)} placeholder="e.g. Dell" />
            {errors.cpuBrand && <span className="field-error">{errors.cpuBrand}</span>}
          </div>
          <div className={`form-group${errors.cpuModel ? ' has-error' : ''}`}>
            <label>Model *</label>
            <input className="form-input" value={device.cpu.model} onChange={(e) => updateCpu('model', e.target.value)} placeholder="e.g. OptiPlex 7000" />
            {errors.cpuModel && <span className="field-error">{errors.cpuModel}</span>}
          </div>
        </div>
        <div className="device-fields-row">
          <div className={`form-group${errors.cpuConfig ? ' has-error' : ''}`}>
            <label>Configuration *</label>
            <input className="form-input" value={device.cpu.config} onChange={(e) => updateCpu('config', e.target.value)} placeholder="e.g. i5, 16GB, 512GB SSD" />
            {errors.cpuConfig && <span className="field-error">{errors.cpuConfig}</span>}
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" value={device.cpu.location} onChange={(e) => updateCpu('location', e.target.value)} placeholder="e.g. Storage Rack 2" />
          </div>
          <div className="form-group" />
        </div>
      </div>
      <div className="desktop-subsection" style={{ marginTop: '20px' }}>
        <div className="subsection-title">Monitor</div>
        <div className="device-fields-row">
          <div className={`form-group${errors.monitorSubType ? ' has-error' : ''}`}>
            <label>Type *</label>
            <input className="form-input" value={device.monitor.subType} onChange={(e) => updateMonitor('subType', e.target.value)} placeholder="e.g. LED, IPS" />
            {errors.monitorSubType && <span className="field-error">{errors.monitorSubType}</span>}
          </div>
          <div className={`form-group${errors.monitorBrand ? ' has-error' : ''}`}>
            <label>Brand *</label>
            <input className="form-input" value={device.monitor.brand} onChange={(e) => updateMonitor('brand', e.target.value)} placeholder="e.g. Samsung" />
            {errors.monitorBrand && <span className="field-error">{errors.monitorBrand}</span>}
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" value={device.monitor.location} onChange={(e) => updateMonitor('location', e.target.value)} placeholder="e.g. Storage Rack 2" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PrinterFields = ({ device, onChange, errors = {} }) => (
  <div className="device-fields-section">
    <div className="device-fields-row">
      <div className={`form-group${errors.subType ? ' has-error' : ''}`}>
        <label>Type *</label>
        <input className="form-input" value={device.subType} onChange={(e) => onChange('subType', e.target.value)} placeholder="e.g. Laser, Inkjet" />
        {errors.subType && <span className="field-error">{errors.subType}</span>}
      </div>
      <div className={`form-group${errors.brand ? ' has-error' : ''}`}>
        <label>Brand *</label>
        <input className="form-input" value={device.brand} onChange={(e) => onChange('brand', e.target.value)} placeholder="e.g. HP, Canon" />
        {errors.brand && <span className="field-error">{errors.brand}</span>}
      </div>
      <div className={`form-group${errors.model ? ' has-error' : ''}`}>
        <label>Model *</label>
        <input className="form-input" value={device.model} onChange={(e) => onChange('model', e.target.value)} placeholder="e.g. LaserJet Pro" />
        {errors.model && <span className="field-error">{errors.model}</span>}
      </div>
    </div>
    <div className="device-fields-row">
      <div className={`form-group${errors.inputField ? ' has-error' : ''}`}>
        <label>Input Field *</label>
        <input className="form-input" value={device.inputField} onChange={(e) => onChange('inputField', e.target.value)} placeholder="e.g. A4, Legal" />
        {errors.inputField && <span className="field-error">{errors.inputField}</span>}
      </div>
      <div className="form-group">
        <label>Location</label>
        <input className="form-input" value={device.location} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. Storage Room" />
      </div>
      <div className="form-group" />
    </div>
  </div>
);

const CCTVFields = ({ device, onChange, errors = {} }) => {
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
        <div className={`form-group${errors.subType ? ' has-error' : ''}`}>
          <label>Type *</label>
          <input className="form-input" value={device.subType} onChange={(e) => onChange('subType', e.target.value)} placeholder="e.g. IP, Analog, PTZ" />
          {errors.subType && <span className="field-error">{errors.subType}</span>}
        </div>
        <div className={`form-group${errors.brand ? ' has-error' : ''}`}>
          <label>Brand *</label>
          <input className="form-input" value={device.brand} onChange={(e) => onChange('brand', e.target.value)} placeholder="e.g. Hikvision, Dahua" />
          {errors.brand && <span className="field-error">{errors.brand}</span>}
        </div>
        <div className={`form-group${errors.model ? ' has-error' : ''}`}>
          <label>Model *</label>
          <input className="form-input" value={device.model} onChange={(e) => onChange('model', e.target.value)} placeholder="Model number" />
          {errors.model && <span className="field-error">{errors.model}</span>}
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
          <button type="button" className="secondary-button" style={{ height: '30px', fontSize: '12px', padding: '0 12px' }} onClick={addSpec}>
            <Plus size={12} /> Add Spec
          </button>
        </div>
        {device.specs.map((spec, idx) => (
          <div key={idx} className="spec-row">
            <input className="form-input" value={spec} onChange={(e) => updateSpec(idx, e.target.value)} placeholder="e.g. 4MP, Night Vision, IR 30m" />
            <button type="button" className="device-action-button delete" onClick={() => removeSpec(idx)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const DeviceDetailsFields = ({ device, onChange, errors }) => {
  const update = (field, value) => onChange({ ...device, [field]: value });
  switch (device.type) {
    case 'Laptop': return <LaptopFields device={device} onChange={update} errors={errors} />;
    case 'Desktop':
    case 'Server': return <DesktopServerFields device={device} onChange={update} errors={errors} />;
    case 'Printer': return <PrinterFields device={device} onChange={update} errors={errors} />;
    case 'CCTV': return <CCTVFields device={device} onChange={update} errors={errors} />;
    default: return (
      <div className="device-fields-section">
        <div className="device-fields-row">
          <div className={`form-group${errors.brand ? ' has-error' : ''}`}>
            <label>Brand *</label>
            <input className="form-input" value={device.brand || ''} onChange={(e) => update('brand', e.target.value)} />
          </div>
          <div className={`form-group${errors.model ? ' has-error' : ''}`}>
            <label>Model *</label>
            <input className="form-input" value={device.model || ''} onChange={(e) => update('model', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" value={device.location || ''} onChange={(e) => update('location', e.target.value)} />
          </div>
        </div>
      </div>
    );
  }
};

const buildAssetPayload = ({ form, device, existingAsset }) => {
  const configuration = getDeviceConfiguration(device);
  return {
    ...existingAsset,
    assetTag: trimText(form.assetTag),
    serialNumber: trimText(form.serialNumber),
    type: device.type,
    brand: getDeviceBrand(device),
    model: getDeviceModel(device) || device.type,
    subType: getDeviceSubType(device),
    location: getDeviceLocation(device),
    status: form.status,
    addOnParts: trimText(form.addOnParts),
    configuration,
    configurations: configuration,
    deviceDetails: device,
    purchasePrice: Number(existingAsset?.purchasePrice || 0),
    currentValue: Number(existingAsset?.currentValue || 0),
  };
};

const InventoryAssetFormPage = () => {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const { settings } = useLeadSettings();
  const { addToast } = useToast();
  const errorBannerRef = useRef(null);
  const isEdit = Boolean(assetId);
  const [loading, setLoading] = useState(Boolean(assetId));
  const [saving, setSaving] = useState(false);
  const [existingAsset, setExistingAsset] = useState(null);
  const [form, setForm] = useState({
    assetTag: '',
    serialNumber: '',
    status: 'Idle',
    addOnParts: '',
  });
  const [device, setDevice] = useState(createBlankDevice('Laptop'));
  const [errors, setErrors] = useState({});

  const deviceOptions = useMemo(() => {
    const defaults = ['Laptop', 'Desktop', 'Server', 'Printer', 'CCTV'];
    return Array.from(new Set([...(settings.devices || []), ...defaults])).filter((option) => option !== 'Total Maintenance');
  }, [settings.devices]);

  useEffect(() => {
    if (!assetId) return;
    assetManagementService.getAssetById(assetId)
      .then((asset) => {
        setExistingAsset(asset);
        setForm({
          assetTag: asset.assetTag || asset.id || '',
          serialNumber: asset.serialNumber || '',
          status: normalizeAssetStatus(asset.status),
          addOnParts: asset.addOnParts || '',
        });
        setDevice(assetToDeviceDetails(asset));
      })
      .catch((error) => addToast(error.response?.data?.message || error.message || 'Asset failed to load.', 'error'))
      .finally(() => setLoading(false));
  }, [assetId, addToast]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleTypeChange = (type) => {
    setDevice(createBlankDevice(type));
    setErrors((current) => ({ ...current, device: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!trimText(form.assetTag)) next.assetTag = 'Device ID is required';
    if (!trimText(form.serialNumber)) next.serialNumber = 'Serial number is required';
    const deviceErrors = validateDevice(device);
    if (Object.keys(deviceErrors).length) next.device = deviceErrors;
    return next;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      return;
    }

    setSaving(true);
    try {
      const payload = buildAssetPayload({ form, device, existingAsset });
      if (isEdit) {
        await assetManagementService.updateAsset(assetId, payload);
        addToast('Asset updated successfully.');
      } else {
        await assetManagementService.addAsset(payload);
        addToast('Asset added successfully.');
      }
      navigate('/admin/inventory');
    } catch (error) {
      setErrors({ save: error.response?.data?.message || error.message || 'Failed to save asset.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="amc-new-page">
        <div className="table-card" style={{ minHeight: 220, alignItems: 'center', justifyContent: 'center' }}>
          <strong>Loading asset...</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="amc-new-page">
      <div className="amc-new-page-header">
        <button className="back-button" onClick={() => navigate('/admin/inventory')}>
          <ArrowLeft size={18} /> Back to Inventory
        </button>
        <div className="amc-new-page-title">
          <h1>{isEdit ? 'Edit Inventory Asset' : 'Add Inventory Asset'}</h1>
          <p>Register device ID, serial number, and device-specific configuration before it can be selected for rental tracking.</p>
        </div>
        <div className="amc-new-page-actions">
          <button className="secondary-button" onClick={() => navigate('/admin/inventory')}>Cancel</button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Asset'}
          </button>
        </div>
      </div>

      <div ref={errorBannerRef}>
        {(errors.save || errors.assetTag || errors.serialNumber || errors.device) && (
          <div className="form-error-banner">
            {errors.save || 'Please fill all required asset fields before saving.'}
          </div>
        )}
      </div>

      <div className="amc-new-page-body">
        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title">1. Asset Identity</h2>
          </div>
          <div className="amc-form-card-body">
            <div className="form-row-3">
              <div className={`form-group${errors.assetTag ? ' has-error' : ''}`}>
                <label>Device ID *</label>
                <input className="form-input" value={form.assetTag} onChange={(e) => updateForm('assetTag', e.target.value)} placeholder="RT-PRN-001" />
                {errors.assetTag && <span className="field-error">{errors.assetTag}</span>}
              </div>
              <div className={`form-group${errors.serialNumber ? ' has-error' : ''}`}>
                <label>Serial Number *</label>
                <input className="form-input" value={form.serialNumber} onChange={(e) => updateForm('serialNumber', e.target.value)} placeholder="SN-4582-XL" />
                {errors.serialNumber && <span className="field-error">{errors.serialNumber}</span>}
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-select" value={form.status} onChange={(e) => updateForm('status', e.target.value)}>
                  {ASSET_STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="amc-form-card card-devices">
          <div className="amc-form-card-header device-registry-header">
            <h2 className="amc-form-section-title">2. Device Details</h2>
            <div className="accordion-actions" style={{ minWidth: 260 }}>
              <select className="form-select accordion-type-select" value={device.type} onChange={(e) => handleTypeChange(e.target.value)}>
                {deviceOptions.map((type) => <option key={type}>{type}</option>)}
              </select>
              <span className="accordion-chevron"><ChevronDown size={16} /></span>
            </div>
          </div>
          <div className="amc-form-card-body">
            <div className={`device-accordion open${errors.device ? ' has-error' : ''}`}>
              <div className="accordion-header">
                <div className="accordion-title-area">
                  <span className="accordion-device-index">Device</span>
                  <span className="accordion-device-type-badge">{device.type}</span>
                  {errors.device && <span className="field-error" style={{ marginLeft: 8, fontSize: '12px' }}>Fill required fields</span>}
                </div>
              </div>
              <div className="accordion-body">
                <DeviceDetailsFields device={device} onChange={setDevice} errors={errors.device || {}} />
              </div>
            </div>
          </div>
        </div>

        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title">3. Add-on Parts</h2>
          </div>
          <div className="amc-form-card-body">
            <div className="form-group">
              <label>Add-on Parts <span className="optional-tag">(Optional)</span></label>
              <textarea
                className="form-input"
                style={{ minHeight: 86, paddingTop: 10, resize: 'vertical' }}
                value={form.addOnParts}
                onChange={(e) => updateForm('addOnParts', e.target.value)}
                placeholder="Extra tray, duplex unit, RAM upgrade, docking station..."
              />
            </div>
          </div>
        </div>

        <div className="amc-form-footer">
          <button className="secondary-button" onClick={() => navigate('/admin/inventory')}>Cancel</button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Asset'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryAssetFormPage;
