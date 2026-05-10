import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Search, Plus, Filter, Download, MoreVertical,
  Users, Calendar, IndianRupee, Eye, Edit, Trash2, X, FileText, FileEdit, RefreshCw,
  ArrowLeft, Printer, Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiClient';
import RepairModal from './RepairModal';
import './PlansCustomers.css';

const RentalInventoryPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [rentalPlans, setRentalPlans]   = useState([]);

  const [viewMode, setViewMode] = useState('list'); // 'list', 'quotation', 'agreement'
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState({ type: null, id: null });
  const [repairContract, setRepairContract] = useState(null);
  const [toast, setToast] = useState('');

  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const [data, plans] = await Promise.all([
        api.list('rentalContracts'),
        api.list('rentalPricingPlans'),
      ]);
      setRentalPlans(Array.isArray(plans) ? plans : []);
      const rows = Array.isArray(data) ? data : [];
      const mapped = rows.map(item => ({
        ...item,
        name: item.customerName || item.name || 'Unnamed Customer',
        contractId: item.id || item.contractId,
        plan: item.amcDetails?.planName || item.plan || '',
        expiry: item.expiryDate || item.endDate || item.expiry,
        value: item.contractValue || item.value,
        status: item.status || 'Active',
        authorizedPerson1: item.amcDetails?.authorizedPerson1 || item.authorizedPerson1,
        authorizedPerson2: item.amcDetails?.authorizedPerson2 || item.authorizedPerson2,
        gstin: item.amcDetails?.gstin || item.gstin,
        address: item.amcDetails?.address || item.address,
        contact: item.amcDetails?.contact || item.contact,
        locations: item.amcDetails?.locations || item.locations || ['Head Office'],
        devices: item.amcDetails?.devices || item.devices || [],
      }));
      setCustomers(mapped);
    } catch (error) {
      console.error('Failed to fetch rental contracts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();
    const name = String(customer.name || '').toLowerCase();
    const contractId = String(customer.contractId || customer.id || '').toLowerCase();
    return name.includes(query) || contractId.includes(query);
  });

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchContracts();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [fetchContracts]);

  useEffect(() => {
    if (!showModal && !showDetailModal) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showModal, showDetailModal]);

  useEffect(() => {
    if (!toast) return undefined;
    const timerId = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  const handleOpenDetail = (cust) => {
    setSelectedCustomer(cust);
    setShowDetailModal(true);
    setActiveMenu({ type: null, id: null });
  };

  const handleSave = async (data) => {
    try {
      const payload = {
        id: data.contractId,
        contractType: 'Rental',
        customerId: data.name.replace(/\s+/g, '-').toLowerCase(), // Simple slug for customerId
        customerName: data.name,
        startDate: data.start,
        endDate: data.expiry,
        status: data.status,
        contractValue: data.value,
        amcDetails: {
          planName: data.plan,
          authorizedPerson1: data.authorizedPerson1,
          authorizedPerson2: data.authorizedPerson2,
          gstin: data.gstin,
          address: data.address,
          contact: data.contact,
          locations: data.locations,
          devices: data.devices
        }
      };

      if (editingItem) {
        await api.update('rentalContracts', data.contractId, payload);
      } else {
        await api.create('rentalContracts', payload);
      }
      
      await fetchContracts();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save rental contract:', error);
      alert('Error saving rental contract. Please check console.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rental record?')) {
      try {
        await api.remove('rentalContracts', id);
        await fetchContracts();
        setActiveMenu({type:null, id:null});
      } catch (error) {
        console.error('Failed to delete rental record:', error);
      }
    }
  };

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu({ type: null, id: null });
      }
    };
    if (activeMenu.id) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  const handleEditFromDoc = (cust) => {
    setEditingItem(cust);
    setShowModal(true);
    setViewMode('list');
  };

  // --- Sub-Views ---
  if (viewMode === 'quotation') {
    return <RentalQuotationView customer={selectedCustomer} onBack={() => setViewMode('list')} onEdit={() => handleEditFromDoc(selectedCustomer)} />;
  }
  if (viewMode === 'agreement') {
    return <RentalAgreementView customer={selectedCustomer} onBack={() => setViewMode('list')} onEdit={() => handleEditFromDoc(selectedCustomer)} />;
  }

  if (isLoading) {
    return (
      <div className="plans-page">
        <div className="table-card" style={{ minHeight: '220px', alignItems: 'center', justifyContent: 'center' }}>
          <strong>Loading rental inventory...</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <h1>Rental Inventory</h1>
          <p>Registry of all active rental contracts, customers, and associated assets.</p>
        </div>
        <div className="plans-header-actions">
           <button className="primary-button" onClick={() => { setEditingItem(null); setShowModal(true); }}>
              <Plus size={18} /> Add New Rental Device
            </button>
            <button className="secondary-button" onClick={() => navigate('/admin/rental/maintenance-alerts')}>
              <Wrench size={16} /> Maintenance
            </button>
            <button className="secondary-button" onClick={() => navigate('/admin/rental/billing-invoices')}>
              <IndianRupee size={16} /> Billing
            </button>
        </div>
      </header>


      <div className="table-card">
        <div className="card-header">
          <div className="card-title-area">
            <h2>Rental Listings</h2>
          </div>
          <div className="plans-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer / User</th>
                <th>Contract ID</th>
                <th>Plan</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="customer-avatar">{c.name[0]}</div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td><span className="text-slate-500">{c.contractId}</span></td>
                  <td><span className="plan-badge">{c.plan}</span></td>
                  <td>{c.expiry}</td>
                  <td>
                    <span className={`status-badge status-${c.status.toLowerCase().replace(' ', '-')}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                       <button className="icon-button" onClick={() => handleOpenDetail(c)} title="View Details"><Eye size={14} /></button>
                       <button className="icon-button" onClick={() => setActiveMenu({ type: 'cust', id: c.id })}><MoreVertical size={14} /></button>
                    </div>
                    {activeMenu.type === 'cust' && activeMenu.id === c.id && (
                      <div className="action-menu" ref={menuRef}>
                        <button className="menu-item" onClick={() => { setEditingItem(c); setShowModal(true); setActiveMenu({type:null, id:null}); }}><Edit size={14} /> Edit</button>
                        <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('quotation'); setActiveMenu({type:null, id:null}); }}><FileEdit size={14} /> Rental Quotation</button>
                        <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('agreement'); setActiveMenu({type:null, id:null}); }}><FileText size={14} /> Rental Agreement</button>
                        <button className="menu-item" onClick={() => { setRepairContract(c); setActiveMenu({type:null, id:null}); }}><Wrench size={14} /> Manage Repair</button>
                        <button className="menu-item" onClick={() => { navigate('/admin/rental/maintenance-alerts'); setActiveMenu({type:null, id:null}); }}>
                          <Wrench size={14} /> Maintenance
                        </button>
                        <button className="menu-item" onClick={() => { navigate('/admin/rental/billing-invoices'); setActiveMenu({type:null, id:null}); }}>
                          <IndianRupee size={14} /> Billing
                        </button>
                        <button className="menu-item" onClick={() => { navigate('/admin/rental/billing-generate'); setActiveMenu({type:null, id:null}); }}>
                          <FileText size={14} /> Invoice Generation
                        </button>
                        <button className="menu-item" onClick={() => { navigate('/admin/rental/customers'); setActiveMenu({type:null, id:null}); }}>
                          <Users size={14} /> Payment Details
                        </button>
                        <button className="menu-item" style={{ color: '#dc2626' }} onClick={() => { handleDelete(c.id); }}><Trash2 size={14} /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSave}
          editingItem={editingItem}
          customers={customers}
          rentalPlans={rentalPlans}
        />
      )}

      {showDetailModal && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {repairContract && (
        <RepairModal
          contract={repairContract}
          collection="rentalMaintenanceLogs"
          onClose={() => setRepairContract(null)}
          showToast={(msg) => setToast(msg)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

const CustomerModal = ({ onClose, onSubmit, editingItem, customers, rentalPlans = [] }) => {
  const createBlankDevice = () => ({
    device: 'Desktop',
    type: 'Rental',
    brand: '',
    model: '',
    inputField: '',
    sn: '',
    config: '',
    status: 'Healthy',
  });
  const getNextContractId = () => {
    const year = new Date().getFullYear();
    const prefix = `RNT-${year}-`;
    
    // Filter IDs for current year and extract the serial number
    const serials = customers
      .filter(c => c.contractId?.startsWith(prefix))
      .map(c => {
        const parts = c.contractId.split('-');
        return parseInt(parts[parts.length - 1]);
      })
      .filter(n => !isNaN(n));

    const nextSerial = serials.length > 0 ? Math.max(...serials) + 1 : 1001;
    return `${prefix}${nextSerial}`;
  };

  const createInitialFormData = () => {
    const defaults = {
      name: '', 
      contractId: getNextContractId(), 
      plan: '',
      start: new Date().toISOString().split('T')[0], 
      expiry: '', 
      value: '', 
      status: 'Active',
      authorizedPerson1: '',
      authorizedPerson2: '',
      gstin: '',
      address: '',
      contact: '',
      locations: ['Head Office'],
      devices: [createBlankDevice()]
    };

    if (!editingItem) {
      return defaults;
    }

    return {
      ...defaults,
      ...editingItem,
      locations: Array.isArray(editingItem.locations) && editingItem.locations.length > 0 ? editingItem.locations : defaults.locations,
      devices: Array.isArray(editingItem.devices) && editingItem.devices.length > 0 ? editingItem.devices : defaults.devices
    };
  };
  const [formData, setFormData] = useState(createInitialFormData);

  const addDevice = () => {
    setFormData({ ...formData, devices: [...formData.devices, createBlankDevice()] });
  };

  const removeDevice = (index) => {
    if (formData.devices.length === 1) {
      setFormData({ ...formData, devices: [createBlankDevice()] });
      return;
    }

    const newDevices = formData.devices.filter((_, i) => i !== index);
    setFormData({ ...formData, devices: newDevices });
  };

  const updateDevice = (index, field, value) => {
    const newDevices = [...formData.devices];
    newDevices[index][field] = value;
    setFormData({ ...formData, devices: newDevices });
  };

  const addLocation = () => {
    setFormData({ ...formData, locations: [...formData.locations, ''] });
  };

  const hasPrinter = formData.devices.some((d) => (d.device || d.type) === 'Printer');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card amc-enrollment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingItem ? 'Edit Rental Registry' : 'New Rental Enrollment'}</h3>
          <button className="icon-button" onClick={onClose} style={{ border: 'none' }}><X size={20} /></button>
        </div>
        <div className="modal-body amc-enrollment-body">
          <div style={{ padding: '32px' }}>
            {/* 1. Customer Profile */}
            <div className="form-section">
              <h4 className="section-title" style={{ fontSize: '16px', color: 'var(--text-color)', marginBottom: '20px' }}>1. Customer Profile</h4>
              
              <div className="amc-form-stack">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Company / Customer Name</label>
                    <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter company name" />
                  </div>
                  <div className="form-group">
                    <label>GST Number</label>
                    <input className="form-input" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} placeholder="GSTIN" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Contact Phone / Email</label>
                    <input className="form-input" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="Phone or Email" />
                  </div>
                  <div className="form-group">
                    <label>Authorized Person 1</label>
                    <input className="form-input" value={formData.authorizedPerson1} onChange={e => setFormData({...formData, authorizedPerson1: e.target.value})} placeholder="Primary Contact" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Authorized Person 2</label>
                    <input className="form-input" value={formData.authorizedPerson2} onChange={e => setFormData({...formData, authorizedPerson2: e.target.value})} placeholder="Secondary (Optional)" />
                  </div>
                  <div />
                </div>
                <div className="form-group">
                  <label>Registered Address</label>
                  <textarea className="form-input" style={{ height: '60px', paddingTop: '12px' }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full company address" />
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--slate-100)', margin: '32px 0' }} />

            {/* 2. Contract Details */}
            <div className="form-section">
              <h4 className="section-title" style={{ fontSize: '16px', color: 'var(--text-color)', marginBottom: '20px' }}>2. Contract Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Rental ID</label>
                    <input className="form-input" value={formData.contractId} readOnly style={{ background: 'var(--slate-50)', color: 'var(--text-muted)' }} />
                  </div>
                  <div className="form-group">
                    <label>Rental Plan</label>
                    <select className="form-select" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                      <option value="">— Select Plan —</option>
                      {rentalPlans.filter(p => p.status !== 'Inactive').map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="date" className="form-input" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option>Active</option>
                      <option>Expired</option>
                      <option>Pending Approval</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--slate-100)', margin: '32px 0' }} />

            {/* 3. Device Registry */}
            <div className="form-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 className="section-title" style={{ margin: 0, fontSize: '16px', color: 'var(--text-color)' }}>3. Device Registry</h4>
              </div>
              <div className="device-table-wrapper">
                <table className="device-entry-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Type</th>
                      <th>Brand</th>
                      <th>Model</th>
                      <th>Input Field</th>
                      <th>Add Button</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.devices.map((device, index) => (
                      <tr key={index}>
                        <td>
                          <select className="form-select" value={device.device || device.type || 'Desktop'} onChange={e => updateDevice(index, 'device', e.target.value)}>
                            <option>Desktop</option>
                            <option>Laptop</option>
                            <option>Printer</option>
                            <option>CCTV</option>
                            <option>Server</option>
                          </select>
                        </td>
                        <td>
                          <input className="form-input" value={device.type || 'Rental'} onChange={e => updateDevice(index, 'type', e.target.value)} placeholder="e.g. Rental" />
                        </td>
                        <td>
                          <input className="form-input" value={device.brand} onChange={e => updateDevice(index, 'brand', e.target.value)} placeholder="e.g. Dell / HP" />
                        </td>
                        <td>
                          <input className="form-input" value={device.model || ''} onChange={e => updateDevice(index, 'model', e.target.value)} placeholder="e.g. Latitude 5420" />
                        </td>
                        <td>
                          <input className="form-input" value={device.inputField || ''} onChange={e => updateDevice(index, 'inputField', e.target.value)} placeholder="Enter details" />
                        </td>
                        <td>
                          <div className="device-row-actions">
                            <button className="device-action-button delete" title="Delete device row" aria-label={`Delete device row ${index + 1}`} onClick={() => removeDevice(index)}>
                              <Trash2 size={16} />
                            </button>
                            {index === formData.devices.length - 1 && (
                              <button className="device-action-button add" title="Add device row" aria-label="Add device row" onClick={addDevice}>
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {hasPrinter && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--slate-100)', margin: '32px 0' }} />
                <div className="form-section" style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 className="section-title" style={{ margin: 0, fontSize: '16px', color: 'var(--text-color)' }}>4. Printer Service Locations</h4>
                    <button className="secondary-button" style={{ height: '36px', fontSize: '13px' }} onClick={addLocation}><Plus size={16} /> Add Location</button>
                  </div>
                  <div className="amc-form-stack">
                     {formData.locations.map((loc, index) => (
                       <div key={index} className="amc-location-row">
                        <input 
                          className="form-input" 
                          value={loc} 
                          onChange={e => {
                            const newLocs = [...formData.locations];
                            newLocs[index] = e.target.value;
                            setFormData({ ...formData, locations: newLocs });
                          }} 
                          placeholder="e.g. Floor 2 / Branch" 
                        />
                        <button 
                          onClick={() => {
                            const newLocs = formData.locations.filter((_, i) => i !== index);
                            setFormData({ ...formData, locations: newLocs });
                          }}
                          style={{ background: 'transparent', color: 'var(--red)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                          title="Remove location"
                        >
                          <Trash2 size={16} />
                        </button>
                       </div>
                     ))}
                     {formData.locations.length === 0 && (
                       <div style={{ textAlign: 'center', padding: '20px', background: 'var(--slate-50)', borderRadius: '12px', border: '1px dashed var(--slate-300)', color: 'var(--text-muted)' }}>
                         No locations added. Click "Add Location" to start.
                       </div>
                     )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="modal-footer amc-enrollment-footer">
          <button className="secondary-button" onClick={onClose} style={{ minWidth: '120px' }}>Cancel</button>
          <button className="primary-button" style={{ padding: '0 40px' }} onClick={() => onSubmit(formData)}>Save Enrollment</button>
        </div>
      </div>
    </div>
  );
};

const CustomerDetailModal = ({ customer, onClose }) => {
  if (!customer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: '800px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div className="customer-avatar" style={{ width: '56px', height: '56px', fontSize: '24px' }}>{customer.name[0]}</div>
             <div>
               <h3 style={{ margin: 0, fontSize: '20px' }}>{customer.name}</h3>
               <span className="text-slate-500" style={{ fontSize: '14px' }}>{customer.contractId} | {customer.plan}</span>
             </div>
          </div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none' }}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ padding: '32px' }}>
          <div className="main-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Profile Section */}
              <section>
                <h4 style={{ marginBottom: '16px', color: 'var(--secondary)', borderBottom: '2px solid var(--slate-100)', paddingBottom: '8px', fontSize: '15px' }}>Customer Profile</h4>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="agreement-field"><strong>GSTIN</strong>{customer.gstin || 'Not Provided'}</div>
                  <div className="agreement-field"><strong>Contact Info</strong>{customer.contact || 'N/A'}</div>
                  <div className="agreement-field"><strong>Authorized Person 1</strong>{customer.authorizedPerson1 || 'Not Set'}</div>
                  <div className="agreement-field"><strong>Authorized Person 2</strong>{customer.authorizedPerson2 || 'None'}</div>
                </div>
                <div className="agreement-field" style={{ marginTop: '16px' }}><strong>Registered Address</strong>{customer.address || 'Not Set'}</div>
              </section>

              {/* Devices Section */}
              <section>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, color: 'var(--secondary)', fontSize: '15px' }}>Asset Registry ({customer.devices?.length || 0} Devices)</h4>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(customer.devices || []).map((d, idx) => (
                      <div key={idx} style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '12px', border: '1px solid var(--slate-100)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="plan-badge" style={{ fontSize: '10px' }}>{d.type}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.sn}</span>
                         </div>
                         <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{d.brand || 'Unnamed Device'}</div>
                      </div>
                    ))}
                    {(!customer.devices || customer.devices.length === 0) && (
                      <p className="text-slate-400" style={{ fontSize: '13px' }}>No devices registered under this rental contract.</p>
                    )}
                 </div>
              </section>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Contract Status Card */}
              <section className="plans-card" style={{ padding: '24px', border: '1px solid var(--slate-100)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                   <span className="text-slate-500" style={{ fontSize: '14px', fontWeight: '600' }}>Status</span>
                   <span className={`status-badge status-${customer.status.toLowerCase().replace(' ', '-')}`}>{customer.status}</span>
                </div>
                <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                       <span className="text-slate-500">Plan Value</span>
                       <strong style={{ color: 'var(--primary)' }}>{customer.value || '₹0'}</strong>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                       <span className="text-slate-500">Expires On</span>
                       <strong style={{ color: 'var(--red)' }}>{customer.expiry || 'N/A'}</strong>
                   </div>
                </div>
              </section>

              {/* Locations Section */}
              <section>
                 <h4 style={{ marginBottom: '16px', color: 'var(--secondary)', fontSize: '15px' }}>Service Locations</h4>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(customer.locations || ['Head Office']).map((loc, idx) => (
                      <span key={idx} style={{ padding: '8px 16px', background: '#eef2ff', color: '#6366f1', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
                        {loc}
                      </span>
                    ))}
                 </div>
              </section>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>Close Registry</button>
          <button className="primary-button"><Download size={16} /> Export Profile</button>
        </div>
      </div>
    </div>
  );
};

const RentalQuotationView = ({ customer, onBack }) => {
  const [mode, setMode] = useState('form'); // 'form' or 'preview'
  const [quoteData, setQuoteData] = useState({
    date: new Date().toISOString().split('T')[0],
    number: `QT-${customer.contractId.split('-')[2]}`,
    unitPrice: Math.round((parseInt(String(customer.value || '0').replace(/[^0-9]/g, '')) || 0) / (customer.devices?.length || 1)),
    gstType: 'Exclusive',
    scope: [
      'Quarterly Preventive Maintenance (4 visits per year)',
      'Unlimited Breakdown Support Calls',
      'Remote Desktop Support (within 1 hour)',
      'OS Installation & Software Troubleshooting',
      'Printer Service & Minor Adjustments',
      'Network Connectivity Management'
    ],
    exclusions: [
      'Replacement of Spare Parts',
      'Consumables (Ink, Toner, Cartridges, Ribbons)',
      'Physical damage or water logged devices',
      'External Cables and Connectors'
    ],
    sla: {
      response: '4-8 Working Hours',
      resolution: '24-48 Working Hours'
    },
    validity: '30 Days'
  });

  if (!customer) return null;

  const totalBase = quoteData.unitPrice * (customer.devices?.length || 1);
  const gstAmount = quoteData.gstType === 'Exclusive' ? totalBase * 0.18 : 0;
  const grandTotal = totalBase + gstAmount;

  if (mode === 'form') {
    return (
      <div className="document-view-container">
        <div className="document-header">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={20} /> Back to Inventory
          </button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Quotation Settings</h2>
          <button className="primary-button" onClick={() => setMode('preview')}>
            Generate Preview <Eye size={16} style={{ marginLeft: '8px' }} />
          </button>
        </div>

        <div className="quotation-form-card" style={{ background: 'white', padding: '40px', borderRadius: '24px', maxWidth: '1200px', margin: '0 auto', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-premium)' }}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
            {/* Left Column */}
            <div>
              <div className="form-section">
                <h4 className="section-title" style={{ color: 'var(--secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🧾</span> Basic Details
                </h4>
                <div style={{ padding: '20px', background: 'var(--slate-50)', borderRadius: '12px', marginBottom: '32px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Customer:</strong> {customer.name}</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Contact:</strong> {customer.authorizedPerson1}</p>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-muted)' }}>{customer.address}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Quote Date</label>
                      <input type="date" className="form-input" value={quoteData.date} onChange={e => setQuoteData({...quoteData, date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Quote Number</label>
                      <input type="text" className="form-input" value={quoteData.number} onChange={e => setQuoteData({...quoteData, number: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title" style={{ color: 'var(--secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💰</span> Pricing
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <div className="form-group">
                    <label>Price per Device (₹)</label>
                    <input type="number" className="form-input" value={quoteData.unitPrice} onChange={e => setQuoteData({...quoteData, unitPrice: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="form-group">
                    <label>GST Configuration</label>
                    <select className="form-select" value={quoteData.gstType} onChange={e => setQuoteData({...quoteData, gstType: e.target.value})}>
                      <option>Exclusive</option>
                      <option>Inclusive</option>
                    </select>
                  </div>
                </div>
                <div style={{ padding: '16px', borderTop: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Estimated Grand Total:</span>
                   <strong style={{ fontSize: '20px', color: 'var(--secondary)' }}>₹{grandTotal.toLocaleString()}</strong>
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '32px' }}>
                <h4 className="section-title" style={{ color: 'var(--secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⏱</span> SLA & <span>🔁</span> Validity
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label>Response Time</label>
                    <input type="text" className="form-input" value={quoteData.sla.response} onChange={e => setQuoteData({...quoteData, sla: {...quoteData.sla, response: e.target.value}})} />
                  </div>
                  <div className="form-group">
                    <label>Resolution Time</label>
                    <input type="text" className="form-input" value={quoteData.sla.resolution} onChange={e => setQuoteData({...quoteData, sla: {...quoteData.sla, resolution: e.target.value}})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Validity Period</label>
                  <input type="text" className="form-input" value={quoteData.validity} onChange={e => setQuoteData({...quoteData, validity: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="form-section">
                <h4 className="section-title" style={{ color: 'var(--secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📌</span> Scope of Work
                </h4>
                <div className="list-editor" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {quoteData.scope.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px' }}>
                      <input className="form-input" value={item} onChange={e => {
                        const newScope = [...quoteData.scope];
                        newScope[i] = e.target.value;
                        setQuoteData({...quoteData, scope: newScope});
                      }} />
                      <button className="icon-button" style={{ color: 'var(--red)' }} onClick={() => setQuoteData({...quoteData, scope: quoteData.scope.filter((_, idx) => idx !== i)})}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button className="secondary-button" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => setQuoteData({...quoteData, scope: [...quoteData.scope, 'New scope item']})}>
                    <Plus size={14} /> Add Scope Point
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title" style={{ color: 'var(--secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>❌</span> Exclusions
                </h4>
                <div className="list-editor" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {quoteData.exclusions.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px' }}>
                      <input className="form-input" value={item} onChange={e => {
                        const newEx = [...quoteData.exclusions];
                        newEx[i] = e.target.value;
                        setQuoteData({...quoteData, exclusions: newEx});
                      }} />
                      <button className="icon-button" style={{ color: 'var(--red)' }} onClick={() => setQuoteData({...quoteData, exclusions: quoteData.exclusions.filter((_, idx) => idx !== i)})}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button className="secondary-button" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => setQuoteData({...quoteData, exclusions: [...quoteData.exclusions, 'New exclusion']})}>
                    <Plus size={14} /> Add Exclusion Point
                  </button>
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '32px' }}>
                <h4 className="section-title" style={{ color: 'var(--secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💻</span> Asset Details (Preview)
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--slate-100)', borderRadius: '12px', padding: '12px' }}>
                  <table style={{ width: '100%', fontSize: '12px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                      <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ paddingBottom: '8px' }}>Type</th>
                        <th style={{ paddingBottom: '8px' }}>Model</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.devices?.map((d, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--slate-50)' }}>
                          <td style={{ padding: '8px 0' }}>{d.type}</td>
                          <td style={{ padding: '8px 0' }}>{d.brand}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview Mode
  return (
    <div className="document-view-container">
      <div className="document-header no-print">
        <button className="back-button" onClick={() => setMode('form')}>
          <ArrowLeft size={20} /> Back to Settings
        </button>
        <div className="doc-actions">
          <button className="secondary-button" onClick={() => setMode('form')}>
            <Edit size={16} /> Edit Settings
          </button>
          <button className="primary-button" onClick={() => window.print()}>
            <Printer size={16} /> Print Quotation
          </button>
        </div>
      </div>

      <div className="document-paper">
        <div className="paper-header">
          <div className="company-info">
            <h2 style={{ color: 'var(--secondary)', margin: 0 }}>RepairTech Solutions</h2>
            <p>123 Service Hub, Tech Park, Bangalore</p>
            <p>Email: support@repairtech.com | Phone: +91 98765 43210</p>
          </div>
          <div className="doc-type" style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, fontSize: '28px' }}>RENTAL QUOTATION</h1>
            <div style={{ marginTop: '10px' }}>
              <p><strong>Date:</strong> {quoteData.date}</p>
              <p><strong>Quote #:</strong> {quoteData.number}</p>
            </div>
          </div>
        </div>

        <div className="paper-body">
          <div className="info-grid">
            <div className="info-block">
              <strong>BILL TO:</strong>
              <p className="client-name">{customer.name}</p>
              <p>{customer.authorizedPerson1}</p>
              <p>{customer.address}</p>
              <p><strong>GSTIN:</strong> {customer.gstin}</p>
            </div>
            <div className="info-block" style={{ textAlign: 'right' }}>
              <strong>SLA DETAILS:</strong>
              <p>Response: {quoteData.sla.response}</p>
              <p>Resolution: {quoteData.sla.resolution}</p>
              <p>Validity: {quoteData.validity}</p>
            </div>
          </div>

          <div className="doc-section">
            <h3 className="section-heading">💻 ASSET REGISTRY & COVERAGE</h3>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Device Type</th>
                  <th>Brand / Model</th>
                  <th>S/N</th>
                  <th>Configuration</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {(customer.devices || []).map((d, i) => (
                  <tr key={i}>
                    <td>{d.type}</td>
                    <td>{d.brand}</td>
                    <td>{d.sn || 'N/A'}</td>
                    <td>{d.config || '-'}</td>
                    <td style={{ textAlign: 'right' }}>₹{quoteData.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Subtotal (Excl. GST)</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{totalBase}</td>
                </tr>
                <tr>
                  <td colSpan="4" style={{ textAlign: 'right' }}>GST (18%) - {quoteData.gstType}</td>
                  <td style={{ textAlign: 'right' }}>₹{gstAmount}</td>
                </tr>
                <tr style={{ fontSize: '18px', color: 'var(--secondary)', borderTop: '2px solid #333' }}>
                  <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold', padding: '15px' }}>GRAND TOTAL</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '15px' }}>₹{grandTotal}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="terms-grid">
            <div className="terms-column">
              <h3 className="section-heading">📌 SCOPE OF WORK</h3>
              <ul className="terms-list">
                {quoteData.scope.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="terms-column">
              <h3 className="section-heading">❌ EXCLUSIONS</h3>
              <ul className="terms-list">
                {quoteData.exclusions.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="paper-footer" style={{ marginTop: '60px' }}>
            <div className="signatures" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div className="sig-box">
                <div className="sig-line"></div>
                <p>Client Signature</p>
              </div>
              <div className="sig-box">
                <div className="sig-line"></div>
                <p>For RepairTech Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RentalAgreementView = ({ customer, onBack, onEdit }) => {
  if (!customer) return null;
  return (
    <div className="document-view-container">
      <div className="document-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} /> Back to Inventory
        </button>
        <div className="doc-actions">
          <button className="secondary-button" onClick={onEdit}><Edit size={16} /> Edit Agreement</button>
          <button className="primary-button" onClick={() => window.print()}><Printer size={16} /> Print Agreement</button>
        </div>
      </div>

      <div className="document-paper agreement-paper">
        <h1 style={{ textAlign: 'center', marginBottom: '40px', textDecoration: 'underline' }}>RENTAL AGREEMENT</h1>
        
        <p>This Maintenance Agreement (the "Agreement") is entered into this {new Date().toLocaleDateString()} by and between:</p>
        
        <div style={{ margin: '20px 0' }}>
          <strong>SERVICE PROVIDER:</strong>
          <p>RepairTech Solutions, Bangalore (Hereinafter referred to as "The Company")</p>
        </div>

        <div style={{ margin: '20px 0' }}>
          <strong>THE CLIENT:</strong>
          <p>{customer.name}, {customer.address} (Hereinafter referred to as "The Client")</p>
        </div>

        <div className="agreement-section">
          <h3>1. SCOPE OF SERVICES</h3>
          <p>The Company agrees to provide maintenance services for the equipment listed in the Asset Registry below as per the <strong>{customer.plan}</strong>.</p>
        </div>

        <div className="agreement-section">
          <h3>2. PERIOD OF AGREEMENT</h3>
          <p>This agreement shall be valid from <strong>{customer.start}</strong> to <strong>{customer.expiry}</strong>.</p>
        </div>

        <div className="agreement-section">
          <h3>3. ASSET REGISTRY</h3>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Device Type</th>
                <th>Brand / Model</th>
                <th>Serial Number</th>
              </tr>
            </thead>
            <tbody>
              {(customer.devices || []).map((d, i) => (
                <tr key={i}>
                  <td>{d.type}</td>
                  <td>{d.brand}</td>
                  <td>{d.sn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="agreement-section">
          <h3>4. PAYMENT TERMS</h3>
          <p>The client agrees to pay a total sum of <strong>{customer.value || '₹0'}</strong> for the period mentioned above.</p>
        </div>

        <div className="agreement-signatures" style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
          <div className="sig-box">
            <div className="sig-line"></div>
            <p>For {customer.name}</p>
          </div>
          <div className="sig-box">
            <div className="sig-line"></div>
            <p>For RepairTech Solutions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalInventoryPage;

