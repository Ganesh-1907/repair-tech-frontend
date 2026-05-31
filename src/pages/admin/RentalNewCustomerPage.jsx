import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowLeft, HardDrive, Save } from 'lucide-react';
import { api } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import './PlansCustomers.css';
import '../InventoryPremiumStyles.css';

const COLLECTION = 'rentalCustomers';

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
      return { type: 'Printer', subType: '', brand: '', model: '', serialNumber: '', pageCount: '', notes: '', location: '' };
    case 'CCTV':
      return { type: 'CCTV', subType: '', brand: '', model: '', specs: [''], location: '' };
    case 'VPS':
      return { type: 'VPS', brand: '', model: '', serialNumber: '', location: '', configurations: [{ name: '', specification: '', serialNumber: '' }] };
    case 'Total Maintenance':
      return {
        type: 'Total Maintenance',
        subDeviceType: 'Laptop',
        subDeviceData: createBlankDevice('Laptop'),
      };
    default:
      return { type, brand: '', model: '', serialNumber: '', location: '', configurations: [{ name: '', specification: '', serialNumber: '' }] };
  }
};

const trimText = (value) => String(value || '').trim();

const getDeviceBase = (device) => (
  device.type === 'Total Maintenance'
    ? { ...device.subDeviceData, type: device.subDeviceType || 'Laptop' }
    : device
);

const getDeviceSummary = (device) => {
  const base = getDeviceBase(device);
  if (base.type === 'Desktop' || base.type === 'Server') return `${base.cpu?.brand || ''} ${base.cpu?.model || ''}`.trim() || '';
  return `${base.brand || ''} ${base.model || ''}`.trim() || '';
};

const getAssetDisplayId = (asset) => asset.assetTag || asset.assetId || asset.id;

const mapInventoryAssetToRentalDevice = (asset = {}) => ({
  inventoryAssetId: asset.id,
  assetId: getAssetDisplayId(asset),
  assetTag: asset.assetTag || asset.assetId || asset.id,
  serialNumber: asset.serialNumber || '',
  type: asset.type || asset.deviceType || 'Device',
  deviceType: asset.type || asset.deviceType || 'Device',
  brand: asset.brand || '',
  model: asset.model || '',
  subType: asset.subType || '',
  location: asset.location || '',
  configuration: asset.configuration || asset.configurations || '',
  configurations: asset.configuration || asset.configurations || '',
  addOnParts: asset.addOnParts || '',
  deviceDetails: asset.deviceDetails || null,
  source: 'inventory',
});

const buildRentalAssetPayloads = (assets, customer) => {
  const customerName = customer.companyName || customer.customerName || '';
  return assets.map((asset) => {
    const assetType = asset.type || asset.deviceType || 'Device';
    const id = `RA-${customer.id}-${asset.id}`;
    const location = asset.location || customer.address || '';
    const configuration = asset.configuration || asset.configurations || '';
    return {
      id,
      assetId: getAssetDisplayId(asset),
      inventoryAssetId: asset.id,
      customerId: customer.id,
      customerName,
      type: assetType,
      deviceType: assetType,
      brand: asset.brand || '',
      model: asset.model || assetType,
      subType: asset.subType || '',
      inventorySerialNumber: asset.serialNumber || '',
      specs: configuration,
      configuration,
      configurations: configuration,
      customerLocation: location,
      location,
      quantity: 1,
      status: 'Registration Pending',
      installationStatus: 'Pending',
      deviceDetails: asset.deviceDetails || null,
      addOnParts: asset.addOnParts || '',
      notes: `Inventory asset ${getAssetDisplayId(asset)}`,
    };
  });
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
            <input className="form-input" value={device.cpu.location} onChange={(e) => updateCpu('location', e.target.value)} placeholder="e.g. Finance Dept" />
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
            <input className="form-input" value={device.monitor.location} onChange={(e) => updateMonitor('location', e.target.value)} placeholder="e.g. Floor 3" />
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
      <div className="form-group">
        <label>Serial Number</label>
        <input className="form-input" value={device.serialNumber || ''} onChange={(e) => onChange('serialNumber', e.target.value)} placeholder="S/N" />
      </div>
      <div className="form-group">
        <label>Page Count</label>
        <input className="form-input" value={device.pageCount || ''} onChange={(e) => onChange('pageCount', e.target.value)} placeholder="e.g. 12500" />
      </div>
      <div className="form-group">
        <label>Location</label>
        <input className="form-input" value={device.location} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. Reception" />
      </div>
    </div>
    <div className="device-fields-row">
      <div className="form-group">
        <label>Notes</label>
        <input className="form-input" value={device.notes || device.inputField || ''} onChange={(e) => onChange('notes', e.target.value)} placeholder="e.g. A4, Legal" />
      </div>
      <div className="form-group" />
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

const VpsFields = ({ device, onChange, errors = {} }) => {
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
        <div className="form-group"><label>Provider / Brand</label><input className="form-input" value={device.brand} onChange={(e) => onChange('brand', e.target.value)} placeholder="e.g. AWS, Azure, DigitalOcean" /></div>
        <div className="form-group"><label>Plan / Instance Type</label><input className="form-input" value={device.model} onChange={(e) => onChange('model', e.target.value)} placeholder="e.g. t3.medium, B2s" /></div>
        <div className="form-group"><label>Instance ID / Serial</label><input className="form-input" value={device.serialNumber} onChange={(e) => onChange('serialNumber', e.target.value)} placeholder="e.g. i-1234567890" /></div>
      </div>
      <div className="device-fields-row">
        <div className="form-group"><label>Region / Location</label><input className="form-input" value={device.location} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. us-east-1, Southeast Asia" /></div>
        <div className="form-group" /><div className="form-group" />
      </div>
      <div className="config-table-section">
        <div className="config-table-header"><span className="config-table-title">Specifications</span></div>
        <table className="config-table">
          <thead><tr><th>Name</th><th>Specification</th><th>Serial / ID</th><th></th></tr></thead>
          <tbody>{device.configurations.map((conf, idx) => (
            <tr key={idx}>
              <td><input className="form-input" value={conf.name} onChange={(e) => updateConfig(idx, 'name', e.target.value)} placeholder="e.g. vCPUs" /></td>
              <td><input className="form-input" value={conf.specification} onChange={(e) => updateConfig(idx, 'specification', e.target.value)} placeholder="e.g. 4 Cores" /></td>
              <td><input className="form-input" value={conf.serialNumber} onChange={(e) => updateConfig(idx, 'serialNumber', e.target.value)} placeholder="ID / S/N" /></td>
              <td><div style={{ display: 'flex', gap: '4px' }}>
                <button className="device-action-button delete" onClick={() => removeConfig(idx)}><Trash2 size={14} /></button>
                {idx === device.configurations.length - 1 && <button className="device-action-button add" onClick={addConfig}><Plus size={14} /></button>}
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

const GenericFields = ({ device, onChange, errors = {} }) => {
  const configs = device.configurations && device.configurations.length > 0
    ? device.configurations : [{ name: '', specification: '', serialNumber: '' }];
  const updateConfig = (idx, field, value) => {
    const next = [...configs]; next[idx] = { ...next[idx], [field]: value };
    onChange('configurations', next);
  };
  const addConfig = () => onChange('configurations', [...configs, { name: '', specification: '', serialNumber: '' }]);
  const removeConfig = (idx) => { if (configs.length === 1) return; onChange('configurations', configs.filter((_, i) => i !== idx)); };
  return (
    <div className="device-fields-section">
      <div className="device-fields-row">
        <div className="form-group"><label>Brand</label><input className="form-input" value={device.brand || ''} onChange={(e) => onChange('brand', e.target.value)} placeholder="e.g. Dell, HP" /></div>
        <div className="form-group"><label>Model</label><input className="form-input" value={device.model || ''} onChange={(e) => onChange('model', e.target.value)} placeholder="Model / Part number" /></div>
        <div className="form-group"><label>Serial Number</label><input className="form-input" value={device.serialNumber || ''} onChange={(e) => onChange('serialNumber', e.target.value)} placeholder="S/N" /></div>
      </div>
      <div className="device-fields-row">
        <div className="form-group"><label>Location</label><input className="form-input" value={device.location || ''} onChange={(e) => onChange('location', e.target.value)} placeholder="e.g. Server Room" /></div>
        <div className="form-group" /><div className="form-group" />
      </div>
      <div className="config-table-section">
        <div className="config-table-header"><span className="config-table-title">Specifications</span></div>
        <table className="config-table">
          <thead><tr><th>Name</th><th>Specification</th><th>Serial / ID</th><th></th></tr></thead>
          <tbody>{configs.map((conf, idx) => (
            <tr key={idx}>
              <td><input className="form-input" value={conf.name || ''} onChange={(e) => updateConfig(idx, 'name', e.target.value)} placeholder="e.g. RAM" /></td>
              <td><input className="form-input" value={conf.specification || ''} onChange={(e) => updateConfig(idx, 'specification', e.target.value)} placeholder="e.g. 16GB" /></td>
              <td><input className="form-input" value={conf.serialNumber || ''} onChange={(e) => updateConfig(idx, 'serialNumber', e.target.value)} placeholder="S/N" /></td>
              <td><div style={{ display: 'flex', gap: '4px' }}>
                <button className="device-action-button delete" onClick={() => removeConfig(idx)}><Trash2 size={14} /></button>
                {idx === configs.length - 1 && <button className="device-action-button add" onClick={addConfig}><Plus size={14} /></button>}
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

const TotalMaintenanceFields = ({ device, onReplace, errors = {}, settings = { devices: ['Laptop', 'Desktop', 'Server', 'Printer', 'CCTV'] } }) => {
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
      case 'Laptop': return <LaptopFields device={subData} onChange={handleSubFieldChange} errors={errors} />;
      case 'Desktop':
      case 'Server': return <DesktopServerFields device={subData} onChange={handleSubFieldChange} errors={errors} />;
      case 'Printer': return <PrinterFields device={subData} onChange={handleSubFieldChange} errors={errors} />;
      case 'CCTV': return <CCTVFields device={subData} onChange={handleSubFieldChange} errors={errors} />;
      case 'VPS': return <VpsFields device={subData} onChange={handleSubFieldChange} errors={errors} />;
      default: return <GenericFields device={subData} onChange={handleSubFieldChange} errors={errors} />;
    }
  };

  return (
    <div className="device-fields-section">
      <div className="form-group" style={{ marginBottom: '20px', maxWidth: '260px' }}>
        <label>Device Sub-Type</label>
        <select className="form-select" value={sub} onChange={(e) => handleSubTypeChange(e.target.value)}>
          {settings.devices.map((type) => <option key={type}>{type}</option>)}
        </select>
      </div>
      {renderSubFields()}
    </div>
  );
};

const DeviceAccordion = ({ device, index, isOpen, onToggle, onUpdate, onRemove, onAdd, errors = {}, settings = { devices: ['Laptop', 'Desktop', 'Server', 'Printer', 'CCTV'] } }) => {
  const onChange = (field, value) => {
    if (field === 'type') {
      onUpdate(index, createBlankDevice(value));
    } else {
      onUpdate(index, { ...device, [field]: value });
    }
  };

  const renderFields = () => {
    switch (device.type) {
      case 'Laptop': return <LaptopFields device={device} onChange={onChange} errors={errors} />;
      case 'Desktop':
      case 'Server': return <DesktopServerFields device={device} onChange={onChange} errors={errors} />;
      case 'Printer': return <PrinterFields device={device} onChange={onChange} errors={errors} />;
      case 'CCTV': return <CCTVFields device={device} onChange={onChange} errors={errors} />;
      case 'VPS': return <VpsFields device={device} onChange={onChange} errors={errors} />;
      case 'Total Maintenance': return <TotalMaintenanceFields device={device} onReplace={(updated) => onUpdate(index, updated)} errors={errors} />;
      default: return <GenericFields device={device} onChange={onChange} errors={errors} />;
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  const summary = getDeviceSummary(device);

  return (
    <div className={`device-accordion${isOpen ? ' open' : ''}${hasErrors ? ' has-error' : ''}`}>
      <div className="accordion-header" onClick={onToggle}>
        <div className="accordion-title-area">
          <span className="accordion-device-index">Device {index + 1}</span>
          <span className="accordion-device-type-badge">{device.type}</span>
          {summary && <span className="accordion-device-summary">{summary}</span>}
          {hasErrors && <span className="field-error" style={{ marginLeft: 8, fontSize: '12px' }}>Fill required fields</span>}
        </div>
        <div className="accordion-actions" onClick={(e) => e.stopPropagation()}>
          <select
            className="form-select accordion-type-select"
            value={device.type}
            onChange={(e) => onChange('type', e.target.value)}
            title="Change device type"
          >
            {[...settings.devices, 'Total Maintenance'].map((type) => <option key={type}>{type}</option>)}
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
  const { addToast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('id');

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const errorBannerRef = useRef(null);
  const [plans, setPlans] = useState([]);
  const [inventoryAssets, setInventoryAssets] = useState([]);
  const [originalAssetIds, setOriginalAssetIds] = useState([]);
  const [deviceSlots, setDeviceSlots] = useState(['']);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [addingDevice, setAddingDevice] = useState(false);
  const [newDeviceForm, setNewDeviceForm] = useState({ assetTag: '', type: 'Laptop', brand: '', model: '', serialNumber: '' });
  const [printerSettings, setPrinterSettings] = useState({});
  // { [slotIdx]: { pageWiseBilling, pageRate, startPageCount, lastBilledPageCount, replacementHistory, replacePending, replaceForm } }

  const updatePrinterSetting = (slotIdx, field, value) =>
    setPrinterSettings((p) => ({ ...p, [slotIdx]: { ...(p[slotIdx] || {}), [field]: value } }));

  const [form, setForm] = useState({
    companyName: '',
    customerType: 'Corporate',
    gstNumber: '',
    primaryContact: { name: '', mobile: '', email: '' },
    secondaryContact: { name: '', mobile: '', email: '' },
    registeredAddress: '',
    billingAddress: '',
    notes: '',
    planId: '',
    planName: '',
    planDetails: null,
    selectedAssetIds: [],
    devices: [],
  });

  useEffect(() => {
    Promise.all([
      api.list('rentalPricingPlans'),
      api.list('assets'),
    ])
      .then(([plansData, assetsData]) => {
        const allPlans = Array.isArray(plansData) ? plansData : [];
        setPlans(editId ? allPlans : allPlans.filter((p) => p.status !== 'Inactive'));
        setInventoryAssets(Array.isArray(assetsData) ? assetsData : []);
      })
      .catch(() => {});
  }, [editId]);

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
            planId: existing.planId || '',
            planName: existing.planName || '',
            planDetails: existing.planDetails || null,
            selectedAssetIds: existing.selectedAssetIds || (Array.isArray(existing.devices)
              ? existing.devices.map((d) => d.inventoryAssetId).filter(Boolean)
              : []),
            devices: Array.isArray(existing.devices) ? existing.devices : [],
          });
          const loadedIds = existing.selectedAssetIds || (Array.isArray(existing.devices)
            ? existing.devices.map((d) => d.inventoryAssetId).filter(Boolean)
            : []);
          setOriginalAssetIds(loadedIds);
          setDeviceSlots(loadedIds.length > 0 ? loadedIds.map(String) : ['']);
          if (Array.isArray(existing.devices)) {
            const ps = {};
            existing.devices.forEach((d, i) => {
              if (d.type === 'Printer') {
                ps[i] = {
                  pageWiseBilling: d.pageWiseBilling || false,
                  pageRate: d.pageRate || '',
                  startPageCount: d.startPageCount || '',
                  lastBilledPageCount: d.lastBilledPageCount || '',
                  replacementHistory: d.replacementHistory || [],
                  replacePending: false,
                  replaceForm: { oldEndPageCount: '', newAssetId: '', newStartPageCount: '' },
                };
              }
            });
            setPrinterSettings(ps);
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

  const handlePlanChange = (planId) => {
    const selected = plans.find((p) => p.id === planId) || null;
    setForm((current) => ({
      ...current,
      planId: planId,
      planName: selected?.name || '',
      planDetails: selected,
    }));
    setErrors((current) => ({ ...current, planId: undefined }));
  };

  const selectedAssets = useMemo(() => (
    form.selectedAssetIds
      .map((assetId) => inventoryAssets.find((asset) => String(asset.id) === String(assetId)))
      .filter(Boolean)
  ), [form.selectedAssetIds, inventoryAssets]);

  const availableAssets = useMemo(() => inventoryAssets.filter((asset) => {
    const status = (asset.status || '').toLowerCase();
    const alreadySelected = form.selectedAssetIds.map(String).includes(String(asset.id));
    if (alreadySelected) return true;
    if (status !== 'active') return false;
    const assignedElsewhere = asset.rentalCustomerId && String(asset.rentalCustomerId) !== String(editId || '');
    return !assignedElsewhere;
  }), [inventoryAssets, form.selectedAssetIds, editId]);

  const updateSlot = (slotIdx, assetId) => {
    const next = [...deviceSlots];
    next[slotIdx] = assetId;
    setDeviceSlots(next);
    const ids = next.filter(Boolean);
    const selectedAssetList = ids.map((id) => inventoryAssets.find((a) => String(a.id) === String(id))).filter(Boolean);
    setForm((f) => ({ ...f, selectedAssetIds: ids, devices: selectedAssetList.map(mapInventoryAssetToRentalDevice) }));
    setErrors((e) => ({ ...e, selectedAssetIds: undefined }));
  };

  const addSlot = () => setDeviceSlots((s) => [...s, '']);

  const removeSlot = (slotIdx) => {
    const next = deviceSlots.filter((_, i) => i !== slotIdx);
    const safeNext = next.length === 0 ? [''] : next;
    setDeviceSlots(safeNext);
    const ids = safeNext.filter(Boolean);
    const selectedAssetList = ids.map((id) => inventoryAssets.find((a) => String(a.id) === String(id))).filter(Boolean);
    setForm((f) => ({ ...f, selectedAssetIds: ids, devices: selectedAssetList.map(mapInventoryAssetToRentalDevice) }));
  };

  const handleAddDeviceSave = async () => {
    if (!newDeviceForm.assetTag.trim() || !newDeviceForm.brand.trim() || !newDeviceForm.model.trim()) return;
    setAddingDevice(true);
    try {
      const allAssets = await api.list('assets');
      const prefix = 'SN-RB-';
      let max = 0;
      (Array.isArray(allAssets) ? allAssets : []).forEach((a) => {
        const sn = a.serialNumber || '';
        if (sn.startsWith(prefix)) { const n = parseInt(sn.slice(prefix.length), 10); if (!isNaN(n) && n > max) max = n; }
      });
      const serial = `${prefix}${String(max + 1).padStart(5, '0')}`;
      const payload = { assetTag: newDeviceForm.assetTag.trim(), serialNumber: serial, type: newDeviceForm.type, brand: newDeviceForm.brand.trim(), model: newDeviceForm.model.trim(), status: 'Active', configuration: '' };
      const created = await api.create('assets', payload);
      const newAsset = { ...payload, id: created.id || created._id || Date.now() };
      setInventoryAssets((prev) => [...prev, newAsset]);
      const nextSlots = [...deviceSlots.filter(Boolean), String(newAsset.id)];
      if (deviceSlots[deviceSlots.length - 1] === '') {
        nextSlots.unshift('');
        setDeviceSlots([...deviceSlots.slice(0, -1), String(newAsset.id)]);
      } else {
        setDeviceSlots(nextSlots);
      }
      const ids = nextSlots.filter(Boolean);
      setForm((f) => ({ ...f, selectedAssetIds: ids }));
      setShowAddDeviceModal(false);
      setNewDeviceForm({ assetTag: '', type: 'Laptop', brand: '', model: '', serialNumber: '' });
    } catch { /* ignore */ } finally { setAddingDevice(false); }
  };

  const toggleAssetSelection = (asset) => {
    const isAssignedElsewhere = asset.rentalCustomerId && String(asset.rentalCustomerId) !== String(editId || '');
    if (isAssignedElsewhere) return;
    setForm((current) => {
      const selected = new Set((current.selectedAssetIds || []).map(String));
      const assetId = String(asset.id);
      if (selected.has(assetId)) selected.delete(assetId);
      else selected.add(assetId);
      const selectedAssetList = Array.from(selected)
        .map((selectedId) => inventoryAssets.find((row) => String(row.id) === selectedId))
        .filter(Boolean);
      return {
        ...current,
        selectedAssetIds: Array.from(selected),
        devices: selectedAssetList.map(mapInventoryAssetToRentalDevice),
      };
    });
    setErrors((current) => ({ ...current, selectedAssetIds: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.companyName.trim()) nextErrors.companyName = 'Company / customer name is required';
    if (!form.gstNumber.trim()) nextErrors.gstNumber = 'GST number is required';
    if (!form.primaryContact.name.trim()) nextErrors.primaryContactName = 'Primary contact name is required';
    if (!form.primaryContact.mobile.trim()) nextErrors.primaryContactMobile = 'Primary contact mobile is required';
    if (!form.primaryContact.email.trim()) nextErrors.primaryContactEmail = 'Primary contact email is required';
    if (!form.registeredAddress.trim()) nextErrors.registeredAddress = 'Registered address is required';
    if (!form.planId) nextErrors.planId = 'A rental plan is required';

    if (!form.selectedAssetIds.length) nextErrors.selectedAssetIds = 'Select at least one inventory asset';
    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors({ ...nextErrors, general: 'Please fill in all required fields marked below.' });
      setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      return;
    }

    setErrors({});
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
        selectedAssetIds: form.selectedAssetIds,
        devices: selectedAssets.map((asset, i) => {
          const base = mapInventoryAssetToRentalDevice(asset);
          if (asset.type === 'Printer') {
            const ps = printerSettings[i] || {};
            return {
              ...base,
              pageWiseBilling: ps.pageWiseBilling || false,
              pageRate: Number(ps.pageRate) || 0,
              startPageCount: Number(ps.startPageCount) || 0,
              lastBilledPageCount: Number(ps.lastBilledPageCount) || 0,
              replacementHistory: ps.replacementHistory || [],
            };
          }
          return base;
        }),
        planId: form.planId,
        planName: form.planName,
        planDetails: form.planDetails,
      };

      const savedCustomer = editId
        ? await api.update(COLLECTION, editId, customerPayload)
        : await api.create(COLLECTION, customerPayload);

      const assetPayloads = buildRentalAssetPayloads(selectedAssets, savedCustomer);
      await Promise.allSettled(assetPayloads.map((asset) => api.create('rentalAssets', asset)));
      await Promise.all(selectedAssets.map((asset) => api.patch('assets', asset.id, {
        status: 'Rented',
        assignedCustomer: companyName,
        rentalCustomerId: savedCustomer.id,
        customerId: savedCustomer.id,
        customerName: companyName,
      })));
      const selectedIdSet = new Set(form.selectedAssetIds.map(String));
      const removedAssetIds = originalAssetIds.filter((assetId) => !selectedIdSet.has(String(assetId)));
      await Promise.all(removedAssetIds.map((assetId) => api.patch('assets', assetId, {
        status: 'Idle',
        assignedCustomer: null,
        rentalCustomerId: null,
        customerId: null,
        customerName: null,
      }).catch(() => null)));
      navigate('/admin/rental/customers');
    } catch (err) {
      console.error('Failed to save rental customer:', err);
      addToast(err.response?.data?.message || 'Failed to save. Please try again.', 'error');
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

      <div ref={errorBannerRef}>
        {errors.general && (
          <div className="form-error-banner">{errors.general}</div>
        )}
      </div>

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
              <div className={`form-group${errors.gstNumber ? ' has-error' : ''}`}>
                <label>GST Number *</label>
                <input
                  className="form-input"
                  value={form.gstNumber}
                  onChange={(e) => {
                    setForm((current) => ({ ...current, gstNumber: e.target.value }));
                    setErrors((current) => ({ ...current, gstNumber: undefined }));
                  }}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                />
                {errors.gstNumber && <span className="field-error">{errors.gstNumber}</span>}
              </div>
              <div className="form-group" />
            </div>

            <div className="contact-section">
              <div className="contact-section-label">Primary Contact</div>
              <div className="form-row-3">
                <div className={`form-group${errors.primaryContactName ? ' has-error' : ''}`}>
                  <label>Name *</label>
                  <input className="form-input" value={form.primaryContact.name} onChange={(e) => { setContact('primaryContact', 'name', e.target.value); setErrors((c) => ({ ...c, primaryContactName: undefined })); }} placeholder="Contact person name" />
                  {errors.primaryContactName && <span className="field-error">{errors.primaryContactName}</span>}
                </div>
                <div className={`form-group${errors.primaryContactMobile ? ' has-error' : ''}`}>
                  <label>Mobile *</label>
                  <input className="form-input" value={form.primaryContact.mobile} onChange={(e) => { setContact('primaryContact', 'mobile', e.target.value); setErrors((c) => ({ ...c, primaryContactMobile: undefined })); }} placeholder="+91 XXXXX XXXXX" />
                  {errors.primaryContactMobile && <span className="field-error">{errors.primaryContactMobile}</span>}
                </div>
                <div className={`form-group${errors.primaryContactEmail ? ' has-error' : ''}`}>
                  <label>Email *</label>
                  <input className="form-input" value={form.primaryContact.email} onChange={(e) => { setContact('primaryContact', 'email', e.target.value); setErrors((c) => ({ ...c, primaryContactEmail: undefined })); }} placeholder="email@company.com" />
                  {errors.primaryContactEmail && <span className="field-error">{errors.primaryContactEmail}</span>}
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
              <div className={`form-group${errors.registeredAddress ? ' has-error' : ''}`}>
                <label>Registered Address *</label>
                <textarea
                  className="form-input"
                  style={{ height: '72px', paddingTop: '10px', resize: 'vertical' }}
                  value={form.registeredAddress}
                  onChange={(e) => {
                    setForm((current) => ({ ...current, registeredAddress: e.target.value }));
                    setErrors((current) => ({ ...current, registeredAddress: undefined }));
                  }}
                  placeholder="Full company registered address"
                />
                {errors.registeredAddress && <span className="field-error">{errors.registeredAddress}</span>}
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

        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title">2. Rental Plan *</h2>
          </div>
          <div className="amc-form-card-body">
            <div className={`form-group${errors.planId ? ' has-error' : ''}`} style={{ maxWidth: 420 }}>
              <label>Select Plan *</label>
              <select
                className="form-select"
                value={form.planId}
                onChange={(e) => handlePlanChange(e.target.value)}
              >
                <option value="">-- Select a rental plan --</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.type ? ` — ${p.type}` : ''}{p.price ? ` (${p.price})` : ''}
                  </option>
                ))}
              </select>
              {errors.planId && <span className="field-error">{errors.planId}</span>}
              {plans.length === 0 && (
                <span className="field-error" style={{ color: '#f59e0b' }}>
                  No active plans found. Add plans in Rental Plans before creating a customer.
                </span>
              )}
            </div>

            {form.planDetails && (
              <div className="plan-summary-card">
                <div className="plan-summary-row">
                  <div className="plan-summary-item"><span>Plan Name</span><strong>{form.planDetails.name || '-'}</strong></div>
                  <div className="plan-summary-item"><span>Type</span><strong>{form.planDetails.type || '-'}</strong></div>
                  <div className="plan-summary-item"><span>Price</span><strong>{form.planDetails.price || '-'}</strong></div>
                </div>
                <div className="plan-summary-row">
                  <div className="plan-summary-item"><span>Duration</span><strong>{form.planDetails.duration || '-'}</strong></div>
                  <div className="plan-summary-item"><span>Visits / Year</span><strong>{form.planDetails.visits || '-'}</strong></div>
                  <div className="plan-summary-item"><span>SLA</span><strong>{form.planDetails.sla || '-'}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="amc-form-card card-devices">
          <div className="amc-form-card-header device-registry-header">
            <div>
              <h2 className="amc-form-section-title">3. Devices *</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                Select devices from inventory. Only Active unassigned devices are shown.
              </p>
            </div>
            <button className="secondary-button" style={{ height: '36px', fontSize: '13px' }} onClick={() => setShowAddDeviceModal(true)}>
              <Plus size={16} /> Add Device
            </button>
          </div>
          <div className="amc-form-card-body">
            {errors.selectedAssetIds && <span className="field-error" style={{ marginBottom: 10, display: 'block' }}>{errors.selectedAssetIds}</span>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {deviceSlots.map((slotId, slotIdx) => {
                const selected = slotId ? inventoryAssets.find((a) => String(a.id) === String(slotId)) : null;
                const usedInOtherSlots = deviceSlots.filter((_, i) => i !== slotIdx).filter(Boolean);
                const options = availableAssets.filter((a) => !usedInOtherSlots.includes(String(a.id)) || String(a.id) === slotId);
                return (
                  <div key={slotIdx} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f8fafc', borderBottom: selected ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                          Device {slotIdx + 1}
                        </label>
                        <select
                          className="form-select"
                          value={slotId}
                          onChange={(e) => updateSlot(slotIdx, e.target.value)}
                          style={{ maxWidth: 480 }}
                        >
                          <option value="">— Select a device —</option>
                          {options.map((a) => (
                            <option key={a.id} value={String(a.id)}>
                              {getAssetDisplayId(a)}{a.serialNumber ? ` — S/N: ${a.serialNumber}` : ''}{a.model ? ` — ${a.model}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      {deviceSlots.length > 1 && (
                        <button onClick={() => removeSlot(slotIdx)} title="Remove this slot" style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderRadius: 6, border: '1px solid #fee2e2', background: '#fff5f5', cursor: 'pointer', color: '#ef4444', marginTop: 20 }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {selected && (
                      <>
                        {/* Device info card */}
                        <div style={{ padding: '14px 16px', background: '#f0fdf4', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 24px' }}>
                          <div><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Device ID</span><p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{getAssetDisplayId(selected)}</p></div>
                          <div><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Serial Number</span><p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{selected.serialNumber || '-'}</p></div>
                          <div><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Type</span><p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{selected.type || '-'}</p></div>
                          <div><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Brand / Model</span><p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{[selected.brand, selected.model].filter(Boolean).join(' ') || '-'}</p></div>
                          <div><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Configuration</span><p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{selected.configuration || selected.configurations || '-'}</p></div>
                          <div><span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</span><p style={{ margin: '2px 0 0' }}><span className={`status-badge status-${String(selected.status || 'idle').toLowerCase().replace(/\s+/g, '-')}`}>{selected.status || 'Idle'}</span></p></div>
                        </div>

                        {/* Printer-specific settings */}
                        {selected.type === 'Printer' && (() => {
                          const ps = printerSettings[slotIdx] || {};
                          const replaceForm = ps.replaceForm || { oldEndPageCount: '', newAssetId: '', newStartPageCount: '' };
                          const replaceOptions = availableAssets.filter((a) => a.type === 'Printer' && String(a.id) !== String(slotId));

                          const confirmReplace = () => {
                            if (!replaceForm.newAssetId) return;
                            const newAsset = inventoryAssets.find((a) => String(a.id) === replaceForm.newAssetId);
                            const entry = {
                              replacedAt: new Date().toISOString().split('T')[0],
                              oldInventoryAssetId: selected.id,
                              oldAssetTag: getAssetDisplayId(selected),
                              oldStartPageCount: Number(ps.startPageCount) || 0,
                              oldEndPageCount: Number(replaceForm.oldEndPageCount) || 0,
                              newInventoryAssetId: replaceForm.newAssetId,
                              newAssetTag: newAsset ? getAssetDisplayId(newAsset) : replaceForm.newAssetId,
                              newStartPageCount: Number(replaceForm.newStartPageCount) || 0,
                            };
                            setPrinterSettings((p) => ({
                              ...p,
                              [slotIdx]: {
                                ...(p[slotIdx] || {}),
                                startPageCount: replaceForm.newStartPageCount,
                                replacementHistory: [...(ps.replacementHistory || []), entry],
                                replacePending: false,
                                replaceForm: { oldEndPageCount: '', newAssetId: '', newStartPageCount: '' },
                              },
                            }));
                            updateSlot(slotIdx, replaceForm.newAssetId);
                          };

                          return (
                            <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                              {/* Printer Settings */}
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Printer Settings</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Page-wise Billing</span>
                                  <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 22, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={!!ps.pageWiseBilling} onChange={(e) => updatePrinterSetting(slotIdx, 'pageWiseBilling', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{ position: 'absolute', inset: 0, background: ps.pageWiseBilling ? '#4f46e5' : '#cbd5e1', borderRadius: 22, transition: '0.2s' }}>
                                      <span style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: ps.pageWiseBilling ? 21 : 3, transition: '0.2s' }} />
                                    </span>
                                  </label>
                                </div>
                                {ps.pageWiseBilling && (
                                  <div className="form-group" style={{ margin: 0, minWidth: 200 }}>
                                    <label style={{ fontSize: '0.78rem' }}>Start Page Count</label>
                                    <input className="form-input" type="number" min="0" value={ps.startPageCount || ''} onChange={(e) => updatePrinterSetting(slotIdx, 'startPageCount', e.target.value)} placeholder="e.g. 0" />
                                  </div>
                                )}
                              </div>

                              {/* Replacement history summary */}
                              {(ps.replacementHistory || []).length > 0 && (
                                <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8 }}>
                                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: 6 }}>Replacement History</div>
                                  {ps.replacementHistory.map((r, ri) => (
                                    <div key={ri} style={{ fontSize: '0.8rem', color: '#78350f', marginBottom: 2 }}>
                                      {r.replacedAt}: {r.oldAssetTag} (end: {r.oldEndPageCount} pages) → {r.newAssetTag} (start: {r.newStartPageCount} pages)
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Replace Printer (edit mode only) */}
                              {editId && (
                                <div>
                                  {!ps.replacePending ? (
                                    <button type="button" onClick={() => updatePrinterSetting(slotIdx, 'replacePending', true)}
                                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e0e7ff', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                                      Replace Printer
                                    </button>
                                  ) : (
                                    <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', marginBottom: 12 }}>Replace Printer</div>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 16px', marginBottom: 12 }}>
                                        <div className="form-group" style={{ margin: 0 }}>
                                          <label style={{ fontSize: '0.78rem' }}>Old Printer End Page Count</label>
                                          <input className="form-input" type="number" min="0" value={replaceForm.oldEndPageCount} onChange={(e) => updatePrinterSetting(slotIdx, 'replaceForm', { ...replaceForm, oldEndPageCount: e.target.value })} placeholder="Final reading" />
                                        </div>
                                        <div className="form-group" style={{ margin: 0 }}>
                                          <label style={{ fontSize: '0.78rem' }}>Select New Printer</label>
                                          <select className="form-select" value={replaceForm.newAssetId} onChange={(e) => updatePrinterSetting(slotIdx, 'replaceForm', { ...replaceForm, newAssetId: e.target.value })}>
                                            <option value="">— Select —</option>
                                            {replaceOptions.map((a) => (
                                              <option key={a.id} value={String(a.id)}>{getAssetDisplayId(a)}{a.serialNumber ? ` — S/N: ${a.serialNumber}` : ''}{a.model ? ` — ${a.model}` : ''}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="form-group" style={{ margin: 0 }}>
                                          <label style={{ fontSize: '0.78rem' }}>New Printer Start Page Count</label>
                                          <input className="form-input" type="number" min="0" value={replaceForm.newStartPageCount} onChange={(e) => updatePrinterSetting(slotIdx, 'replaceForm', { ...replaceForm, newStartPageCount: e.target.value })} placeholder="Starting reading" />
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        <button type="button" onClick={confirmReplace} disabled={!replaceForm.newAssetId}
                                          style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#fff', cursor: replaceForm.newAssetId ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.82rem', opacity: replaceForm.newAssetId ? 1 : 0.5 }}>
                                          Confirm Replace
                                        </button>
                                        <button type="button" onClick={() => updatePrinterSetting(slotIdx, 'replacePending', false)}
                                          style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={addSlot} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px dashed #6366f1', background: 'transparent', color: '#6366f1', cursor: 'pointer', fontWeight: 600, fontSize: '0.84rem' }}>
              <Plus size={14} /> Add Another Device
            </button>
          </div>
        </div>

        {showAddDeviceModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', maxWidth: 480, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#0f172a' }}>Add New Device</h3>
              <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>Device will be saved to Inventory and auto-selected here.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Device ID *</label>
                  <input className="form-input" value={newDeviceForm.assetTag} onChange={(e) => setNewDeviceForm((f) => ({ ...f, assetTag: e.target.value }))} placeholder="e.g. RB-LAP-002" />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-select" value={newDeviceForm.type} onChange={(e) => setNewDeviceForm((f) => ({ ...f, type: e.target.value }))}>
                    {['Laptop', 'Desktop', 'Server', 'Printer', 'CCTV', 'VPS'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <input className="form-input" value={newDeviceForm.brand} onChange={(e) => setNewDeviceForm((f) => ({ ...f, brand: e.target.value }))} placeholder="e.g. Dell" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Model *</label>
                  <input className="form-input" value={newDeviceForm.model} onChange={(e) => setNewDeviceForm((f) => ({ ...f, model: e.target.value }))} placeholder="e.g. Latitude 5420" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Serial Number <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>(Auto-generated on save)</span></label>
                  <input className="form-input" value="SN-RB-XXXXX" readOnly style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'default' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button onClick={() => { setShowAddDeviceModal(false); setNewDeviceForm({ assetTag: '', type: 'Laptop', brand: '', model: '', serialNumber: '' }); }} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>
                <button onClick={handleAddDeviceSave} disabled={addingDevice || !newDeviceForm.assetTag.trim() || !newDeviceForm.brand.trim() || !newDeviceForm.model.trim()} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', opacity: addingDevice ? 0.7 : 1 }}>
                  {addingDevice ? 'Saving...' : 'Save & Select'}
                </button>
              </div>
            </div>
          </div>
        )}

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
