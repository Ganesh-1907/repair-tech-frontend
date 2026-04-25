import React from 'react';
import {
  Briefcase,
  ChevronRight,
  LocateFixed,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Shield,
  Star,
  UserCheck,
  UserX,
  Wrench,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const getTechStatusClass = (status) => {
  switch (status) {
    case 'Available':
    case 'Active':
    case 'Present':
      return 'status-pill status-completed';
    case 'On Job':
    case 'Assigned':
    case 'In Progress':
      return 'status-pill status-assigned';
    case 'On Leave':
      return 'status-pill status-pending';
    case 'Inactive':
    case 'Absent':
      return 'status-pill status-overdue';
    default:
      return 'status-pill status-draft';
  }
};

export const TechnicianAvatar = ({ name, size = 'md' }) => (
  <span className={`tech-avatar ${size}`} aria-hidden="true">
    {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
  </span>
);

export const TechnicianSummaryCards = ({ technicians }) => {
  const active = technicians.filter((tech) => tech.employmentStatus === 'Active').length;
  const inactive = technicians.filter((tech) => tech.employmentStatus !== 'Active').length;
  return (
    <div className="tech-summary-card card">
      <div>
        <strong>{technicians.length}</strong>
        <span>Total</span>
        <small>Technicians</small>
      </div>
      <div>
        <strong className="text-success">{active}</strong>
        <span>Active</span>
        <small>Technicians</small>
      </div>
      <div>
        <strong className="text-danger">{inactive}</strong>
        <span>Inactive</span>
        <small>Late Inaction</small>
      </div>
    </div>
  );
};

export const TechnicianFilters = ({ activeTab, onTabChange, skill, onSkillChange, status, onStatusChange, city, onCityChange }) => (
  <div className="tech-filter-row">
    <div className="filter-group">
      {['All', 'Available', 'On Job', 'Inactive'].map((tab) => (
        <button key={tab} className={`filter-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => onTabChange(tab)} type="button">
          {tab}
        </button>
      ))}
    </div>
    <select className="form-select sm" value={skill} onChange={(event) => onSkillChange(event.target.value)} aria-label="Filter by skill">
      <option>All Skills</option>
      <option>Laptop</option>
      <option>Printer</option>
      <option>Networking</option>
      <option>Chip-Level</option>
    </select>
    <select className="form-select sm" value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label="Filter by status">
      <option>All Status</option>
      <option>Available</option>
      <option>On Job</option>
      <option>Inactive</option>
    </select>
    <input className="tech-city-input" value={city} onChange={(event) => onCityChange(event.target.value)} placeholder="City" aria-label="City filter" />
  </div>
);

export const TechnicianMap = ({ technicians, onSelect }) => (
  <section className="card tech-map-card">
    <div className="tech-map-toolbar">
      <button className="btn btn-secondary btn-sm" type="button">
        <MapPin size={14} />
        <span>View Details</span>
        <ChevronRight size={14} />
      </button>
      <span className="badge badge-info">Live</span>
    </div>
    <div className="tech-map-surface">
      {technicians.map((tech, index) => (
        <button
          key={tech.id}
          type="button"
          className={`tech-map-pin ${tech.jobStatus === 'On Job' ? 'busy' : 'available'}`}
          style={{ left: tech.mapPosition.left, top: tech.mapPosition.top }}
          onClick={() => onSelect(tech.id)}
          aria-label={`Select ${tech.name}`}
        >
          <TechnicianAvatar name={tech.name} size="sm" />
          <span>{index % 2 === 0 ? '8' : index % 3 === 0 ? '12' : '10'} mins ago</span>
        </button>
      ))}
    </div>
  </section>
);

export const TopTechnicianCard = ({ technician, onSelect }) => (
  <section className="card tech-top-card">
    <div className="card-header">
      <div>
        <h3>Top Technician of The Week</h3>
        <p>Best performer by job completion and rating.</p>
      </div>
      <span className="badge badge-warning">Top</span>
    </div>
    <div className="tech-top-profile">
      <div>
        <h4>{technician.name}</h4>
        <p><MapPin size={13} /> {technician.branch}, {technician.lastSeen}</p>
        <span className={getTechStatusClass(technician.jobStatus)}>{technician.jobStatus}</span>
      </div>
      <TechnicianAvatar name={technician.name} size="lg" />
    </div>
    <div className="tech-top-metrics">
      <span><small>Jobs</small><strong>{technician.assignedJobs}</strong></span>
      <span><small>Rating</small><strong>{technician.rating}</strong></span>
      <span><small>Performance</small><strong>{technician.performance}%</strong></span>
    </div>
    <button className="btn btn-secondary btn-full" type="button" onClick={() => onSelect(technician.id)}>View Details</button>
  </section>
);

export const PendingJobsCard = ({ jobs }) => {
  const series = jobs.map((job) => ({ name: job.customer.split(' ')[0], value: Math.max(1, Math.round(job.amount / 1000)) }));
  return (
    <section className="card tech-pending-card">
      <div className="card-header">
        <div>
          <h3>Pending Jobs</h3>
          <p>Jobs waiting for assignment.</p>
        </div>
      </div>
      <div className="tech-pending-count"><strong>{jobs.length * 10 + 2}</strong><span>jobs</span></div>
      <div className="tech-mini-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="value" fill="#1d9b6c" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export const TechnicianPerformanceCard = ({ technicians }) => (
  <section className="card tech-side-card">
    <div className="card-header"><h3>Technician Performance</h3></div>
    <div className="tech-side-list">
      {technicians.slice(0, 3).map((tech) => (
        <div key={tech.id} className="tech-side-row">
          <span>{tech.name}</span>
          <strong>INR {tech.earnings.toLocaleString('en-IN')}</strong>
          <span className={getTechStatusClass(tech.jobStatus)}>{tech.jobStatus}</span>
        </div>
      ))}
    </div>
  </section>
);

export const AttendanceLogsCard = ({ logs }) => (
  <section className="card tech-side-card">
    <div className="card-header"><h3>Attendance Logs</h3></div>
    <div className="tech-attendance-list">
      {logs.slice(0, 3).map((log) => (
        <div key={log.id} className="tech-attendance-row">
          <TechnicianAvatar name={log.technician} size="sm" />
          <div>
            <strong>{log.technician}</strong>
            <small>{log.location} | {log.time}</small>
          </div>
          <span className={getTechStatusClass(log.status)}>{log.minutes}</span>
        </div>
      ))}
    </div>
    <div className="tech-pagination">
      <button type="button">Previous</button>
      <span>1</span>
      <span>2</span>
      <span>3</span>
      <button type="button">Next</button>
    </div>
  </section>
);

export const TechnicianProfileCard = ({ technician, onAction, onAssign, onPermissions }) => (
  <aside className="card tech-floating-card">
    <button className="icon-btn tech-floating-close" aria-label="Close technician card" type="button" onClick={() => onAction('Close', technician)}>
      <X size={16} />
    </button>
    <div className="tech-floating-head">
      <TechnicianAvatar name={technician.name} size="md" />
      <div>
        <h3>{technician.name} <span>#{technician.id}</span></h3>
        <p>{technician.currentJob}</p>
        <small>{technician.assignedJobs} jobs app. {technician.lastSeen}</small>
      </div>
    </div>
    <div className="tech-quick-actions">
      <button type="button" onClick={() => onAction('Call', technician)}><Phone size={16} /><span>Call</span></button>
      <button type="button" onClick={() => onAction('Message', technician)}><MessageSquare size={16} /><span>Message</span></button>
      <button type="button" onClick={() => onAction('Track', technician)}><LocateFixed size={16} /><span>Track</span></button>
      <button type="button" onClick={() => onAssign(technician.id)}><Wrench size={16} /><span>Assign</span></button>
    </div>
    <button className="btn btn-primary btn-full" type="button" onClick={() => onAssign(technician.id)}>
      <Plus size={15} />
      <span>Assign Job</span>
    </button>
    <div className="tech-attendance-actions">
      {['Start Shift', 'Present', 'Absent', 'On Leave', 'Suspend', 'Terminate'].map((action) => (
        <button key={action} type="button" onClick={() => onAction(action, technician)}>{action}</button>
      ))}
    </div>
    <button className="btn btn-secondary btn-full" type="button" onClick={onPermissions}>
      <Shield size={15} />
      <span>Edit Permissions</span>
    </button>
    <button className="btn btn-secondary btn-full" type="button" onClick={() => onAction('View Profile', technician)}>View Profile</button>
  </aside>
);

export const TechnicianTable = ({ technicians, onSelect, onAssign }) => (
  <section className="card overflow-hidden tech-table-card">
    <div className="card-header">
      <div>
        <h3>Technician List</h3>
        <p>Availability, skill, job load, and location state.</p>
      </div>
      <button className="btn btn-primary" type="button"><Plus size={15} /><span>Add Technician</span></button>
    </div>
    <table className="leads-table tech-table">
      <thead>
        <tr>
          <th>Photo</th>
          <th>Name</th>
          <th>Role</th>
          <th>Assigned Jobs</th>
          <th>Skills</th>
          <th>Status</th>
          <th>Last Seen</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {technicians.map((tech) => (
          <tr key={tech.id}>
            <td><TechnicianAvatar name={tech.name} size="sm" /></td>
            <td><strong>{tech.name}</strong><small>{tech.id}</small></td>
            <td>{tech.role}</td>
            <td>{tech.assignedJobs}, {tech.pendingJobs}</td>
            <td>{tech.skills.join(', ')}</td>
            <td><span className={getTechStatusClass(tech.jobStatus)}>{tech.jobStatus}</span></td>
            <td>{tech.lastSeen}</td>
            <td>
              <div className="action-btns">
                <button className="icon-btn" type="button" onClick={() => onSelect(tech.id)} aria-label={`View ${tech.name}`}><ChevronRight size={15} /></button>
                <button className="btn btn-sm btn-secondary" type="button" onClick={() => onAssign(tech.id)}>Assign</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

export const AssignJobModal = ({ technicians, jobs, selectedTechnicianId, onClose, onAssign }) => {
  const [technicianId, setTechnicianId] = React.useState(selectedTechnicianId || technicians[0]?.id || '');
  const [jobId, setJobId] = React.useState(jobs[0]?.id || '');
  const [priority, setPriority] = React.useState('Medium');
  const [notes, setNotes] = React.useState('');

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel tech-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2>Assign Job</h2>
            <p>Select a pending job and technician.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close assign job"><X size={16} /></button>
        </div>
        <div className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Pending Job</label>
              <select value={jobId} onChange={(event) => setJobId(event.target.value)}>
                {jobs.map((job) => <option key={job.id} value={job.id}>{job.id} - {job.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Technician</label>
              <select value={technicianId} onChange={(event) => setTechnicianId(event.target.value)}>
                {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" type="button" onClick={() => onAssign({ technicianId, jobId, priority, notes })} disabled={!jobId || !technicianId}>Assign</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PermissionsModal = ({ config, options, onToggle, onClose }) => (
  <div className="modal-overlay" role="presentation">
    <div className="modal-panel tech-permissions-modal" role="dialog" aria-modal="true">
      <div className="modal-header">
        <div>
          <h2>Edit Permissions</h2>
          <p>Role-based permission setup.</p>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close permissions"><X size={16} /></button>
      </div>
      <div className="modal-form">
        <div className="tech-permissions-grid">
          {Object.entries(config).map(([role, permissions]) => (
            <div key={role} className="card tech-permission-role">
              <h3>{role}</h3>
              {options.map((permission) => (
                <label key={`${role}-${permission}`} className="checkbox-mini">
                  <input type="checkbox" checked={permissions.includes(permission)} onChange={() => onToggle(role, permission)} />
                  <span className="checkmark-mini" />
                  <span>{permission}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
