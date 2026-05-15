import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Wrench, CreditCard, MessageSquarePlus, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CustomerPortal.css';

const navItems = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customer/contracts', label: 'My Contracts', icon: FileText },
  { to: '/customer/repairs', label: 'Repair History', icon: Wrench },
  { to: '/customer/payments', label: 'Payments', icon: CreditCard },
  { to: '/customer/service-request', label: 'Raise Request', icon: MessageSquarePlus },
];

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/customer/login', { replace: true });
  };

  return (
    <div className="cp-shell">
      <aside className="cp-sidebar">
        <div className="cp-sidebar-brand">
          <h2>RepairTech</h2>
          <p>{user?.customerName || user?.email || 'Customer'}</p>
        </div>

        <nav className="cp-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `cp-nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="cp-sidebar-footer">
          <button className="cp-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="cp-main">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
