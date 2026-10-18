import React, { useState, useEffect } from 'react';
import { X, Building2, Save, Trash2 } from 'lucide-react';
import { BureauClient, OEMDiscountProfile, Manufacturer } from '../../types';

interface BureauClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
  clientToEdit?: BureauClient | null;
  manufacturers: Manufacturer[];
}

export const BureauClientModal: React.FC<BureauClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
  manufacturers,
}) => {
  const [clientCode, setClientCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [authority, setAuthority] = useState('DEWA / SEWA');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(
    '10% Advance with Order, 80% against Delivery, 10% on Testing & Handover'
  );
  const [defaultWarrantyMonths, setDefaultWarrantyMonths] = useState(18);
  const [defaultDeliveryWeeks, setDefaultDeliveryWeeks] = useState(8);
  const [targetMarginPercent, setTargetMarginPercent] = useState(15.0);
  const [defaultOverheadPercent, setDefaultOverheadPercent] = useState(8.0);
  const [notes, setNotes] = useState('');
  const [oemDiscounts, setOemDiscounts] = useState<OEMDiscountProfile[]>([]);

  useEffect(() => {
    if (clientToEdit) {
      setClientCode(clientToEdit.clientCode);
      setCompanyName(clientToEdit.companyName);
      setContactPerson(clientToEdit.contactPerson);
      setEmail(clientToEdit.email);
      setPhone(clientToEdit.phone);
      setAddress(clientToEdit.address);
      setAuthority(clientToEdit.authority);
      setDefaultPaymentTerms(clientToEdit.defaultPaymentTerms);
      setDefaultWarrantyMonths(clientToEdit.defaultWarrantyMonths);
      setDefaultDeliveryWeeks(clientToEdit.defaultDeliveryWeeks);
      setTargetMarginPercent(clientToEdit.targetMarginPercent);
      setDefaultOverheadPercent(clientToEdit.defaultOverheadPercent);
      setNotes(clientToEdit.notes || '');
      setOemDiscounts(clientToEdit.oemDiscounts || []);
    } else {
      const randomCode = 'CLI-' + Math.floor(100 + Math.random() * 900);
      setClientCode(randomCode);
      setCompanyName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setAddress('');
      setAuthority('DEWA / SEWA');
      setDefaultPaymentTerms('10% Advance with Order, 80% against Delivery, 10% on Testing & Handover');
      setDefaultWarrantyMonths(18);
      setDefaultDeliveryWeeks(8);
      setTargetMarginPercent(15.0);
      setDefaultOverheadPercent(8.0);
      setNotes('');
      // Seed default OEM discounts based on active manufacturers
      setOemDiscounts([
        { manufacturerCode: 'ABB', manufacturerName: 'ABB Electrification', standardDiscountPercent: 40.0 },
        { manufacturerCode: 'SCHNEIDER', manufacturerName: 'Schneider Electric', standardDiscountPercent: 36.0 },
        { manufacturerCode: 'SIEMENS', manufacturerName: 'Siemens AG', standardDiscountPercent: 38.0 },
        { manufacturerCode: 'HAGER', manufacturerName: 'Hager Group', standardDiscountPercent: 38.0 },
        { manufacturerCode: 'EATON', manufacturerName: 'Eaton Power Distribution', standardDiscountPercent: 35.0 },
      ]);
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleDiscountChange = (index: number, val: number) => {
    const updated = [...oemDiscounts];
    updated[index].standardDiscountPercent = val;
    setOemDiscounts(updated);
  };

  const handleAddOEM = (mfgCode: string) => {
    if (!mfgCode) return;
    const mfg = manufacturers.find(m => m.manufacturerCode === mfgCode);
    if (!mfg) return;
    if (oemDiscounts.some(d => d.manufacturerCode === mfgCode)) return;
    setOemDiscounts([
      ...oemDiscounts,
      {
        manufacturerCode: mfg.manufacturerCode,
        manufacturerName: mfg.manufacturerName,
        standardDiscountPercent: 35.0,
      }
    ]);
  };

  const handleRemoveOEM = (index: number) => {
    setOemDiscounts(oemDiscounts.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      clientID: clientToEdit?.clientID,
      clientCode,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      authority,
      defaultPaymentTerms,
      defaultWarrantyMonths: Number(defaultWarrantyMonths),
      defaultDeliveryWeeks: Number(defaultDeliveryWeeks),
      targetMarginPercent: Number(targetMarginPercent),
      defaultOverheadPercent: Number(defaultOverheadPercent),
      oemDiscounts,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {clientToEdit ? 'Edit Contractor Client Profile' : 'Register New Switchgear Contractor'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Model A Bureau: Configure confidential OEM discount agreements & target margin tiers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Company Details */}
          <div>
            <h3 className="text-xs font-semibold text-cyan-800 uppercase tracking-wider font-mono mb-3">
              1. Contractor Company & Contact Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-700 block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Al Ghandi Switchgear LLC"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Client Code *</label>
                <input
                  type="text"
                  required
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase focus:outline-hidden focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Tendering Contact Person *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Eng. Tariq Mansoor"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tariq@panelbuilder.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 4 000 0000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Location / Authority Standard</label>
                <input
                  type="text"
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  placeholder="e.g. DEWA / SEWA / ADDC"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-cyan-600"
                />
              </div>
            </div>
          </div>

          {/* OEM Discount Agreements */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider font-mono">
                2. Agreed OEM Discount Multipliers (Confidential)
              </h3>
              <div className="text-[11px] text-slate-500 font-mono">
                Automatically applied during tender pricing
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {oemDiscounts.map((disc, idx) => (
                  <div key={disc.manufacturerCode} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <div>
                      <span className="font-semibold text-slate-900 block">{disc.manufacturerName}</span>
                      <span className="text-[10px] text-slate-500">{disc.manufacturerCode}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="80"
                        step="0.5"
                        value={disc.standardDiscountPercent}
                        onChange={(e) => handleDiscountChange(idx, Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-right text-emerald-700 font-bold focus:outline-hidden focus:border-cyan-600"
                      />
                      <span className="text-slate-500">%</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOEM(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Remove OEM"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add OEM button */}
              <div className="pt-2 flex items-center gap-2">
                <select
                  id="addOemSelect"
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs font-mono focus:border-cyan-600"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddOEM(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="" disabled>+ Add Another OEM Brand Discount...</option>
                  {manufacturers
                    .filter(m => !oemDiscounts.some(d => d.manufacturerCode === m.manufacturerCode))
                    .map(m => (
                      <option key={m.manufacturerCode} value={m.manufacturerCode}>
                        {m.manufacturerName} ({m.manufacturerCode})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Commercial Bidding Profile */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-semibold text-purple-800 uppercase tracking-wider font-mono mb-3">
              3. Commercial Bidding & Margin Targets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-700 block mb-1">Target Margin (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={targetMarginPercent}
                    onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                    className="w-full pl-3 pr-7 py-2 bg-white border border-slate-300 rounded-lg text-purple-800 font-bold focus:border-cyan-600"
                  />
                  <span className="absolute right-2.5 top-2 text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Default Overhead (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={defaultOverheadPercent}
                    onChange={(e) => setDefaultOverheadPercent(Number(e.target.value))}
                    className="w-full pl-3 pr-7 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-cyan-600"
                  />
                  <span className="absolute right-2.5 top-2 text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Standard Warranty</label>
                <div className="relative">
                  <input
                    type="number"
                    min="6"
                    max="60"
                    value={defaultWarrantyMonths}
                    onChange={(e) => setDefaultWarrantyMonths(Number(e.target.value))}
                    className="w-full pl-3 pr-12 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-cyan-600"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">Months</span>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Lead Time</label>
                <div className="relative">
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={defaultDeliveryWeeks}
                    onChange={(e) => setDefaultDeliveryWeeks(Number(e.target.value))}
                    className="w-full pl-3 pr-12 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-cyan-600"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-400">Weeks</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs font-mono">
              <label className="text-slate-700 block mb-1">Standard Payment Milestones</label>
              <input
                type="text"
                value={defaultPaymentTerms}
                onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-cyan-600"
              />
            </div>

            <div className="mt-3 text-xs font-mono">
              <label className="text-slate-700 block mb-1">Contractor Notes & Specification Preferences</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prefers withdrawable ACB with Ekip Touch, Form 4b Type 6, DEWA inspection history..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 resize-none focus:border-cyan-600"
              />
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 font-mono text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors shadow-2xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Contractor Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
};
