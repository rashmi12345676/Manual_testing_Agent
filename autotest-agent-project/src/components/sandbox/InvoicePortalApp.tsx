import React, { useState } from 'react';
import { FileText, Plus, Trash2, CheckCircle2, DollarSign, Send } from 'lucide-react';

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

export const InvoicePortalApp: React.FC = () => {
  const [clientName, setClientName] = useState('Starlight Ventures Inc.');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-084');
  const [taxRate, setTaxRate] = useState<number>(10);
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Paid'>('Draft');
  const [isIssued, setIsIssued] = useState(false);

  const [items, setItems] = useState<InvoiceLineItem[]>([
    { id: 'item-1', description: 'Design System & Architecture Audit', qty: 1, rate: 2400 },
    { id: 'item-2', description: 'QA Automation Pipeline Setup', qty: 2, rate: 1200 },
  ]);

  const handleAddItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      description: 'New Consulting Milestone',
      qty: 1,
      rate: 800,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceLineItem, val: any) => {
    setItems(
      items.map((it) => {
        if (it.id === id) {
          return { ...it, [field]: val };
        }
        return it;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const subtotal = items.reduce((acc, it) => acc + (it.qty * it.rate || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleIssueInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sent');
    setIsIssued(true);
  };

  return (
    <div className="bg-slate-50 min-h-[560px] text-slate-900 font-sans p-4 relative" data-testid="invoice-sandbox-root">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3 mb-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-slate-900" data-testid="invoice-app-title">
              Invoicing & Financial Desk
            </h2>
            <p className="text-[11px] text-slate-500">Billing Engine & Tax Calculator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            data-testid="invoice-status-badge"
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              status === 'Paid'
                ? 'bg-emerald-100 text-emerald-700'
                : status === 'Sent'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {isIssued && (
        <div
          data-testid="issued-success-banner"
          className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-center justify-between text-xs text-emerald-800"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Invoice <strong>{invoiceNumber}</strong> dispatched to <strong>{clientName}</strong>!
            </span>
          </div>
          <button
            type="button"
            data-testid="reset-invoice-btn"
            onClick={() => {
              setIsIssued(false);
              setStatus('Draft');
            }}
            className="text-[11px] font-semibold text-emerald-900 hover:underline cursor-pointer"
          >
            Create Another
          </button>
        </div>
      )}

      {/* Invoice Meta Grid */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="client-name-input" className="block text-[11px] font-medium text-slate-700 mb-1">
            Client Recipient *
          </label>
          <input
            id="client-name-input"
            type="text"
            data-testid="client-name-input"
            aria-label="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-md outline-hidden font-medium"
          />
        </div>

        <div>
          <label htmlFor="invoice-num-input" className="block text-[11px] font-medium text-slate-700 mb-1">
            Invoice Reference *
          </label>
          <input
            id="invoice-num-input"
            type="text"
            data-testid="invoice-num-input"
            aria-label="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-md outline-hidden font-mono"
          />
        </div>

        <div>
          <label htmlFor="tax-rate-select" className="block text-[11px] font-medium text-slate-700 mb-1">
            Applicable Tax / VAT
          </label>
          <select
            id="tax-rate-select"
            data-testid="tax-rate-select"
            aria-label="Tax rate percentage"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-md outline-hidden"
          >
            <option value="0">0% (Tax Exempt)</option>
            <option value="5">5% (Standard Reduced)</option>
            <option value="10">10% (Corporate Standard)</option>
            <option value="18">18% (EU Digital Services)</option>
          </select>
        </div>
      </div>

      {/* Dynamic Line Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mb-4">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-800">Billable Deliverables & Milestones</span>
          <button
            type="button"
            data-testid="add-line-item-btn"
            onClick={handleAddItem}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add Line Item</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100" data-testid="line-items-container">
          {items.map((item, idx) => (
            <div
              key={item.id}
              data-testid={`line-item-row-${idx}`}
              className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 hover:bg-slate-50/50"
            >
              <div className="flex-1 w-full">
                <input
                  type="text"
                  data-testid={`item-desc-${idx}`}
                  aria-label={`Description for line item ${idx + 1}`}
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-transparent border-b border-dashed border-slate-300 focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400">Qty:</span>
                  <input
                    type="number"
                    min="1"
                    data-testid={`item-qty-${idx}`}
                    aria-label={`Quantity for line item ${idx + 1}`}
                    value={item.qty}
                    onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-16 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-center outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400">Rate $:</span>
                  <input
                    type="number"
                    min="0"
                    data-testid={`item-rate-${idx}`}
                    aria-label={`Rate for line item ${idx + 1}`}
                    value={item.rate}
                    onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-right outline-hidden"
                  />
                </div>

                <span
                  data-testid={`item-row-total-${idx}`}
                  className="font-semibold text-xs text-slate-900 min-w-[70px] text-right font-mono"
                >
                  ${(item.qty * item.rate).toFixed(2)}
                </span>

                <button
                  type="button"
                  data-testid={`delete-line-item-${idx}`}
                  aria-label={`Delete line item ${idx + 1}`}
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={items.length <= 1}
                  className={`p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer ${
                    items.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals & Submit */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-xs text-slate-500">
          <p>Payment terms: Net 30 days from dispatch date.</p>
          <p className="text-[11px]">Direct wire transfer or card payment enabled.</p>
        </div>

        <div className="w-full sm:w-64 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span data-testid="invoice-subtotal" className="font-mono">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax ({taxRate}%)</span>
            <span data-testid="invoice-tax" className="font-mono">
              ${taxAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
            <span>Grand Total</span>
            <span data-testid="invoice-grand-total" className="font-mono text-emerald-700">
              ${grandTotal.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            data-testid="issue-invoice-btn"
            onClick={handleIssueInvoice}
            className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate & Dispatch Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
