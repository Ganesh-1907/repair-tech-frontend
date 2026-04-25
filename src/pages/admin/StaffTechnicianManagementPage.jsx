import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  ChevronRight,
  IndianRupee,
  Search,
  Ticket,
  X,
} from 'lucide-react';
import {
  AssignJobModal,
  AttendanceLogsCard,
  PendingJobsCard,
  PermissionsModal,
  TechnicianFilters,
  TechnicianMap,
  TechnicianPerformanceCard,
  TechnicianProfileCard,
  TechnicianSummaryCards,
  TechnicianTable,
  TopTechnicianCard,
} from '../../components/staff/TechnicianDashboardComponents';
import { getTechnicianDashboardData, permissionOptions } from '../../services/technicianDashboardService';

const StaffTechnicianManagementPage = () => {
  const sourceData = useMemo(() => getTechnicianDashboardData(), []);
  const [technicians, setTechnicians] = useState(sourceData.technicians);
  const [pendingJobs, setPendingJobs] = useState(sourceData.pendingJobs);
  const [assignedJobs, setAssignedJobs] = useState(sourceData.assignedJobs);
  const [attendanceLogs, setAttendanceLogs] = useState(sourceData.attendanceLogs);
  const [permissionConfig, setPermissionConfig] = useState(sourceData.permissions);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [cityFilter, setCityFilter] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const selectedTechnician = technicians.find((tech) => tech.id === selectedTechnicianId) || technicians[0];
  const topTechnician = [...technicians].sort((a, b) => b.performance - a.performance)[0];

  const filteredTechnicians = technicians.filter((tech) => {
    const tabMatch = activeTab === 'All' || tech.jobStatus === activeTab;
    const skillMatch = skillFilter === 'All Skills' || tech.skills.includes(skillFilter);
    const statusMatch = statusFilter === 'All Status' || tech.jobStatus === statusFilter;
    const cityMatch = !cityFilter.trim() || tech.city.toLowerCase().includes(cityFilter.trim().toLowerCase()) || tech.branch.toLowerCase().includes(cityFilter.trim().toLowerCase());
    return tabMatch && skillMatch && statusMatch && cityMatch;
  });

  const summary = {
    totalJobs: assignedJobs.length + pendingJobs.length,
    revenue: technicians.reduce((sum, tech) => sum + tech.earnings, 0),
    openTickets: pendingJobs.length * 6 + 2,
  };

  const handleTechnicianAction = (action, technician) => {
    if (action === 'Close') {
      setIsProfileOpen(false);
      return;
    }

    if (['Present', 'Absent', 'On Leave'].includes(action)) {
      setTechnicians((current) => current.map((tech) => (
        tech.id === technician.id ? { ...tech, attendance: action } : tech
      )));
      setAttendanceLogs((current) => [
        {
          id: `ATT-${Date.now().toString().slice(-5)}`,
          technician: technician.name,
          location: technician.distance,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: action,
          minutes: 'now',
        },
        ...current,
      ]);
    }

    if (action === 'Start Shift') {
      setTechnicians((current) => current.map((tech) => (
        tech.id === technician.id ? { ...tech, attendance: 'Present', employmentStatus: 'Active', jobStatus: tech.jobStatus === 'Inactive' ? 'Available' : tech.jobStatus } : tech
      )));
    }

    if (action === 'Suspend' || action === 'Terminate') {
      setTechnicians((current) => current.map((tech) => (
        tech.id === technician.id ? { ...tech, employmentStatus: 'Inactive', jobStatus: 'Inactive', attendance: action === 'Terminate' ? 'Absent' : tech.attendance } : tech
      )));
    }

    setNotice(`${action} action applied to ${technician.name}.`);
  };

  const openProfile = (id) => {
    setSelectedTechnicianId(id);
    setIsProfileOpen(true);
  };

  const openAssign = (technicianId = selectedTechnicianId) => {
    if (technicianId) setSelectedTechnicianId(technicianId);
    setIsAssignOpen(true);
  };

  const assignJob = ({ technicianId, jobId, priority }) => {
    const job = pendingJobs.find((entry) => entry.id === jobId);
    const tech = technicians.find((entry) => entry.id === technicianId);
    if (!job || !tech) return;

    setAssignedJobs((current) => [
      { id: job.id, title: job.title, technicianId: tech.id, status: 'Assigned' },
      ...current,
    ]);
    setPendingJobs((current) => current.filter((entry) => entry.id !== job.id));
    setTechnicians((current) => current.map((entry) => (
      entry.id === tech.id
        ? { ...entry, jobStatus: 'On Job', assignedJobs: entry.assignedJobs + 1, pendingJobs: Math.max(0, entry.pendingJobs - 1) }
        : entry
    )));
    setIsAssignOpen(false);
    setNotice(`Assigned ${job.id} to ${tech.name} with ${priority} priority.`);
  };

  const togglePermission = (role, permission) => {
    setPermissionConfig((current) => {
      const existing = current[role] || [];
      const next = existing.includes(permission)
        ? existing.filter((item) => item !== permission)
        : [...existing, permission];
      return { ...current, [role]: next };
    });
    setNotice(`Permission updated for ${role}.`);
  };

  return (
    <div className="staff-tech-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss staff message">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="card tech-welcome-bar">
        <div>
          <h2>Welcome, Admin!</h2>
          <p>Technicians <ChevronRight size={13} /> Staff Management</p>
        </div>
        <div className="tech-top-stats">
          <span><Briefcase size={16} /><strong>{summary.totalJobs}</strong><small>Total Jobs</small></span>
          <span><IndianRupee size={16} /><strong>{summary.revenue.toLocaleString('en-IN')}</strong><small>This month</small></span>
          <span><Ticket size={16} /><strong>{summary.openTickets}</strong><small>Open tickets</small></span>
        </div>
      </section>

      <div className="tech-title-row">
        <div>
          <h1>Technicians</h1>
          <p>Live technician activity, assignment, attendance, and permissions.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => openAssign()}>
          + Add Technician
        </button>
      </div>

      <div className="tech-dashboard-grid">
        <main className="tech-main-column">
          <TechnicianSummaryCards technicians={technicians} />
          <TechnicianFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            skill={skillFilter}
            onSkillChange={setSkillFilter}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            city={cityFilter}
            onCityChange={setCityFilter}
          />
          <TechnicianMap technicians={filteredTechnicians} onSelect={openProfile} />
          <TechnicianTable technicians={filteredTechnicians} onSelect={openProfile} onAssign={openAssign} />
        </main>

        <aside className="tech-right-column">
          <TopTechnicianCard technician={topTechnician} onSelect={openProfile} />
          <PendingJobsCard jobs={pendingJobs} />
          <TechnicianPerformanceCard technicians={technicians} />
          <AttendanceLogsCard logs={attendanceLogs} />
        </aside>
      </div>

      {isProfileOpen && (
        <TechnicianProfileCard
          technician={selectedTechnician}
          onAction={handleTechnicianAction}
          onAssign={openAssign}
          onPermissions={() => setIsPermissionsOpen(true)}
        />
      )}

      {isAssignOpen && (
        <AssignJobModal
          technicians={technicians}
          jobs={pendingJobs}
          selectedTechnicianId={selectedTechnicianId}
          onClose={() => setIsAssignOpen(false)}
          onAssign={assignJob}
        />
      )}

      {isPermissionsOpen && (
        <PermissionsModal
          config={permissionConfig}
          options={permissionOptions}
          onToggle={togglePermission}
          onClose={() => setIsPermissionsOpen(false)}
        />
      )}
    </div>
  );
};

export default StaffTechnicianManagementPage;
