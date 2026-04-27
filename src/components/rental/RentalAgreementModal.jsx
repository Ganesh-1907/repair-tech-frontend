import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Printer, Download, Send, Plus, Trash2, Eye, Info } from 'lucide-react';

const CORPORATE_TEMPLATE = `1. SCOPE OF AGREEMENT
The Service Provider agrees to supply and maintain the equipment listed in the schedule below at the Client's registered office or designated premises.

2. PERIOD OF RENTAL
The rental period shall commence on the date of installation and shall remain in force for the period specified in the financial terms, unless terminated earlier.

3. OWNERSHIP
The equipment shall remain the absolute property of REPAIRBOY at all times. The Client shall not have any right, title, or interest in the equipment except as a bailee.

4. RENTAL CHARGES
The Client agrees to pay the rental charges as specified. Variable charges based on meter readings (if applicable) will be invoiced monthly.

5. SECURITY DEPOSIT
The Client shall pay a security deposit which is refundable upon the return of the equipment in good working condition, subject to normal wear and tear.

6. MAINTENANCE AND SUPPORT
REPAIRBOY will provide preventive and breakdown maintenance. Support will be provided within the specified SLA hours.

7. DAMAGES AND LOSSES
The Client shall be responsible for any loss or damage to the equipment caused by negligence, misuse, or unauthorized handling.

8. TERMINATION
Either party may terminate this agreement by giving the specified notice period. Upon termination, the equipment must be returned immediately.

9. GOVERNING LAW
This agreement shall be governed by and construed in accordance with the laws of India.

10. JURISDICTION
Any disputes arising out of this agreement shall be subject to the exclusive jurisdiction of the courts in the specified city.`;

const INDIVIDUAL_TEMPLATE = `1. SCOPE OF SERVICES
REPAIRBOY agrees to provide the equipment on a rental basis to the Customer for personal or home-office use.

2. RENTAL TERM
The rental starts on the delivery date and continues for the agreed minimum period.

3. SECURITY DEPOSIT
A security deposit is required and will be held against any damages or non-payment of dues.

4. USE OF EQUIPMENT
The Customer shall use the equipment only for lawful purposes and shall not move it from the registered address without prior written consent.

5. MAINTENANCE
Service Provider will handle technical issues. Customer must report any malfunction within 24 hours.

6. RETURN OF EQUIPMENT
Upon expiry of the term, the Customer must return the equipment in the same condition as received, barring normal wear.

7. LIABILITY
REPAIRBOY's liability is limited to the repair or replacement of the equipment. We are not liable for any data loss.

8. JURISDICTION
Subject to the exclusive jurisdiction of the local courts.`;

const RentalAgreementModal = ({ isOpen, onClose, onSave, customer = null, agreement = null, type = 'Corporate' }) => {
  const [form, setForm] = useState({
    agreementDate: new Date().toISOString().slice(0, 10),
    companyName: '',
    companyAddress: '',
    customerName: '', // For individual
    customerAadhar: '', // For individual
    providerName: 'REPAIRBOY',
    providerAddress: '123 Tech Park, Indore, MP',
    devices: [],
    monthlyRent: 0,
    billingCycle: 'Monthly',
    paymentTerms: 'Advance',
    minimumPeriod: 3,
    securityDeposit: 0,
    slaTime: 4,
    jurisdictionCity: 'Indore',
    termsAndConditions: type === 'Corporate' ? CORPORATE_TEMPLATE : INDIVIDUAL_TEMPLATE,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (agreement) {
      setForm(agreement);
    } else if (customer) {
      setForm(prev => ({
        ...prev,
        companyName: customer.companyName || '',
        customerName: customer.customerName || '',
        companyAddress: customer.address || customer.billingAddress || '',
        termsAndConditions: type === 'Corporate' ? CORPORATE_TEMPLATE : INDIVIDUAL_TEMPLATE,
      }));
    }
  }, [customer, agreement, isOpen, type]);

  if (!isOpen) return null;

  const handleAddDevice = () => {
    setForm(f => ({
      ...f,
      devices: [...f.devices, { id: Date.now(), model: '', specs: '', serial: '', rent: 0 }]
    }));
  };

  const updateDevice = (id, field, value) => {
    setForm(f => ({
      ...f,
      devices: f.devices.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const removeDevice = (id) => {
    setForm(f => ({
      ...f,
      devices: f.devices.filter(d => d.id !== id)
    }));
  };

  const handleSubmit = () => {
    onSave({ ...form, agreementType: type });
  };

  const AgreementPreview = () => (
    <div className="agreement-paper">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-black uppercase underline tracking-tighter">
          Rental Agreement ({type})
        </h1>
      </div>

      <p className="mb-6 text-sm">This Rental Agreement is made on <strong>{form.agreementDate}</strong></p>

      <div className="mb-8 space-y-4">
        <div>
          <h3 className="font-bold underline uppercase text-xs mb-2">Between</h3>
          {type === 'Corporate' ? (
            <p className="text-sm"><strong>{form.companyName}</strong>, having its registered office at {form.companyAddress} (hereinafter referred to as "Client")</p>
          ) : (
            <p className="text-sm"><strong>{form.customerName}</strong>, residing at {form.companyAddress} (hereinafter referred to as "Customer")</p>
          )}
        </div>
        <div>
          <h3 className="font-bold underline uppercase text-xs mb-2">And</h3>
          <p className="text-sm"><strong>{form.providerName}</strong>, having its office at {form.providerAddress} (hereinafter referred to as "Service Provider")</p>
        </div>
      </div>

      <div className="whitespace-pre-wrap text-sm leading-relaxed mb-8">
        {form.termsAndConditions}
      </div>

      <h3 className="font-bold border-b border-black mb-4 text-xs uppercase">Schedule of Equipment</h3>
      <table className="agreement-table text-xs mb-8">
        <thead>
          <tr className="bg-gray-50">
            <th>Model</th>
            <th>Specifications</th>
            <th>Serial No</th>
            <th>Monthly Rent</th>
          </tr>
        </thead>
        <tbody>
          {form.devices.map(d => (
            <tr key={d.id}>
              <td>{d.model}</td>
              <td>{d.specs}</td>
              <td>{d.serial || 'Pending'}</td>
              <td>₹{d.rent}</td>
            </tr>
          ))}
          {form.devices.length === 0 && <tr><td colSpan="4" className="text-center italic py-4">No equipment listed</td></tr>}
        </tbody>
      </table>

      <h3 className="font-bold border-b border-black mb-4 text-xs uppercase">Financial Terms</h3>
      <div className="grid grid-cols-2 gap-4 text-sm mb-12">
        <p>• Total Monthly Rent: ₹<strong>{form.monthlyRent}</strong></p>
        <p>• Security Deposit: ₹<strong>{form.securityDeposit}</strong></p>
        <p>• Billing Cycle: {form.billingCycle}</p>
        <p>• Payment Terms: {form.paymentTerms}</p>
        <p>• SLA: {form.slaTime} hours</p>
        <p>• Jurisdiction: {form.jurisdictionCity}</p>
      </div>

      <div className="mt-24 grid grid-cols-2 gap-20">
        <div className="border-t border-black pt-2 text-center">
          <p className="font-bold text-sm">For {type === 'Corporate' ? form.companyName : form.customerName}</p>
          <p className="text-[10px] mt-16">Authorized Signatory / Customer</p>
        </div>
        <div className="border-t border-black pt-2 text-center">
          <p className="font-bold text-sm">For {form.providerName}</p>
          <p className="text-[10px] mt-16">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content max-w-[95vw] w-full h-[95vh] flex flex-col p-0 overflow-hidden rounded-none shadow-2xl">
        <div className="admin-modal-header border-b border-subtle p-5 flex justify-between bg-surface items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-main flex items-center gap-3">
              <FileText className="text-primary" size={24} />
              {type} Agreement Wizard
            </h2>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Refining legal terms for {type === 'Corporate' ? form.companyName : form.customerName}</p>
          </div>
          <button className="icon-btn h-12 w-12 rounded-full hover:bg-hover bg-bg transition-all" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Editable Form Side */}
          <div className="w-[45%] p-10 overflow-y-auto border-r border-subtle bg-bg custom-scrollbar">
            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-6 w-1 bg-primary rounded-full"></div>
                  <h3 className="text-xs font-black uppercase text-main tracking-widest">Party Identification</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label>Agreement Date</label><input type="date" value={form.agreementDate} onChange={e => setForm(f => ({ ...f, agreementDate: e.target.value }))} className="table-input" /></div>
                  {type === 'Corporate' ? (
                    <>
                      <div className="form-group"><label>Company Name</label><input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} className="table-input" /></div>
                      <div className="form-group col-span-2"><label>Registered Address</label><textarea value={form.companyAddress} onChange={e => setForm(f => ({ ...f, companyAddress: e.target.value }))} className="table-input h-20 py-3" /></div>
                    </>
                  ) : (
                    <>
                      <div className="form-group"><label>Customer Name</label><input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} className="table-input" /></div>
                      <div className="form-group"><label>Aadhar Number</label><input value={form.customerAadhar} onChange={e => setForm(f => ({ ...f, customerAadhar: e.target.value }))} className="table-input" /></div>
                      <div className="form-group col-span-2"><label>Residential Address</label><textarea value={form.companyAddress} onChange={e => setForm(f => ({ ...f, companyAddress: e.target.value }))} className="table-input h-20 py-3" /></div>
                    </>
                  )}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-xs font-black uppercase text-main tracking-widest">Equipment Schedule</h3>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm h-9 px-4 flex gap-2 rounded-lg" onClick={handleAddDevice}><Plus size={16} /> Add Equipment</button>
                </div>
                <div className="space-y-4">
                  {form.devices.map(d => (
                    <div key={d.id} className="p-6 bg-surface border border-subtle rounded-2xl relative shadow-sm hover:shadow-md transition-all">
                      <button className="absolute top-6 right-6 text-danger hover:scale-110 transition-transform p-1" onClick={() => removeDevice(d.id)}><Trash2 size={18} /></button>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="form-group col-span-2"><label>Model Name</label><input value={d.model} onChange={e => updateDevice(d.id, 'model', e.target.value)} className="table-input" placeholder="e.g. Dell Latitude 5420" /></div>
                        <div className="form-group col-span-2"><label>Specifications</label><input value={d.specs} onChange={e => updateDevice(d.id, 'specs', e.target.value)} className="table-input" placeholder="e.g. i5 11th Gen, 16GB RAM, 512GB SSD" /></div>
                        <div className="form-group"><label>Serial (Optional)</label><input value={d.serial} onChange={e => updateDevice(d.id, 'serial', e.target.value)} className="table-input" /></div>
                        <div className="form-group"><label>Rent (₹)</label><input type="number" value={d.rent} onChange={e => updateDevice(d.id, 'rent', Number(e.target.value))} className="table-input" /></div>
                      </div>
                    </div>
                  ))}
                  {form.devices.length === 0 && (
                    <div className="p-10 border-2 border-dashed border-subtle rounded-2xl text-center">
                      <p className="text-sm text-muted font-bold uppercase tracking-widest">No Equipment Added Yet</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-6 w-1 bg-primary rounded-full"></div>
                  <h3 className="text-xs font-black uppercase text-main tracking-widest">Legal Terms & Policies</h3>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-4 flex gap-4">
                  <Info className="text-primary shrink-0" size={20} />
                  <p className="text-xs text-primary/80 font-medium leading-relaxed">
                    <strong>Note:</strong> Every clause below is fully editable to suit specific customer negotiations. Edits will reflect immediately in the preview.
                  </p>
                </div>
                <textarea 
                  value={form.termsAndConditions} 
                  onChange={e => setForm(f => ({ ...f, termsAndConditions: e.target.value }))} 
                  className="table-input h-[600px] text-sm py-5 leading-relaxed font-mono bg-surface"
                  placeholder="Paste or edit the full agreement text here..."
                />
              </section>

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-6 w-1 bg-primary rounded-full"></div>
                  <h3 className="text-xs font-black uppercase text-main tracking-widest">Final Financial Summary</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label>Total Monthly Rent (₹)</label><input type="number" value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: Number(e.target.value) }))} className="table-input" /></div>
                  <div className="form-group"><label>Billing Cycle</label><select value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))} className="table-input"><option>Monthly</option><option>Quarterly</option><option>Annual</option></select></div>
                  <div className="form-group"><label>Security Deposit (₹)</label><input type="number" value={form.securityDeposit} onChange={e => setForm(f => ({ ...f, securityDeposit: Number(e.target.value) }))} className="table-input" /></div>
                  <div className="form-group"><label>Payment Terms</label><select value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} className="table-input"><option>Advance</option><option>Monthly Postpaid</option></select></div>
                  <div className="form-group"><label>SLA (Hours)</label><input type="number" value={form.slaTime} onChange={e => setForm(f => ({ ...f, slaTime: Number(e.target.value) }))} className="table-input" /></div>
                  <div className="form-group"><label>Jurisdiction City</label><input value={form.jurisdictionCity} onChange={e => setForm(f => ({ ...f, jurisdictionCity: e.target.value }))} className="table-input" /></div>
                </div>
              </section>
            </div>
          </div>

          {/* Dynamic Preview Side */}
          <div className="w-[55%] bg-slate-100 p-12 overflow-y-auto custom-scrollbar flex justify-center">
            <AgreementPreview />
          </div>
        </div>

        <div className="admin-modal-footer border-t border-subtle p-8 flex justify-between bg-surface items-center shadow-inner">
          <div className="flex gap-4">
            <button className="btn btn-secondary h-12 px-8 font-black uppercase tracking-widest text-xs flex items-center gap-3 rounded-xl border-2 hover:bg-bg">
              <Printer size={20} /> Print Agreement
            </button>
            <button className="btn btn-secondary h-12 px-8 font-black uppercase tracking-widest text-xs flex items-center gap-3 rounded-xl border-2 hover:bg-bg">
              <Download size={20} /> Download PDF
            </button>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-secondary h-12 px-8 font-black uppercase tracking-widest text-xs rounded-xl" onClick={onClose}>Discard</button>
            <button className="btn btn-primary h-12 px-10 font-black uppercase tracking-widest text-xs rounded-xl flex items-center gap-3 shadow-lg shadow-primary/20" onClick={handleSubmit}>
              <Save size={20} /> Finalize & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalAgreementModal;
