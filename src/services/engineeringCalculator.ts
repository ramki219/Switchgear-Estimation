import { LabourRate, PanelLabourHour } from '../types';

export interface BusbarCalculationResult {
  currentDensity: number; // A/mm2
  crossSectionPerPhaseMm2: number; // mm2 per phase
  recommendedSize: string; // e.g. "2x (80x10) mm Cu"
  widthMm: number; // Bar width mm
  thicknessMm: number; // Bar thickness mm
  runsPerPhase: number; // Bars per phase (1, 2, 3, 4)
  phasesCount: number; // Conductors count (3P+N+PE = 4 or 5)
  totalLengthMeters: number; // Total length of busbar run in meters
  totalConductorMeters: number; // Total single-conductor bar meters
  copperDensity: number; // kg/meter (8.96 standard for electrolytic Cu)
  weightPerMeterKg: number; // kg/meter linear density of busbar system
  totalWeightKg: number; // Total copper weight in kg
  copperBaseRate: number; // Current copper price manually applied (AED/kg)
  copperCost: number; // Copper material cost in AED
  labourHours: number; // Provision for busbar fabrication labour hours
  labourRatePerHour: number; // Busbar labour rate per hour (AED/hr)
  labourCharges: number; // Provision for busbar labour charges in AED
  hardwareAndSleevingCost: number; // Hardware, SMC insulators, bolts, and heat-shrink sleeves (AED)
  totalBusbarCost: number; // Total Cost = Copper Material + Labour Charges + Hardware (AED)
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
  baseMaterialCost: number;
  powderCoatingCost: number;
  totalEnclosureCost: number;
}

export interface LabourCalculationResult {
  totalHours: number;
  totalCost: number;
  breakdown: PanelLabourHour[];
}

/**
 * Calculates Copper Busbar requirements for Low Voltage Switchboards per IEC 61439-1/2
 * Formula: Total Length x Density based on Dimensions x Current Copper Price + Labour Charges
 */
export function calculateBusbarRequirements(params: {
  incomerAmps: number;
  widthMm: number;
  heightMm: number;
  columns: number;
  // Manual overrides
  currentDensity?: number; // A/mm2, default 1.5
  copperRatePerKg?: number; // AED/kg, default 42.0
  neutralSizingFactor?: number; // default 1.0 (100% neutral for non-linear harmonic loads)
  manualWidthMm?: number;
  manualThicknessMm?: number;
  manualRunsPerPhase?: number;
  manualPhasesCount?: number;
  manualTotalLengthMeters?: number;
  manualCopperDensity?: number;
  manualWeightKg?: number;
  manualLabourHours?: number;
  manualLabourRatePerHour?: number;
  manualLabourCharges?: number;
  manualHardwareCost?: number;
  isCustomBusbarCost?: boolean;
  customBusbarCost?: number;
}): BusbarCalculationResult {
  const {
    incomerAmps,
    widthMm,
    heightMm,
    columns,
    currentDensity = 1.5,
    copperRatePerKg = 42.0,
    neutralSizingFactor = 1.0,
    manualWidthMm,
    manualThicknessMm,
    manualRunsPerPhase,
    manualPhasesCount,
    manualTotalLengthMeters,
    manualCopperDensity,
    manualWeightKg,
    manualLabourHours,
    manualLabourRatePerHour,
    manualLabourCharges,
    manualHardwareCost,
    isCustomBusbarCost,
    customBusbarCost,
  } = params;

  // 1. Cross-sectional area required per phase
  // Area = I / CurrentDensity
  const crossSectionPerPhaseMm2 = Math.ceil(incomerAmps / currentDensity);

  // 2. Derive engineering standard copper bar dimensions
  let defaultWidthMm = 100;
  let defaultThicknessMm = 10;
  let defaultRunsPerPhase = 1;
  let recommendedSize = '';

  if (incomerAmps <= 250) {
    defaultWidthMm = 30;
    defaultThicknessMm = 5;
    defaultRunsPerPhase = 1;
    recommendedSize = `1x (30x5) mm Cu`;
  } else if (incomerAmps <= 400) {
    defaultWidthMm = 40;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 1;
    recommendedSize = `1x (40x10) mm Cu`;
  } else if (incomerAmps <= 630) {
    defaultWidthMm = 50;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 1;
    recommendedSize = `1x (50x10) mm Cu`;
  } else if (incomerAmps <= 800) {
    defaultWidthMm = 80;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 1;
    recommendedSize = `1x (80x10) mm Cu`;
  } else if (incomerAmps <= 1000) {
    defaultWidthMm = 100;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 1;
    recommendedSize = `1x (100x10) mm Cu`;
  } else if (incomerAmps <= 1250) {
    defaultWidthMm = 60;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 2;
    recommendedSize = `2x (60x10) mm Cu`;
  } else if (incomerAmps <= 1600) {
    defaultWidthMm = 80;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 2;
    recommendedSize = `2x (80x10) mm Cu`;
  } else if (incomerAmps <= 2000) {
    defaultWidthMm = 100;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 2;
    recommendedSize = `2x (100x10) mm Cu`;
  } else if (incomerAmps <= 2500) {
    defaultWidthMm = 100;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 3;
    recommendedSize = `3x (100x10) mm Cu`;
  } else if (incomerAmps <= 3200) {
    defaultWidthMm = 100;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 4;
    recommendedSize = `4x (100x10) mm Cu`;
  } else {
    defaultWidthMm = 120;
    defaultThicknessMm = 10;
    defaultRunsPerPhase = 4;
    recommendedSize = `4x (120x10) mm Cu`;
  }

  const width = manualWidthMm && manualWidthMm > 0 ? manualWidthMm : defaultWidthMm;
  const thickness = manualThicknessMm && manualThicknessMm > 0 ? manualThicknessMm : defaultThicknessMm;
  const runs = manualRunsPerPhase && manualRunsPerPhase > 0 ? manualRunsPerPhase : defaultRunsPerPhase;
  const phasesCount = manualPhasesCount && manualPhasesCount > 0 ? manualPhasesCount : (3 + neutralSizingFactor + 0.5); // 3P + 100% N + 50% PE = 4.5

  if (manualWidthMm || manualThicknessMm || manualRunsPerPhase) {
    recommendedSize = `${runs}x (${width}x${thickness}) mm Cu`;
  }

  // 3. Total Length calculation
  // Default engineering estimate: Horizontal main busbar + vertical droppers + incomer termination
  const horizontalRunM = (widthMm / 1000) * 1.15;
  const verticalRunPerColumnM = (heightMm / 1000) * 0.65;
  const totalVerticalRunM = columns * verticalRunPerColumnM;
  const incomerDropsM = (heightMm / 1000) * 0.8;
  const defaultSystemLengthM = Number((horizontalRunM + totalVerticalRunM + incomerDropsM).toFixed(2));

  const totalLengthMeters = manualTotalLengthMeters !== undefined && manualTotalLengthMeters > 0 
    ? Number(manualTotalLengthMeters) 
    : defaultSystemLengthM;

  // Total linear meters of individual copper bar = System Length x Runs per Phase x Conductors
  const totalConductorMeters = Number((totalLengthMeters * runs * phasesCount).toFixed(2));

  // 4. Density of the copper busbar based on dimensions:
  // Density constant of electrolytic copper (Cu-ETP) = 0.00896 kg/meter
  const copperDensity = manualCopperDensity && manualCopperDensity > 0 ? manualCopperDensity : 0.00896;
  const densityFactor = copperDensity < 0.1 ? copperDensity : copperDensity / 1000;
  
  // Linear density of one single bar (kg/meter) = Width(mm) * Thickness(mm) * Density(0.00896)
  const singleBarWeightPerMeterKg = Number((width * thickness * densityFactor).toFixed(4));
  
  // Total busbar system density (all runs & conductors) in kg/meter
  const weightPerMeterKg = Number((singleBarWeightPerMeterKg * runs * phasesCount).toFixed(3));

  // 5. Total Copper Weight (kg) = Total Length x Weight per meter
  let totalWeightKg: number;
  if (manualWeightKg !== undefined && manualWeightKg > 0) {
    totalWeightKg = Number(manualWeightKg.toFixed(2));
  } else {
    totalWeightKg = Number((totalLengthMeters * weightPerMeterKg).toFixed(2));
  }

  // 6. Current Copper Price manually applied (AED/kg) -> Copper Material Cost
  const copperCost = Number((totalWeightKg * copperRatePerKg).toFixed(2));

  // 7. Provision for Labour Charges
  // Busbar cutting, hydraulic bending, hole punching, joint torquing and tin-plating
  // Standard benchmark: ~0.8 to 1.5 hr per column + 0.05 hr per kg of copper
  const defaultLabourHours = Number((Math.max(2, (columns * 1.2) + (totalWeightKg * 0.04))).toFixed(1));
  const labourHours = manualLabourHours !== undefined && manualLabourHours >= 0 
    ? Number(manualLabourHours) 
    : defaultLabourHours;
  const labourRatePerHour = manualLabourRatePerHour && manualLabourRatePerHour > 0 
    ? Number(manualLabourRatePerHour) 
    : 85.0; // standard UAE switchgear technician rate

  const labourCharges = manualLabourCharges !== undefined && manualLabourCharges >= 0
    ? Number(manualLabourCharges)
    : Number((labourHours * labourRatePerHour).toFixed(2));

  // 8. Hardware & Insulation (SMC short-circuit supports, Grade 8.8 bolts, Belleville washers, heat-shrink sleeves)
  const defaultHardwareCost = Number((copperCost * 0.12).toFixed(2));
  const hardwareAndSleevingCost = manualHardwareCost !== undefined && manualHardwareCost >= 0
    ? Number(manualHardwareCost)
    : defaultHardwareCost;

  // 9. Total Cost of the Busbar = Material Cost + Labour Charges + Hardware
  let totalBusbarCost = Number((copperCost + labourCharges + hardwareAndSleevingCost).toFixed(2));
  if (isCustomBusbarCost && customBusbarCost !== undefined && customBusbarCost > 0) {
    totalBusbarCost = Number(customBusbarCost.toFixed(2));
  }

  return {
    currentDensity,
    crossSectionPerPhaseMm2,
    recommendedSize,
    widthMm: width,
    thicknessMm: thickness,
    runsPerPhase: runs,
    phasesCount,
    totalLengthMeters,
    totalConductorMeters,
    copperDensity: copperDensity < 0.1 ? copperDensity : Number((copperDensity / 1000).toFixed(5)),
    weightPerMeterKg,
    totalWeightKg,
    copperBaseRate: copperRatePerKg,
    copperCost,
    labourHours,
    labourRatePerHour,
    labourCharges,
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
