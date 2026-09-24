import React, { useState } from 'react';
import { Manufacturer, Component } from '../../types';
import { Factory, Plus, ExternalLink, Globe, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface ManufacturersViewProps {
  manufacturers: Manufacturer[];
  components: Component[];
  onAddManufacturer: (m: Omit<Manufacturer, 'manufacturerID' | 'createdAt'>) => void;
}

export const ManufacturersView: React.FC<ManufacturersViewProps> = ({
  manufacturers,
  components,
  onAddManufacturer,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    manufacturerCode: '',
    manufacturerName: '',
    country: 'United Arab Emirates',
    website: '',
    contactEmail: '',
    contactPhone: '',
    isActive: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.manufacturerCode.trim() || !formData.manufacturerName.trim()) return;
    onAddManufacturer(formData);
    setIsModalOpen(false);
    setFormData({
      manufacturerCode: '',
      manufacturerName: '',
      country: 'United Arab Emirates',
      website: '',
      contactEmail: '',
      contactPhone: '',
      isActive: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Factory className="w-4 h-4 text-amber-400" />
            <span>Authorized Switchgear OEMs</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Original Equipment Manufacturers for low voltage breakers, contactors, meters & components
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Manufacturer</span>
        </button>
      </div>

      {/* Grid of Manufacturers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {manufacturers.map((m) => {
          const compCount = components.filter(c => c.manufacturerID === m.manufacturerID).length;
          return (
            <div
              key={m.manufacturerID}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-lg flex flex-col justify-between transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{m.manufacturerName}</h4>
                    <span className="font-mono text-xs text-amber-400 font-semibold">{m.manufacturerCode}</span>
                  </div>
                  {m.isActive ? (
                    <Badge variant="success">ACTIVE OEM</Badge>
                  ) : (
                    <Badge variant="default">INACTIVE</Badge>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 font-mono mt-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Origin: {m.country || 'Global'}</span>
                  </div>

                  {m.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{m.contactEmail}</span>
                    </div>
                  )}

                  {m.website && (
                    <div className="flex items-center gap-2 pt-1">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <a
                        href={m.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline truncate"
                      >
                        {m.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Master Catalog:</span>
                <span className="text-slate-200 font-semibold">{compCount} Components</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Manufacturer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Switchgear Manufacturer (OEM)"
        subtitle="Master Data > Manufacturers"
        maxWidth="md"
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
              Save OEM
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Manufacturer Code *</label>
            <input
              type="text"
              placeholder="e.g. ABB, SCHNEIDER, SIEMENS"
              value={formData.manufacturerCode}
              onChange={(e) => setFormData({ ...formData, manufacturerCode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Manufacturer Name *</label>
            <input
              type="text"
              placeholder="e.g. ABB Electrification"
              value={formData.manufacturerName}
              onChange={(e) => setFormData({ ...formData, manufacturerName: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Country of Origin</label>
            <input
              type="text"
              placeholder="e.g. Switzerland, France, Germany"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Website URL</label>
            <input
              type="url"
              placeholder="https://new.abb.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Contact Email</label>
            <input
              type="email"
              placeholder="sales@oem.com"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
