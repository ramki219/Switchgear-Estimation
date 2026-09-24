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
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Supplier & Vendor Directory</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Authorized distributors and stockists for switchgear sourcing, credit terms & quote tracking
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors"
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
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-lg flex flex-col justify-between transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{s.supplierName}</h4>
                  <span className="font-mono text-xs text-emerald-400 font-semibold">{s.supplierCode}</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-mono mt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{s.email || 'No email registered'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{s.phone || 'No direct phone'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{s.city}, {s.country}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-amber-400">{s.paymentTerms}</span>
                </div>
              </div>
            </div>

            {s.contactPerson && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Account Manager:</span>
                <span className="text-slate-200 font-semibold">{s.contactPerson}</span>
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
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded"
            >
              Save Supplier
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Supplier Code *</label>
              <input
                type="text"
                placeholder="e.g. SUP-ALGHURAIR"
                value={formData.supplierCode}
                onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Supplier Trading Name *</label>
              <input
                type="text"
                placeholder="e.g. Al Ghandi Electrical Supplies"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="Key Account Manager"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="sales@supplier.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-300 mb-1">Payment Terms</label>
              <input
                type="text"
                placeholder="e.g. 30 Days Net, 45 Days PDC, LC"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
