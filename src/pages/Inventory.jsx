import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
const ASSET_TYPES = ['Laptop', 'Desktop', 'Printer', 'CCTV', 'Server', 'UPS'];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({});
  const [activeView, setActiveView] = useState('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockType, setStockType] = useState('All');
  const [assetStatus, setAssetStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewAsset, setViewAsset] = useState(null);
  const [editAsset, setEditAsset] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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
  }

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

  const isAddModalOpen = showAddModal || searchParams.get('asset') === '1';

  const closeAddModal = () => {
    setShowAddModal(false);
    if (searchParams.get('asset') === '1') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('asset');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const lowStock = Number(stats.lowStock || items.filter((item) => item.type === 'Sales' && Number(item.currentStock) <= Number(item.minStock)).length);

  return (
    <div className="inventory-page">
      <section className="inventory-hero">
        <div>
          <span className="inventory-eyebrow">Inventory & Asset Management</span>
          <h1>Device assets and stock listing</h1>
          <p>Track every device — printers, laptops, desktops, CCTV, servers, UPS, and more — by serial number while keeping spare parts, sale stock, and low-stock alerts in one clean view.</p>
        </div>
        <div className="inventory-hero-actions">
          <button className="inventory-icon-button" onClick={handleReset} title="Reset stock inventory">
            <RefreshCcw size={18} />
          </button>
          <button className="inventory-primary-button" onClick={() => setShowAddModal(true)}>
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
              onView={(asset) => setViewAsset(asset)}
              onEdit={(asset) => setEditAsset(asset)}
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

      {isAddModalOpen && (
        <AssetFormModal
          onClose={closeAddModal}
          onSave={async () => {
            await loadData();
            closeAddModal();
            setActiveView('assets');
          }}
        />
      )}

      {editAsset && (
        <AssetFormModal
          asset={editAsset}
          onClose={() => setEditAsset(null)}
          onSave={async () => {
            await loadData();
            setEditAsset(null);
          }}
        />
      )}

      {viewAsset && (
        <ViewAssetModal
          asset={viewAsset}
          onClose={() => setViewAsset(null)}
          onEdit={() => { setEditAsset(viewAsset); setViewAsset(null); }}
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
  if (normalized === 'desktop') return <Cpu size={20} />;
  if (normalized === 'cctv') return <Camera size={20} />;
  if (normalized === 'server') return <Database size={20} />;
  if (normalized === 'ups') return <Zap size={20} />;
  return <HardDrive size={20} />;
};

const AssetRowMenu = ({ asset, onView, onEdit }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="inv-row-menu" ref={ref}>
      <button className="inv-row-menu-trigger" onClick={() => setOpen((v) => !v)} title="Actions">
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="inv-row-menu-dropdown">
          <button onClick={() => { onView(asset); setOpen(false); }}>View</button>
          <button onClick={() => { onEdit(asset); setOpen(false); }}>Edit</button>
        </div>
      )}
    </div>
  );
};

const AssetTable = ({ assets, onView, onEdit }) => (
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
            <td><AssetRowMenu asset={asset} onView={onView} onEdit={onEdit} /></td>
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

const AssetFormModal = ({ asset, onClose, onSave }) => {
  const isEdit = !!asset;
  const [formData, setFormData] = useState({
    assetTag: asset?.assetTag || '',
    serialNumber: asset?.serialNumber || '',
    type: asset?.type || 'Printer',
    model: asset?.model || '',
    configuration: asset?.configuration || asset?.configurations || '',
    addOnParts: asset?.addOnParts || '',
    status: normalizeAssetStatus(asset?.status) || 'Active',
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

    const payload = { ...formData, configurations: formData.configuration, purchasePrice: 0, currentValue: 0 };
    if (isEdit) {
      await assetManagementService.updateAsset(asset.id, payload);
    } else {
      await assetManagementService.addAsset(payload);
    }
    await onSave();
  };

  return (
    <Modal
      title={isEdit ? 'Edit Asset' : 'Add Asset'}
      subtitle="Each device is tracked individually by serial number."
      onClose={onClose}
      onSave={handleSave}
      saveLabel={isEdit ? 'Save Changes' : 'Save Asset'}
    >
      <div className="inventory-form-grid two">
        <Field label="Device ID" error={errors.assetTag}>
          <input value={formData.assetTag} onChange={(e) => update('assetTag', e.target.value)} placeholder="RT-PRN-001" />
        </Field>
        <Field label="Serial Number" error={errors.serialNumber}>
          <input value={formData.serialNumber} onChange={(e) => update('serialNumber', e.target.value)} placeholder="SN-4582-XL" />
        </Field>
      </div>
      <div className="inventory-form-grid three">
        <Field label="Type">
          <select value={formData.type} onChange={(e) => update('type', e.target.value)}>
            {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Model" error={errors.model}>
          <input value={formData.model} onChange={(e) => update('model', e.target.value)} placeholder="HP LaserJet / Dell Latitude" />
        </Field>
        <Field label="Status">
          <select value={formData.status} onChange={(e) => update('status', e.target.value)}>
            {ASSET_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Configurations">
        <textarea value={formData.configuration} onChange={(e) => update('configuration', e.target.value)} placeholder="Processor, RAM, storage, resolution, channels, speed, capacity..." />
      </Field>
      <Field label="Add-on Parts">
        <textarea value={formData.addOnParts} onChange={(e) => update('addOnParts', e.target.value)} placeholder="Extra tray, duplex unit, RAM upgrade, docking station..." />
      </Field>
    </Modal>
  );
};

const VIEW_FIELDS = [
  { label: 'Device ID', key: (a) => a.assetTag || a.id },
  { label: 'Serial Number', key: (a) => a.serialNumber },
  { label: 'Type', key: (a) => a.type },
  { label: 'Model', key: (a) => a.model },
  { label: 'Status', key: (a) => normalizeAssetStatus(a.status) },
  { label: 'Configurations', key: (a) => a.configuration || a.configurations },
  { label: 'Add-on Parts', key: (a) => a.addOnParts },
];

const ViewAssetModal = ({ asset, onClose, onEdit }) => (
  <Modal title="Asset Details" subtitle={asset.assetTag || asset.id} onClose={onClose} onSave={onEdit} saveLabel="Edit">
    <div className="inv-view-grid">
      {VIEW_FIELDS.map(({ label, key }) => (
        <div key={label} className="inv-view-field">
          <span>{label}</span>
          <strong>{key(asset) || '-'}</strong>
        </div>
      ))}
    </div>
  </Modal>
);

const Field = ({ label, error, children }) => (
  <label className="inventory-field">
    <span>{label}</span>
    {children}
    {error && <small>{error}</small>}
  </label>
);

const Modal = ({ title, subtitle, children, onClose, onSave, saveLabel }) => (
  <div className="inventory-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="inventory-modal" role="dialog" aria-modal="true" aria-labelledby="inventory-modal-title">
      <header>
        <div>
          <h2 id="inventory-modal-title">{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button onClick={onClose} title="Close"><X size={20} /></button>
      </header>
      <div className="inventory-modal-body">{children}</div>
      <footer>
        <button className="inventory-secondary-button" onClick={onClose}>Cancel</button>
        <button className="inventory-primary-button" onClick={onSave}>{saveLabel}</button>
      </footer>
    </div>
  </div>
);

export default InventoryManagement;
