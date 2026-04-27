import React, { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  ChevronDown,
  Eye,
  EyeOff,
  Key,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCircle,
  Workflow,
  Wrench,
  Boxes,
  UserCog,
  ReceiptText
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../context/AuthContext';
import { adminSidebarModules } from '../../config/adminModules';

const menuIcons = {
  LayoutDashboard,
  Workflow,
  Key,
  CalendarClock,
  ShieldCheck,
  Wrench,
  UserCircle,
  Boxes,
  UserCog,
  ReceiptText
};

const hasChildren = (item) => Array.isArray(item.children) && item.children.length > 0;

const isPathActive = (itemPath, pathname) => {
  if (!itemPath) return false;
  if (itemPath === pathname) return true;
  return pathname.startsWith(`${itemPath}/`);
};

const isItemActive = (item, pathname) => {
  if (item.path && isPathActive(item.path, pathname)) return true;
  if (!hasChildren(item)) return false;
  return item.children.some((child) => isItemActive(child, pathname));
};

const buildInitialOpenState = (items, pathname, state = {}) => {
  items.forEach((item) => {
    if (!hasChildren(item)) return;
    state[item.id] = Boolean(item.defaultOpen) || isItemActive(item, pathname);
    buildInitialOpenState(item.children, pathname, state);
  });

  return state;
};

const collectActiveBranchIds = (items, pathname, collector = []) => {
  items.forEach((item) => {
    if (!hasChildren(item)) return;
    if (isItemActive(item, pathname)) {
      collector.push(item.id);
      collectActiveBranchIds(item.children, pathname, collector);
    }
  });
  return collector;
};

const filterItemsByRole = (items, role) => (
  items.reduce((accumulator, item) => {
    if (item.roles && !item.roles.includes(role)) return accumulator;

    const nextItem = { ...item };
    if (hasChildren(nextItem)) {
      nextItem.children = filterItemsByRole(nextItem.children, role);
    }

    if (nextItem.path || hasChildren(nextItem)) {
      accumulator.push(nextItem);
    }

    return accumulator;
  }, [])
);

const Sidebar = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPrivacyOn, togglePrivacy } = usePrivacy();
  const { user, logout } = useAuth();

  const sidebarItems = useMemo(
    () => filterItemsByRole(adminSidebarModules, user?.role),
    [user?.role]
  );

  const [openById, setOpenById] = useState(() => buildInitialOpenState(sidebarItems, location.pathname));
  const activeBranchIds = useMemo(
    () => collectActiveBranchIds(sidebarItems, location.pathname),
    [location.pathname, sidebarItems]
  );

  const toggleGroup = (groupId, fallbackOpen) => {
    setOpenById((current) => {
      const hasOwnValue = Object.prototype.hasOwnProperty.call(current, groupId);
      const isCurrentlyOpen = hasOwnValue ? current[groupId] : fallbackOpen;
      return { ...current, [groupId]: !isCurrentlyOpen };
    });
  };

  const renderNode = (item, depth = 0) => {
    const Icon = item.icon ? menuIcons[item.icon] : null;
    const itemIsActive = isItemActive(item, location.pathname);
    const nodeHasChildren = hasChildren(item);
    const content = (
      <span className="nav-item-content">
        {Icon ? (
          <Icon size={18} />
        ) : (
          <span className={`nav-node-marker depth-${depth}`} aria-hidden="true"></span>
        )}
        <span>{item.label}</span>
      </span>
    );

    if (nodeHasChildren) {
      const hasOpenOverride = Object.prototype.hasOwnProperty.call(openById, item.id);
      const isForcedOpen = activeBranchIds.includes(item.id);
      const nodeIsOpen = isForcedOpen || (hasOpenOverride ? openById[item.id] : Boolean(item.defaultOpen));

      return (
        <div key={item.id} className={`nav-tree-item depth-${depth} ${itemIsActive ? 'is-active-branch' : ''}`}>
          <button
            type="button"
            className={`nav-item nav-parent depth-${depth} ${itemIsActive ? 'active-branch' : ''}`}
            aria-expanded={nodeIsOpen}
            aria-controls={`sidebar-group-${item.id}`}
            onClick={() => {
              toggleGroup(item.id, Boolean(item.defaultOpen));
              if (item.path && item.path !== location.pathname) {
                navigate(item.path);
                onClose?.();
              }
            }}
          >
            {content}
            <ChevronDown size={16} className={`nav-chevron ${nodeIsOpen ? 'open' : ''}`} aria-hidden="true" />
          </button>

          {nodeIsOpen && (
            <div id={`sidebar-group-${item.id}`} className="nav-subtree">
              {item.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (!item.path) return null;

    return (
      <NavLink
        key={item.id}
        to={item.path}
        className={({ isActive }) => `nav-item nav-leaf depth-${depth} ${isActive ? 'active' : ''}`}
        onClick={onClose}
      >
        {content}
      </NavLink>
    );
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <span>R</span>
          </div>
          <div className="logo-text">
            <span className="logo-name">RepairTech</span>
            <span className="logo-tagline">Enterprise</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Admin Modules</div>
        <div className="nav-tree">
          {sidebarItems.map((item) => renderNode(item))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={togglePrivacy}
          className={`sidebar-btn privacy-toggle ${isPrivacyOn ? 'active' : ''}`}
          title={isPrivacyOn ? 'Show values' : 'Hide values'}
        >
          {isPrivacyOn ? <Eye size={18} /> : <EyeOff size={18} />}
          <span>Privacy Mode</span>
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
