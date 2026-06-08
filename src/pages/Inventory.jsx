import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import { normalizeRole } from '../config/roles';
import './InventoryPremiumStyles.css';

const ASSET_STATUSES = ['Active', 'In repair', 'Replaced', 'Idle'];
const UNIT_OPTIONS = ['-', 'Nos', 'Mtr', 'Pcs', 'Box', 'Set', 'Roll', 'Sqft'];


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
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManageInventory = role !== 'sales';
  const canViewInventoryDetails = true;
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({});
  const [activeView, setActiveView] = useState('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockType, setStockType] = useState('All');
  const [assetStatus, setAssetStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockForm, setStockForm] = useState([{ name: '', serialNumber: '', quantity: '', unit: '-' }]);
  const [activeStockItem, setActiveStockItem] = useState(null);
  const [stockModalMode, setStockModalMode] = useState(null);

  const handleViewStock = (item) => {
    setActiveStockItem({ ...item });
    setStockModalMode('view');
  };

  const handleEditStock = (item) => {
    setActiveStockItem({ ...item });
    setStockModalMode('edit');
  };

  const handleCloseStockModal = () => {
    setActiveStockItem(null);
    setStockModalMode(null);
  };

  const handleActiveStockItemChange = (field, value) => {
    setActiveStockItem(prev => ({ ...prev, [field]: value }));
  };

  const saveActiveStockItem = async () => {
    if (!activeStockItem.name || !activeStockItem.name.trim()) {
      addToast('Item Name is required', 'error');
      return;
    }
    try {
      await inventoryService.updateItem(activeStockItem.id, {
        ...activeStockItem,
        name: activeStockItem.name.trim(),
        sku: activeStockItem.sku || '-',
        currentStock: Number(activeStockItem.currentStock) || 0,
        unit: activeStockItem.unit || '-',
      });
      addToast('Stock item updated successfully.');
      handleCloseStockModal();
      await loadData();
    } catch (e) {
      addToast(e?.response?.data?.message || 'Failed to update stock item.', 'error');
    }
  };



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
      const matchesType = filterType === 'All' || asset.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assets, searchTerm, assetStatus, filterType]);

  const assetCounts = useMemo(() => {
    const counts = { Active: 0, 'In repair': 0, Replaced: 0, Idle: 0 };
    assets.forEach((asset) => {
      const status = normalizeAssetStatus(asset.status);
      if (counts[status] !== undefined) counts[status] += 1;
    });
    return counts;
  }, [assets]);

  const deviceTypes = useMemo(() => {
    const types = new Set(assets.map(a => a.type).filter(Boolean));
    return ['All', ...Array.from(types)];
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

  const handleStockFormChange = (index, field, value) => {
    setStockForm(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const addStockRow = () => setStockForm(prev => [...prev, { name: '', serialNumber: '', quantity: '', unit: '-' }]);
  const removeStockRow = (index) => {
    if (stockForm.length === 1) return;
    setStockForm(prev => prev.filter((_, i) => i !== index));
  };

  const saveStock = async () => {
    const valid = stockForm.filter(r => r.name.trim());
    if (valid.length === 0) return;
    try {
      await Promise.all(valid.map(r => inventoryService.addItem({
        name: r.name.trim(),
        sku: r.serialNumber.trim() || '-',
        type: 'Sales',
        category: 'Parts',
        sellingPrice: 0,
        purchasePrice: 0,
        currentStock: Number(r.quantity) || 1,
        minStock: 1,
        unit: r.unit || 'Pcs',
        status: 'Active',
      })));
      addToast('Stock items added.');
      setShowStockModal(false);
      setStockForm([{ name: '', serialNumber: '', quantity: '', unit: '-' }]);
      await loadData();
    } catch (e) {
      addToast(e?.response?.data?.message || 'Failed to add stock.', 'error');
    }
  };

  const lowStock = Number(stats.lowStock || items.filter((item) => item.type === 'Sales' && Number(item.currentStock) <= Number(item.minStock)).length);

  return (
    <>
    <div className="inventory-page">
      <section className="inventory-hero">
        <div>
          <span className="inventory-eyebrow">Inventory & Asset Management</span>
          <h1>Device assets and stock listing</h1>
        </div>
        <div className="inventory-hero-actions">
          {canManageInventory && (
            <button className="inventory-icon-button" onClick={handleReset} title="Reset stock inventory">
              <RefreshCcw size={18} />
            </button>
          )}
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

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <div className="inventory-search" style={{ flex: '0 1 300px' }}>
              <Search size={17} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={activeView === 'assets' ? 'Search device ID, serial, model, parts...' : 'Search item, SKU, supplier...'}
              />
            </div>
            {activeView === 'assets' ? (
              <>
                <select className="form-select" value={assetStatus} onChange={e => setAssetStatus(e.target.value)} style={{ width: 150 }}>
                  <option value="All">All Status</option>
                  {ASSET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 150 }}>
                  <option value="All">All Devices</option>
                  {deviceTypes.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </>
            ) : (
              <select className="form-select" value={stockType} onChange={e => setStockType(e.target.value)} style={{ width: 150 }}>
                <option value="All">All Items</option>
                <option value="Sales">Sales</option>
                <option value="Service">Service</option>
              </select>
            )}
            {canManageInventory && activeView === 'assets' && (
              <button className="inventory-primary-button" onClick={() => navigate('/admin/inventory/assets/new')}>
                <Plus size={17} /> Add Asset
              </button>
            )}
            {canManageInventory && activeView === 'stock' && (
              <button className="inventory-primary-button" onClick={() => setShowStockModal(true)} style={{ background: '#16a34a', borderColor: '#16a34a' }}>
                <Plus size={17} /> Add Stock
              </button>
            )}
          </div>
        </div>

        {activeView === 'assets' ? (
          <AssetTable
            assets={filteredAssets}
            onView={(asset) => navigate(`/admin/inventory/assets/${asset.id}/view`)}
            onEdit={(asset) => navigate(`/admin/inventory/assets/${asset.id}/edit`)}
            onDelete={handleDeleteAsset}
            canManage={canManageInventory}
            canViewDetails={canViewInventoryDetails}
          />
        ) : (
          <StockTable 
            items={filteredItems} 
            onView={handleViewStock}
            onEdit={handleEditStock}
            onDelete={handleDeleteItem} 
            canManage={canManageInventory} 
          />
        )}
      </section>
    </div>

    {showStockModal && (
      <div className="inventory-modal-backdrop">
        <div className="inventory-modal" style={{ maxWidth: 850, width: '100%' }}>
          <header>
            <div>
              <h2>Add Stock Items</h2>
              <p>Add new parts or service items directly to the stock list</p>
            </div>
            <button onClick={() => { setShowStockModal(false); setStockForm([{ name: '', serialNumber: '', quantity: '', unit: '-' }]); }} aria-label="Close modal">
              <X size={18} />
            </button>
          </header>
          <div className="inventory-modal-body">
            <table className="inventory-table" style={{ width: '100%', minWidth: 'auto', marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 12px', width: '35%' }}>Item Name</th>
                  <th style={{ padding: '10px 12px', width: '25%' }}>Serial Number</th>
                  <th style={{ padding: '10px 12px', width: '15%' }}>Qty</th>
                  <th style={{ padding: '10px 12px', width: '15%' }}>Unit</th>
                  <th style={{ padding: '10px 12px', width: '10%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockForm.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '8px 12px' }}>
                      <input 
                        className="form-input" 
                        value={row.name} 
                        onChange={e => handleStockFormChange(i, 'name', e.target.value)} 
                        placeholder="e.g. Toner Cartridge" 
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#0f172a' }} 
                      />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input 
                        className="form-input" 
                        value={row.serialNumber} 
                        onChange={e => handleStockFormChange(i, 'serialNumber', e.target.value)} 
                        placeholder="S/N" 
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#0f172a' }} 
                      />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input 
                        type="number"
                        min="1"
                        className="form-input" 
                        value={row.quantity} 
                        onChange={e => handleStockFormChange(i, 'quantity', e.target.value)} 
                        placeholder="1" 
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#0f172a' }} 
                      />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <select 
                        className="form-select" 
                        value={row.unit} 
                        onChange={e => handleStockFormChange(i, 'unit', e.target.value)} 
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#0f172a', height: '37px' }}
                      >
                        {UNIT_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                        <button 
                          onClick={() => removeStockRow(i)} 
                          disabled={stockForm.length === 1} 
                          style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: 8, 
                            border: '1px solid #fee2e2', 
                            background: '#fff5f5', 
                            color: '#ef4444', 
                            cursor: stockForm.length === 1 ? 'not-allowed' : 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            opacity: stockForm.length === 1 ? 0.4 : 1 
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                        {i === stockForm.length - 1 && (
                          <button 
                            onClick={addStockRow} 
                            style={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: 8, 
                              border: '1px solid #c7d2fe', 
                              background: '#eef2ff', 
                              color: '#4f46e5', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}
                            title="Add item row"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer>
            <button 
              onClick={() => { setShowStockModal(false); setStockForm([{ name: '', serialNumber: '', quantity: '', unit: '-' }]); }} 
              style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #dbe3ef', background: '#ffffff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginRight: 10 }}
            >
              Cancel
            </button>
            <button 
              onClick={saveStock} 
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
            >
              Save Items
            </button>
          </footer>
        </div>
      </div>
    )}

    {stockModalMode && activeStockItem && (
      <div className="inventory-modal-backdrop">
        <div className="inventory-modal" style={{ maxWidth: 600, width: '100%' }}>
          <header>
            <div>
              <h2>{stockModalMode === 'edit' ? 'Edit Stock Item' : 'Stock Item Details'}</h2>
              <p>{stockModalMode === 'edit' ? 'Update the details for this inventory item' : 'View full details of this inventory item'}</p>
            </div>
            <button onClick={handleCloseStockModal} aria-label="Close modal">
              <X size={18} />
            </button>
          </header>
          
          <div className="inventory-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px' }}>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Item Name</label>
              {stockModalMode === 'edit' ? (
                <input 
                  className="form-input" 
                  value={activeStockItem.name || ''} 
                  onChange={e => handleActiveStockItemChange('name', e.target.value)}
                  placeholder="e.g. Toner Cartridge"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              ) : (
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                  {activeStockItem.name || '-'}
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Serial Number / SKU</label>
              {stockModalMode === 'edit' ? (
                <input 
                  className="form-input" 
                  value={activeStockItem.sku || ''} 
                  onChange={e => handleActiveStockItemChange('sku', e.target.value)}
                  placeholder="S/N"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              ) : (
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                  {activeStockItem.sku || '-'}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Qty</label>
              {stockModalMode === 'edit' ? (
                <input 
                  type="number"
                  className="form-input" 
                  value={activeStockItem.currentStock ?? 0} 
                  onChange={e => handleActiveStockItemChange('currentStock', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              ) : (
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                  {activeStockItem.currentStock || 0}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Unit</label>
              {stockModalMode === 'edit' ? (
                <select 
                  className="form-select" 
                  value={activeStockItem.unit || '-'} 
                  onChange={e => handleActiveStockItemChange('unit', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', height: '41px' }}
                >
                  {UNIT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>
                  {activeStockItem.unit || '-'}
                </div>
              )}
            </div>

          </div>

          <footer>
            <button 
              onClick={handleCloseStockModal} 
              style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #dbe3ef', background: '#ffffff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginRight: 10 }}
            >
              {stockModalMode === 'edit' ? 'Cancel' : 'Close'}
            </button>
            {stockModalMode === 'edit' && (
              <button 
                onClick={saveActiveStockItem} 
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
              >
                Save Changes
              </button>
            )}
          </footer>
        </div>
      </div>
    )}


    {confirmDelete && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    </>
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

const AssetRowMenu = ({ asset, onView, onEdit, onDelete, canManage, canViewDetails }) => {
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
          {canViewDetails && <button onClick={() => { onView(asset); setOpen(false); }}>View</button>}
          {canManage && <button onClick={() => { onEdit(asset); setOpen(false); }}>Edit</button>}
          {canManage && <button onClick={() => { onDelete(asset); setOpen(false); }} style={{ color: '#ef4444' }}>Delete</button>}
        </div>
      )}
    </div>
  );
};

const StockRowMenu = ({ item, onView, onEdit, onDelete, canManage }) => {
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
          <button onClick={() => { onView(item); setOpen(false); }}>View</button>
          {canManage && <button onClick={() => { onEdit(item); setOpen(false); }}>Edit</button>}
          {canManage && <button onClick={() => { onDelete(item.id); setOpen(false); }} style={{ color: '#ef4444' }}>Delete</button>}
        </div>
      )}
    </div>
  );
};


const AssetTable = ({ assets, onView, onEdit, onDelete, canManage, canViewDetails }) => (
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
          {(canViewDetails || canManage) && <th></th>}
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
            {(canViewDetails || canManage) && (
              <td><AssetRowMenu asset={asset} onView={onView} onEdit={onEdit} onDelete={onDelete} canManage={canManage} canViewDetails={canViewDetails} /></td>
            )}
          </tr>
        ))}
        {assets.length === 0 && (
          <tr><td colSpan={canViewDetails || canManage ? 7 : 6} className="inventory-empty">No assets match this view.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

const StockTable = ({ items, onView, onEdit, onDelete, canManage }) => (
  <div className="inventory-table-wrap">
    <table className="inventory-table">
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Serial Number</th>
          <th>Qty</th>
          <th>Unit</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>
              <div className="inventory-device-cell">
                <div className="inventory-device-icon">
                  <Package size={20} />
                </div>
                <div>
                  <strong>{item.name}</strong>
                </div>
              </div>
            </td>
            <td>{item.sku || item.supplier || '-'}</td>
            <td><strong>{item.currentStock ?? 0}</strong></td>
            <td>{item.unit || '-'}</td>
            <td>
              <StockRowMenu item={item} onView={onView} onEdit={onEdit} onDelete={onDelete} canManage={canManage} />
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr><td colSpan={5} className="inventory-empty">No inventory items match this view.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

export default InventoryManagement;
