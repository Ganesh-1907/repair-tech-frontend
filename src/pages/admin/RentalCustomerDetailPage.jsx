import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalCustomerService } from '../../services/rentalCustomerService';
import { rentalStore } from '../../services/rentalDataStore';

const tabs = ['Overview', 'Locations', 'Assets', 'Agreements', 'Invoices', 'Maintenance', 'Replacements', 'Notes'];

const RentalCustomerDetailPage = () => {
  const { customerId } = useParams();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [customer, setCustomer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    rentalCustomerService.getCustomer(customerId).then(setCustomer);
    setSnapshot(rentalStore.getState());
  }, [customerId]);

  const customerAssets = useMemo(() => (snapshot?.assets || []).filter((row) => row.customerId === customerId), [snapshot, customerId]);
  const customerContracts = useMemo(() => (snapshot?.contracts || []).filter((row) => row.customerId === customerId), [snapshot, customerId]);
  const customerInvoices = useMemo(() => (snapshot?.invoices || []).filter((row) => row.customerId === customerId), [snapshot, customerId]);
  
  const customerMaintenance = useMemo(() => {
    const assetIds = new Set(customerAssets.map((row) => row.id));
    return (snapshot?.maintenanceLogs || []).filter((row) => assetIds.has(row.assetId));
  }, [snapshot, customerAssets]);

  const customerReplacements = useMemo(() => {
    return customerAssets.flatMap(a => (a.replacements || []).map(r => ({ ...r, serial: a.serialNumber })));
  }, [customerAssets]);

  if (!customer) return <div className="p-8">Loading customer profile...</div>;

  const headerActions = [
    { label: 'Edit Profile', icon: Edit2, onClick: () => {} },
    { label: 'New Quotation', icon: FileText, onClick: () => {} },
  ];

  return (
    <div className="admin-module-page">
      <AdminPageHeader
        title={customer.companyName || customer.customerName}
        description={`Customer ID: ${customer.id} | ${customer.customerType}`}
        breadcrumbs={['Admin', 'Rental Management', 'Customers', 'Profile']}
        actions={headerActions}
      />

      <div className="job-detail-tabs bg-card rounded-lg border border-subtle p-1 mb-6 flex overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button 
            key={tab} 
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-muted hover:bg-hover'}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="admin-section-stack">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="card-header px-0 pt-0"><h3>Customer Identity</h3></div>
              <div className="detail-list space-y-4">
                <div className="flex justify-between border-b border-subtle pb-2"><span>Type</span><strong className="status-pill status-primary">{customer.customerType}</strong></div>
                <div className="flex justify-between border-b border-subtle pb-2"><span>Auth Person 1</span><strong>{customer.authorizedPerson1}</strong></div>
                <div className="flex justify-between border-b border-subtle pb-2"><span>Auth Person 2</span><strong>{customer.authorizedPerson2 || '-'}</strong></div>
                <div className="flex justify-between border-b border-subtle pb-2"><span>GST Number</span><strong className="uppercase">{customer.gstNumber || 'Not provided'}</strong></div>
              </div>
            </div>
            <div className="card p-6">
              <div className="card-header px-0 pt-0"><h3>Contact & Billing</h3></div>
              <div className="detail-list space-y-4">
                <div className="flex justify-between border-b border-subtle pb-2"><span>Phone</span><strong>{customer.contactNumber}</strong></div>
                <div className="flex justify-between border-b border-subtle pb-2"><span>Email</span><strong>{customer.email}</strong></div>
                <div className="flex flex-col gap-1 border-b border-subtle pb-2"><span>Registered Address</span><p className="text-sm font-bold">{customer.address}</p></div>
                <div className="flex flex-col gap-1 border-b border-subtle pb-2"><span>Billing Address</span><p className="text-sm font-bold">{customer.billingAddress}</p></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Locations' && (
          <div className="card overflow-hidden">
            <table className="leads-table">
              <thead><tr><th>Location Name</th><th>Address</th><th>Contact Person</th><th>Phone</th><th>GST Branch</th></tr></thead>
              <tbody>
                {(customer.locations || []).map((loc) => (
                  <tr key={loc.id}>
                    <td className="font-bold">{loc.locationName}</td>
                    <td className="text-xs">{loc.address}</td>
                    <td>{loc.contactPerson}</td>
                    <td>{loc.phone}</td>
                    <td className="text-xs">{loc.gstBranch || 'Main'}</td>
                  </tr>
                ))}
                {(customer.locations || []).length === 0 && <tr><td colSpan="5" className="text-center py-8">No branches added.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Assets' && (
          <div className="card overflow-hidden">
            <table className="leads-table">
              <thead><tr><th>Serial No</th><th>Model</th><th>Location</th><th>Installation Date</th><th>Technician</th><th>Status</th></tr></thead>
              <tbody>
                {customerAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="font-mono text-xs font-bold">{asset.serialNumber}</td>
                    <td>{asset.model}</td>
                    <td>{asset.customerLocation}</td>
                    <td>{asset.installationDate}</td>
                    <td>{asset.technician}</td>
                    <td><span className={`status-pill status-${asset.status === 'Installed' ? 'success' : 'warning'}`}>{asset.status}</span></td>
                  </tr>
                ))}
                {customerAssets.length === 0 && <tr><td colSpan="6" className="text-center py-8">No assets installed for this customer.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Agreements' && (
          <div className="card overflow-hidden">
            <table className="leads-table">
              <thead><tr><th>Contract No</th><th>Type</th><th>Start Date</th><th>End Date</th><th>Rent (₹)</th><th>Status</th></tr></thead>
              <tbody>
                {customerContracts.map((c) => (
                  <tr key={c.id}>
                    <td className="font-bold">{c.contractNo}</td>
                    <td>{c.agreementType}</td>
                    <td>{c.startDate}</td>
                    <td>{c.endDate}</td>
                    <td>{c.monthlyRent}</td>
                    <td><span className={`status-pill status-${c.status === 'Active' ? 'success' : 'danger'}`}>{c.status}</span></td>
                  </tr>
                ))}
                {customerContracts.length === 0 && <tr><td colSpan="6" className="text-center py-8">No agreements found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Invoices' && (
          <div className="card overflow-hidden">
            <table className="leads-table">
              <thead><tr><th>Invoice ID</th><th>Month</th><th>Amount</th><th>Outstanding</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {customerInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-bold">{inv.id}</td>
                    <td>{inv.billingMonth}</td>
                    <td>{inv.total}</td>
                    <td className="text-danger font-bold">{inv.outstanding}</td>
                    <td>{inv.createdAt}</td>
                    <td><span className="status-pill status-pending">{inv.paymentStatus}</span></td>
                  </tr>
                ))}
                {customerInvoices.length === 0 && <tr><td colSpan="6" className="text-center py-8">No invoices generated.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Maintenance' && (
          <div className="card overflow-hidden">
            <table className="leads-table">
              <thead><tr><th>Date</th><th>Asset</th><th>Issue</th><th>Resolution</th><th>Technician</th><th>Status</th></tr></thead>
              <tbody>
                {customerMaintenance.map((log) => (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td className="font-mono text-xs">{log.assetId}</td>
                    <td className="text-sm">{log.issueDescription}</td>
                    <td className="text-sm">{log.resolutionNotes}</td>
                    <td>{log.technician}</td>
                    <td><span className="status-pill status-success">{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Replacements' && (
          <div className="card overflow-hidden">
            <table className="leads-table">
              <thead><tr><th>Date</th><th>Serial No</th><th>New Asset ID</th><th>Reason</th><th>Technician</th></tr></thead>
              <tbody>
                {customerReplacements.map((rep, i) => (
                  <tr key={i}>
                    <td>{rep.date}</td>
                    <td className="font-mono text-xs">{rep.serial}</td>
                    <td className="font-mono text-xs">{rep.newAssetId}</td>
                    <td>{rep.reason}</td>
                    <td>{rep.technician}</td>
                  </tr>
                ))}
                {customerReplacements.length === 0 && <tr><td colSpan="5" className="text-center py-8">No replacement history.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Notes' && (
          <div className="card p-6">
            <div className="card-header px-0 pt-0"><h3>Customer Notes</h3></div>
            <textarea 
              className="table-input h-64" 
              placeholder="Internal notes about this customer, specific requirements, or special terms..."
              defaultValue={customer.notes}
            />
            <div className="mt-4 text-right">
              <button className="btn btn-primary"><Save size={16} /> Save Notes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalCustomerDetailPage;

