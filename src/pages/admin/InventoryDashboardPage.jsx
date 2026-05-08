import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Boxes, CheckCircle2, HardDrive, IndianRupee, Package, Plus, Printer, Wrench } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { assetManagementService } from '../../services/assetManagementService';
import '../InventoryPremiumStyles.css';

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

const InventoryDashboardPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    Promise.all([
      inventoryService.getItems(),
      inventoryService.getStats(),
      assetManagementService.getAssets(),
    ])
      .then(([nextItems, nextInventoryStats, nextAssets]) => {
        setItems(nextItems);
        setInventoryStats(nextInventoryStats);
        setAssets(nextAssets);
      })
      .catch((error) => setNotice(error.response?.data?.message || error.message || 'Inventory dashboard failed to load.'));
  }, []);

  const assetStatusCounts = useMemo(() => {
    const counts = { Active: 0, 'In repair': 0, Replaced: 0, Idle: 0 };
    assets.forEach((asset) => {
      const status = normalizeAssetStatus(asset.status);
      if (counts[status] !== undefined) counts[status] += 1;
    });
    return counts;
  }, [assets]);

  const lowStockItems = items
    .filter((item) => item.type === 'Sales' && Number(item.currentStock || 0) <= Number(item.minStock || 0))
    .slice(0, 5);
  const recentAssets = assets.slice(0, 5);

  return (
    <div className="inventory-page">
      {notice && <div className="inventory-notice">{notice}</div>}

      <section className="inventory-hero">
        <div>
          <span className="inventory-eyebrow">Inventory Dashboard</span>
          <h1>Inventory & Assets</h1>
          <p>Stock listing, device lifecycle, and repair readiness overview for your printer and laptop operations.</p>
        </div>
        <div className="inventory-hero-actions">
          <button className="inventory-secondary-button" onClick={() => navigate('/inventory')}>
            <Package size={17} /> Inventory Listing
          </button>
          <button className="inventory-primary-button" onClick={() => navigate('/admin/inventory/asset-management')}>
            <Plus size={17} /> Add Asset
          </button>
        </div>
      </section>

      <section className="inventory-kpis">
        <MetricCard icon={<Boxes />} label="Inventory Items" value={inventoryStats.totalItems || items.length} tone="blue" />
        <MetricCard icon={<AlertTriangle />} label="Low Stock" value={inventoryStats.lowStock || 0} tone={(inventoryStats.lowStock || 0) ? 'red' : 'green'} />
        <MetricCard icon={<HardDrive />} label="Device Assets" value={assets.length} tone="indigo" />
        <MetricCard icon={<Wrench />} label="In Repair" value={assetStatusCounts['In repair']} tone="amber" />
        <MetricCard icon={<CheckCircle2 />} label="Active" value={assetStatusCounts.Active} tone="green" />
        <MetricCard icon={<IndianRupee />} label="Stock Value" value={money(inventoryStats.stockValue)} tone="slate" />
      </section>

      <div className="inventory-dashboard-grid">
        <section className="inventory-panel">
          <div className="inventory-section-header">
            <div>
              <h2>Asset Status</h2>
              <p>Individual printer/laptop lifecycle count.</p>
            </div>
          </div>
          <div className="inventory-status-grid">
            {Object.entries(assetStatusCounts).map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="inventory-panel">
          <div className="inventory-section-header">
            <div>
              <h2>Stock Value</h2>
              <p>Current spare and saleable stock valuation.</p>
            </div>
          </div>
          <div className="inventory-value-card">
            <strong>{money(inventoryStats.stockValue)}</strong>
            <span>Profit potential: {money(inventoryStats.totalProfitPotential)}</span>
          </div>
        </section>

        <section className="inventory-panel">
          <div className="inventory-section-header">
            <div>
              <h2>Low Stock Alerts</h2>
              <p>Items that need purchase follow-up.</p>
            </div>
          </div>
          <MiniStockTable rows={lowStockItems} />
        </section>

        <section className="inventory-panel">
          <div className="inventory-section-header">
            <div>
              <h2>Recent Devices</h2>
              <p>Latest asset records from Asset Management.</p>
            </div>
          </div>
          <MiniAssetTable rows={recentAssets} />
        </section>
      </div>
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

const MiniStockTable = ({ rows }) => (
  <div className="inventory-table-wrap">
    <table className="inventory-table mini">
      <thead>
        <tr><th>Item</th><th>Stock</th><th>Minimum</th></tr>
      </thead>
      <tbody>
        {rows.map((item) => (
          <tr key={item.id}>
            <td><Package size={15} /> {item.name}</td>
            <td>{item.currentStock || 0}</td>
            <td>{item.minStock || 0}</td>
          </tr>
        ))}
        {rows.length === 0 && <tr><td colSpan="3" className="inventory-empty">No low stock items.</td></tr>}
      </tbody>
    </table>
  </div>
);

const MiniAssetTable = ({ rows }) => (
  <div className="inventory-table-wrap">
    <table className="inventory-table mini">
      <thead>
        <tr><th>Device ID</th><th>Model</th><th>Status</th></tr>
      </thead>
      <tbody>
        {rows.map((asset) => (
          <tr key={asset.id}>
            <td><Printer size={15} /> {asset.assetTag || asset.id}</td>
            <td>{asset.model || '-'}</td>
            <td><span className={`inventory-status ${statusTone(asset.status)}`}>{normalizeAssetStatus(asset.status)}</span></td>
          </tr>
        ))}
        {rows.length === 0 && <tr><td colSpan="3" className="inventory-empty">No assets added.</td></tr>}
      </tbody>
    </table>
  </div>
);

export default InventoryDashboardPage;
