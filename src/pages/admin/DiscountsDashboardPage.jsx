import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag, TicketPercent, CheckCircle2, XCircle, Clock,
  TrendingDown, Users, BarChart3, Loader2, RefreshCcw,
  ChevronRight, IndianRupee, Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { discountService, getCouponTypeMeta } from '../../services/discountService';

const COUPON_TYPES = [
  { value: 'all_users',      label: 'All Users',      color: '#4f46e5', bg: '#eef2ff' },
  { value: 'selected_users', label: 'Selected Users', color: '#0891b2', bg: '#ecfeff' },
  { value: 'welcome',        label: 'Welcome',        color: '#059669', bg: '#ecfdf5' },
  { value: 'limited_time',   label: 'Limited Time',   color: '#d97706', bg: '#fffbeb' },
];
import './DiscountsModule.css';

const fmt = (n) => (n ?? 0).toLocaleString('en-IN');
const fmtRupee = (n) => `₹${fmt(n)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconColor, delay }) => (
  <motion.div
    className="disc-stat-card"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div className="disc-stat-icon" style={{ background: iconBg }}>
      <Icon size={18} color={iconColor} strokeWidth={2.5} />
    </div>
    <div className="disc-stat-label">{label}</div>
    <div className="disc-stat-value">{value}</div>
    {sub && <div className="disc-stat-sub">{sub}</div>}
  </motion.div>
);

export default function DiscountsDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dash = await discountService.getDashboard();
      setData(dash);
    } catch {
      setError('Failed to load dashboard. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxType = data
    ? Math.max(...Object.values(data.byType || {}).map(Number), 1)
    : 1;

  return (
    <div className="disc-page">
      {/* Header */}
      <div className="disc-header-card">
        <div>
          <div className="disc-breadcrumb">
            <span>Admin</span>
            <ChevronRight size={12} />
            <strong>Discounts</strong>
            <ChevronRight size={12} />
            <span>Dashboard</span>
          </div>
          <div className="disc-header-title">Discounts Dashboard</div>
          <div className="disc-header-subtitle">
            Monitor coupon performance, usage, and revenue impact
          </div>
        </div>
        <div className="disc-header-actions">
          <button className="disc-btn disc-btn-ghost" onClick={load} disabled={loading}>
            <RefreshCcw size={14} />
            Refresh
          </button>
          <button
            className="disc-btn disc-btn-primary"
            onClick={() => navigate('/admin/discounts/codes')}
          >
            <Tag size={14} />
            Manage Codes
          </button>
        </div>
      </div>

      {error && <div className="disc-error">{error}</div>}

      {loading ? (
        <div className="disc-loader">
          <Loader2 size={20} className="spin" />
          Loading dashboard…
        </div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div className="disc-stats-grid">
            <StatCard delay={0}    icon={TicketPercent} label="Total Coupons"    value={fmt(data.total)}             iconBg="#eef2ff" iconColor="#4f46e5" />
            <StatCard delay={0.05} icon={CheckCircle2}  label="Active"           value={fmt(data.active)}            iconBg="#f0fdf4" iconColor="#16a34a" />
            <StatCard delay={0.1}  icon={Clock}          label="Expired"          value={fmt(data.expired)}           iconBg="#fffbeb" iconColor="#d97706" />
            <StatCard delay={0.15} icon={XCircle}        label="Disabled"         value={fmt(data.disabled)}          iconBg="#fef2f2" iconColor="#dc2626" />
            <StatCard delay={0.2}  icon={Zap}            label="Total Times Used" value={fmt(data.totalUsed)}         iconBg="#f5f3ff" iconColor="#7c3aed" />
            <StatCard delay={0.25} icon={IndianRupee}    label="Discount Given"   value={fmtRupee(data.totalDiscountGiven)} sub="revenue impact" iconBg="#ecfdf5" iconColor="#059669" />
          </div>

          {/* Middle grid */}
          <div className="disc-dash-grid">
            {/* Type Breakdown */}
            <div className="disc-card">
              <div className="disc-card-title">
                <BarChart3 size={16} color="#4f46e5" />
                Coupons by Type
              </div>
              {Object.keys(data.byType || {}).length === 0 ? (
                <div className="disc-empty" style={{ minHeight: 120 }}>
                  <p>No coupons created yet</p>
                </div>
              ) : (
                <div className="disc-type-list">
                  {COUPON_TYPES.map((t) => {
                    const count = data.byType[t.value] || 0;
                    return (
                      <div key={t.value} className="disc-type-row">
                        <span
                          className="disc-type-badge"
                          style={{ background: t.bg, color: t.color }}
                        >
                          {t.label}
                        </span>
                        <div className="disc-type-bar-wrap">
                          <motion.div
                            className="disc-type-bar"
                            style={{ background: t.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / maxType) * 100}%` }}
                            transition={{ duration: .6, delay: .1 }}
                          />
                        </div>
                        <span className="disc-type-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Performing Coupons */}
            <div className="disc-card">
              <div className="disc-card-title">
                <TrendingDown size={16} color="#059669" />
                Top Performing Coupons
              </div>
              {(data.topCoupons || []).length === 0 ? (
                <div className="disc-empty" style={{ minHeight: 120 }}>
                  <p>No usage data yet</p>
                </div>
              ) : (
                <div className="disc-table-wrap">
                  <table className="disc-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Used</th>
                        <th>Discount Given</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topCoupons.map((c) => {
                        const meta = getCouponTypeMeta(c.type);
                        return (
                          <tr key={c.id}>
                            <td>
                              <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{c.code}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>
                                <span style={{ background: meta.bg, color: meta.color, padding: '1px 7px', borderRadius: 20, fontWeight: 700 }}>
                                  {meta.label}
                                </span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 700 }}>{c.usageCount}×</td>
                            <td style={{ fontWeight: 700, color: '#059669' }}>{fmtRupee(c.totalDiscountGiven)}</td>
                            <td>
                              <span className={`disc-pill ${c.isActive ? 'disc-status-active' : 'disc-status-inactive'}`}>
                                {c.isActive ? 'Active' : 'Off'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Usage Timeline */}
            <div className="disc-card">
              <div className="disc-card-title">
                <Users size={16} color="#7c3aed" />
                Recent Coupon Usage
              </div>
              {(data.recentUsage || []).length === 0 ? (
                <div className="disc-empty" style={{ minHeight: 120 }}>
                  <p>No usage recorded yet</p>
                </div>
              ) : (
                <div className="disc-timeline">
                  {data.recentUsage.map((u, i) => (
                    <div key={i} className="disc-timeline-item">
                      <div className="disc-timeline-dot" />
                      <div>
                        <div className="disc-timeline-text">
                          <strong>{u.identifier || 'Anonymous'}</strong> used{' '}
                          <strong style={{ fontFamily: 'monospace' }}>{u.code}</strong>
                          {u.count > 1 && ` (${u.count}×)`}
                        </div>
                        <div className="disc-timeline-sub">{fmtDate(u.lastUsed)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick CTA */}
          <motion.div
            className="disc-card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .3 }}
          >
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                Ready to create a new discount?
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Welcome coupons, campaign offers, abandoned cart deals — manage them all in one place.
              </div>
            </div>
            <button
              className="disc-btn disc-btn-primary"
              onClick={() => navigate('/admin/discounts/codes')}
            >
              <Tag size={14} />
              Go to Coupon Codes
            </button>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
