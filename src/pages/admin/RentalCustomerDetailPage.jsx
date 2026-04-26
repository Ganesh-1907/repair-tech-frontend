import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalCustomerService } from '../../services/rentalCustomerService';
import { rentalStore } from '../../services/rentalDataStore';

const tabs = ['Overview', 'Locations', 'Devices', 'Contracts', 'Invoices', 'Payments', 'Maintenance History'];

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
  const customerPayments = useMemo(() => {
    const invoiceIds = new Set(customerInvoices.map((row) => row.id));
    return (snapshot?.payments || []).filter((row) => invoiceIds.has(row.invoiceId));
  }, [snapshot, customerInvoices]);
  const customerMaintenance = useMemo(() => {
    const assetIds = new Set(customerAssets.map((row) => row.id));
    return (snapshot?.maintenanceLogs || []).filter((row) => assetIds.has(row.assetId));
  }, [snapshot, customerAssets]);

  if (!customer) return null;

  return (
    <div className="admin-module-page">
      <AdminPageHeader
        title={`Customer: ${customer.customerName}`}
        description="Use tabs to manage all customer-linked rental operations."
        breadcrumbs={['Admin', 'Rental Management', 'Customers', customer.customerName]}
      />

      <div className="job-detail-tabs" role="tablist">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="card"><div className="detail-list">
          <div><span>Type</span><strong>{customer.customerType}</strong></div>
          <div><span>Company</span><strong>{customer.companyName || '-'}</strong></div>
          <div><span>Contact</span><strong>{customer.contactNumber}</strong></div>
          <div><span>Email</span><strong>{customer.email || '-'}</strong></div>
          <div><span>Billing Address</span><strong>{customer.billingAddress || '-'}</strong></div>
        </div></div>
      )}

      {activeTab === 'Locations' && (
        <div className="card overflow-hidden">
          <table className="leads-table">
            <thead><tr><th>Name</th><th>Address</th><th>Contact</th><th>Phone</th><th>Email</th></tr></thead>
            <tbody>{(customer.locations || []).map((location) => <tr key={location.id}><td>{location.locationName}</td><td>{location.address}</td><td>{location.contactPerson}</td><td>{location.phone}</td><td>{location.email}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'Devices' && (
        <div className="card overflow-hidden">
          <table className="leads-table">
            <thead><tr><th>Asset</th><th>Model</th><th>Location</th><th>Status</th></tr></thead>
            <tbody>{customerAssets.map((asset) => <tr key={asset.id}><td>{asset.assetId}</td><td>{asset.model}</td><td>{asset.customerLocation}</td><td>{asset.status}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'Contracts' && (
        <div className="card overflow-hidden">
          <table className="leads-table">
            <thead><tr><th>Contract</th><th>Type</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
            <tbody>{customerContracts.map((contract) => <tr key={contract.id}><td>{contract.contractNo}</td><td>{contract.agreementType}</td><td>{contract.startDate}</td><td>{contract.endDate}</td><td>{contract.status}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'Invoices' && (
        <div className="card overflow-hidden"><table className="leads-table"><thead><tr><th>Invoice</th><th>Month</th><th>Total</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>{customerInvoices.map((invoice) => <tr key={invoice.id}><td>{invoice.id}</td><td>{invoice.billingMonth}</td><td>{invoice.total}</td><td>{invoice.outstanding}</td><td>{invoice.paymentStatus}</td></tr>)}</tbody></table></div>
      )}

      {activeTab === 'Payments' && (
        <div className="card overflow-hidden"><table className="leads-table"><thead><tr><th>Payment</th><th>Invoice</th><th>Amount</th><th>Mode</th><th>Date</th></tr></thead><tbody>{customerPayments.map((payment) => <tr key={payment.id}><td>{payment.id}</td><td>{payment.invoiceId}</td><td>{payment.amount}</td><td>{payment.mode}</td><td>{payment.paidOn}</td></tr>)}</tbody></table></div>
      )}

      {activeTab === 'Maintenance History' && (
        <div className="card overflow-hidden"><table className="leads-table"><thead><tr><th>Date</th><th>Asset</th><th>Issue</th><th>Resolution</th><th>Status</th></tr></thead><tbody>{customerMaintenance.map((log) => <tr key={log.id}><td>{log.date}</td><td>{log.assetId}</td><td>{log.issueDescription}</td><td>{log.resolutionNotes}</td><td>{log.status}</td></tr>)}</tbody></table></div>
      )}
    </div>
  );
};

export default RentalCustomerDetailPage;

