import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalAssetService } from '../../services/rentalAssetService';

const tabs = ['Overview', 'Installation', 'Meter Readings', 'Billing Rules', 'Maintenance Logs', 'Replacement History', 'Add-ons'];

const RentalAssetDetailPage = () => {
  const { assetId } = useParams();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    rentalAssetService.getAsset(assetId).then(setAsset);
  }, [assetId]);

  if (!asset) return null;

  return (
    <div className="admin-module-page">
      <AdminPageHeader
        title={`Asset: ${asset.assetId}`}
        description="Detail page with operational tabs."
        breadcrumbs={['Admin', 'Rental Management', 'Assets & Installations', asset.assetId]}
      />

      <div className="job-detail-tabs" role="tablist">
        {tabs.map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}
      </div>

      {activeTab === 'Overview' && <div className="card"><div className="detail-list"><div><span>Model</span><strong>{asset.model}</strong></div><div><span>Status</span><strong>{asset.status}</strong></div><div><span>Agreement</span><strong>{asset.agreementId}</strong></div><div><span>Customer</span><strong>{asset.customerName}</strong></div></div></div>}
      {activeTab === 'Installation' && <div className="card"><div className="detail-list"><div><span>Installation Date</span><strong>{asset.installationDate}</strong></div><div><span>Technician</span><strong>{asset.technician}</strong></div><div><span>Notes</span><strong>{asset.installationNotes}</strong></div></div></div>}
      {activeTab === 'Meter Readings' && <div className="card overflow-hidden"><table className="leads-table"><thead><tr><th>Month</th><th>Previous</th><th>Current</th><th>Usage</th><th>Amount</th></tr></thead><tbody>{(asset.meterReadings || []).map((row) => <tr key={row.id}><td>{row.month}</td><td>{row.previousReading}</td><td>{row.currentReading}</td><td>{row.usage}</td><td>{row.calculatedAmount}</td></tr>)}</tbody></table></div>}
      {activeTab === 'Billing Rules' && <div className="card"><p>Pricing plan and minimum commitment rules are managed from Billing & Invoices.</p></div>}
      {activeTab === 'Maintenance Logs' && <div className="card overflow-hidden"><table className="leads-table"><thead><tr><th>Date</th><th>Issue</th><th>Resolution</th><th>Technician</th></tr></thead><tbody>{(asset.maintenanceLogs || []).map((row) => <tr key={row.id}><td>{row.date}</td><td>{row.issue}</td><td>{row.resolution}</td><td>{row.technician}</td></tr>)}</tbody></table></div>}
      {activeTab === 'Replacement History' && <div className="card"><p>Replacement handling and pro-rated split billing records appear here.</p></div>}
      {activeTab === 'Add-ons' && <div className="card overflow-hidden"><table className="leads-table"><thead><tr><th>Name</th><th>Type</th><th>Price</th><th>Discount</th><th>Billing</th><th>Start</th><th>End</th></tr></thead><tbody>{(asset.addOns || []).map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.type}</td><td>{row.price}</td><td>{row.discount}</td><td>{row.billingType}</td><td>{row.startDate}</td><td>{row.endDate || '-'}</td></tr>)}</tbody></table></div>}
    </div>
  );
};

export default RentalAssetDetailPage;

