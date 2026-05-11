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
  FileText,
  ClipboardCheck,
  Printer,
  Send,
  Copy,
  ArrowRight,  Check,
  Building2,
  UserCheck,  Monitor,
  Zap,
  ShieldCheck,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RentalCustomerManagement.css';
import './RentalDocuments.css';
import { api } from '../../services/apiClient';

const DEVICE_OPTIONS = ['Desktop', 'Laptop', 'Printer', 'CCTV', 'Server'];

const emptyAuthorizedPerson = () => ({
  name: '',
  designation: '',
  phone: '',
  email: '',
  idProofName: '',
});

const emptyLocation = () => ({
  id: `LOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  locationName: '',
  address: '',
  contactPerson: '',
  phone: '',
  email: '',
  remarks: '',
});

const emptyDevice = () => ({
  id: `DEV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  device: '',
  type: '',
  brand: '',
  model: '',
  serialNumber: '',
  rentalStartDate: '',
  monthlyRent: '',
  locationId: '',
  status: 'Active',
  remarks: '',
});

const RentalCustomersPage = () => {
  // --- Local State ---
  const [customers, setCustomers] = useState([]);

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
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [activeDocTab, setActiveDocTab] = useState('Quotations');
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('Add'); // Add, Edit, View
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState('profile');
  const [customerFormErrors, setCustomerFormErrors] = useState({});
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    customerType: 'Corporate',
    gstNumber: '',
    billingAddress: '',
    shippingAddress: '',
    city: '',
    state: '',
    pincode: '',
    primaryContactNumber: '',
    alternateContactNumber: '',
    email: '',
    notes: '',
    person1: emptyAuthorizedPerson(),
    person2: emptyAuthorizedPerson(),
    locations: [emptyLocation()],
    devices: [emptyDevice()],
    status: 'Active',
  });
  
  // Doc Builder Modals
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

  const loadCustomers = async () => {
    const rows = await api.list('rentalCustomers');
    setCustomers(rows.map((row) => ({
      id: row.id,
      type: row.customerType || 'Corporate',
      name: row.companyName || row.customerName || '',
      person1: row.authorizedPerson1 || row.customerName || '',
      person2: row.authorizedPerson2 || '-',
      gst: row.gstNumber || '-',
      phone: row.contactNumber || '',
      email: row.email || '',
      address: row.address || '',
      locations: Array.isArray(row.locations) ? row.locations.length : Number(row.locations || 0),
      status: row.status || 'Active',
      raw: row,
    })));
  };

  useEffect(() => {
    loadCustomers().catch(() => {
      addToast('Failed to load customers', 'info');
    });
  }, []);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const filterMatch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.gst.toLowerCase().includes(searchTerm.toLowerCase());

      const typeMatch = typeFilter === 'All Types' || c.type === typeFilter;
      const statusMatch = statusFilter === 'All Status' || c.status === statusFilter;

      return filterMatch && typeMatch && statusMatch;
    });
  }, [customers, searchTerm, typeFilter, statusFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('All Types');
    setStatusFilter('All Status');
    addToast('Filters reset successfully', 'info');
  };

  const handleExport = () => {
    addToast('Exporting customer data...');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this customer?')) {
      api.remove('rentalCustomers', id)
        .then(() => {
          addToast('Customer deleted');
          return loadCustomers();
        })
        .catch(() => addToast('Failed to delete customer', 'info'));
    }
  };

  const openCustomerModal = (mode, customer = null) => {
    setModalMode(mode);
    setCurrentCustomer(customer);
    setActiveCustomerTab('profile');
    setCustomerFormErrors({});
    if (!customer) {
      setCustomerForm({
        companyName: '',
        customerType: 'Corporate',
        gstNumber: '',
        billingAddress: '',
        shippingAddress: '',
        city: '',
        state: '',
        pincode: '',
        primaryContactNumber: '',
        alternateContactNumber: '',
        email: '',
        notes: '',
        person1: emptyAuthorizedPerson(),
        person2: emptyAuthorizedPerson(),
        locations: [emptyLocation()],
        devices: [emptyDevice()],
        status: 'Active',
      });
    } else {
      const raw = customer.raw || {};
      const locations = Array.isArray(raw.locations) && raw.locations.length ? raw.locations : [emptyLocation()];
      const devices = Array.isArray(raw.devices) && raw.devices.length ? raw.devices : [emptyDevice()];
      const person1 = raw.authorizedPersons?.[0] || {
        ...emptyAuthorizedPerson(),
        name: raw.authorizedPerson1 || '',
      };
      const person2 = raw.authorizedPersons?.[1] || {
        ...emptyAuthorizedPerson(),
        name: raw.authorizedPerson2 || '',
      };
      setCustomerForm({
        companyName: raw.companyName || raw.customerName || customer.name || '',
        customerType: raw.customerType || customer.type || 'Corporate',
        gstNumber: raw.gstNumber || '',
        billingAddress: raw.billingAddress || raw.address || '',
        shippingAddress: raw.shippingAddress || '',
        city: raw.city || '',
        state: raw.state || '',
        pincode: raw.pincode || '',
        primaryContactNumber: raw.contactNumber || customer.phone || '',
        alternateContactNumber: raw.alternateContactNumber || '',
        email: raw.email || customer.email || '',
        notes: raw.notes || '',
        person1: { ...emptyAuthorizedPerson(), ...person1 },
        person2: { ...emptyAuthorizedPerson(), ...person2 },
        locations: locations.map((loc) => ({ ...emptyLocation(), ...loc })),
        devices: devices.map((dev) => ({
          ...emptyDevice(),
          ...dev,
          device: dev.device || dev.deviceType || '',
          type: dev.type || '',
        })),
        status: raw.status || customer.status || 'Active',
      });
    }
    setIsModalOpen(true);
  };

  const validateCustomerForm = () => {
    const nextErrors = {};
    if (!customerForm.companyName.trim()) nextErrors.companyName = 'Company / customer name is required.';
    if (!customerForm.customerType.trim()) nextErrors.customerType = 'Customer type is required.';
    if (!customerForm.billingAddress.trim()) nextErrors.billingAddress = 'Billing address is required.';
    if (!customerForm.city.trim()) nextErrors.city = 'City is required.';
    if (!customerForm.state.trim()) nextErrors.state = 'State is required.';
    if (!customerForm.pincode.trim()) nextErrors.pincode = 'Pincode is required.';
    if (!customerForm.primaryContactNumber.trim()) nextErrors.primaryContactNumber = 'Primary contact number is required.';
    if (!customerForm.email.trim()) nextErrors.email = 'Email is required.';
    if (!customerForm.person1.name.trim()) nextErrors.person1Name = 'Authorized Person 1 name is required.';
    if (!customerForm.person1.phone.trim()) nextErrors.person1Phone = 'Authorized Person 1 phone is required.';

    customerForm.locations.forEach((location, index) => {
      if (!location.locationName.trim()) nextErrors[`locationName-${index}`] = 'Location name is required.';
      if (!location.address.trim()) nextErrors[`locationAddress-${index}`] = 'Location address is required.';
    });

    setCustomerFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetAfterSave = () => {
    setCustomerForm({
      companyName: '',
      customerType: 'Corporate',
      gstNumber: '',
      billingAddress: '',
      shippingAddress: '',
      city: '',
      state: '',
      pincode: '',
      primaryContactNumber: '',
      alternateContactNumber: '',
      email: '',
      notes: '',
      person1: emptyAuthorizedPerson(),
      person2: emptyAuthorizedPerson(),
      locations: [emptyLocation()],
      devices: [emptyDevice()],
      status: 'Active',
    });
    setCustomerFormErrors({});
    setActiveCustomerTab('profile');
  };

  const handleSaveCustomer = async (saveAndAddAnother = false) => {
    if (!validateCustomerForm()) {
      addToast('Please complete all required fields', 'info');
      return;
    }
    const payload = {
      customerType: customerForm.customerType,
      companyName: customerForm.companyName,
      customerName: customerForm.companyName,
      authorizedPerson1: customerForm.person1.name,
      authorizedPerson2: customerForm.person2.name,
      gstNumber: customerForm.gstNumber,
      address: customerForm.billingAddress,
      billingAddress: customerForm.billingAddress,
      shippingAddress: customerForm.shippingAddress,
      city: customerForm.city,
      state: customerForm.state,
      pincode: customerForm.pincode,
      contactNumber: customerForm.primaryContactNumber,
      alternateContactNumber: customerForm.alternateContactNumber,
      email: customerForm.email,
      notes: customerForm.notes,
      authorizedPersons: [customerForm.person1, customerForm.person2].filter((person) => person.name.trim() || person.phone.trim()),
      locations: customerForm.locations,
      devices: customerForm.devices.filter((device) => (
        String(device.device || '').trim()
        || String(device.type || '').trim()
        || String(device.brand || '').trim()
        || String(device.model || '').trim()
        || String(device.serialNumber || '').trim()
        || String(device.rentalStartDate || '').trim()
        || String(device.monthlyRent || '').trim()
        || String(device.locationId || '').trim()
        || String(device.remarks || '').trim()
      )),
      status: customerForm.status || 'Active',
    };
    try {
      if (modalMode === 'Add') {
        await api.create('rentalCustomers', payload);
        addToast('Customer added');
      } else if (currentCustomer?.id) {
        await api.update('rentalCustomers', currentCustomer.id, {
          ...(currentCustomer.raw || {}),
          ...payload,
          id: currentCustomer.id,
        });
        addToast('Customer updated');
      }
      await loadCustomers();
      if (saveAndAddAnother) {
        resetAfterSave();
        addToast('Ready to add another customer');
      } else {
        setIsModalOpen(false);
      }
    } catch (error) {
      addToast('Unable to save customer', 'info');
    }
  };

  const goToQuotations = (customer = null) => {
    if (!customer) {
      window.location.href = '/admin/rental/quotations';
      return;
    }
    const params = new URLSearchParams({
      customerId: customer.id || '',
      customerName: customer.name || '',
      contactPerson: customer.person1 || '',
      customerAddress: customer.address || '',
      gstin: customer.gst || '',
    });
    window.location.href = `/admin/rental/quotations?${params.toString()}`;
  };

  const openCustomerProcess = (customerId) => {
    window.location.href = `/admin/rental/customers/${customerId}`;
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
    <div className="customer-page">
      {/* --- Filters --- */}
      <section className="filter-card no-print">
        <div className="relative flex-1 min-w-[280px]">
          <input type="text" className="filter-search" placeholder="Search customer, phone, GST..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <button className="primary-button" onClick={() => openCustomerModal('Add')}><Plus size={18} /> Add Customer</button>
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
                      <button
                        type="button"
                        className="font-bold text-slate-800 hover:text-indigo-600"
                        onClick={() => openCustomerProcess(c.id)}
                        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        {c.name}
                      </button>
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
                          <button className="menu-item" onClick={() => goToQuotations(c)}><FileText size={14} /> Create Quotation</button>
                          <button className="menu-item" onClick={() => openCustomerProcess(c.id)}><Eye size={14} /> Open Process</button>
                          <button className="menu-item" onClick={() => initAgreement(c.type, c)}><ClipboardCheck size={14} /> Create Agreement</button>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button className="menu-item" onClick={() => { openCustomerModal('Edit', c); setOpenMenuId(null); }}><Edit2 size={14} /> Edit</button>
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
              <h2>{modalMode} Rental Customer</h2>
              <p>Build a complete customer profile, add authorized persons, locations, and assign devices in one place.</p>
              <div className="customer-form-tabs">
                <button type="button" className={`customer-form-tab ${activeCustomerTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveCustomerTab('profile')}>Customer Profile</button>
                <button type="button" className={`customer-form-tab ${activeCustomerTab === 'authorized' ? 'active' : ''}`} onClick={() => setActiveCustomerTab('authorized')}>Authorized Persons</button>
                <button type="button" className={`customer-form-tab ${activeCustomerTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveCustomerTab('locations')}>Locations</button>
                <button type="button" className={`customer-form-tab ${activeCustomerTab === 'devices' ? 'active' : ''}`} onClick={() => setActiveCustomerTab('devices')}>Devices</button>
              </div>

              <form onSubmit={(event) => { event.preventDefault(); handleSaveCustomer(false); }}>
                {activeCustomerTab === 'profile' && (
                  <div className="section-card">
                    <h3>Customer Profile</h3>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Company / Customer Name <span className="field-required">*</span></label>
                        <input value={customerForm.companyName} onChange={(e) => setCustomerForm((prev) => ({ ...prev, companyName: e.target.value }))} />
                        {customerFormErrors.companyName && <small className="field-error">{customerFormErrors.companyName}</small>}
                      </div>
                      <div className="form-field">
                        <label>Customer Type <span className="field-required">*</span></label>
                        <select value={customerForm.customerType} onChange={(e) => setCustomerForm((prev) => ({ ...prev, customerType: e.target.value }))}><option>Corporate</option><option>Individual</option></select>
                      </div>
                      <div className="form-field"><label>GST Number <span className="field-optional">(Optional)</span></label><input value={customerForm.gstNumber} onChange={(e) => setCustomerForm((prev) => ({ ...prev, gstNumber: e.target.value }))} /></div>
                      <div className="form-field"><label>Email Address <span className="field-required">*</span></label><input type="email" value={customerForm.email} onChange={(e) => setCustomerForm((prev) => ({ ...prev, email: e.target.value }))} />{customerFormErrors.email && <small className="field-error">{customerFormErrors.email}</small>}</div>
                      <div className="form-field full"><label>Billing Address <span className="field-required">*</span></label><textarea value={customerForm.billingAddress} onChange={(e) => setCustomerForm((prev) => ({ ...prev, billingAddress: e.target.value }))} />{customerFormErrors.billingAddress && <small className="field-error">{customerFormErrors.billingAddress}</small>}</div>
                      <div className="form-field full"><label>Shipping Address <span className="field-optional">(Optional)</span></label><textarea value={customerForm.shippingAddress} onChange={(e) => setCustomerForm((prev) => ({ ...prev, shippingAddress: e.target.value }))} /></div>
                      <div className="form-field"><label>City <span className="field-required">*</span></label><input value={customerForm.city} onChange={(e) => setCustomerForm((prev) => ({ ...prev, city: e.target.value }))} />{customerFormErrors.city && <small className="field-error">{customerFormErrors.city}</small>}</div>
                      <div className="form-field"><label>State <span className="field-required">*</span></label><input value={customerForm.state} onChange={(e) => setCustomerForm((prev) => ({ ...prev, state: e.target.value }))} />{customerFormErrors.state && <small className="field-error">{customerFormErrors.state}</small>}</div>
                      <div className="form-field"><label>Pincode <span className="field-required">*</span></label><input value={customerForm.pincode} onChange={(e) => setCustomerForm((prev) => ({ ...prev, pincode: e.target.value }))} />{customerFormErrors.pincode && <small className="field-error">{customerFormErrors.pincode}</small>}</div>
                      <div className="form-field"><label>Primary Contact Number <span className="field-required">*</span></label><input value={customerForm.primaryContactNumber} onChange={(e) => setCustomerForm((prev) => ({ ...prev, primaryContactNumber: e.target.value }))} />{customerFormErrors.primaryContactNumber && <small className="field-error">{customerFormErrors.primaryContactNumber}</small>}</div>
                      <div className="form-field"><label>Alternate Contact Number <span className="field-optional">(Optional)</span></label><input value={customerForm.alternateContactNumber} onChange={(e) => setCustomerForm((prev) => ({ ...prev, alternateContactNumber: e.target.value }))} /></div>
                      <div className="form-field full"><label>Notes / Remarks <span className="field-optional">(Optional)</span></label><textarea value={customerForm.notes} onChange={(e) => setCustomerForm((prev) => ({ ...prev, notes: e.target.value }))} /></div>
                    </div>
                  </div>
                )}
                {activeCustomerTab === 'authorized' && (
                  <div className="section-card section-stack">
                    <h3>Authorized Persons</h3>
                    <div className="mini-section-card">
                      <h4>Authorized Person 1 <span className="field-required">*</span></h4>
                      <div className="form-grid">
                        <div className="form-field"><label>Name <span className="field-required">*</span></label><input value={customerForm.person1.name} onChange={(e) => setCustomerForm((prev) => ({ ...prev, person1: { ...prev.person1, name: e.target.value } }))} />{customerFormErrors.person1Name && <small className="field-error">{customerFormErrors.person1Name}</small>}</div>
                        <div className="form-field"><label>Designation</label><input value={customerForm.person1.designation} onChange={(e) => setCustomerForm((prev) => ({ ...prev, person1: { ...prev.person1, designation: e.target.value } }))} /></div>
                        <div className="form-field"><label>Phone Number <span className="field-required">*</span></label><input value={customerForm.person1.phone} onChange={(e) => setCustomerForm((prev) => ({ ...prev, person1: { ...prev.person1, phone: e.target.value } }))} />{customerFormErrors.person1Phone && <small className="field-error">{customerFormErrors.person1Phone}</small>}</div>
                        <div className="form-field"><label>Email</label><input type="email" value={customerForm.person1.email} onChange={(e) => setCustomerForm((prev) => ({ ...prev, person1: { ...prev.person1, email: e.target.value } }))} /></div>
                        <div className="form-field full"><label>ID Proof Upload</label><input type="file" onChange={(e) => setCustomerForm((prev) => ({ ...prev, person1: { ...prev.person1, idProofName: e.target.files?.[0]?.name || '' } }))} /></div>
                      </div>
                    </div>
                    <div className="mini-section-card">
                      <h4>Authorized Person 2 <span className="field-optional">(Optional)</span></h4>
                      <div className="form-grid">
                        <div className="form-field"><label>Name <span className="field-optional">(Optional)</span></label><input value={customerForm.person2.name} onChange={(e) => setCustomerForm((prev) => ({ ...prev, person2: { ...prev.person2, name: e.target.value } }))} /></div>
                        <div className="form-field"><label>Designation</label><input value={customerForm.person2.designation} onChange={(e) => setCustomerForm((prev) => ({ ...prev, person2: { ...prev.person2, designation: e.target.value } }))} /></div>
                        <div className="form-field"><label>Phone Number</label><input value={customerForm.person2.phone} onChange={(e) => setCustomerForm((prev) => ({ ...prev, person2: { ...prev.person2, phone: e.target.value } }))} /></div>
                        <div className="form-field"><label>Email</label><input type="email" value={customerForm.person2.email} onChange={(e) => setCustomerForm((prev) => ({ ...prev, person2: { ...prev.person2, email: e.target.value } }))} /></div>
                        <div className="form-field full"><label>ID Proof Upload</label><input type="file" onChange={(e) => setCustomerForm((prev) => ({ ...prev, person2: { ...prev.person2, idProofName: e.target.files?.[0]?.name || '' } }))} /></div>
                      </div>
                    </div>
                  </div>
                )}
                {activeCustomerTab === 'locations' && (
                  <div className="section-card section-stack">
                    <div className="inline-section-header">
                      <h3>Customer Locations</h3>
                      <button type="button" className="secondary-button" onClick={() => setCustomerForm((prev) => ({ ...prev, locations: [...prev.locations, emptyLocation()] }))}><Plus size={16} /> Add Location</button>
                    </div>
                    {customerForm.locations.map((location, index) => (
                      <div className="mini-section-card" key={location.id}>
                        <div className="inline-section-header">
                          <h4>Location {index + 1}</h4>
                          {customerForm.locations.length > 1 && <button type="button" className="icon-button" onClick={() => setCustomerForm((prev) => ({ ...prev, locations: prev.locations.filter((row) => row.id !== location.id), devices: prev.devices.map((device) => (device.locationId === location.id ? { ...device, locationId: '' } : device)) }))}><Trash2 size={14} /></button>}
                        </div>
                        <div className="form-grid">
                          <div className="form-field"><label>Location Name <span className="field-required">*</span></label><input value={location.locationName} onChange={(e) => setCustomerForm((prev) => ({ ...prev, locations: prev.locations.map((row) => (row.id === location.id ? { ...row, locationName: e.target.value } : row)) }))} />{customerFormErrors[`locationName-${index}`] && <small className="field-error">{customerFormErrors[`locationName-${index}`]}</small>}</div>
                          <div className="form-field"><label>Contact Person</label><input value={location.contactPerson} onChange={(e) => setCustomerForm((prev) => ({ ...prev, locations: prev.locations.map((row) => (row.id === location.id ? { ...row, contactPerson: e.target.value } : row)) }))} /></div>
                          <div className="form-field"><label>Phone Number</label><input value={location.phone} onChange={(e) => setCustomerForm((prev) => ({ ...prev, locations: prev.locations.map((row) => (row.id === location.id ? { ...row, phone: e.target.value } : row)) }))} /></div>
                          <div className="form-field"><label>Email</label><input type="email" value={location.email} onChange={(e) => setCustomerForm((prev) => ({ ...prev, locations: prev.locations.map((row) => (row.id === location.id ? { ...row, email: e.target.value } : row)) }))} /></div>
                          <div className="form-field full"><label>Address <span className="field-required">*</span></label><textarea value={location.address} onChange={(e) => setCustomerForm((prev) => ({ ...prev, locations: prev.locations.map((row) => (row.id === location.id ? { ...row, address: e.target.value } : row)) }))} />{customerFormErrors[`locationAddress-${index}`] && <small className="field-error">{customerFormErrors[`locationAddress-${index}`]}</small>}</div>
                          <div className="form-field full"><label>Remarks</label><textarea value={location.remarks} onChange={(e) => setCustomerForm((prev) => ({ ...prev, locations: prev.locations.map((row) => (row.id === location.id ? { ...row, remarks: e.target.value } : row)) }))} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeCustomerTab === 'devices' && (
                  <div className="section-card section-stack">
                    <div className="inline-section-header">
                      <h3>Customer Devices</h3>
                      <button type="button" className="secondary-button" onClick={() => setCustomerForm((prev) => ({ ...prev, devices: [...prev.devices, emptyDevice()] }))}><Plus size={16} /> Add Device</button>
                    </div>
                    {customerForm.devices.map((device, index) => (
                      <div className="mini-section-card" key={device.id}>
                        <div className="inline-section-header">
                          <h4>Device {index + 1}</h4>
                          {customerForm.devices.length > 1 && <button type="button" className="icon-button" onClick={() => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.filter((row) => row.id !== device.id) }))}><Trash2 size={14} /></button>}
                        </div>
                        <div className="form-grid">
                          <div className="form-field"><label>Device <span className="field-optional">(Optional)</span></label><select value={device.device} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, device: e.target.value } : row)) }))}><option value="">Select device</option>{DEVICE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select>{customerFormErrors[`deviceType-${index}`] && <small className="field-error">{customerFormErrors[`deviceType-${index}`]}</small>}</div>
                          <div className="form-field"><label>Type <span className="field-optional">(Optional)</span></label><input value={device.type} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, type: e.target.value } : row)) }))} /></div>
                          <div className="form-field"><label>Brand</label><input value={device.brand} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, brand: e.target.value } : row)) }))} /></div>
                          <div className="form-field"><label>Model <span className="field-optional">(Optional)</span></label><input value={device.model} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, model: e.target.value } : row)) }))} />{customerFormErrors[`deviceModel-${index}`] && <small className="field-error">{customerFormErrors[`deviceModel-${index}`]}</small>}</div>
                          <div className="form-field"><label>Serial Number <span className="field-optional">(Optional)</span></label><input value={device.serialNumber} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, serialNumber: e.target.value } : row)) }))} />{customerFormErrors[`serialNumber-${index}`] && <small className="field-error">{customerFormErrors[`serialNumber-${index}`]}</small>}</div>
                          <div className="form-field"><label>Rental Start Date <span className="field-optional">(Optional)</span></label><input type="date" value={device.rentalStartDate} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, rentalStartDate: e.target.value } : row)) }))} />{customerFormErrors[`rentalStartDate-${index}`] && <small className="field-error">{customerFormErrors[`rentalStartDate-${index}`]}</small>}</div>
                          <div className="form-field"><label>Monthly Rent <span className="field-optional">(Optional)</span></label><input type="number" min="0" value={device.monthlyRent} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, monthlyRent: e.target.value } : row)) }))} />{customerFormErrors[`monthlyRent-${index}`] && <small className="field-error">{customerFormErrors[`monthlyRent-${index}`]}</small>}</div>
                          <div className="form-field"><label>Location Assigned <span className="field-optional">(Optional)</span></label><select value={device.locationId} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, locationId: e.target.value } : row)) }))}><option value="">Select location</option>{customerForm.locations.map((location) => <option key={location.id} value={location.id}>{location.locationName || 'Unnamed Location'}</option>)}</select>{customerFormErrors[`locationId-${index}`] && <small className="field-error">{customerFormErrors[`locationId-${index}`]}</small>}</div>
                          <div className="form-field"><label>Status</label><select value={device.status} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, status: e.target.value } : row)) }))}><option>Active</option><option>Inactive</option><option>Under Repair</option></select></div>
                          <div className="form-field full"><label>Remarks</label><textarea value={device.remarks} onChange={(e) => setCustomerForm((prev) => ({ ...prev, devices: prev.devices.map((row) => (row.id === device.id ? { ...row, remarks: e.target.value } : row)) }))} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="button" className="secondary-button" onClick={() => handleSaveCustomer(true)}>Save & Add Another</button><button type="submit" className="primary-button">Save</button></div>
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

