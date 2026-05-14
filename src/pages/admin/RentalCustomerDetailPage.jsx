import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { api } from '../../services/apiClient';

const val = (v) => (v && String(v).trim()) ? String(v).trim() : '-';

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const Grid = ({ children, cols = 3 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px 24px' }}>
    {children}
  </div>
);

const Field = ({ label, value, full }) => (
  <div style={{ ...(full ? { gridColumn: '1 / -1' } : {}) }}>
    <div style={styles.fieldLabel}>{label}</div>
    <div style={styles.fieldValue}>{value || '-'}</div>
  </div>
);

const RentalCustomerDetailPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('rentalCustomers', customerId)
      .then((data) => { setCustomer(data); setLoading(false); })
      .catch(() => { setError('Failed to load customer.'); setLoading(false); });
  }, [customerId]);

  if (loading) return <div style={styles.centerMsg}>Loading...</div>;
  if (error || !customer) return <div style={styles.centerMsg}>{error || 'Customer not found.'}</div>;

  const c = customer;
  const primary = c.primaryContact || {};
  const secondary = c.secondaryContact || {};
  const plan = c.planDetails || {};
  const devices = Array.isArray(c.devices) ? c.devices : [];
  const locations = Array.isArray(c.locations) ? c.locations : [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/admin/rental/customers')}>
          <ArrowLeft size={16} /> Back to Customers
        </button>
        <div style={styles.headerCenter}>
          <h1 style={styles.headerTitle}>{val(c.companyName || c.customerName)}</h1>
          <span style={{ ...styles.statusBadge, background: c.status === 'Active' ? '#dcfce7' : '#f3f4f6', color: c.status === 'Active' ? '#16a34a' : '#6b7280' }}>
            {val(c.status)}
          </span>
        </div>
        <button
          style={styles.editBtn}
          onClick={() => navigate(`/admin/rental/new?id=${customerId}`)}
        >
          <Edit2 size={15} /> Edit
        </button>
      </div>

      <div style={styles.body}>
        <Section title="Customer Details">
          <Grid cols={3}>
            <Field label="Company / Customer Name" value={val(c.companyName || c.customerName)} />
            <Field label="Customer Type" value={val(c.customerType)} />
            <Field label="GST Number" value={val(c.gstNumber)} />
          </Grid>

          <div style={{ marginTop: 20 }}>
            <div style={styles.subLabel}>Primary Contact</div>
            <Grid cols={3}>
              <Field label="Name" value={val(primary.name || c.authorizedPerson1)} />
              <Field label="Mobile" value={val(primary.mobile || c.contactNumber)} />
              <Field label="Email" value={val(primary.email || c.email)} />
            </Grid>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={styles.subLabel}>Secondary Contact</div>
            <Grid cols={3}>
              <Field label="Name" value={val(secondary.name || c.authorizedPerson2)} />
              <Field label="Mobile" value={val(secondary.mobile)} />
              <Field label="Email" value={val(secondary.email)} />
            </Grid>
          </div>

          <div style={{ marginTop: 20 }}>
            <Grid cols={2}>
              <Field label="Registered Address" value={val(c.registeredAddress || c.address)} />
              <Field label="Billing Address" value={val(c.billingAddress)} />
            </Grid>
          </div>

          {(c.notes && c.notes.trim()) && (
            <div style={{ marginTop: 16 }}>
              <Field label="Notes" value={val(c.notes)} full />
            </div>
          )}
        </Section>

        <Section title="Rental Plan">
          {c.planId ? (
            <Grid cols={3}>
              <Field label="Plan Name" value={val(plan.name || c.planName)} />
              <Field label="Plan Type" value={val(plan.type)} />
              <Field label="Price" value={val(plan.price)} />
              <Field label="Duration" value={val(plan.duration)} />
              <Field label="Visits / Year" value={val(plan.visits)} />
              <Field label="SLA" value={val(plan.sla)} />
            </Grid>
          ) : (
            <div style={styles.emptyNote}>No rental plan assigned.</div>
          )}
        </Section>

        <Section title={`Devices (${devices.length})`}>
          {devices.length === 0 ? (
            <div style={styles.emptyNote}>No devices registered.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {devices.map((device, i) => (
                <DeviceCard key={i} device={device} index={i} />
              ))}
            </div>
          )}
        </Section>

        {locations.length > 0 && (
          <Section title={`Locations (${locations.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {locations.map((loc, i) => (
                <div key={loc.id || i} style={styles.locationCard}>
                  <div style={styles.locationCardTitle}>Location {i + 1}{loc.locationName ? ` — ${loc.locationName}` : ''}</div>
                  <Grid cols={3}>
                    <Field label="Location Name" value={val(loc.locationName)} />
                    <Field label="Contact Person" value={val(loc.contactPerson)} />
                    <Field label="Phone" value={val(loc.phone)} />
                    <Field label="Email" value={val(loc.email)} />
                    <Field label="GST Branch" value={val(loc.gstBranch)} />
                    <Field label="Address" value={val(loc.address)} />
                  </Grid>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

const DeviceCard = ({ device, index }) => {
  const type = device.type || '-';

  const getFields = () => {
    if (type === 'Laptop') {
      const configs = (device.configurations || []).map((c) => `${c.name}: ${c.specification}`).filter(Boolean).join(' | ');
      return [
        { label: 'Brand', value: val(device.brand) },
        { label: 'Model', value: val(device.model) },
        { label: 'Location', value: val(device.location) },
        { label: 'Configurations', value: val(configs) },
      ];
    }
    if (type === 'Desktop' || type === 'Server') {
      const cpu = device.cpu || {};
      const monitor = device.monitor || {};
      return [
        { label: 'CPU Type', value: val(cpu.subType) },
        { label: 'CPU Brand', value: val(cpu.brand) },
        { label: 'CPU Model', value: val(cpu.model) },
        { label: 'CPU Config', value: val(cpu.config) },
        { label: 'CPU Location', value: val(cpu.location) },
        { label: 'Monitor Type', value: val(monitor.subType) },
        { label: 'Monitor Brand', value: val(monitor.brand) },
        { label: 'Monitor Location', value: val(monitor.location) },
      ];
    }
    if (type === 'Printer') {
      return [
        { label: 'Type', value: val(device.subType) },
        { label: 'Brand', value: val(device.brand) },
        { label: 'Model', value: val(device.model) },
        { label: 'Input Field', value: val(device.inputField) },
        { label: 'Location', value: val(device.location) },
      ];
    }
    if (type === 'CCTV') {
      const specs = (device.specs || []).filter(Boolean).join(' | ');
      return [
        { label: 'Type', value: val(device.subType) },
        { label: 'Brand', value: val(device.brand) },
        { label: 'Model', value: val(device.model) },
        { label: 'Location', value: val(device.location) },
        { label: 'Specifications', value: val(specs) },
      ];
    }
    if (type === 'Total Maintenance') {
      return [
        { label: 'Sub Device Type', value: val(device.subDeviceType) },
      ];
    }
    return [
      { label: 'Brand', value: val(device.brand) },
      { label: 'Model', value: val(device.model) },
      { label: 'Location', value: val(device.location) },
    ];
  };

  return (
    <div style={styles.deviceCard}>
      <div style={styles.deviceCardTitle}>
        Device {index + 1}
        <span style={styles.deviceTypeBadge}>{type}</span>
      </div>
      <Grid cols={3}>
        {getFields().map(({ label, value }) => (
          <Field key={label} label={label} value={value} />
        ))}
      </Grid>
    </div>
  );
};

const styles = {
  page: { padding: '28px 32px', maxWidth: 1100, margin: '0 auto' },
  centerMsg: { padding: 48, textAlign: 'center', color: '#6b7280', fontSize: 14 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 16 },
  headerCenter: { display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' },
  headerTitle: { fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 },
  statusBadge: { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 },
  editBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  body: { display: 'flex', flexDirection: 'column', gap: 20 },
  section: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' },
  subLabel: { fontSize: '0.78rem', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 },
  fieldLabel: { fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500, marginBottom: 3 },
  fieldValue: { fontSize: '0.9rem', color: '#111827', fontWeight: 500 },
  emptyNote: { color: '#9ca3af', fontSize: 13, fontStyle: 'italic' },
  deviceCard: { background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px' },
  deviceCardTitle: { display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: 14 },
  deviceTypeBadge: { background: '#ede9fe', color: '#6d28d9', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 },
  locationCard: { background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px' },
  locationCardTitle: { fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: 14 },
};

export default RentalCustomerDetailPage;
