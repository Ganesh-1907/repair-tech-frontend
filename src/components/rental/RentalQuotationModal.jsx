import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Printer, Download, Send, CheckCircle, Info } from 'lucide-react';

const RentalQuotationModal = ({ isOpen, onClose, onSave, customer = null, quotation = null }) => {
  const [form, setForm] = useState({
    quotationNo: `QT-${Date.now().toString().slice(-6)}`,
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    productName: '',
    productType: 'Laptop',
    productSpecs: '',
    serialNo: '', // Optional at this stage
    rentalPrice: 0,
    rentalPeriod: 'Month',
    minimumPeriod: 3,
    securityDeposit: 0,
    installationCharges: 0,
    deliveryCharges: 0,
    gstRate: 18,
    paymentTerms: 'Advance',
    sla: '4 business hours',
    notes: '',
    status: 'Draft',
  });

  useEffect(() => {
    if (quotation) {
      setForm(quotation);
    } else if (customer) {
      setForm(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.companyName || customer.customerName,
        customerPhone: customer.contactNumber,
        customerEmail: customer.email,
        customerAddress: customer.address || '',
      }));
    }
  }, [customer, quotation, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (status = 'Generated') => {
    onSave({ ...form, status });
  };

  const calculateTotal = () => {
    const base = form.rentalPrice + form.installationCharges + form.deliveryCharges;
    const gst = (base * form.gstRate) / 100;
    return base + gst + form.securityDeposit;
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="admin-modal-header flex justify-between items-center p-6 border-b border-subtle">
          <div>
            <h2 className="text-xl font-bold text-main">{quotation ? 'Edit Quotation' : 'Create Rental Quotation'}</h2>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">{form.quotationNo}</p>
          </div>
          <button className="icon-btn h-10 w-10 rounded-full hover:bg-hover flex items-center justify-center" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-modal-body flex-1 overflow-y-auto p-8 space-y-8">
          {/* Example Hint */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 items-start">
            <Info className="text-primary mt-0.5" size={18} />
            <p className="text-sm text-primary/80 font-medium">
              <strong>Example:</strong> Laptop i5 – ₹1500/month, Deposit – ₹3000, Min period – 3 months.
            </p>
          </div>

          <section>
            <h3 className="text-sm font-extrabold text-main uppercase tracking-widest mb-4">1. Customer Identification</h3>
            <div className="grid grid-cols-2 gap-6 bg-surface-inset p-6 rounded-2xl border border-subtle">
              <div className="form-group">
                <label>Customer Name</label>
                <input value={form.customerName} readOnly className="table-input bg-hover cursor-not-allowed" />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input value={form.customerPhone} readOnly className="table-input bg-hover cursor-not-allowed" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-extrabold text-main uppercase tracking-widest mb-4">2. Product Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Type</label>
                <select 
                  value={form.productType} 
                  onChange={(e) => setForm(f => ({ ...f, productType: e.target.value }))}
                  className="table-input"
                >
                  <option>Laptop</option>
                  <option>Desktop</option>
                  <option>Printer</option>
                  <option>Server</option>
                  <option>Networking Gear</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Model / Product Name</label>
                <input 
                  value={form.productName} 
                  onChange={(e) => setForm(f => ({ ...f, productName: e.target.value }))}
                  placeholder="e.g. MacBook Pro M2 or HP LaserJet 400"
                  className="table-input"
                />
              </div>
              <div className="form-group col-span-2">
                <label>Specifications</label>
                <input 
                  value={form.productSpecs} 
                  onChange={(e) => setForm(f => ({ ...f, productSpecs: e.target.value }))}
                  placeholder="e.g. 16GB RAM, 512GB SSD, 14 inch Display"
                  className="table-input"
                />
              </div>
              <div className="form-group">
                <label>Serial Number (Optional at this stage)</label>
                <input 
                  value={form.serialNo} 
                  onChange={(e) => setForm(f => ({ ...f, serialNo: e.target.value }))}
                  placeholder="Leave blank if not assigned"
                  className="table-input"
                />
              </div>
              <div className="form-group">
                <label>SLA (Response Time)</label>
                <input 
                  value={form.sla} 
                  onChange={(e) => setForm(f => ({ ...f, sla: e.target.value }))}
                  placeholder="e.g. 4 business hours"
                  className="table-input"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-extrabold text-main uppercase tracking-widest mb-4">3. Rental & Financial Terms</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Rental Price (₹)</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={form.rentalPrice} 
                    onChange={(e) => setForm(f => ({ ...f, rentalPrice: Number(e.target.value) }))}
                    className="table-input"
                  />
                  <select 
                    value={form.rentalPeriod} 
                    onChange={(e) => setForm(f => ({ ...f, rentalPeriod: e.target.value }))}
                    className="table-input w-36"
                  >
                    <option value="Month">Per Month</option>
                    <option value="Day">Per Day</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Minimum Rental Period ({form.rentalPeriod}s)</label>
                <input 
                  type="number"
                  value={form.minimumPeriod} 
                  onChange={(e) => setForm(f => ({ ...f, minimumPeriod: Number(e.target.value) }))}
                  className="table-input"
                />
              </div>
              <div className="form-group">
                <label>Security Deposit (₹)</label>
                <input 
                  type="number"
                  value={form.securityDeposit} 
                  onChange={(e) => setForm(f => ({ ...f, securityDeposit: Number(e.target.value) }))}
                  className="table-input"
                />
              </div>
              <div className="form-group">
                <label>Installation Charges (₹)</label>
                <input 
                  type="number"
                  value={form.installationCharges} 
                  onChange={(e) => setForm(f => ({ ...f, installationCharges: Number(e.target.value) }))}
                  className="table-input"
                />
              </div>
              <div className="form-group">
                <label>Delivery Charges (₹)</label>
                <input 
                  type="number"
                  value={form.deliveryCharges} 
                  onChange={(e) => setForm(f => ({ ...f, deliveryCharges: Number(e.target.value) }))}
                  className="table-input"
                />
              </div>
              <div className="form-group">
                <label>GST (%)</label>
                <input 
                  type="number"
                  value={form.gstRate} 
                  onChange={(e) => setForm(f => ({ ...f, gstRate: Number(e.target.value) }))}
                  className="table-input"
                />
              </div>
              <div className="form-group">
                <label>Payment Terms</label>
                <select 
                  value={form.paymentTerms} 
                  onChange={(e) => setForm(f => ({ ...f, paymentTerms: e.target.value }))}
                  className="table-input"
                >
                  <option value="Advance">Advance Payment</option>
                  <option value="Monthly">Monthly Postpaid</option>
                </select>
              </div>
            </div>
          </section>

          {/* Upfront summary removed per user request */}
        </div>

        <div className="admin-modal-footer p-6 border-t border-subtle flex justify-between bg-surface-inset">
          <div className="flex gap-2">
            <button className="btn btn-secondary h-11 px-6 font-bold flex items-center gap-2">
              <Printer size={18} /> Print
            </button>
            <button className="btn btn-secondary h-11 px-6 font-bold flex items-center gap-2">
              <Download size={18} /> PDF
            </button>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary h-11 px-6 font-bold" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary h-11 px-8 font-bold flex items-center gap-2" onClick={() => handleSubmit('Generated')}>
              <CheckCircle size={18} /> Generate Quotation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalQuotationModal;
