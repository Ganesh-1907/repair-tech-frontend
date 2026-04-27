import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, FileText, Save, CheckCircle, Calculator, Gauge, Receipt, Info, ArrowRight, Download, Send, AlertTriangle } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalCustomerService } from '../../services/rentalCustomerService';
import { rentalBillingService } from '../../services/rentalBillingService';
import { paymentTrackingService } from '../../services/paymentTrackingService';
import './RentalPremiumStyles.css';

const steps = [
  { id: 1, label: 'Configuration', icon: Receipt },
  { id: 2, label: 'Consumption Audit', icon: Gauge },
  { id: 3, label: 'Financials', icon: Calculator },
  { id: 4, label: 'Premium Preview', icon: FileText },
  { id: 5, label: 'Execution', icon: CheckCircle },
];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const RentalBillingGeneratePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ 
    customerId: '', 
    customerName: '', 
    billingMonth: new Date().toISOString().slice(0, 7), 
    branch: 'All branches', 
    invoiceMode: 'Combined', 
    discount: 0, 
    gstRate: 18 
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  useEffect(() => {
    rentalCustomerService.listCustomers().then(setCustomers);
  }, []);

  const selectedCustomer = useMemo(() => customers.find((row) => row.id === form.customerId) || null, [customers, form.customerId]);

  const handleNext = () => {
    if (currentStep === 1 && !form.customerId) return;
    if (currentStep === 3) {
      runPreview();
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const runPreview = async () => {
    setLoading(true);
    try {
      const result = await rentalBillingService.generateInvoicePreview(form);
      setPreview(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const finalizeInvoice = async () => {
    setLoading(true);
    try {
      const invoice = await rentalBillingService.generateInvoice(form);
      setGeneratedInvoice(invoice);
      setCurrentStep(5);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-module-page rental-billing-wizard">
      <AdminPageHeader
        title="Revenue Wizard"
        description="Enterprise-grade billing engine for monthly rental cycles."
        breadcrumbs={['Admin', 'Rental Management', 'Billing', 'Generator']}
      />

      {/* Progress Tracker */}
      <div className="bg-surface border border-subtle p-6 rounded-[32px] mb-8 shadow-sm">
        <div className="flex justify-between relative px-10">
          <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-hover -translate-y-1/2 z-0"></div>
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 ${currentStep >= step.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-surface border-2 border-subtle text-muted'}`}>
                <step.icon size={20} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= step.id ? 'text-primary' : 'text-muted'}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          {/* Step 1: Configuration */}
          {currentStep === 1 && (
            <div className="bg-surface border border-subtle p-10 rounded-[32px] animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-black text-main uppercase tracking-tight mb-8">1. Billing Configuration</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Select Customer</label>
                  <select 
                    value={form.customerId} 
                    onChange={(e) => setForm(f => ({ ...f, customerId: e.target.value }))}
                    className="table-input h-12"
                  >
                    <option value="">Choose Client...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || c.customerName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cycle Month</label>
                  <input type="month" value={form.billingMonth} onChange={e => setForm(f => ({ ...f, billingMonth: e.target.value }))} className="table-input h-12" />
                </div>
                <div className="form-group">
                  <label>Branch Focus</label>
                  <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="table-input h-12">
                    <option>All branches</option>
                    {selectedCustomer?.locations?.map(l => <option key={l.id}>{l.locationName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Invoice Mode</label>
                  <select value={form.invoiceMode} onChange={e => setForm(f => ({ ...f, invoiceMode: e.target.value }))} className="table-input h-12">
                    <option>Combined (Master Bill)</option>
                    <option>Individual Branch Bills</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Consumption Audit */}
          {currentStep === 2 && (
            <div className="bg-surface border border-subtle p-10 rounded-[32px] animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-main uppercase tracking-tight">2. Consumption Audit</h3>
                <span className="text-[10px] font-black bg-success/10 text-success px-4 py-1 rounded-full uppercase tracking-widest">Ready to Bill</span>
              </div>
              <div className="space-y-4">
                {['HP LaserJet 500', 'Canon iR Advance'].map(dev => (
                  <div key={dev} className="flex items-center justify-between p-6 bg-hover rounded-2xl border border-subtle">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-surface flex items-center justify-center text-primary shadow-sm"><Gauge size={20} /></div>
                      <div>
                        <p className="text-sm font-bold text-main">{dev}</p>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Meter Captured on 30th May</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-primary">1,240 Pages</p>
                      <p className="text-[9px] text-muted font-bold uppercase">Usage Sync Active</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 & 4: Financials & Preview */}
          {(currentStep === 3 || currentStep === 4) && (
            <div className="bg-surface border border-subtle p-10 rounded-[32px] animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-main uppercase tracking-tight">
                  {currentStep === 3 ? '3. Financial Computation' : '4. Premium Invoice Preview'}
                </h3>
              </div>
              
              {loading ? (
                <div className="py-20 text-center animate-pulse font-bold text-muted uppercase tracking-widest">Calculating Premium Values...</div>
              ) : preview ? (
                <div className="space-y-10">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 bg-surface-inset border border-subtle rounded-2xl text-center">
                      <p className="text-[10px] font-black text-muted uppercase mb-1">Fixed Rent</p>
                      <p className="text-xl font-black text-main">{formatCurrency(preview.fixedRent)}</p>
                    </div>
                    <div className="p-6 bg-surface-inset border border-subtle rounded-2xl text-center">
                      <p className="text-[10px] font-black text-muted uppercase mb-1">Usage Billing</p>
                      <p className="text-xl font-black text-main">{formatCurrency(preview.meterCharges)}</p>
                    </div>
                    <div className="p-6 bg-surface-inset border border-subtle rounded-2xl text-center">
                      <p className="text-[10px] font-black text-muted uppercase mb-1">Tax (GST)</p>
                      <p className="text-xl font-black text-danger">{formatCurrency(preview.gst)}</p>
                    </div>
                  </div>

                  <div className="bg-main text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <span className="text-xs uppercase font-bold opacity-60">Grand Total Amount Due</span>
                        <h2 className="text-6xl font-black tracking-tighter mt-1">{formatCurrency(preview.total)}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-60 uppercase font-bold">Billing Cycle</p>
                        <p className="text-lg font-black uppercase">{form.billingMonth}</p>
                      </div>
                    </div>
                    <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-primary rounded-full opacity-20 blur-3xl"></div>
                  </div>
                </div>
              ) : <div className="text-center py-10 italic opacity-50">No preview data available.</div>}
            </div>
          )}

          {/* Step 5: Execution */}
          {currentStep === 5 && (
            <div className="bg-surface border border-subtle p-10 rounded-[32px] text-center animate-in zoom-in-95">
              <div className="h-20 w-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-main uppercase tracking-tight mb-2">Invoice Generated Successfully</h3>
              <p className="text-sm text-muted font-medium mb-10 max-w-sm mx-auto">
                Invoice {generatedInvoice?.id} has been recorded. The customer has been notified via Email & WhatsApp.
              </p>
              <div className="flex gap-4 justify-center">
                <button className="btn btn-secondary h-12 px-8 font-black uppercase flex items-center gap-2"><Download size={18} /> Download PDF</button>
                <button className="btn btn-primary h-12 px-8 font-black uppercase flex items-center gap-2"><Send size={18} /> Notify Client</button>
              </div>
            </div>
          )}

          {/* Controls */}
          {currentStep < 5 && (
            <div className="flex justify-between items-center mt-10">
              <button className={`btn btn-secondary h-12 px-8 font-black uppercase ${currentStep === 1 ? 'invisible' : ''}`} onClick={handleBack}>Previous Step</button>
              <button 
                className="btn btn-primary h-12 px-10 font-black uppercase flex items-center gap-3 shadow-lg shadow-primary/30" 
                onClick={currentStep === 4 ? finalizeInvoice : handleNext}
                disabled={loading}
              >
                {currentStep === 4 ? 'Finalize & Execute' : 'Next Step'} <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-surface border border-subtle p-8 rounded-[32px] shadow-sm">
            <h4 className="text-xs font-black text-main uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={16} className="text-primary" /> Operational Insights
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-hover rounded-2xl">
                <p className="text-[10px] font-bold text-muted uppercase">Selected Client</p>
                <p className="text-sm font-black text-main mt-0.5">{form.customerId ? (selectedCustomer?.companyName || selectedCustomer?.customerName) : 'Not Selected'}</p>
              </div>
              <div className="p-4 bg-hover rounded-2xl">
                <p className="text-[10px] font-bold text-muted uppercase">Active Contracts</p>
                <p className="text-sm font-black text-main mt-0.5">{(selectedCustomer?.locations || []).length} Business Locations</p>
              </div>
            </div>
          </div>

          <div className="bg-warning/5 border border-warning/20 p-8 rounded-[32px]">
            <h4 className="text-xs font-black text-warning-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" /> Compliance Check
            </h4>
            <p className="text-[11px] text-warning-700 font-medium leading-relaxed">
              Before final execution, ensure all <strong>Meter Readings</strong> are verified. Manual overrides in the Computation step will be logged for audit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalBillingGeneratePage;

