import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerPortalService } from '../../services/customerPortalService';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const fmtDate = (v) => {
  if (!v) return '—';
  try { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(v)); }
  catch { return v; }
};

const CustomerPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = user?.contractIds || [];
    if (!ids.length) { setLoading(false); return; }
    customerPortalService.getPaymentsByContractIds(ids)
      .then(setPayments)
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(() => payments.reduce((s, p) => s + Number(p.amount || 0), 0), [payments]);

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading payments...</div>;

  return (
    <div>
      <h1 className="cp-page-title">Payments</h1>
      <p className="cp-page-sub">Invoice and payment records for your contracts.</p>

      {payments.length > 0 && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <CreditCard size={20} color="#15803d" />
          <span style={{ color: '#15803d', fontWeight: 700 }}>Total Paid: {money(total)}</span>
          <span style={{ color: '#15803d', fontSize: '0.85rem' }}>across {payments.length} payment(s)</span>
        </div>
      )}

      <div className="cp-card">
        {payments.length === 0 ? (
          <div className="cp-empty"><CreditCard size={40} /><p>No payment records found.</p></div>
        ) : (
          <table className="cp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Contract</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id || i}>
                  <td>{fmtDate(p.expenseDate)}</td>
                  <td>{p.referenceNumber || '—'}</td>
                  <td>{p.description || '—'}</td>
                  <td><strong style={{ color: '#15803d' }}>{money(p.amount)}</strong></td>
                  <td>{p.paymentMode || '—'}</td>
                  <td><span className="cp-badge cp-badge-blue">{p.category || 'Payment'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerPayments;
