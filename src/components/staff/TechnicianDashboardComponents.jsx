import React from 'react';
import {
  Briefcase,
  ChevronRight,
  LocateFixed,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Shield,
  Star,
  UserCheck,
  UserX,
  Wrench,
  X,
  Settings,
  MoreVertical,
  Activity,
  Award,
  Clock,
  Monitor
} from 'lucide-react';

/** Legacy export to prevent HMR errors - remove after full reload */
export const TechnicianSummaryCards = () => null;

const getTechStatusClass = (status) => {
  switch (status) {
    case 'Available':
    case 'Active':
    case 'Present':
      return 'bg-emerald-50 text-emerald-600';
    case 'On Job':
    case 'Assigned':
    case 'In Progress':
      return 'bg-indigo-50 text-indigo-600';
    case 'On Leave':
      return 'bg-amber-50 text-amber-600';
    case 'Inactive':
    case 'Absent':
      return 'bg-rose-50 text-rose-600';
    default:
      return 'bg-slate-50 text-slate-500';
  }
};

export const TechnicianAvatar = ({ name, size = 'md', tone = 'indigo' }) => (
  <div className={`flex items-center justify-center font-black uppercase tracking-widest rounded-2xl shadow-sm
    ${size === 'sm' ? 'w-10 h-10 text-[10px]' : size === 'lg' ? 'w-24 h-24 text-xl' : 'w-14 h-14 text-sm'}
    ${tone === 'indigo' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}
  `}>
    {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
  </div>
);

export const TechnicianFilters = ({ activeTab, onTabChange, skill, onSkillChange, status, onStatusChange, city, onCityChange }) => (
  <div className="flex flex-wrap items-center justify-between gap-6">
    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
      {['All', 'Available', 'On Job', 'Inactive'].map((tab) => (
        <button 
          key={tab} 
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
            ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
          onClick={() => onTabChange(tab)} 
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-4 flex-1 justify-end">
      <div className="relative group">
        <select 
          className="h-12 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:border-indigo-600 transition-all"
          value={skill} 
          onChange={(event) => onSkillChange(event.target.value)}
        >
          <option>All Skills</option>
          <option>Laptop</option>
          <option>Printer</option>
          <option>Networking</option>
          <option>Chip-Level</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Settings size={14} /></div>
      </div>
      <input 
        className="h-12 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest placeholder:text-slate-400 focus:border-indigo-600 transition-all min-w-[200px]" 
        value={city} 
        onChange={(event) => onCityChange(event.target.value)} 
        placeholder="Search city or branch..." 
      />
    </div>
  </div>
);

export const TechnicianMap = ({ technicians, onSelect }) => (
  <section className="relative h-[480px] bg-slate-50 rounded-[32px] overflow-hidden border border-slate-200">
    <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    
    <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center pointer-events-none">
       <div className="px-4 py-2 bg-white/80 backdrop-blur shadow-sm rounded-xl border border-slate-100 flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Live Workforce Tracking</span>
       </div>
    </div>

    <div className="relative w-full h-full">
      {technicians.map((tech, index) => (
        <div
          key={tech.id}
          className="absolute transition-all duration-700 pointer-events-auto"
          style={{ left: tech.mapPosition.left, top: tech.mapPosition.top }}
        >
          <button
            type="button"
            className="relative group"
            onClick={() => onSelect(tech.id)}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-[10px] uppercase shadow-lg transition-all group-hover:scale-110 group-hover:-translate-y-1
              ${tech.jobStatus === 'On Job' ? 'bg-indigo-600' : 'bg-emerald-500'}
            `}>
              {tech.name[0]}
            </div>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-white shadow-xl rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{tech.name}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">{tech.jobStatus}</p>
            </div>
          </button>
        </div>
      ))}
    </div>
  </section>
);

export const TopTechnicianCard = ({ technician, onSelect }) => (
  <section className="dash-card bg-indigo-600 text-white relative overflow-hidden group">
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Staff Spotlight</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight leading-tight">Technician of <br/> The Month</h3>
        </div>
        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md p-1">
          <div className="w-full h-full rounded-2xl bg-white text-indigo-600 flex items-center justify-center font-black text-2xl uppercase">
            {technician.name[0]}
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h4 className="text-xl font-bold mb-1">{technician.name}</h4>
        <div className="flex items-center gap-2 text-indigo-100 font-medium text-xs">
          <MapPin size={12} /> {technician.branch} • Active for {technician.assignedJobs} jobs
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/10">
          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mb-1">Rating</p>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-lg font-black">{technician.rating}</span>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/10">
          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mb-1">Efficiency</p>
          <span className="text-lg font-black">{technician.performance}%</span>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/10">
          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mb-1">Revenue</p>
          <span className="text-lg font-black">₹{(technician.earnings/1000).toFixed(0)}k</span>
        </div>
      </div>

      <button 
        className="w-full h-14 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg"
        onClick={() => onSelect(technician.id)}
      >
        View Full Performance Profile
      </button>
    </div>
  </section>
);

export const PendingJobsCard = ({ jobs }) => (
  <section className="dash-card">
    <div className="dash-card-header mb-8">
      <div className="dash-card-title">
        <div className="icon-box"><Clock size={20} className="text-rose-500" /></div>
        <div>
          <h3>Pending Assignments</h3>
          <p>Unassigned jobs requiring allocation.</p>
        </div>
      </div>
      <span className="badge-premium badge-danger">{jobs.length * 10 + 2} Jobs</span>
    </div>
    
    <div className="space-y-4">
      {jobs.slice(0, 3).map(job => (
        <div key={job.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
           <div>
             <p className="text-xs font-black text-slate-900">{job.title}</p>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {job.id} • {job.customer}</p>
           </div>
           <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shadow-sm">
             <Plus size={16} />
           </button>
        </div>
      ))}
    </div>

    <button className="w-full mt-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
       Open Assignment Dashboard
    </button>
  </section>
);

export const TechnicianPerformanceCard = ({ technicians }) => (
  <section className="dash-card">
    <div className="dash-card-header mb-8">
      <div className="dash-card-title">
        <div className="icon-box"><Activity size={20} className="text-emerald-500" /></div>
        <div>
          <h3>Service Velocity</h3>
          <p>Real-time repair completion metrics.</p>
        </div>
      </div>
    </div>
    
    <div className="space-y-6">
      {technicians.slice(0, 3).map(tech => (
        <div key={tech.id}>
           <div className="flex justify-between items-end mb-2">
             <div>
               <p className="text-xs font-black text-slate-900">{tech.name}</p>
               <p className="text-[9px] font-bold text-slate-400 uppercase">{tech.jobStatus}</p>
             </div>
             <span className="text-xs font-black text-slate-900">{tech.performance}%</span>
           </div>
           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${tech.performance}%` }}></div>
           </div>
        </div>
      ))}
    </div>
  </section>
);

export const AttendanceLogsCard = ({ logs }) => (
  <section className="dash-card">
    <div className="dash-card-header mb-8">
       <div className="dash-card-title">
          <div className="icon-box"><Monitor size={20} className="text-indigo-600" /></div>
          <div>
            <h3>Attendance Pulse</h3>
            <p>Recent check-in and check-out logs.</p>
          </div>
       </div>
    </div>
    
    <div className="space-y-4">
      {logs.slice(0, 4).map((log) => (
        <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-[10px] text-indigo-600 shadow-sm border border-slate-100">
              {log.technician.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">{log.technician}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{log.time} • {log.location}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${getTechStatusClass(log.status)}`}>
            {log.status}
          </span>
        </div>
      ))}
    </div>

    <div className="flex items-center justify-between mt-8 pt-6 border-top border-slate-100">
       <button className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">Previous</button>
       <div className="flex gap-2">
         <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black">1</span>
         <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-black">2</span>
       </div>
       <button className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">Next</button>
    </div>
  </section>
);

export const TechnicianTable = ({ technicians, onSelect, onAssign }) => (
  <div className="overflow-x-auto">
    <table className="dash-table">
      <thead>
        <tr>
          <th>Profile</th>
          <th>Workforce ID</th>
          <th>Skill Matrix</th>
          <th>Current Status</th>
          <th>Load Factor</th>
          <th>Performance</th>
          <th>Command</th>
        </tr>
      </thead>
      <tbody>
        {technicians.map((tech) => (
          <tr key={tech.id} className="group hover:bg-slate-50/50 transition-all">
            <td>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-[10px] uppercase">
                  {tech.name[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{tech.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tech.branch}</p>
                </div>
              </div>
            </td>
            <td><span className="text-xs font-black text-slate-500">#{tech.id}</span></td>
            <td>
               <div className="flex flex-wrap gap-1">
                 {tech.skills.slice(0, 2).map(skill => (
                   <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">{skill}</span>
                 ))}
                 {tech.skills.length > 2 && <span className="text-[9px] font-black text-slate-400">+{tech.skills.length - 2}</span>}
               </div>
            </td>
            <td>
               <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${getTechStatusClass(tech.jobStatus)}`}>
                 {tech.jobStatus}
               </span>
            </td>
            <td>
               <div className="flex items-center gap-2">
                 <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500" style={{ width: `${(tech.assignedJobs / 10) * 100}%` }}></div>
                 </div>
                 <span className="text-[10px] font-black text-slate-900">{tech.assignedJobs}</span>
               </div>
            </td>
            <td>
              <div className="flex items-center gap-1 text-amber-500 font-black">
                <Star size={12} className="fill-amber-500" />
                <span className="text-xs">{tech.rating}</span>
              </div>
            </td>
            <td>
              <div className="flex items-center gap-2">
                <button 
                  className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                  onClick={() => onAssign(tech.id)}
                >
                  Assign
                </button>
                <button 
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
                  onClick={() => onSelect(tech.id)}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const TechnicianProfileCard = ({ technician, onAction, onAssign, onPermissions }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-end p-8 bg-slate-900/40 backdrop-blur-sm">
    <div 
      className="w-[480px] h-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-500 animate-slide-in-right"
    >
      <div className="relative h-64 bg-indigo-600 p-10 text-white overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition-all" onClick={() => onAction('Close', technician)}>
            <X size={20} />
          </button>
        </div>
        <div className="relative z-10 flex items-center gap-6 mt-6">
          <div className="w-24 h-24 rounded-[32px] bg-white text-indigo-600 flex items-center justify-center font-black text-3xl uppercase shadow-2xl">
            {technician.name[0]}
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-[9px] font-black uppercase tracking-widest text-white mb-2 inline-block">#{technician.id}</span>
            <h3 className="text-3xl font-black tracking-tight">{technician.name}</h3>
            <p className="text-indigo-100 font-medium text-sm mt-1">{technician.role} • {technician.branch}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10">
        <div className="grid grid-cols-2 gap-4">
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Live Status</p>
             <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getTechStatusClass(technician.jobStatus)}`}>
               {technician.jobStatus}
             </span>
           </div>
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Load</p>
             <p className="text-2xl font-black text-slate-900">{technician.assignedJobs} Jobs</p>
           </div>
        </div>

        <div>
           <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
             <Activity size={16} className="text-indigo-600" /> Command Center
           </h4>
           <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group" onClick={() => onAction('Call', technician)}>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-indigo-600"><Phone size={18} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Voice Call</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group" onClick={() => onAction('Message', technician)}>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-indigo-600"><MessageSquare size={18} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Message</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group" onClick={() => onAction('Track', technician)}>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-indigo-600"><LocateFixed size={18} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Live Track</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group" onClick={() => onPermissions()}>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-indigo-600"><Shield size={18} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Access Controls</span>
              </button>
           </div>
        </div>

        <div>
           <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Attendance & Lifecycle</h4>
           <div className="flex flex-wrap gap-2">
             {['Present', 'Absent', 'On Leave', 'Suspend', 'Terminate'].map((action) => (
               <button 
                key={action} 
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 transition-all"
                onClick={() => onAction(action, technician)}
               >
                {action}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
        <button className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20" onClick={() => onAssign(technician.id)}>
          Assign New Job
        </button>
        <button className="flex-1 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={() => onAction('View Profile', technician)}>
          Deep Analytics
        </button>
      </div>
    </div>
  </div>
);

export const AssignJobModal = ({ technicians, jobs, selectedTechnicianId, onClose, onAssign }) => {
  const [technicianId, setTechnicianId] = React.useState(selectedTechnicianId || technicians[0]?.id || '');
  const [jobId, setJobId] = React.useState(jobs[0]?.id || '');
  const [priority, setPriority] = React.useState('Medium');
  const [notes, setNotes] = React.useState('');

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-[600px] bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Assign Service Job</h2>
            <p className="text-slate-400 font-medium text-sm mt-1">Allocate work to available workforce.</p>
          </div>
          <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-10 space-y-8">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Technician</label>
                <select className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-xs font-bold" value={technicianId} onChange={(event) => setTechnicianId(event.target.value)}>
                  {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority Level</label>
                <select className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-xs font-bold" value={priority} onChange={(event) => setPriority(event.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Ticket</label>
             <select className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-xs font-bold" value={jobId} onChange={(event) => setJobId(event.target.value)}>
               {jobs.map((job) => <option key={job.id} value={job.id}>{job.id} - {job.title}</option>)}
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational Notes</label>
             <textarea className="w-full h-32 p-6 bg-slate-50 border-none rounded-2xl text-xs font-bold resize-none" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add specific instructions for the technician..."></textarea>
           </div>
        </div>
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
           <button className="flex-1 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={onClose}>Cancel</button>
           <button className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg" onClick={() => onAssign({ technicianId, jobId, priority, notes })} disabled={!jobId || !technicianId}>Confirm Assignment</button>
        </div>
      </div>
    </div>
  );
};

export const PermissionsModal = ({ config, options, onToggle, onClose }) => (
  <div className="fixed inset-0 z-[400] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
    <div className="w-full max-w-[800px] max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
       <div className="p-10 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Access Control Matrix</h2>
            <p className="text-slate-400 font-medium text-sm mt-1">Configure role-based technician permissions.</p>
          </div>
          <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all" onClick={onClose}><X size={20} /></button>
       </div>
       <div className="flex-1 overflow-y-auto p-10">
          <div className="grid grid-cols-2 gap-8">
            {Object.entries(config).map(([role, permissions]) => (
              <div key={role} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="text-lg font-black mb-6 text-indigo-600">{role}</h3>
                <div className="space-y-4">
                  {options.map((permission) => (
                    <label key={`${role}-${permission}`} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={permissions.includes(permission)} onChange={() => onToggle(role, permission)} />
                        <div className={`w-10 h-6 rounded-full transition-all ${permissions.includes(permission) ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${permissions.includes(permission) ? 'left-5' : 'left-1'}`}></div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
       </div>
       <div className="p-10 bg-slate-50 border-t border-slate-100">
          <button className="w-full h-14 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg" onClick={onClose}>Save Permissions</button>
       </div>
    </div>
  </div>
);
