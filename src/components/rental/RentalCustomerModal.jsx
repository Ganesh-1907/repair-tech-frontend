import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

const emptyLocation = {
  locationName: '',
  address: '',
  contactPerson: '',
  phone: '',
  email: '',
  gstBranch: '',
};

const RentalCustomerModal = ({ isOpen, onClose, onSave, customer = null }) => {
  const [form, setForm] = useState({
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
    notes: '',
    status: 'Active',
    locations: [],
  });

  useEffect(() => {
    if (customer) {
      setForm({ ...customer, locations: customer.locations || [] });
    } else {
      setForm({
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
        notes: '',
        status: 'Active',
        locations: [],
      });
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleAddLocation = () => {
    setForm(prev => ({
      ...prev,
      locations: [...prev.locations, { ...emptyLocation, id: `LOC-${Date.now()}` }]
    }));
  };

  const handleUpdateLocation = (id, field, value) => {
    setForm(prev => ({
      ...prev,
      locations: prev.locations.map(loc => loc.id === id ? { ...loc, [field]: value } : loc)
    }));
  };

  const handleRemoveLocation = (id) => {
    setForm(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content max-w-4xl overflow-y-auto max-h-[90vh]">
        <div className="admin-modal-header">
          <h2>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body space-y-6">
          <div className="form-grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Customer Type</label>
              <select 
                value={form.customerType} 
                onChange={(e) => setForm(f => ({ ...f, customerType: e.target.value }))}
                className="table-input"
              >
                <option>Corporate</option>
                <option>Individual</option>
              </select>
            </div>
            {form.customerType === 'Corporate' && (
              <div className="form-group">
                <label>Company Name</label>
                <input 
                  value={form.companyName} 
                  onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))}
                  required
                  className="table-input"
                />
              </div>
            )}
            <div className="form-group">
              <label>Contact Person / Customer Name</label>
              <input 
                value={form.customerName} 
                onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))}
                required
                className="table-input"
              />
            </div>
            <div className="form-group">
              <label>Authorized Person 1</label>
              <input 
                value={form.authorizedPerson1} 
                onChange={(e) => setForm(f => ({ ...f, authorizedPerson1: e.target.value }))}
                className="table-input"
              />
            </div>
            <div className="form-group">
              <label>Authorized Person 2 (Optional)</label>
              <input 
                value={form.authorizedPerson2} 
                onChange={(e) => setForm(f => ({ ...f, authorizedPerson2: e.target.value }))}
                className="table-input"
              />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input 
                value={form.gstNumber} 
                onChange={(e) => setForm(f => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
                className="table-input"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input 
                value={form.contactNumber} 
                onChange={(e) => setForm(f => ({ ...f, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                required
                className="table-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email"
                value={form.email} 
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="table-input"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select 
                value={form.status} 
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                className="table-input"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Blacklisted</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Billing Address</label>
            <textarea 
              value={form.billingAddress} 
              onChange={(e) => setForm(f => ({ ...f, billingAddress: e.target.value }))}
              className="table-input min-h-[80px]"
            />
          </div>

          <div className="section-divider"></div>

          <div className="flex justify-between items-center mb-4">
            <h3>Locations</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddLocation}>
              <Plus size={14} /> Add Location
            </button>
          </div>

          <div className="space-y-4">
            {form.locations.map((loc, index) => (
              <div key={loc.id} className="card p-4 border border-subtle bg-hover">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold">Location #{index + 1}</h4>
                  <button type="button" className="icon-btn text-danger" onClick={() => handleRemoveLocation(loc.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="form-grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Location Name</label>
                    <input 
                      value={loc.locationName} 
                      onChange={(e) => handleUpdateLocation(loc.id, 'locationName', e.target.value)}
                      placeholder="e.g. HQ, Branch Office"
                      className="table-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input 
                      value={loc.contactPerson} 
                      onChange={(e) => handleUpdateLocation(loc.id, 'contactPerson', e.target.value)}
                      className="table-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      value={loc.phone} 
                      onChange={(e) => handleUpdateLocation(loc.id, 'phone', e.target.value)}
                      className="table-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      value={loc.email} 
                      onChange={(e) => handleUpdateLocation(loc.id, 'email', e.target.value)}
                      className="table-input"
                    />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Address</label>
                    <input 
                      value={loc.address} 
                      onChange={(e) => handleUpdateLocation(loc.id, 'address', e.target.value)}
                      className="table-input"
                    />
                  </div>
                </div>
              </div>
            ))}
            {form.locations.length === 0 && (
              <p className="text-muted italic">No locations added yet.</p>
            )}
          </div>
        </form>

        <div className="admin-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Save size={16} /> {customer ? 'Update Customer' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentalCustomerModal;
