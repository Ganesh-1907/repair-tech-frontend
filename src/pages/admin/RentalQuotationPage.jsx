import React, { useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  FileText,
  IndianRupee,
  Mail,
  Plus,
  Printer,
  Save,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { calculateRentalQuotation, rentalQuotationService } from '../../services/rentalQuotationService';

const emptyProduct = {
  id: 1,
  productName: 'Laptop i5',
  model: 'Dell Latitude 5400',
  specs: 'i5, 8GB RAM, 256GB SSD',
  serialNo: '',
  quantity: 1,
};

const initialForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
  rentalFrequency: 'Monthly',
  rentalPrice: 1500,
  minimumPeriod: 3,
  securityDeposit: 3000,
  installationCharges: 0,
  deliveryCharges: 0,
  gstRate: 18,
  paymentTerms: 'Advance',
  sla: '4 business hours',
  validityDays: 7,
  notes: '',
};

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const statusClass = {
  Draft: 'status-draft',
  Sent: 'status-assigned',
  Approved: 'status-completed',
  Rejected: 'status-overdue',
};

const RentalQuotationPage = () => {
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState([emptyProduct]);
  const [quotations, setQuotations] = useState([]);
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    rentalQuotationService.listQuotations().then(setQuotations);
  }, []);

  const totals = useMemo(() => calculateRentalQuotation(form), [form]);
  const primaryProduct = products[0] || emptyProduct;

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const updateProduct = (id, field, value) => {
    setProducts((current) => current.map((product) => (
      product.id === id ? { ...product, [field]: value } : product
    )));
  };

  const addProduct = () => {
    setProducts((current) => [
      ...current,
      {
        ...emptyProduct,
        id: Date.now(),
        productName: '',
        model: '',
        specs: '',
        serialNo: '',
      },
    ]);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.customerName.trim()) nextErrors.customerName = 'Customer name is required.';
    if (!form.customerPhone.trim()) nextErrors.customerPhone = 'Phone number is required.';
    if (!primaryProduct.productName.trim()) nextErrors.productName = 'Product name is required.';
    if (Number(form.rentalPrice) <= 0) nextErrors.rentalPrice = 'Rental price must be greater than zero.';
    if (Number(form.minimumPeriod) <= 0) nextErrors.minimumPeriod = 'Minimum period is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveQuotation = async (status = 'Draft') => {
    if (!validate()) return;
    const quotation = await rentalQuotationService.saveQuotation({
      ...form,
      productName: primaryProduct.productName,
      products,
      status,
    });
    if (status === 'Sent') {
      await rentalQuotationService.markSent(quotation.id);
    }
    setQuotations(await rentalQuotationService.listQuotations());
    setNotice(`Quotation ${quotation.id} ${status === 'Sent' ? 'saved and sent' : 'saved as draft'}.`);
  };

  return (
    <div className="admin-module-page rental-quotation-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss quotation message">
            <X size={16} />
          </button>
        </div>
      )}

      <AdminPageHeader
        title="Rental Quotation"
        description="Create rental quotes with product details, monthly/day pricing, deposits, charges, GST, payment terms, and SLA."
        breadcrumbs={['Admin', 'Rental Management', 'Quotation']}
        actions={[
          { label: 'Save Draft', icon: Save, onClick: () => saveQuotation('Draft') },
          { label: 'Send Quotation', icon: Send, onClick: () => saveQuotation('Sent') },
          { label: 'Print', variant: 'secondary', icon: Printer, onClick: () => window.print() },
        ]}
      />

      <div className="rental-quote-layout">
        <div className="rental-quote-main">
          <div className="card">
            <div className="card-header">
              <div>
                <h3>Customer Details</h3>
                <p>Basic customer and contact information for quotation sharing.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="rental-quote-customer">Customer Name</label>
                <input id="rental-quote-customer" value={form.customerName} onChange={(event) => updateForm('customerName', event.target.value)} aria-invalid={Boolean(errors.customerName)} />
                {errors.customerName && <span className="form-error">{errors.customerName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="rental-quote-phone">Phone Number</label>
                <input id="rental-quote-phone" value={form.customerPhone} onChange={(event) => updateForm('customerPhone', event.target.value.replace(/\D/g, '').slice(0, 10))} aria-invalid={Boolean(errors.customerPhone)} />
                {errors.customerPhone && <span className="form-error">{errors.customerPhone}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="rental-quote-email">Email</label>
                <input id="rental-quote-email" type="email" value={form.customerEmail} onChange={(event) => updateForm('customerEmail', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="rental-quote-address">Address / Location</label>
                <input id="rental-quote-address" value={form.customerAddress} onChange={(event) => updateForm('customerAddress', event.target.value)} />
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="card-header">
              <div>
                <h3>Product Details</h3>
                <p>Model and specs are captured now; serial number can remain optional.</p>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={addProduct}><Plus size={14} /> Add Product</button>
            </div>
            {errors.productName && <div className="inline-error">{errors.productName}</div>}
            <table className="leads-table rental-product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Model</th>
                  <th>Specs</th>
                  <th>Serial No</th>
                  <th>Qty</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td><input className="table-input" value={product.productName} onChange={(event) => updateProduct(product.id, 'productName', event.target.value)} /></td>
                    <td><input className="table-input" value={product.model} onChange={(event) => updateProduct(product.id, 'model', event.target.value)} /></td>
                    <td><input className="table-input" value={product.specs} onChange={(event) => updateProduct(product.id, 'specs', event.target.value)} /></td>
                    <td><input className="table-input" placeholder="Optional" value={product.serialNo} onChange={(event) => updateProduct(product.id, 'serialNo', event.target.value)} /></td>
                    <td><input className="table-input center" type="number" min="1" value={product.quantity} onChange={(event) => updateProduct(product.id, 'quantity', Number(event.target.value) || 1)} /></td>
                    <td>
                      <button className="icon-btn danger" onClick={() => setProducts(products.filter((item) => item.id !== product.id))} disabled={products.length === 1} aria-label="Remove product">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3>Commercial Terms</h3>
                <p>Rental price, deposit, charges, GST, payment terms, and support SLA.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="rental-frequency">Rental Price Type</label>
                <select id="rental-frequency" value={form.rentalFrequency} onChange={(event) => updateForm('rentalFrequency', event.target.value)}>
                  <option>Monthly</option>
                  <option>Daily</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="rental-price">Rental Price</label>
                <input id="rental-price" type="number" min="0" value={form.rentalPrice} onChange={(event) => updateForm('rentalPrice', event.target.value)} aria-invalid={Boolean(errors.rentalPrice)} />
                {errors.rentalPrice && <span className="form-error">{errors.rentalPrice}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="minimum-period">Minimum Rental Period</label>
                <input id="minimum-period" type="number" min="1" value={form.minimumPeriod} onChange={(event) => updateForm('minimumPeriod', event.target.value)} aria-invalid={Boolean(errors.minimumPeriod)} />
                {errors.minimumPeriod && <span className="form-error">{errors.minimumPeriod}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="security-deposit">Security Deposit</label>
                <input id="security-deposit" type="number" min="0" value={form.securityDeposit} onChange={(event) => updateForm('securityDeposit', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="installation-charges">Installation Charges</label>
                <input id="installation-charges" type="number" min="0" value={form.installationCharges} onChange={(event) => updateForm('installationCharges', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="delivery-charges">Delivery Charges</label>
                <input id="delivery-charges" type="number" min="0" value={form.deliveryCharges} onChange={(event) => updateForm('deliveryCharges', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="gst-rate">GST %</label>
                <input id="gst-rate" type="number" min="0" value={form.gstRate} onChange={(event) => updateForm('gstRate', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="payment-terms">Payment Terms</label>
                <select id="payment-terms" value={form.paymentTerms} onChange={(event) => updateForm('paymentTerms', event.target.value)}>
                  <option>Advance</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="sla">SLA Response Time</label>
                <select id="sla" value={form.sla} onChange={(event) => updateForm('sla', event.target.value)}>
                  <option>4 business hours</option>
                  <option>8 business hours</option>
                  <option>Next business day</option>
                  <option>48 hours</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="validity">Validity Days</label>
                <input id="validity" type="number" min="1" value={form.validityDays} onChange={(event) => updateForm('validityDays', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="quote-notes">Notes</label>
                <textarea id="quote-notes" rows={3} value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <aside className="rental-quote-side">
          <div className="card rental-quote-preview">
            <div className="card-header">
              <div>
                <h3>Quotation Preview</h3>
                <p>Example-ready pricing summary.</p>
              </div>
              <Calculator size={18} className="icon-primary" />
            </div>
            <div className="quote-preview-title">
              <FileText size={20} />
              <div>
                <strong>{primaryProduct.productName || 'Product'}</strong>
                <span>{formatCurrency(form.rentalPrice)} / {form.rentalFrequency === 'Monthly' ? 'month' : 'day'}</span>
              </div>
            </div>
            <div className="detail-list">
              <div><span>Deposit</span><strong>{formatCurrency(form.securityDeposit)}</strong></div>
              <div><span>Min period</span><strong>{form.minimumPeriod} {form.rentalFrequency === 'Monthly' ? 'months' : 'days'}</strong></div>
              <div><span>Installation</span><strong>{formatCurrency(form.installationCharges)}</strong></div>
              <div><span>Delivery</span><strong>{formatCurrency(form.deliveryCharges)}</strong></div>
              <div><span>GST</span><strong>{formatCurrency(totals.gstAmount)}</strong></div>
              <div><span>Payment terms</span><strong>{form.paymentTerms}</strong></div>
              <div><span>SLA</span><strong>{form.sla}</strong></div>
            </div>
            <div className="rental-total-box">
              <span>Quotation Total</span>
              <strong>{formatCurrency(totals.total)}</strong>
            </div>
            <div className="admin-chip-row">
              <button className="btn btn-primary btn-full" onClick={() => saveQuotation('Sent')}><Send size={16} /> Send Quotation</button>
              <button className="btn btn-secondary btn-full" onClick={() => setNotice('Email quotation placeholder prepared.')}><Mail size={16} /> Email</button>
              <button className="btn btn-secondary btn-full" onClick={() => window.print()}><Printer size={16} /> Print</button>
            </div>
          </div>
        </aside>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <div>
            <h3>Recent Rental Quotations</h3>
            <p>Draft and sent quotation records.</p>
          </div>
        </div>
        <table className="leads-table">
          <thead>
            <tr>
              <th>Quotation No</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Rental</th>
              <th>Deposit</th>
              <th>Min Period</th>
              <th>Total</th>
              <th>Payment Terms</th>
              <th>SLA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quotation) => (
              <tr key={quotation.id}>
                <td className="bold">{quotation.id}</td>
                <td>{quotation.customerName}<span className="company-name">{quotation.customerPhone}</span></td>
                <td>{quotation.productName}</td>
                <td>{formatCurrency(quotation.rentalPrice)} / {quotation.rentalFrequency === 'Monthly' ? 'month' : 'day'}</td>
                <td>{formatCurrency(quotation.securityDeposit)}</td>
                <td>{quotation.minimumPeriod}</td>
                <td>{formatCurrency(quotation.total)}</td>
                <td>{quotation.paymentTerms}</td>
                <td>{quotation.sla}</td>
                <td><span className={`status-pill ${statusClass[quotation.status] || 'status-draft'}`}>{quotation.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalQuotationPage;
