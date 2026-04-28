import React, { useState, useEffect, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit2, 
  FileText, 
  Users, 
  LayoutGrid, 
  TrendingUp, 
  Trash2,
  FileBadge,
  ShieldCheck,
  Send,
  Printer,
  Download,
  X,
  AlertTriangle,
  Monitor,
  IndianRupee,
  RefreshCcw,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Target,
  Sparkles,
  CheckCircle2,
  Activity,
  Zap,
  Box,
  ArrowRight,
  Clock,
  Calendar,
  Lock,
  PieChart
} from 'lucide-react';
import { cmcPlanService, cmcCustomerService } from '../../services/cmcServices';
import './DashboardPremiumStyles.css';

const CMCPlansCustomersPage = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState(cmcPlanService.getPlans());
  const [customers, setCustomers] = useState(cmcCustomerService.getCustomers());
  
  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [agreementType, setAgreementType] = useState('corporate');

  const stats = useMemo(() => {
    const revenue = customers.reduce((sum, c) => sum + (c.revenue || 0), 0);
    return {
      activeContracts: customers.length,
      availablePlans: plans.length,
      totalRevenue: revenue,
      avgMargin: '24.5%',
      expiring: customers.filter(c => c.status === 'Expiring Soon').length,
      fleetSize: customers.reduce((sum, c) => sum + (c.devicesCount || 0), 0),
      satisfaction: '98%'
    };
  }, [plans, customers]);

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

  const openProfitModal = (customer) => {
    setSelectedItem(customer);
    setShowProfitModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Motion.div 
      className="premium-dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* CMC Header */}
      <div className="flex justify-between items-center mb-10">
        
        <div className="flex gap-4">
           <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                 className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'plans' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                 onClick={() => setActiveTab('plans')}
              >
                 Service Plans
              </button>
              <button 
                 className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'customers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                 onClick={() => setActiveTab('customers')}
              >
                 Active Contracts
              </button>
           </div>
          <button 
            className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            onClick={() => activeTab === 'plans' ? openPlanModal() : openCustomerModal()}
          >
            <Plus size={18} strokeWidth={3} /> {activeTab === 'plans' ? 'New Service Plan' : 'Onboard Client'}
          </button>
        </div>
      </div>

      {/* CMC KPI Grid (7-Columns) */}
      <div className="dash-kpi-grid">
        <KPIItem title="Active CMC" value={stats.activeContracts} icon={<ShieldCheck />} color="#6366f1" bg="#e0e7ff" trend="+2 MoM" />
        <KPIItem title="Service Plans" value={stats.availablePlans} icon={<LayoutGrid />} color="#8b5cf6" bg="#ede9fe" trend="Optimized" />
        <KPIItem title="Net Revenue" value={`₹${(stats.totalRevenue/100000).toFixed(1)}L`} icon={<IndianRupee />} color="#10b981" bg="#dcfce7" trend="+12%" />
        <KPIItem title="Avg Margin" value={stats.avgMargin} icon={<TrendingUp />} color="#06b6d4" bg="#cffafe" trend="Healthy" />
        <KPIItem title="Fleet Assets" value={stats.fleetSize} icon={<Monitor />} color="#f59e0b" bg="#fef3c7" trend="Synced" />
        <KPIItem title="Expiring" value={stats.expiring} icon={<Clock />} color="#ef4444" bg="#fef2f2" trend="Renewal" negative={stats.expiring > 0} />
        <KPIItem title="CSAT Score" value={stats.satisfaction} icon={<CheckCircle2 />} color="#ec4899" bg="#fdf2f8" trend="Elite" />
      </div>

      <div className="dash-ops-grid">
        <Motion.div className="dash-card col-span-3" variants={itemVariants}>
          <div className="dash-card-header">
             <div className="flex gap-4 items-center flex-1">
                <div className="relative w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                      type="text" 
                      placeholder={`Search ${activeTab === 'plans' ? 'Service Tiers' : 'Clients & Contracts'}...`} 
                      className="h-12 w-full pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all"
                   />
                </div>
                <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                   <Filter size={18} />
                </button>
             </div>
          </div>
          
          <div className="p-2">
            {activeTab === 'plans' ? (
              <PlansTable plans={plans} onEdit={openPlanModal} />
            ) : (
              <CustomersTable 
                customers={customers} 
                onEdit={openCustomerModal} 
                onAgreement={openAgreementModal}
                onProfit={openProfitModal}
              />
            )}
          </div>
        </Motion.div>
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
      {showProfitModal && <ProfitabilityModal customer={selectedItem} onClose={() => setShowProfitModal(false)} />}
    </Motion.div>
  );
};

const KPIItem = ({ title, value, icon, color, bg, trend, negative }) => (
  <div className="dash-kpi-card group hover:border-indigo-200 transition-all">
    <div className="dash-kpi-header">
      <div className="dash-kpi-icon" style={{ backgroundColor: bg, color: color }}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className={`dash-kpi-trend ${negative ? 'negative' : ''}`}>
        {trend}
      </div>
    </div>
    <div>
      <p className="dash-kpi-label">{title}</p>
      <h3 className="dash-kpi-value">{value}</h3>
    </div>
    <div className="dash-kpi-sparkline">
       <svg viewBox="0 0 100 40" className="w-full h-full">
          <path d="M0,35 Q15,10 30,25 T60,15 T100,5" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
       </svg>
    </div>
  </div>
);

const PlansTable = ({ plans, onEdit }) => (
  <div className="overflow-x-auto cmc-custom-scroll">
    <table className="cmc-table">
      <thead>
        <tr>
          <th className="pl-8">Service Package</th>
          <th>Billing Tier</th>
          <th>Support Limits</th>
          <th>Hardware Support</th>
          <th>Response SLA</th>
          <th>Annual Pricing</th>
          <th>Status</th>
          <th className="pr-8 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {plans.map(plan => (
          <tr key={plan.id}>
            <td className="pl-8">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-tight">{plan.name}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {plan.id}</span>
              </div>
            </td>
            <td><span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider">{plan.billingType}</span></td>
            <td><span className="text-xs font-black">{plan.visits} Visits / Year</span></td>
            <td>
               <div className={`dash-tag dash-tag-${plan.partsIncluded ? 'success' : 'primary'}`}>
                  {plan.partsIncluded ? 'Full Spares Covered' : 'Labor Only'}
               </div>
            </td>
            <td>
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-indigo-600" />
                <span className="text-xs font-black">{plan.sla}</span>
              </div>
            </td>
            <td><span className="text-sm font-black text-slate-900">₹{plan.price.toLocaleString()}</span></td>
            <td><span className="dash-tag dash-tag-success">Active</span></td>
            <td className="pr-8 text-right">
              <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all" onClick={() => onEdit(plan)}><ArrowRight size={14} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CustomersTable = ({ customers, onEdit, onAgreement, onProfit }) => {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <div className="overflow-x-auto cmc-custom-scroll">
      <table className="cmc-table">
        <thead>
          <tr>
            <th className="pl-8">Client & ID</th>
            <th>Active Framework</th>
            <th>Fleet Capacity</th>
            <th>Contract Revenue</th>
            <th>Performance Margin</th>
            <th>Compliance</th>
            <th>Lifecycle</th>
            <th className="pr-8 text-right">Operations</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => {
            const isLoss = c.profit < 0;
            const profitMargin = ((c.profit / c.revenue) * 100).toFixed(1);
            
            return (
              <tr key={c.id}>
                <td className="pl-8">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tight">{c.customerName}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{c.id} • {c.contactPerson}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <FileBadge size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-tight">{c.planName}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">{c.expiryDate} Expiry</span>
                    </div>
                  </div>
                </td>
                <td><span className="px-3 py-1 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600">{c.devicesCount} Assets</span></td>
                <td><span className="text-sm font-black">₹{c.revenue.toLocaleString()}</span></td>
                <td>
                   <div 
                    className={`dash-tag dash-tag-${isLoss ? 'danger' : 'success'} cursor-pointer hover:scale-105 transition-transform`}
                    onClick={() => onProfit(c)}
                   >
                      {profitMargin}% Margin
                   </div>
                </td>
                <td><span className="dash-tag dash-tag-primary">Verified</span></td>
                <td><span className={`dash-tag dash-tag-${c.status === 'Expiring Soon' ? 'warning' : 'success'}`}>{c.status}</span></td>
                <td className="pr-8 text-right relative">
                   <button 
                     className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:text-indigo-600 transition-all"
                     onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                   >
                      <MoreVertical size={18} />
                   </button>
                   {openMenu === c.id && (
                     <div className="absolute right-8 top-12 w-64 bg-white shadow-2xl rounded-[28px] border border-slate-100 z-50 p-4 text-left animate-in fade-in slide-in-from-top-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Executive Controls</p>
                        <div className="space-y-1">
                          <MenuAction icon={<Edit2 size={14} />} label="Modify Contract" color="indigo" onClick={() => { onEdit(c); setOpenMenu(null); }} />
                          <MenuAction icon={<TrendingUp size={14} />} label="Profitability Matrix" color="violet" onClick={() => { onProfit(c); setOpenMenu(null); }} />
                          <div className="h-[1px] bg-slate-50 my-2"></div>
                          <MenuAction icon={<ShieldCheck size={14} />} label="Legal Agreement" color="emerald" onClick={() => { onAgreement(c, 'corporate'); setOpenMenu(null); }} />
                          <MenuAction icon={<RefreshCcw size={14} />} label="Initiate Renewal" color="indigo" />
                          <MenuAction icon={<Trash2 size={14} />} label="Terminate Contract" color="rose" />
                        </div>
                     </div>
                   )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const MenuAction = ({ icon, label, color, onClick }) => (
  <button 
    className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all group text-slate-600" 
    onClick={onClick}
  >
    <div className={`text-${color}-500`}>{icon}</div>
    <span>{label}</span>
  </button>
);

// --- Modals (Refined for Premium) ---

const PlanModal = ({ plan, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
    <div className="bg-white rounded-[56px] w-full max-w-2xl overflow-hidden shadow-2xl">
      <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">Product Architecture</span>
           </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{plan ? 'Refine' : 'Architect'} Service Plan</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Define structural coverage and pricing logic.</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
      </div>
      <div className="p-14 space-y-10">
        <div className="grid grid-cols-2 gap-8">
          <FormGroup label="Plan Designation" placeholder="e.g. Platinum Enterprise" value={plan?.name} />
          <FormGroup label="Billing Frequency" type="select" options={['Monthly', 'Yearly', 'Quarterly']} value={plan?.billingType} />
          <FormGroup label="Unit Valuation (₹)" type="number" value={plan?.price} />
          <FormGroup label="Maintenance Quota" value={plan?.visits} />
        </div>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Inclusion Intelligence</label>
          <div className="grid grid-cols-2 gap-4">
             <PremiumToggle label="Hardware Spares" sub="Full Component Coverage" checked={plan?.partsIncluded} />
             <PremiumToggle label="Express Response" sub="SLA Commitment < 4Hrs" checked={true} />
          </div>
        </div>
      </div>
      <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
        <button className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400" onClick={onClose}>Discard</button>
        <button className="h-14 px-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Deploy Service Tier</button>
      </div>
    </div>
  </div>
);

const CustomerModal = ({ customer, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
    <div className="bg-white rounded-[56px] w-full max-w-4xl overflow-hidden shadow-2xl">
      <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full">Client Lifecycle</span>
           </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{customer ? 'Update' : 'Activate'} CMC Contract</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Bind customer infrastructure to a comprehensive maintenance framework.</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
      </div>
      <div className="p-14 space-y-12">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2"><FormGroup label="Entity Name" value={customer?.customerName} /></div>
          <FormGroup label="Classification" type="select" options={['Corporate', 'Individual']} value={customer?.customerType} />
          <FormGroup label="Select Service Framework" type="select" options={['Basic CMC', 'Standard CMC', 'Premium CMC']} value={customer?.planName} />
          <FormGroup label="Activation Date" type="date" value={customer?.startDate} />
          <FormGroup label="Termination Date" type="date" value={customer?.expiryDate} />
        </div>
        
        <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] text-center group hover:bg-indigo-50/30 hover:border-indigo-600/30 transition-all cursor-pointer">
           <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
             <Plus size={24} className="text-indigo-600" />
           </div>
           <p className="text-xs font-black uppercase tracking-widest text-slate-900 mb-2">Sync Assets from Registry</p>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight max-w-xs mx-auto">No assets linked. Click to associate hardware inventory with this contract.</p>
        </div>
      </div>
      <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
        <button className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400" onClick={onClose}>Discard</button>
        <button className="h-14 px-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Authorize Engagement</button>
      </div>
    </div>
  </div>
);

const AgreementModal = ({ customer, onClose }) => {
  const [formData, setFormData] = useState({
    agreementDate: new Date().toISOString().split('T')[0],
    companyName: 'REPAIRBOY TECHNOLOGIES',
    companyAddress: 'Industrial Area, Phase 2, Indore',
    companyGstin: '23AAAAA0000A1Z5',
    clientName: customer.customerName,
    clientAddress: 'Corporate HQ, Business District',
    clientGstin: customer.gst || 'N/A',
    startDate: customer.startDate,
    endDate: customer.expiryDate,
    cmcType: 'Full Comprehensive (Service + Hardware)',
    criticalResponse: '4',
    partsIncluded: 'Motherboard, RAM, Internal Storage, Power Logic, Peripheral Interface Boards',
    totalAmount: customer.revenue,
    terms: 'Contract covers all internal hardware parts. Software licensing and consumables excluded.',
    policies: 'On-site technical resolution guaranteed within 4 operational hours.'
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
      <div className="bg-white rounded-[64px] w-full max-w-[1450px] h-[92vh] overflow-hidden shadow-2xl flex">
        <div className="w-[450px] border-r border-slate-100 flex flex-col bg-slate-50/50 p-10">
           <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-10">Legal Framework</h3>
           <div className="flex-1 space-y-8 overflow-y-auto pr-4 cmc-custom-scroll">
              <FormGroup label="Client Designation" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Included Hardware Components</label>
                <textarea className="w-full h-32 p-5 bg-white border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all resize-none shadow-sm" value={formData.partsIncluded} onChange={e => setFormData({...formData, partsIncluded: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <FormGroup label="Response SLA (Hrs)" type="number" value={formData.criticalResponse} />
                 <FormGroup label="Valuation (₹)" type="number" value={formData.totalAmount} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Special Clauses</label>
                <textarea className="w-full h-32 p-5 bg-white border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all resize-none shadow-sm" value={formData.terms} />
              </div>
           </div>
           <button className="mt-10 h-16 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Publish Agreement</button>
        </div>

        <div className="flex-1 bg-slate-200 overflow-y-auto p-20 flex flex-col items-center">
           <div className="w-full max-w-[800px] flex justify-end mb-10 gap-3">
              <DocBtn icon={<Printer />} />
              <DocBtn icon={<Download />} />
              <DocBtn icon={<X />} onClick={onClose} />
           </div>
           <div className="w-full max-w-[800px] bg-white p-24 shadow-2xl rounded-[4px] min-h-[1100px] flex flex-col font-serif">
              <div className="text-center mb-20">
                 <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl mx-auto flex items-center justify-center font-black text-3xl mb-8">RB</div>
                 <h1 className="text-3xl font-bold tracking-tight mb-2">COMPREHENSIVE MAINTENANCE CONTRACT</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">REF: CMC-EXEC-{Math.floor(Math.random() * 90000)}</p>
              </div>

              <div className="space-y-12 text-sm leading-relaxed text-slate-700 italic border-l-4 border-slate-100 pl-10 mb-20">
                 This Agreement is entered into on this day {formData.agreementDate} by and between <strong>{formData.companyName}</strong> and <strong>{formData.clientName}</strong>.
              </div>

              <div className="grid grid-cols-2 gap-20 mb-20">
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Service Provider</h5>
                    <p className="font-bold text-slate-900 leading-tight">{formData.companyName}<br/><span className="font-normal text-slate-500 text-xs">{formData.companyAddress}</span></p>
                 </div>
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">The Client</h5>
                    <p className="font-bold text-slate-900 leading-tight">{formData.clientName}<br/><span className="font-normal text-slate-500 text-xs">{formData.clientAddress}</span></p>
                 </div>
              </div>

              <div className="space-y-10 text-xs leading-loose">
                 <p><strong>I. Scope of Work:</strong> The Provider assumes full responsibility for the maintenance and continuous operation of the fleet assets linked to this contract. This includes scheduled preventive maintenance and unlimited repair interventions.</p>
                 <p><strong>II. Hardware Coverage:</strong> The following components are covered under the comprehensive framework: <em>{formData.partsIncluded}</em>.</p>
                 <p><strong>III. Compensation:</strong> Total contract value is set at INR <strong>{Number(formData.totalAmount).toLocaleString()}</strong>, payable as per the selected billing tier.</p>
              </div>

              <div className="mt-auto pt-40 grid grid-cols-2 gap-40 text-center">
                 <div className="border-t border-slate-200 pt-6">
                    <p className="text-[10px] font-black uppercase tracking-widest">Provider Signature</p>
                 </div>
                 <div className="border-t border-slate-200 pt-6">
                    <p className="text-[10px] font-black uppercase tracking-widest">Client Signature</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ProfitabilityModal = ({ customer, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
    <div className="bg-white rounded-[56px] w-full max-w-3xl overflow-hidden shadow-2xl">
      <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-violet-100 text-violet-600 text-[9px] font-black uppercase tracking-widest rounded-full">Financial Audit</span>
           </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Contract Profitability</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Operational cost absorption vs revenue performance.</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
      </div>
      <div className="p-14 space-y-10">
         <div className="grid grid-cols-3 gap-6">
            <MetricBox label="Contract Revenue" value={customer.revenue} />
            <MetricBox label="Service Costs" value={customer.cost} />
            <MetricBox label="Net Position" value={customer.profit} color={customer.profit < 0 ? 'rose' : 'emerald'} />
         </div>

         <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Absorption Metrics</h5>
            <CostBar label="Hardware Spare Parts" value={32500} total={customer.cost} color="bg-indigo-600" />
            <CostBar label="Labor & Technician Logistics" value={14000} total={customer.cost} color="#8b5cf6" />
            <CostBar label="Administrative Overheads" value={6000} total={customer.cost} color="#94a3b8" />
         </div>

         <div className={`p-10 rounded-[40px] flex items-center gap-8 ${customer.profit < 0 ? 'bg-rose-50 border border-rose-100' : 'bg-indigo-50 border border-indigo-100'}`}>
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${customer.profit < 0 ? 'bg-rose-500' : 'bg-indigo-600'} text-white`}>
               <TrendingUp size={32} />
            </div>
            <div>
               <p className="text-xs font-black uppercase text-slate-900 mb-1">Executive Summary</p>
               <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {customer.profit < 0 
                    ? 'Warning: High spare parts consumption is eroding contract margins. Recommend audit of older hardware assets.'
                    : 'Success: Maintenance visits are perfectly optimized for this fleet size. Profit margins are within elite parameters.'
                  }
               </p>
            </div>
         </div>
      </div>
      <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
         <button className="h-16 px-12 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={onClose}>Acknowledge Audit</button>
      </div>
    </div>
  </div>
);

const DocBtn = ({ icon, onClick }) => (
  <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:shadow-xl transition-all shadow-lg" onClick={onClick}>
     {React.cloneElement(icon, { size: 20 })}
  </button>
);

const MetricBox = ({ label, value, color = 'slate' }) => (
  <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] text-center">
     <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">{label}</p>
     <h4 className={`text-xl font-black text-${color === 'slate' ? 'slate-900' : color + '-600'} tracking-tighter`}>₹{Number(value).toLocaleString()}</h4>
  </div>
);

const CostBar = ({ label, value, total, color }) => {
  const percentage = ((value / total) * 100).toFixed(0);
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
          <span className="text-slate-500">{label}</span>
          <span className="text-slate-900">₹{value.toLocaleString()} ({percentage}%)</span>
       </div>
       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000`} style={{ width: `${percentage}%`, backgroundColor: color.startsWith('#') ? color : '' }} className={!color.startsWith('#') ? `${color} h-full` : ''}></div>
       </div>
    </div>
  );
};

const FormGroup = ({ label, type = 'text', options = [], value, placeholder, onChange }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    {type === 'select' ? (
      <select className="h-14 w-full px-6 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-sm cursor-pointer" defaultValue={value} onChange={onChange}>
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    ) : (
      <input 
        type={type} 
        className="h-14 w-full px-6 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-tight focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-sm" 
        placeholder={placeholder}
        defaultValue={value}
        onChange={onChange}
      />
    )}
  </div>
);

const PremiumToggle = ({ label, sub, checked }) => (
  <label className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-indigo-600/30 transition-all shadow-sm group">
    <div className="relative">
      <input type="checkbox" className="sr-only peer" defaultChecked={checked} />
      <div className="w-10 h-5 bg-slate-200 peer-checked:bg-indigo-600 rounded-full transition-all"></div>
      <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
    </div>
    <div>
       <p className="text-[10px] font-black uppercase tracking-tight text-slate-900">{label}</p>
       <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">{sub}</p>
    </div>
  </label>
);

export default CMCPlansCustomersPage;
