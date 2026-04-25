import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Package,
  AlertTriangle,
  Download,
  Image as ImageIcon,
  History,
  ShoppingCart,
  ExternalLink,
  X
} from 'lucide-react';

const formatAmount = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const initialPurchaseForm = {
  name: '',
  vendor: '',
  qty: '',
  min: '',
  unit: 'pcs',
  price: '',
};

const Inventory = () => {
  const formRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([
    { id: 1, name: 'Water Filter Cartridge', stock: 5, min: 10, unit: 'pcs', price: 450, vendor: 'AquaFlow Ind.', purchaseDate: '2026-03-15', billImage: 'bill_001.jpg' },
    { id: 2, name: 'Compressor Valve B2', stock: 2, min: 5, unit: 'pcs', price: 1200, vendor: 'Industrial Spaes', purchaseDate: '2026-02-10', billImage: 'bill_002.jpg' },
    { id: 3, name: 'Sealant Kit', stock: 8, min: 15, unit: 'kits', price: 280, vendor: 'Chemical Guru', purchaseDate: '2026-04-01', billImage: 'bill_003.jpg' },
  ]);
  const [form, setForm] = useState(initialPurchaseForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const searchTerm = searchParams.get('q') || '';

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams]);

  const filteredItems = items.filter((item) => {
    const query = searchTerm.toLowerCase();
    return item.name.toLowerCase().includes(query) || item.vendor.toLowerCase().includes(query);
  });

  const lowStockCount = items.filter((item) => item.stock < item.min).length;

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const exportCsv = () => {
    const header = ['Item Name', 'Current Stock', 'Minimum Level', 'Unit', 'Unit Price', 'Vendor', 'Purchase Date'];
    const rows = items.map((item) => [item.name, item.stock, item.min, item.unit, item.price, item.vendor, item.purchaseDate]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory.csv';
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Inventory CSV exported.');
  };

  const savePurchase = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Item name is required.';
    if (!form.vendor.trim()) nextErrors.vendor = 'Vendor name is required.';
    if (!Number(form.qty) || Number(form.qty) <= 0) nextErrors.qty = 'Quantity must be greater than zero.';
    if (!Number(form.min) || Number(form.min) <= 0) nextErrors.min = 'Minimum level must be greater than zero.';
    if (!Number(form.price) || Number(form.price) < 0) nextErrors.price = 'Total price must be zero or more.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const qty = Number(form.qty);
    const totalPrice = Number(form.price);
    const unitPrice = Math.round(totalPrice / qty);
    const newItem = {
      id: Date.now(),
      name: form.name.trim(),
      stock: qty,
      min: Number(form.min),
      unit: form.unit,
      price: unitPrice,
      vendor: form.vendor.trim(),
      purchaseDate: new Date().toISOString().slice(0, 10),
      billImage: 'Uploaded bill',
    };

    setItems((current) => [newItem, ...current]);
    setForm(initialPurchaseForm);
    setNotice(`${newItem.name} added to inventory.`);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('add');
    setSearchParams(nextParams);
  };

  const handleSearchTermChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      nextParams.set('q', value);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="inventory-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss inventory message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="inventory-stats-row">
        <div className="stat-card mini">
          <Package size={20} className="icon-primary" />
          <div className="stat-info">
            <span className="label">Total Items</span>
            <span className="value">{items.length}</span>
          </div>
        </div>
        <div className="stat-card mini">
          <AlertTriangle size={20} className="icon-danger" />
          <div className="stat-info">
            <span className="label">Low Stock Alerts</span>
            <span className="value danger">{lowStockCount}</span>
          </div>
        </div>
        <div className="stat-card mini">
          <ShoppingCart size={20} className="icon-success" />
          <div className="stat-info">
            <span className="label">Recent Purchases</span>
            <span className="value">24</span>
          </div>
        </div>
      </div>

      <div className="table-controls card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search inventory..."
            aria-label="Search inventory"
            value={searchTerm}
            onChange={(event) => handleSearchTermChange(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <button className="btn btn-secondary" onClick={exportCsv}><Download size={16} /> Export CSV</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Current Stock</th>
              <th>Purchase Info</th>
              <th>Unit Price</th>
              <th>Vendor Bill</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="item-cell">
                    <span className="bold">{item.name}</span>
                    <span className="badge badge-outline">{item.unit}</span>
                  </div>
                </td>
                <td>
                  <div className={`stock-level ${item.stock < item.min ? 'danger' : 'success'}`}>
                    <span>{item.stock} / {item.min}</span>
                    <div className="stock-bar">
                      <div className="stock-fill" style={{ width: `${Math.min((item.stock / item.min) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="purchase-info">
                    <span className="vendor-name">{item.vendor}</span>
                    <span className="purchase-date">{item.purchaseDate}</span>
                  </div>
                </td>
                <td>{formatAmount(item.price)}</td>
                <td>
                  <button className="btn btn-sm btn-ghost" onClick={() => setNotice(`Bill reference: ${item.billImage}`)}>
                    <ImageIcon size={14} /> <span>View Bill</span>
                  </button>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn" title="Purchase History" aria-label={`Purchase history for ${item.name}`}><History size={16} /></button>
                    <button className="icon-btn" title="Edit" aria-label={`Edit ${item.name}`}><ExternalLink size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <h3>No inventory items found</h3>
                    <p>Adjust your search or add a new purchase record.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="modal-mockup mt-8" ref={formRef}>
        <div className="card billing-section">
          <h3>Add New Purchase Record</h3>
          <div className="form-grid mt-4">
            <div className="form-group">
              <label htmlFor="inventory-name">Item Name</label>
              <input
                id="inventory-name"
                type="text"
                placeholder="e.g. Printer Toner"
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="inventory-vendor">Vendor Name</label>
              <input
                id="inventory-vendor"
                type="text"
                placeholder="Where did you purchase it?"
                value={form.vendor}
                onChange={(event) => updateForm('vendor', event.target.value)}
                aria-invalid={Boolean(errors.vendor)}
              />
              {errors.vendor && <span className="form-error">{errors.vendor}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="inventory-qty">Qty Purchased</label>
              <input
                id="inventory-qty"
                type="number"
                min="1"
                value={form.qty}
                onChange={(event) => updateForm('qty', event.target.value)}
                aria-invalid={Boolean(errors.qty)}
              />
              {errors.qty && <span className="form-error">{errors.qty}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="inventory-min">Minimum Stock Level</label>
              <input
                id="inventory-min"
                type="number"
                min="1"
                value={form.min}
                onChange={(event) => updateForm('min', event.target.value)}
                aria-invalid={Boolean(errors.min)}
              />
              {errors.min && <span className="form-error">{errors.min}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="inventory-unit">Unit</label>
              <select
                id="inventory-unit"
                value={form.unit}
                onChange={(event) => updateForm('unit', event.target.value)}
              >
                <option>pcs</option>
                <option>kits</option>
                <option>boxes</option>
                <option>meters</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="inventory-price">Total Price</label>
              <input
                id="inventory-price"
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => updateForm('price', event.target.value)}
                aria-invalid={Boolean(errors.price)}
              />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label>Purchase Bill (Image)</label>
              <div className="file-upload-box" tabIndex="0" role="button" aria-label="Upload purchase bill image">
                <ImageIcon size={20} />
                <span>Click to upload bill image</span>
              </div>
            </div>
          </div>
          <button className="btn btn-primary mt-4" onClick={savePurchase}>Save Purchase Record</button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
