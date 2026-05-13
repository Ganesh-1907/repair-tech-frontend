import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, FileText, Calendar, ShieldCheck, Edit } from 'lucide-react';
import { api } from '../../services/apiClient';
import './PlansCustomers.css';

const AMCViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('amcContracts', id);
        setContract(data);
      } catch (err) {
        console.error('Failed to load AMC contract:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="view-page-loading">Loading AMC details...</div>;
  if (!contract) return <div className="view-page-error">Contract not found.</div>;

  const details = contract.amcDetails || {};
  
  const DataRow = ({ label, value }) => (
    <div className="view-data-row">
      <label className="view-data-label">{label}</label>
      <span className="view-data-value">{value || '-'}</span>
    </div>
  );

  return (
    <div className="amc-new-page">
      <div className="amc-new-page-header">
        <button className="back-button" onClick={() => navigate('/admin/amc/inventory')}>
          <ArrowLeft size={18} /> Back to AMC Inventory
        </button>
        {/* Section 1: Customer Profile */}
        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title"><User size={18} style={{ marginRight: '8px' }} /> 1. Customer Profile</h2>
          </div>
          <div className="amc-form-card-body">
            <div className="view-grid">
              <DataRow label="Company / Customer Name" value={contract.customerName} />
              <DataRow label="GST Number" value={details.gstin} />
              <DataRow label="Registered Address" value={details.address} />
            </div>
            <div className="view-section-divider" />
            <h3 className="view-sub-title">Primary Contact</h3>
            <div className="view-grid-3">
              <DataRow label="Name" value={details.authorizedPerson1 || (details.primaryContact?.name)} />
              <DataRow label="Mobile" value={details.contact || (details.primaryContact?.mobile)} />
              <DataRow label="Email" value={details.primaryContact?.email} />
            </div>
            {details.authorizedPerson2 && (
              <>
                <div className="view-section-divider" />
                <h3 className="view-sub-title">Secondary Contact</h3>
                <div className="view-grid-3">
                  <DataRow label="Name" value={details.authorizedPerson2 || (details.secondaryContact?.name)} />
                  <DataRow label="Mobile" value={details.secondaryContact?.mobile} />
                  <DataRow label="Email" value={details.secondaryContact?.email} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: Contract Details */}
        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title"><FileText size={18} style={{ marginRight: '8px' }} /> 2. Contract Details</h2>
          </div>
          <div className="amc-form-card-body">
            <div className="view-grid">
              <DataRow label="AMC ID" value={contract.id || contract.contractId} />
              <DataRow label="AMC Plan" value={details.planName} />
              <DataRow label="Expiry Date" value={contract.endDate || contract.expiryDate} />
              <DataRow label="Status" value={contract.status} />
            </div>
          </div>
        </div>

        {/* Section 3: Device Registry */}
        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title"><Package size={18} style={{ marginRight: '8px' }} /> 3. Device Registry</h2>
          </div>
          <div className="amc-form-card-body">
            {!details.devices || details.devices.length === 0 ? (
              <p className="view-empty-text">No devices registered for this contract.</p>
            ) : (
              <div className="view-device-list">
                {details.devices.map((device, idx) => (
                  <div key={idx} className="view-device-item">
                    <div className="view-device-header">
                      <span className="view-device-index">Device {idx + 1}</span>
                      <span className="view-device-type-badge">{device.type}</span>
                    </div>
                    <div className="view-device-body">
                      {device.type === 'Laptop' || device.type === 'Printer' || device.type === 'CCTV' ? (
                        <div className="view-grid-3">
                          <DataRow label="Brand" value={device.brand} />
                          <DataRow label="Model" value={device.model} />
                          <DataRow label="Serial Number" value={device.serialNumber} />
                          <DataRow label="Location" value={device.location} />
                        </div>
                      ) : device.type === 'Desktop' || device.type === 'Server' ? (
                        <>
                          <div className="view-sub-title">CPU Details</div>
                          <div className="view-grid-3">
                            <DataRow label="Brand" value={device.cpu?.brand} />
                            <DataRow label="Model" value={device.cpu?.model} />
                            <DataRow label="Config" value={device.cpu?.config} />
                          </div>
                          <div className="view-sub-title">Monitor Details</div>
                          <div className="view-grid-3">
                            <DataRow label="Brand" value={device.monitor?.brand} />
                            <DataRow label="Serial" value={device.monitor?.serialNumber} />
                          </div>
                        </>
                      ) : (
                        <div className="view-grid-3">
                           <DataRow label="Brand" value={device.brand} />
                           <DataRow label="Model" value={device.model} />
                           <DataRow label="Serial Number" value={device.serialNumber} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .view-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .view-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
        }
        .view-data-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .view-data-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--slate-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .view-data-value {
          font-size: 15px;
          color: var(--slate-900);
          font-weight: 500;
        }
        .view-section-divider {
          height: 1px;
          background: var(--slate-100);
          margin: 20px 0;
        }
        .view-sub-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--slate-700);
          margin-bottom: 16px;
        }
        .view-device-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .view-device-item {
          border: 1px solid var(--slate-200);
          border-radius: 12px;
          overflow: hidden;
          background: var(--slate-50);
        }
        .view-device-header {
          background: white;
          padding: 12px 20px;
          border-bottom: 1px solid var(--slate-200);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .view-device-index {
          font-size: 13px;
          font-weight: 700;
          color: var(--slate-500);
        }
        .view-device-type-badge {
          background: var(--primary-50);
          color: var(--primary-700);
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .view-device-body {
          padding: 20px;
        }
        .view-empty-text {
          color: var(--slate-400);
          text-align: center;
          padding: 40px;
          font-style: italic;
        }
        .view-page-loading, .view-page-error {
          padding: 100px;
          text-align: center;
          font-weight: 600;
          color: var(--slate-600);
        }
      `}</style>
    </div>
  );
};

export default AMCViewPage;
