// ============================================================================
// CLOUD SQL POSTGRESQL SCHEMA (Drizzle ORM)
// Multi-Tenant SaaS Platform for LV Switchgear Manufacturers (UAE & Global)
// ============================================================================

import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  numeric, 
  boolean, 
  timestamp, 
  date,
  jsonb
} from 'drizzle-orm/pg-core';

// 1. COMPANIES (Tenants)
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  companyCode: text('company_code').notNull().unique(), // e.g., 'GULF-PANELS-01'
  companyName: text('company_name').notNull(),
  tradeLicenseNo: text('trade_license_no'),
  country: text('country').notNull().default('United Arab Emirates'),
  city: text('city').notNull().default('Dubai'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  vatTrn: text('vat_trn'), // UAE Tax Registration Number (15 digits)
  currency: text('currency').notNull().default('AED'),
  defaultCostingMethod: text('default_costing_method').notNull().default('MARKUP'), // 'MARKUP' or 'MARGIN'
  defaultMarginPercent: numeric('default_margin_percent', { precision: 5, scale: 2 }).notNull().default('15.00'),
  defaultVatPercent: numeric('default_vat_percent', { precision: 5, scale: 2 }).notNull().default('5.00'),
  plan: text('plan').notNull().default('STARTER'), // 'STARTER', 'PROFESSIONAL', 'ADVANCED', 'BUSINESS'
  subscriptionStatus: text('subscription_status').notNull().default('TRIAL'), // 'TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED'
  trialEndsAt: timestamp('trial_ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. USERS
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  companyId: integer('company_id').references(() => companies.id),
  email: text('email').notNull(),
  fullName: text('full_name').notNull().default('Engineer'),
  role: text('role').notNull().default('ESTIMATION_ENGINEER'), 
  // Roles: 'PLATFORM_ADMIN', 'COMPANY_OWNER', 'ESTIMATION_ENGINEER', 'DESIGN_ENGINEER', 'PURCHASE_OFFICER', 'PRODUCTION_USER', 'READ_ONLY'
  phone: text('phone'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. SUBSCRIPTIONS
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  plan: text('plan').notNull().default('STARTER'), // 'STARTER' (299), 'PROFESSIONAL' (499), 'ADVANCED' (999), 'BUSINESS' (1999)
  priceAedMonthly: numeric('price_aed_monthly', { precision: 10, scale: 2 }).notNull().default('299.00'),
  billingCycle: text('billing_cycle').notNull().default('MONTHLY'), // 'MONTHLY', 'ANNUAL'
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'TRIAL', 'EXPIRED'
  maxProjects: integer('max_projects').notNull().default(10),
  maxUsers: integer('max_users').notNull().default(3),
  featuresJson: text('features_json'),
  currentPeriodStart: timestamp('current_period_start').defaultNow(),
  currentPeriodEnd: timestamp('current_period_end'),
  autoRenew: boolean('auto_renew').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. PROJECTS (Tenders & RFQs)
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectCode: text('project_code').notNull(),
  projectName: text('project_name').notNull(),
  clientName: text('client_name').notNull(),
  consultantName: text('consultant_name'),
  contractorName: text('contractor_name'),
  authority: text('authority').notNull().default('DEWA'), // 'DEWA', 'SEWA', 'ADDC', 'AADC', 'Kahramaa', 'SEC', 'General'
  status: text('status').notNull().default('ESTIMATION'), // 'DRAFT', 'ESTIMATION', 'TENDERED', 'WON', 'LOST'
  currency: text('currency').notNull().default('AED'),
  dueDate: date('due_date'),
  
  // Costing figures
  directMaterialCost: numeric('direct_material_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  copperCost: numeric('copper_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  enclosureCost: numeric('enclosure_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  labourCost: numeric('labour_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  overheadCost: numeric('overhead_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  
  // Commercial figures
  costingMethod: text('costing_method').notNull().default('MARKUP'), // 'MARKUP' or 'MARGIN'
  marginPercent: numeric('margin_percent', { precision: 5, scale: 2 }).notNull().default('15.00'),
  sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).notNull().default('0.00'),
  vatPercent: numeric('vat_percent', { precision: 5, scale: 2 }).notNull().default('5.00'),
  vatAmount: numeric('vat_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  grandTotal: numeric('grand_total', { precision: 12, scale: 2 }).notNull().default('0.00'),
  
  notes: text('notes'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. ESTIMATE PANELS (Switchboards within Project)
export const estimatePanels = pgTable('estimate_panels', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  panelTag: text('panel_tag').notNull(), // e.g. 'MDB-01', 'ATS-01', 'SMDB-B1'
  panelName: text('panel_name').notNull(),
  panelTypeCode: text('panel_type_code').notNull().default('MDB'), 
  // 'MDB', 'SMDB', 'DB', 'MCC', 'PCC', 'ATS', 'APFC', 'CAPACITOR_BANK', 'FEEDER_PILLAR'
  
  ratedCurrent: integer('rated_current').notNull().default(1600),
  faultLevelKa: integer('fault_level_ka').notNull().default(50),
  voltageV: integer('voltage_v').notNull().default(415),
  frequencyHz: integer('frequency_hz').notNull().default(50),
  formOfSeparation: text('form_of_separation').notNull().default('Form 4b'),
  ipRating: text('ip_rating').notNull().default('IP54'),
  mountingType: text('mounting_type').notNull().default('Floor Standing'),
  
  // Dimensions mm
  widthMm: integer('width_mm').notNull().default(2400),
  heightMm: integer('height_mm').notNull().default(2200),
  depthMm: integer('depth_mm').notNull().default(1000),
  
  // Cost breakdown for this panel
  equipmentCost: numeric('equipment_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  copperWeightKg: numeric('copper_weight_kg', { precision: 8, scale: 2 }).notNull().default('0.00'),
  copperCost: numeric('copper_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  enclosureCost: numeric('enclosure_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  labourHours: numeric('labour_hours', { precision: 8, scale: 2 }).notNull().default('0.00'),
  labourCost: numeric('labour_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalPanelCost: numeric('total_panel_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  
  // Serialized SLD Topology JSON (Single Source of Truth)
  sldTopologyJson: text('sld_topology_json'),
  gaLayoutJson: text('ga_layout_json'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. ESTIMATE ITEMS (Feeders & components within panel)
export const estimateItems = pgTable('estimate_items', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  panelId: integer('panel_id').references(() => estimatePanels.id).notNull(),
  componentId: integer('component_id'),
  feederTag: text('feeder_tag').notNull(), // e.g. 'INC-01', 'FDR-01'
  description: text('description').notNull(),
  deviceType: text('device_type').notNull().default('MCCB'), // 'ACB', 'MCCB', 'MCB', 'CONTACTOR', 'CAPACITOR', 'METER', 'BUSBAR'
  manufacturer: text('manufacturer').notNull().default('ABB'),
  partNumber: text('part_number').notNull(),
  ratingA: integer('rating_a').notNull().default(100),
  poles: integer('poles').notNull().default(4),
  icuKa: integer('icu_ka').notNull().default(36),
  quantity: integer('quantity').notNull().default(1),
  unit: text('unit').notNull().default('NOS'),
  unitCost: numeric('unit_cost', { precision: 10, scale: 2 }).notNull().default('0.00'),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).notNull().default('0.00'),
  netCost: numeric('net_cost', { precision: 10, scale: 2 }).notNull().default('0.00'),
  totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. COMPONENTS MASTER CATALOG (Global + Tenant Confidential Overrides)
export const components = pgTable('components', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id), // NULL = global catalog, integer = tenant custom
  componentCode: text('component_code').notNull(),
  categoryCode: text('category_code').notNull(), // 'ACB', 'MCCB', 'MCB', 'CONTACTOR', 'RELAY', 'CAPACITOR', 'METER', 'ACCESSORY'
  manufacturer: text('manufacturer').notNull(), // 'ABB', 'Schneider Electric', 'Siemens', 'LS Electric', 'Eaton'
  productFamily: text('product_family'), // 'Emax 2', 'Tmax XT', 'ComPact NSX', 'MasterPact MTZ'
  partNumber: text('part_number').notNull(),
  model: text('model'),
  description: text('description').notNull(),
  ratedVoltage: integer('rated_voltage').default(415),
  ratedCurrent: integer('rated_current'),
  poles: integer('poles').default(4),
  breakingCapacityKa: integer('breaking_capacity_ka'),
  tripUnit: text('trip_unit'), // 'Ekip Dip', 'MicroLogic 2.0', 'TMD'
  unit: text('unit').notNull().default('NOS'),
  purchasePrice: numeric('purchase_price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  currency: text('currency').notNull().default('AED'),
  supplier: text('supplier'),
  datasheetUrl: text('datasheet_url'),
  isSampleData: boolean('is_sample_data').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 8. SUPPLIER PRICES (Strict Historical Tracking - Never Overwritten)
export const supplierPrices = pgTable('supplier_prices', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  componentId: integer('component_id').references(() => components.id).notNull(),
  supplierName: text('supplier_name').notNull(),
  currency: text('currency').notNull().default('AED'),
  listPrice: numeric('list_price', { precision: 10, scale: 2 }).notNull(),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).notNull().default('0.00'),
  netPrice: numeric('net_price', { precision: 10, scale: 2 }).notNull(),
  leadTimeDays: integer('lead_time_days').default(14),
  priceDate: date('price_date').defaultNow(),
  validUntil: date('valid_until'),
  quotationRef: text('quotation_ref'),
  isCurrent: boolean('is_current').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. QUOTATIONS (Formal Tender Submissions)
export const quotations = pgTable('quotations', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  quotationNumber: text('quotation_number').notNull(),
  revision: integer('revision').notNull().default(0),
  quotationDate: date('quotation_date').defaultNow(),
  validityDays: integer('validity_days').notNull().default(30),
  currency: text('currency').notNull().default('AED'),
  paymentTerms: text('payment_terms').notNull().default('10% Advance, 90% Against Delivery / PDC'),
  deliveryWeeks: text('delivery_weeks').notNull().default('6 to 8 Weeks upon approval of drawings'),
  warrantyMonths: integer('warranty_months').notNull().default(12),
  exclusions: text('exclusions'),
  specialConditions: text('special_conditions'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0.00'),
  vatPercent: numeric('vat_percent', { precision: 5, scale: 2 }).notNull().default('5.00'),
  vatAmount: numeric('vat_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  grandTotal: numeric('grand_total', { precision: 12, scale: 2 }).notNull().default('0.00'),
  status: text('status').notNull().default('DRAFT'), // 'DRAFT', 'SENT', 'ACCEPTED', 'REVISED', 'REJECTED'
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. BILL OF MATERIALS (BOM)
export const boms = pgTable('boms', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  bomNumber: text('bom_number').notNull(),
  version: integer('version').notNull().default(1),
  status: text('status').notNull().default('DRAFT'), // 'DRAFT', 'APPROVED', 'HANDED_OVER'
  totalItems: integer('total_items').notNull().default(0),
  totalMaterialCost: numeric('total_material_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. PRODUCTION JOBS & HANDOVER (Workshop Job Cards)
export const productionJobs = pgTable('production_jobs', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  panelId: integer('panel_id').references(() => estimatePanels.id),
  jobNumber: text('job_number').notNull(), // e.g. 'JOB-2026-001'
  panelTag: text('panel_tag').notNull(),
  status: text('status').notNull().default('QUEUED'), 
  // 'QUEUED', 'FABRICATION', 'BUSBAR_WORK', 'ASSEMBLY', 'WIRING', 'TESTING', 'FAT_PASSED', 'DISPATCHED'
  targetDate: date('target_date'),
  actualCompletionDate: date('actual_completion_date'),
  supervisor: text('supervisor'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 12. PURCHASE REQUISITIONS (Material Procurement)
export const purchaseRequisitions = pgTable('purchase_requisitions', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  prNumber: text('pr_number').notNull(),
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'APPROVED', 'PO_ISSUED'
  supplierName: text('supplier_name').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  requestedBy: text('requested_by'),
  itemsSummary: text('items_summary'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. AUDIT LOGS (Compliance & Change Tracking)
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  userId: integer('user_id'),
  userEmail: text('user_email'),
  action: text('action').notNull(), // 'CREATE_ESTIMATE', 'UPDATE_PRICE', 'APPROVE_BOM', etc.
  entity: text('entity').notNull(),
  entityId: integer('entity_id'),
  details: text('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// 14. PURCHASE ORDERS (Booked Commercial Orders & Verification)
export const purchaseOrders = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  poNumber: text('po_number').notNull(),
  quotationId: integer('quotation_id').references(() => quotations.id),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  clientName: text('client_name').notNull(),
  salesperson: text('salesperson').notNull(),
  estimator: text('estimator'),
  poReceivedDate: date('po_received_date').defaultNow(),
  poValueExVat: numeric('po_value_ex_vat', { precision: 12, scale: 2 }).notNull().default('0.00'),
  vatPercent: numeric('vat_percent', { precision: 5, scale: 2 }).notNull().default('5.00'),
  vatAmount: numeric('vat_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  poValueIncVat: numeric('po_value_inc_vat', { precision: 12, scale: 2 }).notNull().default('0.00'),
  currency: text('currency').notNull().default('AED'),
  status: text('status').notNull().default('DRAFT'), // 'DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'CANCELLED'
  isPartialPo: boolean('is_partial_po').notNull().default(false),
  partialPoNote: text('partial_po_note'),
  poDocumentRef: text('po_document_ref'),
  remarks: text('remarks'),
  enteredBy: text('entered_by').notNull(),
  verifiedBy: text('verified_by'),
  verificationDate: date('verification_date'),
  auditHistoryJson: text('audit_history_json'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 15. FOLLOW-UP ACTIVITIES (Sales Pipeline CRM)
export const followUpActivities = pgTable('follow_up_activities', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  quotationId: integer('quotation_id').references(() => quotations.id),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  clientName: text('client_name').notNull(),
  salesperson: text('salesperson').notNull(),
  contactPerson: text('contact_person'),
  channel: text('channel').notNull().default('PHONE'), // 'PHONE', 'EMAIL', 'MEETING', 'SITE_VISIT', 'WHATSAPP'
  notes: text('notes').notNull(),
  nextActionDate: date('next_action_date'),
  nextActionNotes: text('next_action_notes'),
  statusUpdate: text('status_update'),
  activityDate: date('activity_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// RELATIONS
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  subscriptions: many(subscriptions),
}));

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.companyId],
    references: [companies.id],
  }),
  panels: many(estimatePanels),
  quotations: many(quotations),
  boms: many(boms),
}));

export const estimatePanelsRelations = relations(estimatePanels, ({ one, many }) => ({
  project: one(projects, {
    fields: [estimatePanels.projectId],
    references: [projects.id],
  }),
  items: many(estimateItems),
}));

export const estimateItemsRelations = relations(estimateItems, ({ one }) => ({
  panel: one(estimatePanels, {
    fields: [estimateItems.panelId],
    references: [estimatePanels.id],
  }),
}));
