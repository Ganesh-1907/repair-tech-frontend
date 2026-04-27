import React, { useState, useEffect, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Monitor, 
  Laptop, 
  Printer, 
  Network, 
  Eye, 
  History, 
  Wrench, 
  Calendar, 
  X,
  FileText,
  AlertCircle,
  ShieldCheck,
  Filter,
  Cpu,
  Smartphone,
  Server,
  Activity,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp,
  Settings2,
  CheckCircle2,
  Box,
  QrCode,
  Zap,
  MapPin,
  HardDrive
} from 'lucide-react';
import { cmcDeviceRegistryService } from '../../services/cmcServices';
import './DashboardPremiumStyles.css';

const CMCDeviceRegistryPage = () => {
  const [devices, setDevices] = useState(cmcDeviceRegistryService.getDevices());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const stats = useMemo(() => {
    return {
      total: devices.length,
      healthy: devices.filter(d => d.status === 'Healthy').length,
      warning: devices.filter(d => d.status === 'Warning').length,
      critical: devices.filter(d => d.status === 'Critical').length,
      covered: devices.length, // All are CMC registered
      visits: 42, // Mocked
      uptime: '99.9%'
    };
  }, [devices]);

  const openDeviceModal = (device = null) => {
    setSelectedDevice(device);
    setShowDeviceModal(true);
  };

  const getDeviceIcon = (type) => {
    const iconSize = 20;
    switch (type.toLowerCase()) {
      case 'laptop': return <Laptop size={iconSize} />;
      case 'desktop': return <Monitor size={iconSize} />;
      case 'printer': return <Printer size={iconSize} />;
      case 'network': return <Network size={iconSize} />;
      case 'server': return <Server size={iconSize} />;
      case 'mobile': return <Smartphone size={iconSize} />;
      default: return <Cpu size={iconSize} />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesSearch = d.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || d.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, filterStatus]);

  return (
    <Motion.div 
      className="premium-dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* CMC Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Device <span className="text-indigo-600">Registry</span></h2>
          <p className="text-slate-500 font-medium mt-1">Lifecycle intelligence for all hardware covered under CMC frameworks.</p>
        </div>
        <div className="flex gap-4">
          <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
             <QrCode size={14} className="text-indigo-600" /> Export Barcodes
          </button>
          <button className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20" onClick={() => openDeviceModal()}>
             <Plus size={18} strokeWidth={3} /> Enroll Asset
          </button>
        </div>
      </div>

      {/* Registry KPI Grid (7-Columns) */}
      <div className="dash-kpi-grid">
        <KPIItem title="Total Assets" value={stats.total} icon={<Box />} color="#6366f1" bg="#e0e7ff" trend="+4 New" />
        <KPIItem title="Service Tier" value="Standard" icon={<ShieldCheck />} color="#8b5cf6" bg="#ede9fe" trend="Verified" />
        <KPIItem title="Healthy" value={stats.healthy} icon={<CheckCircle2 />} color="#10b981" bg="#dcfce7" trend="Optimal" />
        <KPIItem title="Warnings" value={stats.warning} icon={<AlertCircle />} color="#f59e0b" bg="#fef3c7" trend="Review" negative={stats.warning > 0} />
        <KPIItem title="Critical" value={stats.critical} icon={<Activity />} color="#ef4444" bg="#fef2f2" trend="Action" negative={stats.critical > 0} />
        <KPIItem title="Fleet Uptime" value={stats.uptime} icon={<Zap />} color="#06b6d4" bg="#cffafe" trend="Stable" />
        <KPIItem title="Service Load" value={stats.visits} icon={<Wrench />} color="#3b82f6" bg="#dbeafe" trend="Monthly" />
      </div>

      <div className="dash-ops-grid">
        <Motion.div className="dash-card col-span-3" variants={itemVariants}>
          <div className="dash-card-header">
             <div className="flex gap-4 items-center flex-1">
                <div className="relative w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Search Serial, Model or Client..." 
                      className="h-12 w-full pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
                <div className="flex gap-2">
                   {['All', 'Healthy', 'Warning', 'Critical'].map(status => (
                      <button 
                         key={status}
                         onClick={() => setFilterStatus(status)}
                         className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filterStatus === status ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                      >
                         {status === 'All' ? 'Full Registry' : status}
                      </button>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
             <table className="cmc-table">
                <thead>
                   <tr>
                      <th className="pl-8">Device Identity</th>
                      <th>Hardware Profile</th>
                      <th>Contract & Client</th>
                      <th>Last Visit</th>
                      <th>Maintenance</th>
                      <th>Status</th>
                      <th className="pr-8 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody>
                   {filteredDevices.map(device => (
                      <tr key={device.id}>
                         <td className="pl-8">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                  {getDeviceIcon(device.deviceType)}
                               </div>
                               <div>
                                  <p className="text-xs font-black uppercase tracking-tight">{device.serial}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{device.deviceType}</p>
                               </div>
                            </div>
                         </td>
                         <td>
                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{device.model}</p>
                            <p className="text-[9px] text-slate-400 font-medium">Global ID: {device.id}</p>
                         </td>
                         <td>
                            <p className="text-xs font-black">{device.customerName}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{device.contractId} • {device.coverage}</p>
                         </td>
                         <td><span className="text-xs font-bold text-slate-500">{device.lastService}</span></td>
                         <td>
                            <div className="flex items-center gap-2">
                               <Calendar size={12} className="text-indigo-600" />
                               <span className="text-xs font-black">{device.nextService}</span>
                            </div>
                         </td>
                         <td><span className={`dash-tag dash-tag-${device.status === 'Healthy' ? 'success' : device.status === 'Warning' ? 'warning' : 'danger'}`}>{device.status}</span></td>
                         <td className="pr-8 text-right">
                            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all" onClick={() => openDeviceModal(device)}><ArrowRight size={14} /></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </Motion.div>
      </div>

      {showDeviceModal && <DeviceModal device={selectedDevice} onClose={() => setShowDeviceModal(false)} />}
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

const DeviceModal = ({ device, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
      <div className="bg-white rounded-[56px] w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col">
         <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-xl">
                  <Monitor size={36} />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">CMC Coverage Active</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{device?.model || 'Device Registry'}</h3>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">S/N: {device?.serial || '---'} • Contract: {device?.contractId || '---'}</p>
               </div>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
         </div>

         <div className="flex-1 overflow-hidden flex">
            <div className="w-72 border-r border-slate-100 p-8 space-y-2 bg-slate-50/30">
               <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Monitor size={18} />} label="Overview" />
               <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18} />} label="Service History" />
               <TabButton active={activeTab === 'spares'} onClick={() => setActiveTab('spares')} icon={<Settings2 size={18} />} label="Linked Spares" />
               <TabButton active={activeTab === 'agreement'} onClick={() => setActiveTab('agreement')} icon={<ShieldCheck size={18} />} label="CMC Agreement" />
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12">
               {activeTab === 'overview' && (
                  <div className="space-y-12">
                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Hardware Identity</h4>
                           <div className="grid grid-cols-2 gap-6">
                              <InfoBox label="Model Name" value={device?.model} />
                              <InfoBox label="Category" value={device?.deviceType} />
                              <InfoBox label="Serial Code" value={device?.serial} />
                              <InfoBox label="Installation" value="Feb 2026" />
                           </div>
                        </div>
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Contract Insights</h4>
                           <div className="grid grid-cols-2 gap-6">
                              <InfoBox label="Contract ID" value={device?.contractId} />
                              <InfoBox label="Tier" value={device?.coverage} />
                              <InfoBox label="Client" value={device?.customerName} />
                              <InfoBox label="Status" value={device?.status} />
                           </div>
                        </div>
                     </div>

                     <div className="p-10 bg-slate-900 rounded-[40px] text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Activity size={100} /></div>
                        <div className="relative z-10 flex items-center gap-8">
                           <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center"><Calendar size={32} className="text-indigo-400" /></div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Maintenance Visit</p>
                              <h4 className="text-2xl font-black">{device?.nextService || 'June 15, 2026'}</h4>
                           </div>
                        </div>
                        <button className="relative z-10 h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">Schedule Express</button>
                     </div>
                  </div>
               )}

               {activeTab !== 'overview' && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                     <Box size={64} className="mb-4 opacity-20" />
                     <p className="text-xs font-black uppercase tracking-widest">No detailed logs found for this asset</p>
                  </div>
               )}
            </div>
         </div>

         <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
            <button className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400" onClick={onClose}>Close Registry</button>
            <button className="h-14 px-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Update Device Record</button>
         </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    className={`w-full flex items-center gap-4 h-14 px-6 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
    {active && <ArrowRight size={14} className="ml-auto" />}
  </button>
);

const InfoBox = ({ label, value }) => (
  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-sm font-black text-slate-900 truncate">{value || '---'}</p>
  </div>
);

export default CMCDeviceRegistryPage;
