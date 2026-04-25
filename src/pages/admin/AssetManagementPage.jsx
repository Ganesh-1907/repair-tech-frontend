import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Filter, MonitorSmartphone, Plus, Search, Settings2, X } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { adminAssetInventory } from '../../data/adminAssetsMock';

const typeFilters = ['All', 'Printer', 'Laptop', 'Desktop', 'Other'];
const statusFilters = ['All', 'Active', 'In Repair', 'Replaced', 'Idle'];

const getStatusClass = (status) => {
  if (status === 'Active') return 'status-pill status-completed';
  if (status === 'In Repair') return 'status-pill status-pending';
  if (status === 'Replaced') return 'status-pill status-overdue';
  return 'status-pill status-draft';
};

const AssetManagementPage = () => {
  const [assets] = useState(adminAssetInventory);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState('');

  const filteredAssets = useMemo(() => (
    assets.filter((asset) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesQuery = query.length === 0
        || asset.id.toLowerCase().includes(query)
        || asset.serialNumber.toLowerCase().includes(query)
        || asset.model.toLowerCase().includes(query)
        || asset.assignment.toLowerCase().includes(query);
      const matchesType = typeFilter === 'All' || asset.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    })
  ), [assets, searchTerm, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: assets.length,
    active: assets.filter((asset) => asset.status === 'Active').length,
    repair: assets.filter((asset) => asset.status === 'In Repair').length,
    idle: assets.filter((asset) => asset.status === 'Idle').length,
  }), [assets]);

  return (
    <div className="admin-module-page asset-management-admin-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss asset notice">
            <X size={16} />
          </button>
        </div>
      )}

      <AdminPageHeader
        title="Asset Management"
        description="Track each printer, laptop, desktop, and other device across status, assignment, and lifecycle."
        breadcrumbs={['Admin', 'Admin Home Page', 'Inventory', 'Asset Management']}
        actions={[
          { label: 'Add Asset', icon: Plus, onClick: () => setNotice('Asset onboarding form placeholder is ready.') },
          { label: 'Manage Filters', variant: 'secondary', icon: Filter, onClick: () => setNotice('Advanced filter panel placeholder opened.') },
        ]}
      />

      <div className="summary-grid admin-kpi-grid">
        <div className="card summary-card">
          <div className="summary-icon-container primary"><Boxes size={22} /></div>
          <div><span className="summary-label">Total Devices</span><h3 className="summary-value">{stats.total}</h3></div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon-container success"><MonitorSmartphone size={22} /></div>
          <div><span className="summary-label">Active</span><h3 className="summary-value">{stats.active}</h3></div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon-container warning"><Settings2 size={22} /></div>
          <div><span className="summary-label">In Repair</span><h3 className="summary-value">{stats.repair}</h3></div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon-container info"><Search size={22} /></div>
          <div><span className="summary-label">Idle</span><h3 className="summary-value">{stats.idle}</h3></div>
        </div>
      </div>

      <div className="card table-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search assets by id, serial, model, branch..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search assets"
          />
        </div>
        <div className="filter-group">
          <label className="sr-only" htmlFor="asset-type-filter">Asset type filter</label>
          <select
            id="asset-type-filter"
            className="form-select sm"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            {typeFilters.map((filter) => (
              <option key={filter} value={filter}>Type: {filter}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="asset-status-filter">Asset status filter</label>
          <select
            id="asset-status-filter"
            className="form-select sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statusFilters.map((filter) => (
              <option key={filter} value={filter}>Status: {filter}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Device ID / Serial Number</th>
              <th>Type</th>
              <th>Model / Configurations</th>
              <th>Add-on parts</th>
              <th>Status</th>
              <th>Customer / Branch Assignment</th>
              <th>Service history</th>
              <th>Usage tracking</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.id}>
                <td>
                  <div className="item-cell">
                    <span className="bold">{asset.id}</span>
                    <span className="company-name">{asset.serialNumber}</span>
                  </div>
                </td>
                <td><span className="source-tag amc">{asset.type}</span></td>
                <td>
                  <div className="item-cell">
                    <span className="bold truncate-text" title={asset.model}>{asset.model}</span>
                    <span className="company-name truncate-text" title={asset.configurations}>{asset.configurations}</span>
                  </div>
                </td>
                <td>
                  <span className="truncate-text" title={asset.addOnParts}>{asset.addOnParts}</span>
                </td>
                <td><span className={getStatusClass(asset.status)}>{asset.status}</span></td>
                <td>
                  <span className="truncate-text" title={asset.assignment}>{asset.assignment}</span>
                </td>
                <td>
                  <span className="truncate-text" title={asset.serviceHistory}>{asset.serviceHistory}</span>
                </td>
                <td>
                  <span className="truncate-text" title={asset.usageTracking}>{asset.usageTracking}</span>
                </td>
                <td>
                  <div className="action-btns">
                    <Link
                      className="btn btn-sm btn-secondary"
                      to={`/admin/inventory/asset-management/${asset.id}`}
                      aria-label={`View details for ${asset.id}`}
                    >
                      View
                    </Link>
                    <button
                      className="btn btn-sm btn-secondary"
                      type="button"
                      onClick={() => setNotice(`${asset.id} marked for assignment review.`)}
                    >
                      Manage
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan="9">
                  <div className="empty-state">
                    <h3>No assets found</h3>
                    <p>Try a different search/filter combination.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetManagementPage;
