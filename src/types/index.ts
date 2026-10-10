export interface Manufacturer {
  manufacturerID: number;
  manufacturerCode: string;
  manufacturerName: string;
  country?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ComponentCategory {
  categoryID: number;
  categoryCode: string;
  categoryName: string;
  parentCategoryID?: number;
  description?: string;
  defaultIECStandard?: string;
  isActive: boolean;
}

export interface ComponentSpecification {
  specificationID: number;
  componentID: number;
  specificationName: string;
  specificationValue: string;
  unit?: string;
}

export interface Component {
  componentID: number;
  componentCode: string;
  componentName: string;
  categoryID: number;
  categoryName?: string;
  manufacturerID: number;
  manufacturerName?: string;
  manufacturerCode?: string;
  partNumber: string;
  model?: string;
  description?: string;
  unit: string;
  ratedVoltage?: number;
  ratedCurrent?: number;
  poles?: number;
  breakingCapacity?: number; // kA
  frequency?: number;
  ipRating?: string;
  mountingType?: string;
  iecStandard?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  specifications?: ComponentSpecification[];
  currentPrice?: SupplierPrice;
}

export interface Supplier {
  supplierID: number;
  supplierCode: string;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  currency: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt: string;
}

export interface SupplierPrice {
  supplierPriceID: number;
  componentID: number;
  componentName?: string;
  componentCode?: string;
  partNumber?: string;
  manufacturerName?: string;
  supplierID: number;
  supplierName?: string;
  supplierPartNumber?: string;
  currency: string;
  listPrice: number;
  discountPercent: number;
  netPrice: number; // Computed: listPrice * (1 - discountPercent / 100)
  minimumQuantity: number;
  leadTimeDays?: number;
  priceDate: string;
  validUntil?: string;
  quotationReference?: string;
  notes?: string;
  isCurrent: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface PanelType {
  panelTypeID: number;
  panelTypeCode: string;
  panelTypeName: string;
  description?: string;
  defaultFormOfSeparation: string;
  defaultIPRating: string;
  complianceTag?: string;
  isActive: boolean;
}

export interface LabourRate {
  labourRateID: number;
  activityCode: string;
  activityName: string;
  category: string;
  ratePerHour: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface AuditLogEntry {
  auditID: number;
  userID: string;
  tableName: string;
  recordID: string;
  action: 'INSERT_PRICE' | 'PRICE_REVISION' | 'CREATE_COMPONENT' | 'UPDATE_COMPONENT' | 'DELETE_COMPONENT' | 'CREATE_SUPPLIER' | 'UPDATE_SUPPLIER' | 'CREATE_MANUFACTURER' | 'CREATE_CATEGORY' | 'BULK_IMPORT_COMPONENTS';
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalComponents: number;
  activeComponents: number;
  totalManufacturers: number;
  totalSuppliers: number;
  currentPriceRecords: number;
  historicalPriceRecords: number;
  totalProjects?: number;
  activePanels?: number;
  totalEstimatesValue?: number;
}

// ==========================================
// PHASE 2 ESTIMATION & COSTING SYSTEM TYPES
// ==========================================

export type ProjectStatus = 'DRAFT' | 'IN_ESTIMATION' | 'ESTIMATED' | 'QUOTED' | 'WON' | 'LOST';

export interface Project {
  projectID: number;
  projectCode: string;
  projectName: string;
  clientName: string;
  clientID?: number;
  consultantName?: string;
  location: string;
  authority: string; // DEWA, SEWA, FEWA, Kahramaa, ADDC, IEC Standard
  status: ProjectStatus;
  tenderStage?: 'INTAKE' | 'SLD_REVIEW' | 'ENGINEERING' | 'COMMERCIAL_REVIEW' | 'SUBMITTED' | 'AWARDED' | 'LOST';
  createdDate: string;
  dueDate: string;
  currency: string;
  assignedEstimator: string;
  notes?: string;
  panelsCount?: number;
  totalCost?: number;
  sellingPrice?: number;
  targetMarginPercent?: number;
  primaryOEM?: string;
  copperRatePerKg?: number;
}

export type CableEntryType = 'TOP' | 'BOTTOM' | 'BOTH';

export interface EstimateItem {
  itemID: number;
  panelID: number;
  componentID?: number;
  circuitTag: string; // e.g. "INCOMER-1", "FEEDER-01", "APFC-STEP-1"
  description: string;
  categoryCode?: string;
  manufacturerCode?: string;
  partNumber: string;
  rating?: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number; // quantity * unitCost
  supplierName?: string;
  isAuxiliary?: boolean;
}

export interface PanelLabourHour {
  activityCode: string;
  activityName: string;
  category: string;
  hours: number;
  ratePerHour: number;
  totalCost: number;
}

export interface EstimatePanel {
  panelID: number;
  projectID: number;
  panelTag: string; // e.g. "MDB-01", "SMDB-GF", "APFC-01", "MCC-PUMPS"
  panelName: string;
  panelTypeID: number;
  panelTypeCode: string; // MDB, SMDB, APFC, MCC, ATS, DB
  incomerRating: number; // Amps: e.g. 2500, 1600, 400
  ratedVoltage: number; // 415V
  shortCircuitRating: number; // kA, e.g. 50, 65
  formOfSeparation: string; // "Form 2b", "Form 3b", "Form 4b Type 6", "Form 4b Type 7"
  ipRating: string; // "IP42", "IP54", "IP65"
  cableEntry: CableEntryType;
  
  // Copper Busbar Parameters
  busbarCurrentDensity: number; // A/mm2, e.g. 1.5
  copperBaseRatePerKg: number; // AED/kg, e.g. 42.00
  copperCrossSectionMm2: number; // computed mm2
  copperWeightKg: number; // computed kg
  copperCost: number; // computed cost
  
  // Enclosure Parameters
  enclosureHeight: number; // mm, e.g. 2100
  enclosureWidth: number; // mm, e.g. 3200
  enclosureDepth: number; // mm, e.g. 800
  numberOfColumns: number;
  sheetMetalThickness: number; // mm, e.g. 2.0
  enclosureCost: number; // computed cost

  // Equipment & Labour Summary
  equipmentCost: number; // sum of items totalCost
  labourHours: number;
  labourCost: number;
  totalPanelCost: number; // equipmentCost + copperCost + enclosureCost + labourCost
  
  // Child Items & Labour details
  items: EstimateItem[];
  labourHoursDetail?: PanelLabourHour[];
}

export interface Quotation {
  quotationID: number;
  quotationNumber: string; // e.g. "QT-2026-084-R0"
  projectID: number;
  projectCode: string;
  projectName: string;
  clientName: string;
  revisionNumber: string; // "R0", "R1", "R2"
  quotationDate: string;
  validityDays: number;
  currency: string;
  
  // Cost breakdown
  totalEquipmentCost: number;
  totalCopperCost: number;
  totalEnclosureCost: number;
  totalLabourCost: number;
  totalDirectCost: number;

  // Commercial Margins
  overheadPercent: number; // e.g. 8%
  overheadAmount: number;
  profitMarginPercent: number; // e.g. 15%
  profitMarginAmount: number;
  subtotalBeforeTax: number;
  taxPercent: number; // e.g. 5% VAT
  taxAmount: number;
  grandTotal: number;

  // Commercial Terms
  paymentTerms: string;
  deliveryPeriodWeeks: number;
  warrantyMonths: number;
  inclusions: string[];
  exclusions: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'REVISED';
}

export interface ConsolidatedBOMItem {
  id: string;
  partNumber: string;
  description: string;
  category: string;
  manufacturer: string;
  totalQuantity: number;
  unit: string;
  unitRate: number;
  extendedCost: number;
  usedInPanels: string[];
}

export interface ImportedComponentRow {
  componentCode?: string;
  partNumber: string;
  componentName: string;
  categoryName: string;
  manufacturerName: string;
  model?: string;
  description?: string;
  unit?: string;
  ratedCurrent?: number;
  ratedVoltage?: number;
  poles?: number;
  breakingCapacity?: number;
  ipRating?: string;
  mountingType?: string;
  iecStandard?: string;
  frequency?: number;
  // Optional initial pricing
  supplierName?: string;
  currency?: string;
  listPrice?: number;
  discountPercent?: number;
  quotationReference?: string;
}

export interface BulkImportOptions {
  updateExisting: boolean;
  autoCreateCategory: boolean;
  autoCreateManufacturer: boolean;
  autoCreateSupplier: boolean;
  importPricing: boolean;
}

export interface BulkImportResult {
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  pricesAddedCount: number;
  categoriesCreatedCount: number;
  manufacturersCreatedCount: number;
  errors: string[];
}

export interface OEMDiscountProfile {
  manufacturerCode: string;
  manufacturerName: string;
  standardDiscountPercent: number;
}

export interface BureauClient {
  clientID: number;
  clientCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  authority: string;
  defaultPaymentTerms: string;
  defaultWarrantyMonths: number;
  defaultDeliveryWeeks: number;
  targetMarginPercent: number;
  defaultOverheadPercent: number;
  oemDiscounts: OEMDiscountProfile[];
  notes?: string;
  activeTendersCount?: number;
  totalWonTendersValue?: number;
}

export interface ValueEngineeringOption {
  oemCode: string;
  oemName: string;
  equipmentCost: number;
  copperCost: number;
  enclosureCost: number;
  labourCost: number;
  totalDirectCost: number;
  overheadAmount: number;
  profitAmount: number;
  sellingPrice: number;
  leadTimeWeeks: number;
  technicalComplianceRating: number; // e.g. 98%
  complianceNotes: string;
}

export * from './engineering';

