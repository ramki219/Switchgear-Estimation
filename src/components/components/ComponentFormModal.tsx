import React, { useState, useEffect } from 'react';
import { Component, ComponentCategory, Manufacturer, ComponentSpecification } from '../../types';
import { Modal } from '../common/Modal';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface ComponentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comp: any) => void;
  componentToEdit?: Component | null;
  categories: ComponentCategory[];
  manufacturers: Manufacturer[];
}

export const ComponentFormModal: React.FC<ComponentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  componentToEdit,
  categories,
  manufacturers,
}) => {
  const [formData, setFormData] = useState({
    componentCode: '',
    partNumber: '',
    componentName: '',
    categoryID: categories[0]?.categoryID || 1,
    manufacturerID: manufacturers[0]?.manufacturerID || 1,
    model: '',
    description: '',
    unit: 'NOS',
    ratedVoltage: 415,
    ratedCurrent: 100,
    poles: 3,
    breakingCapacity: 36,
    frequency: 50,
    ipRating: 'IP20',
    mountingType: 'Fixed',
    iecStandard: 'IEC 60947-2',
    isActive: true,
  });

  const [specs, setSpecs] = useState<{ name: string; value: string; unit?: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (componentToEdit) {
      setFormData({
        componentCode: componentToEdit.componentCode,
        partNumber: componentToEdit.partNumber,
        componentName: componentToEdit.componentName,
        categoryID: componentToEdit.categoryID,
        manufacturerID: componentToEdit.manufacturerID,
        model: componentToEdit.model || '',
        description: componentToEdit.description || '',
        unit: componentToEdit.unit || 'NOS',
        ratedVoltage: componentToEdit.ratedVoltage || 415,
        ratedCurrent: componentToEdit.ratedCurrent || 100,
        poles: componentToEdit.poles || 3,
        breakingCapacity: componentToEdit.breakingCapacity || 36,
        frequency: componentToEdit.frequency || 50,
        ipRating: componentToEdit.ipRating || 'IP20',
        mountingType: componentToEdit.mountingType || 'Fixed',
        iecStandard: componentToEdit.iecStandard || 'IEC 60947-2',
        isActive: componentToEdit.isActive,
      });
      setSpecs(
        componentToEdit.specifications
          ? componentToEdit.specifications.map(s => ({ name: s.specificationName, value: s.specificationValue, unit: s.unit }))
          : []
      );
    } else {
      setFormData({
        componentCode: `CMP-SW-${Math.floor(1000 + Math.random() * 9000)}`,
        partNumber: '',
        componentName: '',
        categoryID: categories[0]?.categoryID || 1,
        manufacturerID: manufacturers[0]?.manufacturerID || 1,
        model: '',
        description: '',
        unit: 'NOS',
        ratedVoltage: 415,
        ratedCurrent: 100,
        poles: 3,
        breakingCapacity: 36,
        frequency: 50,
        ipRating: 'IP20',
        mountingType: 'Fixed',
        iecStandard: 'IEC 60947-2',
        isActive: true,
      });
      setSpecs([]);
    }
    setErrors({});
  }, [componentToEdit, isOpen, categories, manufacturers]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.componentCode.trim()) errs.componentCode = 'Component Code is required';
    if (!formData.partNumber.trim()) errs.partNumber = 'Manufacturer Part Number is required';
    if (!formData.componentName.trim()) errs.componentName = 'Component Name is required';
    if (!formData.categoryID) errs.categoryID = 'Category is required';
    if (!formData.manufacturerID) errs.manufacturerID = 'Manufacturer is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      ...(componentToEdit ? { componentID: componentToEdit.componentID } : {}),
      specifications: specs.map((s, idx) => ({
        specificationID: idx + 1,
        componentID: componentToEdit?.componentID || 0,
        specificationName: s.name,
        specificationValue: s.value,
        unit: s.unit,
      })),
    };

    onSave(payload);
    onClose();
  };

  const addSpecRow = () => {
    setSpecs([...specs, { name: '', value: '', unit: '' }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpecRow = (index: number, field: 'name' | 'value' | 'unit', val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={componentToEdit ? 'Edit Switchgear Component' : 'Add New Switchgear Component'}
      subtitle="Master Data > Components"
      maxWidth="4xl"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition shadow-2xs"
          >
            {componentToEdit ? 'Save Changes' : 'Create Component'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Identification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
              Component Code *
            </label>
            <input
              type="text"
              value={formData.componentCode}
              onChange={(e) => setFormData({ ...formData, componentCode: e.target.value })}
              className={`w-full px-3 py-1.5 bg-white border rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
                errors.componentCode ? 'border-rose-400' : 'border-slate-300 focus:border-cyan-500'
              }`}
            />
            {errors.componentCode && (
              <span className="text-[10px] text-rose-500 mt-0.5 block font-medium">{errors.componentCode}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
              Manufacturer Part Number *
            </label>
            <input
              type="text"
              placeholder="e.g. 1SDA071018R1, LV848150"
              value={formData.partNumber}
              onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
              className={`w-full px-3 py-1.5 bg-white border rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
                errors.partNumber ? 'border-rose-400' : 'border-slate-300 focus:border-cyan-500'
              }`}
            />
            {errors.partNumber && (
              <span className="text-[10px] text-rose-500 mt-0.5 block font-medium">{errors.partNumber}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
              Model Series
            </label>
            <input
              type="text"
              placeholder="e.g. Emax 2 E2.2N, ComPact NSX"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {/* Row 2: Name & Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
              Manufacturer (OEM) *
            </label>
            <select
              value={formData.manufacturerID}
              onChange={(e) => setFormData({ ...formData, manufacturerID: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              {manufacturers.map((m) => (
                <option key={m.manufacturerID} value={m.manufacturerID}>
                  {m.manufacturerName} ({m.manufacturerCode})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
              Category *
            </label>
            <select
              value={formData.categoryID}
              onChange={(e) => setFormData({ ...formData, categoryID: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              {categories.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.categoryName} ({c.categoryCode})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-mono font-medium text-slate-700 mb-1">
              Component Name *
            </label>
            <input
              type="text"
              placeholder="Full engineering description"
              value={formData.componentName}
              onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
              className={`w-full px-3 py-1.5 bg-white border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
                errors.componentName ? 'border-rose-400' : 'border-slate-300 focus:border-cyan-500'
              }`}
            />
          </div>
        </div>

        {/* Row 3: Electrical Specs */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            Electrical & Physical Ratings
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Rated Current (A)</label>
              <input
                type="number"
                step="any"
                value={formData.ratedCurrent}
                onChange={(e) => setFormData({ ...formData, ratedCurrent: Number(e.target.value) })}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Breaking Cap (kA)</label>
              <input
                type="number"
                step="any"
                value={formData.breakingCapacity}
                onChange={(e) => setFormData({ ...formData, breakingCapacity: Number(e.target.value) })}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Poles</label>
              <select
                value={formData.poles}
                onChange={(e) => setFormData({ ...formData, poles: Number(e.target.value) })}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-cyan-500 focus:outline-none"
              >
                <option value={1}>1 Pole (1P)</option>
                <option value={2}>2 Poles (2P)</option>
                <option value={3}>3 Poles (3P)</option>
                <option value={4}>4 Poles (4P / 3P+N)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Rated Voltage (V)</label>
              <input
                type="number"
                value={formData.ratedVoltage}
                onChange={(e) => setFormData({ ...formData, ratedVoltage: Number(e.target.value) })}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Mounting</label>
              <select
                value={formData.mountingType}
                onChange={(e) => setFormData({ ...formData, mountingType: e.target.value })}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Fixed">Fixed</option>
                <option value="Drawout">Drawout with Chassis</option>
                <option value="DIN Rail">DIN Rail Mounted</option>
                <option value="Base Mount">Base / Chassis Mount</option>
                <option value="Door Mount">Door Flush Mount</option>
                <option value="Busbar Mount">Busbar Window Mount</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">IP Rating</label>
              <select
                value={formData.ipRating}
                onChange={(e) => setFormData({ ...formData, ipRating: e.target.value })}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-cyan-500 focus:outline-none"
              >
                <option value="IP00">IP00 (Open)</option>
                <option value="IP20">IP20 (Finger-safe)</option>
                <option value="IP30">IP30</option>
                <option value="IP40">IP40</option>
                <option value="IP54">IP54 (Dust/Splash)</option>
                <option value="IP65">IP65 (Weatherproof)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Standard (IEC)</label>
              <input
                type="text"
                value={formData.iecStandard}
                onChange={(e) => setFormData({ ...formData, iecStandard: e.target.value })}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Unit of Measure</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Technical Specifications */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              Technical Specifications (EAV Attributes)
            </span>
            <button
              type="button"
              onClick={addSpecRow}
              className="flex items-center gap-1 text-[11px] font-mono font-medium text-cyan-700 hover:text-cyan-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Specification</span>
            </button>
          </div>

          {specs.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-2">
              No extra technical attributes added (e.g. Trip Unit, Ics %, Coil Voltage, kvar).
            </p>
          ) : (
            <div className="space-y-2 mt-2">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Spec Name (e.g. Trip Unit)"
                    value={spec.name}
                    onChange={(e) => updateSpecRow(i, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. Ekip Touch LSI)"
                    value={spec.value}
                    onChange={(e) => updateSpecRow(i, 'value', e.target.value)}
                    className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Unit (optional)"
                    value={spec.unit || ''}
                    onChange={(e) => updateSpecRow(i, 'unit', e.target.value)}
                    className="w-24 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(i)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
