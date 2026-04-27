import React, { useMemo, useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  Bar,
  Pie,
  Line,
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import {
  Briefcase,
  ChevronRight,
  IndianRupee,
  Search,
  Ticket,
  X,
  Plus,
  Settings,
  Users,
  Activity,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  TrendingUp,
  ShieldCheck,
  UserPlus,
  Monitor,
  Download,
  CalendarDays,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award
} from 'lucide-react';
import {
  AssignJobModal,
  AttendanceLogsCard,
  PendingJobsCard,
  PermissionsModal,
  TechnicianFilters,
  TechnicianMap,
  TechnicianPerformanceCard,
  TechnicianProfileCard,
  TechnicianTable,
  TopTechnicianCard,
} from '../../components/staff/TechnicianDashboardComponents';
import { getTechnicianDashboardData, permissionOptions } from '../../services/technicianDashboardService';
import './DashboardPremiumStyles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StaffTechnicianManagementPage = () => {
  const sourceData = useMemo(() => getTechnicianDashboardData(), []);
  const [technicians, setTechnicians] = useState(sourceData.technicians);
  const [pendingJobs, setPendingJobs] = useState(sourceData.pendingJobs);
  const [assignedJobs, setAssignedJobs] = useState(sourceData.assignedJobs);
  const [attendanceLogs, setAttendanceLogs] = useState(sourceData.attendanceLogs);
  const [permissionConfig, setPermissionConfig] = useState(sourceData.permissions);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [cityFilter, setCityFilter] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const selectedTechnician = technicians.find(t => t.id === selectedTechnicianId) || technicians[0];
  const topTechnician = technicians.reduce((prev, current) => (prev.performance > current.performance) ? prev : current, technicians[0]);

  const handleTechnicianAction = (action, technician) => {
    if (action === 'Close') {
      setIsProfileOpen(false);
      return;
    }
    setNotice(`${action} action applied to ${technician.name}.`);
  };

  const openProfile = (id) => {
    setSelectedTechnicianId(id);
    setIsProfileOpen(true);
  };

  const openAssign = (technicianId = selectedTechnicianId) => {
    if (technicianId) setSelectedTechnicianId(technicianId);
    setIsAssignOpen(true);
  };

  const assignJob = ({ technicianId, jobId, priority }) => {
    setIsAssignOpen(false);
    setNotice(`Assigned ${jobId} to technician.`);
  };

  const togglePermission = (role, permission) => {
    setNotice(`Permission updated for ${role}.`);
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
      {/* Top Header matching image */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dash Board</h1>
          <p className="text-slate-400 font-medium text-xs mt-1">Overview placeholder for admin-level operational metrics and priorities.</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search dash board..." className="h-12 w-96 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-medium focus:ring-2 focus:ring-indigo-100 transition-all" />
           </div>
           <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">A</div>
              <div className="pr-2">
                 <p className="text-[11px] font-black text-slate-900">Admin User</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Admin</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end mb-8">
         <button className="h-10 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={14} className="text-indigo-600" /> Export Data
         </button>
      </div>

      {/* KPI Grid matching reference image (7 columns) */}
      <div className="ref-kpi-grid">
         <KPIBox title="Total Revenue" value="₹4,50,000" trend="+12.5%" trendUp icon={<Wallet />} color="#6366f1" bg="#e0e7ff" />
         <KPIBox title="Target Achievement" value="78%" trend="+5%" trendUp icon={<Target />} color="#0ea5e9" bg="#e0f2fe" />
         <KPIBox title="Total Leads" value="124" trend="+18" trendUp icon={<Users />} color="#8b5cf6" bg="#ede9fe" />
         <KPIBox title="Pending Leads" value="32" trend="-2" trendUp={false} icon={<Clock />} color="#f59e0b" bg="#fef3c7" />
         <KPIBox title="Missed Leads" value="8" trend="+1" trendUp icon icon={<AlertTriangle />} color="#ef4444" bg="#fef2f2" />
         <KPIBox title="Avg Response Time" value="14m" trend="-2m" trendUp={false} icon={<Activity />} color="#10b981" bg="#dcfce7" />
         <KPIBox title="Active Jobs" value="45" trend="+4" trendUp icon={<Briefcase />} color="#6366f1" bg="#e0e7ff" />
      </div>

      {/* Charts Grid matching reference layout (2fr 1.1fr 1.1fr) */}
      <div className="ref-charts-grid">
         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="ref-chart-header">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><TrendingUp size={16} /></div>
                     <h3 className="ref-chart-title">Revenue vs Target</h3>
                  </div>
                  <p className="ref-chart-subtitle">Monthly revenue performance against planned target.</p>
               </div>
               <span className="ref-chart-period">Jan - Jun</span>
            </div>
            <div className="h-64">
               <Bar 
                 data={{
                   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                   datasets: [
                     { label: 'Revenue', data: [32000, 45000, 38000, 52000, 48000, 60000], backgroundColor: '#6366f1', borderRadius: 12, barThickness: 24 },
                     { label: 'Target', data: [40000, 40000, 40000, 50000, 50000, 55000], backgroundColor: '#e2e8f0', borderRadius: 12, barThickness: 24 }
                   ]
                 }}
                 options={commonBarOptions}
               />
            </div>
            <div className="flex justify-center gap-6 mt-6">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600"><div className="w-3 h-3 rounded-full bg-indigo-600"></div> Revenue</div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Target</div>
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="ref-chart-title">Lead Distribution</h3>
               <p className="ref-chart-subtitle">Current lead status mix.</p>
            </div>
            <div className="h-64 flex items-center justify-center">
               <Pie 
                 data={{
                   labels: ['Pending', 'Completed', 'Assigned', 'Missed'],
                   datasets: [{
                     data: [45, 30, 20, 5],
                     backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
                     borderWidth: 0
                   }]
                 }}
                 options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
               />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6">
               <LegendItem label="Pending" color="#6366f1" />
               <LegendItem label="Completed" color="#10b981" />
               <LegendItem label="Assigned" color="#f59e0b" />
               <LegendItem label="Missed" color="#ef4444" />
            </div>
         </Motion.div>

         <Motion.div className="ref-chart-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="ref-chart-title">Response Time Trend</h3>
               <p className="ref-chart-subtitle">Average first response time in minutes.</p>
            </div>
            <div className="h-64">
               <Line 
                 data={{
                   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                   datasets: [{
                     data: [18, 14, 11, 16, 13, 10, 12],
                     borderColor: '#6366f1',
                     borderWidth: 3,
                     tension: 0.4,
                     pointRadius: 4,
                     pointBackgroundColor: '#6366f1',
                     fill: true,
                     backgroundColor: 'rgba(99, 102, 241, 0.05)'
                   }]
                 }}
                 options={commonLineOptions}
               />
            </div>
         </Motion.div>
      </div>

      {/* Operational Grid matching reference bottom section */}
      <div className="ref-ops-grid">
         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><CalendarDays size={20} /></div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Expiry Reminders</h3>
                     <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Contracts and rentals that need attention soon.</p>
                  </div>
               </div>
               <span className="ref-badge ref-badge-pending">3 Pending</span>
            </div>
            <div className="space-y-4">
               <OpListItem label="Vikram Singh" detail="Duty end on 2026-05-15" badge="20 DAYS LEFT" color="indigo" />
               <OpListItem label="Anjali Das" detail="Cycle reset 2026-04-30" badge="17 DAYS LEFT" color="emerald" />
            </div>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><Briefcase size={20} /></div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Inventory Alerts</h3>
                     <p className="text-[9px] text-slate-400 font-medium leading-relaxed">Parts below configured minimum stock.</p>
                  </div>
               </div>
               <span className="ref-badge ref-badge-critical">3 Critical</span>
            </div>
            <div className="space-y-4">
               <OpListItem label="Water Filter Cartridge" detail="Stock: 2 | Min: 5" badge="LOW STOCK" color="rose" />
               <OpListItem label="Brake Pad Set" detail="Stock: 0 | Min: 10" badge="OUT OF STOCK" color="rose" />
            </div>
         </Motion.div>

         <Motion.div className="ref-ops-card" variants={itemVariants}>
            <div className="mb-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Staff Performance</h3>
               <p className="text-[9px] text-slate-400 font-medium">Revenue contribution by staff member.</p>
            </div>
            <div className="space-y-6">
               <StaffPerfItem name="Ravi" value="₹70,000" color="indigo" progress={90} />
               <StaffPerfItem name="Dinesh" value="₹55,000" color="purple" progress={75} />
               <StaffPerfItem name="Anjali" value="₹48,000" color="blue" progress={65} />
            </div>
         </Motion.div>
      </div>

      {/* Directory Section integrated below for full workflow */}
      <div className="grid grid-cols-12 gap-8 mt-8">
         <div className="col-span-12">
            <Motion.div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm" variants={itemVariants}>
               <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <div>
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Workforce Directory</h3>
                     <p className="text-[10px] text-slate-400 font-bold mt-1">Personnel management and real-time status.</p>
                  </div>
                  <div className="flex gap-4">
                     <TechnicianFilters
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        skill={skillFilter}
                        onSkillChange={setSkillFilter}
                        status={statusFilter}
                        onStatusChange={setStatusFilter}
                        city={cityFilter}
                        onCityChange={setCityFilter}
                     />
                  </div>
               </div>
               <TechnicianTable technicians={technicians} onSelect={openProfile} onAssign={openAssign} />
            </Motion.div>
         </div>
      </div>

      {/* Modals/Drawers */}
      {isProfileOpen && (
        <TechnicianProfileCard
          technician={selectedTechnician}
          onAction={handleTechnicianAction}
          onAssign={openAssign}
          onPermissions={() => setIsPermissionsOpen(true)}
        />
      )}

      {isAssignOpen && (
        <AssignJobModal
          technicians={technicians}
          jobs={pendingJobs}
          selectedTechnicianId={selectedTechnicianId}
          onClose={() => setIsAssignOpen(false)}
          onAssign={assignJob}
        />
      )}

      {isPermissionsOpen && (
        <PermissionsModal
          config={permissionConfig}
          options={permissionOptions}
          onToggle={togglePermission}
          onClose={() => setIsPermissionsOpen(false)}
        />
      )}
    </Motion.div>
  );
};

/* --- Componentized UI Elements for Image Match --- */

const KPIBox = ({ title, value, trend, trendUp, icon, color, bg }) => (
   <Motion.div className="ref-kpi-card" whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.05)' }}>
      <div className="ref-kpi-icon-box" style={{ backgroundColor: bg, color }}>
         {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className={`ref-kpi-trend-pill ${trendUp ? 'ref-kpi-trend-up' : 'ref-kpi-trend-down'}`}>
         {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
         {trend}
      </div>
      <div className="ref-kpi-circle-bg" style={{ color }}></div>
      <div className="relative z-10">
         <p className="ref-kpi-label">{title}</p>
         <h3 className="ref-kpi-value">{value}</h3>
      </div>
   </Motion.div>
);

const LegendItem = ({ label, color }) => (
   <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-[10px] font-black text-slate-500 uppercase">{label}</span>
   </div>
);

const OpListItem = ({ label, detail, badge, color }) => (
   <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[20px] border border-transparent hover:border-slate-100 transition-all">
      <div className="flex items-center gap-4">
         <div className={`w-2 h-10 rounded-full bg-${color}-500`}></div>
         <div>
            <p className="text-xs font-black text-slate-900">{label}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{detail}</p>
         </div>
      </div>
      <span className={`text-[8px] font-black px-2 py-1 bg-${color}-50 text-${color}-600 rounded-lg`}>{badge}</span>
   </div>
);

const StaffPerfItem = ({ name, value, color, progress }) => (
   <div className="space-y-3">
      <div className="flex justify-between items-end">
         <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs`}>{name[0]}</div>
            <p className="text-sm font-black text-slate-900">{name}</p>
         </div>
         <p className="text-sm font-black text-slate-900">{value}</p>
      </div>
      <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
         <div className={`h-full bg-indigo-600 rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>
   </div>
);

const commonBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10, family: 'Inter' } } },
    y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10, family: 'Inter' } } }
  }
};

const commonLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 800, size: 10 } } },
    y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { size: 10 } } }
  }
};

export default StaffTechnicianManagementPage;
