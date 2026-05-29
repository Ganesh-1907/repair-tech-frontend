import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

const DEFAULTS = {
  expenseCategories: ['Salaries', 'Purchases', 'Rent', 'Utilities', 'Travel', 'Others'],
  paymentModes: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'],
  vendorPayeeOptions: [
    'Technician Salary', 'Support Staff Salary', 'Admin Salary', 'Delivery Staff Salary',
    'Device Purchase Vendor', 'Spare Parts Vendor', 'Consumables Vendor', 'Necessary Office Purchase Vendor',
    'Shop Rent Owner', 'Office Rent Owner', 'Warehouse Rent Owner',
    'Electricity Board', 'Internet Provider', 'Water Utility Provider', 'Cloud Service Provider',
    'Field Team Reimbursement', 'Fuel Station Vendor', 'Travel Agency', 'Local Transport Vendor',
    'Miscellaneous Vendor', 'Service Partner', 'Other Payee',
  ],
};

export const EXPENSE_SETTINGS_ID = 'expense-options';

let cache = null;

export const invalidateExpenseSettingsCache = () => { cache = null; };

export const useExpenseSettings = () => {
  const [settings, setSettings] = useState(cache || DEFAULTS);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) { setSettings(cache); return; }
    setLoading(true);
    apiClient.get('/records/appSettings')
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        const record = all.find((r) => r.settingsId === EXPENSE_SETTINGS_ID);
        if (record) {
          const merged = {
            expenseCategories: record.expenseCategories?.length ? record.expenseCategories : DEFAULTS.expenseCategories,
            paymentModes: record.paymentModes?.length ? record.paymentModes : DEFAULTS.paymentModes,
            vendorPayeeOptions: record.vendorPayeeOptions?.length ? record.vendorPayeeOptions : DEFAULTS.vendorPayeeOptions,
          };
          cache = merged;
          setSettings(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
};
