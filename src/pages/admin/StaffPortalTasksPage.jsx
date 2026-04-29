import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Search, X, ChevronDown, CheckCircle2, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { staffManagementService } from '../../services/staffManagementService';
import { useAuth } from '../../context/AuthContext';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStatusTone = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('complete') || normalized.includes('closed') || normalized.includes('delivered')) return 'completed';
  if (normalized.includes('assigned') || normalized.includes('progress')) return 'assigned';
  if (normalized.includes('cancel')) return 'missed';
  return 'pending';
};

const WORKFLOW_STEPS = [
  'Lead Captured',
  'Initial Contact',
  'Technical Assessment',
  'Quotation Prepared',
  'Quotation Approved',
  'Parts Procurement',
  'Repair/Service Started',
  'Quality Check',
  'Ready for Collection',
  'Delivered & Closed'
];

const StaffPortalTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [updating, setUpdating] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const isAdmin = user?.role === 'admin';

  const fetchTasks = () => {
    staffManagementService.getStaffTasks()
      .then((rows) => {
        setTasks(Array.isArray(rows) ? rows : []);
      })
      .catch((error) => {
        setNotice(error.response?.data?.message || error.message || 'Tasks failed to load.');
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      await staffManagementService.updateTaskStatus(taskId, newStatus);
      setNotice(`Task status updated to ${newStatus}`);
      fetchTasks();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const blob = `${task.id} ${task.ticketId} ${task.title} ${task.customerName} ${task.device} ${task.issue} ${task.status} ${task.priority}`.toLowerCase();
    return !search.trim() || blob.includes(search.toLowerCase());
  }), [tasks, search]);

  return (
    <div className="admin-module-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss task list message"><X size={16} /></button>
        </div>
      )}

      <AdminPageHeader
        title="Tasks List"
        description="Assigned service tasks for staff follow-up."
        breadcrumbs={['Admin', 'Staff Portal', 'Tasks List']}
      />

      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div className="search-container" style={{ maxWidth: '420px' }}>
          <Search size={18} className="search-icon" />
          <input className="search-input" placeholder="Search tasks..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Customer</th>
              <th>Device</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Status Flow</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <div className="customer-info">
                    <span className="customer-name">{task.title}</span>
                    <span className="company-name">{task.ticketId || task.id}</span>
                  </div>
                </td>
                <td>{task.customerName || '-'}</td>
                <td>{task.device || '-'}</td>
                <td>{task.issue || '-'}</td>
                <td>{task.priority || '-'}</td>
                <td>
                  <button 
                    className={`status-pill status-${getStatusTone(task.status)}`}
                    onClick={() => setActiveTask(task)}
                    style={{ border: 'none', cursor: 'pointer', padding: '6px 16px', fontWeight: '600' }}
                  >
                    {task.status || 'Update Status'}
                  </button>
                </td>
                <td>{formatDate(task.expectedDelivery)}</td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <Briefcase size={28} />
                    <h3>No tasks found</h3>
                    <p>Assigned tasks will appear here once jobs are mapped to this staff account.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activeTask && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '24px', position: 'relative' }}>
            <button className="icon-btn" onClick={() => setActiveTask(null)} style={{ position: 'absolute', right: '16px', top: '16px' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '8px' }}>Manage Task Status</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>{activeTask.title} - {activeTask.customerName}</p>
            
            <div className="workflow-timeline" style={{ marginBottom: '32px' }}>
              {WORKFLOW_STEPS.map((step, index) => {
                const currentIndex = WORKFLOW_STEPS.indexOf(activeTask.status);
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', opacity: (isCompleted || isActive) ? 1 : 0.4 }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', 
                      backgroundColor: isActive ? '#6d5dfc' : isCompleted ? '#10b981' : '#e2e8f0',
                      color: (isActive || isCompleted) ? 'white' : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'
                    }}>
                      {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
                    </div>
                    <span style={{ fontWeight: isActive ? '600' : '400', color: isActive ? '#1e293b' : '#64748b' }}>{step}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {isAdmin && (
                <button 
                  className="btn btn-outline"
                  disabled={WORKFLOW_STEPS.indexOf(activeTask.status) <= 0 || updating === activeTask.id}
                  onClick={() => {
                    const prevIndex = WORKFLOW_STEPS.indexOf(activeTask.status) - 1;
                    handleStatusChange(activeTask.id, WORKFLOW_STEPS[prevIndex]).then(() => setActiveTask(prev => ({...prev, status: WORKFLOW_STEPS[prevIndex]})));
                  }}
                >
                  <ChevronLeft size={18} />
                  <span>Previous Step</span>
                </button>
              )}
              <button 
                className="btn btn-primary"
                disabled={WORKFLOW_STEPS.indexOf(activeTask.status) >= WORKFLOW_STEPS.length - 1 || updating === activeTask.id}
                onClick={() => {
                  const nextIndex = WORKFLOW_STEPS.indexOf(activeTask.status) + 1;
                  handleStatusChange(activeTask.id, WORKFLOW_STEPS[nextIndex]).then(() => setActiveTask(prev => ({...prev, status: WORKFLOW_STEPS[nextIndex]})));
                }}
              >
                <span>{updating === activeTask.id ? 'Updating...' : 'Mark Done / Next Step'}</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPortalTasksPage;
