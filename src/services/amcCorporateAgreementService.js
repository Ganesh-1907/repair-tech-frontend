const sleep = (duration = 180) => new Promise((resolve) => setTimeout(resolve, duration));

const clone = (value) => JSON.parse(JSON.stringify(value));
const today = () => new Date().toISOString().slice(0, 10);
const makeAgreementNo = () => `AMC-${Date.now().toString().slice(-6)}`;

let agreements = [
  {
    id: 'AMC-260401',
    agreementNo: 'AMC-260401',
    agreementDate: '2026-04-20',
    status: 'Draft',
    companyName: 'REPAIRBOY',
    companyAddress: 'Repairboy Service Center, Indore',
    companyGstin: '23ABCDE1234F1Z5',
    providerContactPerson: 'Akash Jain',
    providerEmail: 'ops@repairboy.in',
    providerPhone: '9876543210',
    clientName: 'Global Tech Solutions Pvt Ltd',
    clientAddress: '2nd Floor, Crystal IT Park, Indore',
    clientGstin: '23PQRSX5678L1Z7',
    clientContactPerson: 'Rahul Verma',
    clientEmail: 'rahul.verma@globaltech.in',
    clientPhone: '9988776655',
    branchLocation: 'Indore HQ',
    startDate: '2026-04-20',
    endDate: '2027-04-19',
    amcType: 'Comprehensive',
    preventiveFrequency: 'Quarterly',
    remoteSupport: '24x7',
    networkSupport: 'Included',
    serverSupport: 'Included',
    criticalResponse: 2,
    normalResponse: 6,
    resolutionTime: 'Within 24 hours',
    penaltyTerms: 'Penalty applied for SLA breach as per corporate policy.',
    totalAmount: 120000,
    gstPercentage: 18,
    paymentPlan: 'Quarterly Billing',
    lateInterest: 2,
    sparePolicy: 'Spare parts covered under standard policy for comprehensive AMC.',
    level1Contact: 'Support Desk - 9111111111',
    level2Contact: 'Service Manager - 9222222222',
    level3Contact: 'Operations Head - 9333333333',
    dataSecurityTerms: 'NDA compliance mandatory. No data access without permission.',
    terminationNoticeDays: 30,
    terminationTerms: 'Immediate termination in case of breach.',
    renewalTerms: 'Auto-renewal with client consent.',
    renewalNoticeDays: 45,
    liabilityTerms: 'Limited liability up to contract value. No responsibility for indirect losses.',
    termsConditions: 'All on-site visits require prior ticket number and approval.',
    companyPolicies: 'Safety compliance and visitor policies must be followed at client premises.',
    additionalNotes: '',
    assets: [
      {
        id: 1,
        assetId: 'AST-1001',
        assetType: 'Server',
        brandModel: 'Dell PowerEdge R740',
        serialNumber: 'DLR-88991',
        configuration: 'Dual Xeon / 64GB RAM',
        locationBranch: 'Datacenter',
        coverageType: 'Full coverage',
        notes: 'Primary application server',
      },
    ],
  },
];

const historyRow = (agreement) => ({
  id: agreement.id,
  agreementNo: agreement.agreementNo,
  clientName: agreement.clientName,
  assetsCount: Array.isArray(agreement.assets) ? agreement.assets.length : 0,
  amcType: agreement.amcType,
  totalAmount: Number(agreement.totalAmount || 0),
  startDate: agreement.startDate,
  endDate: agreement.endDate,
  status: agreement.status || 'Draft',
});

const updateStatus = (agreementId, status) => {
  let updated = null;
  agreements = agreements.map((agreement) => {
    if (agreement.id !== agreementId) return agreement;
    updated = { ...agreement, status };
    return updated;
  });
  return updated;
};

export const amcCorporateAgreementService = {
  async createAgreement(payload) {
    await sleep();
    const id = payload.id || makeAgreementNo();
    const row = {
      id,
      agreementNo: payload.agreementNo || id,
      status: payload.status || 'Draft',
      ...payload,
    };
    agreements = [row, ...agreements];
    return clone(row);
  },

  async updateAgreement(agreementId, payload) {
    await sleep();
    let updated = null;
    agreements = agreements.map((agreement) => {
      if (agreement.id !== agreementId) return agreement;
      updated = { ...agreement, ...payload, id: agreementId };
      return updated;
    });
    return clone(updated);
  },

  async getAgreementHistory() {
    await sleep();
    return clone(agreements.map(historyRow));
  },

  async getAgreementById(agreementId) {
    await sleep();
    const row = agreements.find((agreement) => agreement.id === agreementId) || null;
    return clone(row);
  },

  async generateAgreement(agreementId) {
    await sleep();
    return clone(updateStatus(agreementId, 'Generated'));
  },

  async downloadPdf(agreementId) {
    await sleep();
    return { ok: true, agreementId, message: `PDF placeholder ready for ${agreementId}.` };
  },

  async sendAgreementEmail(agreementId) {
    await sleep();
    const agreement = updateStatus(agreementId, 'Sent');
    return { ok: true, agreement: clone(agreement), message: `Email placeholder sent for ${agreementId}.` };
  },

  async sendAgreementWhatsApp(agreementId) {
    await sleep();
    const agreement = updateStatus(agreementId, 'Sent');
    return { ok: true, agreement: clone(agreement), message: `WhatsApp placeholder sent for ${agreementId}.` };
  },

  async markAgreementSigned(agreementId) {
    await sleep();
    return clone(updateStatus(agreementId, 'Signed'));
  },

  async renewAgreement(agreementId) {
    await sleep();
    const current = agreements.find((agreement) => agreement.id === agreementId);
    if (!current) return null;
    const renewedNo = makeAgreementNo();
    const renewed = {
      ...current,
      id: renewedNo,
      agreementNo: renewedNo,
      agreementDate: today(),
      status: 'Renewed',
    };
    agreements = [renewed, ...agreements];
    return clone(renewed);
  },
};
