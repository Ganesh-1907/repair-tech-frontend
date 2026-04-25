import React, { useMemo, useState } from 'react';
import { ExternalLink, FileText, Send, Sparkles, WalletCards, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { sendQuoteNotification } from '../../services/communicationService';
import { usePrivacy } from '../../context/PrivacyContext';

const quoteTemplates = [
  { id: 'TPL-ISSUE-01', issue: 'Screen issue', min: 2500, max: 8500, editable: true },
  { id: 'TPL-ISSUE-02', issue: 'SSD upgrade', min: 3500, max: 3500, editable: true },
  { id: 'TPL-ISSUE-03', issue: 'Keyboard issue', min: 1800, max: 4500, editable: true },
  { id: 'TPL-ISSUE-04', issue: 'Printer service', min: 1200, max: 1200, editable: true },
];

const initialHistory = [
  {
    id: 'QTE-8001',
    customerName: 'Rahul Sharma',
    phoneNumber: '9876543210',
    issue: 'Screen issue',
    estimate: 4200,
    status: 'Sent',
    channel: 'WhatsApp',
  },
  {
    id: 'QTE-8002',
    customerName: 'Priya Verma',
    phoneNumber: '9988776655',
    issue: 'SSD upgrade',
    estimate: 4800,
    status: 'Approved',
    channel: 'SMS',
  },
];

const statusClass = {
  Draft: 'status-pill status-draft',
  Sent: 'status-pill status-assigned',
  Approved: 'status-pill status-completed',
  Rejected: 'status-pill status-overdue',
  Updated: 'status-pill status-pending',
};

const getSuggestionText = (template) => {
  if (!template) return 'Select issue to view suggested price.';
  if (template.min === template.max) return `Suggested price: INR ${template.min.toLocaleString('en-IN')}`;
  return `Suggested price: INR ${template.min.toLocaleString('en-IN')} - INR ${template.max.toLocaleString('en-IN')}`;
};

const InstantQuotePage = () => {
  const { formatCurrency } = usePrivacy();
  const [selectedTemplateId, setSelectedTemplateId] = useState(quoteTemplates[0].id);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [channel, setChannel] = useState('WhatsApp');
  const [finalEstimate, setFinalEstimate] = useState('');
  const [history, setHistory] = useState(initialHistory);
  const [notice, setNotice] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedTemplate = useMemo(
    () => quoteTemplates.find((template) => template.id === selectedTemplateId) || quoteTemplates[0],
    [selectedTemplateId]
  );

  const suggestionText = getSuggestionText(selectedTemplate);
  const previewApprovalLink = `/admin/campaign/instant-quote/approval/PREVIEW`;
  const effectiveEstimate = Number(finalEstimate) || selectedTemplate.min;

  const quoteStats = useMemo(() => ({
    drafts: history.filter((quote) => quote.status === 'Draft').length,
    sent: history.filter((quote) => quote.status === 'Sent').length,
    approved: history.filter((quote) => quote.status === 'Approved').length,
    updated: history.filter((quote) => quote.status === 'Updated').length,
  }), [history]);

  const sendQuote = async (forceStatus = 'Sent') => {
    if (!customerName.trim()) {
      setNotice('Customer name is required.');
      return;
    }
    if (phoneNumber.trim().length !== 10) {
      setNotice('Enter a valid 10 digit phone number.');
      return;
    }

    const quoteId = `QTE-${Date.now().toString().slice(-5)}`;
    const approvalUrl = `/admin/campaign/instant-quote/approval/${quoteId}`;
    const estimate = Number(finalEstimate) || selectedTemplate.min;

    setIsSending(true);
    try {
      await sendQuoteNotification({
        quoteId,
        channel,
        phoneNumber,
        issue: selectedTemplate.issue,
        estimate,
        approvalUrl,
      });

      setHistory((current) => [
        {
          id: quoteId,
          customerName: customerName.trim(),
          phoneNumber: phoneNumber.trim(),
          issue: selectedTemplate.issue,
          estimate,
          status: forceStatus,
          channel,
        },
        ...current,
      ]);
      setNotice(`Quote ${quoteId} ${forceStatus === 'Updated' ? 'updated and sent' : 'sent'} via ${channel}.`);
    } finally {
      setIsSending(false);
    }
  };

  const loadQuoteForUpdate = (quote) => {
    setCustomerName(quote.customerName);
    setPhoneNumber(quote.phoneNumber);
    setChannel(quote.channel);
    const matchedTemplate = quoteTemplates.find((template) => template.issue === quote.issue);
    if (matchedTemplate) setSelectedTemplateId(matchedTemplate.id);
    setFinalEstimate(String(quote.estimate));
    setNotice(`Loaded ${quote.id}. Edit estimate and click "Send Updated Quote".`);
  };

  return (
    <div className="admin-module-page instant-quote-admin-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss quote notice">
            <X size={16} />
          </button>
        </div>
      )}

      <AdminPageHeader
        title="Instant Quote"
        description="Create and send quick estimates with template pricing, status tracking, and customer approval links."
        breadcrumbs={['Admin', 'Campaign Module', 'Instant Quote']}
        actions={[
          { label: 'Send Quote', icon: Send, onClick: () => sendQuote('Sent') },
          { label: 'Send Updated Quote', variant: 'secondary', icon: Sparkles, onClick: () => sendQuote('Updated') },
        ]}
      />

      <div className="summary-grid admin-kpi-grid">
        <div className="card summary-card">
          <div className="summary-icon-container primary"><FileText size={22} /></div>
          <div><span className="summary-label">Draft</span><h3 className="summary-value">{quoteStats.drafts}</h3></div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon-container info"><Send size={22} /></div>
          <div><span className="summary-label">Sent</span><h3 className="summary-value">{quoteStats.sent}</h3></div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon-container success"><WalletCards size={22} /></div>
          <div><span className="summary-label">Approved</span><h3 className="summary-value">{quoteStats.approved}</h3></div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon-container warning"><Sparkles size={22} /></div>
          <div><span className="summary-label">Updated</span><h3 className="summary-value">{quoteStats.updated}</h3></div>
        </div>
      </div>

      <div className="admin-split-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Quote Editor</h3>
              <p>Select issue, verify suggested cost, and send quote.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="quote-customer-name">Customer name</label>
              <input
                id="quote-customer-name"
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="quote-phone-number">Phone number</label>
              <input
                id="quote-phone-number"
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="quote-issue">Issue selection</label>
              <select
                id="quote-issue"
                value={selectedTemplateId}
                onChange={(event) => {
                  setSelectedTemplateId(event.target.value);
                  setFinalEstimate('');
                }}
              >
                {quoteTemplates.map((template) => (
                  <option key={template.id} value={template.id}>{template.issue}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="quote-channel">Channel</label>
              <select id="quote-channel" value={channel} onChange={(event) => setChannel(event.target.value)}>
                <option value="WhatsApp">WhatsApp</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="quote-final-estimate">Final estimate (Suggest: {suggestionText.split(': ')[1]})</label>
              <input
                id="quote-final-estimate"
                type="number"
                min="0"
                placeholder={selectedTemplate.min}
                value={finalEstimate}
                onChange={(event) => setFinalEstimate(event.target.value)}
              />
            </div>
          </div>

          <div className="admin-chip-row">
            <button className="btn btn-primary" type="button" onClick={() => sendQuote('Sent')} disabled={isSending}>
              <Send size={16} />
              <span>{isSending ? 'Sending...' : 'Send Quote'}</span>
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => sendQuote('Updated')} disabled={isSending}>
              <Sparkles size={16} />
              <span>Send Updated Quote</span>
            </button>
          </div>
        </div>

        <div className="card alert-card">
          <div className="card-header">
            <div>
              <h3>Suggested Price Card</h3>
              <p>Template estimate range and editable final amount.</p>
            </div>
          </div>
          <div className="notification-stats">
            <div className="stat-row"><span>Selected issue</span><span className="count">{selectedTemplate.issue}</span></div>
            <div className="stat-row"><span>Template estimate</span><span className="count">{suggestionText.replace('Suggested price: ', '')}</span></div>
            <div className="stat-row"><span>Final estimate</span><span className="count">{formatCurrency(effectiveEstimate)}</span></div>
            <div className="stat-row"><span>Channel</span><span className="count">{channel}</span></div>
            <div className="stat-row"><span>Approval link</span><span className="count truncate-text" title={previewApprovalLink}>{previewApprovalLink}</span></div>
          </div>

          <div className="admin-section-stack">
            <div className="admin-placeholder-row">
              <ExternalLink size={16} className="icon-primary" />
              <div>
                <h4>Customer approval placeholder</h4>
                <p>Approval and rejection are represented by the route below.</p>
              </div>
            </div>
            <Link className="btn btn-secondary" to={previewApprovalLink}>Open Approval Placeholder</Link>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <div>
            <h3>Quote History</h3>
            <p>Status list: Draft, Sent, Approved, Rejected, Updated.</p>
          </div>
        </div>
        <table className="leads-table">
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Customer</th>
              <th>Issue</th>
              <th>Estimate</th>
              <th>Status</th>
              <th>Channel</th>
              <th>Approval</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((quote) => (
              <tr key={quote.id}>
                <td>{quote.id}</td>
                <td>
                  <div className="item-cell">
                    <span className="bold">{quote.customerName}</span>
                    <span className="company-name">{quote.phoneNumber}</span>
                  </div>
                </td>
                <td>{quote.issue}</td>
                <td>{formatCurrency(quote.estimate)}</td>
                <td><span className={statusClass[quote.status] || 'status-pill status-draft'}>{quote.status}</span></td>
                <td>{quote.channel}</td>
                <td>
                  <Link className="btn btn-sm btn-secondary" to={`/admin/campaign/instant-quote/approval/${quote.id}`}>
                    Open Link
                  </Link>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-sm btn-secondary" type="button" onClick={() => loadQuoteForUpdate(quote)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-secondary" type="button" onClick={() => setNotice(`${quote.id} marked as Draft placeholder.`)}>
                      Mark Draft
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstantQuotePage;
