import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Circle,
  Clock3,
  CreditCard,
  Edit2,
  Eye,
  FileText,
  Package,
  ReceiptText,
  Receipt,
  Save,
  Send,
  ShieldCheck,
  User,
  Wallet,
  Wrench,
} from 'lucide-react';
import { rentalCustomerService } from '../../services/rentalCustomerService';
import { apiClient } from '../../services/apiClient';
import './RentalProcessTracking.css';

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;
const formatTimelineTimestamp = (value) => {
  if (!value) return 'Not available';
  const normalized = String(value).length === 7 ? `${value}-01` : value;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.toLocaleDateString('en-IN')} ${parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};
const parseTimelineDate = (value) => {
  if (!value) return null;
  const normalized = String(value).length === 7 ? `${value}-01` : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const getLatestValue = (rows = [], fields = []) => {
  let latestValue = '';
  let latestTime = -Infinity;
  rows.forEach((row) => {
    fields.forEach((field) => {
      const value = row?.[field];
      const parsed = parseTimelineDate(value);
      if (parsed && parsed.getTime() > latestTime) {
        latestTime = parsed.getTime();
        latestValue = value;
      }
    });
  });
  return latestValue;
};

const PROCESS_BLUEPRINT = [
  { id: 'customer', title: 'Customer Added', description: 'Customer profile captured with primary and branch locations.', icon: User, owner: 'Customer Desk' },
  { id: 'quotation', title: 'Quotation (Meter Billing & Pricing)', description: 'Quotation prepared with meter-based billing and pricing type.', icon: FileText, owner: 'Sales Ops' },
  { id: 'agreement', title: 'Agreement', description: 'Commercial agreement generated and contract terms locked.', icon: ShieldCheck, owner: 'Legal Ops' },
  { id: 'advancePlan', title: 'Advance & Plan Setup', description: 'Advance/security and commitment plan rules finalized.', icon: Wallet, owner: 'Commercial Ops' },
  { id: 'installation', title: 'Installation (Multiple Location)', description: 'Assets assigned and installed across customer locations.', icon: Wrench, owner: 'Field Service' },
  { id: 'serviceOps', title: 'Maintenance / Replacement / Add-ons', description: 'Post-install service events and add-on lifecycle tracked.', icon: Package, owner: 'Service Desk' },
  { id: 'billing', title: 'Billing (Multiple Location)', description: 'Branch-wise billing cycle prepared with meter coverage.', icon: Receipt, owner: 'Finance Ops' },
  { id: 'invoice', title: 'Invoice', description: 'Invoice generated for rental, usage, and add-on charges.', icon: ReceiptText, owner: 'Finance Controller' },
  { id: 'payment', title: 'Payment', description: 'Collections recorded and outstanding amounts reconciled.', icon: CreditCard, owner: 'Accounts' },
];

const statusFromProcess = (index, activeIndex) => {
  if (index < activeIndex) return 'completed';
  if (index === activeIndex) return 'active';
  return 'pending';
};

const RentalCustomerDetailPage = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [isEditingInstallationMeta, setIsEditingInstallationMeta] = useState(false);
  const [installationMetaForm, setInstallationMetaForm] = useState(null);
  const [editingSerialAssetId, setEditingSerialAssetId] = useState(null);
  const [serialDraft, setSerialDraft] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const load = async () => {
      const [customerRow, rentalState] = await Promise.all([
        rentalCustomerService.getCustomer(customerId),
        apiClient.get('/rental/state'),
      ]);
      setCustomer(customerRow);
      setSnapshot(rentalState.data);
    };
    load();
  }, [customerId]);

  const customerAssets = useMemo(() => (snapshot?.assets || []).filter((row) => row.customerId === customerId), [snapshot, customerId]);
  const customerContracts = useMemo(() => (snapshot?.contracts || []).filter((row) => row.customerId === customerId), [snapshot, customerId]);
  const customerInvoices = useMemo(() => (snapshot?.invoices || []).filter((row) => row.customerId === customerId), [snapshot, customerId]);
  const installationAssets = customerAssets;
  const customerInvoiceIds = useMemo(() => new Set(customerInvoices.map((row) => row.id)), [customerInvoices]);
  const customerPayments = useMemo(() => {
    const rows = snapshot?.payments || [];
    return rows.filter((row) => customerInvoiceIds.has(row.invoiceId));
  }, [snapshot, customerInvoiceIds]);

  const customerQuotation = useMemo(() => {
    const quotations = snapshot?.quotations || snapshot?.rentalQuotations || [];
    const rows = quotations.filter((row) => row.customerId === customerId);
    if (!rows.length) return null;
    return rows.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0];
  }, [snapshot, customerId]);

  const quotationDevices = useMemo(() => {
    if (!customerQuotation || !Array.isArray(customerQuotation.products)) return [];
    return customerQuotation.products.map((row, idx) => ({
      id: `${customerQuotation.id}-${idx}`,
      device: row.device || row.type || '-',
      type: row.type || '-',
      brand: row.brand || '-',
      model: row.model || '-',
      specs: row.specs || '-',
      quantity: Number(row.quantity || 0),
      rentalPrice: Number(row.rentalPrice || 0),
      rentalUnit: row.rentalUnit || 'Per Month',
      billingFrequency: row.billingFrequency || 'Monthly',
      pricingType: row.pricingType || row?.pricing?.pricingType || 'Fixed Rental',
      billingBasis: row.billingBasis || row?.pricing?.billingBasis || 'Meter Based Billing',
      meterConfig: row.meterConfig || row?.pricing?.meterConfig || 'Single Rate',
      meterRate: Number(row.meterRate ?? row?.pricing?.meterRate ?? 0),
      freeUnits: Number(row.freeUnits ?? row?.pricing?.freeUnits ?? 0),
      serialNo: row.serialNo || 'Pending',
      installationRequirements: row.installationRequirements || '',
      accessories: row.accessories || '',
      remarks: row.remarks || '',
    }));
  }, [customerQuotation]);

  const installationMetaDefaults = useMemo(() => ({
    customerLocation: customerQuotation?.customerLocation || customer?.address || '',
    assignedTechnician: customerQuotation?.assignedTechnician || 'Unassigned',
    installationDate: customerQuotation?.installationDate || '',
  }), [customerQuotation, customer?.address]);

  const billingSummary = useMemo(() => {
    const subtotal = quotationDevices.reduce((sum, d) => sum + (d.quantity * d.rentalPrice), 0);
    const security = Number(customerQuotation?.securityDeposit || 0);
    const installation = Number(customerQuotation?.installationCharges || 0);
    const delivery = Number(customerQuotation?.deliveryCharges || 0);
    const gstRate = Number(customerQuotation?.gstRate ?? customerQuotation?.gstPercent ?? 18);
    const taxable = subtotal + installation + delivery;
    const gst = ((customerQuotation?.gstType || 'Exclusive') === 'Exclusive') ? taxable * (gstRate / 100) : 0;
    return {
      subtotal,
      security,
      installation,
      delivery,
      gstRate,
      gst,
      total: subtotal + security + installation + delivery + gst,
    };
  }, [quotationDevices, customerQuotation]);

  const scopeItems = useMemo(() => {
    if (Array.isArray(customerQuotation?.scope) && customerQuotation.scope.length > 0) return customerQuotation.scope;
    if (typeof customerQuotation?.scope === 'string' && customerQuotation.scope.trim()) return [customerQuotation.scope.trim()];
    return ['No scope details yet.'];
  }, [customerQuotation]);

  const customerLocationNames = useMemo(() => {
    const fromCustomer = (customer?.locations || []).map((row) => row.locationName || row.address).filter(Boolean);
    if (fromCustomer.length) return [...new Set(fromCustomer)];
    return [customer?.address || 'Primary Location'];
  }, [customer]);

  const installedLocationNames = useMemo(() => {
    const rows = customerAssets
      .filter((asset) => String(asset.status || '').toLowerCase() === 'installed')
      .map((asset) => asset.customerLocation || asset.locationName || asset.locationId)
      .filter(Boolean);
    return [...new Set(rows)];
  }, [customerAssets]);

  const billedLocationNames = useMemo(() => {
    const assetLocationById = new Map(
      customerAssets.map((asset) => [asset.id, asset.customerLocation || asset.locationName || asset.locationId || ''])
    );
    const rows = customerInvoices.flatMap((invoice) => {
      const invoiceLevelLocation = invoice.branch || invoice.customerLocation || invoice.location || '';
      const lineLevelLocations = (invoice.lines || [])
        .map((line) => assetLocationById.get(line.assetId) || '')
        .filter(Boolean);
      return [invoiceLevelLocation, ...lineLevelLocations].filter(Boolean);
    });
    return [...new Set(rows)];
  }, [customerInvoices, customerAssets]);

  const customerMaintenanceLogs = useMemo(() => {
    const globalRows = snapshot?.maintenanceLogs || [];
    const assetIdSet = new Set(customerAssets.map((asset) => asset.id));
    const fromGlobal = globalRows.filter((row) => (
      assetIdSet.has(row.assetId)
      || row.customerId === customerId
      || row.customerName === (customer?.companyName || customer?.customerName)
    ));
    const fromAssets = customerAssets.flatMap((asset) => (asset.maintenanceLogs || []).map((row) => ({ ...row, assetId: asset.id })));
    return [...fromGlobal, ...fromAssets];
  }, [snapshot, customerAssets, customerId, customer?.companyName, customer?.customerName]);

  const serviceSummary = useMemo(() => {
    const maintenanceCount = customerMaintenanceLogs.length;
    const replacementCount = customerAssets.reduce((sum, asset) => sum + (asset.replacements || []).length, 0);
    const addOnCount = customerAssets.reduce((sum, asset) => sum + (asset.addOns || []).length, 0);
    return {
      maintenanceCount,
      replacementCount,
      addOnCount,
      totalServiceOps: maintenanceCount + replacementCount + addOnCount,
    };
  }, [customerMaintenanceLogs, customerAssets]);

  const processState = useMemo(() => {
    const hasCustomer = Boolean(customer?.id);
    const hasQuotation = Boolean(customerQuotation?.id);
    const hasAgreement = customerContracts.length > 0;
    const hasPricingType = quotationDevices.some((row) => Boolean(String(row.pricingType || '').trim()));
    const hasMeterBasedPricing = quotationDevices.some((row) => String(row.billingBasis || '').toLowerCase().includes('meter'));
    const quotationReady = hasQuotation && (quotationDevices.length === 0 || hasPricingType || hasMeterBasedPricing);
    const hasAdvancePlan = hasAgreement && (
      String(customerQuotation?.paymentTerms || '').toLowerCase().includes('advance')
      || Number(customerQuotation?.securityDeposit || 0) > 0
      || quotationDevices.some((row) => Number(row.meterRate || 0) > 0 || Number(row.freeUnits || 0) > 0)
    );
    const hasAssets = customerAssets.length > 0;
    const installedAssets = customerAssets.filter((a) => (a.status || '').toLowerCase() === 'installed').length;
    const installationDone = hasAssets && installedAssets === customerAssets.length;
    const serviceOpsReady = serviceSummary.totalServiceOps > 0;
    const isMultiLocationCustomer = customerLocationNames.length > 1;
    const billingReady = customerInvoices.length > 0 && (!isMultiLocationCustomer || billedLocationNames.length > 0);
    const invoiceReady = customerInvoices.length > 0;
    const paymentDone = customerPayments.length > 0 || customerInvoices.some((row) => {
      const status = String(row.paymentStatus || '').toLowerCase().trim();
      return Number(row.paidAmount || 0) > 0 || status === 'paid' || status === 'partially paid';
    });

    const stepTimestamps = {
      customer: customer?.updatedAt || customer?.createdAt || '',
      quotation: customerQuotation?.updatedAt || customerQuotation?.createdAt || '',
      agreement: getLatestValue(customerContracts, ['updatedAt', 'createdAt', 'startDate']) || '',
      advancePlan: customerQuotation?.updatedAt || customerQuotation?.createdAt || '',
      installation: getLatestValue(customerAssets, ['installationDate', 'updatedAt', 'createdAt']) || '',
      serviceOps: getLatestValue(customerMaintenanceLogs, ['updatedAt', 'createdAt', 'date', 'visitDate']) || '',
      billing: getLatestValue(customerInvoices, ['billingMonth', 'updatedAt', 'createdAt']) || '',
      invoice: getLatestValue(customerInvoices, ['updatedAt', 'createdAt', 'billingMonth']) || '',
      payment: getLatestValue(customerPayments, ['paidOn', 'updatedAt', 'createdAt']) || '',
    };

    const flags = {
      customer: hasCustomer,
      quotation: quotationReady,
      agreement: hasAgreement,
      advancePlan: hasAdvancePlan,
      installation: installationDone,
      serviceOps: serviceOpsReady,
      billing: billingReady,
      invoice: invoiceReady,
      payment: paymentDone,
    };

    const firstPending = PROCESS_BLUEPRINT.findIndex((step) => !flags[step.id]);
    const activeIndex = firstPending === -1 ? PROCESS_BLUEPRINT.length - 1 : Math.max(firstPending, 0);

    return {
      activeIndex,
      workflowStatus: firstPending === -1 ? 'Completed' : PROCESS_BLUEPRINT[activeIndex].title,
      steps: PROCESS_BLUEPRINT.map((step, index) => ({
        ...step,
        status: statusFromProcess(index, activeIndex),
        timestamp: formatTimelineTimestamp(stepTimestamps[step.id]),
      })),
      locationSummary: {
        customer: customerLocationNames.length,
        installed: installedLocationNames.length,
        billed: billedLocationNames.length,
      },
    };
  }, [
    customer,
    customerQuotation,
    customerContracts,
    customerAssets,
    customerInvoices,
    customerPayments,
    customerMaintenanceLogs,
    customerLocationNames.length,
    installedLocationNames.length,
    billedLocationNames.length,
    quotationDevices,
    serviceSummary.totalServiceOps,
  ]);

  const activeStepId = processState.steps[processState.activeIndex]?.id;
  const showInstallationBoard = activeStepId === 'installation' || activeStepId === 'serviceOps';

  const activityFeed = useMemo(() => {
    const rows = [];
    if (customerQuotation) rows.push({ label: `Quotation ${customerQuotation.status || 'Draft'} (${customerQuotation.id})`, time: customerQuotation.updatedAt || customerQuotation.createdAt || '-' });
    customerContracts.slice(0, 2).forEach((c) => rows.push({ label: `Agreement ${c.id} (${c.status || 'Draft'})`, time: c.updatedAt || c.createdAt || '-' }));
    customerAssets.slice(0, 2).forEach((a) => rows.push({ label: `Asset ${a.id} - ${a.status || 'Pending'}`, time: a.updatedAt || a.createdAt || '-' }));
    customerMaintenanceLogs.slice(0, 2).forEach((m) => rows.push({ label: `Maintenance ${m.assetId || '-'} (${m.status || 'Tracked'})`, time: m.date || m.visitDate || m.updatedAt || m.createdAt || '-' }));
    customerInvoices.slice(0, 2).forEach((i) => rows.push({ label: `Invoice ${i.id} - ${i.paymentStatus || 'Pending'}`, time: i.updatedAt || i.createdAt || '-' }));
    customerPayments.slice(0, 2).forEach((p) => rows.push({ label: `Payment ${p.id || '-'} for ${p.invoiceId || '-'}`, time: p.paidOn || p.updatedAt || p.createdAt || '-' }));
    return rows.slice(0, 8);
  }, [customerQuotation, customerContracts, customerAssets, customerMaintenanceLogs, customerInvoices, customerPayments]);

  if (!customer) return <div className="process-page"><div className="loading-card">Loading process tracking...</div></div>;

  const openQuotationProcess = () => {
    const params = new URLSearchParams({
      customerId: customer.id || '',
      customerName: customer.companyName || customer.customerName || '',
      contactPerson: customer.authorizedPerson1 || customer.customerName || '',
      customerAddress: customer.address || '',
      gstin: customer.gstNumber || '',
    });
    if (customerQuotation?.id) params.set('quotationId', customerQuotation.id);
    window.location.assign(`/admin/rental/quotations?${params.toString()}`);
  };

  const openBillingGenerate = () => {
    window.location.assign('/admin/rental/billing-generate');
  };

  const openInvoices = () => {
    window.location.assign('/admin/rental/billing-invoices');
  };

  const openPayments = () => {
    window.location.assign('/admin/expenses/payments');
  };

  const openInstallations = () => {
    window.location.assign('/admin/rental/assets-installations');
  };

  const openPlans = () => {
    window.location.assign('/admin/rental/plans');
  };

  const openAgreements = () => {
    if (customer?.customerType === 'Individual') {
      window.location.assign('/admin/rental/agreements/individual');
      return;
    }
    window.location.assign('/admin/rental/agreements/corporate');
  };

  const openMaintenance = () => {
    window.location.assign('/admin/rental/maintenance-alerts');
  };

  const openStage = (stageId) => {
    switch (stageId) {
      case 'customer':
        window.location.assign('/admin/rental/customers');
        break;
      case 'quotation':
        openQuotationProcess();
        break;
      case 'agreement':
        openAgreements();
        break;
      case 'advancePlan':
        openPlans();
        break;
      case 'installation':
        openInstallations();
        break;
      case 'serviceOps':
        openMaintenance();
        break;
      case 'billing':
        openBillingGenerate();
        break;
      case 'invoice':
        openInvoices();
        break;
      case 'payment':
        openPayments();
        break;
      default:
        break;
    }
  };

  const updateInstallationChecklist = async (assetId, key, checked) => {
    const target = installationAssets.find((a) => a.id === assetId);
    if (!target) return;
    const nextChecklist = {
      deviceVerified: false,
      serialConfirmed: false,
      installedAtLocation: false,
      connectivityChecked: false,
      customerConfirmed: false,
      ...(target.installationChecklist || {}),
      [key]: checked,
    };
    const complete = Object.values(nextChecklist).every(Boolean);
    const nextStatus = complete ? 'Installed' : 'Pending';
    try {
      const { data } = await apiClient.patch(`/records/rentalAssets/${assetId}`, {
        installationChecklist: nextChecklist,
        installationStatus: nextStatus,
        status: nextStatus === 'Installed' ? 'Installed' : (target.status || 'Installation Pending'),
      });
      setSnapshot((prev) => {
        if (!prev || !Array.isArray(prev.assets)) return prev;
        return {
          ...prev,
          assets: prev.assets.map((asset) => (asset.id === assetId ? { ...asset, ...data } : asset)),
        };
      });
    } catch {
      // no-op for now; keep UI stable
    }
  };

  const saveInstallationMeta = async () => {
    const source = installationMetaForm || installationMetaDefaults;
    const patch = {
      customerLocation: source.customerLocation || '',
      assignedTechnician: source.assignedTechnician || 'Unassigned',
      installationDate: source.installationDate || '',
    };
    try {
      if (customerQuotation?.id) {
        await apiClient.patch(`/records/rentalQuotations/${customerQuotation.id}`, patch);
      }
      if (installationAssets.length > 0) {
        await Promise.all(
          installationAssets
            .filter((asset) => asset.id)
            .map((asset) => apiClient.patch(`/records/rentalAssets/${asset.id}`, {
              customerLocation: patch.customerLocation,
              installationDate: patch.installationDate,
              technician: patch.assignedTechnician,
            }))
        );
      }

      setSnapshot((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (Array.isArray(next.rentalQuotations)) {
          next.rentalQuotations = next.rentalQuotations.map((row) => (row.id === customerQuotation?.id ? { ...row, ...patch } : row));
        }
        if (Array.isArray(next.quotations)) {
          next.quotations = next.quotations.map((row) => (row.id === customerQuotation?.id ? { ...row, ...patch } : row));
        }
        if (Array.isArray(next.assets)) {
          next.assets = next.assets.map((asset) => (
            asset.customerId === customerId
              ? { ...asset, customerLocation: patch.customerLocation, installationDate: patch.installationDate, technician: patch.assignedTechnician }
              : asset
          ));
        }
        return next;
      });
      setIsEditingInstallationMeta(false);
      setInstallationMetaForm(null);
      setNotice('Installation details updated successfully.');
    } catch {
      setNotice('Unable to update installation details right now.');
    }
  };

  const startSerialEdit = (asset) => {
    setEditingSerialAssetId(asset.id);
    setSerialDraft(asset.serialNumber || asset.serialNo || '');
  };

  const saveSerialNumber = async (assetId) => {
    try {
      await apiClient.patch(`/records/rentalAssets/${assetId}`, { serialNumber: serialDraft, serialNo: serialDraft });
      setSnapshot((prev) => {
        if (!prev || !Array.isArray(prev.assets)) return prev;
        return {
          ...prev,
          assets: prev.assets.map((asset) => (
            asset.id === assetId ? { ...asset, serialNumber: serialDraft, serialNo: serialDraft } : asset
          )),
        };
      });
      setEditingSerialAssetId(null);
      setSerialDraft('');
      setNotice('Asset serial number updated.');
    } catch {
      setNotice('Unable to update asset serial number right now.');
    }
  };

  return (
    <div className="process-page">
      <header className="process-sticky-head">
        <div className="head-left">
          <button className="btn-ghost" onClick={() => { window.location.assign('/admin/rental/customers'); }}><ArrowLeft size={16} /> Back</button>
          <div>
            <h1>Process Tracking</h1>
            <p>Process ID: {customerQuotation?.id || 'Not generated'} | Customer: {customer.companyName || customer.customerName}</p>
          </div>
          <span className="status-badge-head">{processState.workflowStatus}</span>
        </div>
        <div className="head-right">
          <button className="btn-secondary" onClick={openQuotationProcess}><Save size={14} /> Save Draft</button>
          <button className="btn-secondary" onClick={openQuotationProcess}><Send size={14} /> Send</button>
          <button className="btn-primary" onClick={openQuotationProcess}><Eye size={14} /> Generate Preview</button>
        </div>
      </header>
      {notice ? <div className="section-card" style={{ marginTop: 12, padding: '10px 14px' }}>{notice}</div> : null}

      <section className="timeline-wrap">
        <div className="timeline-horizontal">
          {processState.steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="timeline-node-wrap" key={step.id}>
                <div className={`node ${step.status}`}>{step.status === 'completed' ? <Check size={13} /> : step.status === 'active' ? <Clock3 size={13} /> : <Circle size={13} />}</div>
                <p className={`node-label ${step.status}`}>{step.title}</p>
                {index < processState.steps.length - 1 ? <span className={`node-line ${processState.steps[index + 1].status === 'completed' ? 'completed' : step.status === 'active' ? 'active' : 'pending'}`} /> : null}
                <article className={`process-step-card ${step.status}`}>
                  <div className="card-head"><Icon size={15} /><strong>{step.title}</strong></div>
                  <p>{step.description}</p>
                  <div className="card-meta"><span>{step.status.toUpperCase()}</span><span>{step.owner}</span></div>
                  <div className="card-meta"><small>{step.timestamp}</small><small>{step.status === 'active' ? 'Action Required' : 'Tracked'}</small></div>
                  <div style={{ marginTop: 8 }}>
                    <button type="button" className="btn-ghost stage-action-btn" onClick={() => openStage(step.id)}>Open Module</button>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        <div className="timeline-vertical">
          {processState.steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="v-row" key={`v-${step.id}`}>
                <div className="v-rail">
                  <div className={`node ${step.status}`}>{step.status === 'completed' ? <Check size={13} /> : step.status === 'active' ? <Clock3 size={13} /> : <Circle size={13} />}</div>
                  {index < processState.steps.length - 1 ? <span className={`v-line ${processState.steps[index + 1].status === 'completed' ? 'completed' : step.status === 'active' ? 'active' : 'pending'}`} /> : null}
                </div>
                <article className={`process-step-card ${step.status}`}>
                  <div className="card-head"><Icon size={15} /><strong>{step.title}</strong></div>
                  <p>{step.description}</p>
                  <div className="card-meta"><span>{step.status.toUpperCase()}</span><span>{step.owner}</span></div>
                  <div className="card-meta"><small>{step.timestamp}</small><small>{step.status === 'active' ? 'Action Required' : 'Tracked'}</small></div>
                  <div style={{ marginTop: 8 }}>
                    <button type="button" className="btn-ghost stage-action-btn" onClick={() => openStage(step.id)}>Open Module</button>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </section>

      {!showInstallationBoard ? <section className="grid-two">
        <article className="section-card">
          <h3><User size={16} /> Customer Information</h3>
          <div className="read-grid">
            <div><label>Customer Name</label><p>{customer.companyName || customer.customerName}</p></div>
            <div><label>Contact Person</label><p>{customer.authorizedPerson1 || '-'}</p></div>
            <div><label>Address</label><p>{customer.address || '-'}</p></div>
            <div><label>GST Number</label><p>{customer.gstNumber || '-'}</p></div>
            <div><label>Email</label><p>{customer.email || '-'}</p></div>
            <div><label>Phone</label><p>{customer.contactNumber || '-'}</p></div>
            <div><label>Total Locations</label><p>{customerLocationNames.length}</p></div>
            <div><label>Installed Locations</label><p>{installedLocationNames.length}</p></div>
          </div>
        </article>

        <article className="section-card">
          <h3><Package size={16} /> Product / Service Details</h3>
          {quotationDevices.length === 0 ? <p className="empty">No quotation devices added yet.</p> : (
            <div className="device-list">
              {quotationDevices.map((device) => (
                <div className="device-item" key={device.id}>
                  <div><strong>{device.device}</strong><span>{device.brand} / {device.model}</span></div>
                  <div>
                    <span>Qty: {device.quantity}</span>
                    <span>{formatCurrency(device.rentalPrice)} / {device.rentalUnit === 'Per Day' ? 'Day' : 'Month'}</span>
                    <span>{device.pricingType} | {device.billingBasis}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="section-card">
          <h3><ShieldCheck size={16} /> Scope of Work</h3>
          <ul className="bullet-list">
            {scopeItems.map((row, idx) => <li key={`${row}-${idx}`}>{row}</li>)}
          </ul>
        </article>

        <article className="section-card">
          <h3><Receipt size={16} /> Billing Summary</h3>
          <div className="summary-list">
            <div><span>Rental Subtotal</span><strong>{formatCurrency(billingSummary.subtotal)}</strong></div>
            <div><span>Security Deposit</span><strong>{formatCurrency(billingSummary.security)}</strong></div>
            <div><span>Installation Charges</span><strong>{formatCurrency(billingSummary.installation)}</strong></div>
            <div><span>Delivery Charges</span><strong>{formatCurrency(billingSummary.delivery)}</strong></div>
            <div><span>GST ({billingSummary.gstRate}%)</span><strong>{formatCurrency(billingSummary.gst)}</strong></div>
            <div><span>Billed Locations</span><strong>{billedLocationNames.length}</strong></div>
            <div><span>Invoices</span><strong>{customerInvoices.length}</strong></div>
            <div><span>Payments</span><strong>{customerPayments.length}</strong></div>
            <div className="total"><span>Grand Total</span><strong>{formatCurrency(billingSummary.total)}</strong></div>
          </div>
        </article>

        <article className="section-card">
          <h3><Wrench size={16} /> Service Operations</h3>
          <div className="summary-list">
            <div><span>Maintenance Visits</span><strong>{serviceSummary.maintenanceCount}</strong></div>
            <div><span>Replacements</span><strong>{serviceSummary.replacementCount}</strong></div>
            <div><span>Add-ons</span><strong>{serviceSummary.addOnCount}</strong></div>
            <div className="total"><span>Total Service Events</span><strong>{serviceSummary.totalServiceOps}</strong></div>
          </div>
        </article>
      </section> : null}

      {showInstallationBoard ? (
        <section className="installation-board">
          <article className="section-card">
            <h3><User size={16} /> Installation Basics</h3>
            {!isEditingInstallationMeta ? (
              <>
                <div className="read-grid">
                  <div><label>Customer Name</label><p>{customer.companyName || customer.customerName}</p></div>
                  <div><label>Customer Location</label><p>{customerQuotation?.customerLocation || customer.address || '-'}</p></div>
                  <div><label>Assigned Technician</label><p>{customerQuotation?.assignedTechnician || 'Unassigned'}</p></div>
                  <div><label>Installation Date</label><p>{customerQuotation?.installationDate || '-'}</p></div>
                  <div><label>Registered Locations</label><p>{customerLocationNames.length}</p></div>
                  <div><label>Installed Locations</label><p>{installedLocationNames.length}</p></div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setInstallationMetaForm(installationMetaDefaults);
                      setIsEditingInstallationMeta(true);
                    }}
                  >
                    <Edit2 size={14} /> Edit Installation Details
                  </button>
                </div>
              </>
            ) : (
              <div className="read-grid">
                <div>
                  <label>Customer Name</label>
                  <p>{customer.companyName || customer.customerName}</p>
                </div>
                <div>
                  <label>Customer Location</label>
                  <input value={installationMetaForm?.customerLocation || ''} onChange={(e) => setInstallationMetaForm((prev) => ({ ...(prev || installationMetaDefaults), customerLocation: e.target.value }))} />
                </div>
                <div>
                  <label>Assigned Technician</label>
                  <input value={installationMetaForm?.assignedTechnician || ''} onChange={(e) => setInstallationMetaForm((prev) => ({ ...(prev || installationMetaDefaults), assignedTechnician: e.target.value }))} />
                </div>
                <div>
                  <label>Installation Date</label>
                  <input type="date" value={installationMetaForm?.installationDate || ''} onChange={(e) => setInstallationMetaForm((prev) => ({ ...(prev || installationMetaDefaults), installationDate: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
                  <button type="button" className="btn-secondary" onClick={() => { setIsEditingInstallationMeta(false); setInstallationMetaForm(null); }}>Cancel</button>
                  <button type="button" className="btn-primary" onClick={saveInstallationMeta}>Save</button>
                </div>
              </div>
            )}
          </article>

          <article className="section-card">
            <h3><Package size={16} /> Devices to Install</h3>
            <div className="install-devices">
              {(installationAssets.length ? installationAssets : quotationDevices).map((device, index) => {
                const checklist = device.installationChecklist || {
                  deviceVerified: false,
                  serialConfirmed: false,
                  installedAtLocation: false,
                  connectivityChecked: false,
                  customerConfirmed: false,
                };
                const subtotal = Number(device.monthlyRent ?? device.rentalPrice ?? 0) * Number(device.quantity || 1);
                return (
                  <article className="install-card" key={device.id || `${device.model}-${index}`}>
                    <div className="install-top">
                      <strong>{device.deviceType || device.device || 'Device'}</strong>
                      <span className={`install-status ${device.installationStatus === 'Installed' || device.status === 'Installed' ? 'done' : 'pending'}`}>
                        {device.installationStatus || device.status || 'Pending'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button type="button" className="btn-secondary" onClick={openInstallations}>
                        <Edit2 size={14} /> Edit Installation
                      </button>
                    </div>
                    <p className="install-sub">{device.brand || '-'} / {device.model || '-'}</p>
                    <div className="install-grid">
                      <div><label>Specs</label><p>{device.specs || '-'}</p></div>
                      <div><label>Quantity</label><p>{device.quantity || 1}</p></div>
                      <div><label>Monthly Rental Price</label><p>{formatCurrency(device.monthlyRent ?? device.rentalPrice)}</p></div>
                      <div><label>Billing Frequency</label><p>{device.billingFrequency || 'Monthly'}</p></div>
                      <div><label>Subtotal</label><p>{formatCurrency(subtotal)}</p></div>
                      <div>
                        <label>Asset Serial Number</label>
                        {device.id && editingSerialAssetId === device.id ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input value={serialDraft} onChange={(e) => setSerialDraft(e.target.value)} placeholder="Enter serial number" />
                            <button type="button" className="btn-primary" onClick={() => saveSerialNumber(device.id)}>Save</button>
                            <button type="button" className="btn-secondary" onClick={() => { setEditingSerialAssetId(null); setSerialDraft(''); }}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <p>{device.serialNumber || device.serialNo || 'Pending'}</p>
                            {device.id ? (
                              <button type="button" className="btn-secondary" onClick={() => startSerialEdit(device)}>
                                <Edit2 size={14} /> Edit
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                      <div><label>Accessories</label><p>{device.accessories || '-'}</p></div>
                      <div><label>Notes</label><p>{device.installationRequirements || device.remarks || '-'}</p></div>
                      <div><label>Assigned Technician</label><p>{device.technician || customerQuotation?.assignedTechnician || 'Unassigned'}</p></div>
                    </div>
                    <div className="checklist">
                      {[
                        ['deviceVerified', 'Device verified'],
                        ['serialConfirmed', 'Serial number confirmed'],
                        ['installedAtLocation', 'Installed at customer location'],
                        ['connectivityChecked', 'Connectivity checked'],
                        ['customerConfirmed', 'Customer confirmation received'],
                      ].map(([key, label]) => (
                        <label key={`${device.id}-${key}`} className="check-item">
                          <input
                            type="checkbox"
                            checked={Boolean(checklist[key])}
                            onChange={(e) => device.id ? updateInstallationChecklist(device.id, key, e.target.checked) : null}
                            disabled={!device.id}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </article>
        </section>
      ) : null}

      <section className="section-card">
        <h3>Lifecycle Actions</h3>
        <div className="head-right" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => openStage('customer')}><User size={14} /> Customer</button>
          <button className="btn-secondary" onClick={() => openStage('quotation')}><Edit2 size={14} /> Quotation</button>
          <button className="btn-secondary" onClick={() => openStage('agreement')}><ShieldCheck size={14} /> Agreement</button>
          <button className="btn-secondary" onClick={() => openStage('advancePlan')}><Wallet size={14} /> Advance Plan</button>
          <button className="btn-secondary" onClick={() => openStage('installation')}><Wrench size={14} /> Installation</button>
          <button className="btn-secondary" onClick={() => openStage('serviceOps')}><Package size={14} /> Maintenance</button>
          <button className="btn-secondary" onClick={() => openStage('billing')}><Receipt size={14} /> Billing</button>
          <button className="btn-secondary" onClick={() => openStage('invoice')}><ReceiptText size={14} /> Invoice</button>
          <button className="btn-secondary" onClick={() => openStage('payment')}><CreditCard size={14} /> Payment</button>
        </div>
      </section>

      <section className="section-card activity">
        <h3>Activity Feed</h3>
        <div className="activity-list">
          {activityFeed.length === 0 ? <p className="empty">No recent activity found.</p> : activityFeed.map((row, index) => (
            <div className="activity-row" key={`${row.label}-${index}`}>
              <span className="dot" />
              <div><p>{row.label}</p><small>{row.time}</small></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RentalCustomerDetailPage;
