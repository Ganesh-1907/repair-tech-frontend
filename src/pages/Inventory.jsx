import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  Download, 
  Image as ImageIcon,
  History,
  ShoppingCart,
  ExternalLink
} from 'lucide-react';
import { mockDashboardData } from '../data/mockData';

const Inventory = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Water Filter Cartridge', stock: 5, min: 10, unit: 'pcs', price: 450, vendor: 'AquaFlow Ind.', purchaseDate: '2026-03-15', billImage: 'bill_001.jpg' },
    { id: 2, name: 'Compressor Valve B2', stock: 2, min: 5, unit: 'pcs', price: 1200, vendor: 'Industrial Spaes', purchaseDate: '2026-02-10', billImage: 'bill_002.jpg' },
    { id: 3, name: 'Sealant Kit', stock: 8, min: 15, unit: 'kits', price: 280, vendor: 'Chemical Guru', purchaseDate: '2026-04-01', billImage: 'bill_003.jpg' },
  ]);

  return (
    <div className="inventory-page">
      <header className="page-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Track stock levels, purchases, and vendor bills.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Stock</span>
        </button>
      </header>

      <div className="inventory-stats-row">
        <div className="stat-card mini">
            <Package size={20} className="icon-primary" />
            <div className="stat-info">
                <span className="label">Total Items</span>
                <span className="value">458</span>
            </div>
        </div>
        <div className="stat-card mini">
            <AlertTriangle size={20} className="icon-danger" />
            <div className="stat-info">
                <span className="label">Low Stock Alerts</span>
                <span className="value danger">12</span>
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
          <input type="text" placeholder="Search inventory..." />
        </div>
        <div className="filter-group">
            <button className="btn btn-secondary"><Download size={16} /> Export CSV</button>
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
            {items.map(item => (
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
                        <div className="stock-fill" style={{ width: `${(item.stock/item.min)*100}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="purchase-info">
                    <span className="vendor-name">{item.vendor}</span>
                    <span className="purchase-date">{item.purchaseDate}</span>
                  </div>
                </td>
                <td>₹{item.price}</td>
                <td>
                    <button className="btn btn-sm btn-ghost">
                        <ImageIcon size={14} /> <span>View Bill</span>
                    </button>
                </td>
                <td>
                    <div className="action-btns">
                        <button className="icon-btn" title="Purchase History"><History size={16} /></button>
                        <button className="icon-btn" title="Edit"><ExternalLink size={16} /></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal Mockup (Conditional) */}
      <div className="modal-mockup mt-8">
        <div className="card billing-section">
            <h3>Add New Purchase Record</h3>
            <div className="form-grid mt-4">
                <div className="form-group">
                    <label>Item Name</label>
                    <input type="text" placeholder="e.g. Printer Toner" />
                </div>
                <div className="form-group">
                    <label>Vendor Name</label>
                    <input type="text" placeholder="Where did you purchase it?" />
                </div>
                <div className="form-group">
                    <label>Qty Purchased</label>
                    <input type="number" />
                </div>
                <div className="form-group">
                    <label>Total Price</label>
                    <input type="number" />
                </div>
                <div className="form-group">
                    <label>Purchase Bill (Image)</label>
                    <div className="file-upload-box">
                        <ImageIcon size={20} />
                        <span>Click to upload bill image</span>
                    </div>
                </div>
            </div>
            <button className="btn btn-primary mt-4">Save Purchase Record</button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
