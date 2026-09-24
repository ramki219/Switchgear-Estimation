import React, { useState, useEffect } from 'react';
import { EstimatePanel, PanelType, CableEntryType } from '../../types';
import { Modal } from '../common/Modal';
import { Save, Layers, Cpu, Shield, Ruler } from 'lucide-react';

interface PanelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (panelData: any) => void;
  panelToEdit?: EstimatePanel | null;
  projectID: number;
  panelTypes: PanelType[];
}

export const PanelFormModal: React.FC<PanelFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  panelToEdit,
  projectID,
  panelTypes,
}) => {
  const [panelTag, setPanelTag] = useState('');
  const [panelName, setPanelName] = useState('');
  const [panelTypeCode, setPanelTypeCode] = useState('MDB');
  const [incomerRating, setIncomerRating] = useState(1600);
  const [ratedVoltage, setRatedVoltage] = useState(415);
  const [shortCircuitRating, setShortCircuitRating] = useState(50);
  const [formOfSeparation, setFormOfSeparation] = useState('Form 4b Type 6');
  const [ipRating, setIpRating] = useState('IP42');
  const [cableEntry, setCableEntry] = useState<CableEntryType>('BOTTOM');
  const [busbarCurrentDensity, setBusbarCurrentDensity] = useState(1.5);
  const [copperBaseRatePerKg, setCopperBaseRatePerKg] = useState(42.0);
  const [enclosureHeight, setEnclosureHeight] = useState(2100);
  const [enclosureWidth, setEnclosureWidth] = useState(2400);
  const [enclosureDepth, setEnclosureDepth] = useState(800);
  const [numberOfColumns, setNumberOfColumns] = useState(3);
  const [sheetMetalThickness, setSheetMetalThickness] = useState(2.0);

  // Preset configuration handler
  const handleTypeChange = (typeCode: string) => {
    setPanelTypeCode(typeCode);
    if (typeCode === 'MDB') {
      setPanelTag('MDB-01');
      setPanelName('Main Distribution Board 2500A (Form 4b)');
      setIncomerRating(2500);
      setShortCircuitRating(65);
      setFormOfSeparation('Form 4b Type 6');
      setIpRating('IP42');
      setEnclosureWidth(3600);
      setEnclosureHeight(2200);
      setEnclosureDepth(1000);
      setNumberOfColumns(4);
    } else if (typeCode === 'SMDB') {
      setPanelTag('SMDB-01');
      setPanelName('Sub-Main Distribution Board 400A (Form 2b)');
      setIncomerRating(400);
      setShortCircuitRating(36);
      setFormOfSeparation('Form 2b');
      setIpRating('IP54');
      setEnclosureWidth(1200);
      setEnclosureHeight(1800);
      setEnclosureDepth(400);
      setNumberOfColumns(1);
    } else if (typeCode === 'APFC') {
      setPanelTag('APFC-01');
      setPanelName('Automatic Power Factor Correction Panel 400 kvar');
      setIncomerRating(800);
      setShortCircuitRating(50);
      setFormOfSeparation('Form 2b');
      setIpRating('IP42');
      setEnclosureWidth(1600);
      setEnclosureHeight(2100);
      setEnclosureDepth(800);
      setNumberOfColumns(2);
    } else if (typeCode === 'MCC') {
      setPanelTag('MCC-01');
      setPanelName('Motor Control Center (Pumping Station)');
      setIncomerRating(1000);
      setShortCircuitRating(50);
      setFormOfSeparation('Form 4b Type 7');
      setIpRating('IP54');
      setEnclosureWidth(2800);
      setEnclosureHeight(2100);
      setEnclosureDepth(800);
      setNumberOfColumns(3);
    }
  };

  useEffect(() => {
    if (panelToEdit) {
      setPanelTag(panelToEdit.panelTag);
      setPanelName(panelToEdit.panelName);
      setPanelTypeCode(panelToEdit.panelTypeCode);
      setIncomerRating(panelToEdit.incomerRating);
      setRatedVoltage(panelToEdit.ratedVoltage);
      setShortCircuitRating(panelToEdit.shortCircuitRating);
      setFormOfSeparation(panelToEdit.formOfSeparation);
      setIpRating(panelToEdit.ipRating);
      setCableEntry(panelToEdit.cableEntry);
      setBusbarCurrentDensity(panelToEdit.busbarCurrentDensity || 1.5);
      setCopperBaseRatePerKg(panelToEdit.copperBaseRatePerKg || 42.0);
      setEnclosureHeight(panelToEdit.enclosureHeight);
      setEnclosureWidth(panelToEdit.enclosureWidth);
      setEnclosureDepth(panelToEdit.enclosureDepth);
      setNumberOfColumns(panelToEdit.numberOfColumns);
      setSheetMetalThickness(panelToEdit.sheetMetalThickness || 2.0);
    } else {
      handleTypeChange('MDB');
    }
  }, [panelToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeObj = panelTypes.find(t => t.panelTypeCode === panelTypeCode);

    onSave({
      ...(panelToEdit || {}),
      panelID: panelToEdit?.panelID,
      projectID,
      panelTag: panelTag.trim(),
      panelName: panelName.trim(),
      panelTypeID: typeObj?.panelTypeID || 1,
      panelTypeCode,
      incomerRating: Number(incomerRating),
      ratedVoltage: Number(ratedVoltage),
      shortCircuitRating: Number(shortCircuitRating),
      formOfSeparation,
      ipRating,
      cableEntry,
      busbarCurrentDensity: Number(busbarCurrentDensity),
      copperBaseRatePerKg: Number(copperBaseRatePerKg),
      enclosureHeight: Number(enclosureHeight),
      enclosureWidth: Number(enclosureWidth),
      enclosureDepth: Number(enclosureDepth),
      numberOfColumns: Number(numberOfColumns),
      sheetMetalThickness: Number(sheetMetalThickness),
      items: panelToEdit?.items || [],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={panelToEdit ? `Edit Panel: ${panelToEdit.panelTag}` : 'Add Switchboard Panel to Project'}
      subtitle="Configure electrical ratings, form of internal separation, dimensions and copper busbar current density"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        {/* Panel Classification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1">Panel Category *</label>
            <select
              value={panelTypeCode}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-semibold focus:border-cyan-500 focus:outline-none"
            >
              <option value="MDB">MDB - Main Distribution Board</option>
              <option value="SMDB">SMDB - Sub-Main Distribution Board</option>
              <option value="APFC">APFC - Capacitor Bank (PF Correction)</option>
              <option value="MCC">MCC - Motor Control Center</option>
              <option value="ATS">ATS - Automatic Transfer Switch</option>
              <option value="DB">DB - Final Distribution Board</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Panel Tag / Label *</label>
            <input
              type="text"
              required
              value={panelTag}
              onChange={(e) => setPanelTag(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-bold focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. MDB-01"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Incomer Rating (Amperes) *</label>
            <select
              value={incomerRating}
              onChange={(e) => setIncomerRating(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-cyan-400 font-bold focus:border-cyan-500 focus:outline-none"
            >
              <option value={100}>100A</option>
              <option value={160}>160A</option>
              <option value={250}>250A</option>
              <option value={400}>400A</option>
              <option value={630}>630A</option>
              <option value={800}>800A</option>
              <option value={1000}>1000A</option>
              <option value={1250}>1250A</option>
              <option value={1600}>1600A</option>
              <option value={2000}>2000A</option>
              <option value={2500}>2500A</option>
              <option value={3200}>3200A</option>
              <option value={4000}>4000A</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Panel Engineering Description *</label>
          <input
            type="text"
            required
            value={panelName}
            onChange={(e) => setPanelName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
            placeholder="e.g. Main Distribution Board 2500A 415V Form 4b Type 6 IP42"
          />
        </div>

        {/* Technical Ratings */}
        <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-slate-800 pb-1">
            <Cpu className="w-4 h-4" />
            <span>IEC 61439 Technical Ratings</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Short Circuit Icu/Icw *</label>
              <select
                value={shortCircuitRating}
                onChange={(e) => setShortCircuitRating(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value={25}>25 kA / 1s</option>
                <option value={36}>36 kA / 1s</option>
                <option value={50}>50 kA / 1s</option>
                <option value={65}>65 kA / 1s</option>
                <option value={85}>85 kA / 1s</option>
                <option value={100}>100 kA / 1s</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Internal Separation *</label>
              <select
                value={formOfSeparation}
                onChange={(e) => setFormOfSeparation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Form 1">Form 1 (No separation)</option>
                <option value="Form 2b">Form 2b (Busbar isolated)</option>
                <option value="Form 3b">Form 3b (Units & busbar isolated)</option>
                <option value="Form 4a">Form 4a (Units & terminals isolated)</option>
                <option value="Form 4b Type 6">Form 4b Type 6 (DEWA/Kahramaa)</option>
                <option value="Form 4b Type 7">Form 4b Type 7 (Full glanding)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Ingress Protection *</label>
              <select
                value={ipRating}
                onChange={(e) => setIpRating(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="IP31">IP31 (Standard indoor)</option>
                <option value="IP42">IP42 (DEWA standard indoor)</option>
                <option value="IP54">IP54 (Dust & splash proof)</option>
                <option value="IP55">IP55 (Heavy industrial)</option>
                <option value="IP65">IP65 (Outdoor weatherproof)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Cable Entry *</label>
              <select
                value={cableEntry}
                onChange={(e) => setCableEntry(e.target.value as CableEntryType)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="BOTTOM">Bottom Cable Entry</option>
                <option value="TOP">Top Cable Entry</option>
                <option value="BOTH">Top & Bottom Entry</option>
              </select>
            </div>
          </div>
        </div>

        {/* Physical Enclosure & Busbar Sizing Parameters */}
        <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800 pb-1">
            <Ruler className="w-4 h-4" />
            <span>Dimensions & Busbar Parameters</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Height (mm)</label>
              <input
                type="number"
                value={enclosureHeight}
                onChange={(e) => setEnclosureHeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Width (mm)</label>
              <input
                type="number"
                value={enclosureWidth}
                onChange={(e) => setEnclosureWidth(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Depth (mm)</label>
              <input
                type="number"
                value={enclosureDepth}
                onChange={(e) => setEnclosureDepth(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Columns / Tiers</label>
              <input
                type="number"
                min={1}
                max={12}
                value={numberOfColumns}
                onChange={(e) => setNumberOfColumns(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Current Density</label>
              <select
                value={busbarCurrentDensity}
                onChange={(e) => setBusbarCurrentDensity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value={1.2}>1.2 A/mm² (50°C high ambient)</option>
                <option value={1.5}>1.5 A/mm² (DEWA/IEC std)</option>
                <option value={1.8}>1.8 A/mm² (Ventilated)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{panelToEdit ? 'Save Panel' : 'Add Panel to Estimate'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
