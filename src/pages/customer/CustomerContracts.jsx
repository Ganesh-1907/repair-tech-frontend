import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerPortalService } from '../../services/customerPortalService';

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
};

const statusOf = (contract) => {
  const expiry = contract.expiryDate || contract.endDate || contract.expiry;
  if (!expiry) return 'active';
  const days = daysUntil(expiry);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'active';
};

const getPlan = (c) =>
  c.amcDetails?.planName || c.cmcDetails?.planName || c.planName || c.plan || '—';

const getDevices = (c) =>
  c.amcDetails?.devices || c.cmcDetails?.devices || c.devices || [];

const CustomerContracts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const ids = user?.contractIds || [];
    if (!ids.length) { setLoading(false); return; }
    customerPortalService.getContractsByIds(ids)
      .then((data) => {
        setContracts(data);
        const types = [...new Set((data || []).map((c) => c._contractType || ''))].filter(Boolean);
        if (types.length > 1) {
          setActiveTab(types[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const uniqueTypes = [...new Set(contracts.map((c) => c._contractType || ''))].filter(Boolean);
  const displayedContracts = uniqueTypes.length > 1
    ? contracts.filter((c) => c._contractType === activeTab)
    : contracts;

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading contracts...</div>;

  return (
    <div>
      <h1 className="cp-page-title">My Contracts</h1>
      <p className="cp-page-sub">All AMC, CMC, Rental and Lead contracts linked to your account.</p>

      {uniqueTypes.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          {uniqueTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveTab(type);
                setExpanded(null);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === type ? '#ffffff' : 'transparent',
                color: activeTab === type ? '#4f46e5' : '#64748b',
                boxShadow: activeTab === type ? '0 2px 4px rgba(79, 70, 229, 0.08)' : 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      <div className="cp-card">
        {displayedContracts.length === 0 ? (
          <div className="cp-empty"><FileText size={40} /><p>No contracts found for your account.</p></div>
        ) : (
          <table className="cp-table">
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Type</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedContracts.map((c) => {
                const st = statusOf(c);
                const isOpen = expanded === c.id;
                const devices = getDevices(c);
                return (
                  <React.Fragment key={c.id}>
                    <tr>
                      <td><strong>{c.id}</strong></td>
                      <td><span className={`cp-badge ${c._contractType === 'AMC' ? 'cp-badge-blue' : c._contractType === 'CMC' ? 'cp-badge-purple' : 'cp-badge-green'}`}>{c._contractType}</span></td>
                      <td>{getPlan(c)}</td>
                      <td>{(c.startDate || c.start || '').slice(0, 10) || '—'}</td>
                      <td>{(c.expiryDate || c.endDate || c.expiry || '').slice(0, 10) || '—'}</td>
                      <td>
                        <span className={`cp-badge ${st === 'active' ? 'cp-badge-green' : st === 'expiring' ? 'cp-badge-amber' : 'cp-badge-red'}`}>{st}</span>
                      </td>
                      <td>
                        {['AMC', 'CMC'].includes(c._contractType) ? (
                          <button 
                            onClick={() => navigate(`/customer/contracts/${c._contractType.toLowerCase()}/view/${c.id}`)} 
                            className="primary-button" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', height: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <FileText size={14} /> View Details
                          </button>
                        ) : (
                          <button onClick={() => setExpanded(isOpen ? null : c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 600 }}>
                            {isOpen ? 'Hide Details' : 'Show Details'} {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isOpen && !['AMC', 'CMC'].includes(c._contractType) && (
                      <tr className="cp-expand-row">
                        <td colSpan={7}>
                          <div className="cp-expand-inner">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: devices.length ? 16 : 0 }}>
                              {[
                                ['Customer', c.customerName || c.name || '—'],
                                ['Address', c.amcDetails?.address || c.cmcDetails?.address || c.address || '—'],
                                ['Contact', c.amcDetails?.primaryContact?.mobile || c.primaryMobile || '—'],
                                ['SLA', c.amcDetails?.sla || c.cmcDetails?.slaResponseTime || '—'],
                                ['Billing', c.billingCycle || '—'],
                                ['Value', c.amcDetails?.revenue ? `₹${Number(c.amcDetails.revenue).toLocaleString('en-IN')}` : (c.value ? `₹${Number(c.value).toLocaleString('en-IN')}` : '—')],
                              ].map(([label, val]) => (
                                <div key={label}>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                                  <div style={{ fontSize: '0.88rem', color: '#0f172a' }}>{val}</div>
                                </div>
                              ))}
                            </div>
                            {devices.length > 0 && (
                              <>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', marginBottom: 8 }}>Covered Devices ({devices.length})</div>
                                <table className="cp-table" style={{ fontSize: '0.82rem' }}>
                                  <thead><tr><th>Type</th><th>Brand / Model</th><th>Serial</th></tr></thead>
                                  <tbody>
                                    {devices.map((d, i) => (
                                      <tr key={i}>
                                        <td>{d.type || d.deviceType || '—'}</td>
                                        <td>{[d.brand, d.model].filter(Boolean).join(' ') || '—'}</td>
                                        <td>{d.serialNumber || d.serial || d.serialNo || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerContracts;
