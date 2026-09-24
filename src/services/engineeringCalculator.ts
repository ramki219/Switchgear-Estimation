import { LabourRate, PanelLabourHour } from '../types';

export interface BusbarCalculationResult {
  currentDensity: number; // A/mm2
  crossSectionPerPhaseMm2: number; // mm2 per phase
  recommendedSize: string; // e.g. "2x (80x10) mm Cu"
  totalLengthMeters: number; // m
  totalWeightKg: number; // kg
  copperBaseRate: number; // AED/kg
  copperCost: number; // AED
  hardwareAndSleevingCost: number; // AED (SMC insulators, heat-shrink sleeve, grade 8.8 bolts)
  totalBusbarCost: number; // AED
}

export interface EnclosureCalculationResult {
  heightMm: number;
  widthMm: number;
  depthMm: number;
  columns: number;
  formOfSeparation: string;
  ipRating: string;
  sheetMetalThicknessMm: number;
  estimatedWeightKg: number;
  baseMaterialCost: number; // AED
  powderCoatingCost: number; // AED
  totalEnclosureCost: number; // AED
}

export interface LabourCalculationResult {
  totalHours: number;
  totalCost: number;
  breakdown: PanelLabourHour[];
}

/**
 * Calculates Copper Busbar requirements for Low Voltage Switchboards per IEC 61439-1/2
 */
export function calculateBusbarRequirements(params: {
  incomerAmps: number;
  widthMm: number;
  heightMm: number;
  columns: number;
  currentDensity?: number; // A/mm2, default 1.5
  copperRatePerKg?: number; // AED/kg, default 42.0
  neutralSizingFactor?: number; // default 1.0 (100% neutral for non-linear harmonic loads)
}): BusbarCalculationResult {
  const {
    incomerAmps,
    widthMm,
    heightMm,
    columns,
    currentDensity = 1.5,
    copperRatePerKg = 42.0,
    neutralSizingFactor = 1.0,
  } = params;

  // 1. Cross-sectional area required per phase
  // Area = I / CurrentDensity
  const crossSectionPerPhaseMm2 = Math.ceil(incomerAmps / currentDensity);

  // 2. Derive engineering standard copper bar sizing text
  let recommendedSize = '';
  if (incomerAmps <= 250) {
    recommendedSize = `1x (30x5) mm Cu`;
  } else if (incomerAmps <= 400) {
    recommendedSize = `1x (40x10) mm Cu`;
  } else if (incomerAmps <= 630) {
    recommendedSize = `1x (50x10) mm Cu`;
  } else if (incomerAmps <= 800) {
    recommendedSize = `1x (80x10) mm Cu`;
  } else if (incomerAmps <= 1000) {
    recommendedSize = `1x (100x10) mm Cu`;
  } else if (incomerAmps <= 1250) {
    recommendedSize = `2x (60x10) mm Cu`;
  } else if (incomerAmps <= 1600) {
    recommendedSize = `2x (80x10) mm Cu`;
  } else if (incomerAmps <= 2000) {
    recommendedSize = `2x (100x10) mm Cu`;
  } else if (incomerAmps <= 2500) {
    recommendedSize = `3x (100x10) mm Cu`;
  } else if (incomerAmps <= 3200) {
    recommendedSize = `4x (100x10) mm Cu`;
  } else {
    recommendedSize = `4x (120x10) mm Cu`;
  }

  // 3. Busbar length calculation
  // Horizontal run along panel width (allowing 15% extra for fishplate joints & expansion bends)
  const horizontalRunM = (widthMm / 1000) * 1.15;

  // Vertical dropper risers per column (approx 60% of panel height)
  const verticalRunPerColumnM = (heightMm / 1000) * 0.65;
  const totalVerticalRunM = columns * verticalRunPerColumnM;

  // Incomer termination & dropper drops
  const incomerDropsM = (heightMm / 1000) * 0.8;

  const totalLengthMeters = Number((horizontalRunM + totalVerticalRunM + incomerDropsM).toFixed(2));

  // 4. Multi-phase multiplier:
  // 3 Phase conductors + Neutral (neutralSizingFactor * phase area) + Protective Earth (0.5 * phase area)
  const phaseMultiplier = 3 + neutralSizingFactor + 0.5; // e.g. 3 + 1.0 + 0.5 = 4.5
  const totalConductorMm2 = crossSectionPerPhaseMm2 * phaseMultiplier;

  // 5. Weight = Volume * Density
  // Density of pure electrolytic copper (ETP Grade Cu-ETP CW004A) = 8.92 g/cm3 = 0.00892 kg / (mm2 * m)
  const rawWeightKg = totalLengthMeters * crossSectionPerPhaseMm2 * (3 + neutralSizingFactor + 0.5) * 0.0022; // calibrated for multi-pole bar configuration
  const totalWeightKg = Math.max(12, Number(rawWeightKg.toFixed(1)));

  // 6. Cost calculations
  const copperCost = Number((totalWeightKg * copperRatePerKg).toFixed(2));
  
  // Hardware: SMC/DMC Busbar supports (rated for fault level short circuit stress), heat shrink sleeving (Red, Yellow, Blue, Black, Green/Yellow), Grade 8.8 zinc-plated high tensile bolts & conical Belleville washers (~14% of Cu cost)
  const hardwareAndSleevingCost = Number((copperCost * 0.14).toFixed(2));
  const totalBusbarCost = Number((copperCost + hardwareAndSleevingCost).toFixed(2));

  return {
    currentDensity,
    crossSectionPerPhaseMm2,
    recommendedSize,
    totalLengthMeters,
    totalWeightKg,
    copperBaseRate: copperRatePerKg,
    copperCost,
    hardwareAndSleevingCost,
    totalBusbarCost,
  };
}

/**
 * Calculates Sheet Metal Enclosure and Modular Framework Cost
 */
export function calculateEnclosureCost(params: {
  heightMm: number;
  widthMm: number;
  depthMm: number;
  columns: number;
  formOfSeparation: string; // Form 2b, Form 3b, Form 4b Type 6, Form 4b Type 7
  ipRating: string;
  sheetMetalThicknessMm?: number; // 1.5, 2.0
}): EnclosureCalculationResult {
  const {
    heightMm,
    widthMm,
    depthMm,
    columns,
    formOfSeparation,
    ipRating,
    sheetMetalThicknessMm = 2.0,
  } = params;

  // Separation multiplier
  let formMultiplier = 1.0;
  if (formOfSeparation.includes('Form 3')) formMultiplier = 1.25;
  if (formOfSeparation.includes('Form 4b') || formOfSeparation.includes('Form 4B')) formMultiplier = 1.6;

  // IP Rating multiplier
  let ipMultiplier = 1.0;
  if (ipRating === 'IP54' || ipRating === 'IP55') ipMultiplier = 1.15;
  if (ipRating === 'IP65') ipMultiplier = 1.3;

  // Surface area calculation (m2)
  const hM = heightMm / 1000;
  const wM = widthMm / 1000;
  const dM = depthMm / 1000;

  // Outer carcass envelope (front door, rear cover, top, bottom, 2 side sheets)
  const outerAreaM2 = 2 * (hM * wM + hM * dM + wM * dM);

  // Internal barriers: vertical segregation barriers between cubicles + horizontal phase shelves & gland plates
  const internalBarriersM2 = (columns - 1) * (hM * dM) * formMultiplier + columns * 2 * (wM / columns * dM);

  const totalAreaM2 = outerAreaM2 + internalBarriersM2;

  // Sheet steel weight: 7.85 kg / m2 per mm thickness
  const steelWeightKg = totalAreaM2 * sheetMetalThicknessMm * 7.85;
  const estimatedWeightKg = Math.round(steelWeightKg + (columns * 18)); // structural frame corners, hinges, handles

  // Steel fabrication base rate (CNC punching, laser cutting, bending, welding) ~12.5 AED/kg
  const baseMaterialCost = Number((estimatedWeightKg * 12.5).toFixed(2));

  // Epoxy Polyester Powder coating (RAL 7035 light grey, 70-80 microns thickness) ~35 AED/m2
  const powderCoatingCost = Number((totalAreaM2 * 35 * ipMultiplier).toFixed(2));

  // Base plinth, heavy-duty hinges, flush key locks, neoprene gasket seal
  const accessoriesCost = Number((columns * 320 * ipMultiplier).toFixed(2));

  const totalEnclosureCost = Number((baseMaterialCost + powderCoatingCost + accessoriesCost).toFixed(2));

  return {
    heightMm,
    widthMm,
    depthMm,
    columns,
    formOfSeparation,
    ipRating,
    sheetMetalThicknessMm,
    estimatedWeightKg,
    baseMaterialCost,
    powderCoatingCost,
    totalEnclosureCost,
  };
}

/**
 * Calculates Activity-based Labour Hours and Cost
 */
export function calculatePanelLabour(params: {
  columns: number;
  itemCount: number;
  copperWeightKg: number;
  formOfSeparation: string;
  rates: LabourRate[];
}): LabourCalculationResult {
  const { columns, itemCount, copperWeightKg, formOfSeparation, rates } = params;

  // Find rate helpers
  const getRate = (code: string, fallback: number) => {
    const found = rates.find(r => r.activityCode === code);
    return found ? found.ratePerHour : fallback;
  };

  const isForm4 = formOfSeparation.includes('4');

  // 1. Mechanical Enclosure & Structure Assembly
  // ~8 hrs base per column, +4 hrs if Form 4 compartmentalized
  const mechHours = Number((columns * (isForm4 ? 12 : 8)).toFixed(1));
  const mechRate = getRate('LAB-FAB-001', 75);

  // 2. Copper Busbar Cutting, Bending & Torque Fitting
  // ~0.15 hours per kg of copper + 2 hrs per column
  const copperHours = Number((copperWeightKg * 0.12 + columns * 2.5).toFixed(1));
  const copperRate = getRate('LAB-COP-001', 85);

  // 3. Power & Control Wiring
  // ~1.8 hours per component feeder (wiring, ferrule tags, sleeve terminal lugs)
  const wiringHours = Number((Math.max(itemCount, 3) * 1.8 + columns * 3).toFixed(1));
  const wiringRate = getRate('LAB-WIR-001', 70);

  // 4. Routine Testing & Quality Inspection
  // Routine test (dielectric withstand, megger, trip simulation, torque verification)
  const testHours = Number((columns * 3 + 4).toFixed(1));
  const testRate = getRate('LAB-TST-001', 110);

  // 5. Engineering, Single Line Diagram & GA Drawings
  const engHours = Number((columns * 2.5 + 4).toFixed(1));
  const engRate = getRate('LAB-ENG-001', 130);

  const breakdown: PanelLabourHour[] = [
    {
      activityCode: 'LAB-FAB-001',
      activityName: 'Cubicle & Framework Assembly',
      category: 'Fabrication',
      hours: mechHours,
      ratePerHour: mechRate,
      totalCost: Number((mechHours * mechRate).toFixed(2)),
    },
    {
      activityCode: 'LAB-COP-001',
      activityName: 'Copper Busbar Fabrication & Fitting',
      category: 'Copper',
      hours: copperHours,
      ratePerHour: copperRate,
      totalCost: Number((copperHours * copperRate).toFixed(2)),
    },
    {
      activityCode: 'LAB-WIR-001',
      activityName: 'Power & Control Wiring',
      category: 'Wiring',
      hours: wiringHours,
      ratePerHour: wiringRate,
      totalCost: Number((wiringHours * wiringRate).toFixed(2)),
    },
    {
      activityCode: 'LAB-TST-001',
      activityName: 'Routine Testing & QA',
      category: 'Testing',
      hours: testHours,
      ratePerHour: testRate,
      totalCost: Number((testHours * testRate).toFixed(2)),
    },
    {
      activityCode: 'LAB-ENG-001',
      activityName: 'Engineering & SLD Design',
      category: 'Engineering',
      hours: engHours,
      ratePerHour: engRate,
      totalCost: Number((engHours * engRate).toFixed(2)),
    },
  ];

  const totalHours = Number(breakdown.reduce((sum, b) => sum + b.hours, 0).toFixed(1));
  const totalCost = Number(breakdown.reduce((sum, b) => sum + b.totalCost, 0).toFixed(2));

  return {
    totalHours,
    totalCost,
    breakdown,
  };
}
