import React, { useCallback, useEffect, useState } from 'react';
import { 
  Search, Plus, Filter, Download, MoreVertical, 
  Users, Calendar, IndianRupee, Eye, Edit, Trash2, X, FileText, FileEdit, RefreshCw,
  ArrowLeft, Printer
} from 'lucide-react';
import { api } from '../../services/apiClient';
import './PlansCustomers.css';

const AMCInventoryPage = () => {
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Global Tech', contractId: 'AMC-2026-1001', plan: 'Standard AMC', start: '2025-05-15', expiry: '2026-05-15', value: '₹45,000', status: 'Active', gstin: '22AAAAA0000A1Z5', address: '123 Tech Park', authorizedPerson1: 'Mr. John' },
    { id: 2, name: 'Stellar Bank', contractId: 'AMC-2026-1002', plan: 'Premium AMC', start: '2025-05-19', expiry: '2026-05-19', value: '₹30,000', status: 'Expiring Soon', gstin: '22BBBBB1111B1Z6', address: '456 Fin Plaza', authorizedPerson1: 'Ms. Sarah' },
  ]);

  const [viewMode, setViewMode] = useState('list'); // 'list', 'quotation', 'agreement'
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState({ type: null, id: null });

  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.list('amcContracts');
      const rows = Array.isArray(data) ? data : [];
      // Map backend structure back to frontend expectations if needed
      const mapped = rows.map(item => ({
        ...item,
        name: item.customerName || item.name || 'Unnamed Customer',
        contractId: item.id || item.contractId,
        plan: item.amcDetails?.planName || item.plan || 'Standard AMC',
        expiry: item.expiryDate || item.endDate || item.expiry,
        value: item.contractValue || item.value,
        status: item.status || 'Active',
        authorizedPerson1: item.amcDetails?.authorizedPerson1 || item.authorizedPerson1,
        authorizedPerson2: item.amcDetails?.authorizedPerson2 || item.authorizedPerson2,
        gstin: item.amcDetails?.gstin || item.gstin,
        address: item.amcDetails?.address || item.address,
        contact: item.amcDetails?.contact || item.contact,
        locations: item.amcDetails?.locations || item.locations || ['Head Office'],
        devices: item.amcDetails?.devices || item.devices || []
      }));
      setCustomers(mapped);
    } catch (error) {
      console.error('Failed to fetch AMC contracts:', error);
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

  const handleOpenDetail = (cust) => {
    setSelectedCustomer(cust);
    setShowDetailModal(true);
    setActiveMenu({ type: null, id: null });
  };

  const handleSave = async (data) => {
    try {
      const payload = {
        id: data.contractId,
        contractType: 'AMC',
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
        await api.update('amcContracts', data.contractId, payload);
      } else {
        await api.create('amcContracts', payload);
      }
      
      await fetchContracts();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save AMC contract:', error);
      alert('Error saving AMC. Please check console.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this AMC record?')) {
      try {
        await api.remove('amcContracts', id);
        await fetchContracts();
        setActiveMenu({type:null, id:null});
      } catch (error) {
        console.error('Failed to delete AMC:', error);
      }
    }
  };

  // --- Sub-Views ---
  if (viewMode === 'quotation') {
    return <AMCQuotationView customer={selectedCustomer} onBack={() => setViewMode('list')} />;
  }
  if (viewMode === 'agreement') {
    return <AMCAgreementView customer={selectedCustomer} onBack={() => setViewMode('list')} />;
  }

  if (isLoading) {
    return (
      <div className="plans-page">
        <div className="table-card" style={{ minHeight: '220px', alignItems: 'center', justifyContent: 'center' }}>
          <strong>Loading AMC inventory...</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <h1>AMC Inventory</h1>
          <p>Registry of all active AMC contracts, customers, and associated assets.</p>
        </div>
        <div className="plans-header-actions">
           <button className="primary-button" onClick={() => { setEditingItem(null); setShowModal(true); }}>
              <Plus size={18} /> Add New AMC Device
            </button>
        </div>
      </header>


      <div className="table-card">
        <div className="card-header">
          <div className="card-title-area">
            <h2>AMC Listings</h2>
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
                      <div className="action-menu">
                        <button className="menu-item" onClick={() => { setEditingItem(c); setShowModal(true); setActiveMenu({type:null, id:null}); }}><Edit size={14} /> Edit</button>
                        <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('quotation'); setActiveMenu({type:null, id:null}); }}><FileEdit size={14} /> AMC Quotation</button>
                        <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('agreement'); setActiveMenu({type:null, id:null}); }}><FileText size={14} /> AMC Agreement</button>
                        <button className="menu-item text-red-600" onClick={() => { handleDelete(c.id); }}><Trash2 size={14} /> Delete</button>
                        <button className="menu-item" onClick={() => setActiveMenu({type:null, id:null})}><X size={14} /> Close</button>
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
        />
      )}

      {showDetailModal && (
        <CustomerDetailModal 
          customer={selectedCustomer} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}
    </div>
  );
};

const CustomerModal = ({ onClose, onSubmit, editingItem, customers }) => {
  const createBlankDevice = () => ({ type: 'Laptop', brand: '', sn: '' });
  const getNextContractId = () => {
    const year = new Date().getFullYear();
    const prefix = `AMC-${year}-`;
    
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
      plan: 'Standard AMC', 
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

  const hasPrinter = formData.devices.some(d => d.type === 'Printer');

  return (
    <div className="modal-overlay">
      <div className="modal-card amc-enrollment-modal">
        <div className="modal-header">
          <h3>{editingItem ? 'Edit AMC Registry' : 'New AMC Enrollment'}</h3>
          <button className="icon-button" onClick={onClose} style={{ border: 'none' }}><X size={20} /></button>
        </div>
        <div className="modal-body amc-enrollment-body">
          <div style={{ padding: '32px' }}>
            {/* 1. Customer Profile */}
            <div className="form-section">
              <h4 className="section-title" style={{ fontSize: '16px', color: 'var(--text-color)', marginBottom: '20px' }}>1. Customer Profile</h4>
              
              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Company / Customer Name</label>
                  <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter company name" />
                </div>
                <div className="form-group">
                  <label>GST Number</label>
                  <input className="form-input" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} placeholder="GSTIN" />
                </div>
                <div className="form-group">
                  <label>Contact Phone / Email</label>
                  <input className="form-input" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="Phone or Email" />
                </div>
              </div>

              <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Authorized Person 1</label>
                  <input className="form-input" value={formData.authorizedPerson1} onChange={e => setFormData({...formData, authorizedPerson1: e.target.value})} placeholder="Primary Contact" />
                </div>
                <div className="form-group">
                  <label>Authorized Person 2</label>
                  <input className="form-input" value={formData.authorizedPerson2} onChange={e => setFormData({...formData, authorizedPerson2: e.target.value})} placeholder="Secondary (Optional)" />
                </div>
                <div className="form-group">
                  {/* Spacer or additional field if needed */}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Registered Address</label>
                <textarea className="form-input" style={{ height: '60px', paddingTop: '12px' }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full company address" />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--slate-100)', margin: '32px 0' }} />

            {/* 2. Contract Details */}
            <div className="form-section">
              <h4 className="section-title" style={{ fontSize: '16px', color: 'var(--text-color)', marginBottom: '20px' }}>2. Contract Details</h4>
              <div className="contract-details-grid">
                <div className="form-group">
                  <label>AMC ID</label>
                  <input className="form-input" value={formData.contractId} readOnly style={{ background: 'var(--slate-50)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-group">
                  <label>AMC Plan</label>
                  <select className="form-select" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                    <option>Basic AMC</option>
                    <option>Standard AMC</option>
                    <option>Premium AMC</option>
                  </select>
                </div>
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
                      <th>Type</th>
                      <th>Brand / Model</th>
                      <th>Serial Number</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.devices.map((device, index) => (
                      <tr key={index}>
                        <td>
                          <select className="form-select" value={device.type} onChange={e => updateDevice(index, 'type', e.target.value)}>
                            <option>Laptop</option>
                            <option>Desktop</option>
                            <option>Printer</option>
                            <option>Server</option>
                            <option>UPS</option>
                            <option>Scanner</option>
                          </select>
                        </td>
                        <td>
                          <input className="form-input" value={device.brand} onChange={e => updateDevice(index, 'brand', e.target.value)} placeholder="e.g. Dell Latitude 5420" />
                        </td>
                        <td>
                          <input className="form-input" value={device.sn} onChange={e => updateDevice(index, 'sn', e.target.value)} placeholder="S/N" />
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                     {formData.locations.map((loc, index) => (
                       <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                       <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '20px', background: 'var(--slate-50)', borderRadius: '12px', border: '1px dashed var(--slate-300)', color: 'var(--text-muted)' }}>
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
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: '850px', maxWidth: '95vw' }}>
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
                      <p className="text-slate-400" style={{ fontSize: '13px' }}>No devices registered under this AMC.</p>
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

const AMCQuotationView = ({ customer, onBack }) => {
  if (!customer) return null;
  return (
    <div className="document-view-container">
      <div className="document-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} /> Back to Inventory
        </button>
        <div className="doc-actions">
          <button className="secondary-button"><Edit size={16} /> Edit Quotation</button>
          <button className="primary-button" onClick={() => window.print()}><Printer size={16} /> Print Quotation</button>
        </div>
      </div>

      <div className="document-paper">
        <div className="paper-header">
          <div className="company-info">
            <h2>RepairTech Solutions</h2>
            <p>123 Service Hub, Tech Park</p>
            <p>Bangalore, Karnataka - 560001</p>
          </div>
          <div className="doc-type">
            <h1>AMC QUOTATION</h1>
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Quote #: QT-{customer.contractId.split('-')[2]}</p>
          </div>
        </div>

        <div className="paper-body">
          <div className="info-grid">
            <div className="info-block">
              <strong>BILL TO:</strong>
              <p>{customer.name}</p>
              <p>{customer.authorizedPerson1}</p>
              <p>{customer.address}</p>
              <p>GSTIN: {customer.gstin}</p>
            </div>
            <div className="info-block" style={{ textAlign: 'right' }}>
              <strong>CONTRACT DETAILS:</strong>
              <p>Plan: {customer.plan}</p>
              <p>Duration: 1 Year</p>
              <p>ID Reference: {customer.contractId}</p>
            </div>
          </div>

          <table className="doc-table">
            <thead>
              <tr>
                <th>Description of Services</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Annual Maintenance Contract - {customer.plan}</strong>
                  <p style={{ fontSize: '12px', color: '#666' }}>Includes preventive maintenance and emergency support for registered assets.</p>
                </td>
                <td style={{ textAlign: 'right' }}>1</td>
                <td style={{ textAlign: 'right' }}>{customer.value || '₹0'}</td>
                <td style={{ textAlign: 'right' }}>{customer.value || '₹0'}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ padding: '20px 0' }}>
                  <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '12px' }}>Assets Covered:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                      {(customer.devices || []).map((d, i) => (
                        <span key={i} style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                          {d.type}: {d.brand}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Subtotal</td>
                <td style={{ textAlign: 'right' }}>{customer.value || '₹0'}</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>GST (18%)</td>
                <td style={{ textAlign: 'right' }}>₹0</td>
              </tr>
              <tr style={{ fontSize: '18px', color: 'var(--secondary)' }}>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{customer.value || '₹0'}</td>
              </tr>
            </tfoot>
          </table>

          <div className="paper-footer">
            <div className="terms">
              <strong>Terms & Conditions:</strong>
              <ul>
                <li>Payment should be made within 7 days of contract approval.</li>
                <li>This quotation is valid for 15 days from the date of issue.</li>
                <li>Services will be provided as per the selected AMC Plan.</li>
              </ul>
            </div>
            <div className="signatures">
              <div className="sig-box">
                <div className="sig-line"></div>
                <p>Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AMCAgreementView = ({ customer, onBack }) => {
  if (!customer) return null;
  return (
    <div className="document-view-container">
      <div className="document-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} /> Back to Inventory
        </button>
        <div className="doc-actions">
          <button className="secondary-button"><Edit size={16} /> Edit Agreement</button>
          <button className="primary-button" onClick={() => window.print()}><Printer size={16} /> Print Agreement</button>
        </div>
      </div>

      <div className="document-paper agreement-paper">
        <h1 style={{ textAlign: 'center', marginBottom: '40px', textDecoration: 'underline' }}>ANNUAL MAINTENANCE AGREEMENT</h1>
        
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

export default AMCInventoryPage;
