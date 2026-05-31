import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Boxes,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  HardDrive,
  IndianRupee,
  Monitor,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Trash2,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { assetManagementService } from '../services/assetManagementService';
import { useToast } from '../context/ToastContext';
import './InventoryPremiumStyles.css';

const ASSET_STATUSES = ['Active', 'In repair', 'Replaced', 'Idle'];

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

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

const InventoryManagement = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({});
  const [activeView, setActiveView] = useState('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockType, setStockType] = useState('All');
  const [assetStatus, setAssetStatus] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDeleteAsset = (asset) => setConfirmDelete(asset);

  const doDeleteAsset = async () => {
    if (!confirmDelete) return;
    try {
      await assetManagementService.deleteAsset(confirmDelete.id);
      setAssets((prev) => prev.filter((a) => a.id !== confirmDelete.id));
      addToast('Asset deleted.');
    } catch {
      addToast('Failed to delete asset.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [nextItems, nextStats, nextAssets] = await Promise.all([
        inventoryService.getItems(),
        inventoryService.getStats(),
        assetManagementService.getAssets(),
      ]);
      setItems(nextItems);
      setStats(nextStats);
      setAssets(nextAssets);
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Inventory data failed to load.', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadData();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [loadData]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const text = [item.name, item.sku, item.category, item.supplier, item.model].join(' ').toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesType = stockType === 'All' || item.type === stockType;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, stockType]);

  const filteredAssets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return assets.filter((asset) => {
      const text = [
        asset.assetTag,
        asset.id,
        asset.serialNumber,
        asset.type,
        asset.model,
        asset.configuration,
        asset.configurations,
        asset.addOnParts,
      ].join(' ').toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesStatus = assetStatus === 'All' || normalizeAssetStatus(asset.status) === assetStatus;
      return matchesSearch && matchesStatus;
    });
  }, [assets, searchTerm, assetStatus]);

  const assetCounts = useMemo(() => {
    const counts = { Active: 0, 'In repair': 0, Replaced: 0, Idle: 0 };
    assets.forEach((asset) => {
      const status = normalizeAssetStatus(asset.status);
      if (counts[status] !== undefined) counts[status] += 1;
    });
    return counts;
  }, [assets]);

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    await inventoryService.deleteItem(id);
    await loadData();
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all inventory stock items to factory defaults?')) return;
    await inventoryService.resetItems();
    await loadData();
  };

  const lowStock = Number(stats.lowStock || items.filter((item) => item.type === 'Sales' && Number(item.currentStock) <= Number(item.minStock)).length);

  return (
    <div className="inventory-page">
      <section className="inventory-hero">
        <div>
          <span className="inventory-eyebrow">Inventory & Asset Management</span>
          <h1>Device assets and stock listing</h1>
        </div>
        <div className="inventory-hero-actions">
          <button className="inventory-icon-button" onClick={handleReset} title="Reset stock inventory">
            <RefreshCcw size={18} />
          </button>
          <button className="inventory-primary-button" onClick={() => navigate('/admin/inventory/assets/new')}>
            <Plus size={17} /> Add Asset
          </button>
        </div>
      </section>

      <section className="inventory-kpis">
        <MetricCard icon={<HardDrive />} label="Tracked Assets" value={assets.length} tone="indigo" />
        <MetricCard icon={<CheckCircle2 />} label="Active Devices" value={assetCounts.Active} tone="green" />
        <MetricCard icon={<Wrench />} label="In Repair" value={assetCounts['In repair']} tone="amber" />
        <MetricCard icon={<Boxes />} label="Stock Items" value={stats.totalItems || items.length} tone="blue" />
        <MetricCard icon={<AlertTriangle />} label="Low Stock" value={lowStock} tone={lowStock ? 'red' : 'green'} />
        <MetricCard icon={<IndianRupee />} label="Stock Value" value={money(stats.stockValue)} tone="slate" />
      </section>

      <section className="inventory-panel">
        <div className="inventory-toolbar">
          <div className="inventory-tabs" role="tablist" aria-label="Inventory views">
            <button className={activeView === 'assets' ? 'active' : ''} onClick={() => setActiveView('assets')}>
              <HardDrive size={16} /> Asset Listing
            </button>
            <button className={activeView === 'stock' ? 'active' : ''} onClick={() => setActiveView('stock')}>
              <Package size={16} /> Stock Inventory
            </button>
          </div>

          <div className="inventory-search">
            <Search size={17} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={activeView === 'assets' ? 'Search device ID, serial, model, parts...' : 'Search item, SKU, supplier...'}
            />
          </div>
        </div>

        {activeView === 'assets' ? (
          <>
            <div className="inventory-filter-row">
              {['All', ...ASSET_STATUSES].map((status) => (
                <button key={status} className={assetStatus === status ? 'active' : ''} onClick={() => setAssetStatus(status)}>
                  {status}
                </button>
              ))}
            </div>
            <AssetTable
              assets={filteredAssets}
              onView={(asset) => navigate(`/admin/inventory/assets/${asset.id}/view`)}
              onEdit={(asset) => navigate(`/admin/inventory/assets/${asset.id}/edit`)}
              onDelete={handleDeleteAsset}
            />
          </>
        ) : (
          <>
            <div className="inventory-filter-row">
              {['All', 'Sales', 'Service'].map((type) => (
                <button key={type} className={stockType === type ? 'active' : ''} onClick={() => setStockType(type)}>
                  {type === 'All' ? 'All Items' : type}
                </button>
              ))}
            </div>
            <StockTable items={filteredItems} onDelete={handleDeleteItem} />
          </>
        )}
      </section>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0f172a' }}>Delete Asset?</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#64748b' }}>
              Permanently delete <strong>{confirmDelete.assetTag || confirmDelete.id}</strong> (S/N: {confirmDelete.serialNumber || '-'})? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={doDeleteAsset} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Delete</button>
            </div>
          </div>
        </div>
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
  if (normalized === 'desktop') return <Cpu size={20} />;
  if (normalized === 'cctv') return <Camera size={20} />;
  if (normalized === 'server') return <Database size={20} />;
  if (normalized === 'ups') return <Zap size={20} />;
  return <HardDrive size={20} />;
};

const AssetRowMenu = ({ asset, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', handler);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const toggleMenu = (event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 132;
    const menuHeight = 88;
    const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
    const opensUp = rect.bottom + menuHeight > window.innerHeight - 8;
    const top = opensUp ? Math.max(8, rect.top - menuHeight - 6) : rect.bottom + 6;
    setPosition({ top, left });
    setOpen((value) => !value);
  };

  return (
    <div className="inv-row-menu" ref={ref}>
      <button className="inv-row-menu-trigger" onClick={toggleMenu} title="Actions">
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="inv-row-menu-dropdown" style={{ top: position.top, left: position.left }}>
          <button onClick={() => { onView(asset); setOpen(false); }}>View</button>
          <button onClick={() => { onEdit(asset); setOpen(false); }}>Edit</button>
          <button onClick={() => { onDelete(asset); setOpen(false); }} style={{ color: '#ef4444' }}>Delete</button>
        </div>
      )}
    </div>
  );
};

const AssetTable = ({ assets, onView, onEdit, onDelete }) => (
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
          <th></th>
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
            <td><AssetRowMenu asset={asset} onView={onView} onEdit={onEdit} onDelete={onDelete} /></td>
          </tr>
        ))}
        {assets.length === 0 && (
          <tr><td colSpan="7" className="inventory-empty">No assets match this view.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const StockTable = ({ items, onDelete }) => (
  <div className="inventory-table-wrap">
    <table className="inventory-table">
      <thead>
        <tr>
          <th>Item / Supplier</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const currentStock = Number(item.currentStock || 0);
          const minStock = Number(item.minStock || 0);
          const isLow = item.type === 'Sales' && currentStock <= minStock;
          const stockPercent = minStock ? Math.min((currentStock / (minStock * 3)) * 100, 100) : 100;
          return (
            <tr key={item.id}>
              <td>
                <div className="inventory-device-cell">
                  <div className={`inventory-device-icon ${item.type === 'Service' ? 'service' : ''}`}>
                    {item.type === 'Service' ? <Activity size={20} /> : <Package size={20} />}
                  </div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.sku || item.supplier || 'No SKU'}</span>
                  </div>
                </div>
              </td>
              <td><span className="inventory-chip">{item.type}</span><small>{item.category || '-'}</small></td>
              <td><strong>{money(item.sellingPrice)}</strong><span className="inventory-subtext">Cost {money(item.purchasePrice)}</span></td>
              <td>
                {item.type === 'Sales' ? (
                  <div className="inventory-stock">
                    <div><strong className={isLow ? 'danger' : ''}>{currentStock} {item.unit || 'pcs'}</strong><span>Min {minStock}</span></div>
                    <div className="inventory-stock-bar"><i style={{ width: `${stockPercent}%` }} /></div>
                  </div>
                ) : (
                  <span className="inventory-subtext">Labor/service item</span>
                )}
              </td>
              <td><span className={`inventory-status ${isLow ? 'red' : 'green'}`}>{isLow ? 'Low stock' : item.status || 'Active'}</span></td>
              <td>
                <button className="inventory-danger-button" onClick={() => onDelete(item.id)} title="Delete item">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          );
        })}
        {items.length === 0 && (
          <tr><td colSpan="6" className="inventory-empty">No inventory items match this view.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

export default InventoryManagement;
