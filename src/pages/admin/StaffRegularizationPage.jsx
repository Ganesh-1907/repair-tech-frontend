import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Loader2, Check, X } from 'lucide-react';
import { staffManagementService } from '../../services/staffManagementService';

const statusColors = {
  Pending: { bg: '#fef3c7', color: '#92400e' },
  Approved: { bg: '#dcfce7', color: '#166534' },
  Rejected: { bg: '#fee2e2', color: '#991b1b' },
};

const formatTime = (t) => {
  if (!t) return '-';
  try { return new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); }
  catch { return t; }
};

const StaffRegularizationPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const rows = await staffManagementService.getAttendanceRegularizations();
        if (!cancelled) setRequests(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setNotice('Failed to load regularization requests.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const processRequest = async (request, status) => {
    try {
      await staffManagementService.updateAttendanceRegularization(request.id, { status });
      setNotice(`Regularization ${status.toLowerCase()} for ${request.staffName}.`);
      const rows = await staffManagementService.getAttendanceRegularizations();
      setRequests(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setNotice(e?.response?.data?.message || 'Failed to update request.');
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch = !search ||
        (r.staffName || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.staffId || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchesDate = !dateFilter || (r.attendanceDate === dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [requests, search, statusFilter, dateFilter]);

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Attendance Regularization</h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>Review and process staff attendance regularization requests.</p>
      </div>

      {notice && (
        <div className="success-banner" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')}>✕</button>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16, padding: '12px 18px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input type="text" placeholder="Search by name or staff ID..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.88rem', color: '#0f172a', background: 'transparent' }} />
        </div>
        <div className="filter-group" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={16} style={{ color: '#94a3b8' }} />
          {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                background: statusFilter === s ? '#6366f1' : '#f1f5f9',
                color: statusFilter === s ? '#fff' : '#475569',
                fontSize: '0.8rem', fontWeight: 600,
              }}>
              {s}
            </button>
          ))}
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', fontSize: '0.82rem', color: '#0f172a' }} />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}><Loader2 size={24} className="spin-slow" /> Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>No regularization requests found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Requested Out</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => {
                const sc = statusColors[r.status] || { bg: '#f1f5f9', color: '#475569' };
                return (
                  <tr key={r.id}>
                    <td><strong>{r.staffName || '-'}</strong></td>
                    <td>{r.attendanceDate || '-'}</td>
                    <td>{formatTime(r.clockInAt)}</td>
                    <td>{formatTime(r.requestedClockOutAt)}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reason || '-'}</td>
                    <td><span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, background: sc.bg, color: sc.color, fontSize: '0.75rem', fontWeight: 700 }}>{r.status}</span></td>
                    <td>
                      {r.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => processRequest(r, 'Approved')}>
                            <Check size={14} /> Approve
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => processRequest(r, 'Rejected')}>
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StaffRegularizationPage;
