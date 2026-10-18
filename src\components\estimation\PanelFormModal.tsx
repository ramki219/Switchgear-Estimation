import React, { useState, useEffect, useMemo } from 'react';
import { EstimatePanel, PanelType, CableEntryType, Component } from '../../types';
import { Modal } from '../common/Modal';
import { 
  Save, 
  Layers, 
  Cpu, 
  Shield, 
  Ruler, 
  Box, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  Building2, 
  Search,
  Sparkles,
  Sliders,
  Check,
  FileSpreadsheet,
  Zap,
  Hammer,
  Scale,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { storageService } from '../../services/storageService';
import { PanelSizeImportModal } from '../panels/PanelSizeImportModal';

interface PanelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (panelData: any) => void;
  panelToEdit?: EstimatePanel | null;
  projectID: number;
  panelTypes: PanelType[];
  components?: Component[];
}

export const PanelFormModal: React.FC<PanelFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  panelToEdit,
  projectID,
  panelTypes,
  components: propComponents,
}) => {
  // Classification
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

  // Copper Busbar Parameters (Total Length x Density based on Dimensions x Copper Price + Labour Charges)
  const [busbarWidthMm, setBusbarWidthMm] = useState<number>(80);
  const [busbarThicknessMm, setBusbarThicknessMm] = useState<number>(10);
  const [busbarRunsPerPhase, setBusbarRunsPerPhase] = useState<number>(2);
  const [busbarPhasesCount, setBusbarPhasesCount] = useState<number>(4); // 4 conductors: 3P+N (or 5 for 3P+N+PE)
  const [busbarTotalLengthMeters, setBusbarTotalLengthMeters] = useState<number>(5.5);
  const [copperDensityKgDm3, setCopperDensityKgDm3] = useState<number>(0.00896);
  const [busbarLabourHours, setBusbarLabourHours] = useState<number>(6.0);
  const [busbarLabourRatePerHour, setBusbarLabourRatePerHour] = useState<number>(85.0);
  const [busbarLabourCost, setBusbarLabourCost] = useState<number>(510.0);
  const [isManualLabourCost, setIsManualLabourCost] = useState<boolean>(false);
  const [busbarHardwareCost, setBusbarHardwareCost] = useState<number>(0);
  const [isCustomBusbarCost, setIsCustomBusbarCost] = useState<boolean>(false);
  const [customBusbarCost, setCustomBusbarCost] = useState<number>(0);

  // Enclosure Sizing Parameters
  const [enclosureHeight, setEnclosureHeight] = useState(2100);
  const [enclosureWidth, setEnclosureWidth] = useState(2400);
  const [enclosureDepth, setEnclosureDepth] = useState(800);
  const [numberOfColumns, setNumberOfColumns] = useState(3);
  const [sheetMetalThickness, setSheetMetalThickness] = useState(2.0);

  // Enclosure Catalogue & Brand Selection
  const [enclosureMode, setEnclosureMode] = useState<'CATALOGUE' | 'CUSTOM'>('CATALOGUE');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [enclosureSearch, setEnclosureSearch] = useState<string>('');
  const [selectedEnclosureId, setSelectedEnclosureId] = useState<number | null>(null);
  const [enclosureBrand, setEnclosureBrand] = useState<string>('');
  const [enclosureModel, setEnclosureModel] = useState<string>('');
  const [enclosurePartNumber, setEnclosurePartNumber] = useState<string>('');
  
  // Pricing Strategy: Use Database Listed Price vs Custom Price
  const [isCustomPrice, setIsCustomPrice] = useState<boolean>(false);
  const [cataloguePrice, setCataloguePrice] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<number>(0);

  // Excel / CSV Panel Size Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [localComponents, setLocalComponents] = useState<Component[] | null>(null);

  // Load components from prop or storageService
  const allComponents = useMemo(() => {
    if (localComponents && localComponents.length > 0) {
      return localComponents;
    }
    if (propComponents && propComponents.length > 0) {
      return propComponents;
    }
    return storageService.getComponents();
  }, [propComponents, localComponents, isOpen]);

  // Filter enclosure components (category 11 or isEnclosureSize)
  const enclosureCatalogue = useMemo(() => {
    return allComponents.filter(c => 
      c.categoryID === 11 || 
      c.isEnclosureSize || 
      c.categoryName?.toLowerCase().includes('enclosure') ||
      c.componentCode.startsWith('CMP-ENC-')
    );
  }, [allComponents]);

  // Filtered by brand and search
  const filteredEnclosures = useMemo(() => {
    return enclosureCatalogue.filter(enc => {
      // Brand Filter
      if (selectedBrandFilter !== 'ALL') {
        const brandMatch = 
          enc.manufacturerCode?.toUpperCase() === selectedBrandFilter ||
          enc.manufacturerName?.toUpperCase().includes(selectedBrandFilter);
        if (!brandMatch) return false;
      }

      // Search term
      if (enclosureSearch.trim()) {
        const term = enclosureSearch.toLowerCase();
        const matches = 
          enc.componentName.toLowerCase().includes(term) ||
          enc.partNumber.toLowerCase().includes(term) ||
          enc.model?.toLowerCase().includes(term) ||
          enc.manufacturerName?.toLowerCase().includes(term) ||
          `${enc.enclosureHeight}x${enc.enclosureWidth}`.includes(term) ||
          `${enc.ratedCurrent}a`.includes(term);
        if (!matches) return false;
      }

      return true;
    });
  }, [enclosureCatalogue, selectedBrandFilter, enclosureSearch]);

  // Preset configuration handler when panel category changes
  const handleTypeChange = (typeCode: string) => {
    setPanelTypeCode(typeCode);
    if (typeCode === 'MDB') {
      setPanelTag('MDB-01');
      setPanelName('Main Distribution Board 2500A (Form 4b)');
      setIncomerRating(2500);
      setShortCircuitRating(65);
      setFormOfSeparation('Form 4b Type 6');
      setIpRating('IP42');
      // Look for a suitable MDB enclosure in catalogue (e.g. Alfanar Prominence or ABB System pro E or RR)
      const defaultMDB = enclosureCatalogue.find(e => e.componentCode === 'CMP-ENC-MDB2500-ALF') || enclosureCatalogue[0];
      if (defaultMDB) {
        applyEnclosureFromCatalogue(defaultMDB);
      } else {
        setEnclosureWidth(3600);
        setEnclosureHeight(2200);
        setEnclosureDepth(1000);
        setNumberOfColumns(4);
      }
    } else if (typeCode === 'SMDB') {
      setPanelTag('SMDB-01');
      setPanelName('Sub-Main Distribution Board 400A (Form 2b)');
      setIncomerRating(400);
      setShortCircuitRating(36);
      setFormOfSeparation('Form 2b');
      setIpRating('IP54');
      const defaultSMDB = enclosureCatalogue.find(e => e.componentCode === 'CMP-ENC-SMDB400-RR' || e.componentCode === 'CMP-ENC-SMDB630-ALF');
      if (defaultSMDB) {
        applyEnclosureFromCatalogue(defaultSMDB);
      } else {
        setEnclosureWidth(1200);
        setEnclosureHeight(1800);
        setEnclosureDepth(400);
        setNumberOfColumns(1);
      }
    } else if (typeCode === 'APFC') {
      setPanelTag('APFC-01');
      setPanelName('Automatic Power Factor Correction Panel 400 kvar');
      setIncomerRating(800);
      setShortCircuitRating(50);
      setFormOfSeparation('Form 2b');
      setIpRating('IP42');
      const defaultAPFC = enclosureCatalogue.find(e => e.componentCode === 'CMP-ENC-APFC400-ALF' || e.componentCode === 'CMP-ENC-APFC600-RR');
      if (defaultAPFC) {
        applyEnclosureFromCatalogue(defaultAPFC);
      } else {
        setEnclosureWidth(1600);
        setEnclosureHeight(2100);
        setEnclosureDepth(800);
        setNumberOfColumns(2);
      }
    } else if (typeCode === 'MCC') {
      setPanelTag('MCC-01');
      setPanelName('Motor Control Center (Pumping Station)');
      setIncomerRating(1000);
      setShortCircuitRating(50);
      setFormOfSeparation('Form 4b Type 7');
      setIpRating('IP54');
      const defaultMCC = enclosureCatalogue.find(e => e.componentCode === 'CMP-ENC-MCC1600-ALF');
      if (defaultMCC) {
        applyEnclosureFromCatalogue(defaultMCC);
      } else {
        setEnclosureWidth(2800);
        setEnclosureHeight(2200);
        setEnclosureDepth(800);
        setNumberOfColumns(3);
      }
    } else if (typeCode === 'DB') {
      setPanelTag('DB-01');
      setPanelName('Final Distribution Board 160A');
      setIncomerRating(160);
      setShortCircuitRating(25);
      setFormOfSeparation('Form 2b');
      setIpRating('IP42');
      const defaultDB = enclosureCatalogue.find(e => e.componentCode === 'CMP-ENC-DB160-ALF' || e.componentCode === 'CMP-ENC-DB125-ABB');
      if (defaultDB) {
        applyEnclosureFromCatalogue(defaultDB);
      }
    } else if (typeCode === 'ATS') {
      setPanelTag('ATS-01');
      setPanelName('Automatic Transfer Switch Panel 400A 4P');
      setIncomerRating(400);
      setShortCircuitRating(36);
      setFormOfSeparation('Form 3b');
      setIpRating('IP54');
      setEnclosureWidth(1000);
      setEnclosureHeight(1800);
      setEnclosureDepth(400);
      setNumberOfColumns(1);
    } else if (typeCode === 'METER_CABINET') {
      setPanelTag('MTR-01');
      setPanelName('DEWA / Authority Meter Cabinet (Direct / CT Metering)');
      setIncomerRating(250);
      setShortCircuitRating(36);
      setFormOfSeparation('Form 2b');
      setIpRating('IP54');
      setBusbarWidthMm(50);
      setBusbarThicknessMm(10);
      setBusbarRunsPerPhase(1);
      setBusbarTotalLengthMeters(3.5);
      setEnclosureWidth(1000);
      setEnclosureHeight(1600);
      setEnclosureDepth(350);
      setNumberOfColumns(1);
    }
  };

  // Helper to apply enclosure from catalogue
  const applyEnclosureFromCatalogue = (enc: Component) => {
    setSelectedEnclosureId(enc.componentID);
    setEnclosureBrand(enc.manufacturerName || enc.manufacturerCode || 'Standard');
    setEnclosureModel(enc.model || enc.componentName);
    setEnclosurePartNumber(enc.partNumber);
    if (enc.enclosureHeight) setEnclosureHeight(enc.enclosureHeight);
    if (enc.enclosureWidth) setEnclosureWidth(enc.enclosureWidth);
    if (enc.enclosureDepth) setEnclosureDepth(enc.enclosureDepth);
    if (enc.columns) setNumberOfColumns(enc.columns);
    if (enc.formOfSeparation) setFormOfSeparation(enc.formOfSeparation);
    if (enc.ipRating) setIpRating(enc.ipRating);
    if (enc.sheetMetalThickness) setSheetMetalThickness(enc.sheetMetalThickness);

    // Database listed price
    const dbPrice = enc.currentPrice?.netPrice || 0;
    setCataloguePrice(dbPrice);
    if (!isCustomPrice) {
      setCustomPrice(dbPrice);
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
      // Busbar parameters per explicit engineering formula
      setBusbarCurrentDensity(panelToEdit.busbarCurrentDensity || 1.5);
      setCopperBaseRatePerKg(panelToEdit.copperBaseRatePerKg || 42.0);
      setBusbarWidthMm(panelToEdit.busbarWidthMm || (panelToEdit.incomerRating >= 2500 ? 100 : panelToEdit.incomerRating >= 1600 ? 80 : panelToEdit.incomerRating >= 630 ? 50 : 40));
      setBusbarThicknessMm(panelToEdit.busbarThicknessMm || 10);
      setBusbarRunsPerPhase(panelToEdit.busbarRunsPerPhase || (panelToEdit.incomerRating >= 3200 ? 4 : panelToEdit.incomerRating >= 2500 ? 3 : panelToEdit.incomerRating >= 1250 ? 2 : 1));
      setBusbarPhasesCount(panelToEdit.busbarPhasesCount || 4);
      setBusbarTotalLengthMeters(panelToEdit.busbarTotalLengthMeters || 5.5);
      const densityVal = panelToEdit.copperDensityKgDm3;
      setCopperDensityKgDm3(densityVal ? (densityVal > 0.1 ? Number((densityVal / 1000).toFixed(5)) : densityVal) : 0.00896);
      setBusbarLabourHours(panelToEdit.busbarLabourHours || 6.0);
      setBusbarLabourRatePerHour(panelToEdit.busbarLabourRatePerHour || 85.0);
      setBusbarLabourCost(panelToEdit.busbarLabourCost || 510.0);
      setBusbarHardwareCost(panelToEdit.busbarHardwareCost || 0);
      setIsCustomBusbarCost(Boolean(panelToEdit.isCustomBusbarCost));
      setCustomBusbarCost(panelToEdit.customBusbarCost || panelToEdit.copperCost || 0);

      setEnclosureHeight(panelToEdit.enclosureHeight);
      setEnclosureWidth(panelToEdit.enclosureWidth);
      setEnclosureDepth(panelToEdit.enclosureDepth);
      setNumberOfColumns(panelToEdit.numberOfColumns);
      setSheetMetalThickness(panelToEdit.sheetMetalThickness || 2.0);

      // Existing brand & pricing fields
      if (panelToEdit.enclosureSource === 'CUSTOM') {
        setEnclosureMode('CUSTOM');
      } else {
        setEnclosureMode('CATALOGUE');
      }

      setEnclosureBrand(panelToEdit.enclosureBrand || '');
      setEnclosureModel(panelToEdit.enclosureModel || '');
      setEnclosurePartNumber(panelToEdit.enclosurePartNumber || '');
      setSelectedEnclosureId(panelToEdit.enclosureComponentID || null);

      const isCustom = Boolean(panelToEdit.isCustomEnclosurePrice);
      setIsCustomPrice(isCustom);
      setCataloguePrice(panelToEdit.catalogueEnclosurePrice || panelToEdit.enclosureCost || 0);
      setCustomPrice(panelToEdit.customEnclosurePrice || panelToEdit.enclosureCost || 0);
    } else {
      handleTypeChange('MDB');
    }
  }, [panelToEdit, isOpen]);

  // Sizing presets helper
  const applyBusbarPreset = (w: number, t: number, runs: number) => {
    setBusbarWidthMm(w);
    setBusbarThicknessMm(t);
    setBusbarRunsPerPhase(runs);
  };

  // Auto-estimate busbar run length based on enclosure envelope
  const autoCalculateBusbarLength = () => {
    const horizontalRunM = (enclosureWidth / 1000) * 1.15;
    const verticalRunPerColumnM = (enclosureHeight / 1000) * 0.65;
    const totalVerticalRunM = numberOfColumns * verticalRunPerColumnM;
    const incomerDropsM = (enclosureHeight / 1000) * 0.8;
    const calculatedLength = Number((horizontalRunM + totalVerticalRunM + incomerDropsM).toFixed(2));
    setBusbarTotalLengthMeters(calculatedLength);
  };

  // Derived live busbar calculations for UI and instant feedback
  const liveBusbarCalc = useMemo(() => {
    // 1. Single bar weight per linear meter (kg/meter) = Width(mm) * Thickness(mm) * Density(0.00896)
    const densityFactor = copperDensityKgDm3 < 0.1 ? copperDensityKgDm3 : copperDensityKgDm3 / 1000;
    const singleBarWeightKgM = Number((busbarWidthMm * busbarThicknessMm * densityFactor).toFixed(4));
    
    // 2. Busbar system weight per meter across runs and conductors (kg/m)
    const systemWeightKgM = Number((singleBarWeightKgM * busbarRunsPerPhase * busbarPhasesCount).toFixed(3));
    
    // 3. Total Copper Weight in kg = Total Length Used (m) * systemWeightKgM
    const totalWeightKg = Number((busbarTotalLengthMeters * systemWeightKgM).toFixed(2));
    
    // 4. Raw Copper Material Cost = Total Weight (kg) * Current Copper Price (AED/kg)
    const materialCost = Number((totalWeightKg * copperBaseRatePerKg).toFixed(2));
    
    // 5. Labour Charges (AED)
    const calculatedLabourCharges = Number((busbarLabourHours * busbarLabourRatePerHour).toFixed(2));
    const labourCharges = isManualLabourCost && busbarLabourCost !== undefined && busbarLabourCost >= 0
      ? Number(busbarLabourCost) 
      : calculatedLabourCharges;
    
    // 6. Hardware & Insulation (12% of material)
    const hardware = Number(busbarHardwareCost !== undefined && busbarHardwareCost > 0 
      ? busbarHardwareCost 
      : (materialCost * 0.12).toFixed(2));
    
    // 7. Formula Total Cost
    const formulaTotal = Number((materialCost + labourCharges + hardware).toFixed(2));
    
    // 8. Final Busbar Cost (checks for custom override)
    const finalBusbarCost = isCustomBusbarCost && customBusbarCost > 0 
      ? Number(customBusbarCost.toFixed(2)) 
      : formulaTotal;
    
    return {
      singleBarWeightKgM,
      systemWeightKgM,
      totalWeightKg,
      materialCost,
      calculatedLabourCharges,
      labourCharges,
      hardware,
      formulaTotal,
      finalBusbarCost,
    };
  }, [
    busbarWidthMm,
    busbarThicknessMm,
    busbarRunsPerPhase,
    busbarPhasesCount,
    busbarTotalLengthMeters,
    copperDensityKgDm3,
    copperBaseRatePerKg,
    busbarLabourHours,
    busbarLabourRatePerHour,
    busbarLabourCost,
    isManualLabourCost,
    busbarHardwareCost,
    isCustomBusbarCost,
    customBusbarCost,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeObj = panelTypes.find(t => t.panelTypeCode === panelTypeCode);

    // Final Enclosure cost calculation
    let finalEnclosureCost = 0;
    if (enclosureMode === 'CATALOGUE') {
      if (isCustomPrice && customPrice > 0) {
        finalEnclosureCost = Number(customPrice);
      } else {
        finalEnclosureCost = Number(cataloguePrice);
      }
    } else {
      if (isCustomPrice && customPrice > 0) {
        finalEnclosureCost = Number(customPrice);
      } else {
        // Will be calculated by engineeringCalculator in storageService
        finalEnclosureCost = 0;
      }
    }

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

      // Busbar parameters per user's explicit formula
      busbarCurrentDensity: Number(busbarCurrentDensity),
      busbarWidthMm: Number(busbarWidthMm),
      busbarThicknessMm: Number(busbarThicknessMm),
      busbarRunsPerPhase: Number(busbarRunsPerPhase),
      busbarPhasesCount: Number(busbarPhasesCount),
      busbarTotalLengthMeters: Number(busbarTotalLengthMeters),
      copperDensityKgDm3: Number(copperDensityKgDm3),
      copperCrossSectionMm2: Number(busbarWidthMm * busbarThicknessMm * busbarRunsPerPhase),
      copperWeightKg: liveBusbarCalc.totalWeightKg,
      copperBaseRatePerKg: Number(copperBaseRatePerKg),
      copperMaterialCost: liveBusbarCalc.materialCost,
      busbarLabourHours: Number(busbarLabourHours),
      busbarLabourRatePerHour: Number(busbarLabourRatePerHour),
      busbarLabourCost: liveBusbarCalc.labourCharges,
      busbarHardwareCost: liveBusbarCalc.hardware,
      isCustomBusbarCost,
      customBusbarCost: Number(customBusbarCost),
      copperCost: liveBusbarCalc.finalBusbarCost,

      enclosureHeight: Number(enclosureHeight),
      enclosureWidth: Number(enclosureWidth),
      enclosureDepth: Number(enclosureDepth),
      numberOfColumns: Number(numberOfColumns),
      sheetMetalThickness: Number(sheetMetalThickness),
      enclosureCost: finalEnclosureCost,
      
      // Brand catalogue and custom price properties
      enclosureSource: enclosureMode,
      enclosureBrand: enclosureBrand.trim(),
      enclosureModel: enclosureModel.trim(),
      enclosurePartNumber: enclosurePartNumber.trim(),
      enclosureComponentID: selectedEnclosureId || undefined,
      isCustomEnclosurePrice: isCustomPrice,
      customEnclosurePrice: isCustomPrice ? Number(customPrice) : undefined,
      catalogueEnclosurePrice: Number(cataloguePrice),
      items: panelToEdit?.items || [],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={panelToEdit ? `Configure Switchboard: ${panelToEdit.panelTag}` : 'Add Switchboard Panel to Project'}
      subtitle="Select brand enclosure sizes from database catalog (Alfanar, RR, ABB, Schneider) with exact listed price or custom price override"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-slate-800">
        {/* Panel Classification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Panel Category *</label>
            <select
              value={panelTypeCode}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:border-cyan-600 focus:outline-none"
            >
              <option value="MDB">MDB - Main Distribution Board</option>
              <option value="SMDB">SMDB - Sub-Main Distribution Board</option>
              <option value="METER_CABINET">METER CABINET - Utility Metering Cabinet (DEWA / SEWA / ADDC)</option>
              <option value="APFC">APFC - Capacitor Bank (PF Correction)</option>
              <option value="MCC">MCC - Motor Control Center</option>
              <option value="ATS">ATS - Automatic Transfer Switch</option>
              <option value="DB">DB - Final Distribution Board</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Panel Tag / Label *</label>
            <input
              type="text"
              required
              value={panelTag}
              onChange={(e) => setPanelTag(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:border-cyan-600 focus:outline-none"
              placeholder="e.g. MDB-01"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Incomer Rating (Amperes) *</label>
            <select
              value={incomerRating}
              onChange={(e) => setIncomerRating(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-cyan-800 font-bold focus:border-cyan-600 focus:outline-none"
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
          <label className="block text-slate-700 font-semibold mb-1">Panel Engineering Description *</label>
          <input
            type="text"
            required
            value={panelName}
            onChange={(e) => setPanelName(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
            placeholder="e.g. Main Distribution Board 2500A 415V Form 4b Type 6 IP42"
          />
        </div>

        {/* ========================================================================= */}
        {/* ENCLOSURE SIZING & BRAND DATABASE SELECTION */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-blue-50/60 to-cyan-50/50 p-4 rounded-xl border border-blue-200/80 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-700" />
              <span className="font-bold text-slate-900 text-sm">
                Enclosure Sizing & Brand Database
              </span>
              <Badge variant="blue" size="sm">Brand Catalog & Prices</Badge>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setEnclosureMode('CATALOGUE')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  enclosureMode === 'CATALOGUE'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>From Brand Catalogue</span>
              </button>
              <button
                type="button"
                onClick={() => setEnclosureMode('CUSTOM')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  enclosureMode === 'CUSTOM'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Custom Sizing Formula</span>
              </button>
            </div>
          </div>

          {enclosureMode === 'CATALOGUE' ? (
            <div className="space-y-3">
              {/* Brand Filter Pills & Import button */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-600 mr-1">Brand:</span>
                  {[
                    { code: 'ALL', label: 'All Brands' },
                    { code: 'ALFANAR', label: 'Alfanar' },
                    { code: 'RR', label: 'RR Global / Switchgear' },
                    { code: 'ABB', label: 'ABB' },
                    { code: 'SCHNEIDER', label: 'Schneider' },
                    { code: 'SIEMENS', label: 'Siemens' },
                    { code: 'RITTAL', label: 'Rittal' },
                  ].map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => setSelectedBrandFilter(b.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        selectedBrandFilter === b.code
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-2xs"
                  title="Import brand panel enclosure sizes with database prices from Excel or CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Import Sizes (Excel/CSV)</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={enclosureSearch}
                  onChange={(e) => setEnclosureSearch(e.target.value)}
                  placeholder="Filter existing panel sizes by model, rating (e.g. 2500A, 400A), dimensions or part number..."
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 placeholder:text-slate-400 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Enclosure Options List */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 bg-white/80 rounded-xl p-2">
                {filteredEnclosures.length > 0 ? (
                  filteredEnclosures.map((enc) => {
                    const isSelected = selectedEnclosureId === enc.componentID;
                    const listedPrice = enc.currentPrice?.netPrice || 0;
                    return (
                      <div
                        key={enc.componentID}
                        onClick={() => applyEnclosureFromCatalogue(enc)}
                        className={`p-2.5 rounded-lg border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-2xs ring-1 ring-blue-400'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{enc.componentName}</span>
                            <span className="px-1.5 py-0.2 text-[10px] bg-slate-100 text-slate-700 rounded border border-slate-200 font-bold">
                              {enc.manufacturerCode || enc.manufacturerName}
                            </span>
                            {enc.ratedCurrent && (
                              <span className="px-1.5 py-0.2 text-[10px] bg-blue-100 text-blue-800 rounded font-bold">
                                {enc.ratedCurrent}A
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                            <span>Part: <strong className="text-slate-700">{enc.partNumber}</strong></span>
                            <span>|</span>
                            <span>Dimensions: <strong className="text-slate-700">{enc.enclosureHeight}H × {enc.enclosureWidth}W × {enc.enclosureDepth}D mm</strong></span>
                            <span>|</span>
                            <span>Columns: <strong className="text-slate-700">{enc.columns || 1}</strong></span>
                            <span>|</span>
                            <span>Form: <strong className="text-purple-700">{enc.formOfSeparation}</strong></span>
                            <span>|</span>
                            <span>Protection: <strong className="text-cyan-700">{enc.ipRating}</strong></span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                          <span className="text-[10px] text-slate-500">Database Listed Price:</span>
                          <span className="font-bold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {listedPrice.toLocaleString()} AED
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-slate-500 text-xs">
                    No enclosures match "{enclosureSearch}" in the selected brand.
                  </div>
                )}
              </div>

              {/* Price Selection Strategy: Use Database Listed Price vs Custom Price */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Enclosure Pricing Method:</span>
                  </div>
                  {enclosureBrand && (
                    <span className="text-[11px] text-slate-500">
                      Selected: <strong className="text-slate-900">{enclosureBrand}</strong> ({enclosureModel})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Use Database Listed Price */}
                  <label
                    onClick={() => {
                      setIsCustomPrice(false);
                      setCustomPrice(cataloguePrice);
                    }}
                    className={`p-3 rounded-lg border transition cursor-pointer flex items-start gap-2.5 ${
                      !isCustomPrice
                        ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-400'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricingStrategy"
                      checked={!isCustomPrice}
                      onChange={() => {
                        setIsCustomPrice(false);
                        setCustomPrice(cataloguePrice);
                      }}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>Use Same Price as Listed in Database</span>
                        <Badge variant="emerald" size="sm">Standard</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Uses exact vendor quotation rate from database component pricing.
                      </p>
                      <div className="mt-1.5 text-sm font-bold text-emerald-700">
                        {cataloguePrice.toLocaleString()} AED
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Custom Price Override */}
                  <label
                    onClick={() => setIsCustomPrice(true)}
                    className={`p-3 rounded-lg border transition cursor-pointer flex items-start gap-2.5 ${
                      isCustomPrice
                        ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricingStrategy"
                      checked={isCustomPrice}
                      onChange={() => setIsCustomPrice(true)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="w-full">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>Custom Price Override</span>
                        <Badge variant="warning" size="sm">Negotiated</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Specify negotiated rate or factory contract price for this panel.
                      </p>
                      {isCustomPrice && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            step={50}
                            value={customPrice}
                            onChange={(e) => setCustomPrice(Number(e.target.value))}
                            className="w-36 bg-white border border-amber-400 rounded-md px-2 py-1 text-slate-900 font-bold text-xs focus:outline-none"
                            placeholder="Amount in AED"
                          />
                          <span className="text-xs font-bold text-slate-700">AED</span>
                          {cataloguePrice > 0 && customPrice > 0 && (
                            <span className={`text-[10px] font-bold ${
                              customPrice < cataloguePrice ? 'text-emerald-600' : 'text-amber-700'
                            }`}>
                              ({customPrice < cataloguePrice ? 'Save ' : '+'}{Math.abs(customPrice - cataloguePrice).toLocaleString()} AED)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Custom Dimensions & Sheet Metal Pricing:</span>
                <span className="text-[11px] text-slate-500">Calculated via structural steel kg + CNC cutting rate</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isCustomPrice}
                    onChange={(e) => setIsCustomPrice(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700">Override calculated cost with custom fixed price</span>
                </label>

                {isCustomPrice && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-32 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                      placeholder="Custom AED"
                    />
                    <span className="text-xs text-slate-600 font-bold">AED</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Technical Ratings */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-cyan-800 font-bold border-b border-slate-200 pb-2">
            <Cpu className="w-4 h-4 text-cyan-600" />
            <span>IEC 61439 Technical Ratings</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 mb-1">Short Circuit Icu/Icw *</label>
              <select
                value={shortCircuitRating}
                onChange={(e) => setShortCircuitRating(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
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
              <label className="block text-slate-600 mb-1">Internal Separation *</label>
              <select
                value={formOfSeparation}
                onChange={(e) => setFormOfSeparation(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
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
              <label className="block text-slate-600 mb-1">Ingress Protection *</label>
              <select
                value={ipRating}
                onChange={(e) => setIpRating(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
              >
                <option value="IP31">IP31 (Standard indoor)</option>
                <option value="IP42">IP42 (DEWA standard indoor)</option>
                <option value="IP54">IP54 (Dust & splash proof)</option>
                <option value="IP55">IP55 (Heavy industrial)</option>
                <option value="IP65">IP65 (Outdoor weatherproof)</option>
                <option value="IP66">IP66 (Heavy washdown)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Cable Entry *</label>
              <select
                value={cableEntry}
                onChange={(e) => setCableEntry(e.target.value as CableEntryType)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
              >
                <option value="BOTTOM">Bottom Cable Entry</option>
                <option value="TOP">Top Cable Entry</option>
                <option value="BOTH">Top & Bottom Entry</option>
              </select>
            </div>
          </div>
        </div>

        {/* Physical Enclosure Dimensions */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200 pb-2">
            <Ruler className="w-4 h-4 text-cyan-600" />
            <span>Enclosure Physical Dimensions</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Height (mm) *</label>
              <input
                type="number"
                value={enclosureHeight}
                onChange={(e) => setEnclosureHeight(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Width (mm) *</label>
              <input
                type="number"
                value={enclosureWidth}
                onChange={(e) => setEnclosureWidth(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Depth (mm) *</label>
              <input
                type="number"
                value={enclosureDepth}
                onChange={(e) => setEnclosureDepth(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Columns / Tiers *</label>
              <input
                type="number"
                min={1}
                max={12}
                value={numberOfColumns}
                onChange={(e) => setNumberOfColumns(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Copper Busbar Calculation & Fabrication Labour Section (Manually Changeable) */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-300 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-2xs">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  Copper Busbar & Fabrication Labour Calculation
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    IEC 61439-1/2
                  </span>
                </span>
                <p className="text-[11px] text-amber-800">
                  Total Length Used × Density based on Dimensions × Applied Copper Price = Cost of Busbar + Labour Provision
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Badge variant="amber" size="sm">
                {liveBusbarCalc.totalWeightKg.toLocaleString()} kg Cu
              </Badge>
              <div className="bg-amber-800 text-white font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                {liveBusbarCalc.finalBusbarCost.toLocaleString()} AED
              </div>
            </div>
          </div>

          {/* Quick Presets based on Incomer Rating */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] bg-white/80 p-2 rounded-lg border border-amber-200">
            <span className="font-bold text-amber-900 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Standard Presets:
            </span>
            <button
              type="button"
              onClick={() => applyBusbarPreset(40, 10, 1)}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded border border-amber-300 transition"
            >
              400A (40×10×1)
            </button>
            <button
              type="button"
              onClick={() => applyBusbarPreset(50, 10, 2)}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded border border-amber-300 transition"
            >
              800A (50×10×2)
            </button>
            <button
              type="button"
              onClick={() => applyBusbarPreset(80, 10, 2)}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded border border-amber-300 transition"
            >
              1600A (80×10×2)
            </button>
            <button
              type="button"
              onClick={() => applyBusbarPreset(100, 10, 2)}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded border border-amber-300 transition"
            >
              2500A (100×10×2)
            </button>
            <button
              type="button"
              onClick={() => applyBusbarPreset(100, 10, 3)}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded border border-amber-300 transition"
            >
              3200A (100×10×3)
            </button>
            <button
              type="button"
              onClick={() => applyBusbarPreset(100, 10, 4)}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded border border-amber-300 transition"
            >
              4000A (100×10×4)
            </button>
          </div>

          {/* Row 1: Dimensions & Conductor Arrangement */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Width (mm) *
              </label>
              <input
                type="number"
                min={10}
                max={200}
                step={5}
                value={busbarWidthMm}
                onChange={(e) => setBusbarWidthMm(Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">e.g. 40, 50, 80, 100</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Thickness (mm) *
              </label>
              <input
                type="number"
                min={2}
                max={25}
                step={1}
                value={busbarThicknessMm}
                onChange={(e) => setBusbarThicknessMm(Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">e.g. 5, 10 mm</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Runs per Phase *
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={busbarRunsPerPhase}
                onChange={(e) => setBusbarRunsPerPhase(Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">1 to 4 bars/phase</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Conductors Count *
              </label>
              <select
                value={busbarPhasesCount}
                onChange={(e) => setBusbarPhasesCount(Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
              >
                <option value={4}>4 Conductors (3P + 100% N)</option>
                <option value={5}>5 Conductors (3P + N + 50% PE)</option>
                <option value={3}>3 Conductors (3P only)</option>
              </select>
              <span className="text-[10px] text-slate-500">Conductors in busway</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Current Density
              </label>
              <select
                value={busbarCurrentDensity}
                onChange={(e) => setBusbarCurrentDensity(Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
              >
                <option value={1.2}>1.2 A/mm² (50°C)</option>
                <option value={1.5}>1.5 A/mm² (Std)</option>
                <option value={1.8}>1.8 A/mm² (Vent)</option>
              </select>
              <span className="text-[10px] text-amber-700 font-semibold">
                Area: {busbarWidthMm * busbarThicknessMm * busbarRunsPerPhase} mm²
              </span>
            </div>
          </div>

          {/* Row 2: Length Used, Density, and Current Copper Price (Manually Applied) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-amber-100/50 p-3 rounded-xl border border-amber-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-800 font-bold">
                  Total Length Used Per Panel (m) *
                </label>
                <button
                  type="button"
                  onClick={autoCalculateBusbarLength}
                  className="text-[11px] text-cyan-800 hover:text-cyan-900 font-bold flex items-center gap-1 underline cursor-pointer"
                  title="Auto-estimate from panel width + column droppers + incomer drop"
                >
                  <RefreshCw className="w-3 h-3" />
                  Auto-Estimate
                </button>
              </div>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={busbarTotalLengthMeters}
                onChange={(e) => setBusbarTotalLengthMeters(Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Horizontal main busbar + vertical dropper runs per column
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-800 font-bold">
                  Copper Density (kg/meter) *
                </label>
                {copperDensityKgDm3 !== 0.00896 && (
                  <button
                    type="button"
                    onClick={() => setCopperDensityKgDm3(0.00896)}
                    className="text-[10px] text-cyan-800 underline font-semibold hover:text-cyan-900"
                    title="Reset to 0.00896"
                  >
                    Set 0.00896
                  </button>
                )}
              </div>
              <input
                type="number"
                min={0.00001}
                step="any"
                value={copperDensityKgDm3}
                onChange={(e) => setCopperDensityKgDm3(Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Standard Cu-ETP 99.9% purity = 0.00896 kg/meter
              </span>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Current Copper Price (AED/kg) *
              </label>
              <input
                type="number"
                min={10}
                step={0.5}
                value={copperBaseRatePerKg}
                onChange={(e) => setCopperBaseRatePerKg(Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-amber-900 font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
              <div className="flex items-center gap-1 mt-1 text-[10px]">
                <span className="text-slate-500">Quick:</span>
                {[38, 40, 42, 45, 48, 50].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setCopperBaseRatePerKg(rate)}
                    className={`px-1.5 py-0.2 rounded border transition ${
                      copperBaseRatePerKg === rate
                        ? 'bg-amber-600 text-white border-amber-700 font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {rate}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Provision for Labour Charges & Hardware */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-white/90 p-3 rounded-xl border border-amber-200">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Labour Hours (hrs)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={busbarLabourHours}
                onChange={(e) => {
                  const hrs = Number(e.target.value);
                  setBusbarLabourHours(hrs);
                  if (!isManualLabourCost) {
                    setBusbarLabourCost(Number((hrs * busbarLabourRatePerHour).toFixed(2)));
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Cutting, punching & bending</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Technician Rate (AED/hr)
              </label>
              <input
                type="number"
                min={0}
                step={5}
                value={busbarLabourRatePerHour}
                onChange={(e) => {
                  const rate = Number(e.target.value);
                  setBusbarLabourRatePerHour(rate);
                  if (!isManualLabourCost) {
                    setBusbarLabourCost(Number((busbarLabourHours * rate).toFixed(2)));
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">UAE switchgear technician standard</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-800 font-bold">
                  Labour Charges (AED) *
                </label>
                {isManualLabourCost && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualLabourCost(false);
                      setBusbarLabourCost(Number((busbarLabourHours * busbarLabourRatePerHour).toFixed(2)));
                    }}
                    className="text-[10px] text-cyan-700 hover:text-cyan-900 font-semibold underline"
                    title="Reset to Hours × Rate calculation"
                  >
                    Reset to Calc
                  </button>
                )}
              </div>
              <input
                type="number"
                min={0}
                step={10}
                value={isManualLabourCost ? busbarLabourCost : liveBusbarCalc.labourCharges}
                onChange={(e) => {
                  setIsManualLabourCost(true);
                  setBusbarLabourCost(Number(e.target.value));
                }}
                className={`w-full border rounded-lg px-2.5 py-1.5 font-bold focus:outline-none ${
                  isManualLabourCost 
                    ? 'bg-amber-50 border-amber-400 text-amber-950 focus:border-amber-600'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                }`}
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {isManualLabourCost ? 'Manual labour charge applied' : `Calculated: ${busbarLabourHours} hrs × ${busbarLabourRatePerHour} AED/hr`}
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Hardware & Sleeving (AED)
              </label>
              <input
                type="number"
                min={0}
                step={25}
                value={busbarHardwareCost > 0 ? busbarHardwareCost : liveBusbarCalc.hardware}
                onChange={(e) => setBusbarHardwareCost(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">SMC supports & heat-shrink (12% std)</span>
            </div>
          </div>

          {/* Mathematical Step-by-Step Live Result Card */}
          <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-amber-50 p-3.5 rounded-xl border border-amber-800 text-xs shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-amber-300 border-b border-amber-800 pb-1.5">
              <span className="font-bold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                Live Engineering Formula Breakdown
              </span>
              <span>Density = {copperDensityKgDm3} kg/meter</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-amber-950/60 p-2 rounded border border-amber-800/80">
                <span className="text-amber-300 block text-[10px]">1. Single Bar Density:</span>
                <span className="font-bold text-white text-xs">
                  {liveBusbarCalc.singleBarWeightKgM} kg/meter
                </span>
                <span className="text-[9px] text-amber-400 block">
                  ({busbarWidthMm}×{busbarThicknessMm} mm)
                </span>
              </div>

              <div className="bg-amber-950/60 p-2 rounded border border-amber-800/80">
                <span className="text-amber-300 block text-[10px]">2. System Density per Meter:</span>
                <span className="font-bold text-white text-xs">
                  {liveBusbarCalc.systemWeightKgM} kg/meter
                </span>
                <span className="text-[9px] text-amber-400 block">
                  ({busbarRunsPerPhase} runs × {busbarPhasesCount} cond)
                </span>
              </div>

              <div className="bg-amber-950/60 p-2 rounded border border-amber-800/80">
                <span className="text-amber-300 block text-[10px]">3. Total Copper Weight:</span>
                <span className="font-bold text-amber-200 text-xs">
                  {liveBusbarCalc.totalWeightKg} kg
                </span>
                <span className="text-[9px] text-amber-400 block">
                  ({busbarTotalLengthMeters} m length used)
                </span>
              </div>

              <div className="bg-amber-950/60 p-2 rounded border border-amber-800/80">
                <span className="text-amber-300 block text-[10px]">4. Raw Copper Material Cost:</span>
                <span className="font-bold text-amber-200 text-xs">
                  {liveBusbarCalc.materialCost.toLocaleString()} AED
                </span>
                <span className="text-[9px] text-amber-400 block">
                  ({liveBusbarCalc.totalWeightKg} kg × {copperBaseRatePerKg} AED)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-2 border-t border-amber-800/80 gap-2">
              <div className="text-[11px] text-amber-200 space-x-3">
                <span>Material: <strong>{liveBusbarCalc.materialCost.toLocaleString()} AED</strong></span>
                <span>+ Labour: <strong>{liveBusbarCalc.labourCharges.toLocaleString()} AED</strong></span>
                <span>+ Hardware: <strong>{liveBusbarCalc.hardware.toLocaleString()} AED</strong></span>
              </div>

              <div className="text-right">
                <span className="text-amber-300 text-[11px] mr-2">Total Busbar Cost:</span>
                <span className="text-base font-extrabold text-amber-100">
                  {liveBusbarCalc.finalBusbarCost.toLocaleString()} AED
                </span>
              </div>
            </div>

            {/* Optional Custom Busbar Override */}
            <div className="pt-2 border-t border-amber-800/60 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-amber-300">
                <input
                  type="checkbox"
                  checked={isCustomBusbarCost}
                  onChange={(e) => {
                    setIsCustomBusbarCost(e.target.checked);
                    if (e.target.checked && customBusbarCost === 0) {
                      setCustomBusbarCost(liveBusbarCalc.formulaTotal);
                    }
                  }}
                  className="rounded border-amber-400 text-amber-600 focus:ring-0"
                />
                <span>Override with negotiated custom lumpsum busbar cost</span>
              </label>

              {isCustomBusbarCost && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-amber-300 font-semibold">Custom AED:</span>
                  <input
                    type="number"
                    value={customBusbarCost}
                    onChange={(e) => setCustomBusbarCost(Number(e.target.value))}
                    className="w-28 bg-white text-slate-900 font-bold px-2 py-1 rounded text-xs focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Total Cost Summary Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-slate-200 gap-3">
          <div className="text-xs space-y-0.5">
            <div className="text-slate-600 flex items-center gap-3">
              <span>
                Enclosure: <strong className="text-blue-800 font-bold">{(isCustomPrice ? customPrice : cataloguePrice).toLocaleString()} AED</strong>
              </span>
              <span>+</span>
              <span>
                Copper Busbars: <strong className="text-amber-700 font-bold">{liveBusbarCalc.finalBusbarCost.toLocaleString()} AED</strong>
              </span>
              <span>=</span>
              <span>
                Base Panel Cost: <strong className="text-emerald-700 text-sm font-black">{((isCustomPrice ? customPrice : cataloguePrice) + liveBusbarCalc.finalBusbarCost).toLocaleString()} AED</strong>
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              * Feeder equipment & breakers added in next step will add to total panel quotation.
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold transition shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg flex items-center gap-2 transition shadow-2xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{panelToEdit ? 'Save Panel Configuration' : 'Add Panel to Estimate'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Brand Panel Sizes Excel / CSV Bulk Import Modal */}
      <PanelSizeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        manufacturers={storageService.getManufacturers()}
        panelTypes={panelTypes}
        suppliers={storageService.getSuppliers()}
        existingComponents={allComponents}
        onImportSuccess={() => {
          const fresh = storageService.getComponents();
          setLocalComponents(fresh);
        }}
      />
    </Modal>
  );
};
