import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit2, 
  FileText, 
  UserPlus, 
  LayoutGrid, 
  Users, 
  Monitor, 
  IndianRupee, 
  RefreshCcw, 
  Trash2,
  FileBadge,
  ShieldCheck,
  Send,
  Printer,
  Download,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { amcPlanService, amcCustomerService } from '../../services/amcServices';
import './AMCPremiumStyles.css';

const AMCPlansCustomersPage = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [agreementType, setAgreementType] = useState('corporate'); // 'corporate' or 'individual'

  useEffect(() => {
    setPlans(amcPlanService.getPlans());
    setCustomers(amcCustomerService.getCustomers());
    setLoading(false);
  }, []);

  const openPlanModal = (plan = null) => {
    setSelectedItem(plan);
    setShowPlanModal(true);
  };

  const openCustomerModal = (customer = null) => {
    setSelectedItem(customer);
    setShowCustomerModal(true);
  };

  const openAgreementModal = (customer, type) => {
    setSelectedItem(customer);
    setAgreementType(type);
    setShowAgreementModal(true);
  };

  const openQuoteModal = (customer) => {
    setSelectedItem(customer);
    setShowQuoteModal(true);
  };

  return (
    <div className="admin-module-page amc-plans-customers-page p-8">
      <div className="flex justify-between items-center mb-8">
        
        <div className="amc-tab-header">
          <button 
            className={`amc-tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            <LayoutGrid size={14} className="inline mr-2" /> AMC Plans
          </button>
          <button 
            className={`amc-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users size={14} className="inline mr-2" /> AMC Customers
          </button>
        </div>
      </div>

      <div className="card bg-white shadow-xl border-none overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="table-input pl-10"
            />
          </div>
          <button 
            className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
            onClick={() => activeTab === 'plans' ? openPlanModal() : openCustomerModal()}
          >
            <Plus size={16} /> {activeTab === 'plans' ? 'Create Plan' : 'Add AMC Customer'}
          </button>
        </div>

        {activeTab === 'plans' ? (
          <PlansTable plans={plans} onEdit={openPlanModal} />
        ) : (
          <CustomersTable 
            customers={customers} 
            onEdit={openCustomerModal} 
            onAgreement={openAgreementModal}
            onQuote={openQuoteModal}
          />
        )}
      </div>

      {/* Modals */}
      {showPlanModal && <PlanModal plan={selectedItem} onClose={() => setShowPlanModal(false)} />}
      {showCustomerModal && <CustomerModal customer={selectedItem} onClose={() => setShowCustomerModal(false)} />}
      {showAgreementModal && (
        <AgreementModal 
          customer={selectedItem} 
          type={agreementType} 
          onClose={() => setShowAgreementModal(false)} 
        />
      )}
      {showQuoteModal && <QuotationModal customer={selectedItem} onClose={() => setShowQuoteModal(false)} />}
    </div>
  );
};

const PlansTable = ({ plans, onEdit }) => (
  <div className="overflow-x-auto">
    <table className="leads-table">
      <thead>
        <tr>
          <th>Plan ID</th>
          <th>Plan Name</th>
          <th>Visits</th>
          <th>SLA</th>
          <th>Price</th>
          <th>Duration</th>
          <th>Status</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {plans.map(plan => (
          <tr key={plan.id}>
            <td className="font-black text-xs text-primary">{plan.id}</td>
            <td className="font-bold">{plan.name}</td>
            <td><span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase">{plan.visits} Visits</span></td>
            <td className="font-bold text-xs">{plan.sla} Response</td>
            <td className="font-black">₹{plan.price.toLocaleString()}</td>
            <td className="text-xs font-bold opacity-60">{plan.duration}</td>
            <td><span className="status-pill status-success">Active</span></td>
            <td className="text-right">
              <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => onEdit(plan)}><MoreVertical size={16} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CustomersTable = ({ customers, onEdit, onAgreement, onQuote }) => {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <div className="overflow-x-auto">
      <table className="leads-table">
        <thead>
          <tr>
            <th>AMC ID</th>
            <th>Customer / Company</th>
            <th>Type</th>
            <th>Plan</th>
            <th>AMC Type</th>
            <th>Start Date</th>
            <th>Expiry</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td className="font-black text-xs text-primary">{c.id}</td>
              <td>
                <div className="flex flex-col">
                  <span className="font-bold">{c.customerName}</span>
                  <span className="text-[10px] text-muted font-bold uppercase">{c.contactPerson}</span>
                </div>
              </td>
              <td><span className={`status-pill ${c.customerType === 'Corporate' ? 'status-primary' : 'status-warning'}`}>{c.customerType}</span></td>
              <td className="font-bold text-xs">{c.planName}</td>
              <td className="text-[10px] font-black uppercase opacity-60">{c.amcType}</td>
              <td className="text-xs font-bold">{c.startDate}</td>
              <td className="text-xs font-black text-danger">{c.expiryDate}</td>
              <td><span className={`status-pill ${c.status === 'Expiring Soon' ? 'status-warning' : 'status-success'}`}>{c.status}</span></td>
              <td className="text-right relative">
                <button 
                  className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                >
                  <MoreVertical size={16} />
                </button>
                {openMenu === c.id && (
                  <div className="absolute right-0 top-10 w-56 bg-white shadow-2xl rounded-2xl border border-slate-100 z-50 p-2 text-left animate-in fade-in slide-in-from-top-2">
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all" onClick={() => onEdit(c)}>
                      <Edit2 size={14} className="text-primary" /> Edit Profile
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all" onClick={() => onQuote(c)}>
                      <FileText size={14} className="text-success" /> AMC Quotation
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all" onClick={() => onAgreement(c, 'corporate')}>
                      <ShieldCheck size={14} className="text-info" /> Corporate Agreement
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all" onClick={() => onAgreement(c, 'individual')}>
                      <FileBadge size={14} className="text-warning" /> Individual Agreement
                    </button>
                    <div className="h-[1px] bg-slate-50 my-1"></div>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all">
                      <Monitor size={14} className="text-slate-400" /> Assign Devices
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all">
                      <IndianRupee size={14} className="text-slate-400" /> Generate Invoice
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all">
                      <RefreshCcw size={14} className="text-primary" /> Renew AMC
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Modals (Simplified for brevity, but functional) ---

const PlanModal = ({ plan, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
    <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-xl font-black text-main">{plan ? 'Edit AMC Plan' : 'Create New AMC Plan'}</h3>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Configure service package & SLA</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all shadow-sm"><X size={20} /></button>
      </div>
      <div className="p-10 grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Plan Name</label>
          <input type="text" className="table-input" placeholder="e.g. Premium Support" defaultValue={plan?.name} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Visits Per Year</label>
          <input type="text" className="table-input" placeholder="e.g. 4 or Unlimited" defaultValue={plan?.visits} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Price (Base)</label>
          <input type="number" className="table-input" placeholder="₹" defaultValue={plan?.price} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">SLA Response</label>
          <input type="text" className="table-input" placeholder="e.g. 4 Hours" defaultValue={plan?.sla} />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Included Services</label>
          <div className="grid grid-cols-3 gap-3">
             {['Cleaning', 'Breakdown Support', 'Remote Support', 'OS Install', 'Parts Support', 'Priority Support'].map(s => (
               <label key={s} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300" defaultChecked={plan?.services?.includes(s)} />
                  <span className="text-[10px] font-bold uppercase">{s}</span>
               </label>
             ))}
          </div>
        </div>
      </div>
      <div className="p-8 bg-slate-50/50 flex justify-end gap-4">
        <button className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted hover:bg-white transition-all" onClick={onClose}>Cancel</button>
        <button className="px-10 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-light transition-all">Save Plan</button>
      </div>
    </div>
  </div>
);

const CustomerModal = ({ customer, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
    <div className="bg-white rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-xl font-black text-main">{customer ? 'Edit AMC Customer' : 'Onboard AMC Customer'}</h3>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Profile & Contract Timeline</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all shadow-sm"><X size={20} /></button>
      </div>
      <div className="p-10 grid grid-cols-3 gap-8 overflow-y-auto max-h-[70vh]">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Customer Type</label>
          <select className="table-input" defaultValue={customer?.customerType}>
            <option>Corporate</option>
            <option>Individual</option>
          </select>
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Company / Customer Name</label>
          <input type="text" className="table-input" defaultValue={customer?.customerName} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Authorized Person 1</label>
          <input type="text" className="table-input" defaultValue={customer?.contactPerson} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Authorized Person 2</label>
          <input type="text" className="table-input" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">GST Number</label>
          <input type="text" className="table-input" defaultValue={customer?.gst} />
        </div>
        <div className="col-span-3 space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Full Address</label>
          <input type="text" className="table-input" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">AMC Plan</label>
          <select className="table-input" defaultValue={customer?.planName}>
            <option>Basic</option>
            <option>Standard</option>
            <option>Premium</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">AMC Type</label>
          <select className="table-input" defaultValue={customer?.amcType}>
            <option>Comprehensive</option>
            <option>Non-Comprehensive</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Status</label>
          <select className="table-input" defaultValue={customer?.status}>
            <option>Active</option>
            <option>Expiring Soon</option>
            <option>Expired</option>
            <option>Draft</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Start Date</label>
          <input type="date" className="table-input" defaultValue={customer?.startDate} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted tracking-widest">Expiry Date</label>
          <input type="date" className="table-input" defaultValue={customer?.expiryDate} />
        </div>
      </div>
      <div className="p-8 bg-slate-50/50 flex justify-end gap-4">
        <button className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted hover:bg-white transition-all" onClick={onClose}>Cancel</button>
        <button className="px-10 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-light transition-all">Save Customer</button>
      </div>
    </div>
  </div>
);

const AgreementModal = ({ customer, type, onClose }) => {
  const [formData, setFormData] = useState({
    agreementDate: new Date().toISOString().split('T')[0],
    companyName: 'SAPTARISHI SOLUTIONS',
    companyAddress: 'Plot No 45, Tech Hub, Mumbai',
    companyGstin: '27AAAAA0000A1Z5',
    clientName: customer.customerName,
    clientAddress: 'Client Office Address, Road 12',
    clientGstin: customer.gst || 'N/A',
    startDate: customer.startDate,
    endDate: customer.expiryDate,
    amcType: customer.amcType,
    criticalResponse: '4',
    normalResponse: '24',
    resolutionTime: '48 Hours',
    totalAmount: customer.revenue,
    terms: 'Standard Annual Maintenance Terms apply. Parts not included in non-comprehensive plans.',
    policies: 'Privacy and Data protection strictly enforced.'
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[40px] w-full max-w-[1400px] h-[90vh] overflow-hidden shadow-2xl flex animate-in zoom-in-95">
        {/* Form Panel */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
             <h3 className="text-lg font-black text-main">Agreement Config</h3>
             <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest">{type}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-muted">Agreement Date</label>
                 <input type="date" className="table-input" value={formData.agreementDate} onChange={e => setFormData({...formData, agreementDate: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-muted">AMC Type</label>
                 <select className="table-input" value={formData.amcType} onChange={e => setFormData({...formData, amcType: e.target.value})}>
                   <option>Comprehensive</option>
                   <option>Non-Comprehensive</option>
                 </select>
               </div>
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-muted">Client Name</label>
               <input type="text" className="table-input" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-muted">Client Address</label>
               <textarea className="table-input h-20" value={formData.clientAddress} onChange={e => setFormData({...formData, clientAddress: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-muted">Critical Resp (Hrs)</label>
                 <input type="number" className="table-input" value={formData.criticalResponse} onChange={e => setFormData({...formData, criticalResponse: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-muted">Total Value (₹)</label>
                 <input type="number" className="table-input" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} />
               </div>
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-muted">Custom Terms & Conditions (Editable)</label>
               <textarea className="table-input h-32" value={formData.terms} onChange={e => setFormData({...formData, terms: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-muted">Company Policies (Editable)</label>
               <textarea className="table-input h-32" value={formData.policies} onChange={e => setFormData({...formData, policies: e.target.value})} />
             </div>
          </div>
          <div className="p-8 bg-slate-50/50 flex gap-4">
             <button className="flex-1 py-3 bg-main text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Save & Generate</button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-slate-100 overflow-y-auto p-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              <button className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-all"><Printer size={18} /></button>
              <button className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-all"><Download size={18} /></button>
              <button className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-all"><Send size={18} /></button>
            </div>
            <button onClick={onClose} className="p-3 bg-white hover:bg-slate-50 rounded-full shadow-sm"><X size={20} /></button>
          </div>

          <div className="agreement-paper animate-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <h1 className="text-2xl mb-2">{type === 'corporate' ? 'CORPORATE AMC AGREEMENT' : 'INDIVIDUAL AMC AGREEMENT'}</h1>
              <p className="text-xs font-bold text-muted uppercase tracking-[0.2em]">Agreement ID: AMC-PREV-{Math.floor(Math.random()*10000)}</p>
            </div>

            <p className="mb-8">This Annual Maintenance Contract (AMC) Agreement is made on <strong>{formData.agreementDate}</strong> between:</p>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <h4 className="text-[10px] font-black uppercase text-muted tracking-widest mb-4">Service Provider</h4>
                <p className="font-black text-sm">{formData.companyName}</p>
                <p className="text-xs opacity-70 leading-relaxed mt-1">{formData.companyAddress}</p>
                <p className="text-[10px] font-bold mt-2">GST: {formData.companyGstin}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase text-muted tracking-widest mb-4">Client Detail</h4>
                <p className="font-black text-sm">{formData.clientName}</p>
                <p className="text-xs opacity-70 leading-relaxed mt-1">{formData.clientAddress}</p>
                <p className="text-[10px] font-bold mt-2">GST: {formData.clientGstin}</p>
              </div>
            </div>

            <div className="space-y-8 text-sm">
              <section>
                <h4 className="font-black mb-2">1. CONTRACT PERIOD</h4>
                <p>From <strong>{formData.startDate}</strong> to <strong>{formData.endDate}</strong> (12 Months Coverage)</p>
              </section>

              <section>
                <h4 className="font-black mb-2">2. SERVICE SLA</h4>
                <p>Provider agrees to respond to Critical issues within <strong>{formData.criticalResponse} Hours</strong> and Normal issues within <strong>{formData.normalResponse} Hours</strong>. Guaranteed resolution within <strong>{formData.resolutionTime}</strong>.</p>
              </section>

              <section>
                <h4 className="font-black mb-2">3. PAYMENT TERMS</h4>
                <p>The total consideration for this contract is <strong>₹{formData.totalAmount?.toLocaleString()}</strong> plus applicable GST. Payment to be made 100% in advance unless specified otherwise.</p>
              </section>

              <section>
                <h4 className="font-black mb-2">4. CUSTOM TERMS & CONDITIONS</h4>
                <p className="whitespace-pre-line leading-relaxed opacity-80">{formData.terms}</p>
              </section>

              <section>
                <h4 className="font-black mb-2">5. COMPANY POLICIES</h4>
                <p className="whitespace-pre-line leading-relaxed opacity-80">{formData.policies}</p>
              </section>
            </div>

            <div className="mt-20 grid grid-cols-2 gap-20 pt-12 border-t border-slate-100">
               <div className="space-y-12">
                  <div className="h-10 w-40 border-b border-slate-300"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Authorized Signatory (Provider)</p>
               </div>
               <div className="space-y-12">
                  <div className="h-10 w-40 border-b border-slate-300"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Authorized Signatory (Client)</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuotationModal = ({ customer, onClose }) => {
  const [formData, setFormData] = useState({
    quoteDate: new Date().toISOString().split('T')[0],
    quoteNo: `QTN-AMC-${Math.floor(Math.random()*10000)}`,
    validity: '30 Days',
    pricePerUnit: '1500',
    totalDevices: customer.devicesCount || 10,
    gstMode: 'Excluding GST',
    scope: 'Preventive maintenance, Breakdown support, Remote support, OS installation'
  });

  const subtotal = formData.pricePerUnit * formData.totalDevices;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[40px] w-full max-w-[1400px] h-[90vh] overflow-hidden shadow-2xl flex animate-in zoom-in-95">
        {/* Form Panel */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
             <h3 className="text-lg font-black text-main">Quotation Config</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-muted">Quote Date</label>
                 <input type="date" className="table-input" value={formData.quoteDate} onChange={e => setFormData({...formData, quoteDate: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-muted">Validity</label>
                 <select className="table-input" value={formData.validity} onChange={e => setFormData({...formData, validity: e.target.value})}>
                   <option>15 Days</option>
                   <option>30 Days</option>
                   <option>60 Days</option>
                 </select>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-muted">Price / Unit (₹)</label>
                 <input type="number" className="table-input" value={formData.pricePerUnit} onChange={e => setFormData({...formData, pricePerUnit: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-muted">Total Units</label>
                 <input type="number" className="table-input" value={formData.totalDevices} onChange={e => setFormData({...formData, totalDevices: e.target.value})} />
               </div>
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-muted">GST Mode</label>
               <select className="table-input" value={formData.gstMode} onChange={e => setFormData({...formData, gstMode: e.target.value})}>
                 <option>Including GST</option>
                 <option>Excluding GST</option>
               </select>
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-muted">Scope of Work</label>
               <textarea className="table-input h-32" value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})} />
             </div>
          </div>
          <div className="p-8 bg-slate-50/50 flex flex-col gap-4">
             <div className="flex justify-between text-xs font-black uppercase px-2">
                <span className="text-muted">Total Quote</span>
                <span className="text-primary text-lg">₹{total.toLocaleString()}</span>
             </div>
             <button className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-light transition-all">Generate Quotation</button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-slate-100 overflow-y-auto p-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              <button className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-all"><Printer size={18} /></button>
              <button className="p-3 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-all"><Download size={18} /></button>
            </div>
            <button onClick={onClose} className="p-3 bg-white hover:bg-slate-50 rounded-full shadow-sm"><X size={20} /></button>
          </div>

          <div className="agreement-paper animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-start mb-16">
              
              <div className="text-right">
                 <p className="font-black text-sm">SAPTARISHI SOLUTIONS</p>
                 <p className="text-[10px] opacity-60">Plot No 45, Tech Hub, Mumbai</p>
              </div>
            </div>

            <div className="mb-12">
               <h4 className="text-[10px] font-black uppercase text-muted tracking-widest mb-4">Quote For</h4>
               <p className="font-black text-base">{customer.customerName}</p>
               <p className="text-xs opacity-70 mt-1">Authorized Person: {customer.contactPerson}</p>
            </div>

            <table className="w-full mb-12">
               <thead className="border-b-2 border-slate-900">
                  <tr className="text-left text-[10px] font-black uppercase tracking-widest">
                     <th className="py-4">Description</th>
                     <th className="py-4 text-center">Qty</th>
                     <th className="py-4 text-right">Unit Price</th>
                     <th className="py-4 text-right">Total</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  <tr className="text-sm">
                     <td className="py-6">
                        <p className="font-bold">Annual Maintenance Contract Service</p>
                        <p className="text-[10px] opacity-60 mt-1">{formData.scope}</p>
                     </td>
                     <td className="py-6 text-center font-bold">{formData.totalDevices}</td>
                     <td className="py-6 text-right font-bold">₹{Number(formData.pricePerUnit).toLocaleString()}</td>
                     <td className="py-6 text-right font-black">₹{subtotal.toLocaleString()}</td>
                  </tr>
               </tbody>
            </table>

            <div className="flex justify-end mb-16">
               <div className="w-64 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                     <span className="text-muted">Subtotal</span>
                     <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                     <span className="text-muted">GST (18%)</span>
                     <span>₹{gst.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-900 flex justify-between font-black">
                     <span className="uppercase text-[10px] tracking-widest">Grand Total</span>
                     <span className="text-lg">₹{total.toLocaleString()}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-12 text-[10px] leading-relaxed">
               <div>
                  <h4 className="font-black uppercase tracking-widest mb-2">Terms & Validity</h4>
                  <p>• Quotation valid for {formData.validity}</p>
                  <p>• Service will start post approval and payment</p>
                  <p>• Standard SLA response times apply</p>
               </div>
               <div className="text-right">
                  <p className="font-black italic text-muted mb-4">This is a computer generated document.</p>
                  <p className="font-black text-main">SAPTARISHI SOLUTIONS PVT LTD</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMCPlansCustomersPage;
