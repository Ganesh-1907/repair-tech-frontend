const sleep = (duration = 180) => new Promise((resolve) => setTimeout(resolve, duration));

const today = () => new Date().toISOString().slice(0, 10);
const clone = (value) => JSON.parse(JSON.stringify(value));
const makeAgreementNo = () => `RIA-${Date.now().toString().slice(-6)}`;

let agreements = [
  {
    id: 'RIA-260401',
    agreementNo: 'RIA-260401',
    agreementDate: '2026-04-20',
    customerName: 'Ramesh Sharma',
    customerAddress: 'MIG-112, Indore',
    providerName: 'REPAIRBOY',
    monthlyRent: 2200,
    a4BwRate: 1.2,
    a4ColorRate: 8,
    paymentTerms: 7,
    startDate: '2026-04-20',
    endDate: '2026-10-20',
    noticePeriod: 15,
    maintenanceTerms: 'Basic maintenance included',
    replacementTerms: 'Device may be replaced if faulty',
    liabilityTerms: 'Customer responsible for physical damages',
    additionalTerms: '',
    devices: [
      {
        id: 1,
        deviceType: 'Printer',
        brandModel: 'HP LaserJet Pro',
        serialNumber: 'HP-881-A',
        notes: 'Home office setup',
      },
    ],
    status: 'Draft',
    createdDate: '2026-04-20',
  },
];

const historyRow = (agreement) => ({
  id: agreement.id,
  agreementNo: agreement.agreementNo,
  customerName: agreement.customerName,
  devicesCount: Array.isArray(agreement.devices) ? agreement.devices.length : 0,
  monthlyRent: Number(agreement.monthlyRent || 0),
  startDate: agreement.startDate,
  endDate: agreement.endDate,
  status: agreement.status || 'Draft',
});

export const rentalIndividualAgreementService = {
  async createAgreement(payload) {
    await sleep();
    const id = payload.id || makeAgreementNo();
    const row = {
      id,
      agreementNo: payload.agreementNo || id,
      createdDate: payload.createdDate || today(),
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
    const agreement = agreements.find((item) => item.id === agreementId) || null;
    return clone(agreement);
  },

  async generateAgreement(agreementId) {
    await sleep();
    return this.updateAgreement(agreementId, { status: 'Generated' });
  },

  async downloadPdf(agreementId) {
    await sleep();
    return { ok: true, agreementId, message: `PDF placeholder ready for ${agreementId}.` };
  },

  async sendAgreementEmail(agreementId) {
    await sleep();
    const agreement = await this.updateAgreement(agreementId, { status: 'Sent' });
    return { ok: true, agreement, message: `Email placeholder sent for ${agreementId}.` };
  },

  async sendAgreementWhatsApp(agreementId) {
    await sleep();
    const agreement = await this.updateAgreement(agreementId, { status: 'Sent' });
    return { ok: true, agreement, message: `WhatsApp placeholder sent for ${agreementId}.` };
  },
};
