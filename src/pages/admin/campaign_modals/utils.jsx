import React from 'react';

export const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const InfoBlock = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
  </div>
);

export const copyText = (t) => navigator.clipboard.writeText(t).catch(() => {});

export const downloadPdf = async (elementId, filename) => {
  const el = document.getElementById(elementId);
  if (!el) return;
  const html2pdf = (await import('html2pdf.js')).default;
  html2pdf().set({ margin: 8, filename, html2canvas: { scale: 2 }, jsPDF: { format: 'a5' } }).from(el).save();
};
