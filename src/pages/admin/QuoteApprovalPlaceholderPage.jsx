import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ShieldQuestion, ThumbsDown, ThumbsUp } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';

const QuoteApprovalPlaceholderPage = () => {
  const { quoteId } = useParams();
  const [decision, setDecision] = useState('');

  return (
    <div className="admin-module-page quote-approval-admin-page">
      <AdminPageHeader
        title="Quote Approval"
        description="Customer approval placeholder route for approve/reject flow."
        breadcrumbs={['Admin', 'Campaign Module', 'Instant Quote', 'Approval']}
        actions={[
          { label: 'Back to Quotes', onClick: () => window.history.back() },
        ]}
      />

      <div className="card alert-card">
        <div className="card-header">
          <div>
            <h3>Approval Link: {quoteId}</h3>
            <p>This placeholder represents customer online decision handling.</p>
          </div>
        </div>
        <div className="admin-section-stack">
          <div className="admin-placeholder-row">
            <ShieldQuestion size={16} className="icon-info" />
            <div>
              <h4>Decision status</h4>
              <p>{decision || 'Awaiting customer action'}</p>
            </div>
          </div>
          <div className="admin-chip-row">
            <button className="btn btn-primary" type="button" onClick={() => setDecision('Approved')}>
              <ThumbsUp size={16} />
              <span>Approve Quote</span>
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setDecision('Rejected')}>
              <ThumbsDown size={16} />
              <span>Reject Quote</span>
            </button>
          </div>
          {decision === 'Approved' && (
            <div className="success-banner" role="status">
              <span>Quote {quoteId} approved (placeholder). Billing flow can proceed.</span>
            </div>
          )}
          {decision === 'Rejected' && (
            <div className="inline-error" role="status">
              <span>Quote {quoteId} rejected (placeholder). Update and resend flow is required.</span>
            </div>
          )}
        </div>
      </div>

      <div className="card module-empty-card">
        <div className="module-empty-icon" aria-hidden="true">
          <CheckCircle2 size={18} />
        </div>
        <h3>Detailed requirements will be added later</h3>
        <p>Webhook callbacks, token security, and customer-auth flows are pending backend integration.</p>
        <Link className="btn btn-secondary" to="/admin/campaign/instant-quote">Return to Instant Quote</Link>
      </div>
    </div>
  );
};

export default QuoteApprovalPlaceholderPage;
