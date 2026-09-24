import React, { useState, useEffect } from 'react';
import { Component, Supplier, SupplierPrice } from '../../types';
import { Modal } from '../common/Modal';
import { DollarSign, ShieldAlert, Calculator } from 'lucide-react';

interface PriceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePrice: (payload: any) => void;
  components: Component[];
  suppliers: Supplier[];
  preselectedComponent?: Component | null;
}

export const PriceEntryModal: React.FC<PriceEntryModalProps> = ({
  isOpen,
  onClose,
  onSavePrice,
  components,
  suppliers,
  preselectedComponent,
}) => {
  const [componentID, setComponentID] = useState<number>(
    preselectedComponent?.componentID || components[0]?.componentID || 1
  );
  const [supplierID, setSupplierID] = useState<number>(suppliers[0]?.supplierID || 1);
  const [supplierPartNumber, setSupplierPartNumber] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [listPrice, setListPrice] = useState<number>(1000);
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [minimumQuantity, setMinimumQuantity] = useState<number>(1);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [priceDate, setPriceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>('2026-12-31');
  const [quotationReference, setQuotationReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (preselectedComponent) {
      setComponentID(preselectedComponent.componentID);
      setSupplierPartNumber(preselectedComponent.partNumber);
    }
  }, [preselectedComponent, isOpen]);

  // Live computed net price
  const netPrice = Number((listPrice * (1 - (discountPercent || 0) / 100)).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!componentID || !supplierID || listPrice <= 0) return;

    onSavePrice({
      componentID,
      supplierID,
      supplierPartNumber,
      currency,
      listPrice,
      discountPercent,
      minimumQuantity,
      leadTimeDays,
      priceDate,
      validUntil: validUntil || undefined,
      quotationReference,
      notes,
    });
    onClose();
  };

  const selectedComp = components.find(c => c.componentID === componentID);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supplier Price Revision & Entry"
      subtitle="Pricing Engine > Supplier Prices"
      maxWidth="3xl"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded transition-colors shadow-xs"
          >
            Commit Price Revision
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Engineering Notice */}
        <div className="bg-slate-950 p-3 rounded-lg border border-cyan-900/60 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono text-cyan-300 leading-relaxed">
            <strong>Historical Engine Rule:</strong> Committing this record will automatically archive any prior active price for this component & supplier (updating its valid-until date), ensuring previous switchboard estimates maintain their exact historical BOM costing.
          </div>
        </div>

        {/* Component Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Select Component *
            </label>
            <select
              value={componentID}
              onChange={(e) => {
                const id = Number(e.target.value);
                setComponentID(id);
                const c = components.find(x => x.componentID === id);
                if (c) setSupplierPartNumber(c.partNumber);
              }}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 font-mono focus:border-cyan-500"
            >
              {components.map((c) => (
                <option key={c.componentID} value={c.componentID}>
                  {c.partNumber} - {c.componentName} ({c.manufacturerCode})
                </option>
              ))}
            </select>
            {selectedComp && (
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                OEM: {selectedComp.manufacturerName} • Rating: {selectedComp.ratedCurrent}A / {selectedComp.breakingCapacity}kA
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Supplier / Vendor *
            </label>
            <select
              value={supplierID}
              onChange={(e) => setSupplierID(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 focus:border-cyan-500"
            >
              {suppliers.map((s) => (
                <option key={s.supplierID} value={s.supplierID}>
                  {s.supplierName} ({s.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Calculation */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="text-xs font-mono font-semibold text-slate-300 uppercase flex items-center justify-between">
            <span>Commercial Cost Parameters</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              Net Price: {currency} {netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-100"
              >
                <option value="AED">AED (UAE Dirham)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">List Price *</label>
              <input
                type="number"
                step="any"
                value={listPrice}
                onChange={(e) => setListPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-100 font-bold focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Discount %</label>
              <input
                type="number"
                step="any"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-amber-400 font-bold focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Min Order Qty</label>
              <input
                type="number"
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Commercial Terms & References */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Price Effective Date *</label>
            <input
              type="date"
              value={priceDate}
              onChange={(e) => setPriceDate(e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Valid Until</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Lead Time (Days)</label>
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Quotation Ref #</label>
            <input
              type="text"
              placeholder="e.g. QT-DAN-2026-902"
              value={quotationReference}
              onChange={(e) => setQuotationReference(e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 uppercase"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1">
            Commercial Notes / Price Revision Reason
          </label>
          <input
            type="text"
            placeholder="e.g. Annual contract agreement, copper surcharge adjustment, promotional rate"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 font-mono focus:border-cyan-500"
          />
        </div>
      </form>
    </Modal>
  );
};
