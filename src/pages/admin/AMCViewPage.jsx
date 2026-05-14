import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, FileText } from 'lucide-react';
import { api } from '../../services/apiClient';
import './PlansCustomers.css';

const dash = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return value;
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN');
};

const DataRow = ({ label, value }) => (
  <div className="view-data-row">
    <label className="view-data-label">{label}</label>
    <span className="view-data-value">{dash(value)}</span>
  </div>
);

const ConfigTable = ({ rows = [] }) => {
  const visibleRows = rows.length ? rows : [{ name: '', specification: '', serialNumber: '' }];
  return (
    <table className="view-details-table">
      <thead>
        <tr><th>Name</th><th>Specification</th><th>Serial Number</th></tr>
      </thead>
      <tbody>
        {visibleRows.map((row, idx) => (
          <tr key={idx}>
            <td>{dash(row.name)}</td>
            <td>{dash(row.specification)}</td>
            <td>{dash(row.serialNumber)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const DeviceDetails = ({ device }) => {
  if (device.type === 'Desktop' || device.type === 'Server') {
    return (
      <>
        <h4 className="view-device-subtitle">CPU Details</h4>
        <div className="view-grid-3">
          <DataRow label="Sub Type" value={device.cpu?.subType} />
          <DataRow label="Brand" value={device.cpu?.brand} />
          <DataRow label="Model" value={device.cpu?.model} />
          <DataRow label="Configuration" value={device.cpu?.config} />
          <DataRow label="Location" value={device.cpu?.location} />
        </div>
        <h4 className="view-device-subtitle">Monitor Details</h4>
        <div className="view-grid-3">
          <DataRow label="Sub Type" value={device.monitor?.subType} />
          <DataRow label="Brand" value={device.monitor?.brand} />
          <DataRow label="Serial Number" value={device.monitor?.serialNumber} />
          <DataRow label="Location" value={device.monitor?.location} />
        </div>
      </>
    );
  }

  if (device.type === 'Laptop') {
    return (
      <>
        <div className="view-grid-3">
          <DataRow label="Brand" value={device.brand} />
          <DataRow label="Model" value={device.model} />
          <DataRow label="Location" value={device.location} />
        </div>
        <h4 className="view-device-subtitle">Configuration</h4>
        <ConfigTable rows={device.configurations} />
      </>
    );
  }

  if (device.type === 'Printer') {
    return (
      <div className="view-grid-3">
        <DataRow label="Sub Type" value={device.subType} />
        <DataRow label="Brand" value={device.brand} />
        <DataRow label="Model" value={device.model} />
        <DataRow label="Serial Number" value={device.serialNumber} />
        <DataRow label="Input Field" value={device.inputField} />
        <DataRow label="Location" value={device.location} />
      </div>
    );
  }

  if (device.type === 'CCTV') {
    const specs = Array.isArray(device.specs) ? device.specs.filter(Boolean).join(', ') : device.specs;
    return (
      <div className="view-grid-3">
        <DataRow label="Sub Type" value={device.subType} />
        <DataRow label="Brand" value={device.brand} />
        <DataRow label="Model" value={device.model} />
        <DataRow label="Serial Number" value={device.serialNumber} />
        <DataRow label="Location" value={device.location} />
        <DataRow label="Specs" value={specs} />
      </div>
    );
  }

  if (device.type === 'Total Maintenance') {
    return (
      <>
        <div className="view-grid-3">
          <DataRow label="Sub Device Type" value={device.subDeviceType} />
        </div>
        <DeviceDetails device={device.subDeviceData || { type: device.subDeviceType }} />
      </>
    );
  }

  return (
    <div className="view-grid-3">
      <DataRow label="Brand" value={device.brand} />
      <DataRow label="Model" value={device.model} />
      <DataRow label="Serial Number" value={device.serialNumber} />
      <DataRow label="Location" value={device.location} />
    </div>
  );
};

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
  const primaryContact = details.primaryContact || {};
  const secondaryContact = details.secondaryContact || {};
  const devices = Array.isArray(details.devices) ? details.devices : [];

  return (
    <div className="amc-new-page">
      <div className="amc-new-page-header">
        <button className="back-button" onClick={() => navigate('/admin/amc/inventory')}>
          <ArrowLeft size={18} /> Back to AMC Inventory
        </button>
        <div className="amc-new-page-title">
          <h1>View AMC Enrollment</h1>
          <p>Complete customer, contract, and device details.</p>
        </div>
      </div>

      <div className="amc-new-page-body view-page-body">
        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title"><User size={18} /> 1. Customer / Company</h2>
          </div>
          <div className="amc-form-card-body">
            <div className="view-grid">
              <DataRow label="Company Name / Customer Name" value={contract.customerName} />
              <DataRow label="GST Number" value={details.gstin} />
            </div>
            <div className="view-grid view-address-grid">
              <DataRow label="Registered Address" value={details.address} />
            </div>

            <div className="view-section-divider" />
            <h3 className="view-sub-title">Primary Contact</h3>
            <div className="view-grid-3">
              <DataRow label="Name" value={details.authorizedPerson1 || primaryContact.name} />
              <DataRow label="Mobile" value={primaryContact.mobile || details.contact} />
              <DataRow label="Email" value={primaryContact.email} />
            </div>

            <div className="view-section-divider" />
            <h3 className="view-sub-title">Secondary Contact</h3>
            <div className="view-grid-3">
              <DataRow label="Name" value={details.authorizedPerson2 || secondaryContact.name} />
              <DataRow label="Mobile" value={secondaryContact.mobile} />
              <DataRow label="Email" value={secondaryContact.email} />
            </div>
          </div>
        </div>

        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title"><FileText size={18} /> 2. Contract Details</h2>
          </div>
          <div className="amc-form-card-body">
            <div className="view-grid">
              <DataRow label="AMC ID" value={contract.id || contract.contractId} />
              <DataRow label="AMC Plan" value={details.planName} />
              <DataRow label="Expiry Date" value={formatDate(contract.endDate || contract.expiryDate)} />
              <DataRow label="Status" value={contract.status} />
            </div>
          </div>
        </div>

        <div className="amc-form-card">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title"><Package size={18} /> 3. Device Registry</h2>
          </div>
          <div className="amc-form-card-body">
            {devices.length === 0 ? (
              <div className="view-device-item">
                <div className="view-device-header">
                  <span className="view-device-index">Device 1</span>
                  <span className="view-device-type-badge">-</span>
                </div>
                <div className="view-device-body">
                  <div className="view-grid-3">
                    <DataRow label="Type" value="" />
                    <DataRow label="Brand" value="" />
                    <DataRow label="Model" value="" />
                    <DataRow label="Serial Number" value="" />
                    <DataRow label="Location" value="" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="view-device-list">
                {devices.map((device, idx) => (
                  <div key={idx} className="view-device-item">
                    <div className="view-device-header">
                      <span className="view-device-index">Device {idx + 1}</span>
                      <span className="view-device-type-badge">{dash(device.type)}</span>
                    </div>
                    <div className="view-device-body">
                      <DeviceDetails device={device} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .view-page-body {
          max-width: 980px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .view-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px 24px;
        }
        .view-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px 24px;
        }
        .view-address-grid {
          margin-top: 20px;
          grid-template-columns: 1fr;
        }
        .view-data-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .view-data-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--slate-500);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .view-data-value {
          font-size: 15px;
          line-height: 1.45;
          color: var(--slate-900);
          font-weight: 500;
          overflow-wrap: anywhere;
        }
        .view-section-divider {
          height: 1px;
          background: var(--slate-100);
          margin: 24px 0;
        }
        .view-sub-title,
        .view-device-subtitle {
          font-size: 14px;
          font-weight: 800;
          color: var(--slate-700);
          margin: 0 0 16px;
        }
        .view-device-subtitle {
          margin-top: 22px;
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
          font-weight: 800;
          color: var(--slate-600);
        }
        .view-device-type-badge {
          background: var(--primary-50);
          color: var(--primary-700);
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .view-device-body {
          padding: 20px;
        }
        .view-details-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }
        .view-details-table th,
        .view-details-table td {
          border: 1px solid var(--slate-200);
          padding: 10px 12px;
          text-align: left;
          font-size: 13px;
        }
        .view-details-table th {
          background: var(--slate-100);
          color: var(--slate-600);
          font-weight: 800;
          text-transform: uppercase;
          font-size: 11px;
        }
        .view-page-loading, .view-page-error {
          padding: 100px;
          text-align: center;
          font-weight: 600;
          color: var(--slate-600);
        }
        @media (max-width: 900px) {
          .view-grid,
          .view-grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AMCViewPage;
