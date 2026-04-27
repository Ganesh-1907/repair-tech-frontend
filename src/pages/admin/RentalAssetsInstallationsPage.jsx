import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, UserPlus, Gauge, RefreshCw, Eye, FileText, ClipboardCheck, Calendar, MapPin, Truck } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalAssetService } from '../../services/rentalAssetService';
import TechnicianAssignmentModal from '../../components/rental/TechnicianAssignmentModal';
import MeterReadingModal from '../../components/rental/MeterReadingModal';
import ReplacementModal from '../../components/rental/ReplacementModal';
import './RentalPremiumStyles.css';

const RentalAssetsInstallationsPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Modal States
  const [assignModal, setAssignModal] = useState({ isOpen: false, data: null });
  const [meterModal, setMeterModal] = useState({ isOpen: false, data: null });
  const [replaceModal, setReplaceModal] = useState({ isOpen: false, data: null });

  const refresh = async () => {
    setLoading(true);
    setAssets(await rentalAssetService.listAssets());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const searchStr = `${a.serialNumber} ${a.customerName} ${a.model} ${a.deviceType}`.toLowerCase();
      return searchStr.includes(search.toLowerCase());
    });
  }, [assets, search]);

  const handleAssignTech = async (data) => {
    setAssignModal({ isOpen: false, data: null });
    refresh();
  };

  const handleSaveMeter = async (data) => {
    await rentalAssetService.saveMeterReading(data.assetId, data);
    setMeterModal({ isOpen: false, data: null });
    refresh();
  };

  const handleExecuteReplace = async (data) => {
    setReplaceModal({ isOpen: false, data: null });
    refresh();
  };

  const headerActions = [
    { label: 'Add Installation', icon: Plus, onClick: () => setAssignModal({ isOpen: true, data: null }), primary: true },
    { label: 'Assign Technician', icon: UserPlus, onClick: () => setAssignModal({ isOpen: true, data: null }) },
    { label: 'Delivery Challan', icon: Truck, onClick: () => {} },
  ];

  return (
    <div className="admin-module-page rental-dashboard-page">
      <AdminPageHeader
        title="Asset Installation"
        description="Monitor and manage the deployment of rental fleet across client locations."
        breadcrumbs={['Admin', 'Rental Management', 'Asset Installation']}
        actions={headerActions}
      />

      <div className="card p-4 border-0 shadow-sm bg-card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            className="table-input pl-9 w-full h-10" 
            placeholder="Search by serial, customer, model or device type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="leads-table whitespace-nowrap">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Device Type</th>
                <th>Model</th>
                <th>Installation Date</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Technician</th>
                <th className="text-center">Meter Tracking</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="text-center py-12 text-muted font-bold">Synchronizing Fleet Status...</td></tr>
              ) : filteredAssets.map((asset) => {
                const lastReading = (asset.meterReadings || []).slice(-1)[0];
                return (
                  <tr key={asset.id}>
                    <td className="font-mono text-xs font-black text-primary uppercase">{asset.serialNumber}</td>
                    <td><span className="font-medium text-main">{asset.deviceType}</span></td>
                    <td className="text-sm font-bold">{asset.model}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase">
                        <Calendar size={12} /> {asset.installationDate || '—'}
                      </div>
                    </td>
                    <td className="font-bold text-main">{asset.customerName}</td>
                    <td>
                      <div className="flex items-center gap-1 text-xs font-medium text-muted">
                        <MapPin size={12} className="text-primary/40" /> {asset.customerLocation}
                      </div>
                    </td>
                    <td>
                      {asset.technician ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black uppercase">
                            {asset.technician.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-main">{asset.technician}</span>
                        </div>
                      ) : (
                        <span className="status-pill status-warning">Unassigned</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-primary">{lastReading ? lastReading.currentReading : '0'}</span>
                        <span className="text-[9px] font-black text-muted uppercase tracking-tighter">Pages</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${asset.status === 'Installed' ? 'status-success' : 'status-warning'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="relative inline-block">
                        <button 
                          className="icon-btn h-8 w-8 rounded-full hover:bg-surface-inset flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === asset.id ? null : asset.id);
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openMenuId === asset.id && (
                          <div className="basic-dropdown w-56 right-0" onClick={(e) => e.stopPropagation()}>
                            <button className="basic-dropdown-item" onClick={() => { navigate(`/admin/rental/assets/${asset.id}`); setOpenMenuId(null); }}>
                              <Eye size={14} className="text-muted" /> View Full Detail
                            </button>
                            <div className="border-t border-subtle my-1"></div>
                            <button className="basic-dropdown-item" onClick={() => { setAssignModal({ isOpen: true, data: asset }); setOpenMenuId(null); }}>
                              <UserPlus size={14} className="text-muted" /> Assign Technician
                            </button>
                            <button className="basic-dropdown-item" onClick={() => { setMeterModal({ isOpen: true, data: asset }); setOpenMenuId(null); }}>
                              <Gauge size={14} className="text-muted" /> Add Meter Reading
                            </button>
                            <button className="basic-dropdown-item" onClick={() => { setReplaceModal({ isOpen: true, data: asset }); setOpenMenuId(null); }}>
                              <RefreshCw size={14} className="text-muted" /> Replace Device
                            </button>
                            <button className="basic-dropdown-item" onClick={() => { setOpenMenuId(null); }}>
                              <ClipboardCheck size={14} className="text-muted" /> Maintenance Log
                            </button>
                            <button className="basic-dropdown-item" onClick={() => { setOpenMenuId(null); }}>
                              <FileText size={14} className="text-muted" /> Delivery Challan
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TechnicianAssignmentModal 
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, data: null })}
        onSave={handleAssignTech}
        installation={assignModal.data}
      />

      <MeterReadingModal
        isOpen={meterModal.isOpen}
        onClose={() => setMeterModal({ isOpen: false, data: null })}
        onSave={handleSaveMeter}
        asset={meterModal.data}
      />

      <ReplacementModal
        isOpen={replaceModal.isOpen}
        onClose={() => setReplaceModal({ isOpen: false, data: null })}
        onSave={handleExecuteReplace}
        asset={replaceModal.data}
      />
    </div>
  );
};

export default RentalAssetsInstallationsPage;
