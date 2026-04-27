import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter, 
  FileText, 
  ChevronDown, 
  Printer, 
  IndianRupee,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Wrench,
  CheckCircle2,
  Package,
  AlertCircle
} from 'lucide-react';
import './AMCPremiumStyles.css';

const AMCReportsPage = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const reportCategories = [
    { title: 'Financial Performance', icon: IndianRupee, metrics: ['Revenue Trend', 'Cost vs Profit', 'Parts Cost Analysis', 'Unpaid Invoices'] },
    { title: 'Operational Health', icon: Activity, metrics: ['Missed Visits', 'SLA Breach Report', 'Technician Efficiency', 'Visit Volume'] },
    { title: 'Portfolio Insights', icon: PieChart, metrics: ['Plan Distribution', 'Renewal Conversion', 'High Cost Customers', 'Location-wise Analysis'] }
  ];

  return (
    <div className="admin-module-page amc-reports-page p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-main tracking-tight">Business Intelligence</h2>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">AMC Performance Analytics & Reports</p>
        </div>
        <div className="flex gap-4">
           <div className="relative">
              <button className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                 <Calendar size={14} className="text-primary" /> {dateRange} <ChevronDown size={14} />
              </button>
           </div>
           <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
              <Download size={14} /> Export All Data
           </button>
        </div>
      </div>

      {/* Analytical Summary */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        {reportCategories.map(cat => (
          <div key={cat.title} className="card p-8 bg-white shadow-xl border-none group hover:-translate-y-1 transition-all">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all"><cat.icon size={20} /></div>
                <h3 className="text-xs font-black uppercase tracking-widest text-main">{cat.title}</h3>
             </div>
             <div className="space-y-4">
                {cat.metrics.map(m => (
                  <button key={m} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group/item">
                     <span className="text-xs font-bold text-muted group-hover/item:text-main">{m}</span>
                     <ArrowUpRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-primary" />
                  </button>
                ))}
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Chart Placeholder / Visual Section */}
        <div className="col-span-8">
           <div className="card p-10 bg-main text-white relative overflow-hidden shadow-2xl border-none">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent"></div>
              <div className="relative z-10">
                 <div className="flex justify-between items-center mb-10">
                    <div>
                       <h3 className="text-xl font-extrabold tracking-tight">Visit Conversion vs Target</h3>
                       <p className="text-xs opacity-40 font-bold uppercase tracking-widest mt-1">Planned vs Actual Service Delivery</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl"><TrendingUp size={20} className="text-primary-light" /></div>
                 </div>
                 
                 <div className="flex items-end gap-3 h-48 mb-8">
                    {[40, 65, 55, 85, 75, 95, 80, 60, 90, 70, 85, 98].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/10 rounded-lg relative overflow-hidden group">
                         <div className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-1000 shadow-glow" style={{ height: `${h}%` }}></div>
                         <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between text-[9px] font-black uppercase opacity-30 tracking-[0.2em] px-1">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Top Performers Widget */}
        <div className="col-span-4">
           <div className="card p-8 bg-white shadow-xl border-none flex flex-col h-full">
              <h4 className="text-xs font-black uppercase tracking-widest text-main mb-8 flex justify-between">
                 Top Technicians <CheckCircle2 size={14} className="text-success" />
              </h4>
              <div className="space-y-6 flex-1">
                 {[
                   { name: 'Rahul Kumar', score: 98, visits: 45, color: 'text-success' },
                   { name: 'Amit Singh', score: 94, visits: 38, color: 'text-primary' },
                   { name: 'Vikram Sahni', score: 91, visits: 42, color: 'text-info' },
                   { name: 'Arun K.', score: 88, visits: 31, color: 'text-warning' }
                 ].map(tech => (
                   <div key={tech.name} className="flex items-center gap-4 group">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-muted group-hover:bg-primary group-hover:text-white transition-all">
                         {tech.name[0]}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between text-xs font-black mb-1">
                            <span>{tech.name}</span>
                            <span className={tech.color}>{tech.score}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-current ${tech.color} opacity-70`} style={{ width: `${tech.score}%` }}></div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                 <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Full Performance Report</button>
              </div>
           </div>
        </div>
      </div>

      {/* Detailed Data View Placeholder */}
      <div className="mt-12 card p-10 bg-white shadow-2xl border-none">
         <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-lg font-black text-main">Parts Consumption Analytics</h3>
               <p className="text-[10px] text-muted font-bold uppercase mt-1">Stock deduction vs AMC Service Tickets</p>
            </div>
            <div className="flex gap-3">
               <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"><Printer size={16} /></button>
               <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"><Download size={16} /></button>
            </div>
         </div>
         <div className="grid grid-cols-4 gap-8">
            {[
              { label: 'Total Parts Cost', val: '₹45,200', icon: Package, tone: 'primary' },
              { label: 'Inventory Deducted', val: '142 Items', icon: CheckCircle2, tone: 'success' },
              { label: 'Efficiency Loss', val: '₹1,200', icon: ArrowDownRight, tone: 'danger' },
              { label: 'Stock Warning', val: '8 Items Low', icon: AlertCircle, tone: 'warning' }
            ].map(item => (
              <div key={item.label} className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 hover:shadow-lg transition-all cursor-default">
                 <item.icon size={20} className={`mb-4 text-${item.tone}`} />
                 <p className="text-[9px] font-black text-muted uppercase tracking-widest">{item.label}</p>
                 <p className="text-xl font-black text-main mt-1">{item.val}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default AMCReportsPage;
