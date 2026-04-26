import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalAgreementService } from '../../services/rentalAgreementService';

const RentalAgreementsPage = () => {
  const [contracts, setContracts] = useState([]);

  const load = async () => setContracts(await rentalAgreementService.listContracts());

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="admin-module-page">
      <AdminPageHeader
        title="Contracts / Agreements"
        description="Manage corporate and individual agreements with renewal and extension support."
        breadcrumbs={['Admin', 'Rental Management', 'Contracts / Agreements']}
        actions={[{ label: 'Refresh', icon: RefreshCw, onClick: load }]}
      />

      <div className="admin-split-grid">
        <div className="card">
          <div className="card-header"><div><h3>Agreement Entry</h3><p>Form + editable terms + preview.</p></div></div>
          <div className="admin-chip-row">
            <Link className="btn btn-primary" to="/admin/rental/agreements/corporate">Corporate Agreement</Link>
            <Link className="btn btn-secondary" to="/admin/rental/agreements/individual">Individual Agreement</Link>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div><h3>Pre-process / Extension Process</h3><p>Before-process checks and extension rules stay in this module.</p></div></div>
          <div className="detail-list">
            <div><span>Pre-process</span><strong>Customer KYC, approved quotation, device list check</strong></div>
            <div><span>Extension process</span><strong>Renew agreement with new start/end date and revised terms</strong></div>
            <div><span>Renewal action</span><strong>Use Renew button inside agreement pages</strong></div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header"><div><h3>Contract List</h3></div></div>
        <table className="leads-table">
          <thead><tr><th>Contract</th><th>Customer</th><th>Type</th><th>Start</th><th>End</th><th>Monthly Rent</th><th>Status</th></tr></thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id}>
                <td>{contract.contractNo}</td>
                <td>{contract.customerName}</td>
                <td>{contract.agreementType}</td>
                <td>{contract.startDate}</td>
                <td>{contract.endDate}</td>
                <td>{contract.monthlyRent}</td>
                <td><span className="status-pill status-pending">{contract.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalAgreementsPage;

