import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Wrench, CreditCard, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerPortalService } from '../../services/customerPortalService';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const contractStatus = (contract) => {
  const expiry = contract.expiryDate || contract.endDate || contract.expiry;
  if (!expiry) return 'active';
  const days = daysUntil(expiry);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'active';
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const contractIds = user?.contractIds || [];

  useEffect(() => {
    if (!contractIds.length) { setLoading(false); return; }
    Promise.all([
      customerPortalService.getContractsByIds(contractIds),
      customerPortalService.getRepairsByContractIds(contractIds),
      customerPortalService.getPaymentsByContractIds(contractIds),
      customerPortalService.getServiceRequests(contractIds),
    ]).then(([c, r, p, s]) => {
      setContracts(c);
      setRepairs(r);
      setPayments(p);
      setRequests(s);
    }).finally(() => setLoading(false));
  }, []);

  const activeCount = contracts.filter((c) => contractStatus(c) === 'active').length;
  const expiringCount = contracts.filter((c) => contractStatus(c) === 'expiring').length;
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const openRequests = requests.filter((r) => !['closed', 'resolved', 'completed'].includes(String(r.status || '').toLowerCase())).length;

  const stats = [
    { label: 'Active Contracts', value: activeCount, icon: CheckCircle, color: '#dcfce7', iconColor: '#15803d' },
    { label: 'Expiring Soon', value: expiringCount, icon: AlertTriangle, color: '#fef3c7', iconColor: '#92400e' },
    { label: 'Total Paid', value: money(totalPaid), icon: CreditCard, color: '#dbeafe', iconColor: '#1d4ed8' },
    { label: 'Open Requests', value: openRequests, icon: Clock, color: '#ede9fe', iconColor: '#6d28d9' },
  ];

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="cp-page-title">Welcome, {user?.customerName || 'Customer'}</h1>
      <p className="cp-page-sub">Here's an overview of all your services and contracts.</p>

      <div className="cp-stat-grid">
        {stats.map((s) => (
          <div className="cp-stat-card" key={s.label}>
            <div className="cp-stat-icon" style={{ background: s.color }}>
              <s.icon size={20} color={s.iconColor} />
            </div>
            <div className="cp-stat-body">
              <div className="cp-stat-label">{s.label}</div>
              <div className="cp-stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Contracts */}
      <div className="cp-card">
        <div className="cp-card-header">
          <h3>My Contracts</h3>
          <button onClick={() => navigate('/customer/contracts')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            View all <ArrowRight size={14} />
          </button>
        </div>
        {contracts.length === 0 ? (
          <div className="cp-empty"><FileText size={36} /><p>No contracts found.</p></div>
        ) : (
          <table className="cp-table">
            <thead><tr><th>Contract ID</th><th>Type</th><th>Expiry</th><th>Status</th></tr></thead>
            <tbody>
              {contracts.slice(0, 5).map((c) => {
                const st = contractStatus(c);
                return (
                  <tr key={c.id}>
                    <td><strong>{c.id}</strong></td>
                    <td>{c._contractType}</td>
                    <td>{c.expiryDate || c.endDate || c.expiry || '—'}</td>
                    <td>
                      <span className={`cp-badge ${st === 'active' ? 'cp-badge-green' : st === 'expiring' ? 'cp-badge-amber' : 'cp-badge-red'}`}>{st}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Repairs */}
      <div className="cp-card">
        <div className="cp-card-header">
          <h3>Recent Repairs</h3>
          <button onClick={() => navigate('/customer/repairs')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            View all <ArrowRight size={14} />
          </button>
        </div>
        {repairs.length === 0 ? (
          <div className="cp-empty"><Wrench size={36} /><p>No repair records found.</p></div>
        ) : (
          <table className="cp-table">
            <thead><tr><th>Contract</th><th>Parts</th><th>Billable</th><th>Date</th></tr></thead>
            <tbody>
              {repairs.slice(0, 5).map((r, i) => (
                <tr key={r.id || i}>
                  <td>{r.contractId}</td>
                  <td>{(r.parts || []).length} part(s)</td>
                  <td><strong style={{ color: '#15803d' }}>{money(r.billableAmount)}</strong></td>
                  <td>{(r.updatedAt || r.createdAt || '').slice(0, 10) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
