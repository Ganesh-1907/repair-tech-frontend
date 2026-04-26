import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Truck } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalAssetService } from '../../services/rentalAssetService';

const RentalAssetsInstallationsPage = () => {
  const [assets, setAssets] = useState([]);
  const [notice, setNotice] = useState('');

  const refresh = async () => setAssets(await rentalAssetService.listAssets());

  useEffect(() => {
    refresh();
  }, []);

  const createChallan = async (assetId) => {
    const challan = await rentalAssetService.generateDeliveryChallan(assetId);
    setNotice(`Delivery challan ${challan.challanNo} generated.`);
  };

  return (
    <div className="admin-module-page">
      {notice ? <div className="success-banner" role="status"><span>{notice}</span></div> : null}
      <AdminPageHeader
        title="Assets & Installations"
        description="Track installed rental assets, technicians, tags, and challans."
        breadcrumbs={['Admin', 'Rental Management', 'Assets & Installations']}
      />

      <div className="card overflow-hidden">
        <table className="leads-table">
          <thead><tr><th>Asset ID</th><th>Serial</th><th>Device</th><th>Customer</th><th>Location</th><th>Technician</th><th>Status</th><th>Tag</th><th>Action</th></tr></thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.assetId}</td>
                <td>{asset.serialNumber}</td>
                <td>{asset.model}</td>
                <td>{asset.customerName}</td>
                <td>{asset.customerLocation}</td>
                <td>{asset.technician}</td>
                <td><span className="status-pill status-pending">{asset.status}</span></td>
                <td><span className="qr-mini"><QrCode size={14} />{asset.qrTag}</span></td>
                <td>
                  <div className="action-btns">
                    <Link className="btn btn-sm btn-secondary" to={`/admin/rental/assets/${asset.id}`}>Open</Link>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => createChallan(asset.id)}><Truck size={14} /> Challan</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalAssetsInstallationsPage;

