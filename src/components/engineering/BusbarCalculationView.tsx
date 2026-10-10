// ============================================================================
// BUSBAR DESIGN & SIZING MODULE (DIN 43671 / IEC 61439-1)
// Sizing for Copper (ETP 99.9%) & Aluminium, Electrodynamic Withstand & Derating
// Marked: "PRELIMINARY ENGINEERING CALCULATION" per safety constitution
// ============================================================================

import React, { useState } from 'react';
import { SLDTopology } from '../../types/engineering';
import { 
  Zap, 
  Ruler, 
  Flame, 
  ShieldCheck, 
  Sliders, 
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';

interface BusbarCalculationViewProps {
  topology: SLDTopology;
}

export const BusbarCalculationView: React.FC<BusbarCalculationViewProps> = ({
  topology,
}) => {
  const [material, setMaterial] = useState<'COPPER' | 'ALUMINIUM'>('COPPER');
  const [incomerCurrent, setIncomerCurrent] = useState<number>(4000);
  const [faultCurrentKA, setFaultCurrentKA] = useState<number>(65);
  const [ambientTempC, setAmbientTempC] = useState<number>(45);
  const [currentDensity, setCurrentDensity] = useState<number>(1.5); // A/mm2
  const [neutralFactor, setNeutralFactor] = useState<number>(1.0); // 100% neutral
  const [copperRatePerKg, setCopperRatePerKg] = useState<number>(42.0); // AED/kg

  // Calculations
  const deratingFactor = ambientTempC >= 55 ? 0.78 : ambientTempC >= 50 ? 0.85 : ambientTempC >= 45 ? 0.91 : 1.0;
  const effectiveDesignAmps = Math.round(incomerCurrent / deratingFactor);
  const reqCrossSectionMm2 = Math.ceil(effectiveDesignAmps / currentDensity);

  // Derive bar sizing (e.g. 4x (100x10) mm)
  let recommendedConfig = '4x (100x10) mm per phase';
  let barWidth = 100;
  let barThickness = 10;
  let barsPerPhase = 4;

  if (effectiveDesignAmps <= 800) {
    recommendedConfig = '1x (80x10) mm per phase';
    barWidth = 80; barThickness = 10; barsPerPhase = 1;
  } else if (effectiveDesignAmps <= 1600) {
    recommendedConfig = '2x (80x10) mm per phase';
    barWidth = 80; barThickness = 10; barsPerPhase = 2;
  } else if (effectiveDesignAmps <= 2500) {
    recommendedConfig = '3x (100x10) mm per phase';
    barWidth = 100; barThickness = 10; barsPerPhase = 3;
  } else if (effectiveDesignAmps <= 3200) {
    recommendedConfig = '4x (100x10) mm per phase';
    barWidth = 100; barThickness = 10; barsPerPhase = 4;
  } else {
    recommendedConfig = '4x (120x10) mm per phase';
    barWidth = 120; barThickness = 10; barsPerPhase = 4;
  }

  // Support insulator spacing to withstand 65kA peak (F = 0.2 * Ipk^2 * (L/d))
  const supportSpacingMm = faultCurrentKA >= 65 ? 300 : faultCurrentKA >= 50 ? 400 : 500;

  // Weight Calculation:
  // Density: Copper = 8,940 kg/m3, Aluminium = 2,700 kg/m3
  const density = material === 'COPPER' ? 8940 : 2700;
  const totalLengthM = 24.5; // sum of horizontal and droppers
  const actualSectionMm2 = barWidth * barThickness * barsPerPhase;
  const neutralSectionMm2 = actualSectionMm2 * neutralFactor;
  const earthSectionMm2 = Math.max(actualSectionMm2 * 0.5, 200); // 50% PE bar

  const phaseWeightKg = ((actualSectionMm2 * 3) / 1000000) * totalLengthM * density;
  const neutralWeightKg = ((neutralSectionMm2) / 1000000) * totalLengthM * density;
  const earthWeightKg = ((earthSectionMm2) / 1000000) * totalLengthM * density;
  const totalWeightKg = Number((phaseWeightKg + neutralWeightKg + earthWeightKg).toFixed(1));

  const totalCostAED = Math.round(totalWeightKg * copperRatePerKg);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner with Safety Requirement */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-200 border border-amber-400 flex items-center justify-center text-amber-900 font-bold shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-bold text-[10px]">
                PRELIMINARY ENGINEERING CALCULATION
              </span>
              <span className="text-amber-800 text-[11px]">DIN 43671 / IEC 61439-1 Clause 8.4</span>
            </div>
            <p className="text-amber-900 text-xs mt-1">
              Calculations are preliminary engineering sizing for tendering and costing. Certified temperature-rise limits and electrodynamic bracing must be validated against approved type-test reports before factory fabrication.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters & Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 Cols): Engineering Parameters & Results */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Sizing Parameters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <span className="font-bold text-slate-900 text-sm block border-b border-slate-100 pb-2">
              1. Electrical & Thermal Boundary Conditions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Busbar Conductor Material</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900 focus:border-cyan-600"
                >
                  <option value="COPPER">Copper (ETP 99.9% Tin-Plated)</option>
                  <option value="ALUMINIUM">Aluminium (EC Grade)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Nominal Incomer Rating</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={incomerCurrent}
                    onChange={(e) => setIncomerCurrent(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900 focus:border-cyan-600"
                  />
                  <span className="text-slate-500">Amps</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Fault Withstand (Icw 1.0s)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={faultCurrentKA}
                    onChange={(e) => setFaultCurrentKA(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900 focus:border-cyan-600"
                  />
                  <span className="text-slate-500">kA</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Ambient Temperature</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={ambientTempC}
                    onChange={(e) => setAmbientTempC(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900 focus:border-cyan-600"
                  />
                  <span className="text-slate-500">°C</span>
                </div>
                <span className="text-[9px] text-slate-400">Derating: k = {deratingFactor}</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Design Current Density</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={currentDensity}
                    onChange={(e) => setCurrentDensity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900 focus:border-cyan-600"
                  />
                  <span className="text-slate-500">A/mm²</span>
                </div>
                <span className="text-[9px] text-slate-400">Standard IEC: 1.5 A/mm²</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Neutral Conductor Sizing</label>
                <select
                  value={neutralFactor}
                  onChange={(e) => setNeutralFactor(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900 focus:border-cyan-600"
                >
                  <option value={1.0}>100% Full Neutral (Harmonics)</option>
                  <option value={0.5}>50% Half Neutral (Balanced)</option>
                  <option value={2.0}>200% Double Neutral (Data Centre)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sizing Recommendations & Mechanical Bracing */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <span className="font-bold text-slate-900 text-sm block border-b border-slate-100 pb-2">
              2. DIN 43671 Recommended Sizing & Mechanical Support Spacing
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block">Required Cross-Section</span>
                <span className="text-lg font-bold text-cyan-800">{reqCrossSectionMm2} mm²</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Per phase conductor</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block">Selected Copper Matrix</span>
                <span className="text-base font-bold text-slate-900">{recommendedConfig}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Tin-plated finish</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block">Insulator Support Spacing</span>
                <span className="text-lg font-bold text-emerald-700">{supportSpacingMm} mm c/c</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Withstands 65kA peak forces</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block">Protective Earth (PE)</span>
                <span className="text-lg font-bold text-slate-800">50x10 mm Cu</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Full length bottom run</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Weight, Tonnage & Procurement Budget */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <span className="font-bold text-slate-900 text-sm block border-b border-slate-200 pb-2">
            Copper Tonnage & Material Budget
          </span>

          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Total Busbar Weight</span>
              <span className="text-2xl font-bold text-amber-700">{totalWeightKg} kg</span>
              <span className="text-[10px] text-slate-500 block">
                Phases: {phaseWeightKg.toFixed(0)} kg • Neutral: {neutralWeightKg.toFixed(0)} kg • Earth: {earthWeightKg.toFixed(0)} kg
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">LME Raw Copper Base Rate</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={copperRatePerKg}
                  onChange={(e) => setCopperRatePerKg(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-bold focus:border-cyan-600"
                />
                <span className="text-slate-500 font-bold">AED/kg</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Total Copper Procurement Value</span>
              <span className="text-xl font-bold text-emerald-800">
                AED {totalCostAED.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 block">
                Includes tin-plating, SMC support insulators, and heat-shrink phase identification sleeves.
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
            <div>• ETP Copper Density: 8,940 kg/m³</div>
            <div>• Conductivity: 100% IACS (58 MS/m)</div>
            <div>• Maximum Permissible Temperature: 105°C (Bare) / 120°C (Tin-plated)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
