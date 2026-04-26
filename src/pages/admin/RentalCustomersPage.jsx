import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Save, X } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalCustomerService } from '../../services/rentalCustomerService';

const emptyCustomer = {
  customerType: 'Corporate',
  companyName: '',
  customerName: '',
  authorizedPerson1: '',
  authorizedPerson2: '',
  gstNumber: '',
  address: '',
  contactNumber: '',
  email: '',
  billingAddress: '',
  locations: [],
};

const RentalCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCustomer);
  const [notice, setNotice] = useState('');

  const refresh = async () => setCustomers(await rentalCustomerService.listCustomers());

  useEffect(() => {
    refresh();
  }, []);

  const save = async () => {
    try {
      await rentalCustomerService.saveCustomer(form);
      setShowForm(false);
      setForm(emptyCustomer);
      setNotice('Customer saved.');
      await refresh();
    } catch (error) {
      setNotice(error.message);
    }
  };

  return (
    <div className="admin-module-page rental-customers-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss customer message"><X size={16} /></button>
        </div>
      )}
      <AdminPageHeader
        title="Customers"
        description="Manage rental customers with multi-location support."
        breadcrumbs={['Admin', 'Rental Management', 'Customers']}
        actions={[{ label: 'Add Customer', icon: Plus, onClick: () => setShowForm(true) }]}
      />

      {showForm && (
        <div className="card">
          <div className="card-header"><div><h3>Customer Form</h3></div></div>
          <div className="form-grid">
            <div className="form-group"><label>Customer Type</label><select value={form.customerType} onChange={(e) => setForm((c) => ({ ...c, customerType: e.target.value }))}><option>Corporate</option><option>Individual</option></select></div>
            <div className="form-group"><label>Company Name</label><input value={form.companyName} onChange={(e) => setForm((c) => ({ ...c, companyName: e.target.value }))} /></div>
            <div className="form-group"><label>Customer Name</label><input value={form.customerName} onChange={(e) => setForm((c) => ({ ...c, customerName: e.target.value }))} /></div>
            <div className="form-group"><label>Contact Number</label><input value={form.contactNumber} onChange={(e) => setForm((c) => ({ ...c, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))} /></div>
            <div className="form-group"><label>Email</label><input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} /></div>
            <div className="form-group"><label>GST Number</label><input value={form.gstNumber} onChange={(e) => setForm((c) => ({ ...c, gstNumber: e.target.value }))} /></div>
            <div className="form-group"><label>Address</label><input value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} /></div>
            <div className="form-group"><label>Billing Address</label><input value={form.billingAddress} onChange={(e) => setForm((c) => ({ ...c, billingAddress: e.target.value }))} /></div>
          </div>
          <div className="admin-chip-row">
            <button className="btn btn-primary" type="button" onClick={save}><Save size={16} />Save Customer</button>
            <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="card-header"><div><h3>Customer List</h3></div></div>
        <table className="leads-table">
          <thead><tr><th>ID</th><th>Type</th><th>Customer</th><th>Company</th><th>Phone</th><th>Email</th><th>Locations</th><th>Action</th></tr></thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.customerType}</td>
                <td>{customer.customerName}</td>
                <td>{customer.companyName || '-'}</td>
                <td>{customer.contactNumber}</td>
                <td>{customer.email}</td>
                <td>{(customer.locations || []).length}</td>
                <td><Link className="btn btn-sm btn-secondary" to={`/admin/rental/customers/${customer.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalCustomersPage;

