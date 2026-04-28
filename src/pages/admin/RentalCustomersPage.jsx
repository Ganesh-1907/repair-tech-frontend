import React, { useMemo, useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Download, 
  RefreshCcw, 
  Eye, 
  Edit2, 
  Trash2, 
  MapPin, 
  Briefcase, 
  Receipt, 
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  Moon,
  Sun,
  FileText,
  ClipboardCheck,
  Printer,
  Send,
  Copy,
  ArrowRight,
  Settings,
  Check,
  Building2,
  UserCheck,
  DollarSign,
  Monitor,
  Zap,
  ShieldCheck,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RentalCustomerManagement.css';
import './RentalDocuments.css';

const RentalCustomersPage = () => {
  // --- Local State ---
  const [customers, setCustomers] = useState([
    { id: 'RC-1001', type: 'Corporate', name: 'Global Tech Solutions', person1: 'Rahul Verma', person2: 'Priya Shah', gst: '23ABCDE1234F1Z5', phone: '9876543210', email: 'ops@globaltech.com', locations: 2, status: 'Active' },
    { id: 'RC-1002', type: 'Individual', name: 'Nikita Sharma', person1: 'Nikita Sharma', person2: '—', gst: '—', phone: '9988776655', email: 'nikita@example.com', locations: 1, status: 'Active' },
    { id: 'RC-1003', type: 'Corporate', name: 'Stellar Bank', person1: 'Amit Singh', person2: 'Neha Rao', gst: '27ABCDE5678G2Z9', phone: '9876501234', email: 'admin@stellarbank.com', locations: 4, status: 'Pending' },
    { id: 'RC-1004', type: 'Corporate', name: 'Apex Retail', person1: 'Karan Mehta', person2: 'Riya Kapoor', gst: '29ABCDE8910H3Z1', phone: '9867543210', email: 'support@apexretail.com', locations: 3, status: 'Inactive' },
  ]);

  const [documents, setDocuments] = useState({
    quotations: [
      { id: 'QTN-260401', customerId: 'RC-1001', customerName: 'Global Tech Solutions', date: '2026-04-20', status: 'Sent', total: 45000 },
      { id: 'QTN-260402', customerId: 'RC-1002', customerName: 'Nikita Sharma', date: '2026-04-22', status: 'Draft', total: 12500 }
    ],
    corporateAgreements: [
      { id: 'AGR-C-1001', customerId: 'RC-1001', customerName: 'Global Tech Solutions', date: '2026-04-21', status: 'Accepted' }
    ],
    individualAgreements: [
      { id: 'AGR-I-1002', customerId: 'RC-1002', customerName: 'Nikita Sharma', date: '2026-04-23', status: 'Draft' }
    ]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [headerSearch, setHeaderSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [activeDocTab, setActiveDocTab] = useState('Quotations');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('Add'); // Add, Edit, View
  const [currentCustomer, setCurrentCustomer] = useState(null);
  
  // Doc Builder Modals
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [agreementType, setAgreementType] = useState('Corporate'); // Corporate, Individual
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);

  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isContractsModalOpen, setIsContractsModalOpen] = useState(false);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // --- Helpers ---
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const globalMatch = 
        c.name.toLowerCase().includes(headerSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(headerSearch.toLowerCase()) ||
        c.phone.includes(headerSearch) ||
        c.email.toLowerCase().includes(headerSearch.toLowerCase()) ||
        c.gst.toLowerCase().includes(headerSearch.toLowerCase());

      const filterMatch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.gst.toLowerCase().includes(searchTerm.toLowerCase());

      const typeMatch = typeFilter === 'All Types' || c.type === typeFilter;
      const statusMatch = statusFilter === 'All Status' || c.status === statusFilter;

      return globalMatch && filterMatch && typeMatch && statusMatch;
    });
  }, [customers, searchTerm, headerSearch, typeFilter, statusFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setHeaderSearch('');
    setTypeFilter('All Types');
    setStatusFilter('All Status');
    addToast('Filters reset successfully', 'info');
  };

  const handleExport = () => {
    addToast('Exporting customer data...');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this customer?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      addToast('Customer deleted');
    }
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    if (modalMode === 'Add') {
      const newId = `RC-${1000 + customers.length + 1}`;
      setCustomers(prev => [...prev, { ...data, id: newId, locations: parseInt(data.locations) || 0 }]);
      addToast('Customer added');
    } else {
      setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? { ...c, ...data } : c));
      addToast('Customer updated');
    }
    setIsModalOpen(false);
  };

  // --- Quotation Logic ---
  const initQuotation = (customer = null) => {
    const qtn = {
      id: `QTN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      customerType: customer?.type || 'Corporate',
      customerName: customer?.name || '',
      companyName: customer?.name || '',
      address: 'Registered Address, City, PIN',
      contactPerson: customer?.person1 || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      productName: 'Laptop i5',
      deviceType: 'Laptop',
      model: 'ThinkPad E14',
      specs: 'i5, 16GB RAM, 512GB SSD',
      serial: '',
      qty: 1,
      rentMonth: 1500,
      rentDay: 150,
      minPeriod: 3,
      deposit: 3000,
      installation: 500,
      delivery: 200,
      gstPercent: 18,
      paymentTerms: 'Advance',
      slaTime: 4,
      terms: 'The rental charges are exclusive of GST. Security deposit is refundable.',
      paymentPolicy: 'Advance payment required for first month.',
      deliveryPolicy: 'Delivery within 24 hours of confirmation.',
      supportPolicy: 'Technical support available 24/7.',
      status: 'Draft'
    };
    setCurrentDoc(qtn);
    setIsQuotationModalOpen(true);
  };

  const saveQuotation = () => {
    setDocuments(prev => ({
      ...prev,
      quotations: [currentDoc, ...prev.quotations.filter(q => q.id !== currentDoc.id)]
    }));
    addToast('Quotation saved');
    setIsQuotationModalOpen(false);
  };

  // --- Agreement Logic ---
  const initAgreement = (type, customer = null) => {
    setAgreementType(type);
    const agr = {
      agreement_no: `${type === 'Corporate' ? 'AGR-C' : 'AGR-I'}-${Math.floor(100000 + Math.random() * 900000)}`,
      agreement_date: new Date().toISOString().split('T')[0],
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      jurisdiction_city: 'Indore',
      company_name: customer?.name || '',
      company_address: 'Main Industrial Area, Plot 12, City',
      gst: customer?.gst || '',
      auth_person: customer?.person1 || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      provider_name: 'REPAIRBOY SERVICES PVT LTD',
      provider_address: 'Plot 42, Tech Hub, City',
      provider_auth: 'System Admin',
      provider_phone: '+91 9876543210',
      provider_email: 'billing@repairboy.com',
      devices: [{ type: 'Printer', model: 'HP M126nw', specs: 'B/W, WiFi', serial: 'SN-XJ202', qty: 1, rent: 2500, deposit: 5000 }],
      billing_cycle: 'Monthly',
      payment_due_days: 7,
      min_commitment: 5000,
      installation: 1500,
      delivery: 500,
      gst_percent: 18,
      late_fee: 2,
      a4_bw: 0.50,
      a4_color: 4.50,
      a3_bw: 1.20,
      a3_color: 8.00,
      sla_time: 4,
      downtime_limit: 24,
      replacement_policy: 'Replacement provided if repair takes > 48 hrs.',
      maintenance_coverage: 'All parts and toner included.',
      client_sig_name: customer?.person1 || '',
      client_designation: 'Director',
      provider_sig_name: 'Regional Manager',
      provider_designation: 'Provider Manager',
      witness1: '—',
      witness2: '—',
      status: 'Draft',
      // Clauses
      scope_clause: 'The Service Provider agrees to supply and maintain the equipment.',
      rental_clause: 'Monthly rental shall be paid in advance.',
      usage_clause: 'Usage charges based on meter reading.',
      termination_clause: '30 days notice required.',
      liability_clause: 'Client is responsible for physical damages.',
      jurisdiction_clause: 'Subject to jurisdiction of city courts.'
    };
    setCurrentDoc(agr);
    setIsAgreementModalOpen(true);
    setIsTypeSelectorOpen(false);
  };

  const saveAgreement = () => {
    const category = agreementType === 'Corporate' ? 'corporateAgreements' : 'individualAgreements';
    const docData = { 
      id: currentDoc.agreement_no, 
      customerName: currentDoc.company_name, 
      date: currentDoc.agreement_date, 
      status: 'Draft' 
    };
    setDocuments(prev => ({
      ...prev,
      [category]: [docData, ...prev[category].filter(a => a.id !== docData.id)]
    }));
    addToast('Agreement saved');
    setIsAgreementModalOpen(false);
  };

  return (
    <div className={`customer-page ${isDarkMode ? 'dark' : ''}`}>
      {/* --- Global Header --- */}
      <header className="customer-header no-print">
        <div className="customer-header-left">
          <h1>Customer Management</h1>
          <p>Manage customer profiles, contracts, and documents.</p>
        </div>
        <div className="customer-header-actions">
          <div className="relative">
            <input type="text" className="customer-search" placeholder="Search..." value={headerSearch} onChange={e => setHeaderSearch(e.target.value)} />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
          <button className="icon-button" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="admin-profile-chip">
            <div className="admin-avatar">A</div>
            <div className="admin-info"><span>Admin User</span><small>System Admin</small></div>
          </div>
        </div>
      </header>

      {/* --- Breadcrumb & Actions --- */}
      <section className="breadcrumb-card no-print">
        <div className="breadcrumb">
          <span>Admin</span> <ChevronRight size={14} /> <span>Rental Management</span> <ChevronRight size={14} /> <strong>Customers</strong>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-extrabold m-0">Customer Management</h2>
            <p className="text-slate-500 text-sm m-0 mt-1">Repository of rental clients and their documents.</p>
          </div>
          <div className="flex gap-3">
            <button className="secondary-button" onClick={() => initQuotation()}><Plus size={18} /> Add Quotation</button>
            <button className="secondary-button" onClick={() => setIsTypeSelectorOpen(true)}><Plus size={18} /> Add Agreement</button>
            <button className="primary-button" onClick={() => { setModalMode('Add'); setCurrentCustomer(null); setIsModalOpen(true); }}><Plus size={18} /> Add Customer</button>
          </div>
        </div>
      </section>

      {/* --- Filters --- */}
      <section className="filter-card no-print">
        <div className="relative flex-1 min-w-[280px]">
          <input type="text" className="filter-search" placeholder="Search customer, phone, GST..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option>All Types</option><option>Corporate</option><option>Individual</option>
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All Status</option><option>Active</option><option>Pending</option><option>Inactive</option>
        </select>
        <button className="icon-button" onClick={resetFilters} title="Reset"><RefreshCcw size={18} /></button>
      </section>

      {/* --- Customer Table --- */}
      <section className="table-card no-print">
        <div className="table-toolbar">
          <h3 className="table-title m-0">Customer Directory</h3>
          <span className="text-xs font-bold text-slate-400 uppercase">{filteredCustomers.length} Found</span>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Type</th><th>Customer Name</th><th>Auth Person</th><th>GST</th><th>Phone</th><th>Status</th><th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs font-black text-indigo-600">{c.id}</td>
                  <td><span className={`type-badge ${c.type === 'Corporate' ? 'type-corporate' : 'type-individual'}`}>{c.type}</span></td>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">{c.name.charAt(0)}</div>
                      <div className="font-bold text-slate-800">{c.name}</div>
                    </div>
                  </td>
                  <td className="text-slate-600">{c.person1}</td>
                  <td className="font-mono text-xs text-slate-500">{c.gst}</td>
                  <td className="font-bold text-slate-700">{c.phone}</td>
                  <td><span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td className="text-center">
                    <div className="actions-menu">
                      <button className="icon-button mx-auto" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === c.id ? null : c.id); }}>
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === c.id && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="menu-panel">
                          <button className="menu-item" onClick={() => initQuotation(c)}><FileText size={14} /> Create Quotation</button>
                          <button className="menu-item" onClick={() => initAgreement(c.type, c)}><ClipboardCheck size={14} /> Create Agreement</button>
                          <button className="menu-item" onClick={() => { setActiveDocTab(`${c.type} Agreements`); document.getElementById('documents-section').scrollIntoView({behavior:'smooth'}); setOpenMenuId(null); }}><Eye size={14} /> View Documents</button>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button className="menu-item" onClick={() => { setModalMode('Edit'); setCurrentCustomer(c); setIsModalOpen(true); setOpenMenuId(null); }}><Edit2 size={14} /> Edit</button>
                          <button className="menu-item danger" onClick={() => handleDelete(c.id)}><Trash2 size={14} /> Delete</button>
                        </motion.div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Customer Documents Section --- */}
      <section id="documents-section" className="documents-card no-print">
        <div className="documents-toolbar">
          <div>
            <h3 className="text-xl font-extrabold m-0">Customer Documents</h3>
            <p className="text-slate-500 text-sm m-0">Create quotations, rental agreements, and printable forms.</p>
          </div>
          <div className="flex gap-3">
            <button className="secondary-button" onClick={() => initQuotation()}><Plus size={18} /> Add Quotation</button>
            <button className="secondary-button" onClick={() => setIsTypeSelectorOpen(true)}><Plus size={18} /> Add Agreement</button>
            <button className="icon-button" title="Export"><Download size={18} /></button>
          </div>
        </div>

        <div className="documents-tabs">
          {['Quotations', 'Corporate Agreements', 'Individual Agreements'].map(tab => (
            <button key={tab} className={`documents-tab ${activeDocTab === tab ? 'active' : ''}`} onClick={() => setActiveDocTab(tab)}>{tab}</button>
          ))}
        </div>

        <div className="data-table-wrapper">
          <table className="documents-table">
            <thead>
              <tr><th>Doc No</th><th>Type</th><th>Customer</th><th>Created Date</th><th>Status</th><th className="text-center">Actions</th></tr>
            </thead>
            <tbody>
              {documents[activeDocTab === 'Quotations' ? 'quotations' : activeDocTab === 'Corporate Agreements' ? 'corporateAgreements' : 'individualAgreements'].map(doc => (
                <tr key={doc.id}>
                  <td className="font-mono text-xs font-black text-indigo-600">{doc.id}</td>
                  <td>{activeDocTab.split(' ')[0]}</td>
                  <td className="font-bold">{doc.customerName}</td>
                  <td>{doc.date}</td>
                  <td><span className={`status-badge status-${doc.status.toLowerCase()}`}>{doc.status}</span></td>
                  <td className="text-center">
                    <div className="flex justify-center gap-2">
                      <button className="icon-button" onClick={() => activeDocTab === 'Quotations' ? initQuotation() : initAgreement(activeDocTab.split(' ')[0])}><Edit2 size={14} /></button>
                      <button className="icon-button" onClick={() => window.print()}><Printer size={14} /></button>
                      <button className="icon-button" onClick={() => addToast('Duplicate ready')}><Copy size={14} /></button>
                      <button className="icon-button danger" onClick={() => addToast('Deleted')}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Quotation Builder Modal --- */}
      <AnimatePresence>
        {isQuotationModalOpen && (
          <div className="modal-overlay" onClick={() => setIsQuotationModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="document-modal" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 no-print">
                <h2 className="!m-0">Create Rental Quotation</h2>
                <div className="flex gap-3">
                  <button className="secondary-button" onClick={() => setIsQuotationModalOpen(false)}>Cancel</button>
                  <button className="primary-button !bg-emerald-600" onClick={saveQuotation}><Check size={18} /> Save Draft</button>
                </div>
              </div>
              <div className="document-form-layout">
                <div className="document-form-panel no-print">
                  <div className="document-section-card">
                    <h3><User size={18} /> Customer Details</h3>
                    <div className="document-form-grid">
                      <div className="document-field"><label>Customer Name</label><input value={currentDoc.customerName} onChange={e => setCurrentDoc({...currentDoc, customerName: e.target.value})} /></div>
                      <div className="document-field"><label>Company Name</label><input value={currentDoc.companyName} onChange={e => setCurrentDoc({...currentDoc, companyName: e.target.value})} /></div>
                      <div className="document-field full"><label>Address</label><input value={currentDoc.address} onChange={e => setCurrentDoc({...currentDoc, address: e.target.value})} /></div>
                    </div>
                  </div>
                  <div className="document-section-card">
                    <h3><Package size={18} /> Product Details</h3>
                    <div className="document-form-grid">
                      <div className="document-field"><label>Model</label><input value={currentDoc.model} onChange={e => setCurrentDoc({...currentDoc, model: e.target.value})} /></div>
                      <div className="document-field"><label>Quantity</label><input type="number" value={currentDoc.qty} onChange={e => setCurrentDoc({...currentDoc, qty: e.target.value})} /></div>
                    </div>
                  </div>
                  <div className="document-section-card">
                    <h3><DollarSign size={18} /> Rental Pricing</h3>
                    <div className="document-form-grid">
                      <div className="document-field"><label>Rent / Month</label><input type="number" value={currentDoc.rentMonth} onChange={e => setCurrentDoc({...currentDoc, rentMonth: e.target.value})} /></div>
                      <div className="document-field"><label>Security Deposit</label><input type="number" value={currentDoc.deposit} onChange={e => setCurrentDoc({...currentDoc, deposit: e.target.value})} /></div>
                    </div>
                  </div>
                  <div className="document-section-card">
                    <h3><Settings size={18} /> Editable Terms</h3>
                    <div className="document-field full"><label>Terms & Conditions</label><textarea value={currentDoc.terms} onChange={e => setCurrentDoc({...currentDoc, terms: e.target.value})} /></div>
                  </div>
                </div>
                <div className="document-preview-panel">
                  <div className="quotation-preview-paper">
                    <h1>RENTAL QUOTATION</h1>
                    <div className="flex justify-between mb-8">
                      <div><strong>To:</strong><br/>{currentDoc.companyName}<br/>{currentDoc.address}</div>
                      <div className="text-right"><strong>No:</strong> {currentDoc.id}<br/><strong>Date:</strong> {currentDoc.date}</div>
                    </div>
                    <table>
                      <thead><tr><th>Product</th><th>Description</th><th>Qty</th><th>Rent (Month)</th></tr></thead>
                      <tbody>
                        <tr><td>{currentDoc.productName}</td><td>{currentDoc.model}<br/><small>{currentDoc.specs}</small></td><td>{currentDoc.qty}</td><td>₹{currentDoc.rentMonth}</td></tr>
                      </tbody>
                    </table>
                    <div className="my-6">
                      <p>Security Deposit: <strong>₹{currentDoc.deposit}</strong></p>
                      <p>Minimum Period: <strong>{currentDoc.minPeriod} Months</strong></p>
                      <p>Payment Terms: <strong>{currentDoc.paymentTerms}</strong></p>
                    </div>
                    <div className="mt-8 border-t pt-4"><h3>Terms & Conditions</h3><p className="text-sm whitespace-pre-wrap">{currentDoc.terms}</p></div>
                    <div className="signature-block"><div className="sig-line">Authorized Signatory</div></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Agreement Builder Modal --- */}
      <AnimatePresence>
        {isAgreementModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAgreementModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="document-modal" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 no-print">
                <h2 className="!m-0">Create Rental Agreement ({agreementType})</h2>
                <div className="flex gap-3">
                  <button className="secondary-button" onClick={() => setIsAgreementModalOpen(false)}>Cancel</button>
                  <button className="primary-button" onClick={() => window.print()}><Printer size={18} /> Print</button>
                  <button className="primary-button !bg-emerald-600" onClick={saveAgreement}><Check size={18} /> Save & Close</button>
                </div>
              </div>
              <div className="document-form-layout">
                <div className="document-form-panel no-print">
                  <div className="document-section-card">
                    <h3><Building2 size={18} /> Client Details</h3>
                    <div className="document-form-grid">
                      <div className="document-field full"><label>Company Name</label><input value={currentDoc.company_name} onChange={e => setCurrentDoc({...currentDoc, company_name: e.target.value})} /></div>
                      <div className="document-field full"><label>Address</label><textarea value={currentDoc.company_address} onChange={e => setCurrentDoc({...currentDoc, company_address: e.target.value})} /></div>
                    </div>
                  </div>
                  <div className="document-section-card">
                    <h3><Monitor size={18} /> Equipment Details</h3>
                    <button className="secondary-button !h-8 !px-3 !text-xs mb-4" onClick={() => setCurrentDoc({...currentDoc, devices: [...currentDoc.devices, {type:'Printer', model:'', specs:'', qty:1, rent:0}]})}><Plus size={14}/> Add Device</button>
                    <table className="device-table-editor">
                      <thead><tr><th>Model</th><th>Qty</th><th>Rent</th><th></th></tr></thead>
                      <tbody>
                        {currentDoc.devices.map((d, i) => (
                          <tr key={i}>
                            <td><input value={d.model} onChange={e => { const nd = [...currentDoc.devices]; nd[i].model = e.target.value; setCurrentDoc({...currentDoc, devices: nd}); }} /></td>
                            <td><input type="number" value={d.qty} onChange={e => { const nd = [...currentDoc.devices]; nd[i].qty = e.target.value; setCurrentDoc({...currentDoc, devices: nd}); }} /></td>
                            <td><input type="number" value={d.rent} onChange={e => { const nd = [...currentDoc.devices]; nd[i].rent = e.target.value; setCurrentDoc({...currentDoc, devices: nd}); }} /></td>
                            <td><button onClick={() => setCurrentDoc({...currentDoc, devices: currentDoc.devices.filter((_, idx) => idx !== i)})}><Trash2 size={14}/></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="document-section-card">
                    <h3><ShieldCheck size={18} /> Editable Clauses</h3>
                    <div className="agreement-field full"><label>Scope of Agreement</label><textarea value={currentDoc.scope_clause} onChange={e => setCurrentDoc({...currentDoc, scope_clause: e.target.value})} /></div>
                    <div className="agreement-field full"><label>Termination Clause</label><textarea value={currentDoc.termination_clause} onChange={e => setCurrentDoc({...currentDoc, termination_clause: e.target.value})} /></div>
                  </div>
                </div>
                <div className="document-preview-panel">
                  <div className="agreement-preview-paper">
                    <h1>RENTAL AGREEMENT ({agreementType.toUpperCase()})</h1>
                    <p>This agreement is made on <strong>{currentDoc.agreement_date}</strong></p>
                    <div className="grid grid-cols-2 gap-8 my-8">
                      <div><strong>Client:</strong><br/>{currentDoc.company_name}<br/>{currentDoc.company_address}</div>
                      <div><strong>Provider:</strong><br/>{currentDoc.provider_name}<br/>{currentDoc.provider_address}</div>
                    </div>
                    <h2>1. Scope</h2><p>{currentDoc.scope_clause}</p>
                    <h2>2. Equipment</h2>
                    <table>
                      <thead><tr><th>Type</th><th>Model</th><th>Qty</th><th>Rent</th></tr></thead>
                      <tbody>
                        {currentDoc.devices.map((d, i) => (
                          <tr key={i}><td>{d.type}</td><td>{d.model}</td><td>{d.qty}</td><td>₹{d.rent}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <h2>3. Termination</h2><p>{currentDoc.termination_clause}</p>
                    <div className="signature-block"><div className="sig-line">For Client</div><div className="sig-line">For Provider</div></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Agreement Type Selector --- */}
      <AnimatePresence>
        {isTypeSelectorOpen && (
          <div className="modal-overlay" onClick={() => setIsTypeSelectorOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="modal-card !w-[400px]" onClick={e => e.stopPropagation()}>
              <h2 className="text-center mb-6">Select Agreement Type</h2>
              <div className="flex flex-col gap-4">
                <button className="primary-button !h-14 !justify-center" onClick={() => initAgreement('Corporate')}><Building2 size={20} /> Corporate Agreement</button>
                <button className="secondary-button !h-14 !justify-center" onClick={() => initAgreement('Individual')}><User size={20} /> Individual Agreement</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Existing Customer Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal-card" onClick={e => e.stopPropagation()}>
              <h2>{modalMode} Customer</h2>
              <form onSubmit={handleSaveCustomer}>
                <div className="form-grid">
                  <div className="form-field"><label>Type</label><select name="type" defaultValue={currentCustomer?.type}><option>Corporate</option><option>Individual</option></select></div>
                  <div className="form-field"><label>Name</label><input name="name" required defaultValue={currentCustomer?.name} /></div>
                  <div className="form-field"><label>Phone</label><input name="phone" required defaultValue={currentCustomer?.phone} /></div>
                  <div className="form-field"><label>Email</label><input name="email" required defaultValue={currentCustomer?.email} /></div>
                </div>
                <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="submit" className="primary-button">Save</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Toasts --- */}
      <div className="fixed top-6 right-6 z-[2000] flex flex-col gap-3">
        <AnimatePresence>{toasts.map(t => (
          <motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="toast">
            {t.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-sky-400" />} {t.message}
          </motion.div>
        ))}</AnimatePresence>
      </div>
    </div>
  );
};

export default RentalCustomersPage;
