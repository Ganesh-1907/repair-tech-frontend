import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Monitor, 
  Laptop, 
  Printer, 
  Server, 
  Network, 
  MoreVertical, 
  History, 
  Wrench, 
  CalendarDays,
  X,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { amcDeviceRegistryService } from '../../services/amcServices';
import './AMCPremiumStyles.css';

const AMCDeviceRegistryPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    setDevices(amcDeviceRegistryService.getDevices());
    setLoading(false);
  }, []);

  const getDeviceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'laptop': return <Laptop size={18} />;
      case 'desktop': return <Monitor size={18} />;
      case 'printer': return <Printer size={18} />;
      case 'server': return <Server size={18} />;
      case 'network': return <Network size={18} />;
      default: return <Monitor size={18} />;
    }
  };

  const openDeviceModal = (device = null) => {
    setSelectedDevice(device);
    setShowDeviceModal(true);
  };

  return (
    <div className="admin-module-page amc-device-registry-page p-8">
      <div className="flex justify-between items-center mb-8">
        
        <button 
          className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
          onClick={() => openDeviceModal()}
        >
          <Plus size={16} /> Enroll New Device
        </button>
      </div>

      <div className="card bg-white shadow-xl border-none overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input type="text" placeholder="Search devices by serial, AMC ID..." className="table-input pl-10" />
          </div>
          <div className="flex gap-2">
            {['Laptop', 'Printer', 'Server'].map(type => (
              <span key={type} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black uppercase text-muted cursor-pointer hover:bg-white transition-all">{type}</span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Type / Model</th>
                <th>Serial Number</th>
                <th>Linked AMC</th>
                <th>Customer</th>
                <th>Last Service</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                <tr key={device.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="font-black text-xs text-primary">{device.id}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-primary group-hover:bg-white transition-colors">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{device.model}</span>
                        <span className="text-[10px] text-muted font-bold uppercase">{device.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs font-bold">{device.serial}</td>
                  <td className="text-xs font-black opacity-60 underline cursor-pointer hover:text-primary">{device.amcId}</td>
                  <td className="font-bold text-xs">{device.customer}</td>
                  <td className="text-xs font-bold opacity-60">{device.lastService}</td>
                  <td>
                    <span className={`status-pill ${device.status === 'Healthy' ? 'status-success' : 'status-warning'}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="text-right relative">
                    <button className="p-2 hover:bg-white rounded-lg transition-colors" onClick={() => openDeviceModal(device)}><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDeviceModal && <DeviceDetailModal device={selectedDevice} onClose={() => setShowDeviceModal(false)} />}
    </div>
  );
};

const DeviceDetailModal = ({ device, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[32px] w-full max-w-5xl h-[80vh] overflow-hidden shadow-2xl flex animate-in zoom-in-95">
        {/* Sidebar Tabs */}
        <div className="w-64 border-r border-slate-50 bg-slate-50/30 flex flex-col p-6">
           <div className="mb-10 text-center">
              <div className="h-16 w-16 bg-white rounded-2xl shadow-sm mx-auto mb-4 flex items-center justify-center text-primary">
                 <Monitor size={32} />
              </div>
              <h3 className="text-sm font-black text-main uppercase tracking-tight">{device?.model || 'New Device'}</h3>
              <p className="text-[10px] text-muted font-bold uppercase mt-1">{device?.id || 'UNREGISTERED'}</p>
           </div>
           <nav className="flex-1 space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'history', label: 'Service History', icon: History },
                { id: 'tickets', label: 'Recent Tickets', icon: Wrench },
                { id: 'agreement', label: 'Agreement Link', icon: CheckCircle2 }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-muted hover:bg-white/50'}`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
           </nav>
           <button onClick={onClose} className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Close Registry</button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted">{activeTab}</h4>
              <button className="px-6 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Edit Registry</button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-10">
              {activeTab === 'overview' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                   <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted">Model / Configuration</label>
                        <p className="text-lg font-black text-main">{device?.model || 'Enter Model Name'}</p>
                        <p className="text-xs text-muted leading-relaxed">Intel i7, 16GB RAM, 512GB SSD. Purchased in late 2024.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted">Registry Status</label>
                        <div className="flex items-center gap-3">
                           <span className="h-3 w-3 rounded-full bg-success"></span>
                           <span className="font-black text-sm uppercase">Optimized Performance</span>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-6">
                      <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                         <CalendarDays size={20} className="text-primary mb-4" />
                         <p className="text-[10px] font-black uppercase text-muted">Enrollment Date</p>
                         <p className="text-sm font-black text-main mt-1">Jan 12, 2026</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                         <Monitor size={20} className="text-info mb-4" />
                         <p className="text-[10px] font-black uppercase text-muted">Brand / OEM</p>
                         <p className="text-sm font-black text-main mt-1">Dell Inc.</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                         <ShieldCheck size={20} className="text-success mb-4" />
                         <p className="text-[10px] font-black uppercase text-muted">Warranty Type</p>
                         <p className="text-sm font-black text-main mt-1">On-Site AMC</p>
                      </div>
                   </div>

                   <div className="card p-8 border-dashed border-2 border-slate-100 shadow-none">
                      <h5 className="text-[10px] font-black uppercase text-muted tracking-widest mb-6">Technical Specifications</h5>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-12">
                         {[
                           { k: 'Processor', v: 'i7 12th Gen' },
                           { k: 'Memory', v: '16GB LPDDR4' },
                           { k: 'Storage', v: '512GB NVMe' },
                           { k: 'OS', v: 'Windows 11 Pro' }
                         ].map(item => (
                           <div key={item.k} className="flex justify-between items-center border-b border-slate-50 pb-2">
                              <span className="text-xs font-bold opacity-50">{item.k}</span>
                              <span className="text-xs font-black">{item.v}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                   {[
                     { date: '2026-03-10', type: 'Preventive', tech: 'Vikram S.', note: 'Regular cleaning and thermal paste replacement.' },
                     { date: '2026-01-20', type: 'Breakdown', tech: 'Arun K.', note: 'OS crash resolved via remote support.' }
                   ].map((log, i) => (
                     <div key={i} className="flex gap-6 relative">
                        {i < 1 && <div className="absolute left-[23px] top-12 bottom-[-24px] w-[2px] bg-slate-100"></div>}
                        <div className="h-12 w-12 bg-white rounded-full shadow-md flex items-center justify-center text-primary relative z-10">
                           <History size={20} />
                        </div>
                        <div className="flex-1 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <span className="text-[10px] font-black uppercase text-primary tracking-widest">{log.type} Service</span>
                                 <h5 className="text-sm font-black text-main mt-1">{log.date}</h5>
                              </div>
                              <span className="text-[10px] font-black text-muted uppercase">Tech: {log.tech}</span>
                           </div>
                           <p className="text-xs opacity-70 leading-relaxed">{log.note}</p>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const ShieldCheck = ({ size, className }) => <CheckCircle2 size={size} className={className} />;

export default AMCDeviceRegistryPage;
