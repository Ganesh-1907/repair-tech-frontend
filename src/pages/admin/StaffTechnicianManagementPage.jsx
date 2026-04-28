import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import {
  MapPin,
  ChevronRight,
  CheckCircle2,
  Search,
  Monitor,
  Briefcase,
  PhoneCall,
  MessageCircle,
  ArrowRightLeft,
  PlayCircle,
  Plus,
  MoreVertical,
  ChevronDown,
  Globe,
  Settings,
  MoreHorizontal,
  X,
  Menu,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  BarChart2,
  Calendar,
  Ticket,
  Bell
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const MapMarker = ({ top, left, img, time }) => (
  <div className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer" style={{ top, left }}>
    <div className="w-[52px] h-[52px] rounded-full border-4 border-white shadow-md overflow-hidden relative">
      <img src={img} alt="Marker" className="w-full h-full object-cover" />
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-white rounded-full"></div>
    </div>
    <div className="mt-1 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
      <CheckCircle2 size={10} className="text-[#10b981]" /> {time}
    </div>
  </div>
);

const StaffTechnicianManagementPage = () => {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex font-['Inter'] w-screen h-screen overflow-hidden text-slate-800">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="w-[240px] bg-[#1e3a8a] text-white flex flex-col flex-shrink-0 h-full">
        <div className="h-[72px] flex items-center px-6 gap-4 border-b border-white/10 shrink-0">
          <Menu size={20} className="text-white/80" />
          <span className="text-[20px] font-bold tracking-wide">Admin</span>
        </div>
        <div className="py-6 flex flex-col gap-1 px-4 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3"><LayoutDashboard size={18} /> <span className="text-sm font-semibold">Dashboard</span></div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3"><Briefcase size={18} /> <span className="text-sm font-semibold">Jobs</span></div>
            <ChevronRight size={14} className="opacity-50" />
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#2563eb] text-white cursor-pointer">
            <div className="flex items-center gap-3"><Monitor size={18} /> <span className="text-sm font-semibold">Technicians</span></div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3"><FileText size={18} /> <span className="text-sm font-semibold">Inventory</span></div>
            <ChevronRight size={14} className="opacity-50" />
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3"><ShieldCheck size={18} /> <span className="text-sm font-semibold">AMC/CMC</span></div>
            <ChevronRight size={14} className="opacity-50" />
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3"><BarChart2 size={18} /> <span className="text-sm font-semibold">Reports</span></div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-3"><Settings size={18} /> <span className="text-sm font-semibold">Settings</span></div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="h-[72px] bg-white flex justify-between items-center px-6 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold text-slate-800">Welcome, Admin!</h2>
            <div className="w-6 h-6 bg-[#2563eb] rounded flex items-center justify-center text-white ml-1 shadow-sm">
              <MoreHorizontal size={14} />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 text-[#2563eb] bg-blue-50 rounded flex items-center justify-center"><Calendar size={16}/></div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold leading-none">124</span>
                <span className="text-[10px] font-semibold text-slate-500">Total Jobs</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 text-slate-600 bg-white rounded flex items-center justify-center shadow-sm font-bold border border-slate-200">₹</div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold leading-none">2,54,620</span>
                <span className="text-[10px] font-semibold text-slate-500 flex gap-1 items-center">This month <span className="text-[#10b981] font-bold">- 15%</span></span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 text-[#2563eb] bg-blue-50 rounded flex items-center justify-center"><Ticket size={16}/></div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold leading-none">26</span>
                <span className="text-[10px] font-semibold text-slate-500">Open tickets</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4 ml-2 border-l border-slate-200">
               <div className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold rounded">596</div>
               <button className="relative text-slate-400 hover:text-slate-600">
                 <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                 <Bell size={20} />
               </button>
               <img src="https://i.pravatar.cc/150?u=admin" className="w-8 h-8 rounded-full border border-slate-200 object-cover" alt="Admin" />
            </div>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div 
          className="flex-1 p-4 grid gap-4 overflow-hidden"
          style={{
            gridTemplateColumns: '1.7fr 1fr 0.9fr',
            gridTemplateRows: 'auto auto 260px 1fr'
          }}
        >
          {/* Row 1: Title */}
          <div className="col-span-3 flex items-center gap-2 pt-1 pb-1">
            <h1 className="text-[20px] font-bold text-slate-800">Technicians</h1>
            <span className="text-slate-300 font-bold tracking-widest text-sm mt-0.5">»»»</span>
          </div>
          
          {/* Row 2: Left Stats */}
          <div className="col-start-1 col-end-2 row-start-2 bg-white rounded-[14px] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-[#e5e7eb] flex flex-col justify-between">
            <div className="flex justify-between items-start pr-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[32px] font-bold text-slate-800 leading-none">16</span>
                <span className="text-[10px] font-semibold text-slate-500 leading-tight">Total <br/>Technicians</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[32px] font-bold text-[#10b981] leading-none">12</span>
                <span className="text-[10px] font-semibold text-[#10b981] leading-tight">Active <br/>Technicians</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[32px] font-bold text-[#10b981] leading-none">4</span>
                <span className="text-[10px] font-semibold text-slate-500 leading-tight">Inactive <br/>Lake Inaction</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded border border-blue-100 text-[11px] font-bold shadow-sm">All</button>
                <button className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded border border-slate-200 text-[11px] font-bold">Available</button>
                <button className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded border border-slate-200 text-[11px] font-bold flex items-center gap-1.5">
                  On Job <span className="bg-slate-200 text-slate-600 px-1 py-0.5 rounded text-[9px]">3</span>
                </button>
                <button className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded border border-slate-200 text-[11px] font-bold flex items-center gap-1.5">
                  <Monitor size={12} className="text-slate-400" /> Inactive
                </button>
              </div>
              <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded text-[11px] font-bold flex items-center gap-1 shadow-sm">
                All <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Row 3: Left Map */}
          <div className="col-start-1 col-end-2 row-start-3 bg-white rounded-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-[#e5e7eb] relative overflow-hidden h-full w-full">
            <img src="https://assets.codepen.io/13472/google-map-dummy.png" className="w-full h-full object-cover opacity-80 mix-blend-multiply bg-[#e2e8f0]" alt="Map" />
            <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-md text-[11px] font-bold text-[#2563eb] flex items-center gap-1 shadow-sm border border-slate-200">
              <MapPin size={12} /> View Details <ChevronRight size={12} />
            </div>
            
            <MapMarker top="25%" left="25%" time="8 mins ago" img="https://i.pravatar.cc/150?u=1" />
            <MapMarker top="45%" left="40%" time="10 mins ago" img="https://i.pravatar.cc/150?u=2" />
            <MapMarker top="65%" left="60%" time="12 mins ago" img="https://i.pravatar.cc/150?u=3" />
            <MapMarker top="35%" left="80%" time="15 mins ago" img="https://i.pravatar.cc/150?u=4" />
            
            <div className="absolute bottom-3 left-3 text-[12px] font-bold text-slate-400">Google <span className="font-medium text-[10px]">Mapster</span></div>
            <div className="absolute bottom-3 right-12 bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-[9px] font-bold text-slate-500 flex items-center gap-1">
              <Globe size={10}/> e.g.
            </div>
            <div className="absolute top-3 right-3 bg-white p-1.5 rounded shadow-sm border border-slate-200"><Settings size={12} className="text-slate-500"/></div>
            <div className="absolute bottom-3 right-3 flex flex-col gap-0.5 bg-white p-0.5 rounded shadow-sm border border-slate-200">
               <button className="w-6 h-6 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50 text-sm">+</button>
               <div className="w-4 h-[1px] bg-slate-200 mx-auto"></div>
               <button className="w-6 h-6 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-50 text-sm">-</button>
            </div>
          </div>

          {/* Row 4: Left & Middle Tech List */}
          <div className="col-start-1 col-end-3 row-start-4 bg-white rounded-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-[#e5e7eb] flex flex-col min-h-0 overflow-hidden relative">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="text-[14px] font-bold text-slate-800">Technician List</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Export</span>
                  <button className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-slate-600 flex items-center gap-2 bg-slate-50">
                    Skills <ChevronDown size={10} />
                  </button>
                  <button className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-slate-600 flex items-center gap-2 bg-slate-50">
                    Status <ChevronDown size={10} />
                  </button>
                  <button className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-slate-600 flex items-center gap-2 bg-slate-50">
                    City <Search size={10} className="text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex border border-slate-200 rounded h-7">
                  <button className="px-2 border-r border-slate-200 bg-white"><Globe size={12} className="text-slate-500"/></button>
                  <button className="px-2 border-r border-slate-200 bg-white"><Settings size={12} className="text-slate-500"/></button>
                  <button className="px-2 bg-white"><MoreHorizontal size={12} className="text-slate-500"/></button>
                </div>
                <button className="h-7 px-3 bg-[#10b981] text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <Plus size={12} /> Add Technician
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b border-slate-100 h-[40px]">
                    <th className="px-4 w-10"><input type="checkbox" className="rounded-sm border-slate-300" /></th>
                    <th className="px-2 text-[10px] font-bold text-slate-500 w-12">Pho</th>
                    <th className="px-4 text-[10px] font-bold text-slate-500">Name</th>
                    <th className="px-4 text-[10px] font-bold text-slate-500">Role</th>
                    <th className="px-4 text-[10px] font-bold text-slate-500">Assigned Jobs</th>
                    <th className="px-4 text-[10px] font-bold text-slate-500">Skills</th>
                    <th className="px-4 text-[10px] font-bold text-slate-500">Status</th>
                    <th className="px-4 text-[10px] font-bold text-slate-500">Last Seen</th>
                    <th className="px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <TechRow name="Aditya" role="Technician" jobs="2, 8" skills="Laptop" status="Available" statusColor="bg-[#10b981]" time="8 mins ago" img="https://i.pravatar.cc/150?u=aditya" />
                  <TechRow name="Krishna" role="Technician" subtitle="Team leadred" jobs="1, 3" skills="Printer" status="On Job" statusColor="bg-orange-500" time="1.2 km away" img="https://i.pravatar.cc/150?u=krishna" isSelected={true} />
                  <TechRow name="Deepak" role="Technician" jobs="2, 9" skills="Chip-Level" status="Inactive" statusColor="bg-rose-500" time="2.1 km away" img="https://i.pravatar.cc/150?u=deepak" />
                  <TechRow name="Mafi Tesimali" role="Technician" jobs="2, 6" skills="Printer" status="Inactive" statusColor="bg-orange-500" time="3.1 km away" img="https://i.pravatar.cc/150?u=mafi" />
                  <TechRow name="Ashok Sharma" role="Technician" jobs="2, 8" skills="Laptop jet" status="Active" statusColor="bg-[#10b981]" time="2.1 km away" img="https://i.pravatar.cc/150?u=ashok" />
                </tbody>
              </table>
            </div>
            
            {/* Overlay Profile Popup */}
            {showPopup && (
              <div className="absolute bottom-4 left-4 bg-white rounded-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.15)] border border-slate-200 w-[260px] z-20 flex flex-col">
                <div className="p-3 border-b border-slate-100 relative flex gap-3">
                  <button onClick={() => setShowPopup(false)} className="absolute top-2 right-2 text-slate-400"><X size={12} /></button>
                  <img src="https://i.pravatar.cc/150?u=aditya" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                  <div>
                    <h3 className="text-[12px] font-bold text-slate-800">Aditya <span className="text-[10px] text-slate-400 font-normal">#TF1023</span></h3>
                    <p className="text-[9px] font-semibold text-slate-500 mt-0.5">Laptop. Networking</p>
                    <p className="text-[8px] text-slate-400 mt-0.5">1 gean apo. 2.16 kms</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    <button className="flex flex-col items-center justify-center gap-1 py-1.5 bg-[#2563eb] text-white rounded-lg"><PhoneCall size={12} /><span className="text-[8px] font-bold">Call</span></button>
                    <button className="flex flex-col items-center justify-center gap-1 py-1.5 bg-[#2563eb] text-white rounded-lg"><MessageCircle size={12} /><span className="text-[8px] font-bold">Message</span></button>
                    <button className="flex flex-col items-center justify-center gap-1 py-1.5 bg-[#2563eb] text-white rounded-lg"><ArrowRightLeft size={12} /><span className="text-[8px] font-bold">Trempler</span></button>
                    <button className="flex flex-col items-center justify-center gap-1 py-1.5 bg-[#2563eb] text-white rounded-lg"><PlayCircle size={12} /><span className="text-[8px] font-bold">Sgn Job</span></button>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    <button className="flex-1 h-8 bg-[#10b981] text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"><Plus size={12} /> Assign Job</button>
                    <button className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 bg-slate-50"><MoreVertical size={12} /></button>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button className="w-full flex items-center justify-between px-3 py-2 border-b border-slate-100 hover:bg-slate-50"><span className="flex items-center gap-2 text-[10px] font-bold text-slate-700"><MoreHorizontal size={12} className="text-[#2563eb]" /> Start Shift</span><ChevronDown size={12} className="text-slate-400" /></button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 border-b border-slate-100 hover:bg-slate-50"><Monitor size={12} className="text-[#2563eb]" /> <span className="text-[10px] font-bold text-slate-700">Suspend</span></button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50"><div className="bg-rose-100 p-0.5 rounded text-rose-500"><X size={10} /></div> <span className="text-[10px] font-bold text-slate-700">Terminate</span></button>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-slate-50 text-[#2563eb] text-[10px] font-bold border-t border-slate-200 flex items-center justify-center hover:bg-slate-100">View Profile</button>
              </div>
            )}
          </div>

          {/* Row 2/3: Middle Top Tech */}
          <div className="col-start-2 col-end-3 row-start-2 row-end-4 bg-white rounded-[14px] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-[#e5e7eb] flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[12px] font-bold text-slate-800">Top Technician of The Week</h3>
              <div className="text-yellow-500 bg-yellow-50 p-1 rounded"><Briefcase size={10} className="fill-current"/></div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 leading-tight">Ravi Kumar</h2>
                <p className="text-[9px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5"><CheckCircle2 size={10} className="text-[#10b981]" /> Kukatpally, 2:10 AM</p>
              </div>
              <img src="https://i.pravatar.cc/150?u=ravi" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
            </div>
            <div className="flex justify-between items-end mb-4 flex-1">
              <div>
                <span className="text-[9px] font-semibold text-slate-400 block mb-0.5">Status <CheckCircle2 size={8} className="inline text-[#2563eb]" /></span>
                <span className="text-[11px] font-bold text-[#10b981] flex items-center gap-1"><CheckCircle2 size={12} /> Broldens</span>
              </div>
              <div className="text-center">
                <span className="text-[24px] font-bold text-slate-900 leading-none">124</span>
                <span className="text-[9px] font-semibold text-slate-400 ml-1">bbq<br/>app</span>
              </div>
              <div className="text-right">
                <span className="text-[24px] font-bold text-slate-900 leading-none">85%</span>
              </div>
            </div>
            <div className="w-full h-[140px] rounded-lg overflow-hidden relative mt-auto border border-slate-100 shrink-0">
              <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=400&h=150" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-[9px] font-bold text-[#2563eb] shadow-sm flex items-center gap-1 border border-slate-200">
                View Details <ChevronRight size={10} />
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[9px] font-bold bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
                <CheckCircle2 size={10} className="text-[#10b981]"/> Nnear Pesite: Kukatpally, 2.3 km
              </div>
            </div>
          </div>

          {/* Row 2: Right Pending Jobs */}
          <div className="col-start-3 col-end-4 row-start-2 bg-white rounded-[14px] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-[#e5e7eb] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-[12px] font-bold text-slate-800 mb-1">Pending Jobs</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-bold text-slate-900 leading-none">42</span>
                  <span className="text-[11px] font-semibold text-slate-500">jobs</span>
                </div>
              </div>
              <Search size={14} className="text-slate-400 mt-1" />
            </div>
            <div className="h-[70px] mt-2">
              <Bar 
                data={{
                  labels: ['Ravi', 'Krishna', 'Deepak', 'Vijay', '25j'],
                  datasets: [{ data: [15, 22, 18, 12, 19], backgroundColor: ['#10b981', '#2563eb', '#10b981', '#ef4444', '#10b981'], borderRadius: 2, barThickness: 10 }]
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 9 }, color: '#94a3b8' } }, y: { display: false, min: 0 } } }}
              />
            </div>
          </div>

          {/* Row 3: Right Tech Perf */}
          <div className="col-start-3 col-end-4 row-start-3 bg-white rounded-[14px] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-[#e5e7eb] flex flex-col justify-between overflow-hidden">
            <h3 className="text-[12px] font-bold text-slate-800 mb-3 shrink-0">Technician Performance</h3>
            <div className="flex flex-col gap-2 flex-1 justify-center">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2"><ChevronRight size={12} className="text-[#10b981]" /><span className="text-[11px] font-bold text-slate-800">Ravi</span></div>
                <div className="flex items-center gap-4"><span className="text-[11px] font-bold text-slate-800">₹ 2,600</span><span className="text-[11px] font-bold text-slate-800">₹ 2,600</span></div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2"><Briefcase size={12} className="text-[#2563eb]" /><span className="text-[11px] font-bold text-slate-800">Khan</span></div>
                <div className="flex items-center gap-4"><span className="text-[11px] font-bold text-slate-800">₹ 2,100</span><span className="text-[8px] px-2 py-0.5 bg-[#10b981] text-white rounded font-bold w-12 text-center">Stan rec</span></div>
              </div>
              <div className="flex justify-between items-center bg-[#10b981] p-2 rounded-lg text-white shadow-sm">
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-[10px] font-bold">R</div><span className="text-[11px] font-bold">Ramesh</span></div>
                <div className="flex flex-col items-end"><div className="flex gap-1"><Monitor size={8} /><Briefcase size={8}/></div><div className="text-[7px] font-bold text-white/90 mt-0.5">Uneclled in. 2.3min ago</div></div>
              </div>
            </div>
          </div>

          {/* Row 4: Right Attendance */}
          <div className="col-start-3 col-end-4 row-start-4 bg-white rounded-[14px] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-[#e5e7eb] flex flex-col min-h-0 overflow-hidden">
            <h3 className="text-[12px] font-bold text-slate-800 mb-3 shrink-0">Attendance Logs</h3>
            <div className="overflow-y-auto flex-1 flex flex-col gap-2 custom-scrollbar">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2"><img src="https://i.pravatar.cc/150?u=aditya" className="w-7 h-7 rounded-full object-cover" /><div><p className="text-[10px] font-bold text-slate-800">Aditya</p><p className="text-[8px] text-slate-500">68.60, Away 1 03:00 AM</p></div></div>
                <div className="flex flex-col items-end gap-0.5"><ChevronRight size={10} className="text-[#10b981]" /><span className="text-[9px] font-bold text-slate-400">8m</span></div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2"><img src="https://i.pravatar.cc/150?u=krishna" className="w-7 h-7 rounded-full object-cover" /><div><p className="text-[10px] font-bold text-slate-800">Krishna</p><p className="text-[8px] text-slate-500">64.68, Away 1 05:28 AM</p></div></div>
                <div className="flex flex-col items-end gap-0.5"><ChevronRight size={10} className="text-[#10b981]" /><span className="text-[9px] font-bold text-slate-400">12m</span></div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2"><img src="https://i.pravatar.cc/150?u=mafi" className="w-7 h-7 rounded-full object-cover" /><div><p className="text-[10px] font-bold text-slate-800">Mafi Tesimoul</p><p className="text-[8px] text-slate-500">2.8 km Away 1 03:40 AM</p></div></div>
                <div className="flex flex-col items-end gap-0.5"><ChevronRight size={10} className="text-[#10b981]" /><span className="text-[9px] font-bold text-slate-400">9m</span></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 shrink-0">
              <button className="text-[9px] font-bold text-[#2563eb] flex items-center gap-1">&larr; Previous</button>
              <div className="flex gap-1 text-[10px] font-bold text-slate-500"><span className="text-[#2563eb]">1</span><span>2</span><span>3</span></div>
              <button className="text-[9px] font-bold text-[#2563eb] flex items-center gap-1">Next &rarr;</button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const TechRow = ({ img, name, role, subtitle, jobs, skills, status, statusColor, time, isSelected }) => (
  <tr className={`h-[64px] hover:bg-slate-50 ${isSelected ? 'bg-slate-50' : ''}`}>
    <td className="px-4"><input type="checkbox" className="rounded-sm border-slate-300" /></td>
    <td className="px-2 relative">
      <img src={img} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
      {isSelected && <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-100 text-[#2563eb] flex items-center justify-center shadow-sm">›</div>}
    </td>
    <td className="px-4">
      <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">{name} {subtitle && <span className="px-1 py-0.5 bg-[#2563eb] text-white text-[7px] rounded-sm font-bold flex items-center gap-0.5"><CheckCircle2 size={6}/> {subtitle}</span>}</p>
      {subtitle ? <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5"><CheckCircle2 size={8} className="text-[#10b981]"/> Crip batn. 1.3 km</p> : <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {role}</p>}
    </td>
    <td className="px-4"><span className="flex items-center gap-1 text-[10px] font-bold text-[#10b981]"><Briefcase size={10} /> technician</span></td>
    <td className="px-4 text-center text-[12px] font-bold text-slate-800">{jobs}</td>
    <td className="px-4 text-[10px] font-bold text-slate-600">{skills}</td>
    <td className="px-4"><span className={`px-2 py-0.5 rounded text-white text-[9px] font-bold uppercase ${statusColor}`}>{status}</span></td>
    <td className="px-4 text-[10px] font-bold text-slate-600 flex items-center justify-between h-[64px]">{time} <ChevronRight size={12} className="text-slate-300" /></td>
    <td className="px-4"></td>
  </tr>
);

export default StaffTechnicianManagementPage;
