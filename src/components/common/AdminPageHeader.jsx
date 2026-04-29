import React from 'react';
import { ChevronRight } from 'lucide-react';

const AdminPageHeader = ({ title, description, breadcrumbs = [], actions = [] }) => {
  return (
    <div className="card module-placeholder-header admin-module-header">
      {breadcrumbs.length > 0 && (
        <nav className="module-breadcrumb" aria-label="Page breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb}-${index}`}>
              {index > 0 && <ChevronRight size={14} className="module-breadcrumb-separator" aria-hidden="true" />}
              <span className={index === breadcrumbs.length - 1 ? 'is-current' : ''}>{crumb}</span>
            </React.Fragment>
          ))}
        </nav>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '16px', gap: '24px' }}>
        <div className="module-placeholder-copy">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{title}</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '4px' }}>{description}</p>
        </div>

        {actions.length > 0 && (
          <div className="module-placeholder-actions" style={{ marginTop: '0', display: 'flex', gap: '12px' }}>
            {actions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={`${title}-${action.label}`}
                  className={`btn ${action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`}
                  type="button"
                  onClick={action.onClick}
                  disabled={Boolean(action.disabled)}
                  aria-label={action.ariaLabel || action.label}
                  title={action.title || action.label}
                  style={{ height: '48px', padding: '0 24px', fontSize: '1rem' }}
                >
                  {ActionIcon ? <ActionIcon size={20} aria-hidden="true" /> : null}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPageHeader;
