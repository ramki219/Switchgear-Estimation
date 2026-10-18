// ============================================================================
// PROFESSIONAL LV SWITCHGEAR ENGINEERING, ESTIMATION & PANEL DESIGN SYSTEM
// IEC 61439-1 / IEC 61439-2 DATA MODELS
// ============================================================================

export type SLDNodeType =
  | 'UTILITY'
  | 'GENERATOR'
  | 'TRANSFORMER'
  | 'ACB'
  | 'MCCB'
  | 'MCB'
  | 'ISOLATOR'
  | 'BUS_COUPLER'
  | 'ATS'
  | 'BUSBAR_SECTION'
  | 'CT'
  | 'METER'
  | 'SPD'
  | 'CAPACITOR'
  | 'MOTOR'
  | 'FEEDER_LOAD';

export interface SLDNode {
  id: string;
  tag: string; // e.g. "INCOMER-1", "QF01", "BC-01", "FDR-01", "M01"
  type: SLDNodeType;
  ratingA: number;
  voltageV: number;
  poles: 3 | 4;
  icuKA?: number;
  icsKA?: number;
  icwKA?: number;
  protection?: string; // e.g. "LSIG", "LSI", "LI", "Thermal-Magnetic"
  sourceType?: 'UTILITY' | 'GENERATOR' | 'TRANSFORMER';
  sourceName?: string;
  busSectionId: string; // Busbar section identifier
  manufacturer?: string; // e.g. "ABB", "Schneider", "Siemens", "LS Electric", "Eaton"
  modelSeries?: string; // e.g. "Emax 2 E4.2", "MasterPact MTZ2", "3WA1"
  selectedPartNumber?: string;
  mounting?: 'Drawout' | 'Fixed' | 'Plug-in' | 'DIN Rail';
  isEssential?: boolean;
  status?: 'CLOSED' | 'OPEN' | 'TRIPPED';
  meterType?: string; // e.g. "Multifunction Energy Meter (THD, RS485 Modbus)"
  loadDescription?: string; // e.g. "Chiller-01", "AHU Plant 1", "Elevator DB"
  powerKW?: number;
  powerFactor?: number;
  cableSize?: string; // e.g. "2x (4C x 240 mm2 Cu/XLPE/SWA/PVC)"
  notes?: string;
  x?: number;
  y?: number;
}

export interface SLDConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  busSectionId?: string;
  isInterlocked?: boolean;
  interlockType?: 'MECHANICAL' | 'ELECTRICAL' | 'BOTH';
}

export interface BusSectionDefinition {
  id: string;
  name: string; // e.g. "Bus Section 1 (Essential)", "Bus Section 2 (Non-Essential)"
  ratingA: number;
  nominalVoltageV: number;
  shortCircuitKA: number;
  color?: string;
}

export interface SLDTopology {
  panelTag: string;
  panelName: string;
  systemVoltage: number; // e.g. 415
  frequency: number; // 50
  phases: number; // 3
  wires: number; // 4
  earthingSystem: 'TN-S' | 'TN-C' | 'TN-C-S' | 'TT' | 'IT';
  nodes: SLDNode[];
  connections: SLDConnection[];
  busSections: BusSectionDefinition[];
  formOfSeparation: string; // "Form 4B Type 6"
  ipRating: string; // "IP54"
  createdAt: string;
  updatedAt: string;
}

export interface ATSConfiguration {
  id: string;
  atsTag: string; // e.g. "ATS-01"
  normalSourceNodeId: string; // Utility Incomer
  emergencySourceNodeId: string; // Generator Incomer
  busCouplerNodeId?: string;
  topologyType: 'UTILITY_GEN' | 'UTILITY_UTILITY' | 'GEN_GEN' | '3_SOURCE';
  transitionType: 'OPEN_TRANSITION' | 'CLOSED_TRANSITION' | 'DELAYED_TRANSITION';
  interlockType: 'MECHANICAL_AND_ELECTRICAL' | 'ELECTRICAL_ONLY' | 'CASTELL_KEY';
  genStartDelaySec: number;
  transferDelaySec: number;
  retransferDelaySec: number;
  genCooldownSec: number;
  hasBypassSwitch: boolean;
  controlPhilosophyText: string;
  monitoringRelays: {
    underVoltage: boolean;
    overVoltage: boolean;
    phaseFailure: boolean;
    frequencyMonitor: boolean;
    neutralFailure: boolean;
  };
}

export interface CompartmentDefinition {
  id: string;
  name: string;
  type: 'BREAKER' | 'BUSBAR' | 'CABLE' | 'METERING' | 'CONTROL' | 'SPARE';
  heightMm: number;
  componentTags: string[];
  equipmentDescription?: string;
}

export interface PanelColumnLayout {
  columnNumber: number;
  designation: string; // e.g. "Section 1: Incomer 1 (4000A ACB)"
  widthMm: number;
  heightMm: number;
  depthMm: number;
  compartments: CompartmentDefinition[];
}

export interface PanelGAData {
  panelTag: string;
  totalWidthMm: number;
  totalHeightMm: number;
  totalDepthMm: number;
  plinthHeightMm: number;
  formOfSeparation: string;
  ipRating: string;
  cableEntry: 'TOP' | 'BOTTOM' | 'BOTH';
  columns: PanelColumnLayout[];
  hasLiftingLugs: boolean;
  hasPlinth: boolean;
  hasVentilationLouvers: boolean;
  sheetMetalThicknessMm: number;
  colorRAL: string; // e.g. "RAL 7035 (Light Grey)"
  warningLabels: string[];
}

export type FaciaComponentType =
  | 'ACB_HANDLE'
  | 'MCCB_HANDLE'
  | 'DIGITAL_METER'
  | 'LAMP_PHASE_R'
  | 'LAMP_PHASE_Y'
  | 'LAMP_PHASE_B'
  | 'LAMP_ON'
  | 'LAMP_OFF'
  | 'LAMP_TRIP'
  | 'LAMP_EARTH_FAULT'
  | 'SELECTOR_AUTO_MAN'
  | 'SELECTOR_LOCAL_REMOTE'
  | 'SELECTOR_AMMET'
  | 'EMERGENCY_STOP'
  | 'PUSHBUTTON_START'
  | 'PUSHBUTTON_STOP'
  | 'NAMEPLATE'
  | 'ATS_ANNUNCIATOR';

export interface FaciaComponent {
  id: string;
  tag: string;
  columnNumber: number;
  compartmentId: string;
  type: FaciaComponentType;
  label: string;
  color?: string;
  state?: string;
  xPercent: number; // 0-100 within compartment
  yPercent: number; // 0-100 within compartment
}

export interface FaciaLayoutData {
  panelTag: string;
  totalWidthMm: number;
  totalHeightMm: number;
  columnsCount: number;
  components: FaciaComponent[];
}

export interface ControlCircuitItem {
  circuitId: string;
  functionName: string;
  sourceVoltage: string; // e.g. "240V AC Auxiliary Supply", "24V DC Trip Coil Supply"
  fuseRatingA: number;
  devicesInvolved: string[];
  terminalBlock: string;
  wireNumbers: string[];
  description: string;
}

export interface TerminalScheduleItem {
  id: string;
  terminalBlock: string; // e.g. "TB01", "TB02"
  terminalNumber: number;
  wireNumber: string;
  signalDescription: string;
  sourceDevice: string;
  destinationDevice: string;
  wireSizeMm2: number;
  wireColor: string; // "Red", "Black", "Grey", "Blue", "Green/Yellow"
}

export interface EngineeringValidation {
  id: string;
  severity: 'ERROR' | 'WARNING' | 'VALID';
  code: string;
  category: 'BREAKER' | 'SHORT_CIRCUIT' | 'INTERLOCK' | 'BUSBAR' | 'DIMENSION' | 'COMPLIANCE' | 'CABLE';
  message: string;
  recommendation?: string;
  affectedNodeTags?: string[];
  iecClause?: string;
}

export interface CustomerBOQItem {
  itemNumber: string;
  description: string;
  make: string;
  model: string;
  ratingSpecification: string;
  quantity: number;
  unit: string;
  complianceStandard: string;
  unitRateAED?: number;
  totalRateAED?: number;
  remarks?: string;
}

export interface ProjectRevisionRecord {
  revision: string; // "R0", "R1", "R2"
  date: string;
  author: string;
  status: 'DRAFT' | 'ENGINEER_APPROVED' | 'CLIENT_REVIEW' | 'AS_BUILT';
  changeLog: string[];
  approvedBy?: string;
}

export interface ElectricalCalculationSummary {
  systemVoltage: number;
  frequency: number;
  totalConnectedLoadKW: number;
  totalDesignCurrentAmps: number;
  diversityFactor: number;
  operatingLoadKW: number;
  operatingCurrentAmps: number;
  powerFactor: number;
  calculatedFaultLevelKA: number;
  incomerBusbarMm2: number;
  incomerBusbarWeightKg: number;
  neutralBusbarSizingMm2: number;
  earthBusbarSizingMm2: number;
  ambientDeratingFactor: number;
  isPreliminary: boolean;
}
