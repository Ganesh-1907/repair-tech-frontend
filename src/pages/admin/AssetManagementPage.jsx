import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  HardDrive,
  Monitor,
  Plus,
  Printer,
  QrCode,
  Search,
  Settings2,
  Wrench,
  X,
} from 'lucide-react';
import { assetManagementService } from '../../services/assetManagementService';
import { useToast } from '../../context/ToastContext';
import '../InventoryPremiumStyles.css';

const ASSET_STATUSES = ['Active', 'In repair', 'Replaced', 'Idle'];

const normalizeAssetStatus = (status) => {
  if (status === 'Available' || status === 'Rented' || status === 'Sold') return 'Active';
  if (status === 'Under Repair') return 'In repair';
  return status || 'Idle';
};

const statusTone = (status) => {
  switch (normalizeAssetStatus(status)) {
    case 'Active': return 'green';
    case 'In repair': return 'amber';
    case 'Replaced': return 'red';
    case 'Idle': return 'slate';
    default: return 'blue';
  }
};

const AssetManagementPage = () => {
  const { addToast } = useToast();
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const nextAssets = await assetManagementService.getAssets();
      setAssets(nextAssets);
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Asset records failed to load.', 'error');
    }
  }

  const counts = useMemo(() => {
    const next = { Active: 0, 'In repair': 0, Replaced: 0, Idle: 0, Printer: 0, Laptop: 0 };
    assets.forEach((asset) => {
      const status = normalizeAssetStatus(asset.status);
      if (next[status] !== undefined) next[status] += 1;
      if (String(asset.type).toLowerCase() === 'printer') next.Printer += 1;
      if (String(asset.type).toLowerCase() === 'laptop') next.Laptop += 1;
    });
    return next;
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return assets.filter((asset) => {
      const haystack = [
        asset.assetTag,
        asset.id,
        asset.serialNumber,
        asset.type,
        asset.model,
        asset.configuration,
        asset.configurations,
        asset.addOnParts,
      ].join(' ').toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesStatus = filterStatus === 'All' || normalizeAssetStatus(asset.status) === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [assets, searchTerm, filterStatus]);

  return (
    <div className="inventory-page">
      <section className="inventory-hero">
        <div>
          <span className="inventory-eyebrow">Asset Management</span>
          <h1>Printer and laptop lifecycle</h1>
          <p>Each device is tracked individually with Device ID, serial number, model, configurations, add-on parts, and lifecycle status.</p>
        </div>
        <div className="inventory-hero-actions">
          <button className="inventory-secondary-button" type="button">
            <QrCode size={17} /> Bulk QR Print
          </button>
          <button className="inventory-primary-button" type="button" onClick={() => setShowAddModal(true)}>
            <Plus size={17} /> Add Asset
          </button>
        </div>
      </section>

      <section className="inventory-kpis">
        <MetricCard icon={<HardDrive />} label="Total Devices" value={assets.length} tone="indigo" />
        <MetricCard icon={<CheckCircle2 />} label="Active" value={counts.Active} tone="green" />
        <MetricCard icon={<Wrench />} label="In Repair" value={counts['In repair']} tone="amber" />
        <MetricCard icon={<Settings2 />} label="Replaced" value={counts.Replaced} tone="red" />
        <MetricCard icon={<Clock />} label="Idle" value={counts.Idle} tone="slate" />
        <MetricCard icon={<Printer />} label="Printers" value={counts.Printer} tone="blue" />
        <MetricCard icon={<Monitor />} label="Laptops" value={counts.Laptop} tone="indigo" />
      </section>

      <section className="inventory-panel">
        <div className="inventory-toolbar">
          <div className="inventory-tabs">
            <button className="active" type="button"><HardDrive size={16} /> Asset Listing</button>
          </div>
          <div className="inventory-search">
            <Search size={17} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search device ID, serial number, model, configuration..."
            />
          </div>
        </div>

        <div className="inventory-filter-row">
          {['All', ...ASSET_STATUSES].map((status) => (
            <button key={status} className={filterStatus === status ? 'active' : ''} onClick={() => setFilterStatus(status)}>
              {status}
            </button>
          ))}
        </div>

        <AssetTable assets={filteredAssets} />
      </section>

      {showAddModal && (
        <AddAssetModal
          onClose={() => setShowAddModal(false)}
          onSave={async () => {
            await loadData();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

const MetricCard = ({ icon, label, value, tone }) => (
  <div className={`inventory-metric metric-${tone}`}>
    <div className="inventory-metric-icon">{React.cloneElement(icon, { size: 21 })}</div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);

const DeviceIcon = ({ type }) => {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'printer') return <Printer size={20} />;
  if (normalized === 'laptop') return <Monitor size={20} />;
  return <HardDrive size={20} />;
};

const AssetTable = ({ assets }) => (
  <div className="inventory-table-wrap">
    <table className="inventory-table asset-table">
      <thead>
        <tr>
          <th>Device ID / Serial Number</th>
          <th>Type</th>
          <th>Model</th>
          <th>Configurations</th>
          <th>Add-on Parts</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr key={asset.id}>
            <td>
              <div className="inventory-device-cell">
                <div className="inventory-device-icon"><DeviceIcon type={asset.type} /></div>
                <div>
                  <strong>{asset.assetTag || asset.id}</strong>
                  <span>S/N: {asset.serialNumber || '-'}</span>
                </div>
              </div>
            </td>
            <td>{asset.type || '-'}</td>
            <td>{asset.model || '-'}</td>
            <td className="inventory-muted-cell">{asset.configuration || asset.configurations || '-'}</td>
            <td className="inventory-muted-cell">{asset.addOnParts || '-'}</td>
            <td><span className={`inventory-status ${statusTone(asset.status)}`}>{normalizeAssetStatus(asset.status)}</span></td>
          </tr>
        ))}
        {assets.length === 0 && (
          <tr><td colSpan="6" className="inventory-empty">No assets match this view.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const AddAssetModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    assetTag: '',
    serialNumber: '',
    type: 'Printer',
    model: '',
    configuration: '',
    addOnParts: '',
    status: 'Active',
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const handleSave = async () => {
    const nextErrors = {};
    if (!formData.assetTag.trim()) nextErrors.assetTag = 'Device ID is required';
    if (!formData.serialNumber.trim()) nextErrors.serialNumber = 'Serial number is required';
    if (!formData.model.trim()) nextErrors.model = 'Model is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await assetManagementService.addAsset({
      ...formData,
      configurations: formData.configuration,
      purchasePrice: 0,
      currentValue: 0,
    });
    await onSave();
  };

  return (
    <div className="inventory-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="inventory-modal" role="dialog" aria-modal="true" aria-labelledby="asset-modal-title">
        <header>
          <div>
            <h2 id="asset-modal-title">Add Asset</h2>
            <p>Track each printer or laptop individually.</p>
          </div>
          <button onClick={onClose} title="Close"><X size={20} /></button>
        </header>
        <div className="inventory-modal-body">
          <div className="inventory-form-grid two">
            <Field label="Device ID" error={errors.assetTag}>
              <input value={formData.assetTag} onChange={(event) => update('assetTag', event.target.value)} placeholder="RT-PRN-001" />
            </Field>
            <Field label="Serial Number" error={errors.serialNumber}>
              <input value={formData.serialNumber} onChange={(event) => update('serialNumber', event.target.value)} placeholder="SN-4582-XL" />
            </Field>
          </div>
          <div className="inventory-form-grid three">
            <Field label="Type">
              <select value={formData.type} onChange={(event) => update('type', event.target.value)}>
                <option>Printer</option>
                <option>Laptop</option>
              </select>
            </Field>
            <Field label="Model" error={errors.model}>
              <input value={formData.model} onChange={(event) => update('model', event.target.value)} placeholder="HP LaserJet / Dell Latitude" />
            </Field>
            <Field label="Status">
              <select value={formData.status} onChange={(event) => update('status', event.target.value)}>
                {ASSET_STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Configurations">
            <textarea value={formData.configuration} onChange={(event) => update('configuration', event.target.value)} placeholder="Processor, RAM, storage, printer speed, tray capacity..." />
          </Field>
          <Field label="Add-on Parts">
            <textarea value={formData.addOnParts} onChange={(event) => update('addOnParts', event.target.value)} placeholder="Extra tray, duplex unit, RAM upgrade, docking station..." />
          </Field>
        </div>
        <footer>
          <button className="inventory-secondary-button" onClick={onClose}>Cancel</button>
          <button className="inventory-primary-button" onClick={handleSave}>Save Asset</button>
        </footer>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <label className="inventory-field">
    <span>{label}</span>
    {children}
    {error && <small>{error}</small>}
  </label>
);

export default AssetManagementPage;
