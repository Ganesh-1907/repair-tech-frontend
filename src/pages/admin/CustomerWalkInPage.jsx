import React, { useMemo, useState } from 'react';
import { BadgeCheck, FilePlus2, PhoneCall, ShieldCheck, Ticket, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { campaignService, leadService } from '../../services/campaignServices';

const problemOptions = [
  'Screen issue',
  'Keyboard issue',
  'Printer not printing',
  'Power issue',
  'Software issue',
  'Other',
];

const deviceOptions = ['Laptop', 'Desktop', 'Printer', 'Other'];

const CustomerWalkInPage = () => {
  const [walkIns, setWalkIns] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    otp: '',
    deviceType: 'Laptop',
    problem: problemOptions[0],
    notes: '',
    campaignSource: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [notice, setNotice] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);

  React.useEffect(() => {
    leadService.listRecentWalkIns().then(setWalkIns);
    campaignService.listCampaigns().then((items) => {
      setCampaigns(items);
      setForm((current) => ({ ...current, campaignSource: current.campaignSource || items[0]?.name || '' }));
    });
  }, []);

  const recentWalkIns = useMemo(() => walkIns.slice(0, 6), [walkIns]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === 'phoneNumber') {
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const sendOtpPlaceholder = () => {
    if (form.phoneNumber.trim().length !== 10) {
      setNotice('Enter a valid 10 digit phone number before OTP send.');
      return;
    }
    setOtpSent(true);
    setOtpVerified(false);
    setNotice(`OTP placeholder sent to ${form.phoneNumber}.`);
  };

  const verifyOtpPlaceholder = () => {
    if (!otpSent) {
      setNotice('Send OTP first.');
      return;
    }
    if (form.otp.trim().length !== 6) {
      setNotice('Enter 6 digit OTP to verify.');
      return;
    }
    setOtpVerified(true);
    setNotice('OTP verification placeholder completed.');
  };

  const submitQuickEntry = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setNotice('Customer name is required.');
      return;
    }
    if (form.phoneNumber.trim().length !== 10) {
      setNotice('Enter a valid 10 digit phone number.');
      return;
    }
    if (!otpVerified) {
      setNotice('OTP verification is required before quick entry submit.');
      return;
    }

    const entry = await leadService.createWalkIn({
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
      deviceType: form.deviceType,
      problem: form.problem,
      problemNotes: form.notes,
      campaignSource: form.campaignSource,
    });

    setWalkIns(await leadService.listRecentWalkIns());
    setCreatedTicket(entry);
    setNotice(`Walk-in submitted. Ticket ${entry.ticketId} and job card ${entry.jobCardId} generated.`);
    setForm({
      name: '',
      phoneNumber: '',
      otp: '',
      deviceType: 'Laptop',
      problem: problemOptions[0],
      notes: '',
      campaignSource: campaigns[0]?.name || '',
    });
    setOtpSent(false);
    setOtpVerified(false);
  };

  return (
    <div className="admin-module-page customer-walkin-admin-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss walk-in message">
            <X size={16} />
          </button>
        </div>
      )}

      <AdminPageHeader
        title="Customer Walk-in"
        description="Step 1 quick entry flow for reception team to create ticket and job card in seconds."
        breadcrumbs={['Admin', 'Campaign Module', 'Customer Walk-in']}
        actions={[
          { label: 'Quick Entry', icon: FilePlus2, onClick: () => setNotice('Quick entry mode is ready.') },
          { label: 'View Recent', variant: 'secondary', icon: Ticket, onClick: () => setNotice('Recent walk-ins section is available below.') },
        ]}
      />

      <div className="admin-split-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Fast Entry Form</h3>
              <p>Capture essentials quickly and generate ticket/job card.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={submitQuickEntry}>
            <div className="form-group">
              <label htmlFor="walkin-name">Name</label>
              <input
                id="walkin-name"
                type="text"
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="walkin-phone">Phone Number</label>
              <input
                id="walkin-phone"
                type="tel"
                inputMode="numeric"
                value={form.phoneNumber}
                onChange={(event) => updateForm('phoneNumber', event.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="walkin-otp">OTP Verify</label>
              <div className="admin-inline-actions">
                <input
                  id="walkin-otp"
                  type="text"
                  inputMode="numeric"
                  value={form.otp}
                  onChange={(event) => updateForm('otp', event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                />
                <button className="btn btn-secondary btn-sm" type="button" onClick={sendOtpPlaceholder}>Send OTP</button>
                <button className="btn btn-secondary btn-sm" type="button" onClick={verifyOtpPlaceholder}>Verify</button>
              </div>
              <span className={otpVerified ? 'text-success' : 'text-muted'}>
                {otpVerified ? 'OTP verified' : otpSent ? 'OTP sent - verification pending' : 'OTP placeholder not sent'}
              </span>
            </div>
            <div className="form-group">
              <label htmlFor="walkin-device">Device</label>
              <select id="walkin-device" value={form.deviceType} onChange={(event) => updateForm('deviceType', event.target.value)}>
                {deviceOptions.map((device) => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="walkin-problem">Problem</label>
              <select id="walkin-problem" value={form.problem} onChange={(event) => updateForm('problem', event.target.value)}>
                {problemOptions.map((problem) => (
                  <option key={problem} value={problem}>{problem}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="walkin-campaign-source">Campaign Source</label>
              <select id="walkin-campaign-source" value={form.campaignSource} onChange={(event) => updateForm('campaignSource', event.target.value)}>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.name}>{campaign.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="walkin-notes">Notes</label>
              <textarea
                id="walkin-notes"
                className="form-textarea"
                rows={3}
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
              />
            </div>
            <div className="form-actions-span">
              <button className="btn btn-primary" type="submit">
                <Ticket size={16} />
                <span>Create Ticket & Job Card</span>
              </button>
            </div>
          </form>
        </div>

        <div className="card alert-card">
          <div className="card-header">
            <div>
              <h3>Auto-generated Ticket / Job Card</h3>
              <p>Preview generated identifiers after submit.</p>
            </div>
          </div>
          {createdTicket ? (
            <div className="notification-stats">
              <div className="stat-row"><span>Customer</span><span className="count">{createdTicket.customerName}</span></div>
              <div className="stat-row"><span>Ticket ID</span><span className="count">{createdTicket.ticketId}</span></div>
              <div className="stat-row"><span>Job Card</span><span className="count">{createdTicket.jobCardId}</span></div>
              <div className="stat-row"><span>Device</span><span className="count">{createdTicket.job.deviceType}</span></div>
              <div className="stat-row"><span>Problem</span><span className="count">{createdTicket.job.problem}</span></div>
              <Link className="btn btn-primary btn-full" to={`/admin/campaign/jobs/${createdTicket.jobCardId}`}>
                Open Job Detail
              </Link>
            </div>
          ) : (
            <div className="empty-state compact">
              <h3>No walk-in submitted yet</h3>
              <p>Submit quick entry form to generate ticket and job card preview.</p>
            </div>
          )}

          <div className="admin-section-stack">
            <div className="admin-placeholder-row">
              <ShieldCheck size={16} className="icon-primary" />
              <div>
                <h4>OTP integration placeholder</h4>
                <p>Real OTP API integration can be connected without changing this UI workflow.</p>
              </div>
            </div>
            <div className="admin-placeholder-row">
              <BadgeCheck size={16} className="icon-success" />
              <div>
                <h4>Status tracking placeholder</h4>
                <p>Ticket progress milestones will sync from service workflow module.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <div>
            <h3>Recent Walk-ins</h3>
            <p>Latest customer walk-in records and generated identifiers.</p>
          </div>
        </div>
        <table className="leads-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Device</th>
              <th>Problem</th>
              <th>Campaign Source</th>
              <th>Ticket ID</th>
              <th>Job Card</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentWalkIns.map((item) => (
              <tr key={item.id}>
                <td className="bold">{item.customerName}</td>
                <td>{item.phoneNumber}</td>
                <td>{item.deviceType}</td>
                <td className="truncate-text" title={item.problem}>{item.problem}</td>
                <td>{item.campaignSource}</td>
                <td>{item.ticketId}</td>
                <td>{item.jobCardId}</td>
                <td><span className="status-pill status-assigned">{item.status}</span></td>
                <td><Link className="btn btn-sm btn-primary" to={`/admin/campaign/jobs/${item.jobCardId}`}>Open Job Detail</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card alert-card">
        <div className="card-header">
          <div>
            <h3>Status Tracking</h3>
            <p>Placeholder milestones for post-walk-in lifecycle.</p>
          </div>
        </div>
        <div className="admin-chip-row">
          <span className="status-pill status-assigned">Received</span>
          <span className="status-pill status-pending">Diagnosing</span>
          <span className="status-pill status-completed">Quoted</span>
          <span className="status-pill status-draft">Moved to Service Center</span>
        </div>
      </div>

      <div className="card module-empty-card">
        <div className="module-empty-icon" aria-hidden="true">
          <PhoneCall size={18} />
        </div>
        <h3>Detailed requirements will be added later</h3>
        <p>Real OTP, ticket lifecycle APIs, and service center transfer integration remain pending.</p>
      </div>
    </div>
  );
};

export default CustomerWalkInPage;
