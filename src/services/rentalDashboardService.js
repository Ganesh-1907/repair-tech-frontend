import { rentalStore } from './rentalDataStore';

const formatMonth = (isoDate) => String(isoDate || '').slice(0, 7);

export const rentalDashboardService = {
  async getOverview() {
    await rentalStore.sleep();
    const { contracts, invoices, assets, alerts, quotations, maintenanceLogs } = rentalStore.getState();
    const activeContracts = contracts.filter((row) => row.status === 'Active').length;
    const monthlyRentalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const pendingInvoices = invoices.filter((invoice) => invoice.paymentStatus !== 'Paid').length;
    const outstandingAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.outstanding || 0), 0);
    const activeAssets = assets.filter((asset) => ['Active', 'Installed'].includes(asset.status)).length;
    const expiringContracts = contracts.filter((row) => row.endDate && row.endDate <= rentalStore.plusDays(45)).length;
    const lowUsageAlerts = alerts.filter((alert) => alert.alertType === 'Low Usage').length;
    const highUsageAlerts = alerts.filter((alert) => alert.alertType === 'High Usage').length;
    const maintenancePending = maintenanceLogs.filter((log) => log.status !== 'Resolved').length;

    const monthlyRevenue = Object.values(
      invoices.reduce((acc, invoice) => {
        const key = formatMonth(invoice.createdAt || invoice.billingMonth);
        acc[key] = acc[key] || { month: key, value: 0 };
        acc[key].value += Number(invoice.total || 0);
        return acc;
      }, {})
    );

    const usageByCustomer = Object.values(
      assets.reduce((acc, asset) => {
        const usage = (asset.meterReadings || []).reduce((sum, row) => sum + Number(row.usage || 0), 0);
        acc[asset.customerName] = acc[asset.customerName] || { customer: asset.customerName, usage: 0 };
        acc[asset.customerName].usage += usage;
        return acc;
      }, {})
    );

    const assetStatus = Object.values(
      assets.reduce((acc, asset) => {
        acc[asset.status] = acc[asset.status] || { name: asset.status, value: 0 };
        acc[asset.status].value += 1;
        return acc;
      }, {})
    );

    const invoicePaymentStatus = Object.values(
      invoices.reduce((acc, invoice) => {
        acc[invoice.paymentStatus] = acc[invoice.paymentStatus] || { name: invoice.paymentStatus, value: 0 };
        acc[invoice.paymentStatus].value += 1;
        return acc;
      }, {})
    );

    return {
      kpis: {
        activeContracts,
        monthlyRentalRevenue,
        pendingInvoices,
        outstandingAmount,
        activeAssets,
        expiringContracts,
        lowUsageAlerts,
        highUsageAlerts,
        maintenancePending,
      },
      charts: { monthlyRevenue, usageByCustomer, assetStatus, invoicePaymentStatus },
      widgets: {
        recentQuotations: quotations.slice(0, 5),
        upcomingRenewals: contracts.filter((row) => row.endDate && row.endDate <= rentalStore.plusDays(60)).slice(0, 6),
        pendingPayments: invoices.filter((invoice) => invoice.paymentStatus !== 'Paid').slice(0, 6),
        alerts: alerts.slice(0, 8),
      },
    };
  },
};

