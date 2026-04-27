import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { 
  ClipboardList, 
  History, 
  Link2, 
  ScanSearch, 
  Settings2, 
  X,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  MapPin,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Database,
  Search,
  Monitor,
  HardDrive,
  Settings,
  ChevronRight,
  User,
  Truck,
  Box
} from 'lucide-react';
import { adminAssetInventory } from '../../data/adminAssetsMock';
import './DashboardPremiumStyles.css';

const AssetDetailPage = () => {
  const { assetId } = useParams();
  const [notice, setNotice] = useState('');
  
  const asset = useMemo(
    () => adminAssetInventory.find((entry) => entry.id === assetId),
    [assetId]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!asset) {
    return (
      <div className="premium-dashboard">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
             <AlertCircle size={40} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Asset Node Not Found</h3>
          <p className="text-slate-500 max-w-sm mt-2">The requested asset identifier does not exist in the decentralized inventory registry.</p>
          <Link className="mt-8 px-8 h-14 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 shadow-xl" to="/admin/inventory/asset-management">
             <ArrowRight size={18} /> Return to Registry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Motion.div 
      className="premium-dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Asset <span className="text-indigo-600">Intelligence</span></h2>
          <p className="text-slate-500 font-medium mt-1">Deep telemetry and lifecycle tracking for individual hardware node <span className="font-black text-indigo-600">{asset.id}</span></p>
        </div>
        <div className="flex gap-4">
          <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
             <Link2 size={18} className="text-indigo-600" /> Transfer Node
          </button>
          <button className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
             <History size={18} strokeWidth={3} /> Record Service
          </button>
        </div>
      </div>

      {/* Asset KPI Grid (7-Columns) */}
      <div className="dash-kpi-grid">
        <KPIItem title="Asset Status" value={asset.status} icon={<ShieldCheck />} color="#6366f1" bg="#e0e7ff" trend="Current" />
        <KPIItem title="Deployment" value="Active" icon={<Activity />} color="#10b981" bg="#dcfce7" trend="Site" />
        <KPIItem title="Health Score" value="94%" icon={<Zap />} color="#f59e0b" bg="#fef3c7" trend="Optimal" />
        <KPIItem title="Usage Velocity" value="High" icon={<TrendingUp />} color="#06b6d4" bg="#cffafe" trend="24h" />
        <KPIItem title="Total Transfers" value={asset.movementHistory?.length || 0} icon={<Truck />} color="#8b5cf6" bg="#ede9fe" trend="History" />
        <KPIItem title="Service Depth" value="03" icon={<ClipboardList />} color="#ec4899" bg="#fdf2f8" trend="Notes" />
        <KPIItem title="Node Value" value="₹45k" icon={<Database />} color="#6366f1" bg="#e0e7ff" trend="ROI" />
      </div>

      <div className="dash-ops-grid grid-cols-3">
        {/* Hardware DNA */}
        <Motion.div className="dash-card col-span-1" variants={itemVariants}>
          <div className="dash-card-header">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Hardware DNA</h3>
             <Cpu size={18} className="text-indigo-600" />
          </div>
          <div className="p-8 space-y-6">
             <DNARow label="Node ID" value={asset.id} icon={<Hash />} />
             <DNARow label="Serial key" value={asset.serialNumber} icon={<Search />} />
             <DNARow label="Hardware Class" value={asset.type} icon={<Monitor />} />
             <DNARow label="Node Model" value={asset.model} icon={<HardDrive />} />
             <div className="p-6 bg-slate-50 rounded-3xl mt-4">
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-2">Specifications</p>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">{asset.configurations}</p>
             </div>
             <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Add-on Registry</p>
                   <p className="text-xs font-bold mt-1">{asset.addOnParts}</p>
                </div>
                <Box className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24" />
             </div>
          </div>
        </Motion.div>

        {/* Assignment Movement History */}
        <Motion.div className="dash-card col-span-2" variants={itemVariants}>
          <div className="dash-card-header">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Assignment Movement History</h3>
             <MapPin size={18} className="text-indigo-600" />
          </div>
          <div className="p-8">
             <div className="space-y-6">
                {(asset.movementHistory || []).map((m, i) => (
                   <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm font-black text-xs group-hover:scale-110 transition-transform">
                         {m.date.split('-')[2]}
                      </div>
                      <div className="flex-1 grid grid-cols-3 items-center">
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Origin</p>
                            <p className="text-xs font-black text-slate-900 mt-1">{m.from}</p>
                         </div>
                         <div className="flex justify-center text-slate-300">
                            <ArrowRight size={20} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Destination</p>
                            <p className="text-xs font-black text-slate-900 mt-1">{m.to}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            {m.type}
                         </span>
                         <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{m.date}</p>
                      </div>
                   </div>
                ))}
             </div>
             
             <div className="mt-10 p-8 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Lifecycle Intelligence Logs</h4>
                <div className="space-y-6">
                   {(asset.lifecycleLogs || []).map((log, i) => (
                      <div key={i} className="flex gap-4">
                         <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                         <div className="flex-1">
                            <div className="flex justify-between items-start">
                               <p className="text-xs font-black text-slate-900">{log.event}</p>
                               <span className="text-[9px] font-bold text-slate-400 uppercase">{log.date}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Authorized by: <span className="text-indigo-600">{log.user}</span></p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </Motion.div>
      </div>

      {notice && (
        <Motion.div 
           className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200]"
           initial={{ y: 100 }}
           animate={{ y: 0 }}
        >
           <span className="text-xs font-black uppercase tracking-widest">{notice}</span>
           <button onClick={() => setNotice('')}><X size={16} /></button>
        </Motion.div>
      )}
    </Motion.div>
  );
};

const DNARow = ({ label, value, icon }) => (
  <div className="flex items-center gap-4">
     <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
        {React.cloneElement(icon, { size: 16 })}
     </div>
     <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        <p className="text-xs font-black text-slate-900 mt-0.5">{value}</p>
     </div>
  </div>
);

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
      <h3 className="dash-kpi-value text-xl">{value}</h3>
    </div>
    <div className="dash-kpi-sparkline h-6">
       <svg viewBox="0 0 100 40" className="w-full h-full">
          <path d="M0,35 Q15,10 30,25 T60,15 T100,5" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
       </svg>
    </div>
  </div>
);

export default AssetDetailPage;
