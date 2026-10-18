import React, { useState } from 'react';
import { Supplier } from '../../types';
import { Truck, Plus, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface SuppliersViewProps {
  suppliers: Supplier[];
  onAddSupplier: (s: Omit<Supplier, 'supplierID' | 'createdAt'>) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  onAddSupplier,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplierCode: '',
    supplierName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: 'Dubai',
    country: 'United Arab Emirates',
    currency: 'AED',
    paymentTerms: '30 Days Net',
    isActive: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierCode.trim() || !formData.supplierName.trim()) return;
    onAddSupplier(formData);
    setIsModalOpen(false);
    setFormData({
      supplierCode: '',
      supplierName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: 'Dubai',
      country: 'United Arab Emirates',
      currency: 'AED',
      paymentTerms: '30 Days Net',
      isActive: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Supplier & Vendor Directory</span>
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            Authorized distributors and stockists for switchgear sourcing, credit terms & quote tracking
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Grid of Suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((s) => (
          <div
            key={s.supplierID}
            className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl flex flex-col justify-between transition-all shadow-xs hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{s.supplierName}</h4>
                  <span className="font-mono text-xs text-emerald-700 font-semibold">{s.supplierCode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="purple">{s.currency}</Badge>
                  {s.isActive ? (
                    <Badge variant="success">ACTIVE VENDOR</Badge>
                  ) : (
                    <Badge variant="default">INACTIVE</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 font-mono mt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{s.email || 'No email registered'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{s.phone || 'No direct phone'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{s.city}, {s.country}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-amber-700 font-medium">{s.paymentTerms}</span>
                </div>
              </div>
            </div>

            {s.contactPerson && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Account Manager:</span>
                <span className="text-slate-900 font-semibold">{s.contactPerson}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Switchgear Supplier"
        subtitle="Master Data > Suppliers"
        maxWidth="lg"
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition shadow-2xs"
            >
              Save Supplier
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Supplier Code *</label>
              <input
                type="text"
                placeholder="e.g. SUP-ALGHURAIR"
                value={formData.supplierCode}
                onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-600"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Supplier Trading Name *</label>
              <input
                type="text"
                placeholder="e.g. Al Ghandi Electrical Supplies"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Contact Person</label>
              <input
                type="text"
                placeholder="Key Account Manager"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Email</label>
              <input
                type="email"
                placeholder="sales@supplier.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-600"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-700 mb-1 font-semibold">Payment Terms</label>
              <input
                type="text"
                placeholder="e.g. 30 Days Net, 45 Days PDC, LC"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
