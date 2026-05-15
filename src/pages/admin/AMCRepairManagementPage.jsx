import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { api } from '../../services/apiClient';
import { expenseManagementService } from '../../services/expenseManagementService';
import './PlansCustomers.css';
import './RepairModal.css';

const emptyPart = {
  partName: '',
  serialNumber: '',
  quantity: 1,
  cost: '',
  selling: '',
  coveredUnderAmc: true,
};

const repairModuleConfigs = {
  amc: {
    title: 'AMC Repair Management',
    backLabel: 'Back to AMC Inventory',
    backPath: '/admin/amc/inventory',
    contractCollection: 'amcContracts',
    repairCollection: 'amcRepairs',
    paymentDescription: 'AMC repair parts',
    paymentNote: 'Auto-created from AMC repair management for billable repair parts/services.',
  },
  cmc: {
    title: 'CMC Repair Management',
    backLabel: 'Back to CMC Inventory',
    backPath: '/admin/cmc/inventory',
    contractCollection: 'cmcContracts',
    repairCollection: 'cmcRepairs',
    paymentDescription: 'CMC repair parts',
    paymentNote: 'Auto-created from CMC repair management for billable repair parts/services.',
  },
  rental: {
    title: 'Rental Repair Management',
    backLabel: 'Back to Rental Customers',
    backPath: '/admin/rental/customers',
    contractCollection: ['rentalContracts', 'rentalCustomers'],
    repairCollection: 'rentalMaintenanceLogs',
    paymentDescription: 'Rental repair parts',
    paymentNote: 'Auto-created from rental repair management for billable repair parts/services.',
  },
  leads: {
    title: 'Lead Repair Management',
    backLabel: 'Back to Leads',
    backPath: '/admin/leads',
    contractCollection: 'leads',
    repairCollection: 'leadRepairs',
    paymentDescription: 'Lead repair parts',
    paymentNote: 'Auto-created from lead repair management for billable repair parts/services.',
  },
};

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const partCostTotal = (part) => Number(part.quantity || 0) * Number(part.cost ?? part.price ?? 0);
const partSellingBase = (part) => Number(part.quantity || 0) * Number(part.selling ?? part.price ?? 0);
const partSellingTotal = (part) => partSellingBase(part);
const partBillableTotal = (part) => (part.coveredUnderAmc ? 0 : partSellingTotal(part));

const getContractName = (contract) => contract?.customerName || contract?.companyName || contract?.name || contract?.company || '';

const AMCRepairManagementPage = ({ moduleType = 'amc' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const config = repairModuleConfigs[moduleType] || repairModuleConfigs.amc;
  const [contract, setContract] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [parts, setParts] = useState([]);
  const [partForm, setPartForm] = useState(emptyPart);
  const [addLabour, setAddLabour] = useState(false);
  const [labourCharge, setLabourCharge] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const contractCollections = Array.isArray(config.contractCollection)
          ? config.contractCollection
          : [config.contractCollection];
        const [contractLists, repairs] = await Promise.all([
          Promise.all(contractCollections.map((collection) => api.list(collection))),
          api.list(config.repairCollection),
        ]);
        const contracts = contractLists.flatMap((list) => (Array.isArray(list) ? list : []));
        const selected = contracts.find((row) => (
          row.id === id
          || row.contractId === id
          || row.customerId === id
          || row.leadId === id
          || row.ticketId === id
        ));
        setContract(selected || null);
        const existing = (Array.isArray(repairs) ? repairs : []).find((row) => row.contractId === id);
        if (existing) {
          setRecordId(existing.id || existing._id || null);
          setPaymentId(existing.paymentId || null);
          setParts(Array.isArray(existing.parts) ? existing.parts
            .filter((part) => String(part.partName || '').trim())
            .map((part) => ({
              ...part,
              cost: part.cost ?? part.price ?? 0,
              selling: part.selling ?? part.price ?? 0,
            })) : []);
          setAddLabour(Boolean(existing.addLabour));
          setLabourCharge(existing.labourCharge ? String(existing.labourCharge) : '');
        }
      } catch (error) {
        console.error(`Failed to load ${moduleType} repair page:`, error);
        setNotice('Failed to load repair details.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [config, id, moduleType]);

  const totals = useMemo(() => {
    const validParts = parts.filter((part) => String(part.partName || '').trim());
    const cost = validParts.reduce((sum, part) => sum + partCostTotal(part), 0);
    const billableParts = validParts.reduce((sum, part) => sum + partBillableTotal(part), 0);
    const labour = addLabour ? Number(labourCharge || 0) : 0;
    return {
      cost,
      billableParts,
      labour,
      billable: billableParts + labour,
      covered: validParts.reduce((sum, part) => sum + (part.coveredUnderAmc ? partSellingTotal(part) : 0), 0),
    };
  }, [parts, addLabour, labourCharge]);

  const updatePartForm = (field, value) => {
    setPartForm((current) => ({ ...current, [field]: value }));
  };
  const hasRepairRows = parts.length > 0 || (addLabour && Number(labourCharge || 0) > 0);

  const addPart = () => {
    if (!partForm.partName.trim()) {
      setNotice('Part name is required.');
      return;
    }
    const nextPart = {
      ...partForm,
      id: `PART-${Date.now()}`,
      partName: partForm.partName.trim(),
      quantity: Number(partForm.quantity || 1),
      cost: Number(partForm.cost || 0),
      selling: partForm.coveredUnderAmc ? 0 : Number(partForm.selling || 0),
    };
    setParts((current) => [...current, nextPart]);
    setPartForm(emptyPart);
    setNotice('');
  };

  const removePart = (partId) => {
    setParts((current) => current.filter((part) => part.id !== partId));
  };

  const saveRepair = async () => {
    setSaving(true);
    try {
      const validParts = parts.filter((part) => String(part.partName || '').trim());
      const payload = {
        contractId: id,
        customerName: getContractName(contract),
        parts: validParts,
        addLabour,
        labourCharge: addLabour ? Number(labourCharge || 0) : 0,
        costAmount: totals.cost,
        billableAmount: totals.billable,
        coveredAmount: totals.covered,
        paymentId,
        updatedAt: new Date().toISOString(),
      };
      const saved = recordId
        ? await api.update(config.repairCollection, recordId, payload)
        : await api.create(config.repairCollection, { ...payload, createdAt: new Date().toISOString() });

      let nextPaymentId = paymentId;
      if (totals.billable > 0) {
        const paymentPayload = {
          category: 'Repair Payment',
          expenseDate: new Date().toISOString().slice(0, 10),
          description: `${config.paymentDescription} - ${id}`,
          amount: totals.billable,
          paymentMode: 'Cash',
          customerName: getContractName(contract),
          vendorPayee: getContractName(contract),
          referenceNumber: id,
          notes: config.paymentNote,
          flowType: 'Income',
        };
        const payment = nextPaymentId
          ? await expenseManagementService.updatePayment(nextPaymentId, paymentPayload)
          : await expenseManagementService.createPayment(paymentPayload);
        nextPaymentId = payment.id || nextPaymentId;
      } else if (nextPaymentId) {
        await api.remove('adminPayments', nextPaymentId);
        nextPaymentId = null;
      }

      setRecordId(saved.id || saved._id || recordId);
      setPaymentId(nextPaymentId);
      if (nextPaymentId !== paymentId) {
        await api.update(config.repairCollection, saved.id || saved._id || recordId, { ...payload, paymentId: nextPaymentId });
      }
      setNotice(totals.billable > 0 ? 'Repair saved and payment listing updated.' : 'Repair saved. Covered parts bill is zero.');
    } catch (error) {
      console.error(`Failed to save ${moduleType} repair:`, error);
      setNotice(error.message || 'Failed to save repair details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="plans-page"><div className="table-card" style={{ padding: 32 }}>Loading repair page...</div></div>;
  }

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div className="plans-header-left">
          <button className="secondary-button" onClick={() => navigate(config.backPath)} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> {config.backLabel}
          </button>
          <h1>{config.title}</h1>
          <p>{id} {contract ? `- ${getContractName(contract)}` : ''}</p>
        </div>
        <div className="plans-header-actions">
        </div>
      </header>

      {notice && <div className="success-banner" role="status"><span>{notice}</span></div>}

      <div className="repair-pricing-modal" style={{ width: 'min(1360px, 100%)', margin: '24px auto 0', background: '#fff' }}>
        <div className="repair-pricing-header">
          <div>
            <div className="repair-pricing-kicker">
              <span className="repair-pricing-ticket">{id}</span>
              <span className="repair-pricing-label">Repair Management</span>
            </div>
            <h2>Parts &amp; Pricing</h2>
          </div>
        </div>

        <div className="repair-pricing-body">
          <div className="repair-pricing-add-section" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 1100, tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '26%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Part / Service Name</th>
                  <th>Serial Number</th>
                  <th>Qty</th>
                  <th>Cost</th>
                  <th>Billable</th>
                  <th>Selling Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 4px' }}><input className="repair-pricing-input" style={{ width: '100%' }} value={partForm.partName} onChange={(e) => updatePartForm('partName', e.target.value)} placeholder="e.g. RAM 8GB" /></td>
                  <td style={{ padding: '6px 4px' }}><input className="repair-pricing-input" style={{ width: '100%' }} value={partForm.serialNumber} onChange={(e) => updatePartForm('serialNumber', e.target.value)} placeholder="Serial no." /></td>
                  <td style={{ padding: '6px 4px' }}><input type="number" min="1" className="repair-pricing-input repair-pricing-input-center" style={{ width: '100%' }} value={partForm.quantity} onChange={(e) => updatePartForm('quantity', e.target.value)} /></td>
                  <td style={{ padding: '6px 4px' }}><input type="number" min="0" className="repair-pricing-input repair-pricing-input-center" style={{ width: '100%' }} value={partForm.cost} onChange={(e) => updatePartForm('cost', e.target.value)} placeholder="0" /></td>
                  <td style={{ padding: '6px 4px' }}>
                    <select className="repair-pricing-input" style={{ width: '100%' }} value={partForm.coveredUnderAmc ? 'No' : 'Yes'} onChange={(e) => updatePartForm('coveredUnderAmc', e.target.value !== 'Yes')}>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </td>
                  <td style={{ padding: '6px 4px' }}><input type="number" min="0" className="repair-pricing-input repair-pricing-input-center" style={{ width: '100%' }} value={partForm.coveredUnderAmc ? '0' : partForm.selling} onChange={(e) => updatePartForm('selling', e.target.value)} placeholder="0" disabled={partForm.coveredUnderAmc} /></td>
                  <td style={{ padding: '6px 4px' }}>
                    <button className="primary-button repair-pricing-add-button" onClick={addPart} style={{ width: '100%', justifyContent: 'center', padding: '0 8px' }}>
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="repair-pricing-labour-section">
            <label className="repair-pricing-check">
              <input type="checkbox" checked={addLabour} onChange={(e) => setAddLabour(e.target.checked)} />
              <span>Add Service Charge</span>
            </label>
            {addLabour && (
              <div className="repair-pricing-labour-collapse">
                <div className="repair-pricing-labour-input">
                  <span>Amount</span>
                  <input type="number" min="0" className="repair-pricing-input" value={labourCharge} onChange={(e) => setLabourCharge(e.target.value)} placeholder="0" />
                </div>
              </div>
            )}
          </div>

          {hasRepairRows && (
            <div className="repair-pricing-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 1100 }}>
                <thead><tr><th style={{ width: 42 }}>#</th><th>Part Name</th><th>Serial</th><th>Qty</th><th>Cost</th><th>Billable</th><th>Selling</th><th></th></tr></thead>
                <tbody>
                  {parts.map((part, index) => (
                    <tr key={part.id}>
                      <td>{index + 1}</td>
                      <td><strong>{part.partName}</strong></td>
                      <td>{part.serialNumber || '-'}</td>
                      <td>x{part.quantity}</td>
                      <td>{Number(part.cost ?? part.price ?? 0)}</td>
                      <td>{part.coveredUnderAmc ? 'No' : 'Yes'}</td>
                      <td><strong>{Number(part.selling ?? 0)}</strong></td>
                      <td><button className="repair-pricing-delete" onClick={() => removePart(part.id)} aria-label={`Remove ${part.partName || 'part'}`}><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                  {addLabour && Number(labourCharge || 0) > 0 && (
                    <tr>
                      <td>{parts.length + 1}</td>
                      <td><strong>Service Charge</strong></td>
                      <td>-</td>
                      <td>1</td>
                      <td>0</td>
                      <td>Yes</td>
                      <td><strong>{Number(labourCharge || 0)}</strong></td>
                      <td></td>
                    </tr>
                  )}
                  <tr style={{ background: '#f8fafc' }}>
                    <td></td>
                    <td><strong>Total</strong></td>
                    <td></td>
                    <td></td>
                    <td><strong>{money(totals.cost)}</strong></td>
                    <td></td>
                    <td><strong style={{ color: '#4f46e5' }}>{money(totals.billable)}</strong></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="repair-pricing-footer">
          <button className="secondary-button repair-pricing-cancel" onClick={() => navigate(config.backPath)}>Cancel</button>
          <button className="primary-button repair-pricing-save" onClick={saveRepair} disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Repair Details'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AMCRepairManagementPage;
