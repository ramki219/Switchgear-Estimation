import React, { useState, useMemo } from 'react';
import { Component, EstimateItem } from '../../types';
import { Modal } from '../common/Modal';
import { Plus, Search, Tag, DollarSign, Cpu, CheckCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface AddFeederModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (itemData: Omit<EstimateItem, 'itemID' | 'panelID' | 'totalCost'>) => void;
  components: Component[];
  panelTag: string;
}

export const AddFeederModal: React.FC<AddFeederModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  components,
  panelTag,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  const [circuitTag, setCircuitTag] = useState('FEEDER-01');
  const [description, setDescription] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [rating, setRating] = useState('');
  const [categoryCode, setCategoryCode] = useState('MCCB');
  const [manufacturerCode, setManufacturerCode] = useState('ABB');
  const [supplierName, setSupplierName] = useState('Authorized Distributor');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('NOS');
  const [unitCost, setUnitCost] = useState(0);

  // Filter components for picker
  const filteredComponents = useMemo(() => {
    return components.filter(c => {
      const matchCat = selectedCategory === 'ALL' || c.categoryName?.toUpperCase().includes(selectedCategory);
      const matchSearch = !searchTerm || 
        c.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.model && c.model.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [components, selectedCategory, searchTerm]);

  // When a component from catalog is selected
  const handleSelectComponent = (comp: Component) => {
    setSelectedComponent(comp);
    setDescription(comp.componentName);
    setPartNumber(comp.partNumber);
    setRating(
      comp.ratedCurrent ? `${comp.ratedCurrent}A ${comp.breakingCapacity ? comp.breakingCapacity + 'kA' : ''}` : (comp.model || '')
    );
    setCategoryCode(comp.categoryName || 'SWITCHGEAR');
    setManufacturerCode(comp.manufacturerCode || comp.manufacturerName || 'OEM');
    setUnit(comp.unit || 'NOS');
    
    // Auto-populate active net buying price from Phase 1 pricing database
    if (comp.currentPrice) {
      setUnitCost(comp.currentPrice.netPrice);
      setSupplierName(comp.currentPrice.supplierName || 'Authorized Distributor');
    } else {
      setUnitCost(150.0);
      setSupplierName('Distributor List Price');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !partNumber) return;

    onAddItem({
      componentID: selectedComponent?.componentID,
      circuitTag: circuitTag.trim(),
      description: description.trim(),
      categoryCode,
      manufacturerCode,
      partNumber: partNumber.trim(),
      rating: rating.trim(),
      quantity: Number(quantity),
      unit,
      unitCost: Number(unitCost),
      supplierName,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Circuit Feeder / Equipment to ${panelTag}`}
      subtitle="Select directly from the Phase 1 Component Master Catalog to pull live active buying prices"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-slate-800">
        {/* Step 1: Catalog Component Search & Selection */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-cyan-800 font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <span>1. Choose from Master Component Catalog</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {filteredComponents.length} components available with live pricing
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search part number, model, ACB, MCCB, rating (e.g. 1600A, 400A)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Categories</option>
              <option value="AIR CIRCUIT BREAKER">Air Circuit Breakers (ACB)</option>
              <option value="MOULDED CASE">Moulded Case (MCCB)</option>
              <option value="MINIATURE">Miniature Breakers (MCB)</option>
              <option value="POWER FACTOR">Capacitors & APFC</option>
              <option value="MEASURING">Meters & CTs</option>
              <option value="CONTACTOR">Contactors & Relays</option>
            </select>
          </div>

          {/* Quick Component Picker Table */}
          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-100 shadow-2xs">
            {filteredComponents.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-[11px]">
                No matching components found in master catalog.
              </div>
            ) : (
              filteredComponents.map((c) => {
                const isSelected = selectedComponent?.componentID === c.componentID;
                return (
                  <div
                    key={c.componentID}
                    onClick={() => handleSelectComponent(c)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-50 border-l-4 border-cyan-600 text-cyan-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.partNumber}</span>
                        <span className="text-[11px] text-slate-500">({c.manufacturerName || c.manufacturerCode})</span>
                        {c.ratedCurrent && (
                          <Badge variant="blue" size="sm">{c.ratedCurrent}A</Badge>
                        )}
                        {c.breakingCapacity && (
                          <Badge variant="purple" size="sm">{c.breakingCapacity}kA</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.componentName}</p>
                    </div>

                    <div className="text-right pl-2">
                      <div className="text-emerald-700 font-bold">
                        {c.currentPrice ? `${c.currentPrice.netPrice.toLocaleString()} AED` : 'Price on req.'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.currentPrice?.supplierName || 'Distributor'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Step 2: Feeder Details & Quantities */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="text-cyan-800 font-bold flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-cyan-600" />
            <span>2. Circuit Tagging & Sizing in Panel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Circuit Tag / Designation *</label>
              <input
                type="text"
                required
                value={circuitTag}
                onChange={(e) => setCircuitTag(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-cyan-600 focus:outline-none"
                placeholder="e.g. INCOMER-1, FEEDER-CHILLER"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quantity *</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-cyan-800 font-bold focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
              >
                <option value="NOS">NOS (Numbers)</option>
                <option value="SET">SET</option>
                <option value="MTR">MTR (Meters)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Component Description *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Part Number *</label>
              <input
                type="text"
                required
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Rating / Capacity</label>
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
                placeholder="e.g. 630A / 36kA"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Unit Net Buying Cost (AED) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-emerald-700 font-bold focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Extended Cost</label>
              <div className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-emerald-700 font-bold text-sm">
                {(quantity * unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold transition shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!description || !partNumber}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-lg flex items-center gap-2 transition shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Circuit Item</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
