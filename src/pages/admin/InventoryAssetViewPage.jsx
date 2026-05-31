import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { assetManagementService } from '../../services/assetManagementService';
import { useToast } from '../../context/ToastContext';
import './PlansCustomers.css';
import '../InventoryPremiumStyles.css';

const v = (value) => value || '-';
const money = (value) => Number(value) > 0 ? `₹${Number(value).toLocaleString('en-IN')}` : '-';

const ROField = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '0.92rem', color: '#111827', fontWeight: 500 }}>{v(value)}</span>
  </div>
);

const FieldRow = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 24px', marginBottom: 20 }}>
    {children}
  </div>
);

const SubTitle = ({ children }) => (
  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 0 6px', borderBottom: '1px solid #e8e6fd', marginBottom: 16 }}>
    {children}
  </div>
);

const ConfigTable = ({ configs, cols }) => {
  const hasCols2 = cols === 2;
  const hasData = configs.some((c) => c.name || c.specification || c.serialNumber);
  if (!hasData) return <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>-</span>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: 4 }}>
      <thead>
        <tr style={{ background: '#f1f0fe' }}>
          <th style={{ textAlign: 'left', padding: '6px 10px', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Name</th>
          <th style={{ textAlign: 'left', padding: '6px 10px', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Specification</th>
          {!hasCols2 && <th style={{ textAlign: 'left', padding: '6px 10px', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Serial Number</th>}
        </tr>
      </thead>
      <tbody>
        {configs.map((c, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '7px 10px', color: '#111827' }}>{c.name || '-'}</td>
            <td style={{ padding: '7px 10px', color: '#111827' }}>{c.specification || '-'}</td>
            {!hasCols2 && <td style={{ padding: '7px 10px', color: '#111827' }}>{c.serialNumber || '-'}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const DeviceView = ({ asset }) => {
  const d = asset.deviceDetails || {};
  const type = asset.type || d.type || '';

  if (type === 'Laptop') {
    const configs = Array.isArray(d.configurations) ? d.configurations : [];
    return (
      <>
        <FieldRow>
          <ROField label="Brand" value={asset.brand || d.brand} />
          <ROField label="Model" value={asset.model || d.model} />
          <ROField label="Location" value={asset.location || d.location} />
        </FieldRow>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: 8 }}>Configurations</span>
          <ConfigTable configs={configs} cols={3} />
        </div>
      </>
    );
  }

  if (type === 'Desktop' || type === 'Server') {
    const cpu = d.cpu || {};
    const mon = d.monitor || {};
    return (
      <>
        <SubTitle>CPU</SubTitle>
        <FieldRow>
          <ROField label="CPU Type" value={cpu.subType} />
          <ROField label="Brand" value={cpu.brand} />
          <ROField label="Model" value={cpu.model} />
        </FieldRow>
        <FieldRow>
          <ROField label="Configuration" value={cpu.config} />
          <ROField label="Location" value={cpu.location} />
          <div />
        </FieldRow>
        <SubTitle>Monitor</SubTitle>
        <FieldRow>
          <ROField label="Monitor Type" value={mon.subType} />
          <ROField label="Brand" value={mon.brand} />
          <ROField label="Serial Number" value={mon.serialNumber} />
        </FieldRow>
        <FieldRow>
          <ROField label="Location" value={mon.location} />
          <div /><div />
        </FieldRow>
      </>
    );
  }

  if (type === 'Printer') {
    return (
      <>
        <FieldRow>
          <ROField label="Type" value={asset.subType || d.subType} />
          <ROField label="Brand" value={asset.brand || d.brand} />
          <ROField label="Model" value={asset.model || d.model} />
        </FieldRow>
        <FieldRow>
          <ROField label="Serial Number" value={d.serialNumber || asset.serialNumber} />
          <ROField label="Page Count" value={d.pageCount} />
          <ROField label="Location" value={asset.location || d.location} />
        </FieldRow>
        <FieldRow>
          <ROField label="Notes" value={d.notes || d.inputField} />
          <div /><div />
        </FieldRow>
      </>
    );
  }

  if (type === 'CCTV') {
    const specs = Array.isArray(d.specs) ? d.specs.filter(Boolean) : [];
    return (
      <>
        <FieldRow>
          <ROField label="Type" value={asset.subType || d.subType} />
          <ROField label="Brand" value={asset.brand || d.brand} />
          <ROField label="Model" value={asset.model || d.model} />
        </FieldRow>
        <FieldRow>
          <ROField label="Serial Number" value={asset.serialNumber || d.serialNumber} />
          <ROField label="Location" value={asset.location || d.location} />
          <div />
        </FieldRow>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: 6 }}>Specifications</span>
          <span style={{ fontSize: '0.9rem', color: '#111827' }}>{specs.join(' | ') || '-'}</span>
        </div>
      </>
    );
  }

  if (type === 'VPS') {
    const configs = Array.isArray(d.configurations) ? d.configurations : [];
    return (
      <>
        <FieldRow>
          <ROField label="Provider / Brand" value={asset.brand || d.brand} />
          <ROField label="Plan / Instance Type" value={asset.model || d.model} />
          <ROField label="Instance ID / Serial" value={asset.serialNumber || d.serialNumber} />
        </FieldRow>
        <FieldRow>
          <ROField label="Region / Location" value={asset.location || d.location} />
          <div /><div />
        </FieldRow>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: 8 }}>Specifications</span>
          <ConfigTable configs={configs} cols={2} />
        </div>
      </>
    );
  }

  // Generic / custom device type
  const configs = Array.isArray(d.configurations) ? d.configurations : [];
  return (
    <>
      <FieldRow>
        <ROField label="Brand" value={asset.brand || d.brand} />
        <ROField label="Model" value={asset.model || d.model} />
        <ROField label="Serial Number" value={asset.serialNumber || d.serialNumber} />
      </FieldRow>
      <FieldRow>
        <ROField label="Location" value={asset.location || d.location} />
        <div /><div />
      </FieldRow>
      {configs.length > 0 && (
        <div>
          <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: 8 }}>Specifications</span>
          <ConfigTable configs={configs} cols={2} />
        </div>
      )}
    </>
  );
};

const InventoryAssetViewPage = () => {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const { addToast } = useToast();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assetManagementService.getAssetById(assetId)
      .then(setAsset)
      .catch((err) => addToast(err.response?.data?.message || err.message || 'Failed to load asset.', 'error'))
      .finally(() => setLoading(false));
  }, [assetId, addToast]);

  if (loading) {
    return (
      <div className="amc-new-page">
        <div className="table-card" style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <strong>Loading asset...</strong>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="amc-new-page">
        <div className="table-card" style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <strong>Asset not found.</strong>
        </div>
      </div>
    );
  }

  const type = asset.type || asset.deviceDetails?.type || '';
  const payment = asset.payment;

  return (
    <div className="amc-new-page">
      <div className="amc-new-page-header">
        <button className="back-button" onClick={() => navigate('/admin/inventory')}>
          <ArrowLeft size={18} /> Back to Inventory
        </button>
        <div className="amc-new-page-title">
          <h1>Asset Details</h1>
          <p>{asset.assetTag || asset.id} — {type}</p>
        </div>
        <div className="amc-new-page-actions">
          <button className="secondary-button" onClick={() => navigate('/admin/inventory')}>Close</button>
          <button className="primary-button" onClick={() => navigate(`/admin/inventory/assets/${assetId}/edit`)}>
            <Edit size={16} /> Edit Asset
          </button>
        </div>
      </div>

      <div className="amc-new-page-body">
        {/* Section 1: Asset Identity */}
        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title">1. Asset Identity</h2>
          </div>
          <div className="amc-form-card-body">
            <FieldRow>
              <ROField label="Device ID" value={asset.assetTag || asset.id} />
              <ROField label="Serial Number" value={asset.serialNumber} />
              <ROField label="Status" value={asset.status} />
            </FieldRow>
          </div>
        </div>

        {/* Section 2: Device Details */}
        <div className="amc-form-card card-devices">
          <div className="amc-form-card-header device-registry-header">
            <h2 className="amc-form-section-title">2. Device Details</h2>
            <span style={{ background: '#ede9fe', color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem', padding: '4px 14px', borderRadius: 20 }}>{type}</span>
          </div>
          <div className="amc-form-card-body">
            <div className="device-accordion open">
              <div className="accordion-header">
                <div className="accordion-title-area">
                  <span className="accordion-device-index">Device</span>
                  <span className="accordion-device-type-badge">{type}</span>
                </div>
              </div>
              <div className="accordion-body">
                <DeviceView asset={asset} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Add-on Parts */}
        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title">3. Add-on Parts</h2>
          </div>
          <div className="amc-form-card-body">
            <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: 6 }}>Add-on Parts</span>
            <span style={{ fontSize: '0.92rem', color: '#111827', whiteSpace: 'pre-wrap' }}>{v(asset.addOnParts)}</span>
          </div>
        </div>

        {/* Section 4: Payment */}
        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title">4. Payment</h2>
          </div>
          <div className="amc-form-card-body">
            {!payment ? (
              <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>No payment recorded.</span>
            ) : (
              <>
                <FieldRow>
                  <ROField label="Total Amount" value={money(payment.totalAmount)} />
                  <ROField label="Payment Due Date" value={payment.dueDate || '-'} />
                  <div />
                </FieldRow>
                {Array.isArray(payment.rows) && payment.rows.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: 8 }}>Payment Entries</span>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: '#f1f0fe' }}>
                            {['Payment Mode', 'Amount (₹)', 'Transaction ID'].map((h) => (
                              <th key={h} style={{ textAlign: 'left', padding: '7px 12px', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {payment.rows.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 12px' }}>{row.mode || '-'}</td>
                              <td style={{ padding: '8px 12px' }}>{row.amount ? `₹${Number(row.amount).toLocaleString('en-IN')}` : '-'}</td>
                              <td style={{ padding: '8px 12px', color: '#64748b' }}>{row.txnId || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {(() => {
                      const totalPaid = payment.rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
                      const remaining = Math.max(0, (Number(payment.totalAmount) || 0) - totalPaid);
                      return (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 20, fontSize: '0.82rem', color: '#64748b' }}>
                          <span>Total Paid: <strong style={{ color: '#0f172a' }}>₹{totalPaid.toLocaleString('en-IN')}</strong></span>
                          <span>Remaining: <strong style={{ color: remaining > 0 ? '#ef4444' : '#16a34a' }}>₹{remaining.toLocaleString('en-IN')}</strong></span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="amc-form-footer">
          <button className="secondary-button" onClick={() => navigate('/admin/inventory')}>Close</button>
          <button className="primary-button" onClick={() => navigate(`/admin/inventory/assets/${assetId}/edit`)}>
            <Edit size={16} /> Edit Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryAssetViewPage;
