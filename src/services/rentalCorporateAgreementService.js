const sleep = (duration = 180) => new Promise((resolve) => setTimeout(resolve, duration));

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const today = () => new Date().toISOString().slice(0, 10);

const addMonths = (dateValue, months) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  date.setMonth(date.getMonth() + months);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const baseClauseTemplate = [
  {
    id: 'scope',
    title: '1. Scope of Agreement',
    body: 'The Service Provider agrees to supply and maintain the following equipment: {{device_table}}',
  },
  {
    id: 'rentalCharges',
    title: '2. Rental Charges',
    body: 'Monthly Rental: {{monthly_rent}}, Billing Cycle: {{billing_cycle}}, Payment Due: {{payment_terms}} days.',
  },
  {
    id: 'usageCharges',
    title: '3. Usage Charges',
    body: 'A4 B/W: {{a4_bw_rate}} per page, A4 Color: {{a4_color_rate}} per page, A3 B/W: {{a3_bw_rate}} per page, A3 Color: {{a3_color_rate}} per page.',
  },
  {
    id: 'minimumCommitment',
    title: '4. Minimum Commitment',
    body: 'Client agrees to a minimum billing of {{minimum_commitment}} per month.',
  },
  {
    id: 'addons',
    title: '5. Add-ons & Discounts',
    body: 'Any additional services, discounts, or free-of-cost items shall be recorded and billed as per CRM records.',
  },
  {
    id: 'meterReading',
    title: '6. Meter Reading & Billing',
    body: 'Meter readings will be recorded monthly and billing will be based on actual usage.',
  },
  {
    id: 'replacement',
    title: '7. Equipment Replacement',
    body: 'Equipment may be replaced with equivalent model and billing continues as per agreement.',
  },
  {
    id: 'maintenance',
    title: '8. Maintenance & Support',
    body: 'Regular maintenance is included. Breakdown support will be provided within {{sla_time}} hours.',
  },
  {
    id: 'downtime',
    title: '9. Downtime Policy',
    body: 'If downtime exceeds {{downtime_limit}}, billing adjustments may apply.',
  },
  {
    id: 'duration',
    title: '10. Agreement Duration',
    body: 'Start Date: {{start_date}}, End Date: {{end_date}}.',
  },
  {
    id: 'termination',
    title: '11. Termination',
    body: 'Either party may terminate this agreement with {{notice_period}} days notice.',
  },
  {
    id: 'paymentTerms',
    title: '12. Payment Terms',
    body: 'Late payment charges: {{late_fee}}%. GST applicable as per law.',
  },
  {
    id: 'liability',
    title: '13. Liability',
    body: 'Service Provider is not responsible for indirect damages or data loss.',
  },
  {
    id: 'jurisdiction',
    title: '14. Jurisdiction',
    body: 'This agreement is governed by laws of {{jurisdiction_city}}.',
  },
];

const defaultTemplate = {
  id: 'TPL-CORP-DEFAULT',
  name: 'Corporate Rental Default',
  description: 'Default corporate rental agreement clause template.',
  version: 1,
  isDefault: true,
  clauses: baseClauseTemplate,
};

let templateLibrary = [
  defaultTemplate,
  {
    id: 'TPL-CORP-STRICT-SLA',
    name: 'Corporate Strict SLA',
    description: 'Template with tighter support and downtime wording.',
    version: 1,
    isDefault: false,
    clauses: baseClauseTemplate.map((clause) => (
      clause.id === 'maintenance'
        ? { ...clause, body: 'Regular maintenance is included. Breakdown support is guaranteed within 4 hours.' }
        : clause
    )),
  },
];

let customers = [
  {
    id: 'CUST-001',
    companyName: 'Global Tech Solutions Pvt Ltd',
    registeredAddress: '2nd Floor, Crystal IT Park, Indore',
    gstNumber: '23ABCDE1234F1Z5',
    contactPerson: 'Rahul Verma',
    email: 'rahul.verma@globaltech.in',
    phoneNumber: '9876543210',
    billingAddress: 'Accounts Dept, Crystal IT Park, Indore',
    branch: 'Indore HQ',
    location: 'Indore',
  },
  {
    id: 'CUST-002',
    companyName: 'Spark Solutions India',
    registeredAddress: '12, Innovation Avenue, Bhopal',
    gstNumber: '23PQRSX5678L1Z7',
    contactPerson: 'Nitika Sharma',
    email: 'nitika@sparksolutions.in',
    phoneNumber: '9988776655',
    billingAddress: 'Finance Block, Innovation Avenue, Bhopal',
    branch: 'Bhopal Branch',
    location: 'Bhopal',
  },
];

let devicePool = [
  {
    id: 'DEV-PRN-101',
    customerId: 'CUST-001',
    serialNumber: 'HPLJ-8821-A1',
    type: 'Printer',
    brand: 'HP',
    model: 'LaserJet Pro MFP',
    configuration: 'Network / Duplex',
    location: 'Indore HQ',
    monthlyRent: 7500,
    status: 'Active',
    addOns: 'Duplex Unit',
  },
  {
    id: 'DEV-LAP-203',
    customerId: 'CUST-001',
    serialNumber: 'DLL-5400-77Z',
    type: 'Laptop',
    brand: 'Dell',
    model: 'Latitude 5400',
    configuration: 'i5 / 8GB / 256GB SSD',
    location: 'Indore HQ',
    monthlyRent: 3500,
    status: 'Active',
    addOns: 'Docking Station',
  },
  {
    id: 'DEV-PRN-502',
    customerId: 'CUST-002',
    serialNumber: 'CNN-IR-551A',
    type: 'Printer',
    brand: 'Canon',
    model: 'imageRUNNER 2625',
    configuration: 'Mono / Network',
    location: 'Bhopal Branch',
    monthlyRent: 6200,
    status: 'Active',
    addOns: 'Extra Tray',
  },
];

const seedAgreement = {
  id: 'RCA-260401',
  agreementNumber: 'RCA-260401',
  agreementDate: '2026-04-20',
  customerId: 'CUST-001',
  companyName: 'Global Tech Solutions Pvt Ltd',
  companyAddress: '2nd Floor, Crystal IT Park, Indore',
  providerName: 'REPAIRBOY',
  providerAddress: 'Repairboy Service Center, Indore',
  yourCompanyName: 'REPAIRBOY',
  startDate: '2026-04-20',
  endDate: '2027-04-19',
  status: 'Draft',
  monthlyRent: 18500,
  billingCycle: 'Monthly',
  paymentTerms: 7,
  securityDeposit: 15000,
  installationCharges: 1500,
  otherCharges: 0,
  a4BwRate: 1.2,
  a4ColorRate: 8,
  a3BwRate: 3,
  a3ColorRate: 18,
  extraUsageCharges: 0,
  minimumCommitment: 15000,
  slaTime: 8,
  maintenanceFrequency: 'Monthly preventive maintenance',
  breakdownSupportTerms: 'Onsite support within SLA window',
  replacementPolicy: 'Equivalent model replacement',
  downtimeLimit: '24 working hours',
  downtimeAdjustmentRule: 'Prorated adjustment beyond downtime threshold',
  noticePeriod: 30,
  lateFee: 2,
  jurisdictionCity: 'Indore',
  clientSignatoryName: 'Rahul Verma',
  clientSignatoryDesignation: 'IT Head',
  providerSignatoryName: 'Akash Jain',
  providerSignatoryDesignation: 'Operations Manager',
  createdBy: 'Admin User',
  createdDate: '2026-04-20',
  templateId: defaultTemplate.id,
  clauses: deepClone(baseClauseTemplate),
  devices: [
    {
      id: 'RCA-DEV-1',
      deviceId: 'DEV-PRN-101',
      serialNumber: 'HPLJ-8821-A1',
      type: 'Printer',
      brand: 'HP',
      model: 'LaserJet Pro MFP',
      configuration: 'Network / Duplex',
      location: 'Indore HQ',
      monthlyRent: 7500,
      status: 'Active',
      addOns: 'Duplex Unit',
    },
    {
      id: 'RCA-DEV-2',
      deviceId: 'DEV-LAP-203',
      serialNumber: 'DLL-5400-77Z',
      type: 'Laptop',
      brand: 'Dell',
      model: 'Latitude 5400',
      configuration: 'i5 / 8GB / 256GB SSD',
      location: 'Indore HQ',
      monthlyRent: 3500,
      status: 'Active',
      addOns: 'Docking Station',
    },
  ],
  addOns: [
    {
      id: 'ADD-1',
      serviceName: 'Onsite Training',
      description: 'Quarterly user training',
      price: 2000,
      discountType: 'Flat',
      discountValue: 500,
      focItems: '1 training session',
      notes: 'Optional',
    },
  ],
};

let agreements = [seedAgreement];

const makeAgreementId = () => `RCA-${Date.now().toString().slice(-6)}`;

const buildHistoryRow = (agreement) => ({
  id: agreement.id,
  agreementNumber: agreement.agreementNumber || agreement.id,
  companyName: agreement.companyName,
  devicesCount: Array.isArray(agreement.devices) ? agreement.devices.length : 0,
  monthlyRent: Number(agreement.monthlyRent || 0),
  startDate: agreement.startDate,
  endDate: agreement.endDate,
  status: agreement.status || 'Draft',
  createdBy: agreement.createdBy || 'Admin User',
  createdDate: agreement.createdDate || today(),
});

const saveAgreementInternal = (payload, existingId = null) => {
  const nowDate = today();
  const id = existingId || payload.id || makeAgreementId();
  const agreementNumber = payload.agreementNumber || id;
  const nextAgreement = {
    ...payload,
    id,
    agreementNumber,
    createdDate: payload.createdDate || nowDate,
    updatedAt: nowDate,
  };

  if (existingId) {
    agreements = agreements.map((agreement) => (
      agreement.id === existingId ? nextAgreement : agreement
    ));
    return nextAgreement;
  }

  agreements = [nextAgreement, ...agreements];
  return nextAgreement;
};

const updateAgreementStatus = (agreementId, status) => {
  let updated = null;
  agreements = agreements.map((agreement) => {
    if (agreement.id !== agreementId) return agreement;
    updated = { ...agreement, status };
    return updated;
  });
  return updated;
};

export const defaultCorporateAgreementClauses = deepClone(baseClauseTemplate);

export const rentalCorporateAgreementService = {
  async getCustomers() {
    await sleep();
    return deepClone(customers);
  },

  async getDevices(customerId) {
    await sleep();
    const rows = customerId
      ? devicePool.filter((device) => device.customerId === customerId)
      : devicePool;
    return deepClone(rows);
  },

  async getDefaultTemplate() {
    await sleep();
    return deepClone(defaultTemplate);
  },

  async listTemplates() {
    await sleep();
    return deepClone(templateLibrary);
  },

  async getTemplateById(templateId) {
    await sleep();
    const template = templateLibrary.find((item) => item.id === templateId) || defaultTemplate;
    return deepClone(template);
  },

  async saveReusableTemplate(payload) {
    await sleep();
    const newTemplate = {
      id: `TPL-CORP-${Date.now().toString().slice(-6)}`,
      name: payload.name || 'Corporate Custom Template',
      description: payload.description || 'Reusable customer-specific rental template',
      version: 1,
      isDefault: false,
      clauses: deepClone(payload.clauses || baseClauseTemplate),
    };
    templateLibrary = [newTemplate, ...templateLibrary];
    return deepClone(newTemplate);
  },

  async isAgreementNumberAvailable(agreementNumber, excludeId = null) {
    await sleep();
    if (!agreementNumber) return false;
    return !agreements.some((agreement) => (
      agreement.agreementNumber === agreementNumber && agreement.id !== excludeId
    ));
  },

  async createAgreement(payload) {
    await sleep();
    const created = saveAgreementInternal({ createdBy: 'Admin User', status: 'Draft', ...payload });
    return deepClone(created);
  },

  async updateAgreement(agreementId, payload) {
    await sleep();
    const current = agreements.find((agreement) => agreement.id === agreementId);
    if (!current) return null;
    const updated = saveAgreementInternal({ ...current, ...payload }, agreementId);
    return deepClone(updated);
  },

  async generateAgreement(agreementId) {
    await sleep();
    const updated = updateAgreementStatus(agreementId, 'Generated');
    return deepClone(updated);
  },

  async downloadPdf(agreementId) {
    await sleep();
    return { ok: true, agreementId, message: `PDF download placeholder prepared for ${agreementId}.` };
  },

  async sendAgreementEmail(agreementId) {
    await sleep();
    const updated = updateAgreementStatus(agreementId, 'Sent');
    return { ok: true, agreement: deepClone(updated), message: `Email placeholder sent for ${agreementId}.` };
  },

  async sendAgreementWhatsApp(agreementId) {
    await sleep();
    const updated = updateAgreementStatus(agreementId, 'Sent');
    return { ok: true, agreement: deepClone(updated), message: `WhatsApp placeholder sent for ${agreementId}.` };
  },

  async getAgreementHistory() {
    await sleep();
    return deepClone(agreements.map(buildHistoryRow));
  },

  async getAgreementById(agreementId) {
    await sleep();
    const agreement = agreements.find((item) => item.id === agreementId) || null;
    return deepClone(agreement);
  },

  async renewAgreement(agreementId) {
    await sleep();
    const current = agreements.find((agreement) => agreement.id === agreementId);
    if (!current) return null;
    const renewed = saveAgreementInternal({
      ...current,
      id: undefined,
      agreementNumber: undefined,
      status: 'Renewed',
      startDate: current.endDate || today(),
      endDate: addMonths(current.endDate || today(), 12),
      createdDate: today(),
    });
    return deepClone(renewed);
  },

  async markAgreementSigned(agreementId) {
    await sleep();
    const updated = updateAgreementStatus(agreementId, 'Signed');
    return deepClone(updated);
  },

  async duplicateAgreement(agreementId) {
    await sleep();
    const current = agreements.find((agreement) => agreement.id === agreementId);
    if (!current) return null;
    const duplicated = saveAgreementInternal({
      ...current,
      id: undefined,
      agreementNumber: undefined,
      status: 'Draft',
      createdDate: today(),
    });
    return deepClone(duplicated);
  },

  async cancelAgreement(agreementId) {
    await sleep();
    const updated = updateAgreementStatus(agreementId, 'Cancelled');
    return deepClone(updated);
  },

  async listAgreements() {
    return this.getAgreementHistory();
  },

  async saveAgreement(payload) {
    return this.createAgreement(payload);
  },
};
