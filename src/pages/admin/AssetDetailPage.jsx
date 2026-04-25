import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipboardList, History, Link2, ScanSearch, Settings2, X } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { adminAssetInventory } from '../../data/adminAssetsMock';

const AssetDetailPage = () => {
  const { assetId } = useParams();
  const [notice, setNotice] = useState('');
  const asset = useMemo(
    () => adminAssetInventory.find((entry) => entry.id === assetId),
    [assetId]
  );

  if (!asset) {
    return (
      <div className="admin-module-page asset-detail-admin-page">
        <AdminPageHeader
          title="Asset Detail"
          description="The requested asset was not found in current inventory records."
          breadcrumbs={['Admin', 'Admin Home Page', 'Inventory', 'Asset Management', assetId || 'Asset']}
          actions={[
            { label: 'Back to Asset List', onClick: () => window.history.back() },
          ]}
        />
        <div className="card empty-state">
          <h3>Asset not found</h3>
          <p>The selected asset id is unavailable. Please return to asset list and pick another device.</p>
          <Link className="btn btn-primary" to="/admin/inventory/asset-management">Open Asset List</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-module-page asset-detail-admin-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss asset detail notice">
            <X size={16} />
          </button>
        </div>
      )}

      <AdminPageHeader
        title={`Asset Detail - ${asset.id}`}
        description="Per-device tracking view with assignment, service history, and usage placeholders."
        breadcrumbs={['Admin', 'Admin Home Page', 'Inventory', 'Asset Management', asset.id]}
        actions={[
          { label: 'Manage Assignment', icon: Link2, onClick: () => setNotice(`${asset.id} assignment manager placeholder opened.`) },
          { label: 'Record Service', variant: 'secondary', icon: History, onClick: () => setNotice(`${asset.id} service entry placeholder opened.`) },
        ]}
      />

      <div className="admin-split-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Device Information</h3>
              <p>Core identifiers and hardware specifications.</p>
            </div>
          </div>
          <div className="notification-stats">
            <div className="stat-row"><span>Device ID</span><span className="count">{asset.id}</span></div>
            <div className="stat-row"><span>Serial Number</span><span className="count">{asset.serialNumber}</span></div>
            <div className="stat-row"><span>Type</span><span className="count">{asset.type}</span></div>
            <div className="stat-row"><span>Model</span><span className="count">{asset.model}</span></div>
            <div className="stat-row"><span>Configurations</span><span className="count">{asset.configurations}</span></div>
            <div className="stat-row"><span>Add-on parts</span><span className="count">{asset.addOnParts}</span></div>
            <div className="stat-row"><span>Status</span><span className="count">{asset.status}</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3>Customer / Branch Assignment</h3>
              <p>Assignment and ownership placeholders.</p>
            </div>
          </div>
          <div className="admin-section-stack">
            <div className="admin-placeholder-row">
              <ClipboardList size={16} className="icon-primary" />
              <div>
                <h4>Current assignment</h4>
                <p>{asset.assignment}</p>
              </div>
            </div>
            <div className="admin-placeholder-row">
              <Settings2 size={16} className="icon-muted" />
              <div>
                <h4>Assignment workflow</h4>
                <p>Detailed branch transfer and customer ownership workflow will be attached later.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-split-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Service History</h3>
              <p>Historical service and maintenance placeholder.</p>
            </div>
          </div>
          <div className="admin-section-stack">
            <div className="admin-placeholder-row">
              <History size={16} className="icon-info" />
              <div>
                <h4>Latest service note</h4>
                <p>{asset.serviceHistory}</p>
              </div>
            </div>
            <div className="admin-placeholder-row">
              <ClipboardList size={16} className="icon-muted" />
              <div>
                <h4>Upcoming service timeline</h4>
                <p>Detailed service records, engineer notes, and checklist will be plugged in when backend module is shared.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3>Usage Tracking</h3>
              <p>Usage telemetry placeholder for optimization decisions.</p>
            </div>
          </div>
          <div className="admin-section-stack">
            <div className="admin-placeholder-row">
              <ScanSearch size={16} className="icon-success" />
              <div>
                <h4>Latest usage insight</h4>
                <p>{asset.usageTracking}</p>
              </div>
            </div>
            <div className="admin-placeholder-row">
              <Settings2 size={16} className="icon-muted" />
              <div>
                <h4>Telemetry integration</h4>
                <p>Automated counters, alerts, and trend reports will be connected in the next API cycle.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailPage;
