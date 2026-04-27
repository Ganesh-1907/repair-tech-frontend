import React, { useState, useMemo, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Package, 
  AlertTriangle, 
  Plus, 
  ShoppingCart,
  Zap,
  Box, 
  X, 
  TrendingUp,
  Activity,
  History,
  IndianRupee,
  Trash2,
  Eye,
  RefreshCcw,
  Truck,
  Percent
} from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import './InventoryPremiumStyles.css';

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [billingEffect, setBillingEffect] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItems(inventoryService.getItems());
    setStats(inventoryService.getStats());
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'All' || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, filterType]);

  const handleDeductStock = (itemId) => {
    try {
      inventoryService.updateStock(itemId, -1, 'Billing Deduction');
      setBillingEffect(itemId);
      setTimeout(() => setBillingEffect(null), 1000);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const currentItems = inventoryService.getItems();
      const updatedItems = currentItems.filter(i => i.id !== id);
      localStorage.setItem('repair_tech_inventory', JSON.stringify(updatedItems));
      loadData();
    }
  };

  const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

  return (
    <div className="inventory-container">
      {/* Header Section */}
      <Motion.div 
        className="inventory-header-glass flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="text-indigo-600" size={32} />
            Inventory <span className="text-indigo-600">Hub</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Enterprise stock control with profit analysis and supplier tracking.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search inventory, SKUs, or suppliers..." 
                className="h-12 w-80 pl-12 pr-6 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
            onClick={() => {
              if (window.confirm('Reset all inventory data to factory defaults?')) {
                localStorage.removeItem('repair_tech_inventory');
                window.location.reload();
              }
            }}
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all active:scale-95"
            title="Reset to Factory Data"
           >
              <RefreshCcw size={18} />
           </button>
           <button 
            onClick={() => setShowAddModal(true)}
            className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
           >
              <Plus size={18} strokeWidth={3} /> New Inventory
           </button>
        </div>
      </Motion.div>

      {/* Stats Grid */}
      <div className="inventory-stats-grid">
        <StatCard 
          icon={<Box size={24} />} 
          label="Total Inventory" 
          value={stats.totalItems} 
          color="#6366f1" 
          bg="#e0e7ff" 
          delay={0.1}
        />
        <StatCard 
          icon={<Percent size={24} />} 
          label="Avg. Profit Margin" 
          value={`${stats.avgMargin}%`} 
          color="#8b5cf6" 
          bg="#ede9fe" 
          delay={0.2}
        />
        <StatCard 
          icon={<IndianRupee size={24} />} 
          label="Profit Potential" 
          value={formatCurrency(stats.totalProfitPotential)} 
          color="#10b981" 
          bg="#dcfce7" 
          delay={0.3}
        />
        <StatCard 
          icon={<AlertTriangle size={24} />} 
          label="Stock Health" 
          value={stats.lowStock > 0 ? "Action Needed" : "Optimal"} 
          color={stats.lowStock > 0 ? "#ef4444" : "#f59e0b"} 
          bg={stats.lowStock > 0 ? "#fef2f2" : "#fef3c7"} 
          delay={0.4}
          isAlert={stats.lowStock > 0}
        />
      </div>

      {/* Main Table Content */}
      <Motion.div 
        className="inventory-table-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
           <div className="flex gap-2">
              {['All', 'Sales', 'Service'].map(type => (
                 <button 
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                 >
                    {type === 'All' ? 'Complete Listing' : `${type} Inventory`}
                 </button>
              ))}
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <History size={14} /> Tracking {items.length} active records
           </div>
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item / Supplier</th>
              <th>Category</th>
              <th>Margin Analysis</th>
              <th>Stock Status</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => {
                const margin = item.sellingPrice - item.purchasePrice;
                const marginPercent = ((margin / item.sellingPrice) * 100).toFixed(1);
                
                return (
                  <Motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    className={billingEffect === item.id ? 'billing-shimmer' : ''}
                  >
                    <td>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${item.type === 'Service' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {item.type === 'Service' ? <Zap size={20} /> : <Package size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Truck size={10} className="text-indigo-400" /> {item.supplier || 'Direct Source'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-category ${item.type === 'Sales' ? 'badge-sales' : 'badge-service'}`}>
                        {item.type}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{item.category}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">{formatCurrency(item.sellingPrice)}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Cost: {formatCurrency(item.purchasePrice)}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${Number(marginPercent) > 30 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {marginPercent}%
                        </div>
                      </div>
                    </td>
                    <td>
                      {item.type === 'Sales' ? (
                        <div className="stock-bar-container">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className={`text-xs font-black ${item.currentStock <= item.minStock ? 'text-rose-600' : 'text-slate-700'}`}>
                              {item.currentStock} Units
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">Min: {item.minStock}</span>
                          </div>
                          <div className="stock-bar-bg">
                            <div 
                              className={`stock-bar-fill ${item.currentStock <= item.minStock ? 'stock-low' : item.currentStock <= item.minStock * 2 ? 'stock-medium' : 'stock-high'}`}
                              style={{ width: `${Math.min((item.currentStock / (item.minStock * 3)) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase italic flex items-center gap-2">
                          <Activity size={12} /> Labor-Based
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Live
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {item.type === 'Sales' && (
                          <button 
                            onClick={() => handleDeductStock(item.id)}
                            disabled={item.currentStock <= 0}
                            title="Quick Bill (Deduct Stock)"
                            className="btn-billing-deduct"
                          >
                            <ShoppingCart size={14} /> Bill
                          </button>
                        )}
                        <button className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Eye size={16} /></button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </Motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </Motion.div>

      {/* Add Inventory Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddInventoryModal 
            onClose={() => setShowAddModal(false)} 
            onSave={() => { loadData(); setShowAddModal(false); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* Sub-components */

const StatCard = ({ icon, label, value, color, bg, delay, isAlert }) => (
  <Motion.div 
    className="stat-card-premium"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div className="stat-card-icon" style={{ backgroundColor: bg, color }}>
      {icon}
    </div>
    <h3 className="stat-card-value">{value}</h3>
    <p className="stat-card-label">{label}</p>
    {isAlert && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>}
  </Motion.div>
);

const AddInventoryModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Sales',
    sku: '',
    category: '',
    supplier: '',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: '',
    minStock: '5',
    unit: 'pcs'
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.sellingPrice) newErrors.sellingPrice = 'Price is required';
    if (formData.type === 'Sales' && formData.currentStock === '') newErrors.currentStock = 'Stock is mandatory';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const newItem = {
      ...formData,
      isStockDependent: formData.type === 'Sales',
      currentStock: formData.type === 'Sales' ? Number(formData.currentStock) : 0,
      minStock: formData.type === 'Sales' ? Number(formData.minStock) : 0,
      purchasePrice: Number(formData.purchasePrice || 0),
      sellingPrice: Number(formData.sellingPrice),
      status: 'Active'
    };

    inventoryService.addItem(newItem);
    onSave();
  };

  return (
    <div className="modal-overlay-premium" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Motion.div 
        className="modal-content-premium"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        <div className="modal-header-premium">
          <h2 className="text-2xl font-black">Enterprise Asset Enrollment</h2>
          <p className="text-white/70 text-sm mt-1">Configure item specifications and supplier details.</p>
          <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all"><X size={20} /></button>
        </div>

        <div className="modal-body-premium space-y-6">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            <button className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'Sales' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`} onClick={() => setFormData({...formData, type: 'Sales'})}>Sales (Physical)</button>
            <button className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'Service' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`} onClick={() => setFormData({...formData, type: 'Service'})}>Service (Labor)</button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="form-label-premium">Item Name</label>
              <input type="text" placeholder="e.g. SSD 1TB NVMe" className={`form-input-premium ${errors.name ? 'border-rose-500' : ''}`} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="form-label-premium">Category</label>
              <input type="text" placeholder="e.g. Storage" className={`form-input-premium ${errors.category ? 'border-rose-500' : ''}`} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>

            <div>
              <label className="form-label-premium">Supplier / Vendor</label>
              <input type="text" placeholder="e.g. CloudCore Systems" className="form-input-premium" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
            </div>

            <div>
              <label className="form-label-premium">Purchase Cost (₹)</label>
              <input type="number" placeholder="0.00" className="form-input-premium" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} />
            </div>

            <div>
              <label className="form-label-premium">Selling Price (₹)</label>
              <input type="number" placeholder="0.00" className={`form-input-premium ${errors.sellingPrice ? 'border-rose-500' : ''}`} value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
            </div>
          </div>

          {formData.type === 'Sales' && (
            <Motion.div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 grid grid-cols-2 gap-6" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <div>
                <label className="form-label-premium text-indigo-600">Current Stock *</label>
                <input type="number" placeholder="0" className={`form-input-premium border-indigo-200 ${errors.currentStock ? 'border-rose-500' : ''}`} value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})} />
              </div>
              <div>
                <label className="form-label-premium text-indigo-600">Min Alert Level</label>
                <input type="number" placeholder="5" className="form-input-premium border-indigo-200" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} />
              </div>
            </Motion.div>
          )}
        </div>

        <div className="modal-footer-premium">
          <button onClick={onClose} className="h-12 px-6 text-slate-400 text-xs font-black uppercase tracking-widest">Discard</button>
          <button onClick={handleSave} className="h-12 px-10 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95">Complete Enrollment</button>
        </div>
      </Motion.div>
    </div>
  );
};

export default InventoryManagement;
