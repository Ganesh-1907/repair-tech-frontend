import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Eye,
  HardDrive,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  Wrench,
} from 'lucide-react';
import { assetManagementService } from '../../services/assetManagementService';
import { useToast } from '../../context/ToastContext';
import '../InventoryPremiumStyles.css';

const ASSET_STATUSES = ['Active', 'In repair', 'Replaced', 'Idle', 'Sold'];

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
  const [filterType, setFilterType] = useState('All');

  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = (asset) => setConfirmDelete(asset);

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      await assetManagementService.deleteAsset(confirmDelete.id);
      addToast('Asset deleted.');
      setAssets((prev) => prev.filter((a) => a.id !== confirmDelete.id));
    } catch {
      addToast('Failed to delete asset.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

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
    const next = { Active: 0, 'In repair': 0, Replaced: 0, Idle: 0 };
    assets.forEach((asset) => {
      const status = normalizeAssetStatus(asset.status);
      if (next[status] !== undefined) next[status] += 1;
    });
    return next;
  }, [assets]);

  const deviceTypes = useMemo(() => {
    const types = new Set(assets.map(a => a.type).filter(Boolean));
    return ['All', ...Array.from(types)];
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
      const matchesType = filterType === 'All' || asset.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assets, searchTerm, filterStatus, filterType]);

  return (
    <div className="inventory-page">
      <section className="inventory-hero">
        <div>
          <span className="inventory-eyebrow">Inventory & Assets</span>
          <h1>Asset Management</h1>
        </div>
        <div className="inventory-hero-actions">
          <button className="inventory-primary-button" type="button" onClick={() => navigate('/admin/inventory/assets/new')}>
            <Plus size={17} /> Add Asset
          </button>
        </div>
      </section>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0f172a' }}>Delete Asset?</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#64748b' }}>
              This will permanently delete <strong>{confirmDelete.assetTag || confirmDelete.id}</strong> (S/N: {confirmDelete.serialNumber || '-'}) from the system. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={doDelete} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <section className="inventory-kpis">
        <MetricCard icon={<HardDrive />} label="Total Devices" value={assets.length} tone="indigo" />
        <MetricCard icon={<CheckCircle2 />} label="Active" value={counts.Active} tone="green" />
        <MetricCard icon={<Wrench />} label="In Repair" value={counts['In repair']} tone="amber" />
        <MetricCard icon={<Settings2 />} label="Replaced" value={counts.Replaced} tone="red" />
        <MetricCard icon={<Clock />} label="Idle" value={counts.Idle} tone="slate" />
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

        <div className="inventory-filter-row" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
            <option value="All">All Status</option>
            {ASSET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 160 }}>
            <option value="All">All Devices</option>
            {deviceTypes.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <AssetTable assets={filteredAssets} onView={(id) => navigate(`/admin/inventory/assets/view/${id}`)} onEdit={(id) => navigate(`/admin/inventory/assets/${id}`)} onDelete={handleDelete} />
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

const AssetTable = ({ assets, onEdit, onDelete, onView }) => (
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
          <th style={{ width: 110 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr key={asset.id}>
            <td>
              <div className="inventory-device-cell">
                <div className="inventory-device-icon"><HardDrive size={20} /></div>
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
            <td>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => onView(asset.id)}
                  title="View asset"
                  style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', color: '#0891b2' }}
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => onEdit(asset.id)}
                  title="Edit asset"
                  style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', color: '#4f46e5' }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(asset)}
                  title="Delete asset"
                  style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: 6, border: '1px solid #fee2e2', background: '#fff5f5', cursor: 'pointer', color: '#ef4444' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {assets.length === 0 && (
          <tr><td colSpan="7" className="inventory-empty">No assets match this view.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

export default AssetManagementPage;
