import React, { useState, useEffect, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Calendar, 
  Search, 
  Filter, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  MoreVertical, 
  Plus,
  MapPin,
  X,
  ChevronRight,
  Send,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Zap,
  MessageSquare,
  Mail,
  ShieldCheck,
  TrendingUp,
  Map,
  Truck,
  Activity,
  Target,
  MousePointer2,
  Settings
} from 'lucide-react';
import { cmcMaintenanceService } from '../../services/cmcServices';
import './DashboardPremiumStyles.css';

const CMCScheduledMaintenancePage = () => {
  const [schedules, setSchedules] = useState(cmcMaintenanceService.getSchedules());
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Overview');

  const stats = useMemo(() => ({
    pipeline: 24,
    completed: 18,
    notified: 20,
    alerts: 2,
    efficiency: '94%',
    sla: '98%',
    active: 6
  }), []);

  const openVisitModal = (visit = null) => {
    setSelectedVisit(visit);
    setShowVisitModal(true);
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
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Service <span className="text-indigo-600">Logistics</span></h2>
          <p className="text-slate-500 font-medium mt-1">Preventive maintenance coordination and technician dispatch intelligence.</p>
        </div>
        <div className="flex gap-4">
          <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
             <Calendar size={18} className="text-indigo-600" /> Optimization Calendar
          </button>
          <button 
            className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            onClick={() => openVisitModal()}
          >
            <Plus size={18} strokeWidth={3} /> Plan New Visit
          </button>
        </div>
      </div>

      {/* Service KPI Grid (7-Columns) */}
      <div className="dash-kpi-grid">
        <KPIItem title="Service Pipeline" value={stats.pipeline} icon={<Calendar />} color="#6366f1" bg="#e0e7ff" trend="Monthly" />
        <KPIItem title="Completed" value={stats.completed} icon={<CheckCircle2 />} color="#10b981" bg="#dcfce7" trend="Success" />
        <KPIItem title="Dispatched" value={stats.notified} icon={<Truck />} color="#8b5cf6" bg="#ede9fe" trend="Active" />
        <KPIItem title="In Transit" value={stats.active} icon={<Activity />} color="#06b6d4" bg="#cffafe" trend="Real-time" />
        <KPIItem title="SLA Success" value={stats.sla} icon={<ShieldCheck />} color="#f59e0b" bg="#fef3c7" trend="Optimal" />
        <KPIItem title="Efficiency" value={stats.efficiency} icon={<Target />} color="#ec4899" bg="#fdf2f8" trend="YoY" />
        <KPIItem title="Action Items" value={stats.alerts} icon={<AlertCircle />} color="#ef4444" bg="#fef2f2" trend="Overdue" negative={true} />
      </div>

      <div className="dash-ops-grid">
        <Motion.div className="dash-card col-span-3" variants={itemVariants}>
          <div className="dash-card-header">
             <div className="flex gap-4 items-center flex-1">
                <div className="relative w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Search Sites or Techs..." 
                      className="h-12 w-full pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all"
                   />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl ml-4">
                  {['Overview', 'In Transit', 'On Site', 'Resolved'].map((s) => (
                    <button 
                      key={s} 
                      className={`h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                      onClick={() => setActiveFilter(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </div>
             <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                <Filter size={18} />
             </button>
          </div>
          
          <div className="p-2">
            <div className="overflow-x-auto cmc-custom-scroll">
              <table className="cmc-table">
                <thead>
                  <tr>
                    <th className="pl-8">Visit ID</th>
                    <th>Client & Identity</th>
                    <th>Geographic Node</th>
                    <th>Sequence</th>
                    <th>Timeline</th>
                    <th>Assigned Crew</th>
                    <th>Protocol</th>
                    <th className="pr-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(v => (
                    <tr key={v.id}>
                      <td className="pl-8">
                        <span className="text-xs font-black uppercase tracking-tight text-indigo-600">{v.id}</span>
                      </td>
                      <td>
                         <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-tight">{v.customer}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{v.contractId}</span>
                         </div>
                      </td>
                      <td>
                         <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <MapPin size={14} className="text-indigo-600/60" />
                            {v.location}
                         </div>
                      </td>
                      <td><span className="px-3 py-1 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600">Cycle #{v.visitNo}</span></td>
                      <td>
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-slate-900">{v.scheduledDate}</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase">10AM - 2PM</span>
                        </div>
                      </td>
                      <td>
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-[10px] border border-indigo-100 uppercase">
                               {v.technician.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase tracking-tight text-slate-900">{v.technician}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">Field Expert</span>
                            </div>
                         </div>
                      </td>
                      <td>
                         <span className={`dash-tag dash-tag-${v.status === 'Completed' ? 'success' : 'info'}`}>
                            {v.status}
                         </span>
                      </td>
                      <td className="pr-8 text-right">
                         <button 
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:text-indigo-600 transition-all" 
                          onClick={() => openVisitModal(v)}
                         >
                            <ArrowRight size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Motion.div>
      </div>

      {showVisitModal && <VisitModal visit={selectedVisit} onClose={() => setShowVisitModal(false)} />}
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

const VisitModal = ({ visit, onClose }) => {
  const [notifMode, setNotifMode] = useState(['whatsapp', 'email']);

  const toggleNotif = (mode) => {
    setNotifMode(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
      <Motion.div 
        className="bg-white rounded-[56px] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-xl">
               <ClipboardList size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">Dispatch Protocol</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{visit ? 'Modify Service Window' : 'Plan New Maintenance'}</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Coordinate technician allocation and synchronize site access protocols.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
        </div>
        
        <div className="p-14 space-y-10 flex-1 overflow-y-auto cmc-custom-scroll bg-slate-50/30">
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Client Infrastructure Node</label>
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                   type="text" 
                   className="h-16 w-full pl-16 pr-6 bg-white border border-slate-200 rounded-[28px] text-sm font-black text-slate-900 focus:ring-8 focus:ring-indigo-600/5 transition-all shadow-sm" 
                   placeholder="Search active CMC contracts..." 
                   defaultValue={visit?.customer} 
                />
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-10">
             <FormGroup label="Service Window" type="date" value={visit?.scheduledDate} />
             <FormGroup label="Field Engineer" type="select" options={['Rajesh Sharma', 'Amit Verma', 'Suresh Kohli', 'Vikas Pandey']} value={visit?.technician} />
          </div>

          <div className="p-10 bg-slate-900 rounded-[40px] space-y-8 relative overflow-hidden shadow-2xl">
             <div className="flex justify-between items-center relative z-10">
                <div>
                   <h4 className="text-[11px] font-black uppercase text-white tracking-widest flex items-center gap-3">
                     <Zap size={16} className="text-indigo-400" /> Notification Intelligence
                   </h4>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Multi-channel sync engine</p>
                </div>
                <button className="h-10 px-5 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">Templates</button>
             </div>
             <div className="flex gap-4 relative z-10">
                <NotifChannel label="WhatsApp" icon={<MessageSquare />} active={notifMode.includes('whatsapp')} onClick={() => toggleNotif('whatsapp')} />
                <NotifChannel label="Email" icon={<Mail />} active={notifMode.includes('email')} onClick={() => toggleNotif('email')} />
                <NotifChannel label="Push" icon={<Bell />} active={notifMode.includes('push')} onClick={() => toggleNotif('push')} />
             </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">Technical Brief (Executive Notes)</label>
             <textarea 
               className="h-32 w-full p-8 bg-white border border-slate-200 rounded-[32px] text-sm font-medium focus:ring-8 focus:ring-indigo-600/5 transition-all resize-none shadow-sm" 
               placeholder="Describe hardware focus areas or specific site protocols..." 
             />
          </div>
        </div>

        <div className="p-12 bg-white flex justify-end gap-6 border-t border-slate-100">
          <button className="h-16 px-10 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-slate-400" onClick={onClose}>Discard Draft</button>
          <button className="h-16 px-14 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/20">Schedule & Dispatch</button>
        </div>
      </Motion.div>
    </div>
  );
};

const NotifChannel = ({ label, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-4 p-8 rounded-[32px] transition-all border-2 ${active ? 'bg-indigo-600/20 border-indigo-400 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}
  >
     {React.cloneElement(icon, { size: 24, strokeWidth: 3 })}
     <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
  </button>
);

const FormGroup = ({ label, type = 'text', options = [], value, placeholder }) => (
  <div className="space-y-4">
    <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest ml-1">{label}</label>
    {type === 'select' ? (
      <select className="h-16 w-full px-6 bg-white border border-slate-200 rounded-[24px] text-sm font-black text-slate-900 focus:ring-8 focus:ring-indigo-600/5 transition-all shadow-sm cursor-pointer" defaultValue={value}>
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    ) : (
      <input 
        type={type} 
        className="h-16 w-full px-6 bg-white border border-slate-200 rounded-[24px] text-sm font-black text-slate-900 focus:ring-8 focus:ring-indigo-600/5 transition-all shadow-sm" 
        placeholder={placeholder}
        defaultValue={value}
      />
    )}
  </div>
);

export default CMCScheduledMaintenancePage;
