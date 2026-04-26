import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalBillingService } from '../../services/rentalBillingService';
import { paymentTrackingService } from '../../services/paymentTrackingService';

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const RentalBillingInvoicesPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [notice, setNotice] = useState('');

  const refresh = async () => setInvoices(await rentalBillingService.listInvoices());
  useEffect(() => { refresh(); }, []);

  const remind = async (invoiceId) => {
    const response = await paymentTrackingService.sendPaymentReminder(invoiceId);
    setNotice(response.message);
  };

  return (
    <div className="admin-module-page">
      {notice ? <div className="success-banner" role="status"><span>{notice}</span></div> : null}
      <AdminPageHeader
        title="Billing & Invoices"
        description="Invoice generation, meter billing, plans, add-ons, replacements, and payment tracking."
        breadcrumbs={['Admin', 'Rental Management', 'Billing & Invoices']}
        actions={[{ label: 'Generate Invoice', onClick: () => navigate('/admin/rental/billing/generate') }]}
      />

      <div className="card">
        <div className="card-header"><div><h3>Billing Flow</h3><p>Select customer, fetch contracts, compute meter + fixed + add-ons + GST, then invoice and payment tracking.</p></div></div>
      </div>

      <div className="card overflow-hidden">
        <table className="leads-table">
          <thead><tr><th>Invoice</th><th>Customer</th><th>Month</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.customerName}</td>
                <td>{invoice.billingMonth}</td>
                <td>{formatCurrency(invoice.total)}</td>
                <td>{formatCurrency(invoice.paidAmount)}</td>
                <td>{formatCurrency(invoice.outstanding)}</td>
                <td><span className="status-pill status-pending">{invoice.paymentStatus}</span></td>
                <td><button className="btn btn-sm btn-secondary" onClick={() => remind(invoice.id)}><BellRing size={14} /> Remind</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalBillingInvoicesPage;
