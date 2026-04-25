import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, FileText, LogOut, Moon, Plus, Search, Sun, Menu } from 'lucide-react';
import { getPageMetadata } from '../../config/pageMetadata';

const actionIcons = {
  fileText: FileText,
  plus: Plus,
};

const Layout = ({ children }) => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [localSearchByPath, setLocalSearchByPath] = useState({});
  const accountMenuRef = useRef(null);
  const pageMeta = useMemo(() => getPageMetadata(location.pathname), [location.pathname]);
  const primaryAction = pageMeta.primaryAction;
  const PrimaryActionIcon = actionIcons[primaryAction?.icon] || Plus;
  const currentSearchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const quickSearch = pageMeta.searchParam
    ? currentSearchParams.get(pageMeta.searchParam) || ''
    : localSearchByPath[location.pathname] || '';

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  const handlePrimaryAction = () => {
    if (!primaryAction?.to) return;
    const targetUrl = new URL(primaryAction.to, window.location.origin);
    const isCurrentPath = targetUrl.pathname === location.pathname;
    navigate(primaryAction.to);
    if (primaryAction.scrollTop && isCurrentPath) {
      requestAnimationFrame(() => {
        document.querySelector('.page-content')?.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    setIsMobileNavOpen(false);
  };

  const handleQuickSearchSubmit = (event) => {
    event.preventDefault();
    if (!pageMeta.searchParam) return;
    const params = new URLSearchParams(currentSearchParams);
    const query = quickSearch.trim();
    if (query) {
      params.set(pageMeta.searchParam, query);
    } else {
      params.delete(pageMeta.searchParam);
    }
    navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleQuickSearchChange = (event) => {
    const nextValue = event.target.value;
    if (!pageMeta.searchParam) {
      setLocalSearchByPath((current) => ({ ...current, [location.pathname]: nextValue }));
      return;
    }

    const params = new URLSearchParams(currentSearchParams);
    if (nextValue.trim()) {
      params.set(pageMeta.searchParam, nextValue);
    } else {
      params.delete(pageMeta.searchParam);
    }
    navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
  };

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <button
              className="mobile-nav-toggle"
              onClick={() => setIsMobileNavOpen((value) => !value)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <div className="topbar-title">
              <h1>{pageMeta.title}</h1>
              {pageMeta.subtitle && <p>{pageMeta.subtitle}</p>}
            </div>
          </div>

          <div className="header-center">
            <form className="search-container" role="search" onSubmit={handleQuickSearchSubmit}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={pageMeta.searchPlaceholder}
                aria-label={pageMeta.searchPlaceholder}
                className="search-input"
                value={quickSearch}
                onChange={handleQuickSearchChange}
              />
            </form>
          </div>

          <div className="header-right">
            {primaryAction && (
              <button
                className="header-action-btn primary"
                aria-label={primaryAction.label}
                title={primaryAction.label}
                onClick={handlePrimaryAction}
              >
                <PrimaryActionIcon size={18} />
                <span className="action-label">{primaryAction.label}</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="account-menu" ref={accountMenuRef}>
              <button
                type="button"
                className="user-profile account-menu-trigger"
                aria-label="User menu"
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                title="User menu"
                onClick={() => setIsAccountMenuOpen((value) => !value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setIsAccountMenuOpen(false);
                }}
              >
                <span className="user-avatar" aria-hidden="true">
                  {user?.name?.charAt(0) || 'U'}
                </span>
                <span className="user-info">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <span className="user-role">{user?.role || 'Admin'}</span>
                </span>
                <ChevronDown size={16} className="account-chevron" aria-hidden="true" />
              </button>

              {isAccountMenuOpen && (
                <div className="account-dropdown" role="menu" aria-label="Account menu">
                  <div className="account-summary">
                    <span className="account-name">{user?.name || 'User'}</span>
                    <span className="account-email">{user?.email || 'admin@enterprise.com'}</span>
                  </div>
                  <button type="button" className="account-menu-item" role="menuitem" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
      {isMobileNavOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          aria-label="Close navigation"
        />
      )}
    </div>
  );
};

export default Layout;
