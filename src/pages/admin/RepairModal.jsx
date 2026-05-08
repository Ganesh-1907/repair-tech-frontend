import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, IndianRupee, Save, Loader2 } from 'lucide-react';
import { api } from '../../services/apiClient';
import './RepairModal.css';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const RepairModal = ({ contract, collection, onClose, showToast }) => {
  const contractId = contract?.contractId || contract?.id || '';

  const [partInput, setPartInput] = useState({ name: '', qty: 1, price: '' });
  const [savedParts, setSavedParts] = useState([]);
  const [pendingParts, setPendingParts] = useState([]);
  const [addLabour, setAddLabour] = useState(false);
  const [labour, setLabour] = useState('');
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await api.list(collection);
        const existing = Array.isArray(rows) ? rows.find((r) => r.contractId === contractId) : null;
        if (existing) {
          setRecordId(existing.id || existing._id || null);
          setSavedParts(Array.isArray(existing.parts) ? existing.parts : []);
          if (existing.labourCharge) { setAddLabour(true); setLabour(String(existing.labourCharge)); }
        }
      } catch (e) {
        console.error('Failed to load repair record:', e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [collection, contractId]);

  const handleAddPart = () => {
    if (!partInput.name.trim() || Number(partInput.qty) < 1 || partInput.price === '') return;
    setPendingParts((prev) => [...prev, { _pendingId: Date.now(), name: partInput.name.trim(), quantity: Number(partInput.qty), unitPrice: Number(partInput.price) }]);
    setPartInput({ name: '', qty: 1, price: '' });
  };

  const allParts = [...savedParts, ...pendingParts];
  const partsTotal = allParts.reduce((s, p) => s + Number(p.quantity) * Number(p.unitPrice), 0);
  const labourAmt = addLabour ? Number(labour) || 0 : 0;
  const grandTotal = partsTotal + labourAmt;
  const inputValid = partInput.name.trim() && Number(partInput.qty) > 0 && partInput.price !== '';

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        contractId,
        parts: allParts.map(({ _pendingId, ...p }) => p),
        labourCharge: addLabour ? Number(labour) || 0 : 0,
      };
      if (recordId) { await api.update(collection, recordId, payload); }
      else { await api.create(collection, payload); }
      if (showToast) showToast('Repair details saved successfully.');
      onClose();
    } catch (e) {
      if (showToast) showToast(e.message || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card repair-pricing-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="repair-pricing-header">
          <div>
            <div className="repair-pricing-kicker">
              <span className="repair-pricing-ticket">
                {contractId}
              </span>
              <span className="repair-pricing-label">Repair Management</span>
            </div>
            <h2>Parts &amp; Pricing</h2>
          </div>
          <button className="icon-button repair-pricing-close" onClick={onClose} aria-label="Close repair pricing">
            <X size={20} />
          </button>
        </div>

        <div className="repair-pricing-body">
          {loading ? (
            <div className="repair-pricing-loading">
              <Loader2 size={24} />
            </div>
          ) : (
            <>
              <div className="repair-pricing-add-section">
                <div className="repair-pricing-input-labels">
                  <span>Part Name</span>
                  <span>Quantity</span>
                  <span>Price (₹)</span>
                </div>
                <div className="repair-pricing-input-row">
                  <div className="repair-pricing-input-grid">
                    <input
                      className="repair-pricing-input"
                      placeholder="e.g. Display Panel"
                      value={partInput.name}
                      onChange={(e) => setPartInput((f) => ({ ...f, name: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && inputValid && handleAddPart()}
                    />
                    <input
                      type="number" min={1}
                      className="repair-pricing-input repair-pricing-input-center"
                      placeholder="1"
                      value={partInput.qty}
                      onChange={(e) => setPartInput((f) => ({ ...f, qty: e.target.value }))}
                    />
                    <div className="repair-pricing-money-field">
                      <IndianRupee size={13} />
                      <input
                        type="number" min={0}
                        className="repair-pricing-input"
                        placeholder="0"
                        value={partInput.price}
                        onChange={(e) => setPartInput((f) => ({ ...f, price: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && inputValid && handleAddPart()}
                      />
                    </div>
                  </div>
                  <button
                    className="primary-button repair-pricing-add-button"
                    onClick={handleAddPart}
                    disabled={!inputValid}
                  >
                    <Plus size={15} />
                    <span>Add Part</span>
                  </button>
                </div>
              </div>

              <div className="repair-pricing-labour-section">
                <label className="repair-pricing-check">
                  <input
                    type="checkbox"
                    checked={addLabour}
                    onChange={(e) => setAddLabour(e.target.checked)}
                  />
                  <span>Add Labour Charge</span>
                </label>
                {addLabour && (
                  <div className="repair-pricing-labour-collapse">
                    <div className="repair-pricing-labour-input">
                      <span>Amount</span>
                      <div className="repair-pricing-money-field">
                        <IndianRupee size={13} />
                        <input
                          type="number" min={0} autoFocus
                          className="repair-pricing-input"
                          placeholder="0"
                          value={labour}
                          onChange={(e) => setLabour(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {allParts.length > 0 && (
                <div className="repair-pricing-table-wrap">
                  <div className="repair-pricing-grid repair-pricing-table-head">
                    <span>#</span>
                    <span>Part Name</span>
                    <span>Qty</span>
                    <span>Unit Price</span>
                    <span>Subtotal</span>
                    <span />
                  </div>

                  {savedParts.map((p, i) => (
                    <div key={`s-${i}`} className="repair-pricing-grid repair-pricing-row">
                      <span className="repair-pricing-serial">{i + 1}</span>
                      <span className="repair-pricing-name">{p.name}</span>
                      <span className="repair-pricing-qty">×{p.quantity}</span>
                      <span className="repair-pricing-money">{fmt(Number(p.unitPrice))}</span>
                      <span className="repair-pricing-subtotal">{fmt(Number(p.quantity) * Number(p.unitPrice))}</span>
                      <div className="repair-pricing-action">
                        <button onClick={() => setSavedParts((prev) => prev.filter((_, idx) => idx !== i))}
                          className="repair-pricing-delete"
                          aria-label={`Remove ${p.name || 'part'}`}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingParts.map((p, i) => (
                    <div
                      key={p._pendingId}
                      className="repair-pricing-grid repair-pricing-row"
                    >
                      <span className="repair-pricing-serial">{savedParts.length + i + 1}</span>
                      <span className="repair-pricing-new-item">
                        <span className="repair-pricing-name">{p.name}</span>
                        <span>New</span>
                      </span>
                      <span className="repair-pricing-qty">×{p.quantity}</span>
                      <span className="repair-pricing-money">{fmt(Number(p.unitPrice))}</span>
                      <span className="repair-pricing-subtotal">{fmt(p.quantity * p.unitPrice)}</span>
                      <div className="repair-pricing-action">
                        <button onClick={() => setPendingParts((prev) => prev.filter((x) => x._pendingId !== p._pendingId))}
                          className="repair-pricing-delete"
                          aria-label={`Remove ${p.name || 'part'}`}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {addLabour && (
                    <div className="repair-pricing-grid repair-pricing-row repair-pricing-labour-row">
                      <span className="repair-pricing-serial">{allParts.length + 1}</span>
                      <span>Labour Charge</span>
                      <span />
                      <span />
                      <span className="repair-pricing-labour-total">{fmt(labourAmt)}</span>
                      <span />
                    </div>
                  )}

                  <div className="repair-pricing-grid repair-pricing-total-row">
                    <span />
                    <span>Total</span>
                    <span />
                    <span />
                    <span>{fmt(grandTotal)}</span>
                    <span />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="repair-pricing-footer">
          <button className="secondary-button repair-pricing-cancel" onClick={onClose}>Cancel</button>
          <button className="primary-button repair-pricing-save" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="repair-pricing-spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving…' : 'Save Repair Details'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairModal;
