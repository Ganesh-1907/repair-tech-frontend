import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Edit,
  Eye,
  FileEdit,
  FileText,
  MoreVertical,
  Plus,
  Printer,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { api } from '../../services/apiClient';
import RepairModal from './RepairModal';
import './PlansCustomers.css';

const createDefaultQuotation = (customer = {}) => ({
  customerType: customer.customerType || 'Corporate',
  customerName: customer.name || '',
  companyName: customer.name || '',
  address: customer.address || '',
  contactPerson: customer.authorizedPerson1 || '',
  phone: customer.contact || '',
  email: '',
  productName: customer.plan || 'CMC Plan',
  deviceType: '',
  model: '',
  specs: '',
  serialNo: '',
  quantity: 1,
  rentalPricePerMonth: customer.value || '',
  rentalPricePerDay: '',
  minimumRentalPeriod: '12 Months',
  securityDeposit: '',
  installationCharges: '',
  deliveryCharges: '',
  gstPercentage: 18,
  paymentTerms: 'Net 7 Days',
  slaResponseTime: '24 Hours',
  notes: '',
  quotationTerms: 'Quotation valid for 15 days.',
  paymentPolicy: 'Payment due within 7 days.',
  deliveryPolicy: 'Delivery as per schedule.',
  supportPolicy: 'Support as per selected CMC plan.',
  devices: (customer.devices || []).map((d) => ({
    deviceType: d.type || '',
    model: d.brand || '',
    specs: '',
    serialNo: d.sn || '',
    quantity: 1,
    monthlyRent: '',
    securityDeposit: '',
  })),
});

const createDefaultAgreement = (customer = {}) => ({
  agreementType: customer.customerType === 'Individual' ? 'Individual' : 'Corporate',
  agreementDate: new Date().toISOString().slice(0, 10),
  agreementNumber: `AGR-${customer.contractId || 'NEW'}`,
  startDate: customer.start || '',
  endDate: customer.expiry || '',
  jurisdictionCity: 'Bangalore',
  companyName: customer.name || '',
  companyRegisteredAddress: customer.address || '',
  gst: customer.gstin || '',
  clientAuthorizedPerson: customer.authorizedPerson1 || '',
  phone: customer.contact || '',
  email: '',
  serviceProviderName: 'RepairTech Solutions',
  serviceProviderAddress: '123 Service Hub, Tech Park, Bangalore',
  providerAuthorizedPerson: 'Authorized Signatory',
  monthlyRental: customer.value || '',
  billingCycle: 'Monthly',
  paymentDueDays: '7',
  minimumCommitment: '12 Months',
  securityDeposit: '',
  installationCharges: '',
  deliveryCharges: '',
  gstPercentage: 18,
  latePaymentFee: '',
  a4bwRate: '',
  a4ColorRate: '',
  a3bwRate: '',
  a3ColorRate: '',
  slaResponseTime: '24 Hours',
  downtimeLimit: '48 Hours',
  replacementPolicy: 'Replacement subject to diagnosis.',
  maintenanceCoverage: 'Comprehensive maintenance coverage.',
  clauses: 'Standard terms and conditions apply.',
  signatureDetails: 'Authorized signatures required.',
  witnessDetails: 'Witness signatures required.',
  paymentPolicy: 'Payment due as per invoice.',
  deliveryPolicy: 'Delivery and installation as scheduled.',
  supportPolicy: 'Support available within SLA.',
  devices: (customer.devices || []).map((d) => ({
    deviceType: d.type || '',
    model: d.brand || '',
    specs: '',
    serialNo: d.sn || '',
    quantity: 1,
    monthlyRent: '',
    securityDeposit: '',
  })),
});

const createBlankDocDevice = () => ({
  deviceType: '',
  model: '',
  specs: '',
  serialNo: '',
  quantity: 1,
  monthlyRent: '',
  securityDeposit: '',
});

const CMCInventoryPage = () => {
  const [customers, setCustomers] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState({ id: null, open: false, x: 0, y: 0, width: 220 });
  const [documentsByContract, setDocumentsByContract] = useState({});
  const [toast, setToast] = useState('');
  const [repairContract, setRepairContract] = useState(null);

  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.list('cmcContracts');
      const rows = Array.isArray(data) ? data : [];
      const mapped = rows.map((item) => ({
        ...item,
        name: item.customerName || item.name || 'Unnamed Customer',
        contractId: item.id || item.contractId,
        plan: item.cmcDetails?.planName || item.plan || 'Standard CMC',
        start: item.startDate || item.start,
        expiry: item.expiryDate || item.endDate || item.expiry,
        value: item.contractValue || item.value,
        status: item.status || 'Active',
        authorizedPerson1: item.cmcDetails?.authorizedPerson1 || item.authorizedPerson1,
        authorizedPerson2: item.cmcDetails?.authorizedPerson2 || item.authorizedPerson2,
        gstin: item.cmcDetails?.gstin || item.gstin,
        address: item.cmcDetails?.address || item.address,
        contact: item.cmcDetails?.contact || item.contact,
        locations: item.cmcDetails?.locations || item.locations || ['Head Office'],
        devices: item.cmcDetails?.devices || item.devices || [],
      }));
      setCustomers(mapped);
    } catch (error) {
      console.error('Failed to fetch CMC contracts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    const close = () => setActiveMenu((prev) => (prev.open ? { ...prev, open: false, id: null } : prev));
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('click', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('click', close);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase();
    return customers.filter((customer) => {
      const name = String(customer.name || '').toLowerCase();
      const contractId = String(customer.contractId || customer.id || '').toLowerCase();
      return name.includes(query) || contractId.includes(query);
    });
  }, [customers, search]);

  const handleOpenDetail = (cust) => {
    setSelectedCustomer(cust);
    setShowDetailModal(true);
    setActiveMenu({ id: null, open: false, x: 0, y: 0, width: 220 });
  };

  const handleOpenMenu = (event, customer) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 220;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuHeight = 210;
    const x = Math.max(8, Math.min(rect.right - width, viewportWidth - width - 8));
    const shouldOpenUp = rect.bottom + menuHeight > viewportHeight - 8;
    const y = shouldOpenUp ? Math.max(8, rect.top - menuHeight - 6) : Math.min(viewportHeight - menuHeight - 8, rect.bottom + 6);

    setActiveMenu({ id: customer.id, open: true, x, y, width });
  };

  const upsertCustomerDoc = (contractId, key, docData) => {
    setDocumentsByContract((prev) => ({
      ...prev,
      [contractId]: {
        ...prev[contractId],
        [key]: docData,
      },
    }));
  };

  const getCustomerDoc = (customer, key) => {
    const existing = documentsByContract[customer.contractId]?.[key];
    if (existing) return existing;
    return key === 'quotation' ? createDefaultQuotation(customer) : createDefaultAgreement(customer);
  };

  const handleSave = async (data) => {
    try {
      const payload = {
        id: data.contractId,
        contractType: 'CMC',
        customerId: data.name.replace(/\s+/g, '-').toLowerCase(),
        customerName: data.name,
        startDate: data.start,
        endDate: data.expiry,
        status: data.status,
        contractValue: data.value,
        cmcDetails: {
          planName: data.plan,
          authorizedPerson1: data.authorizedPerson1,
          authorizedPerson2: data.authorizedPerson2,
          gstin: data.gstin,
          address: data.address,
          contact: data.contact,
          locations: data.locations,
          devices: data.devices,
        },
      };

      if (editingItem) {
        await api.update('cmcContracts', data.contractId, payload);
      } else {
        await api.create('cmcContracts', payload);
      }

      await fetchContracts();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save CMC contract:', error);
      alert('Error saving CMC. Please check console.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this CMC record?')) return;
    try {
      await api.remove('cmcContracts', id);
      await fetchContracts();
      setActiveMenu({ id: null, open: false, x: 0, y: 0, width: 220 });
    } catch (error) {
      console.error('Failed to delete CMC:', error);
    }
  };

  if (viewMode === 'quotation') {
    return (
      <CMCQuotationView
        customer={selectedCustomer}
        initialData={selectedCustomer ? getCustomerDoc(selectedCustomer, 'quotation') : null}
        onSave={(doc) => {
          if (!selectedCustomer) return;
          upsertCustomerDoc(selectedCustomer.contractId, 'quotation', doc);
          setToast('Quotation updated successfully.');
        }}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'agreement') {
    return (
      <CMCAgreementView
        customer={selectedCustomer}
        initialData={selectedCustomer ? getCustomerDoc(selectedCustomer, 'agreement') : null}
        onSave={(doc) => {
          if (!selectedCustomer) return;
          upsertCustomerDoc(selectedCustomer.contractId, 'agreement', doc);
          setToast('Agreement updated successfully.');
        }}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="plans-page">
        <div className="table-card" style={{ minHeight: '220px', alignItems: 'center', justifyContent: 'center' }}>
          <strong>Loading CMC inventory...</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <h1>CMC Inventory</h1>
          <p>Registry of all active CMC contracts, customers, and associated assets.</p>
        </div>
        <div className="plans-header-actions">
          <button className="primary-button" onClick={() => { setEditingItem(null); setShowModal(true); }}>
            <Plus size={18} /> Add New CMC Device
          </button>
        </div>
      </header>

      <div className="table-card table-card-unclipped">
        <div className="card-header">
          <div className="card-title-area">
            <h2>CMC Listings</h2>
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

        <div className="table-container table-scroll-wrapper">
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
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="customer-avatar">{String(c.name || '?')[0]}</div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td><span className="text-slate-500">{c.contractId}</span></td>
                  <td><span className="plan-badge">{c.plan}</span></td>
                  <td>{c.expiry}</td>
                  <td>
                    <span className={`status-badge status-${String(c.status || '').toLowerCase().replace(' ', '-')}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-menu" style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-button" onClick={() => handleOpenDetail(c)} title="View Details"><Eye size={14} /></button>
                      <button className="icon-button" onClick={(e) => handleOpenMenu(e, c)}><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeMenu.open && (
        <div
          className="menu-panel"
          style={{ position: 'fixed', left: `${activeMenu.x}px`, top: `${activeMenu.y}px`, width: `${activeMenu.width}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const c = filteredCustomers.find((row) => row.id === activeMenu.id) || customers.find((row) => row.id === activeMenu.id);
            if (!c) return null;
            return (
              <>
                <button className="menu-item" onClick={() => { setEditingItem(c); setShowModal(true); setActiveMenu((p) => ({ ...p, open: false, id: null })); }}><Edit size={14} /> Edit</button>
                <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('quotation'); setActiveMenu((p) => ({ ...p, open: false, id: null })); }}><FileEdit size={14} /> CMC Quotation</button>
                <button className="menu-item" onClick={() => { setSelectedCustomer(c); setViewMode('agreement'); setActiveMenu((p) => ({ ...p, open: false, id: null })); }}><FileText size={14} /> CMC Agreement</button>
                <button className="menu-item" onClick={() => { setRepairContract(c); setActiveMenu((p) => ({ ...p, open: false, id: null })); }}><Wrench size={14} /> Manage Repair</button>
                <button className="menu-item" style={{ color: '#dc2626' }} onClick={() => { void handleDelete(c.id); }}><Trash2 size={14} /> Delete</button>
              </>
            );
          })()}
        </div>
      )}

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

      {repairContract && (
        <RepairModal
          contract={repairContract}
          collection="cmcRepairs"
          onClose={() => setRepairContract(null)}
          showToast={(msg) => setToast(msg)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

const DocumentDeviceTable = ({ devices, onChange }) => {
  const updateRow = (index, field, value) => {
    const next = [...devices];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  return (
    <div className="device-table-wrapper" style={{ marginTop: '12px' }}>
      <table className="device-entry-table">
        <thead>
          <tr>
            <th>Device Type</th>
            <th>Model</th>
            <th>Specs</th>
            <th>Serial No</th>
            <th>Qty</th>
            <th>Monthly Rent</th>
            <th>Security Deposit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((row, index) => (
            <tr key={`doc-device-${index}`}>
              {['deviceType', 'model', 'specs', 'serialNo', 'quantity', 'monthlyRent', 'securityDeposit'].map((field) => (
                <td key={field}>
                  <input
                    className="form-input"
                    value={row[field] ?? ''}
                    onChange={(e) => updateRow(index, field, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <div className="device-row-actions">
                  <button className="device-action-button delete" onClick={() => onChange(devices.filter((_, i) => i !== index))}>
                    <Trash2 size={14} />
                  </button>
                  {index === devices.length - 1 && (
                    <button className="device-action-button add" onClick={() => onChange([...devices, createBlankDocDevice()])}>
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {devices.length === 0 && (
            <tr>
              <td colSpan={8}>
                <button className="secondary-button" onClick={() => onChange([createBlankDocDevice()])}>
                  <Plus size={14} /> Add Device Row
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const CMCQuotationView = ({ customer, initialData, onSave, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [backup, setBackup] = useState(null);
  const [form, setForm] = useState(initialData || createDefaultQuotation(customer));

  useEffect(() => {
    setForm(initialData || createDefaultQuotation(customer));
    setIsEditing(false);
    setBackup(null);
  }, [initialData, customer]);

  if (!customer) return null;

  const beginEdit = () => {
    setBackup(form);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm(backup || form);
    setBackup(null);
    setIsEditing(false);
  };

  const saveEdit = () => {
    onSave(form);
    setBackup(null);
    setIsEditing(false);
  };

  return (
    <div className="document-view-container">
      <div className="document-header">
        <button className="back-button" onClick={onBack}><ArrowLeft size={20} /> Back to Inventory</button>
        <div className="doc-actions" style={{ display: 'flex', gap: '10px' }}>
          {!isEditing && <button className="secondary-button" onClick={beginEdit}><Edit size={16} /> Edit Quotation</button>}
          {isEditing && <button className="primary-button" onClick={saveEdit}>Save Changes</button>}
          {isEditing && <button className="secondary-button" onClick={cancelEdit}>Cancel</button>}
          <button className="primary-button" onClick={() => window.print()}><Printer size={16} /> Print Quotation</button>
        </div>
      </div>

      {isEditing && (
        <div className="table-card" style={{ maxWidth: '900px', margin: '0 auto 20px' }}>
          <h3>Quotation Edit</h3>
          <div className="contract-details-grid">
            {Object.keys(form).filter((k) => k !== 'devices').map((key) => (
              <div className="form-group" key={key}>
                <label>{key.replace(/([A-Z])/g, ' $1')}</label>
                <input className="form-input" value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <h4>Devices</h4>
          <DocumentDeviceTable devices={form.devices || []} onChange={(devices) => setForm({ ...form, devices })} />
        </div>
      )}

      <div className="document-paper">
        <div className="paper-header">
          <div className="company-info">
            <h2>RepairTech Solutions</h2>
            <p>{form.serviceProviderAddress || '123 Service Hub, Tech Park, Bangalore'}</p>
          </div>
          <div className="doc-type">
            <h1>CMC QUOTATION</h1>
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Quote #: QT-{customer.contractId.split('-')[2]}</p>
          </div>
        </div>

        <div className="paper-body">
          <div className="info-grid">
            <div className="info-block">
              <strong>BILL TO:</strong>
              <p>{form.customerName}</p>
              <p>{form.contactPerson}</p>
              <p>{form.address}</p>
              <p>GSTIN: {customer.gstin}</p>
            </div>
            <div className="info-block" style={{ textAlign: 'right' }}>
              <strong>CONTRACT DETAILS:</strong>
              <p>Plan: {customer.plan}</p>
              <p>Duration: {form.minimumRentalPeriod}</p>
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
              {(form.devices && form.devices.length > 0 ? form.devices : [createBlankDocDevice()]).map((d, i) => (
                <tr key={i}>
                  <td>
                    <strong>{d.deviceType || form.productName || 'Comprehensive Maintenance Contract'}</strong>
                    <p style={{ fontSize: '12px', color: '#666' }}>{d.model || form.model} {d.specs ? `- ${d.specs}` : ''}</p>
                  </td>
                  <td style={{ textAlign: 'right' }}>{d.quantity || 1}</td>
                  <td style={{ textAlign: 'right' }}>{d.monthlyRent || form.rentalPricePerMonth || '0'}</td>
                  <td style={{ textAlign: 'right' }}>{d.monthlyRent || form.rentalPricePerMonth || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="paper-footer">
            <div className="terms">
              <strong>Terms & Conditions:</strong>
              <ul>
                <li>{form.quotationTerms}</li>
                <li>{form.paymentPolicy}</li>
                <li>{form.supportPolicy}</li>
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

const CMCAgreementView = ({ customer, initialData, onSave, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [backup, setBackup] = useState(null);
  const [form, setForm] = useState(initialData || createDefaultAgreement(customer));

  useEffect(() => {
    setForm(initialData || createDefaultAgreement(customer));
    setIsEditing(false);
    setBackup(null);
  }, [initialData, customer]);

  if (!customer) return null;

  const beginEdit = () => {
    setBackup(form);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm(backup || form);
    setBackup(null);
    setIsEditing(false);
  };

  const saveEdit = () => {
    onSave(form);
    setBackup(null);
    setIsEditing(false);
  };

  return (
    <div className="document-view-container">
      <div className="document-header">
        <button className="back-button" onClick={onBack}><ArrowLeft size={20} /> Back to Inventory</button>
        <div className="doc-actions" style={{ display: 'flex', gap: '10px' }}>
          {!isEditing && <button className="secondary-button" onClick={beginEdit}><Edit size={16} /> Edit Agreement</button>}
          {isEditing && <button className="primary-button" onClick={saveEdit}>Save Changes</button>}
          {isEditing && <button className="secondary-button" onClick={cancelEdit}>Cancel</button>}
          <button className="primary-button" onClick={() => window.print()}><Printer size={16} /> Print Agreement</button>
        </div>
      </div>

      {isEditing && (
        <div className="table-card" style={{ maxWidth: '900px', margin: '0 auto 20px' }}>
          <h3>Agreement Edit</h3>
          <div className="contract-details-grid">
            {Object.keys(form).filter((k) => k !== 'devices').map((key) => (
              <div className="form-group" key={key}>
                <label>{key.replace(/([A-Z])/g, ' $1')}</label>
                <input className="form-input" value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <h4>Devices</h4>
          <DocumentDeviceTable devices={form.devices || []} onChange={(devices) => setForm({ ...form, devices })} />
        </div>
      )}

      <div className="document-paper agreement-paper">
        <h1 style={{ textAlign: 'center', marginBottom: '40px', textDecoration: 'underline' }}>COMPREHENSIVE MAINTENANCE AGREEMENT</h1>
        <p>This Agreement is entered on <strong>{form.agreementDate}</strong> under agreement no <strong>{form.agreementNumber}</strong>.</p>

        <div className="agreement-section">
          <h3>Client & Provider</h3>
          <p><strong>Client:</strong> {form.companyName || form.customerName}, {form.companyRegisteredAddress || form.address}</p>
          <p><strong>Provider:</strong> {form.serviceProviderName}, {form.serviceProviderAddress}</p>
        </div>

        <div className="agreement-section">
          <h3>Duration & Charges</h3>
          <p>Period: <strong>{form.startDate}</strong> to <strong>{form.endDate}</strong></p>
          <p>Monthly Rental: <strong>{form.monthlyRental || customer.value || '0'}</strong> | GST: <strong>{form.gstPercentage}%</strong></p>
          <p>Payment Due Days: <strong>{form.paymentDueDays}</strong> | SLA Response: <strong>{form.slaResponseTime}</strong></p>
        </div>

        <div className="agreement-section">
          <h3>Asset Registry</h3>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Device Type</th>
                <th>Model</th>
                <th>Specs</th>
                <th>Serial No</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {(form.devices && form.devices.length > 0 ? form.devices : [createBlankDocDevice()]).map((d, i) => (
                <tr key={i}>
                  <td>{d.deviceType}</td>
                  <td>{d.model}</td>
                  <td>{d.specs}</td>
                  <td>{d.serialNo}</td>
                  <td>{d.quantity || 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="agreement-section">
          <h3>Policies & Clauses</h3>
          <p>{form.paymentPolicy}</p>
          <p>{form.deliveryPolicy}</p>
          <p>{form.supportPolicy}</p>
          <p>{form.replacementPolicy}</p>
          <p>{form.maintenanceCoverage}</p>
          <p>{form.clauses}</p>
        </div>

        <div className="agreement-signatures" style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
          <div className="sig-box">
            <div className="sig-line"></div>
            <p>{form.signatureDetails || `For ${form.companyName || customer.name}`}</p>
          </div>
          <div className="sig-box">
            <div className="sig-line"></div>
            <p>{form.witnessDetails || `For ${form.serviceProviderName}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Existing modals kept as-is
const CustomerModal = ({ onClose, onSubmit, editingItem, customers }) => {
  const createBlankDevice = () => ({ type: 'Laptop', brand: '', sn: '', config: '', status: 'Healthy' });

  const getNextContractId = () => {
    const year = new Date().getFullYear();
    const prefix = `CMC-${year}-`;
    const serials = customers
      .filter((c) => c.contractId?.startsWith(prefix))
      .map((c) => parseInt(c.contractId.split('-').pop(), 10))
      .filter((n) => !Number.isNaN(n));
    const nextSerial = serials.length > 0 ? Math.max(...serials) + 1 : 1001;
    return `${prefix}${nextSerial}`;
  };

  const defaults = {
    name: '', contractId: getNextContractId(), plan: 'Standard CMC',
    start: new Date().toISOString().split('T')[0], expiry: '', value: '', status: 'Active',
    authorizedPerson1: '', authorizedPerson2: '', gstin: '', address: '', contact: '',
    locations: ['Head Office'], devices: [createBlankDevice()],
  };
  const [formData, setFormData] = useState(
    editingItem
      ? {
          ...defaults,
          ...editingItem,
          locations: Array.isArray(editingItem.locations) && editingItem.locations.length > 0 ? editingItem.locations : defaults.locations,
          devices: Array.isArray(editingItem.devices) && editingItem.devices.length > 0 ? editingItem.devices : defaults.devices,
        }
      : defaults
  );

  const addDevice = () => setFormData({ ...formData, devices: [...formData.devices, createBlankDevice()] });
  const removeDevice = (index) => {
    if (formData.devices.length === 1) { setFormData({ ...formData, devices: [createBlankDevice()] }); return; }
    setFormData({ ...formData, devices: formData.devices.filter((_, i) => i !== index) });
  };
  const updateDevice = (index, field, value) => {
    const updated = [...formData.devices];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, devices: updated });
  };
  const addLocation = () => setFormData({ ...formData, locations: [...formData.locations, ''] });
  const hasPrinter = formData.devices.some((d) => d.type === 'Printer');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card amc-enrollment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingItem ? 'Edit CMC Registry' : 'New CMC Enrollment'}</h3>
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
                    <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter company name" />
                  </div>
                  <div className="form-group">
                    <label>GST Number</label>
                    <input className="form-input" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} placeholder="GSTIN" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Contact Phone / Email</label>
                    <input className="form-input" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} placeholder="Phone or Email" />
                  </div>
                  <div className="form-group">
                    <label>Authorized Person 1</label>
                    <input className="form-input" value={formData.authorizedPerson1} onChange={(e) => setFormData({ ...formData, authorizedPerson1: e.target.value })} placeholder="Primary Contact" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Authorized Person 2</label>
                    <input className="form-input" value={formData.authorizedPerson2} onChange={(e) => setFormData({ ...formData, authorizedPerson2: e.target.value })} placeholder="Secondary (Optional)" />
                  </div>
                  <div />
                </div>
                <div className="form-group">
                  <label>Registered Address</label>
                  <textarea className="form-input" style={{ height: '60px', paddingTop: '12px' }} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full company address" />
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
                    <label>CMC ID</label>
                    <input className="form-input" value={formData.contractId} readOnly style={{ background: 'var(--slate-50)', color: 'var(--text-muted)' }} />
                  </div>
                  <div className="form-group">
                    <label>CMC Plan</label>
                    <select className="form-select" value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })}>
                      <option>Basic CMC</option>
                      <option>Standard CMC</option>
                      <option>Premium CMC</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="date" className="form-input" value={formData.expiry} onChange={(e) => setFormData({ ...formData, expiry: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
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
                      <th>Type</th>
                      <th>Brand / Model</th>
                      <th>Serial Number</th>
                      <th>Configuration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.devices.map((device, index) => (
                      <tr key={index}>
                        <td>
                          <select className="form-select" value={device.type} onChange={(e) => updateDevice(index, 'type', e.target.value)}>
                            <option>Laptop</option>
                            <option>Desktop</option>
                            <option>Printer</option>
                            <option>Server</option>
                            <option>UPS</option>
                            <option>Scanner</option>
                          </select>
                        </td>
                        <td>
                          <input className="form-input" value={device.brand} onChange={(e) => updateDevice(index, 'brand', e.target.value)} placeholder="e.g. Dell Latitude 5420" />
                        </td>
                        <td>
                          <input className="form-input" value={device.sn} onChange={(e) => updateDevice(index, 'sn', e.target.value)} placeholder="S/N" />
                        </td>
                        <td>
                          <input className="form-input" value={device.config} onChange={(e) => updateDevice(index, 'config', e.target.value)} placeholder="e.g. i5, 8GB, 256GB" />
                        </td>
                        <td>
                          <div className="device-row-actions">
                            <button className="device-action-button delete" title="Delete device row" onClick={() => removeDevice(index)}><Trash2 size={16} /></button>
                            {index === formData.devices.length - 1 && (
                              <button className="device-action-button add" title="Add device row" onClick={addDevice}><Plus size={16} /></button>
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
                          onChange={(e) => {
                            const newLocs = [...formData.locations];
                            newLocs[index] = e.target.value;
                            setFormData({ ...formData, locations: newLocs });
                          }}
                          placeholder="e.g. Floor 2 / Branch"
                        />
                        <button
                          onClick={() => setFormData({ ...formData, locations: formData.locations.filter((_, i) => i !== index) })}
                          style={{ background: 'transparent', color: 'var(--red)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
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
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: '850px', maxWidth: '95vw' }}>
        <div className="modal-header">
          <h3>{customer.name}</h3>
          <button className="icon-button" onClick={onClose} style={{ border: 'none' }}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ padding: '32px' }}>
          <p><strong>Contract:</strong> {customer.contractId}</p>
          <p><strong>Plan:</strong> {customer.plan}</p>
          <p><strong>Status:</strong> {customer.status}</p>
        </div>
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>Close Registry</button>
          <button className="primary-button"><Download size={16} /> Export Profile</button>
        </div>
      </div>
    </div>
  );
};

export default CMCInventoryPage;
