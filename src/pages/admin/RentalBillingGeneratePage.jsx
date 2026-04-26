import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, FileText, Save } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalCustomerService } from '../../services/rentalCustomerService';
import { rentalBillingService } from '../../services/rentalBillingService';
import { paymentTrackingService } from '../../services/paymentTrackingService';

const steps = ['1. Select Customer', '2. Fetch Contracts', '3. Calculate Usage + Charges', '4. Preview Invoice', '5. Generate & Track Payment'];
const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const RentalBillingGeneratePage = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customerId: '', customerName: '', billingMonth: new Date().toISOString().slice(0, 7), branch: 'All branches', invoiceMode: 'Combined', discount: 0, gstRate: 18 });
  const [preview, setPreview] = useState(null);
  const [notice, setNotice] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [payment, setPayment] = useState({ amount: 0, mode: 'UPI' });

  useEffect(() => {
    rentalCustomerService.listCustomers().then(setCustomers);
  }, []);

  const canPreview = Boolean(form.customerId && form.billingMonth);

  const selectedCustomer = useMemo(() => customers.find((row) => row.id === form.customerId) || null, [customers, form.customerId]);

  const runPreview = async () => {
    try {
      const result = await rentalBillingService.generateInvoicePreview(form);
      setPreview(result);
      setNotice('Invoice preview generated.');
    } catch (error) {
      setNotice(error.message);
    }
  };

  const generate = async () => {
    try {
      const invoice = await rentalBillingService.generateInvoice(form);
      setGeneratedInvoice(invoice);
      setPayment((current) => ({ ...current, amount: invoice.outstanding }));
      setNotice(`Invoice ${invoice.id} generated.`);
    } catch (error) {
      setNotice(error.message);
    }
  };

  const collect = async () => {
    try {
      if (!generatedInvoice) throw new Error('Generate invoice first.');
      await paymentTrackingService.collectPayment({ invoiceId: generatedInvoice.id, amount: Number(payment.amount || 0), mode: payment.mode, paidOn: new Date().toISOString().slice(0, 10) });
      setNotice('Payment recorded.');
    } catch (error) {
      setNotice(error.message);
    }
  };

  return (
    <div className="admin-module-page">
      {notice ? <div className="success-banner" role="status"><span>{notice}</span></div> : null}
      <AdminPageHeader
        title="Invoice Generation"
        description="Guided monthly billing flow including meter usage, add-ons, replacement split, tax, and payment."
        breadcrumbs={['Admin', 'Rental Management', 'Billing & Invoices', 'Generate']}
      />

      <div className="job-detail-tabs">{steps.map((step) => <button key={step} className="active">{step}</button>)}</div>

      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label>Customer</label>
            <select value={form.customerId} onChange={(event) => {
              const customer = customers.find((row) => row.id === event.target.value);
              setForm((current) => ({ ...current, customerId: event.target.value, customerName: customer ? (customer.companyName || customer.customerName) : '' }));
            }}>
              <option value="">Select customer</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName || customer.customerName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Billing Month</label>
            <input type="month" value={form.billingMonth} onChange={(event) => setForm((current) => ({ ...current, billingMonth: event.target.value }))} />
          </div>
          <div className="form-group">
            <label>Branch</label>
            <select value={form.branch} onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))}><option>All branches</option>{(selectedCustomer?.locations || []).map((location) => <option key={location.id}>{location.locationName}</option>)}</select>
          </div>
          <div className="form-group">
            <label>Invoice Mode</label>
            <select value={form.invoiceMode} onChange={(event) => setForm((current) => ({ ...current, invoiceMode: event.target.value }))}><option>Combined</option><option>Branch-wise separate</option></select>
          </div>
          <div className="form-group">
            <label>Discount</label>
            <input type="number" min="0" value={form.discount} onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))} />
          </div>
          <div className="form-group">
            <label>GST %</label>
            <input type="number" min="0" value={form.gstRate} onChange={(event) => setForm((current) => ({ ...current, gstRate: event.target.value }))} />
          </div>
        </div>
        <div className="admin-chip-row">
          <button type="button" className="btn btn-secondary" disabled={!canPreview} onClick={runPreview}><FileText size={16} />Generate Preview</button>
          <button type="button" className="btn btn-primary" disabled={!preview} onClick={generate}><Save size={16} />Generate Invoice</button>
        </div>
      </div>

      <div className="admin-split-grid">
        <div className="card">
          <div className="card-header"><div><h3>Invoice Preview</h3></div></div>
          {preview ? (
            <div className="detail-list">
              <div><span>Fixed Rent</span><strong>{formatCurrency(preview.fixedRent)}</strong></div>
              <div><span>Meter Charges</span><strong>{formatCurrency(preview.meterCharges)}</strong></div>
              <div><span>Add-ons</span><strong>{formatCurrency(preview.addOnCharges)}</strong></div>
              <div><span>Discount</span><strong>{formatCurrency(preview.discount)}</strong></div>
              <div><span>GST</span><strong>{formatCurrency(preview.gst)}</strong></div>
              <div><span>Total</span><strong>{formatCurrency(preview.total)}</strong></div>
            </div>
          ) : <p className="text-muted">Generate preview to inspect line totals.</p>}
        </div>
        <div className="card">
          <div className="card-header"><div><h3>Payment Tracking</h3><p>Partial/full payment supported.</p></div></div>
          <div className="form-grid one-col">
            <div className="form-group"><label>Amount</label><input type="number" min="0" value={payment.amount} onChange={(event) => setPayment((current) => ({ ...current, amount: event.target.value }))} /></div>
            <div className="form-group"><label>Mode</label><select value={payment.mode} onChange={(event) => setPayment((current) => ({ ...current, mode: event.target.value }))}><option>UPI</option><option>Cash</option><option>Bank Transfer</option><option>Online Link</option></select></div>
          </div>
          <button type="button" className="btn btn-primary" onClick={collect}><CreditCard size={16} />Collect Payment</button>
        </div>
      </div>
    </div>
  );
};

export default RentalBillingGeneratePage;

