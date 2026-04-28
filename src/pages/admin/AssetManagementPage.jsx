import React, { useState, useMemo, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Search, 
  Monitor, 
  Smartphone, 
  Printer, 
  Server, 
  Cpu, 
  Plus, 
  Filter, 
  MoreVertical, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  History, 
  Settings2, 
  X, 
  QrCode, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  IndianRupee,
  MapPin,
  Tag,
  Link as LinkIcon,
  HardDrive,
  Settings,
  TrendingUp,
  Box
} from 'lucide-react';
import { assetManagementService } from '../../services/assetManagementService';
import './DashboardPremiumStyles.css';

const AssetManagementPage = () => {
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAssets(assetManagementService.getAssets());
    setStats(assetManagementService.getStats());
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [assets, searchTerm, filterStatus]);

  const getAssetIcon = (type) => {
    const size = 20;
    switch (type.toLowerCase()) {
      case 'laptop': return <Monitor size={size} />;
      case 'desktop': return <Cpu size={size} />;
      case 'printer': return <Printer size={size} />;
      case 'server': return <Server size={size} />;
      case 'mobile': return <Smartphone size={size} />;
      default: return <HardDrive size={size} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Rented': return 'primary';
      case 'Sold': return 'info';
      case 'Under Repair': return 'warning';
      case 'Idle': return 'muted';
      case 'Replaced': return 'danger';
      case 'Scrapped': return 'danger';
      default: return 'primary';
    }
  };

  if (!stats.totalAssets) return null;

  return (
    <Motion.div 
      className="premium-dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Asset Header */}
      <div className="flex justify-between items-center mb-10">
        
        <div className="flex gap-4">
          <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
             <QrCode size={14} className="text-indigo-600" /> Bulk QR Print
          </button>
          <button className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20" onClick={() => setShowAddModal(true)}>
             <Plus size={18} strokeWidth={3} /> Onboard Physical Asset
          </button>
        </div>
      </div>

      {/* Asset KPI Grid (7-Columns) */}
      <div className="dash-kpi-grid">
        <KPIItem title="Total Fleet" value={stats.totalAssets} icon={<Monitor />} color="#6366f1" bg="#e0e7ff" trend="+5 New" />
        <KPIItem title="Portfolio Value" value={`₹${(stats.totalValue / 100000).toFixed(1)}L`} icon={<IndianRupee />} color="#06b6d4" bg="#cffafe" trend="+12%" />
        <KPIItem title="Active Rentals" value={stats.rented} icon={<UserPlus />} color="#10b981" bg="#dcfce7" trend="Synced" />
        <KPIItem title="Maintenance" value={stats.underRepair} icon={<Settings2 />} color="#ef4444" bg="#fef2f2" trend="Review" negative={true} />
        <KPIItem title="Ready Assets" value={stats.available} icon={<CheckCircle2 />} color="#f59e0b" bg="#fef3c7" trend="Optimal" />
        <KPIItem title="Idle Pool" value={stats.idle} icon={<Clock />} color="#8b5cf6" bg="#ede9fe" trend="Low Usage" negative={true} />
        <KPIItem title="Asset Pulse" value="Stable" icon={<Activity />} color="#3b82f6" bg="#dbeafe" trend="Healthy" />
      </div>

      <div className="dash-ops-grid">
        <Motion.div className="dash-card col-span-3" variants={itemVariants}>
          <div className="dash-card-header">
             <div className="flex gap-4 items-center flex-1">
                <div className="relative w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Search Tag, Serial or Model..." 
                      className="h-12 w-full pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
                <div className="flex gap-2">
                   {['All', 'Available', 'Rented', 'Sold', 'Under Repair'].map(status => (
                      <button 
                         key={status}
                         onClick={() => setFilterStatus(status)}
                         className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filterStatus === status ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                      >
                         {status}
                      </button>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
             <table className="cmc-table">
                <thead>
                   <tr>
                      <th className="pl-8">Asset Tag / Serial</th>
                      <th>Specifications</th>
                      <th>Status</th>
                      <th>Assignment</th>
                      <th>Value</th>
                      <th className="pr-8 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody>
                   {filteredAssets.map(asset => (
                      <tr key={asset.id}>
                         <td className="pl-8">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                  {getAssetIcon(asset.type)}
                               </div>
                               <div>
                                  <p className="text-xs font-black uppercase tracking-tight">{asset.assetTag}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">S/N: {asset.serialNumber}</p>
                               </div>
                            </div>
                         </td>
                         <td>
                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{asset.brand} {asset.model}</p>
                            <p className="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">{asset.configuration}</p>
                         </td>
                         <td><span className={`dash-tag dash-tag-${getStatusColor(asset.status)}`}>{asset.status}</span></td>
                         <td>
                            {asset.assignedCustomer ? (
                               <div className="flex items-center gap-2">
                                  <LinkIcon size={12} className="text-indigo-600" />
                                  <span className="text-[10px] font-black uppercase">{asset.assignedCustomer}</span>
                               </div>
                            ) : (
                               <span className="text-[9px] font-bold text-slate-400 uppercase">{asset.location}</span>
                            )}
                         </td>
                         <td><span className="text-xs font-black">₹{asset.currentValue?.toLocaleString()}</span></td>
                         <td className="pr-8 text-right">
                            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all"><ArrowRight size={14} /></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </Motion.div>
      </div>

      {showAddModal && <AddAssetModal onClose={() => setShowAddModal(false)} onSave={() => { loadData(); setShowAddModal(false); }} />}
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

const AddAssetModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    assetTag: '',
    serialNumber: '',
    type: 'Laptop',
    brand: '',
    model: '',
    configuration: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    location: 'Main Warehouse',
    notes: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    assetManagementService.addAsset({
      ...formData,
      purchasePrice: Number(formData.purchasePrice),
      currentValue: Number(formData.currentValue) || Number(formData.purchasePrice)
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
      <div className="bg-white rounded-[56px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
         <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-xl">
                  <Monitor size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900">Onboard Asset</h3>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Enroll company-owned physical hardware</p>
               </div>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
         </div>

         <div className="flex-1 overflow-y-auto p-10 space-y-8">
            <div className="grid grid-cols-2 gap-6">
               <FormGroup label="Asset Tag" placeholder="RT-LAP-101" value={formData.assetTag} onChange={e => handleChange('assetTag', e.target.value)} />
               <FormGroup label="Serial Number" placeholder="S/N: XXX-XXX" value={formData.serialNumber} onChange={e => handleChange('serialNumber', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
                  <select className="h-12 w-full px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black" value={formData.type} onChange={e => handleChange('type', e.target.value)}>
                     <option>Laptop</option>
                     <option>Desktop</option>
                     <option>Printer</option>
                     <option>Server</option>
                  </select>
               </div>
               <FormGroup label="Brand" placeholder="Dell" value={formData.brand} onChange={e => handleChange('brand', e.target.value)} />
               <FormGroup label="Model" placeholder="Latitude" value={formData.model} onChange={e => handleChange('model', e.target.value)} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Configuration</label>
               <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-3xl text-xs font-medium min-h-[100px]" placeholder="i7, 16GB, 512GB..." value={formData.configuration} onChange={e => handleChange('configuration', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-6">
               <FormGroup label="Purchase Date" type="date" value={formData.purchaseDate} onChange={e => handleChange('purchaseDate', e.target.value)} />
               <FormGroup label="Price (₹)" type="number" value={formData.purchasePrice} onChange={e => handleChange('purchasePrice', e.target.value)} />
               <FormGroup label="Location" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
            </div>
         </div>

         <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
            <button className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400" onClick={onClose}>Cancel</button>
            <button className="h-14 px-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl" onClick={handleSave}>Enroll Asset</button>
         </div>
      </div>
    </div>
  );
};

const FormGroup = ({ label, type = 'text', placeholder, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      className="h-12 w-full px-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black focus:ring-4 focus:ring-indigo-600/10 focus:bg-white transition-all" 
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default AssetManagementPage;
