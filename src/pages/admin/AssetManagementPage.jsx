import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadData = useCallback(async () => {
    try {
      const nextAssets = await assetManagementService.getAssets();
      setAssets(nextAssets);
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Asset records failed to load.', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadData();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [loadData]);

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
          <button className="inventory-primary-button" type="button" onClick={() => navigate('/admin/inventory/assets/new')}>
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

export default AssetManagementPage;
