import React from 'react';
import { ChevronRight, FileText } from 'lucide-react';

const ModulePlaceholderPage = ({ label, breadcrumbs = [], description, actions = [] }) => {
  return (
    <div className="module-placeholder-page">
      <div className="card module-placeholder-header">
        <nav className="module-breadcrumb" aria-label="Page breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb}-${index}`}>
              {index > 0 && <ChevronRight size={14} className="module-breadcrumb-separator" aria-hidden="true" />}
              <span className={index === breadcrumbs.length - 1 ? 'is-current' : ''}>{crumb}</span>
            </React.Fragment>
          ))}
        </nav>

        <div className="module-placeholder-copy">
          <h2>{label}</h2>
          <p>{description}</p>
        </div>

        {actions.length > 0 && (
          <div className="module-placeholder-actions" aria-label="Placeholder page actions">
            {actions.map((action, index) => (
              <button
                key={`${label}-${action}`}
                className={`btn ${index === 0 ? 'btn-primary' : 'btn-secondary'}`}
                type="button"
                aria-label={`${action} in ${label}`}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card module-empty-card" role="status">
        <div className="module-empty-icon" aria-hidden="true">
          <FileText size={18} />
        </div>
        <h3>{label}</h3>
        <p>Detailed requirements will be added later</p>
      </div>
    </div>
  );
};

export default ModulePlaceholderPage;

