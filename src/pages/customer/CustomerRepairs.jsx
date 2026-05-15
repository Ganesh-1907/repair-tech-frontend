import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerPortalService } from '../../services/customerPortalService';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const CustomerRepairs = () => {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const ids = user?.contractIds || [];
    if (!ids.length) { setLoading(false); return; }
    customerPortalService.getRepairsByContractIds(ids)
      .then(setRepairs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading repair history...</div>;

  return (
    <div>
      <h1 className="cp-page-title">Repair History</h1>
      <p className="cp-page-sub">All service and repair records for your contracts.</p>

      <div className="cp-card">
        {repairs.length === 0 ? (
          <div className="cp-empty"><Wrench size={40} /><p>No repair records found.</p></div>
        ) : (
          <table className="cp-table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Date</th>
                <th>Parts</th>
                <th>Cost (Internal)</th>
                <th>Covered</th>
                <th>Billable</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((r, idx) => {
                const isOpen = expanded === (r.id || idx);
                const parts = Array.isArray(r.parts) ? r.parts : [];
                return (
                  <React.Fragment key={r.id || idx}>
                    <tr>
                      <td><strong>{r.contractId}</strong></td>
                      <td>{(r.updatedAt || r.createdAt || '').slice(0, 10) || '—'}</td>
                      <td>{parts.length}</td>
                      <td>{money(r.costAmount)}</td>
                      <td><span className="cp-badge cp-badge-green">{money(r.coveredAmount)}</span></td>
                      <td><strong style={{ color: r.billableAmount > 0 ? '#dc2626' : '#15803d' }}>{money(r.billableAmount)}</strong></td>
                      <td>
                        {parts.length > 0 && (
                          <button onClick={() => setExpanded(isOpen ? null : (r.id || idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 600 }}>
                            Parts {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isOpen && parts.length > 0 && (
                      <tr className="cp-expand-row">
                        <td colSpan={7}>
                          <div className="cp-expand-inner">
                            <table className="cp-table" style={{ fontSize: '0.82rem' }}>
                              <thead><tr><th>#</th><th>Part Name</th><th>Serial</th><th>Qty</th><th>Cost</th><th>Covered</th><th>Selling</th></tr></thead>
                              <tbody>
                                {parts.map((p, i) => (
                                  <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{p.partName}</td>
                                    <td>{p.serialNumber || '—'}</td>
                                    <td>×{p.quantity || 1}</td>
                                    <td>{money((p.quantity || 1) * (p.cost || 0))}</td>
                                    <td>{p.coveredUnderAmc ? <span className="cp-badge cp-badge-green">Yes</span> : <span className="cp-badge cp-badge-red">No</span>}</td>
                                    <td>{money((p.quantity || 1) * (p.selling || 0))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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

export default CustomerRepairs;
