import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Workflow, 
  Receipt, 
  TrendingUp, 
  UserCircle, 
  Settings,
  LogOut,
  ShieldCheck,
  Eye,
  EyeOff,
  Key,
  Wrench,
  CalendarClock,
  Package
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { isPrivacyOn, togglePrivacy } = usePrivacy();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Workflow', path: '/workflow', icon: Workflow },
    { name: 'Rental Management', path: '/rental', icon: Key },
    { name: 'CMC Management', path: '/cmc', icon: Wrench },
    { name: 'AMC Management', path: '/amc', icon: CalendarClock },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Billing', path: '/billing', icon: Receipt },
    { name: 'Expenses', path: '/expenses', icon: TrendingUp },
    { name: 'Staff Management', path: '/staff', icon: ShieldCheck, roles: ['admin'] },
    { name: 'CA Portal', path: '/ca-portal', icon: UserCircle, roles: ['admin', 'ca'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">V</div>
          <span className="logo-text">EnterpriseSaaS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredMenu.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={togglePrivacy} 
          className={`sidebar-btn privacy-toggle ${isPrivacyOn ? 'active' : ''}`}
          title={isPrivacyOn ? "Show values" : "Hide values"}
        >
          {isPrivacyOn ? <Eye size={18} /> : <EyeOff size={18} />}
          <span>Privacy Mode: {isPrivacyOn ? 'ON' : 'OFF'}</span>
        </button>
        
        <button onClick={logout} className="sidebar-btn logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
