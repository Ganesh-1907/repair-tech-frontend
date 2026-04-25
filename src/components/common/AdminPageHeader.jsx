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

      <div className="module-placeholder-copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {actions.length > 0 && (
        <div className="module-placeholder-actions" aria-label={`${title} actions`}>
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
              >
                {ActionIcon ? <ActionIcon size={16} aria-hidden="true" /> : null}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
