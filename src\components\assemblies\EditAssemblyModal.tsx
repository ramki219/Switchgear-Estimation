import React, { useState, useMemo, useEffect } from 'react';
import { 
  PredefinedAssembly, 
  PredefinedAssemblyItem, 
  Component, 
  AssemblyCategory, 
  CableEntryType 
} from '../../types';
import { storageService } from '../../services/storageService';
import { 
  X, 
  Plus, 
  Trash2, 
  Search, 
  DollarSign, 
  Cpu, 
  Boxes, 
  Check, 
  Layers, 
  Sparkles, 
  ArrowLeft,
  Sliders, 
  CheckCircle2, 
  Building2, 
  Zap,
  Copy,
  Info
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface EditAssemblyModalProps {
  isOpen: boolean;
  onClose: () => void;
  assembly: PredefinedAssembly | null;
  onSave: (updatedAssembly: PredefinedAssembly) => void;
  allComponents?: Component[];
}

export const EditAssemblyModal: React.FC<EditAssemblyModalProps> = ({
  isOpen,
  onClose,
  assembly,
  onSave,
  allComponents: propComponents,
}) => {
  // Load components catalog for picking
  const components = useMemo(() => {
    if (propComponents && propComponents.length > 0) return propComponents;
    return storageService.getComponents();
  }, [propComponents]);

  // Form State
  const [formData, setFormData] = useState<PredefinedAssembly | null>(null);
  
  // Component Picker Sub-view state
  const [isPickingComponent, setIsPickingComponent] = useState<boolean>(false);
  const [compSearch, setCompSearch] = useState<string>('');
  const [selectedCompCat, setSelectedCompCat] = useState<string>('ALL');
  const [selectedCompOEM, setSelectedCompOEM] = useState<string>('ALL');
  const [selectedComp, setSelectedComp] = useState<Component | null>(null);
  const [newCircuitTag, setNewCircuitTag] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newUnitCost, setNewUnitCost] = useState<number>(0);
  const [newCustomDesc, setNewCustomDesc] = useState<string>('');

  // Manual Custom item adder state
  const [isAddingCustomItem, setIsAddingCustomItem] = useState<boolean>(false);
  const [customTag, setCustomTag] = useState<string>('');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [customPartNo, setCustomPartNo] = useState<string>('');
  const [customMfg, setCustomMfg] = useState<string>('');
  const [customRating, setCustomRating] = useState<string>('');
  const [customQty, setCustomQty] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<string>('NOS');
  const [customCost, setCustomCost] = useState<number>(0);

  // Active Tab inside editor
  const [activeTab, setActiveTab] = useState<'components' | 'general' | 'commercial'>('components');

  // Initialize form data when assembly opens
  useEffect(() => {
    if (assembly) {
      setFormData({
        ...assembly,
        items: assembly.items ? [...assembly.items] : []
      });
      setIsPickingComponent(false);
      setIsAddingCustomItem(false);
    }
  }, [assembly, isOpen]);

  // Categories & OEMs in components catalog
  const catalogCategories = useMemo(() => {
    const set = new Set<string>();
    components.forEach(c => {
      if (c.categoryName) set.add(c.categoryName);
    });
    return Array.from(set).sort();
  }, [components]);

  const catalogOEMs = useMemo(() => {
    const set = new Set<string>();
    components.forEach(c => {
      const oem = c.manufacturerCode || c.manufacturerName;
      if (oem) set.add(oem);
    });
    return Array.from(set).sort();
  }, [components]);

  // Filtered components for picking
  const filteredComponents = useMemo(() => {
    return components.filter(c => {
      const matchCat = selectedCompCat === 'ALL' || c.categoryName === selectedCompCat;
      const oem = c.manufacturerCode || c.manufacturerName;
      const matchOEM = selectedCompOEM === 'ALL' || oem === selectedCompOEM;
      const q = compSearch.toLowerCase();
      const matchQuery = !q ||
        c.partNumber.toLowerCase().includes(q) ||
        c.componentName.toLowerCase().includes(q) ||
        (c.model && c.model.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q));
      return matchCat && matchOEM && matchQuery;
    });
  }, [components, selectedCompCat, selectedCompOEM, compSearch]);

  if (!isOpen || !formData) return null;

  // Live Recalculations
  const equipmentCost = formData.items.reduce((sum, it) => {
    const itemTotal = Number(it.totalCost) !== undefined && !isNaN(Number(it.totalCost))
      ? Number(it.totalCost) 
      : (Number(it.quantity) * Number(it.unitCost));
    return sum + itemTotal;
  }, 0);

  const copperCost = Number(formData.copperCost) || 0;
  const enclosureCost = Number(formData.enclosureCost) || 0;
  const labourCost = Number(formData.labourCost) || 0;
  const totalDirectCost = equipmentCost + copperCost + enclosureCost + labourCost;

  const overheadAmount = totalDirectCost * ((Number(formData.overheadPercent) || 0) / 100);
  const subtotalWithOverhead = totalDirectCost + overheadAmount;
  const marginAmount = subtotalWithOverhead * ((Number(formData.profitMarginPercent) || 0) / 100);
  const readyFinalPrice = Math.round(subtotalWithOverhead + marginAmount);

  // Update item field (quantity, unitCost, tag)
  const handleUpdateItem = (index: number, field: keyof PredefinedAssemblyItem, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitCost') {
      item.totalCost = Number(item.quantity) * Number(item.unitCost);
    }
    newItems[index] = item;
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  // Select component from catalog picker
  const handleChooseCatalogComp = (comp: Component) => {
    setSelectedComp(comp);
    setNewCustomDesc(comp.componentName);
    
    // Auto tag suggestion based on existing count
    const tagPrefix = comp.categoryName?.toUpperCase().includes('MCCB') 
      ? 'MCCB' 
      : comp.categoryName?.toUpperCase().includes('CONTACTOR')
      ? 'KM'
      : comp.categoryName?.toUpperCase().includes('CAPACITOR')
      ? 'CAP'
      : 'DEV';
    const tagIndex = formData.items.filter(it => it.circuitTag.startsWith(tagPrefix)).length + 1;
    setNewCircuitTag(`${tagPrefix}-${tagIndex}`);
    
    const price = comp.currentPrice?.netPrice || comp.currentPrice?.listPrice || 250;
    setNewUnitCost(price);
    setNewQuantity(1);
  };

  // Confirm adding component from catalog
  const handleConfirmAddComponent = () => {
    if (!selectedComp) return;

    const newItem: PredefinedAssemblyItem = {
      circuitTag: newCircuitTag.trim() || `ITEM-${formData.items.length + 1}`,
      description: newCustomDesc.trim() || selectedComp.componentName,
      partNumber: selectedComp.partNumber,
      categoryCode: selectedComp.categoryName || 'GENERAL',
      manufacturerCode: selectedComp.manufacturerCode || selectedComp.manufacturerName || 'OEM',
      rating: selectedComp.ratedCurrent ? `${selectedComp.ratedCurrent}A` : (selectedComp.model || ''),
      quantity: Number(newQuantity) || 1,
      unit: selectedComp.unit || 'NOS',
      unitCost: Number(newUnitCost) || 0,
      totalCost: (Number(newQuantity) || 1) * (Number(newUnitCost) || 0),
      componentID: selectedComp.componentID,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    // Reset picker
    setSelectedComp(null);
    setIsPickingComponent(false);
  };

  // Confirm adding custom line item
  const handleConfirmAddCustom = () => {
    if (!customDesc.trim()) return;

    const newItem: PredefinedAssemblyItem = {
      circuitTag: customTag.trim() || `MISC-${formData.items.length + 1}`,
      description: customDesc.trim(),
      partNumber: customPartNo.trim() || 'STD-ACC',
      categoryCode: 'ACCESSORY',
      manufacturerCode: customMfg.trim() || formData.primaryOEM || 'OEM',
      rating: customRating.trim(),
      quantity: Number(customQty) || 1,
      unit: customUnit.trim() || 'NOS',
      unitCost: Number(customCost) || 0,
      totalCost: (Number(customQty) || 1) * (Number(customCost) || 0),
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    setCustomTag('');
    setCustomDesc('');
    setCustomPartNo('');
    setCustomCost(0);
    setIsAddingCustomItem(false);
  };

  // Save changes
  const handleSave = () => {
    const finalAssembly: PredefinedAssembly = {
      ...formData,
      equipmentCost: Math.round(equipmentCost * 100) / 100,
      totalDirectCost: Math.round(totalDirectCost * 100) / 100,
      readyFinalPrice: readyFinalPrice,
    };

    const saved = storageService.updatePredefinedAssembly(finalAssembly);
    onSave(saved);
    onClose();
  };

  // Clone as New Assembly
  const handleCloneAsNew = () => {
    const clonedAssembly: PredefinedAssembly = {
      ...formData,
      id: `STD-${formData.panelTypeCode}-${Date.now()}`,
      code: `${formData.code}-V2`,
      name: `${formData.name} (Custom Variant)`,
      equipmentCost: Math.round(equipmentCost * 100) / 100,
      totalDirectCost: Math.round(totalDirectCost * 100) / 100,
      readyFinalPrice: readyFinalPrice,
    };

    const saved = storageService.addPredefinedAssembly(clonedAssembly);
    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Edit Predefined Assembly: <span className="font-mono text-cyan-800">{formData.code}</span>
                </h2>
                <Badge variant="cyan" size="sm">{formData.category}</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Customize standard components, add breakers or contactors from the master catalog, and adjust parameters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Ready Final Price pill in header */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Ready Final Price:</span>
              <span className="text-sm font-bold font-mono text-emerald-800">
                {readyFinalPrice.toLocaleString()} AED
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('components');
              setIsPickingComponent(false);
            }}
            className={`pb-3 font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'components'
                ? 'border-cyan-600 text-cyan-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-600" />
            <span>Components & Included Items ({formData.items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'general'
                ? 'border-cyan-600 text-cyan-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Ratings & Enclosure Specs</span>
          </button>

          <button
            onClick={() => setActiveTab('commercial')}
            className={`pb-3 font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'commercial'
                ? 'border-cyan-600 text-cyan-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Commercial Costing & Margins</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

          {/* TAB 1: COMPONENTS & ITEMS (THE USER REQUESTED CORE FEATURE) */}
          {activeTab === 'components' && (
            <div className="space-y-4">
              
              {/* If Picking Component from Catalog */}
              {isPickingComponent ? (
                <div className="bg-white border-2 border-cyan-500 rounded-2xl p-5 shadow-md space-y-4 font-mono animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPickingComponent(false)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600"
                        title="Back to items list"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
                        <span>Select Component from Master Catalog</span>
                        <Badge variant="cyan" size="sm">Phase 1 Database</Badge>
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsPickingComponent(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative sm:col-span-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search part #, name, rating..."
                        value={compSearch}
                        onChange={(e) => setCompSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <select
                        value={selectedCompCat}
                        onChange={(e) => setSelectedCompCat(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                      >
                        <option value="ALL">All Categories ({components.length})</option>
                        {catalogCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={selectedCompOEM}
                        onChange={(e) => setSelectedCompOEM(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                      >
                        <option value="ALL">All Manufacturers (OEMs)</option>
                        {catalogOEMs.map(oem => (
                          <option key={oem} value={oem}>{oem}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Components Catalog Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Part # / Model</th>
                          <th className="py-2 px-3">Description</th>
                          <th className="py-2 px-2">Category</th>
                          <th className="py-2 px-2">OEM</th>
                          <th className="py-2 px-3 text-right">Net Price (AED)</th>
                          <th className="py-2 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredComponents.slice(0, 50).map(c => {
                          const isPicked = selectedComp?.componentID === c.componentID;
                          const price = c.currentPrice?.netPrice || c.currentPrice?.listPrice || 0;
                          return (
                            <tr 
                              key={c.componentID} 
                              onClick={() => handleChooseCatalogComp(c)}
                              className={`cursor-pointer transition ${
                                isPicked ? 'bg-cyan-50/80 font-bold' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2 px-3 font-mono text-cyan-800 font-bold">
                                {c.partNumber}
                              </td>
                              <td className="py-2 px-3 font-sans text-slate-700">
                                {c.componentName}
                              </td>
                              <td className="py-2 px-2">
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {c.categoryName || 'GENERAL'}
                                </span>
                              </td>
                              <td className="py-2 px-2 font-semibold text-emerald-700">
                                {c.manufacturerCode || c.manufacturerName}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                {price.toLocaleString()} AED
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChooseCatalogComp(c);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    isPicked ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {isPicked ? 'Selected' : 'Pick'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Selected Component Configuration Bar */}
                  {selectedComp && (
                    <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-3 animate-in fade-in duration-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-900">
                          Selected: <span className="font-mono">{selectedComp.partNumber}</span> - {selectedComp.componentName}
                        </span>
                        <Badge variant="cyan" size="sm">
                          {selectedComp.manufacturerCode || selectedComp.manufacturerName}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1">Circuit Tag in Assembly</label>
                          <input
                            type="text"
                            value={newCircuitTag}
                            onChange={(e) => setNewCircuitTag(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                            placeholder="e.g. INCOMER, KM-01"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1">Quantity</label>
                          <input
                            type="number"
                            min={1}
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1">Unit Cost (AED)</label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={newUnitCost}
                            onChange={(e) => setNewUnitCost(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleConfirmAddComponent}
                            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Component to BOM</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* Action Bar for Adding Components */
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs font-mono text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900 font-sans">
                      Bill of Materials ({formData.items.length} Included Items)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Total Equipment Cost:{' '}
                      <strong className="text-slate-900">{equipmentCost.toLocaleString()} AED</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPickingComponent(true)}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add from Component List</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAddingCustomItem(!isAddingCustomItem)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition"
                    >
                      <span>+ Custom Line Item</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Add Custom Item Drawer (if toggled) */}
              {isAddingCustomItem && !isPickingComponent && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800">Add Custom Line Item (Accessories / Hardware / Lamps)</span>
                    <button onClick={() => setIsAddingCustomItem(false)} className="text-slate-400 hover:text-slate-600">
                      &times;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Circuit Tag</label>
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="e.g. CTRL-FUSE, PILOT-LAMPS"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-500 block mb-1">Description *</label>
                      <input
                        type="text"
                        value={customDesc}
                        onChange={(e) => setCustomDesc(e.target.value)}
                        placeholder="e.g. 22mm LED Pilot Lamps Red/Yellow/Blue Set"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Part Number</label>
                      <input
                        type="text"
                        value={customPartNo}
                        onChange={(e) => setCustomPartNo(e.target.value)}
                        placeholder="e.g. ACC-PL-22MM"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={customMfg}
                        onChange={(e) => setCustomMfg(e.target.value)}
                        placeholder={formData.primaryOEM || 'OEM'}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={customQty}
                        onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Unit Cost (AED)</label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={customCost}
                        onChange={(e) => setCustomCost(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleConfirmAddCustom}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs"
                      >
                        Add Custom Item
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table with in-line editing */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs font-mono text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Tag</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-2">Part Number</th>
                        <th className="py-2.5 px-2">OEM</th>
                        <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                        <th className="py-2.5 px-3 w-28 text-right">Unit (AED)</th>
                        <th className="py-2.5 px-3 w-28 text-right">Total (AED)</th>
                        <th className="py-2.5 px-2 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.circuitTag}
                              onChange={(e) => handleUpdateItem(idx, 'circuitTag', e.target.value)}
                              className="w-24 p-1 bg-slate-50 border border-slate-200 rounded text-cyan-800 font-bold focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-3 font-sans">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                              className="w-full p-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-cyan-500 text-slate-800 focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-slate-500 text-[11px]">
                            {item.partNumber}
                          </td>
                          <td className="py-2 px-2">
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {item.manufacturerCode || 'OEM'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-16 p-1 text-center bg-slate-50 border border-slate-200 rounded font-bold text-slate-900 focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={item.unitCost}
                              onChange={(e) => handleUpdateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                              className="w-24 p-1 text-right bg-slate-50 border border-slate-200 rounded text-slate-800 focus:bg-white"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {(Number(item.quantity) * Number(item.unitCost)).toLocaleString()} AED
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-red-600 transition"
                              title="Remove item from fixed design"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {formData.items.length === 0 && (
                  <div className="p-8 text-center text-slate-400 font-mono text-xs">
                    No components included in this assembly. Click "Add from Component List" above to add items.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: GENERAL & PHYSICAL SPECIFICATIONS */}
          {activeTab === 'general' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 font-mono text-xs">
              <h3 className="font-bold text-slate-900 font-sans text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Switchgear Panel Ratings & Enclosure Configuration</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Assembly Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-cyan-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 block mb-1">Assembly Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AssemblyCategory })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                  >
                    <option value="METER_CABINET">Meter Cabinet / Metering Panel</option>
                    <option value="ATS">ATS Changeover</option>
                    <option value="CAPACITOR_BANK">Capacitor Bank (APFC)</option>
                    <option value="MOTOR_STARTER">Motor Starter / VFD</option>
                    <option value="SMDB">Sub-Main Distribution Board (SMDB)</option>
                    <option value="DB">Distribution Board (DB)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Primary OEM</label>
                  <input
                    type="text"
                    value={formData.primaryOEM}
                    onChange={(e) => setFormData({ ...formData, primaryOEM: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    placeholder="e.g. ABB, Schneider, Siemens"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Rating String</label>
                  <input
                    type="text"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                    placeholder="e.g. 400A 4P, 150 kvar, 45 kW"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Incomer Rating (A)</label>
                  <input
                    type="number"
                    value={formData.incomerRating}
                    onChange={(e) => setFormData({ ...formData, incomerRating: Number(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Short Circuit Rating (kA)</label>
                  <input
                    type="number"
                    value={formData.shortCircuitRating}
                    onChange={(e) => setFormData({ ...formData, shortCircuitRating: Number(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Form of Separation</label>
                  <select
                    value={formData.formOfSeparation}
                    onChange={(e) => setFormData({ ...formData, formOfSeparation: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2b">Form 2b</option>
                    <option value="Form 3b">Form 3b</option>
                    <option value="Form 4b Type 6">Form 4b Type 6</option>
                    <option value="Form 4b Type 7">Form 4b Type 7</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">IP Rating</label>
                  <input
                    type="text"
                    value={formData.ipRating}
                    onChange={(e) => setFormData({ ...formData, ipRating: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Enclosure Dimensions (H x W x D mm)</label>
                  <input
                    type="text"
                    value={formData.enclosureDimensions}
                    onChange={(e) => setFormData({ ...formData, enclosureDimensions: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Enclosure Brand / System</label>
                  <input
                    type="text"
                    value={formData.enclosureBrand}
                    onChange={(e) => setFormData({ ...formData, enclosureBrand: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-sans"
                />
              </div>
            </div>
          )}

          {/* TAB 3: COMMERCIAL COSTING & READY FINAL PRICE BREAKDOWN */}
          {activeTab === 'commercial' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-slate-900 font-sans text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Costing Elements & Ready Price Simulator</span>
                  </span>
                  <span className="text-emerald-800 font-bold text-base">
                    Ready Price: {readyFinalPrice.toLocaleString()} AED
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Equipment Cost (auto) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block">Equipment OEM Cost (AED)</span>
                    <span className="text-lg font-bold text-slate-800 block mt-1">
                      {equipmentCost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Auto-summed from {formData.items.length} items
                    </span>
                  </div>

                  {/* Copper Busbars Cost */}
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-900 uppercase block font-semibold">Copper Busbars (AED)</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.copperCost}
                      onChange={(e) => setFormData({ ...formData, copperCost: parseFloat(e.target.value) || 0 })}
                      className="w-full p-1.5 mt-1 bg-white border border-amber-300 rounded font-bold text-amber-900"
                    />
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span>Weight (kg):</span>
                      <input
                        type="number"
                        step="any"
                        value={formData.copperWeightKg}
                        onChange={(e) => setFormData({ ...formData, copperWeightKg: parseFloat(e.target.value) || 0 })}
                        className="w-16 p-0.5 bg-white border border-slate-200 rounded text-right"
                      />
                    </div>
                  </div>

                  {/* Enclosure Cost */}
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                    <span className="text-[10px] text-blue-900 uppercase block font-semibold">Enclosure Cost (AED)</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.enclosureCost}
                      onChange={(e) => setFormData({ ...formData, enclosureCost: parseFloat(e.target.value) || 0 })}
                      className="w-full p-1.5 mt-1 bg-white border border-blue-300 rounded font-bold text-blue-900"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1 truncate">
                      {formData.enclosureBrand}
                    </span>
                  </div>

                  {/* Labour Cost */}
                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200">
                    <span className="text-[10px] text-teal-900 uppercase block font-semibold">Assembly Labour (AED)</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.labourCost}
                      onChange={(e) => setFormData({ ...formData, labourCost: parseFloat(e.target.value) || 0 })}
                      className="w-full p-1.5 mt-1 bg-white border border-teal-300 rounded font-bold text-teal-900"
                    />
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span>Labour (hrs):</span>
                      <input
                        type="number"
                        value={formData.labourHours}
                        onChange={(e) => setFormData({ ...formData, labourHours: parseInt(e.target.value) || 0 })}
                        className="w-16 p-0.5 bg-white border border-slate-200 rounded text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Markups & Margins */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Commercial Profitability Formula
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Direct Factory Cost:</span>
                      <strong className="text-sm font-bold text-slate-900">
                        {totalDirectCost.toLocaleString()} AED
                      </strong>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Overhead Percentage (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.overheadPercent}
                        onChange={(e) => setFormData({ ...formData, overheadPercent: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Target Profit Margin (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.profitMarginPercent}
                        onChange={(e) => setFormData({ ...formData, profitMarginPercent: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-emerald-700 font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Formula: (Direct Cost {totalDirectCost.toLocaleString()} + {formData.overheadPercent}% Overhead) + {formData.profitMarginPercent}% Margin
                    </span>
                    <span className="text-sm font-bold text-emerald-800">
                      = {readyFinalPrice.toLocaleString()} AED Final Ready Price
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCloneAsNew}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
              title="Save a new copy of this assembly with a unique code"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Clone as New Assembly</span>
            </button>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-500 hidden sm:inline">
              {formData.items.length} items &bull; Direct Cost: {totalDirectCost.toLocaleString()} AED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-bold transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              <span>Save Assembly Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
