import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { X, IndianRupee, Loader2, Send, FileText, Edit3 } from 'lucide-react';
import { fmt } from './utils';
import { campaignJobWorkflowService } from '../../../services/campaignJobWorkflowService';

const JobQuoteModal = ({ activeJob, closeModal, pricingTemplates, refreshJob, showToast, className }) => {
  const savedEstimate = Number(activeJob.workflow?.quote?.estimate || activeJob.quote?.estimate || 0);
  const savedNotes = activeJob.workflow?.quote?.notes || activeJob.quote?.notes || '';
  const hasSavedQuoteDetails = savedEstimate > 0 || Boolean(savedNotes);
  const savedIssue = hasSavedQuoteDetails ? (activeJob.workflow?.quote?.issue || activeJob.quote?.issue || '') : '';
  const savedTemplateIdx = savedIssue ? pricingTemplates.findIndex((template) => template.issue === savedIssue) : -1;
  const [quoteForm, setQuoteForm] = useState({
    templateIdx: savedTemplateIdx,
    estimate: savedEstimate > 0 ? savedEstimate : '',
    notes: savedNotes,
  });
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const currentStatus = activeJob.workflow?.quote?.status || activeJob.quoteStatus;
  const initialDecisionStatus = ['Approved', 'Rejected'].includes(currentStatus) ? currentStatus : 'Pending';
  const [decisionStatus, setDecisionStatus] = useState(initialDecisionStatus);
  const [canSendQuote, setCanSendQuote] = useState(false);

  const updateQuoteForm = (updater) => {
    setDecisionStatus('Pending');
    setCanSendQuote(false);
    setIsEditingStatus(false);
    setQuoteForm(updater);
  };

  const handleSelectStatus = (newStatus) => {
    setDecisionStatus(newStatus);
    setCanSendQuote(false);
    setIsEditingStatus(false);
  };

  const handleSaveQuote = async () => {
    if (!quoteForm.estimate) return showToast('Enter an estimate amount.', 'error');
    setQuoteSaving(true);
    try {
      const tpl = pricingTemplates[quoteForm.templateIdx];
      const issue = tpl ? tpl.issue : (activeJob?.problem || 'Other');
      await campaignJobWorkflowService.createQuote(activeJob.id, { 
        issue, 
        estimate: Number(quoteForm.estimate), 
        status: decisionStatus === 'Pending' ? 'Draft' : decisionStatus,
        notes: quoteForm.notes 
      });
      showToast('Quote saved. You can send it now.');
      await refreshJob(activeJob.id);
      setCanSendQuote(true);
    } catch (e) { showToast(e.message, 'error'); } finally { setQuoteSaving(false); }
  };

  const handleSendQuote = async () => {
    if (!quoteForm.estimate && !activeJob?.workflow?.quote?.estimate) return showToast('Save a quote first.', 'error');
    setQuoteSaving(true);
    try {
      await campaignJobWorkflowService.sendQuoteMessage(activeJob.id, {});
      showToast('Quote sent to customer.');
      await refreshJob(activeJob.id);
      setCanSendQuote(false);
    } catch (e) { showToast(e.message, 'error'); } finally { setQuoteSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={() => closeModal()}>
      <Motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`modal-card campaign-job-details campaign-quote-modal ${className}`}
        onClick={(e) => e.stopPropagation()}>
        
        <div className="quote-modal-header">
          <div className="quote-title-row">
            <div>
              <div className="quote-kicker">
                <span className="quote-ticket">{activeJob.ticketId || activeJob.id}</span>
                <span>Repair Pricing</span>
              </div>
              <h2>Estimate & Quotation</h2>
            </div>
            
            <div className="quote-status-control">
              <span className="quote-status-label">Current Status</span>
              {!isEditingStatus ? (
                <>
                  <span className={`quote-status-badge quote-status-${decisionStatus.toLowerCase()}`}>
                    {decisionStatus}
                  </span>
                  <button type="button" className="quote-status-edit" onClick={() => setIsEditingStatus(true)} disabled={quoteSaving}>
                    <Edit3 size={13}/> Edit
                  </button>
                </>
              ) : (
                <select
                  className="quote-status-select"
                  value={decisionStatus === 'Pending' ? '' : decisionStatus}
                  onChange={(e) => e.target.value && handleSelectStatus(e.target.value)}
                  disabled={quoteSaving}
                  autoFocus
                >
                  <option value="">Select...</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              )}
            </div>
          </div>
          <button className="icon-button" onClick={() => closeModal()}>
            <X size={20}/>
          </button>
        </div>

        <div className="quote-modal-body">
          <div className="quote-form-grid">
              <div className="quote-field">
                <label>Issue Type</label>
                <select
                  value={quoteForm.templateIdx} onChange={(e) => {
                    const idx = Number(e.target.value);
                    const tpl = pricingTemplates[idx];
                    updateQuoteForm((f) => ({ ...f, templateIdx: idx, estimate: tpl ? tpl.defaultEstimate : f.estimate }));
                  }}>
                  <option value={-1}>Select repair template...</option>
                  {pricingTemplates.map((t, i) => <option key={i} value={i}>{t.issue}</option>)}
                </select>
              </div>

              <div className="quote-field">
                <label>Market Value</label>
                <input 
                  type="text" 
                  disabled 
                  value={quoteForm.templateIdx >= 0 ? 
                    `Range: ${fmt(pricingTemplates[quoteForm.templateIdx].min)} – ${fmt(pricingTemplates[quoteForm.templateIdx].max)}` 
                    : 'Select template to view range'}
                />
              </div>

              <div className="quote-field">
                <label>Final Estimate *</label>
                <div className="quote-amount-field">
                  <IndianRupee size={18}/>
                  <input type="number"
                    placeholder="0" value={quoteForm.estimate}
                    onChange={(e) => updateQuoteForm((f) => ({ ...f, estimate: e.target.value }))}/>
                </div>
              </div>

              <div className="quote-field">
                <label>Internal Notes</label>
                <textarea
                  placeholder="Notes for records..." value={quoteForm.notes}
                  onChange={(e) => updateQuoteForm((f) => ({ ...f, notes: e.target.value }))}/>
              </div>
          </div>

          <div className="quote-actions">
            <button className="secondary-button quote-action-button" onClick={handleSaveQuote} disabled={quoteSaving}>
              {quoteSaving ? <Loader2 size={17} className="animate-spin"/> : <FileText size={17}/>} 
              Save
            </button>
            {canSendQuote && (
              <button className="primary-button quote-action-button" onClick={handleSendQuote} disabled={quoteSaving}>
                {quoteSaving ? <Loader2 size={17} className="animate-spin"/> : <Send size={17}/>}
                Send Quote
              </button>
            )}
          </div>

          {decisionStatus !== 'Pending' && (
            <div className="quote-summary">
              <span>Final Price</span>
              <strong>{fmt(activeJob.workflow?.quote?.estimate || activeJob.quote?.estimate || quoteForm.estimate)}</strong>
              <em className={`quote-status-${decisionStatus.toLowerCase()}`}>{decisionStatus}</em>
            </div>
          )}
        </div>
      </Motion.div>
    </div>
  );
};

export default JobQuoteModal;
