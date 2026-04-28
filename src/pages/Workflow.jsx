import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Package,
  Clock,
  Send,
  Star,
  User,
  Ticket,
  X
} from 'lucide-react';
import { campaignJobWorkflowService } from '../services/campaignJobWorkflowService';

const steps = [
  { id: 1, label: 'Customer Details', icon: User },
  { id: 2, label: 'Ticket Generate', icon: Ticket },
  { id: 3, label: 'Welcome Message', icon: Send },
  { id: 4, label: 'Send Quote', icon: FileText },
  { id: 5, label: 'Asset Received', icon: Package },
  { id: 6, label: 'Under Process', icon: Clock },
  { id: 7, label: 'Service Completed', icon: CheckCircle2 },
  { id: 8, label: 'Generate Bill', icon: FileText },
  { id: 9, label: 'Handover Message', icon: Send },
  { id: 10, label: 'Review Message', icon: Star },
];

const stepByStatus = {
  'Received at office': 2,
  'Diagnosis in progress': 4,
  'Waiting for parts': 6,
  'Repair completed': 7,
  Closed: 10,
};

const JobItem = ({ job, onUpdateStep }) => {
  const isFirstStep = job.currentStep === 1;
  const isFinalStep = job.currentStep === 10;
  const nextStep = steps[job.currentStep];

  return (
    <div className="job-card card">
      <div className="job-header">
        <div className="job-info">
          <h3>{job.customerName}</h3>
          <span className="job-meta">{job.mobileNumber} - Ticket #{job.ticketId}</span>
        </div>
        <div className="job-status">
          Step {job.currentStep} of 10
        </div>
      </div>

      <div className="workflow-stepper" aria-label={`Workflow progress for ${job.customerName}`}>
        {steps.map((step) => {
          const isCompleted = step.id < job.currentStep;
          const isActive = step.id === job.currentStep;

          return (
            <div
              key={step.id}
              className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              title={step.label}
            >
              <div className="step-icon">
                {isCompleted ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
              </div>
              {isActive && <span className="step-label">{step.label}</span>}
            </div>
          );
        })}
      </div>

      <div className="job-actions">
        <button
          className="btn btn-outline"
          onClick={() => onUpdateStep(job.id, Math.max(1, job.currentStep - 1))}
          disabled={isFirstStep}
        >
          Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onUpdateStep(job.id, Math.min(10, job.currentStep + 1))}
          disabled={isFinalStep}
        >
          {isFinalStep ? 'Complete' : nextStep.label}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const Workflow = () => {
  const [notice, setNotice] = useState('');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    campaignJobWorkflowService.listJobs()
      .then((rows) => setJobs(rows.map((job) => ({
        id: job.id,
        customerName: job.customerName,
        mobileNumber: job.phoneNumber,
        ticketId: job.ticketId,
        currentStep: stepByStatus[job.jobStatus] || 1,
      }))))
      .catch((error) => setNotice(error.response?.data?.message || error.message || 'Workflow jobs failed to load.'));
  }, []);

  const updateStep = (id, newStep) => {
    setJobs((current) => current.map((job) => job.id === id ? { ...job, currentStep: newStep } : job));
    const job = jobs.find((item) => item.id === id);
    if (job && newStep !== job.currentStep) {
      setNotice(`${job.customerName} moved to step ${newStep}.`);
    }
  };

  return (
    <div className="workflow-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss workflow message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="active-jobs-list">
        {jobs.map((job) => (
          <JobItem key={job.id} job={job} onUpdateStep={updateStep} />
        ))}
      </div>
    </div>
  );
};

export default Workflow;
