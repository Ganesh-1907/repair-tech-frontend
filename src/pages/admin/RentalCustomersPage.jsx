import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Edit2, Eye, FileText, MoreVertical, Plus, Search, User, MapPin, MonitorSmartphone, Receipt } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalCustomerService } from '../../services/rentalCustomerService';
import RentalCustomerModal from '../../components/rental/RentalCustomerModal';
import RentalQuotationModal from '../../components/rental/RentalQuotationModal';
import RentalAgreementModal from '../../components/rental/RentalAgreementModal';
import './RentalPremiumStyles.css';

const RentalCustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: 'All', status: 'All' });
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Modal States
  const [customerModal, setCustomerModal] = useState({ isOpen: false, data: null });
  const [quotationModal, setQuotationModal] = useState({ isOpen: false, customer: null });
  const [agreementModal, setAgreementModal] = useState({ isOpen: false, customer: null, type: 'Corporate' });

  const refresh = async () => {
    setLoading(true);
    const list = await rentalCustomerService.listCustomers();
    setCustomers(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchSearch = (customer.companyName || customer.customerName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (customer.id || '').toLowerCase().includes(search.toLowerCase());
      const matchType = filters.type === 'All' || customer.customerType === filters.type;
      const matchStatus = filters.status === 'All' || customer.status === filters.status;
      return matchSearch && matchType && matchStatus;
    });
  }, [customers, search, filters]);

  const handleSaveCustomer = async (payload) => {
    await rentalCustomerService.saveCustomer(payload);
    setCustomerModal({ isOpen: false, data: null });
    refresh();
  };

  const headerActions = [
    { label: 'Add Customer', icon: Plus, onClick: () => setCustomerModal({ isOpen: true, data: null }), primary: true },
  ];

  return (
    <div className="admin-module-page rental-dashboard-page">
      <AdminPageHeader
        title="Customer Management"
        description="Comprehensive repository of rental clients, contracts, and service history."
        breadcrumbs={['Admin', 'Rental Management', 'Customers']}
        actions={headerActions}
      />

      <div className="card p-4 border-0 shadow-sm bg-card mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Company..." 
              className="table-input pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="table-input w-40 h-10"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="All">All Types</option>
            <option value="Corporate">Corporate</option>
            <option value="Individual">Individual</option>
          </select>
          <select 
            className="table-input w-40 h-10"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="leads-table whitespace-nowrap">
            <thead>
              <tr>
                <th className="w-24">Cust ID</th>
                <th>Type</th>
                <th>Company / Customer Name</th>
                <th>Authorized Person 1</th>
                <th>Authorized Person 2</th>
                <th>GST</th>
                <th>Phone</th>
                <th>Email</th>
                <th className="text-center">Locations</th>
                <th className="text-center">Devices</th>
                <th className="text-center">Contracts</th>
                <th>Status</th>
                <th className="w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="13" className="text-center py-12 text-muted font-bold">Synchronizing Client Data...</td></tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="font-mono text-xs font-black text-primary">{customer.id}</td>
                  <td>
                    <span className={`status-pill ${customer.customerType === 'Corporate' ? 'status-primary' : 'status-info'}`}>
                      {customer.customerType}
                    </span>
                  </td>
                  <td><span className="font-bold text-main">{customer.companyName || customer.customerName}</span></td>
                  <td className="text-sm font-medium">{customer.authorizedPerson1 || '—'}</td>
                  <td className="text-sm font-medium text-muted">{customer.authorizedPerson2 || '—'}</td>
                  <td className="font-mono text-xs font-bold">{customer.gstNumber || '—'}</td>
                  <td className="text-sm font-bold">{customer.contactNumber || customer.phone}</td>
                  <td className="text-sm text-muted font-medium">{customer.email}</td>
                  <td className="text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                      <MapPin size={12} /> {(customer.locations || []).length}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-info bg-info/5 px-2 py-1 rounded">
                      <MonitorSmartphone size={12} /> {(customer.devices || []).length}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-success bg-success/5 px-2 py-1 rounded">
                      <Receipt size={12} /> {(customer.activeContracts || 0)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${customer.status === 'Active' ? 'status-success' : 'status-warning'}`}>
                      {customer.status || 'Active'}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="relative inline-block">
                      <button 
                        className="icon-btn h-8 w-8 rounded-full hover:bg-surface-inset flex items-center justify-center transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === customer.id ? null : customer.id);
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {openMenuId === customer.id && (
                        <div className="basic-dropdown w-56 right-0" onClick={(e) => e.stopPropagation()}>
                          <button className="basic-dropdown-item" onClick={() => { navigate(`/admin/rental/customers/${customer.id}`); setOpenMenuId(null); }}>
                            <Eye size={14} className="text-muted" /> View Profile
                          </button>
                          <button className="basic-dropdown-item" onClick={() => { setCustomerModal({ isOpen: true, data: customer }); setOpenMenuId(null); }}>
                            <Edit2 size={14} className="text-muted" /> Edit Details
                          </button>
                          <div className="border-t border-subtle my-1"></div>
                          <button className="basic-dropdown-item" onClick={() => { setQuotationModal({ isOpen: true, customer }); setOpenMenuId(null); }}>
                            <FileText size={14} className="text-muted" /> Generate Quotation
                          </button>
                          <button className="basic-dropdown-item" onClick={() => { setAgreementModal({ isOpen: true, customer, type: 'Corporate' }); setOpenMenuId(null); }}>
                            <Briefcase size={14} className="text-muted" /> Corp. Agreement
                          </button>
                          <button className="basic-dropdown-item" onClick={() => { setAgreementModal({ isOpen: true, customer, type: 'Individual' }); setOpenMenuId(null); }}>
                            <User size={14} className="text-muted" /> Ind. Agreement
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RentalCustomerModal 
        isOpen={customerModal.isOpen} 
        onClose={() => setCustomerModal({ isOpen: false, data: null })}
        onSave={handleSaveCustomer}
        customer={customerModal.data}
      />

      <RentalQuotationModal
        isOpen={quotationModal.isOpen}
        onClose={() => setQuotationModal({ isOpen: false, customer: null })}
        onSave={() => setQuotationModal({ isOpen: false, customer: null })}
        customer={quotationModal.customer}
      />

      <RentalAgreementModal
        isOpen={agreementModal.isOpen}
        onClose={() => setAgreementModal({ isOpen: false, customer: null, type: 'Corporate' })}
        onSave={() => setAgreementModal({ isOpen: false, customer: null, type: 'Corporate' })}
        customer={agreementModal.customer}
        type={agreementModal.type}
      />
    </div>
  );
};

export default RentalCustomersPage;

