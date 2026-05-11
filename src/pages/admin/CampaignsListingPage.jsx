import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  Archive,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  X,
} from 'lucide-react';
import { campaignService } from '../../services/campaignServices';
import './CampaignModule.css';

const emptyForm = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
  address: '',
};

const normalizeCampaign = (campaign = {}) => ({
  ...campaign,
  name: campaign.name || '',
  description: campaign.description || campaign.notes || '',
  startDate: campaign.startDate || campaign.date || '',
  endDate: campaign.endDate || campaign.date || '',
  location: campaign.location || '',
  address: campaign.address || '',
  status: campaign.status || 'Planned',
});

const displayRange = (campaign) => {
  const start = campaign.startDate || campaign.date || '';
  const end = campaign.endDate || '';
  if (start && end && start !== end) return `${start} to ${end}`;
  return start || end || 'Not scheduled';
};

const CampaignsListingPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await campaignService.listCampaigns();
      setCampaigns(rows.map(normalizeCampaign));
    } catch {
      setError('Failed to load campaigns. Please check the backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const openAddModal = () => {
    setEditingCampaign(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (campaign) => {
    const normalized = normalizeCampaign(campaign);
    setEditingCampaign(normalized);
    setForm({
      name: normalized.name,
      description: normalized.description,
      startDate: normalized.startDate,
      endDate: normalized.endDate,
      location: normalized.location,
      address: normalized.address,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCampaign(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      await campaignService.saveCampaign({
        ...(editingCampaign || {}),
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        date: form.startDate,
        location: form.location.trim(),
        address: form.address.trim(),
        notes: form.description.trim(),
        status: editingCampaign?.status || 'Planned',
      });
      closeModal();
      loadCampaigns();
    } catch {
      alert('Failed to save campaign.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (campaign) => {
    try {
      await campaignService.saveCampaign({ ...campaign, status: 'Archived' });
      loadCampaigns();
    } catch {
      alert('Failed to archive campaign.');
    }
  };

  const filteredCampaigns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchSearch = !q
        || campaign.name.toLowerCase().includes(q)
        || campaign.description.toLowerCase().includes(q)
        || campaign.location.toLowerCase().includes(q)
        || campaign.address.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || campaign.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [campaigns, search, statusFilter]);

  return (
    <div className="campaign-page">
      <section className="breadcrumb-card">
        <div className="breadcrumb">
          <span>Admin</span><ChevronRight size={14} /><span>Campaign Module</span><ChevronRight size={14} /><strong>Campaigns</strong>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 m-0">Campaigns</h1>
            <p className="text-slate-500 text-sm m-0 mt-1">Create and manage campaigns used by Quick Entry.</p>
          </div>
          <div className="flex gap-3">
            <button className="icon-button" onClick={loadCampaigns} disabled={loading}>
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="primary-button" onClick={openAddModal}><Plus size={18} /> Add Campaign</button>
          </div>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 className="text-lg font-black text-slate-900 m-0">Campaign Listing</h3>
            <p className="text-slate-500 text-xs m-0 mt-1">{filteredCampaigns.length} campaigns found.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                className="h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm w-56"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <select
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {['All', 'Planned', 'Active', 'Completed', 'Archived'].map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 size={20} className="animate-spin" /> Loading campaigns...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList size={36} className="mb-2 opacity-30" />
            <p className="text-sm font-semibold">No campaigns found.</p>
            <button className="primary-button mt-4" onClick={openAddModal}><Plus size={16} /> Add Campaign</button>
          </div>
        ) : (
          <div className="campaign-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Description</th>
                  <th>Dates</th>
                  <th>Location</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <div className="font-bold text-slate-800">{campaign.name}</div>
                      <div className="font-mono text-[10px] text-indigo-600 font-black">{campaign.id}</div>
                    </td>
                    <td className="text-xs text-slate-600 max-w-[220px]">{campaign.description || '-'}</td>
                    <td className="text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {displayRange(campaign)}</span>
                    </td>
                    <td className="text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1"><MapPin size={14} /> {campaign.location || '-'}</span>
                    </td>
                    <td className="text-xs text-slate-600 max-w-[220px]">{campaign.address || '-'}</td>
                    <td><span className="status-badge status-quote">{campaign.status}</span></td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="icon-button inline-flex" title="Edit campaign" onClick={() => openEditModal(campaign)}>
                          <Pencil size={16} />
                        </button>
                        {campaign.status !== 'Archived' && (
                          <button className="icon-button inline-flex" title="Archive campaign" onClick={() => handleArchive(campaign)}>
                            <Archive size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AnimatePresence>
        {modalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <Motion.div
              className="modal-card campaign-form-modal"
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <h2 className="text-xl font-black text-slate-900 m-0">{editingCampaign ? 'Edit Campaign' : 'Add Campaign'}</h2>
                <button className="icon-button !border-none" onClick={closeModal}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-grid campaign-form-grid">
                  <div className="form-field">
                    <label>Campaign Name *</label>
                    <input placeholder="Campaign name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input placeholder="Location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Start Date *</label>
                    <input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>End Date *</label>
                    <input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
                  </div>
                  <div className="form-field full">
                    <label>Description</label>
                    <textarea placeholder="Campaign description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                  </div>
                  <div className="form-field full">
                    <label>Address</label>
                    <textarea placeholder="Full address" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="secondary-button" onClick={closeModal}>Cancel</button>
                <button className="primary-button" onClick={handleSave} disabled={saving || !form.name.trim() || !form.startDate || !form.endDate}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Campaign'}
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignsListingPage;
