import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Send, 
  Printer, 
  CheckCircle,
  Eye,
  EyeOff,
  Search,
  MessageSquare,
  FileText
} from 'lucide-react';
import { mockDashboardData } from '../data/mockData';

const Billing = () => {
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstOption, setGstOption] = useState('extra'); // 'extra' or 'include'
  const [customer, setCustomer] = useState({
    name: '',
    company: '',
    mobile: '',
    email: '',
  });
  const [billToSelf, setBillToSelf] = useState(true);
  const [sendTo, setSendTo] = useState({
    name: '',
    mobile: '',
    email: '',
  });

  const [items, setItems] = useState([
    { id: 1, name: 'Cartridge Refilling', qty: 1, rate: 350, amount: 350 }
  ]);

  const [usedParts, setUsedParts] = useState([
    { id: 1, name: 'Toner Powder', qty: '50g', selected: true, visible: true },
    { id: 2, name: 'Drum', qty: '1', selected: true, visible: true },
    { id: 3, name: 'Wiper', qty: '1', selected: false, visible: true },
  ]);

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const gstRate = 0.18;
  const gstAmount = isGstEnabled ? (gstOption === 'extra' ? subtotal * gstRate : subtotal - (subtotal / (1 + gstRate))) : 0;
  const total = isGstEnabled ? (gstOption === 'extra' ? subtotal + gstAmount : subtotal) : subtotal;

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), name: '', qty: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.amount = updated.qty * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  const togglePartSelection = (id) => {
    setUsedParts(parts => parts.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const togglePartVisibility = (id) => {
    setUsedParts(parts => parts.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
  };

  return (
    <div className="billing-page">
      <header className="page-header">
        <div>
          <h1>Create Invoice</h1>
          <p>Generate service bills and track inventory deduction.</p>
        </div>
      </header>

      <div className="billing-grid">
        <div className="billing-main">
          {/* GST Toggle */}
          <div className="card billing-section">
            <div className="gst-toggle-row">
                <label className="checkbox-container">
                    <input 
                        type="checkbox" 
                        checked={isGstEnabled} 
                        onChange={() => setIsGstEnabled(!isGstEnabled)} 
                    />
                    <span className="checkmark"></span>
                    <span className="label-text">Create GST Invoice</span>
                </label>
            </div>
          </div>

          {/* Customer Selection */}
          <div className="card billing-section">
            <div className="section-header">
                <h3>Customer Details</h3>
                <div className="search-box sm">
                    <Search size={14} className="search-icon" />
                    <input type="text" placeholder="Auto-fill from leads..." />
                </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input type="text" value={customer.company} onChange={(e) => setCustomer({...customer, company: e.target.value})} />
              </div>
            </div>
            <div className="form-row mt-2">
              <div className="form-group">
                <label>Mobile</label>
                <input type="text" value={customer.mobile} onChange={(e) => setCustomer({...customer, mobile: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={customer.email} onChange={(e) => setCustomer({...customer, email: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Bill To / Send To */}
          <div className="card billing-section">
            <div className="section-header">
                <h3>Delivery Details</h3>
            </div>
            <div className="bill-to-options">
                <button 
                    className={`btn-toggle ${billToSelf ? 'active' : ''}`}
                    onClick={() => setBillToSelf(true)}
                >Bill To Customer</button>
                <button 
                    className={`btn-toggle ${!billToSelf ? 'active' : ''}`}
                    onClick={() => setBillToSelf(false)}
                >Send To Other Person</button>
            </div>

            {!billToSelf && (
                <div className="send-to-form mt-4">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Recipient Name</label>
                            <input type="text" placeholder="Name" />
                        </div>
                        <div className="form-group">
                            <label>Recipient Mobile</label>
                            <input type="text" placeholder="Mobile" />
                        </div>
                        <div className="form-group">
                            <label>Recipient Email</label>
                            <input type="text" placeholder="Email" />
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* Items / Services */}
          <div className="card billing-section">
            <div className="section-header">
                <h3>Items / Services</h3>
                <button className="btn btn-sm btn-outline" onClick={handleAddItem}>
                    <Plus size={14} /> Add Item
                </button>
            </div>
            <table className="items-table">
                <thead>
                    <tr>
                        <th style={{ width: '40%' }}>Item Name</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>
                                <input 
                                    className="table-input"
                                    type="text" 
                                    value={item.name} 
                                    onChange={(e) => updateItem(item.id, 'name', e.target.value)} 
                                />
                            </td>
                            <td>
                                <input 
                                    className="table-input center"
                                    type="number" 
                                    value={item.qty} 
                                    onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} 
                                />
                            </td>
                            <td>
                                <input 
                                    className="table-input"
                                    type="number" 
                                    value={item.rate} 
                                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} 
                                />
                            </td>
                            <td className="bold">₹{item.amount}</td>
                            <td>
                                <button className="icon-btn danger" onClick={() => removeItem(item.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>

          {/* Used Parts */}
          <div className="card billing-section used-parts-section">
            <div className="section-header">
                <div className="title-with-icon">
                    <span role="img" aria-label="tools">🔧</span>
                    <h3>USED PARTS (Inventory Deduction)</h3>
                </div>
            </div>
            <p className="section-subtitle">Checked items will be deducted from inventory. Visibility toggle controls if they appear on bill.</p>
            
            <div className="parts-list">
                {usedParts.map(part => (
                    <div key={part.id} className="part-item-row">
                        <div className="part-main">
                            <label className="checkbox-container">
                                <input 
                                    type="checkbox" 
                                    checked={part.selected} 
                                    onChange={() => togglePartSelection(part.id)} 
                                />
                                <span className="checkmark"></span>
                                <span className="part-name-text">{part.name}</span>
                            </label>
                            <div className="part-qty-tag">Qty: {part.qty}</div>
                        </div>
                        <div className="part-actions">
                            <button 
                                className={`icon-btn visibility-btn ${part.visible ? 'visible' : 'hidden'}`}
                                onClick={() => togglePartVisibility(part.id)}
                                title={part.visible ? "Visible on Invoice" : "Hidden on Invoice"}
                            >
                                {part.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="billing-side">
          {/* Summary Card */}
          <div className="card summary-card sticky-sidebar">
            <h3 className="summary-title">Invoice Summary</h3>
            
            {isGstEnabled && (
                <div className="gst-options-group">
                    <label className="radio-container">
                        <input 
                            type="radio" 
                            name="gstOption" 
                            checked={gstOption === 'include'} 
                            onChange={() => setGstOption('include')}
                        />
                        <span className="radio-checkmark"></span>
                        <span>Include GST</span>
                    </label>
                    <label className="radio-container">
                        <input 
                            type="radio" 
                            name="gstOption" 
                            checked={gstOption === 'extra'} 
                            onChange={() => setGstOption('extra')}
                        />
                        <span className="radio-checkmark"></span>
                        <span>Add GST Extra</span>
                    </label>
                </div>
            )}

            <div className="summary-lines">
                <div className="summary-line">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {isGstEnabled && (
                    <div className="summary-line highlight">
                        <span>GST (18%)</span>
                        <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="summary-total">
                    <span>TOTAL</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
            </div>

            <div className="billing-actions">
                <button className="btn btn-primary btn-full">
                    <CheckCircle size={18} /> Generate Invoice
                </button>
                <div className="btn-group-row">
                    <button className="btn btn-secondary flex-1"><Printer size={16} /> Print</button>
                    <button className="btn btn-secondary flex-1 whatsapp-btn"><MessageSquare size={16} /> WhatsApp</button>
                </div>
                <button className="btn btn-secondary btn-full"><Send size={16} /> Send Email</button>
            </div>

            <div className="terms-container mt-4">
                <label>Terms & Conditions</label>
                <textarea 
                    className="terms-input"
                    defaultValue="1. Goods once sold will not be taken back.
2. Subject to local jurisdiction."
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
