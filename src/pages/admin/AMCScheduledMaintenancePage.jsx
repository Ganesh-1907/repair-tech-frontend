import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  ChevronRight, 
  Filter,
  ArrowRight,
  Bell,
  CalendarDays,
  Wrench,
  X,
  Plus
} from 'lucide-react';
import { amcScheduledMaintenanceService } from '../../services/amcServices';
import './AMCPremiumStyles.css';

const AMCScheduledMaintenancePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    setSchedules(amcScheduledMaintenanceService.getSchedules());
    setLoading(false);
  }, []);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-success';
      case 'scheduled': return 'status-primary';
      case 'technician assigned': return 'status-info';
      case 'missed': return 'status-danger';
      default: return 'status-warning';
    }
  };

  return (
    <div className="admin-module-page amc-scheduled-maintenance-page p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-main tracking-tight">Scheduled Maintenance</h2>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Automated Service Planning & Visit Tracking</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
             <Bell size={14} className="text-primary" /> View Notifications
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-light transition-all shadow-lg shadow-primary/20">
             <Plus size={16} /> New Ad-hoc Visit
          </button>
        </div>
      </div>

      {/* Operational Summary */}
      <div className="grid grid-cols-4 gap-6 mb-8">
         {[
           { label: 'Visits This Month', val: 32, icon: CalendarDays, color: 'text-primary' },
           { label: 'Pending Assignment', val: 5, icon: User, color: 'text-warning' },
           { label: 'Completed Today', val: 4, icon: CheckCircle2, color: 'text-success' },
           { label: 'Missed Visits', val: 1, icon: AlertCircle, color: 'text-danger' }
         ].map(stat => (
           <div key={stat.label} className="card p-6 flex items-center gap-4 bg-white shadow-md border-none group hover:scale-[1.02] transition-transform">
              <div className={`p-4 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors ${stat.color}`}><stat.icon size={20} /></div>
              <div>
                 <p className="text-[10px] font-black uppercase text-muted tracking-widest">{stat.label}</p>
                 <p className="text-xl font-black text-main">{stat.val}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="card bg-white shadow-xl border-none overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input type="text" placeholder="Search by AMC ID..." className="table-input pl-10" />
            </div>
            <div className="flex gap-2">
               {['All Status', 'Assigned', 'In Progress'].map(f => (
                 <button key={f} className="px-4 py-2 bg-slate-50 text-[10px] font-black uppercase rounded-xl border border-slate-100 hover:bg-white transition-all">{f}</button>
               ))}
            </div>
          </div>
          <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"><Filter size={18} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Schedule ID</th>
                <th>AMC ID / Customer</th>
                <th>Location</th>
                <th>Visit No.</th>
                <th>Scheduled Date</th>
                <th>Technician</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(sch => (
                <tr key={sch.id} className="group">
                  <td className="font-black text-xs text-primary">{sch.id}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{sch.customer}</span>
                      <span className="text-[10px] text-muted font-bold uppercase">{sch.amcId}</span>
                    </div>
                  </td>
                  <td className="text-xs font-bold opacity-70">{sch.location}</td>
                  <td><span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black">V#{sch.visitNo}</span></td>
                  <td>
                    <div className="flex items-center gap-2 text-xs font-bold text-main">
                       <Clock size={12} className="text-muted" /> {sch.date}
                    </div>
                  </td>
                  <td>
                    {sch.tech ? (
                      <div className="flex items-center gap-2">
                         <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">
                            {sch.tech.split(' ')[0][0]}
                         </div>
                         <span className="text-xs font-bold">{sch.tech}</span>
                      </div>
                    ) : (
                      <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Assign Tech</button>
                    )}
                  </td>
                  <td><span className={`status-pill ${getStatusStyle(sch.status)}`}>{sch.status}</span></td>
                  <td className="text-right">
                    <button className="p-2 hover:bg-slate-50 rounded-lg transition-all"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technician Assignment Modal (Placeholder Interaction) */}
      {showScheduleModal && <div className="fixed inset-0 bg-black/20 z-[110]" onClick={() => setShowScheduleModal(false)}></div>}
    </div>
  );
};

export default AMCScheduledMaintenancePage;
