import { 
  Manufacturer, 
  ComponentCategory, 
  Component, 
  Supplier, 
  SupplierPrice, 
  PanelType, 
  LabourRate, 
  AuditLogEntry, 
  DashboardMetrics,
  ImportedComponentRow,
  BulkImportOptions,
  BulkImportResult
} from '../types/index';
import { 
  INITIAL_MANUFACTURERS, 
  INITIAL_CATEGORIES, 
  INITIAL_COMPONENTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_PRICES, 
  INITIAL_PANEL_TYPES, 
  INITIAL_LABOUR_RATES, 
  INITIAL_AUDIT_LOGS 
} from '../data/seedData';
import {
  INITIAL_PROJECTS,
  INITIAL_PANELS,
  INITIAL_QUOTATIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_FOLLOW_UPS,
  DEMO_PURCHASE_ORDERS,
  DEMO_FOLLOW_UPS
} from '../data/phase2SeedData';
import { INITIAL_BUREAU_CLIENTS } from '../data/bureauSeedData';
import {
  calculateBusbarRequirements,
  calculateEnclosureCost,
  calculatePanelLabour
} from './engineeringCalculator';
import {
  Project,
  EstimatePanel,
  EstimateItem,
  Quotation,
  ConsolidatedBOMItem,
  BureauClient,
  ValueEngineeringOption,
  PurchaseOrder,
  FollowUpActivity,
  CommercialFilters,
  SalespersonPerformance,
  EstimatorPerformance,
  PredefinedAssembly
} from '../types/index';
import { PREDEFINED_ASSEMBLIES } from '../data/predefinedAssembliesData';

const STORAGE_KEYS = {
  MANUFACTURERS: 'lv_estimator_manufacturers_v1',
  CATEGORIES: 'lv_estimator_categories_v1',
  COMPONENTS: 'lv_estimator_components_v1',
  SUPPLIERS: 'lv_estimator_suppliers_v1',
  PRICES: 'lv_estimator_prices_v1',
  PANEL_TYPES: 'lv_estimator_panel_types_v1',
  LABOUR_RATES: 'lv_estimator_labour_rates_v1',
  AUDIT_LOGS: 'lv_estimator_audit_logs_v1',
  PROJECTS: 'lv_estimator_projects_v3',
  PANELS: 'lv_estimator_panels_v2',
  QUOTATIONS: 'lv_estimator_quotations_v3',
  BUREAU_CLIENTS: 'lv_estimator_bureau_clients_v2',
  PURCHASE_ORDERS: 'lv_estimator_purchase_orders_v3',
  FOLLOW_UPS: 'lv_estimator_follow_ups_v3',
  PREDEFINED_ASSEMBLIES: 'lv_estimator_predefined_assemblies_v1',
};

class StorageService {
  // --- Manufacturers ---
  getManufacturers(): Manufacturer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MANUFACTURERS);
    if (!raw) {
      this.saveManufacturers(INITIAL_MANUFACTURERS);
      return INITIAL_MANUFACTURERS;
    }
    const stored: Manufacturer[] = JSON.parse(raw);
    let changed = false;
    for (const initMfg of INITIAL_MANUFACTURERS) {
      if (!stored.some(m => m.manufacturerCode === initMfg.manufacturerCode)) {
        stored.push(initMfg);
        changed = true;
      }
    }
    if (changed) {
      this.saveManufacturers(stored);
    }
    return stored;
  }

  saveManufacturers(data: Manufacturer[]): void {
    localStorage.setItem(STORAGE_KEYS.MANUFACTURERS, JSON.stringify(data));
  }

  addManufacturer(m: Omit<Manufacturer, 'manufacturerID' | 'createdAt'>): Manufacturer {
    const list = this.getManufacturers();
    const newId = list.length > 0 ? Math.max(...list.map(x => x.manufacturerID)) + 1 : 1;
    const item: Manufacturer = {
      ...m,
      manufacturerID: newId,
      createdAt: new Date().toISOString(),
    };
    list.push(item);
    this.saveManufacturers(list);
    this.addAuditLog('system', 'master.Manufacturers', String(newId), 'CREATE_MANUFACTURER', undefined, `${item.manufacturerCode} - ${item.manufacturerName}`);
    return item;
  }

  updateManufacturer(m: Manufacturer): void {
    const list = this.getManufacturers();
    const idx = list.findIndex(x => x.manufacturerID === m.manufacturerID);
    if (idx !== -1) {
      list[idx] = m;
      this.saveManufacturers(list);
    }
  }

  // --- Categories ---
  getCategories(): ComponentCategory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      this.saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  }

  saveCategories(data: ComponentCategory[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
  }

  addCategory(c: Omit<ComponentCategory, 'categoryID'>): ComponentCategory {
    const list = this.getCategories();
    const newId = list.length > 0 ? Math.max(...list.map(x => x.categoryID)) + 1 : 1;
    const item: ComponentCategory = {
      ...c,
      categoryID: newId,
    };
    list.push(item);
    this.saveCategories(list);
    this.addAuditLog('system', 'master.Categories', String(newId), 'CREATE_CATEGORY', undefined, `${item.categoryCode} - ${item.categoryName}`);
    return item;
  }

  // --- Suppliers ---
  getSuppliers(): Supplier[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (!raw) {
      this.saveSuppliers(INITIAL_SUPPLIERS);
      return INITIAL_SUPPLIERS;
    }
    return JSON.parse(raw);
  }

  saveSuppliers(data: Supplier[]): void {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data));
  }

  addSupplier(s: Omit<Supplier, 'supplierID' | 'createdAt'>): Supplier {
    const list = this.getSuppliers();
    const newId = list.length > 0 ? Math.max(...list.map(x => x.supplierID)) + 1 : 1;
    const item: Supplier = {
      ...s,
      supplierID: newId,
      createdAt: new Date().toISOString(),
    };
    list.push(item);
    this.saveSuppliers(list);
    this.addAuditLog('system', 'master.Suppliers', String(newId), 'CREATE_SUPPLIER', undefined, `${item.supplierCode} - ${item.supplierName}`);
    return item;
  }

  updateSupplier(s: Supplier): void {
    const list = this.getSuppliers();
    const idx = list.findIndex(x => x.supplierID === s.supplierID);
    if (idx !== -1) {
      list[idx] = s;
      this.saveSuppliers(list);
    }
  }

  // --- Components ---
  getComponents(): Component[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPONENTS);
    let components: Component[];
    if (!raw) {
      components = INITIAL_COMPONENTS;
      this.saveComponents(components);
    } else {
      components = JSON.parse(raw);
      let changed = false;
      for (const initC of INITIAL_COMPONENTS) {
        if (!components.some(c => c.componentID === initC.componentID || c.componentCode === initC.componentCode)) {
          components.push(initC);
          changed = true;
        }
      }
      if (changed) {
        this.saveComponents(components);
      }
    }

    // Attach current active prices
    const prices = this.getPrices();
    const currentPricesMap = new Map<number, SupplierPrice>();
    prices.filter(p => p.isCurrent).forEach(p => {
      currentPricesMap.set(p.componentID, p);
    });

    return components.map(c => ({
      ...c,
      currentPrice: currentPricesMap.get(c.componentID),
    }));
  }

  saveComponents(data: Component[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(data));
  }

  addComponent(comp: Omit<Component, 'componentID' | 'createdAt'>): Component {
    const list = this.getComponents();
    const newId = list.length > 0 ? Math.max(...list.map(x => x.componentID)) + 1 : 1;
    
    // Resolve Category and Manufacturer names
    const cat = this.getCategories().find(c => c.categoryID === comp.categoryID);
    const mfg = this.getManufacturers().find(m => m.manufacturerID === comp.manufacturerID);

    const item: Component = {
      ...comp,
      componentID: newId,
      categoryName: cat?.categoryName || comp.categoryName,
      manufacturerName: mfg?.manufacturerName || comp.manufacturerName,
      manufacturerCode: mfg?.manufacturerCode || comp.manufacturerCode,
      createdAt: new Date().toISOString(),
    };

    list.push(item);
    this.saveComponents(list);
    this.addAuditLog('system', 'master.Components', String(newId), 'CREATE_COMPONENT', undefined, `${item.componentCode} | ${item.partNumber} | ${item.componentName}`);
    return item;
  }

  // Aliases for convenience
  getAllPrices(): SupplierPrice[] {
    return this.getPrices();
  }

  getPriceHistory(componentID: number): SupplierPrice[] {
    return this.getPriceHistoryForComponent(componentID);
  }

  resetToSeed(): void {
    this.resetAllData();
  }

  updateComponent(compOrId: Component | number, patchData?: Partial<Component>): void {
    const list = this.getComponents();
    const id = typeof compOrId === 'number' ? compOrId : compOrId.componentID;
    const idx = list.findIndex(c => c.componentID === id);
    if (idx !== -1) {
      const old = list[idx];
      const comp = typeof compOrId === 'number' ? { ...old, ...patchData } : compOrId;
      const cat = this.getCategories().find(c => c.categoryID === comp.categoryID);
      const mfg = this.getManufacturers().find(m => m.manufacturerID === comp.manufacturerID);

      const updated: Component = {
        ...comp,
        categoryName: cat?.categoryName || comp.categoryName,
        manufacturerName: mfg?.manufacturerName || comp.manufacturerName,
        manufacturerCode: mfg?.manufacturerCode || comp.manufacturerCode,
        updatedAt: new Date().toISOString(),
      };

      list[idx] = updated;
      this.saveComponents(list);
      this.addAuditLog('system', 'master.Components', String(id), 'UPDATE_COMPONENT', `${old.partNumber} (${old.componentName})`, `${updated.partNumber} (${updated.componentName})`);
    }
  }

  deleteComponent(componentID: number): void {
    const list = this.getComponents();
    const target = list.find(c => c.componentID === componentID);
    if (target) {
      const filtered = list.filter(c => c.componentID !== componentID);
      this.saveComponents(filtered);
      this.addAuditLog('system', 'master.Components', String(componentID), 'DELETE_COMPONENT', `${target.componentCode} - ${target.partNumber}`, undefined);
    }
  }

  bulkImportComponents(
    rows: ImportedComponentRow[],
    options: BulkImportOptions
  ): BulkImportResult {
    let components = this.getComponents();
    let categories = this.getCategories();
    let manufacturers = this.getManufacturers();
    let suppliers = this.getSuppliers();

    let createdCount = 0;
    let updatedCount = 0;
    let pricesAddedCount = 0;
    let categoriesCreatedCount = 0;
    let manufacturersCreatedCount = 0;
    const errors: string[] = [];

    // Helper to find or create category
    const resolveCategory = (catName: string): ComponentCategory | undefined => {
      if (!catName || !catName.trim()) return undefined;
      const trimmed = catName.trim();
      let found = categories.find(c => 
        c.categoryName.toLowerCase() === trimmed.toLowerCase() ||
        c.categoryCode.toLowerCase() === trimmed.toLowerCase()
      );
      if (!found && options.autoCreateCategory) {
        const newCatCode = (trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)) || 'CAT';
        const newCat = this.addCategory({
          categoryCode: newCatCode,
          categoryName: trimmed,
          isActive: true,
          defaultIECStandard: 'IEC 60947-2',
        });
        categories = this.getCategories();
        categoriesCreatedCount++;
        found = newCat;
      }
      return found;
    };

    // Helper to find or create manufacturer
    const resolveManufacturer = (mfgName: string): Manufacturer | undefined => {
      if (!mfgName || !mfgName.trim()) return undefined;
      const trimmed = mfgName.trim();
      let found = manufacturers.find(m => 
        m.manufacturerName.toLowerCase() === trimmed.toLowerCase() ||
        m.manufacturerCode.toLowerCase() === trimmed.toLowerCase()
      );
      if (!found && options.autoCreateManufacturer) {
        const newMfgCode = (trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)) || 'OEM';
        const newMfg = this.addManufacturer({
          manufacturerCode: newMfgCode,
          manufacturerName: trimmed,
          isActive: true,
          country: 'Global',
        });
        manufacturers = this.getManufacturers();
        manufacturersCreatedCount++;
        found = newMfg;
      }
      return found;
    };

    // Helper to find or create supplier
    const resolveSupplier = (suppName?: string): Supplier | undefined => {
      if (!suppName || !suppName.trim()) return undefined;
      const trimmed = suppName.trim();
      let found = suppliers.find(s => 
        s.supplierName.toLowerCase() === trimmed.toLowerCase() ||
        s.supplierCode.toLowerCase() === trimmed.toLowerCase()
      );
      if (!found && options.autoCreateSupplier) {
        const newSuppCode = 'SUP-' + (trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'NEW');
        const newSupp = this.addSupplier({
          supplierCode: newSuppCode,
          supplierName: trimmed,
          isActive: true,
          country: 'United Arab Emirates',
          currency: 'AED',
          paymentTerms: '30 Days Net',
        });
        suppliers = this.getSuppliers();
        found = newSupp;
      }
      return found;
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 1;

      if (!row.partNumber || !row.partNumber.trim()) {
        errors.push(`Row ${rowIndex}: Part Number is missing. Skipped.`);
        continue;
      }
      if (!row.componentName || !row.componentName.trim()) {
        errors.push(`Row ${rowIndex}: Component Name is missing. Skipped.`);
        continue;
      }

      const category = resolveCategory(row.categoryName || 'General LV Switchgear');
      const manufacturer = resolveManufacturer(row.manufacturerName || 'Generic OEM');

      if (!category) {
        errors.push(`Row ${rowIndex}: Category "${row.categoryName}" could not be resolved.`);
        continue;
      }
      if (!manufacturer) {
        errors.push(`Row ${rowIndex}: Manufacturer "${row.manufacturerName}" could not be resolved.`);
        continue;
      }

      const partNumTrimmed = row.partNumber.trim();
      // Re-fetch current components list to reflect any prior additions in this loop
      components = this.getComponents();
      const existingComp = components.find(c => 
        c.partNumber.trim().toLowerCase() === partNumTrimmed.toLowerCase()
      );

      let targetCompID: number;

      if (existingComp) {
        targetCompID = existingComp.componentID;
        if (options.updateExisting) {
          const updated: Component = {
            ...existingComp,
            componentName: row.componentName.trim() || existingComp.componentName,
            componentCode: row.componentCode?.trim() || existingComp.componentCode,
            categoryID: category.categoryID,
            categoryName: category.categoryName,
            manufacturerID: manufacturer.manufacturerID,
            manufacturerName: manufacturer.manufacturerName,
            manufacturerCode: manufacturer.manufacturerCode,
            model: row.model?.trim() !== undefined ? row.model.trim() : existingComp.model,
            description: row.description?.trim() !== undefined ? row.description.trim() : existingComp.description,
            unit: row.unit?.trim() || existingComp.unit || 'EA',
            ratedVoltage: row.ratedVoltage !== undefined && !isNaN(Number(row.ratedVoltage)) ? Number(row.ratedVoltage) : existingComp.ratedVoltage,
            ratedCurrent: row.ratedCurrent !== undefined && !isNaN(Number(row.ratedCurrent)) ? Number(row.ratedCurrent) : existingComp.ratedCurrent,
            poles: row.poles !== undefined && !isNaN(Number(row.poles)) ? Number(row.poles) : existingComp.poles,
            breakingCapacity: row.breakingCapacity !== undefined && !isNaN(Number(row.breakingCapacity)) ? Number(row.breakingCapacity) : existingComp.breakingCapacity,
            frequency: row.frequency !== undefined && !isNaN(Number(row.frequency)) ? Number(row.frequency) : existingComp.frequency,
            ipRating: row.ipRating?.trim() || existingComp.ipRating,
            mountingType: row.mountingType?.trim() || existingComp.mountingType,
            iecStandard: row.iecStandard?.trim() || existingComp.iecStandard,
            updatedAt: new Date().toISOString(),
          };
          this.updateComponent(updated);
          updatedCount++;
        }
      } else {
        const autoCode = row.componentCode?.trim() || 
          `${manufacturer.manufacturerCode}-${category.categoryCode}-${partNumTrimmed.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase() || 'ITM'}`;
        const newComp = this.addComponent({
          componentCode: autoCode,
          partNumber: partNumTrimmed,
          componentName: row.componentName.trim(),
          categoryID: category.categoryID,
          categoryName: category.categoryName,
          manufacturerID: manufacturer.manufacturerID,
          manufacturerName: manufacturer.manufacturerName,
          manufacturerCode: manufacturer.manufacturerCode,
          model: row.model?.trim() || '',
          description: row.description?.trim() || '',
          unit: row.unit?.trim() || 'EA',
          ratedVoltage: row.ratedVoltage !== undefined && !isNaN(Number(row.ratedVoltage)) ? Number(row.ratedVoltage) : 415,
          ratedCurrent: row.ratedCurrent !== undefined && !isNaN(Number(row.ratedCurrent)) ? Number(row.ratedCurrent) : undefined,
          poles: row.poles !== undefined && !isNaN(Number(row.poles)) ? Number(row.poles) : 3,
          breakingCapacity: row.breakingCapacity !== undefined && !isNaN(Number(row.breakingCapacity)) ? Number(row.breakingCapacity) : undefined,
          frequency: row.frequency !== undefined && !isNaN(Number(row.frequency)) ? Number(row.frequency) : 50,
          ipRating: row.ipRating?.trim() || 'IP40',
          mountingType: row.mountingType?.trim() || 'Fixed',
          iecStandard: row.iecStandard?.trim() || category.defaultIECStandard || 'IEC 60947-2',
          isActive: true,
        });
        targetCompID = newComp.componentID;
        createdCount++;
      }

      // Check if price information is provided
      if (options.importPricing && row.listPrice !== undefined && Number(row.listPrice) > 0) {
        const supp = resolveSupplier(row.supplierName || `${manufacturer.manufacturerName} Authorized Distributor`);
        if (supp) {
          const listPrice = Number(row.listPrice);
          const discountPercent = row.discountPercent !== undefined && !isNaN(Number(row.discountPercent)) ? Number(row.discountPercent) : 0;
          this.addOrRevisePrice({
            componentID: targetCompID,
            supplierID: supp.supplierID,
            currency: row.currency || supp.currency || 'AED',
            listPrice: listPrice,
            discountPercent: discountPercent,
            minimumQuantity: 1,
            priceDate: new Date().toISOString().split('T')[0],
            quotationReference: row.quotationReference || 'EXCEL_IMPORT',
            notes: 'Imported from Master Component Excel/CSV Workbook',
            user: 'Excel Importer',
          });
          pricesAddedCount++;
        }
      }
    }

    this.addAuditLog(
      'system',
      'master.Components',
      'BULK_IMPORT',
      'BULK_IMPORT_COMPONENTS',
      undefined,
      `Excel Import summary: ${createdCount} created, ${updatedCount} updated, ${pricesAddedCount} prices, ${errors.length} skipped`
    );

    return {
      totalProcessed: rows.length,
      createdCount,
      updatedCount,
      pricesAddedCount,
      categoriesCreatedCount,
      manufacturersCreatedCount,
      errors,
    };
  }

  // --- Pricing with Strict Historical Preservation ---
  getPrices(): SupplierPrice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICES);
    if (!raw) {
      this.savePrices(INITIAL_PRICES);
      return INITIAL_PRICES;
    }
    const stored: SupplierPrice[] = JSON.parse(raw);
    let changed = false;
    for (const initP of INITIAL_PRICES) {
      if (!stored.some(p => p.supplierPriceID === initP.supplierPriceID)) {
        stored.push(initP);
        changed = true;
      }
    }
    if (changed) {
      this.savePrices(stored);
    }
    return stored;
  }

  savePrices(data: SupplierPrice[]): void {
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(data));
  }

  /**
   * Core Engineering Rule:
   * When a new price is added for an existing component and supplier:
   * 1. DO NOT overwrite the old price!
   * 2. Set the old price's isCurrent = false and validUntil = priceDate - 1 day
   * 3. Insert the new price row as isCurrent = true
   * 4. Record the price change in the audit trail
   */
  addOrRevisePrice(input: {
    componentID: number;
    supplierID: number;
    supplierPartNumber?: string;
    currency: string;
    listPrice: number;
    discountPercent: number;
    minimumQuantity: number;
    leadTimeDays?: number;
    priceDate: string;
    validUntil?: string;
    quotationReference?: string;
    notes?: string;
    user?: string;
  }): SupplierPrice {
    const prices = this.getPrices();
    const components = this.getComponents();
    const suppliers = this.getSuppliers();

    const comp = components.find(c => c.componentID === input.componentID);
    const supp = suppliers.find(s => s.supplierID === input.supplierID);

    // Find any existing current price for this exact component and supplier
    const oldCurrent = prices.find(p => p.componentID === input.componentID && p.supplierID === input.supplierID && p.isCurrent);

    if (oldCurrent) {
      oldCurrent.isCurrent = false;
      // If validUntil was not set, set it to the day before new priceDate
      if (!oldCurrent.validUntil) {
        const d = new Date(input.priceDate);
        d.setDate(d.getDate() - 1);
        oldCurrent.validUntil = d.toISOString().split('T')[0];
      }
    }

    const netPrice = Number((input.listPrice * (1 - input.discountPercent / 100)).toFixed(2));
    const newId = prices.length > 0 ? Math.max(...prices.map(p => p.supplierPriceID)) + 1 : 1;

    const newPriceRecord: SupplierPrice = {
      supplierPriceID: newId,
      componentID: input.componentID,
      componentName: comp?.componentName,
      componentCode: comp?.componentCode,
      partNumber: comp?.partNumber,
      manufacturerName: comp?.manufacturerName,
      supplierID: input.supplierID,
      supplierName: supp?.supplierName,
      supplierPartNumber: input.supplierPartNumber || comp?.partNumber,
      currency: input.currency || 'AED',
      listPrice: input.listPrice,
      discountPercent: input.discountPercent,
      netPrice: netPrice,
      minimumQuantity: input.minimumQuantity || 1,
      leadTimeDays: input.leadTimeDays ?? 14,
      priceDate: input.priceDate,
      validUntil: input.validUntil,
      quotationReference: input.quotationReference,
      notes: input.notes,
      isCurrent: true,
      createdBy: input.user || 'estimator',
      createdAt: new Date().toISOString(),
    };

    prices.push(newPriceRecord);
    this.savePrices(prices);

    // Audit Logging
    const action = oldCurrent ? 'PRICE_REVISION' : 'INSERT_PRICE';
    const oldVal = oldCurrent 
      ? `PriceID:${oldCurrent.supplierPriceID} | List:${oldCurrent.listPrice} | Disc:${oldCurrent.discountPercent}% | Net:${oldCurrent.netPrice} (Archived)`
      : undefined;
    const newVal = `PriceID:${newId} | List:${newPriceRecord.listPrice} | Disc:${newPriceRecord.discountPercent}% | Net:${netPrice} | Ref:${newPriceRecord.quotationReference || 'N/A'}`;

    this.addAuditLog(input.user || 'estimator', 'pricing.SupplierPrices', String(newId), action, oldVal, newVal);

    return newPriceRecord;
  }

  getPriceHistoryForComponent(componentID: number): SupplierPrice[] {
    const prices = this.getPrices();
    return prices
      .filter(p => p.componentID === componentID)
      .sort((a, b) => new Date(b.priceDate).getTime() - new Date(a.priceDate).getTime() || b.supplierPriceID - a.supplierPriceID);
  }

  // --- Panel Types & Labour Rates ---
  getPanelTypes(): PanelType[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PANEL_TYPES);
    if (!raw) {
      this.savePanelTypes(INITIAL_PANEL_TYPES);
      return INITIAL_PANEL_TYPES;
    }
    try {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        if (!list.some((p: PanelType) => p.panelTypeCode === 'METER_CABINET')) {
          const meterCabinet = INITIAL_PANEL_TYPES.find(p => p.panelTypeCode === 'METER_CABINET');
          if (meterCabinet) {
            list.push(meterCabinet);
            this.savePanelTypes(list);
          }
        }
        return list;
      }
    } catch (e) {
      console.error('Error parsing panel types from storage', e);
    }
    this.savePanelTypes(INITIAL_PANEL_TYPES);
    return INITIAL_PANEL_TYPES;
  }

  savePanelTypes(data: PanelType[]): void {
    localStorage.setItem(STORAGE_KEYS.PANEL_TYPES, JSON.stringify(data));
  }

  addPanelType(pt: Omit<PanelType, 'panelTypeID'>): PanelType {
    const list = this.getPanelTypes();
    const newId = list.length > 0 ? Math.max(...list.map(p => p.panelTypeID)) + 1 : 1;
    const item: PanelType = { ...pt, panelTypeID: newId };
    list.push(item);
    this.savePanelTypes(list);
    return item;
  }

  updatePanelType(pt: PanelType): void {
    const list = this.getPanelTypes();
    const idx = list.findIndex(p => p.panelTypeID === pt.panelTypeID);
    if (idx !== -1) {
      list[idx] = pt;
      this.savePanelTypes(list);
    }
  }

  deletePanelType(panelTypeID: number): void {
    const list = this.getPanelTypes();
    this.savePanelTypes(list.filter(p => p.panelTypeID !== panelTypeID));
  }

  getLabourRates(): LabourRate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LABOUR_RATES);
    if (!raw) {
      this.saveLabourRates(INITIAL_LABOUR_RATES);
      return INITIAL_LABOUR_RATES;
    }
    return JSON.parse(raw);
  }

  saveLabourRates(data: LabourRate[]): void {
    localStorage.setItem(STORAGE_KEYS.LABOUR_RATES, JSON.stringify(data));
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLogEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      this.saveAuditLogs(INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  }

  saveAuditLogs(data: AuditLogEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data));
  }

  addAuditLog(user: string, table: string, recordId: string, action: AuditLogEntry['action'], oldVal?: string, newVal?: string): void {
    const logs = this.getAuditLogs();
    const newId = logs.length > 0 ? Math.max(...logs.map(l => l.auditID)) + 1 : 1;
    const entry: AuditLogEntry = {
      auditID: newId,
      userID: user,
      tableName: table,
      recordID: recordId,
      action: action,
      oldValue: oldVal,
      newValue: newVal,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(entry);
    this.saveAuditLogs(logs.slice(0, 100)); // keep last 100 entries in storage
  }

  // --- Dashboard Metrics ---
  getDashboardMetrics(): DashboardMetrics {
    const components = this.getComponents();
    const manufacturers = this.getManufacturers();
    const suppliers = this.getSuppliers();
    const prices = this.getPrices();
    const projects = this.getProjects();
    const panels = this.getPanels();

    const totalEstimatesValue = projects.reduce((sum, p) => sum + (p.sellingPrice || 0), 0);

    return {
      totalComponents: components.length,
      activeComponents: components.filter(c => c.isActive).length,
      totalManufacturers: manufacturers.filter(m => m.isActive).length,
      totalSuppliers: suppliers.filter(s => s.isActive).length,
      currentPriceRecords: prices.filter(p => p.isCurrent).length,
      historicalPriceRecords: prices.length,
      totalProjects: projects.length,
      activePanels: panels.length,
      totalEstimatesValue: Math.round(totalEstimatesValue),
    };
  }

  // ==========================================
  // PHASE 2: PROJECTS & ENQUIRIES
  // ==========================================
  getProjects(): Project[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      this.saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    return JSON.parse(raw);
  }

  saveProjects(data: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
  }

  getProjectById(id: number): Project | undefined {
    return this.getProjects().find(p => p.projectID === id);
  }

  addProject(p: Omit<Project, 'projectID'>): Project {
    const list = this.getProjects();
    const newId = list.length > 0 ? Math.max(...list.map(x => x.projectID)) + 1 : 1;
    const item: Project = {
      ...p,
      projectID: newId,
      panelsCount: 0,
      totalCost: 0,
      sellingPrice: 0,
    };
    list.unshift(item);
    this.saveProjects(list);
    this.addAuditLog('estimator', 'est.Projects', String(newId), 'CREATE_COMPONENT', undefined, `Project: ${item.projectCode} - ${item.projectName}`);
    return item;
  }

  updateProject(p: Project): void {
    const list = this.getProjects();
    const idx = list.findIndex(x => x.projectID === p.projectID);
    if (idx !== -1) {
      list[idx] = p;
      this.saveProjects(list);
    }
  }

  deleteProject(projectID: number): void {
    const list = this.getProjects();
    const filtered = list.filter(p => p.projectID !== projectID);
    this.saveProjects(filtered);

    // Also delete associated panels
    const panels = this.getPanels().filter(p => p.projectID !== projectID);
    this.savePanels(panels);

    // Also delete associated quotation
    const quotes = this.getQuotations().filter(q => q.projectID !== projectID);
    this.saveQuotations(quotes);
  }

  // ==========================================
  // PHASE 2: ESTIMATE PANELS & ENGINEERING SIZING
  // ==========================================
  getPanels(): EstimatePanel[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PANELS);
    if (!raw) {
      this.savePanels(INITIAL_PANELS);
      return INITIAL_PANELS;
    }
    return JSON.parse(raw);
  }

  savePanels(data: EstimatePanel[]): void {
    localStorage.setItem(STORAGE_KEYS.PANELS, JSON.stringify(data));
  }

  getPanelsByProject(projectID: number): EstimatePanel[] {
    return this.getPanels().filter(p => p.projectID === projectID);
  }

  recalculatePanel(panel: EstimatePanel): EstimatePanel {
    const labourRates = this.getLabourRates();

    // 1. Calculate Copper Busbar Requirements
    // Formula: Total Length x Density based on Dimensions x Current Copper Price + Labour Charges
    const busbarResult = calculateBusbarRequirements({
      incomerAmps: panel.incomerRating,
      widthMm: panel.enclosureWidth,
      heightMm: panel.enclosureHeight,
      columns: panel.numberOfColumns,
      currentDensity: panel.busbarCurrentDensity || 1.5,
      copperRatePerKg: panel.copperBaseRatePerKg || 42.0,
      manualWidthMm: panel.busbarWidthMm,
      manualThicknessMm: panel.busbarThicknessMm,
      manualRunsPerPhase: panel.busbarRunsPerPhase,
      manualPhasesCount: panel.busbarPhasesCount,
      manualTotalLengthMeters: panel.busbarTotalLengthMeters,
      manualCopperDensity: panel.copperDensityKgDm3,
      manualWeightKg: undefined, // Dynamically computed from Total Length x Density based on Dimensions
      manualLabourHours: panel.busbarLabourHours,
      manualLabourRatePerHour: panel.busbarLabourRatePerHour,
      manualLabourCharges: panel.busbarLabourCost,
      manualHardwareCost: panel.busbarHardwareCost,
      isCustomBusbarCost: panel.isCustomBusbarCost,
      customBusbarCost: panel.customBusbarCost,
    });

    // 2. Calculate Sheet Metal Enclosure (Standard Engineering Formula)
    const enclosureResult = calculateEnclosureCost({
      heightMm: panel.enclosureHeight,
      widthMm: panel.enclosureWidth,
      depthMm: panel.enclosureDepth,
      columns: panel.numberOfColumns,
      formOfSeparation: panel.formOfSeparation,
      ipRating: panel.ipRating,
      sheetMetalThicknessMm: panel.sheetMetalThickness || 2.0,
    });

    // 2b. Determine Enclosure Cost (Component Catalogue vs Custom Price vs Calculated)
    let finalEnclosureCost = enclosureResult.totalEnclosureCost;
    if (panel.isCustomEnclosurePrice && typeof panel.customEnclosurePrice === 'number' && !isNaN(panel.customEnclosurePrice)) {
      // User explicitly set custom price override
      finalEnclosureCost = Number(panel.customEnclosurePrice.toFixed(2));
    } else if (panel.enclosureSource === 'CATALOGUE') {
      // User selected brand enclosure from Component Catalogue
      if (typeof panel.catalogueEnclosurePrice === 'number' && !isNaN(panel.catalogueEnclosurePrice) && panel.catalogueEnclosurePrice > 0) {
        finalEnclosureCost = Number(panel.catalogueEnclosurePrice.toFixed(2));
      } else if (panel.enclosureComponentID) {
        const compPrice = this.getPrices().find(p => p.componentID === panel.enclosureComponentID && p.isCurrent);
        if (compPrice?.netPrice) {
          finalEnclosureCost = compPrice.netPrice;
        }
      }
    } else if (typeof panel.customEnclosurePrice === 'number' && !isNaN(panel.customEnclosurePrice) && panel.customEnclosurePrice > 0 && panel.isCustomEnclosurePrice) {
      finalEnclosureCost = Number(panel.customEnclosurePrice.toFixed(2));
    } else if (typeof panel.enclosureCost === 'number' && panel.enclosureCost > 0 && panel.enclosureSource === 'CUSTOM') {
      finalEnclosureCost = panel.enclosureCost;
    }

    // 3. Calculate Equipment Cost (Sum of all item lines)
    const equipmentCost = Number(panel.items.reduce((sum, item) => sum + (item.totalCost || 0), 0).toFixed(2));

    // 4. Calculate Activity-based Labour
    const labourResult = calculatePanelLabour({
      columns: panel.numberOfColumns,
      itemCount: panel.items.length,
      copperWeightKg: busbarResult.totalWeightKg,
      formOfSeparation: panel.formOfSeparation,
      rates: labourRates,
    });

    const totalPanelCost = Number(
      (equipmentCost + busbarResult.totalBusbarCost + finalEnclosureCost + labourResult.totalCost).toFixed(2)
    );

    return {
      ...panel,
      busbarWidthMm: busbarResult.widthMm,
      busbarThicknessMm: busbarResult.thicknessMm,
      busbarRunsPerPhase: busbarResult.runsPerPhase,
      busbarPhasesCount: busbarResult.phasesCount,
      busbarTotalLengthMeters: busbarResult.totalLengthMeters,
      copperDensityKgDm3: busbarResult.copperDensity,
      copperCrossSectionMm2: busbarResult.crossSectionPerPhaseMm2,
      copperWeightKg: busbarResult.totalWeightKg,
      copperBaseRatePerKg: busbarResult.copperBaseRate,
      copperMaterialCost: busbarResult.copperCost,
      busbarLabourHours: busbarResult.labourHours,
      busbarLabourRatePerHour: busbarResult.labourRatePerHour,
      busbarLabourCost: busbarResult.labourCharges,
      busbarHardwareCost: busbarResult.hardwareAndSleevingCost,
      copperCost: busbarResult.totalBusbarCost,
      enclosureCost: finalEnclosureCost,
      equipmentCost,
      labourHours: labourResult.totalHours,
      labourCost: labourResult.totalCost,
      labourHoursDetail: labourResult.breakdown,
      totalPanelCost,
    };
  }

  addPanel(panelData: Omit<EstimatePanel, 'panelID' | 'copperCost' | 'enclosureCost' | 'labourCost' | 'totalPanelCost' | 'equipmentCost' | 'copperCrossSectionMm2' | 'copperWeightKg' | 'labourHours'>): EstimatePanel {
    const panels = this.getPanels();
    const newId = panels.length > 0 ? Math.max(...panels.map(x => x.panelID)) + 1 : 101;

    const basePanel: EstimatePanel = {
      ...panelData,
      panelID: newId,
      copperCrossSectionMm2: 0,
      copperWeightKg: 0,
      copperCost: 0,
      enclosureCost: 0,
      equipmentCost: 0,
      labourHours: 0,
      labourCost: 0,
      totalPanelCost: 0,
      items: panelData.items || [],
    };

    const calculatedPanel = this.recalculatePanel(basePanel);
    panels.push(calculatedPanel);
    this.savePanels(panels);

    this.syncProjectTotals(panelData.projectID);
    return calculatedPanel;
  }

  updatePanel(panel: EstimatePanel): void {
    const panels = this.getPanels();
    const idx = panels.findIndex(p => p.panelID === panel.panelID);
    if (idx !== -1) {
      const recalculated = this.recalculatePanel(panel);
      panels[idx] = recalculated;
      this.savePanels(panels);
      this.syncProjectTotals(panel.projectID);
    }
  }

  deletePanel(panelID: number): void {
    const panels = this.getPanels();
    const target = panels.find(p => p.panelID === panelID);
    if (target) {
      const filtered = panels.filter(p => p.panelID !== panelID);
      this.savePanels(filtered);
      this.syncProjectTotals(target.projectID);
    }
  }

  // --- Panel Items (Feeders / Equipment) ---
  addItemToPanel(panelID: number, itemData: Omit<EstimateItem, 'itemID' | 'panelID' | 'totalCost'>): EstimateItem {
    const panels = this.getPanels();
    const pIdx = panels.findIndex(p => p.panelID === panelID);
    if (pIdx === -1) throw new Error('Panel not found');

    const panel = panels[pIdx];
    const allItemIDs = panels.flatMap(p => p.items).map(i => i.itemID);
    const newId = allItemIDs.length > 0 ? Math.max(...allItemIDs) + 1 : 1001;

    const totalCost = Number((itemData.quantity * itemData.unitCost).toFixed(2));
    const newItem: EstimateItem = {
      ...itemData,
      itemID: newId,
      panelID,
      totalCost,
    };

    panel.items.push(newItem);
    const recalculated = this.recalculatePanel(panel);
    panels[pIdx] = recalculated;
    this.savePanels(panels);

    this.syncProjectTotals(panel.projectID);
    return newItem;
  }

  deleteItemFromPanel(panelID: number, itemID: number): void {
    const panels = this.getPanels();
    const pIdx = panels.findIndex(p => p.panelID === panelID);
    if (pIdx === -1) return;

    const panel = panels[pIdx];
    panel.items = panel.items.filter(i => i.itemID !== itemID);
    const recalculated = this.recalculatePanel(panel);
    panels[pIdx] = recalculated;
    this.savePanels(panels);

    this.syncProjectTotals(panel.projectID);
  }

  syncProjectTotals(projectID: number): void {
    const projects = this.getProjects();
    const pIdx = projects.findIndex(p => p.projectID === projectID);
    if (pIdx === -1) return;

    const projectPanels = this.getPanelsByProject(projectID);
    const totalCost = Number(projectPanels.reduce((sum, p) => sum + p.totalPanelCost, 0).toFixed(2));
    
    // Default 25% gross markup (equivalent to 20% margin) if no quotation exists yet
    const quote = this.getQuotationByProject(projectID);
    const sellingPrice = quote 
      ? quote.grandTotal 
      : Number((totalCost * 1.25).toFixed(2));

    projects[pIdx] = {
      ...projects[pIdx],
      panelsCount: projectPanels.length,
      totalCost,
      sellingPrice,
    };

    this.saveProjects(projects);
  }

  // ==========================================
  // PHASE 2: AUTOMATIC BILL OF MATERIALS (BOM)
  // ==========================================
  generateBOMForProject(projectID: number): ConsolidatedBOMItem[] {
    const panels = this.getPanelsByProject(projectID);
    const map = new Map<string, ConsolidatedBOMItem>();

    panels.forEach(panel => {
      panel.items.forEach(item => {
        const key = item.partNumber || item.description;
        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.totalQuantity += item.quantity;
          existing.extendedCost += item.totalCost;
          if (!existing.usedInPanels.includes(panel.panelTag)) {
            existing.usedInPanels.push(panel.panelTag);
          }
        } else {
          map.set(key, {
            id: String(item.itemID),
            partNumber: item.partNumber,
            description: item.description,
            category: item.categoryCode || 'SWITCHGEAR',
            manufacturer: item.manufacturerCode || 'GENERIC',
            totalQuantity: item.quantity,
            unit: item.unit || 'NOS',
            unitRate: item.unitCost,
            extendedCost: item.totalCost,
            usedInPanels: [panel.panelTag],
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.extendedCost - a.extendedCost);
  }

  // ==========================================
  // PHASE 2: COMMERCIAL QUOTATIONS
  // ==========================================
  getQuotations(): Quotation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    if (!raw) {
      this.saveQuotations(INITIAL_QUOTATIONS);
      return INITIAL_QUOTATIONS;
    }
    return JSON.parse(raw);
  }

  saveQuotations(data: Quotation[]): void {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(data));
  }

  getQuotationByProject(projectID: number): Quotation | undefined {
    return this.getQuotations().find(q => q.projectID === projectID);
  }

  createOrUpdateQuotation(quoteData: Partial<Quotation> & { projectID: number }): Quotation {
    const quotations = this.getQuotations();
    const project = this.getProjectById(quoteData.projectID);
    const panels = this.getPanelsByProject(quoteData.projectID);

    // Sum panel cost elements
    const totalEquipmentCost = Number(panels.reduce((sum, p) => sum + p.equipmentCost, 0).toFixed(2));
    const totalCopperCost = Number(panels.reduce((sum, p) => sum + p.copperCost, 0).toFixed(2));
    const totalEnclosureCost = Number(panels.reduce((sum, p) => sum + p.enclosureCost, 0).toFixed(2));
    const totalLabourCost = Number(panels.reduce((sum, p) => sum + p.labourCost, 0).toFixed(2));
    const totalDirectCost = Number((totalEquipmentCost + totalCopperCost + totalEnclosureCost + totalLabourCost).toFixed(2));

    const overheadPercent = quoteData.overheadPercent ?? 8.0;
    const overheadAmount = Number((totalDirectCost * (overheadPercent / 100)).toFixed(2));

    const costWithOverhead = totalDirectCost + overheadAmount;
    const profitMarginPercent = quoteData.profitMarginPercent ?? 15.0;
    
    // Selling price before tax with profit margin
    const subtotalBeforeTax = Number((costWithOverhead / (1 - profitMarginPercent / 100)).toFixed(2));
    const profitMarginAmount = Number((subtotalBeforeTax - costWithOverhead).toFixed(2));

    const taxPercent = quoteData.taxPercent ?? 5.0;
    const taxAmount = Number((subtotalBeforeTax * (taxPercent / 100)).toFixed(2));
    const grandTotal = Number((subtotalBeforeTax + taxAmount).toFixed(2));

    const idx = quotations.findIndex(q => q.projectID === quoteData.projectID);
    const newId = idx !== -1 
      ? quotations[idx].quotationID 
      : (quotations.length > 0 ? Math.max(...quotations.map(x => x.quotationID)) + 1 : 1);

    const quotation: Quotation = {
      quotationID: newId,
      quotationNumber: quoteData.quotationNumber || `QT-2026-${String(quoteData.projectID).padStart(3, '0')}-R0`,
      projectID: quoteData.projectID,
      projectCode: project?.projectCode || `PRJ-${quoteData.projectID}`,
      projectName: project?.projectName || 'LV Switchgear Project',
      clientName: project?.clientName || 'Valued Client',
      revisionNumber: quoteData.revisionNumber || 'R0',
      quotationDate: quoteData.quotationDate || new Date().toISOString().split('T')[0],
      validityDays: quoteData.validityDays || 30,
      currency: project?.currency || 'AED',
      totalEquipmentCost,
      totalCopperCost,
      totalEnclosureCost,
      totalLabourCost,
      totalDirectCost,
      overheadPercent,
      overheadAmount,
      profitMarginPercent,
      profitMarginAmount,
      subtotalBeforeTax,
      taxPercent,
      taxAmount,
      grandTotal,
      paymentTerms: quoteData.paymentTerms || '10% Advance with Order, 80% against Delivery, 10% on Testing & Handover',
      deliveryPeriodWeeks: quoteData.deliveryPeriodWeeks || 8,
      warrantyMonths: quoteData.warrantyMonths || 18,
      inclusions: quoteData.inclusions || [
        'Supply of LV switchgear panels fully assembled and wired per approved drawings.',
        'Factory Acceptance Testing (FAT) with routine testing certificates per IEC 61439-1/2.',
        'Standard packaging and delivery to site.',
      ],
      exclusions: quoteData.exclusions || [
        'Site offloading, shifting to substation, and civil installation.',
        'External cable terminations, glanding, and trench works.',
        'Local authority connection fees.',
      ],
      status: quoteData.status || 'DRAFT',
    };

    if (idx !== -1) {
      quotations[idx] = quotation;
    } else {
      quotations.push(quotation);
    }
    this.saveQuotations(quotations);

    // Sync project status and selling price
    if (project) {
      this.updateProject({
        ...project,
        sellingPrice: grandTotal,
        status: quotation.status === 'SUBMITTED' ? 'QUOTED' : 'ESTIMATED',
      });
    }

    return quotation;
  }

  // ==========================================
  // MODEL A: BUREAU CLIENTS & VALUE ENGINEERING
  // ==========================================
  getBureauClients(): BureauClient[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BUREAU_CLIENTS);
    if (!raw) {
      this.saveBureauClients(INITIAL_BUREAU_CLIENTS);
      return INITIAL_BUREAU_CLIENTS;
    }
    return JSON.parse(raw);
  }

  saveBureauClients(data: BureauClient[]): void {
    localStorage.setItem(STORAGE_KEYS.BUREAU_CLIENTS, JSON.stringify(data));
  }

  addBureauClient(client: Omit<BureauClient, 'clientID'>): BureauClient {
    const list = this.getBureauClients();
    const newId = list.length > 0 ? Math.max(...list.map(c => c.clientID)) + 1 : 1;
    const item: BureauClient = {
      ...client,
      clientID: newId,
      activeTendersCount: 0,
      totalWonTendersValue: 0,
    };
    list.push(item);
    this.saveBureauClients(list);
    this.addAuditLog('bureau', 'master.BureauClients', String(newId), 'CREATE_COMPONENT', undefined, `Client: ${item.clientCode} - ${item.companyName}`);
    return item;
  }

  updateBureauClient(client: BureauClient): void {
    const list = this.getBureauClients();
    const idx = list.findIndex(c => c.clientID === client.clientID);
    if (idx !== -1) {
      list[idx] = client;
      this.saveBureauClients(list);
      this.addAuditLog('bureau', 'master.BureauClients', String(client.clientID), 'UPDATE_COMPONENT', undefined, `Updated Client: ${client.companyName}`);
    }
  }

  deleteBureauClient(clientID: number): void {
    const list = this.getBureauClients();
    const target = list.find(c => c.clientID === clientID);
    if (target) {
      const filtered = list.filter(c => c.clientID !== clientID);
      this.saveBureauClients(filtered);
      this.addAuditLog('bureau', 'master.BureauClients', String(clientID), 'DELETE_COMPONENT', `${target.clientCode} - ${target.companyName}`, undefined);
    }
  }

  calculateValueEngineering(panel: EstimatePanel, client?: BureauClient): ValueEngineeringOption[] {
    const baseEquipment = panel.equipmentCost || 85000;
    const baseCopper = panel.copperCost || 18000;
    const baseEnclosure = panel.enclosureCost || 14500;
    const baseLabour = panel.labourCost || 11200;
    const overheadPct = client?.defaultOverheadPercent ?? 8.0;
    const marginPct = client?.targetMarginPercent ?? 15.0;

    const buildOption = (
      oemCode: string,
      oemName: string,
      equipmentMultiplier: number,
      leadTimeWeeks: number,
      complianceRating: number,
      notes: string
    ): ValueEngineeringOption => {
      const discount = client?.oemDiscounts?.find(
        d => d.manufacturerCode.toUpperCase() === oemCode.toUpperCase()
      );

      let eqCost = baseEquipment * equipmentMultiplier;
      if (discount) {
        const baselineDiscount = 0.35;
        const clientDisc = discount.standardDiscountPercent / 100;
        eqCost = eqCost * ((1 - clientDisc) / (1 - baselineDiscount));
      }

      const totalDirect = eqCost + baseCopper + baseEnclosure + baseLabour;
      const overhead = totalDirect * (overheadPct / 100);
      const subtotal = totalDirect + overhead;
      const sellingPrice = subtotal / (1 - marginPct / 100);
      const profit = sellingPrice - subtotal;

      return {
        oemCode,
        oemName,
        equipmentCost: Math.round(eqCost),
        copperCost: Math.round(baseCopper),
        enclosureCost: Math.round(baseEnclosure),
        labourCost: Math.round(baseLabour),
        totalDirectCost: Math.round(totalDirect),
        overheadAmount: Math.round(overhead),
        profitAmount: Math.round(profit),
        sellingPrice: Math.round(sellingPrice),
        leadTimeWeeks,
        technicalComplianceRating: complianceRating,
        complianceNotes: notes,
      };
    };

    return [
      buildOption(
        'ABB',
        'ABB Electrification (Emax 2 / Tmax XT)',
        1.0,
        8,
        99,
        'Consultant base spec. Full ASTA & DEWA/ADDC approved. Withdrawable Emax 2 air circuit breaker with Ekip Touch trip unit.'
      ),
      buildOption(
        'SCHNEIDER',
        'Schneider Electric (MasterPact MTZ / ComPact NSX)',
        0.95,
        7,
        98,
        'High market availability in UAE/GCC. Micrologic electronic trip units with integrated Class 1 metering. Fast factory delivery.'
      ),
      buildOption(
        'SIEMENS',
        'Siemens AG (Sentron 3WL / 3VA)',
        0.91,
        9,
        97,
        'Most cost-effective Tier-1 alternative. Excellent short-circuit fault withstand with ETU trip units.'
      ),
      buildOption(
        'HAGER',
        'Hager / Eaton Hybrid Value Option',
        0.84,
        6,
        92,
        'Optimized for competitive commercial tenders. Form 3b execution with fast-track 6-week factory delivery.'
      )
    ];
  }

  // ==========================================
  // COMMERCIAL INTELLIGENCE: PURCHASE ORDERS & BOOKING
  // ==========================================
  getPurchaseOrders(): PurchaseOrder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    let orders: PurchaseOrder[] = [];
    if (!raw) {
      orders = INITIAL_PURCHASE_ORDERS;
      this.savePurchaseOrders(orders);
    } else {
      try {
        orders = JSON.parse(raw);
      } catch {
        orders = [];
      }
    }

    // Commercial ERP Governance Rule:
    // A Purchase Order can ONLY exist if there is a corresponding quotation that has
    // actually been generated and quoted (status is SUBMITTED, ACCEPTED, or REVISED).
    // An unquoted project or draft estimation CANNOT have a Purchase Order.
    const quotations = this.getQuotations();
    const quotedQuoteMap = new Map<number, Quotation>();
    quotations.forEach(q => {
      // Must not be draft; must be an active, submitted commercial offer
      if (q.status === 'SUBMITTED' || q.status === 'ACCEPTED' || q.status === 'REVISED') {
        quotedQuoteMap.set(q.quotationID, q);
      }
    });

    // If no quotations have been quoted yet, there can be NO purchase orders!
    if (quotedQuoteMap.size === 0) {
      if (orders.length > 0) {
        this.savePurchaseOrders([]);
      }
      return [];
    }

    const validOrders = orders.filter(po => {
      // Remove any draft sample POs on unquoted projects
      if (po.poNumber === 'PO-DRAFT-SAMPLE-01') return false;
      // Must link to an actually quoted quotation
      const linkedQuote = quotedQuoteMap.get(po.quotationID);
      if (!linkedQuote) return false;
      return true;
    });

    // Auto-prune localStorage if any invalid or unquoted PO was detected
    if (validOrders.length !== orders.length) {
      this.savePurchaseOrders(validOrders);
    }

    return validOrders;
  }

  savePurchaseOrders(data: PurchaseOrder[]): void {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(data));
  }

  getPurchaseOrderById(poID: number): PurchaseOrder | undefined {
    return this.getPurchaseOrders().find(p => p.poID === poID);
  }

  getPurchaseOrdersByQuotation(quotationID: number): PurchaseOrder[] {
    return this.getPurchaseOrders().filter(p => p.quotationID === quotationID);
  }

  getPurchaseOrdersByProject(projectID: number): PurchaseOrder[] {
    return this.getPurchaseOrders().filter(p => p.projectID === projectID);
  }

  addPurchaseOrder(input: Omit<PurchaseOrder, 'poID' | 'createdAt' | 'updatedAt' | 'auditHistory'> & { auditUser?: string }): PurchaseOrder {
    const orders = this.getPurchaseOrders();
    const newId = orders.length > 0 ? Math.max(...orders.map(o => o.poID)) + 1 : 1;
    const now = new Date().toISOString();

    const vatPercent = input.vatPercent ?? 5.0;
    const vatAmount = Number((input.poValueExVat * (vatPercent / 100)).toFixed(2));
    const poValueIncVat = Number((input.poValueExVat + vatAmount).toFixed(2));

    const initialAudit: any[] = [
      {
        id: `aud-${Date.now()}-1`,
        timestamp: now,
        action: 'CREATE_PO',
        user: input.auditUser || input.enteredBy,
        newValue: `PO created with value ${input.poValueExVat.toLocaleString()} AED ex-VAT (${input.status})`,
        details: input.remarks || 'Customer Purchase Order registered in commercial system',
      }
    ];

    if (input.status === 'VERIFIED') {
      initialAudit.push({
        id: `aud-${Date.now()}-2`,
        timestamp: now,
        action: 'VERIFY_PO',
        user: input.verifiedBy || input.auditUser || input.enteredBy,
        newValue: 'Status: VERIFIED',
        details: 'Verified upon entry',
      });
    }

    const newPO: PurchaseOrder = {
      poID: newId,
      poNumber: input.poNumber,
      quotationID: input.quotationID,
      quotationNumber: input.quotationNumber,
      revisionNumber: input.revisionNumber || 'R0',
      projectID: input.projectID,
      projectCode: input.projectCode,
      projectName: input.projectName,
      clientName: input.clientName,
      salesperson: input.salesperson,
      estimator: input.estimator,
      poReceivedDate: input.poReceivedDate,
      poValueExVat: Number(input.poValueExVat.toFixed(2)),
      vatPercent,
      vatAmount,
      poValueIncVat,
      currency: input.currency || 'AED',
      status: input.status,
      isPartialPO: input.isPartialPO,
      partialPONote: input.partialPONote,
      poDocumentRef: input.poDocumentRef,
      remarks: input.remarks,
      enteredBy: input.enteredBy,
      verifiedBy: input.status === 'VERIFIED' ? (input.verifiedBy || input.enteredBy) : undefined,
      verificationDate: input.status === 'VERIFIED' ? (input.verificationDate || input.poReceivedDate) : undefined,
      createdAt: now,
      updatedAt: now,
      auditHistory: initialAudit,
    };

    orders.unshift(newPO);
    this.savePurchaseOrders(orders);

    // Synchronize Quotation and Project Status
    const quotations = this.getQuotations();
    const qIdx = quotations.findIndex(q => q.quotationID === input.quotationID);
    if (qIdx !== -1) {
      quotations[qIdx] = {
        ...quotations[qIdx],
        linkedPoId: newPO.poID,
        linkedPoNumber: newPO.poNumber,
        linkedPoStatus: newPO.status,
        verifiedPoValue: newPO.status === 'VERIFIED' ? newPO.poValueExVat : quotations[qIdx].verifiedPoValue,
        status: newPO.status === 'VERIFIED' ? 'ACCEPTED' : quotations[qIdx].status,
      };
      this.saveQuotations(quotations);
    }

    const projects = this.getProjects();
    const pIdx = projects.findIndex(p => p.projectID === input.projectID);
    if (pIdx !== -1 && newPO.status === 'VERIFIED') {
      projects[pIdx] = {
        ...projects[pIdx],
        status: 'WON',
      };
      this.saveProjects(projects);
    }

    this.addAuditLog(input.enteredBy, 'commercial.PurchaseOrders', String(newId), 'INSERT_PRICE', undefined, `PO ${newPO.poNumber}: ${newPO.poValueExVat} AED (${newPO.status})`);

    return newPO;
  }

  updatePurchaseOrder(po: PurchaseOrder, user: string = 'Authorized User'): void {
    const orders = this.getPurchaseOrders();
    const idx = orders.findIndex(o => o.poID === po.poID);
    if (idx !== -1) {
      const old = orders[idx];
      const now = new Date().toISOString();
      const vatPercent = po.vatPercent ?? 5.0;
      const vatAmount = Number((po.poValueExVat * (vatPercent / 100)).toFixed(2));
      const poValueIncVat = Number((po.poValueExVat + vatAmount).toFixed(2));

      const history = old.auditHistory || [];
      if (old.poValueExVat !== po.poValueExVat || old.status !== po.status) {
        history.unshift({
          id: `aud-${Date.now()}`,
          timestamp: now,
          action: 'UPDATE_PO_VALUE',
          user,
          oldValue: `Value: ${old.poValueExVat} AED | Status: ${old.status}`,
          newValue: `Value: ${po.poValueExVat} AED | Status: ${po.status}`,
          details: po.remarks || 'Updated purchase order details',
        });
      }

      const updated: PurchaseOrder = {
        ...po,
        vatPercent,
        vatAmount,
        poValueIncVat,
        updatedAt: now,
        auditHistory: history,
      };

      orders[idx] = updated;
      this.savePurchaseOrders(orders);

      // Sync linked quotation & project
      const quotations = this.getQuotations();
      const qIdx = quotations.findIndex(q => q.quotationID === po.quotationID);
      if (qIdx !== -1) {
        quotations[qIdx] = {
          ...quotations[qIdx],
          linkedPoStatus: po.status,
          verifiedPoValue: po.status === 'VERIFIED' ? po.poValueExVat : undefined,
          status: po.status === 'VERIFIED' ? 'ACCEPTED' : quotations[qIdx].status,
        };
        this.saveQuotations(quotations);
      }
    }
  }

  verifyPurchaseOrder(poID: number, verifiedBy: string): boolean {
    const orders = this.getPurchaseOrders();
    const idx = orders.findIndex(o => o.poID === poID);
    if (idx === -1) return false;

    const old = orders[idx];
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const history = old.auditHistory || [];
    history.unshift({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: 'VERIFY_PO',
      user: verifiedBy,
      oldValue: `Status: ${old.status}`,
      newValue: 'Status: VERIFIED',
      details: `Commercial verification executed by ${verifiedBy} on ${today}`,
    });

    const updated: PurchaseOrder = {
      ...old,
      status: 'VERIFIED',
      verifiedBy,
      verificationDate: today,
      updatedAt: now,
      auditHistory: history,
    };

    orders[idx] = updated;
    this.savePurchaseOrders(orders);

    // Update Quotation to ACCEPTED and Project to WON
    const quotations = this.getQuotations();
    const qIdx = quotations.findIndex(q => q.quotationID === old.quotationID);
    if (qIdx !== -1) {
      quotations[qIdx] = {
        ...quotations[qIdx],
        linkedPoStatus: 'VERIFIED',
        verifiedPoValue: old.poValueExVat,
        status: 'ACCEPTED',
      };
      this.saveQuotations(quotations);
    }

    const projects = this.getProjects();
    const pIdx = projects.findIndex(p => p.projectID === old.projectID);
    if (pIdx !== -1) {
      projects[pIdx] = {
        ...projects[pIdx],
        status: 'WON',
      };
      this.saveProjects(projects);
    }

    return true;
  }

  rejectPurchaseOrder(poID: number, user: string, reason: string): boolean {
    const orders = this.getPurchaseOrders();
    const idx = orders.findIndex(o => o.poID === poID);
    if (idx === -1) return false;

    const old = orders[idx];
    const now = new Date().toISOString();
    const history = old.auditHistory || [];
    history.unshift({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: 'REJECT_PO',
      user,
      oldValue: `Status: ${old.status}`,
      newValue: 'Status: REJECTED',
      details: reason,
    });

    orders[idx] = {
      ...old,
      status: 'REJECTED',
      remarks: reason,
      updatedAt: now,
      auditHistory: history,
    };
    this.savePurchaseOrders(orders);
    return true;
  }

  cancelPurchaseOrder(poID: number, user: string, reason: string): boolean {
    const orders = this.getPurchaseOrders();
    const idx = orders.findIndex(o => o.poID === poID);
    if (idx === -1) return false;

    const old = orders[idx];
    const now = new Date().toISOString();
    const history = old.auditHistory || [];
    history.unshift({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: 'CANCEL_PO',
      user,
      oldValue: `Status: ${old.status}`,
      newValue: 'Status: CANCELLED',
      details: reason,
    });

    orders[idx] = {
      ...old,
      status: 'CANCELLED',
      remarks: reason,
      updatedAt: now,
      auditHistory: history,
    };
    this.savePurchaseOrders(orders);
    return true;
  }

  deletePurchaseOrder(poID: number): boolean {
    const orders = this.getPurchaseOrders();
    const filtered = orders.filter(o => o.poID !== poID);
    this.savePurchaseOrders(filtered);
    return true;
  }

  clearAllPurchaseOrders(): void {
    this.savePurchaseOrders([]);
  }

  // ==========================================
  // COMMERCIAL INTELLIGENCE: FOLLOW-UP ACTIVITIES
  // ==========================================
  getFollowUps(): FollowUpActivity[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
    if (!raw) {
      this.saveFollowUps(INITIAL_FOLLOW_UPS);
      return INITIAL_FOLLOW_UPS;
    }
    return JSON.parse(raw);
  }

  saveFollowUps(data: FollowUpActivity[]): void {
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(data));
  }

  addFollowUp(activity: Omit<FollowUpActivity, 'id' | 'createdAt'>): FollowUpActivity {
    const list = this.getFollowUps();
    const newId = list.length > 0 ? Math.max(...list.map(f => f.id)) + 1 : 1;
    const item: FollowUpActivity = {
      ...activity,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    list.unshift(item);
    this.saveFollowUps(list);

    // Update Quotation last & next follow-up date
    const quotations = this.getQuotations();
    const qIdx = quotations.findIndex(q => q.quotationID === activity.quotationID);
    if (qIdx !== -1) {
      quotations[qIdx] = {
        ...quotations[qIdx],
        lastFollowUpDate: activity.date,
        nextFollowUpDate: activity.nextActionDate || quotations[qIdx].nextFollowUpDate,
        status: (activity.statusUpdate as any) || quotations[qIdx].status,
      };
      this.saveQuotations(quotations);
    }

    return item;
  }

  deleteFollowUp(id: number): void {
    const list = this.getFollowUps();
    this.saveFollowUps(list.filter(f => f.id !== id));
  }

  // Reset commercial pipeline back to clean, unquoted real state
  resetCommercialPipelineToClean(): void {
    const quotes = this.getQuotations().map(q => ({
      ...q,
      status: 'DRAFT' as const,
      quotationSubmittedDate: undefined,
      linkedPoId: undefined,
      linkedPoNumber: undefined,
      linkedPoStatus: undefined,
      verifiedPoValue: undefined,
      lastFollowUpDate: undefined,
      nextFollowUpDate: undefined,
      winProbabilityPercent: 50,
    }));
    this.saveQuotations(quotes);

    const projects = this.getProjects().map(p => ({
      ...p,
      status: (p.status === 'WON' || p.status === 'QUOTED') ? 'IN_ESTIMATION' : p.status,
    }));
    this.saveProjects(projects);

    this.savePurchaseOrders([]);
    this.saveFollowUps([]);
  }

  // Load demo showcase data for presenting dashboard charts and analytics
  loadDemoShowcaseData(): void {
    const quotes = this.getQuotations().map(q => {
      if (q.quotationID === 3) {
        return {
          ...q,
          status: 'ACCEPTED' as const,
          quotationSubmittedDate: '2026-09-08',
          linkedPoId: 1,
          linkedPoStatus: 'VERIFIED' as const,
          linkedPoNumber: 'PO-DAN-2026-904',
          verifiedPoValue: 143500.0,
          winProbabilityPercent: 100,
        };
      }
      if (q.quotationID === 4) {
        return {
          ...q,
          status: 'ACCEPTED' as const,
          quotationSubmittedDate: '2026-08-25',
          linkedPoId: 2,
          linkedPoStatus: 'VERIFIED' as const,
          linkedPoNumber: 'PO-BKG-EXP-4412',
          verifiedPoValue: 320000.0,
          winProbabilityPercent: 100,
        };
      }
      if (q.quotationID === 8) {
        return {
          ...q,
          status: 'ACCEPTED' as const,
          quotationSubmittedDate: '2026-08-20',
          linkedPoId: 3,
          linkedPoStatus: 'VERIFIED' as const,
          linkedPoNumber: 'PO-AFE-DSO-8821',
          verifiedPoValue: 450000.0,
          winProbabilityPercent: 100,
        };
      }
      if (q.quotationID === 1 || q.quotationID === 2 || q.quotationID === 5) {
        return {
          ...q,
          status: 'SUBMITTED' as const,
          quotationSubmittedDate: '2026-09-20',
          winProbabilityPercent: 70,
        };
      }
      return q;
    });
    this.saveQuotations(quotes);

    const projects = this.getProjects().map(p => {
      if (p.projectID === 3 || p.projectID === 4 || p.projectID === 8) {
        return { ...p, status: 'WON' as const };
      }
      if (p.projectID === 1 || p.projectID === 2 || p.projectID === 5) {
        return { ...p, status: 'QUOTED' as const };
      }
      return p;
    });
    this.saveProjects(projects);

    this.savePurchaseOrders(DEMO_PURCHASE_ORDERS);
    this.saveFollowUps(DEMO_FOLLOW_UPS);
  }

  // --- Predefined Fixed-Design Assemblies & Ready Final Prices ---
  getPredefinedAssemblies(): PredefinedAssembly[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PREDEFINED_ASSEMBLIES);
    if (!raw) {
      this.savePredefinedAssemblies(PREDEFINED_ASSEMBLIES);
      return PREDEFINED_ASSEMBLIES;
    }
    try {
      const stored = JSON.parse(raw);
      if (Array.isArray(stored) && stored.length > 0) {
        // Auto-merge any missing standard assemblies (e.g. newly introduced METER_CABINET)
        const storedIds = new Set(stored.map((a: PredefinedAssembly) => a.id));
        const missing = PREDEFINED_ASSEMBLIES.filter(a => !storedIds.has(a.id));
        if (missing.length > 0) {
          const merged = [...stored, ...missing];
          this.savePredefinedAssemblies(merged);
          return merged;
        }
        return stored;
      }
    } catch (e) {
      console.error('Error parsing predefined assemblies from storage', e);
    }
    this.savePredefinedAssemblies(PREDEFINED_ASSEMBLIES);
    return PREDEFINED_ASSEMBLIES;
  }

  savePredefinedAssemblies(assemblies: PredefinedAssembly[]): void {
    localStorage.setItem(STORAGE_KEYS.PREDEFINED_ASSEMBLIES, JSON.stringify(assemblies));
  }

  recalculatePredefinedAssembly(assembly: PredefinedAssembly): PredefinedAssembly {
    // Recalculate equipment cost from all items
    const equipmentCost = (assembly.items || []).reduce((sum, item) => {
      const itemTotal = Number(item.totalCost) !== undefined && !isNaN(Number(item.totalCost))
        ? Number(item.totalCost) 
        : (Number(item.quantity) * Number(item.unitCost));
      return sum + itemTotal;
    }, 0);

    const copperCost = Number(assembly.copperCost) || 0;
    const enclosureCost = Number(assembly.enclosureCost) || 0;
    const labourCost = Number(assembly.labourCost) || 0;

    const totalDirectCost = equipmentCost + copperCost + enclosureCost + labourCost;
    const overheadPct = Number(assembly.overheadPercent) || 0;
    const marginPct = Number(assembly.profitMarginPercent) || 0;

    const subtotalWithOverhead = totalDirectCost * (1 + overheadPct / 100);
    const readyFinalPrice = Math.round(subtotalWithOverhead * (1 + marginPct / 100));

    return {
      ...assembly,
      equipmentCost: Math.round(equipmentCost * 100) / 100,
      totalDirectCost: Math.round(totalDirectCost * 100) / 100,
      readyFinalPrice,
    };
  }

  updatePredefinedAssembly(assembly: PredefinedAssembly): PredefinedAssembly {
    const list = this.getPredefinedAssemblies();
    const recalculated = this.recalculatePredefinedAssembly(assembly);
    const index = list.findIndex(a => a.id === assembly.id);
    if (index !== -1) {
      list[index] = recalculated;
    } else {
      list.push(recalculated);
    }
    this.savePredefinedAssemblies(list);
    return recalculated;
  }

  addPredefinedAssembly(assembly: Omit<PredefinedAssembly, 'id'> & { id?: string }): PredefinedAssembly {
    const list = this.getPredefinedAssemblies();
    const newId = assembly.id || `CUSTOM-${assembly.panelTypeCode}-${Date.now()}`;
    const newAssembly: PredefinedAssembly = {
      ...assembly,
      id: newId,
    };
    const recalculated = this.recalculatePredefinedAssembly(newAssembly);
    list.unshift(recalculated);
    this.savePredefinedAssemblies(list);
    return recalculated;
  }

  deletePredefinedAssembly(id: string): void {
    const list = this.getPredefinedAssemblies().filter(a => a.id !== id);
    this.savePredefinedAssemblies(list);
  }

  resetPredefinedAssemblies(): PredefinedAssembly[] {
    this.savePredefinedAssemblies(PREDEFINED_ASSEMBLIES);
    return PREDEFINED_ASSEMBLIES;
  }

  pickAssemblyIntoProject(
    assembly: PredefinedAssembly,
    projectID: number,
    customPanelTag?: string,
    quantity: number = 1
  ): EstimatePanel[] {
    const existingPanels = this.getPanels();
    const panelTypes = this.getPanelTypes();
    const matchingPanelType = panelTypes.find(
      pt => pt.panelTypeCode.toUpperCase() === assembly.panelTypeCode.toUpperCase()
    ) || panelTypes[0];

    const addedPanels: EstimatePanel[] = [];
    const baseId = existingPanels.length > 0 ? Math.max(...existingPanels.map(p => p.panelID)) + 1 : 101;

    for (let q = 0; q < quantity; q++) {
      const panelId = baseId + q;
      const tagSuffix = quantity > 1 ? `-${q + 1}` : '';
      const tag = customPanelTag 
        ? `${customPanelTag}${tagSuffix}` 
        : `${assembly.panelTypeCode}-${panelId}`;

      const newPanel: EstimatePanel = {
        panelID: panelId,
        projectID,
        panelTag: tag,
        panelName: assembly.name,
        panelTypeID: matchingPanelType?.panelTypeID || 1,
        panelTypeCode: assembly.panelTypeCode,
        incomerRating: assembly.incomerRating,
        ratedVoltage: assembly.ratedVoltage,
        shortCircuitRating: assembly.shortCircuitRating,
        formOfSeparation: assembly.formOfSeparation,
        ipRating: assembly.ipRating,
        cableEntry: assembly.cableEntry,

        // Busbars
        busbarCurrentDensity: 1.5,
        busbarWidthMm: assembly.incomerRating >= 2500 ? 100 : assembly.incomerRating >= 1600 ? 80 : 50,
        busbarThicknessMm: 10,
        busbarRunsPerPhase: assembly.incomerRating >= 3200 ? 4 : assembly.incomerRating >= 2500 ? 3 : assembly.incomerRating >= 1250 ? 2 : 1,
        busbarPhasesCount: 4,
        busbarTotalLengthMeters: 4.5,
        copperDensityKgDm3: 0.00896,
        copperCrossSectionMm2: assembly.incomerRating >= 2500 ? 1000 : assembly.incomerRating >= 1600 ? 800 : 500,
        copperWeightKg: assembly.copperWeightKg,
        copperBaseRatePerKg: 42,
        copperMaterialCost: assembly.copperCost * 0.75,
        busbarLabourCost: assembly.copperCost * 0.15,
        busbarHardwareCost: assembly.copperCost * 0.10,
        copperCost: assembly.copperCost,

        // Enclosure
        enclosureHeight: assembly.enclosureHeight,
        enclosureWidth: assembly.enclosureWidth,
        enclosureDepth: assembly.enclosureDepth,
        numberOfColumns: assembly.numberOfColumns,
        sheetMetalThickness: 2.0,
        enclosureCost: assembly.enclosureCost,
        enclosureSource: 'CATALOGUE',
        enclosureBrand: assembly.enclosureBrand,
        catalogueEnclosurePrice: assembly.enclosureCost,

        // Equipment & Labour
        equipmentCost: assembly.equipmentCost,
        labourHours: assembly.labourHours,
        labourCost: assembly.labourCost,
        totalPanelCost: assembly.totalDirectCost,

        items: assembly.items.map((item, idx) => ({
          itemID: (panelId * 100) + idx + 1,
          panelID: panelId,
          circuitTag: item.circuitTag,
          description: item.description,
          categoryCode: item.categoryCode,
          manufacturerCode: item.manufacturerCode,
          partNumber: item.partNumber,
          rating: item.rating,
          quantity: item.quantity,
          unit: item.unit,
          unitCost: item.unitCost,
          totalCost: item.totalCost,
        })),
      };

      const recalculated = this.recalculatePanel(newPanel);
      existingPanels.push(recalculated);
      addedPanels.push(recalculated);
    }

    this.savePanels(existingPanels);
    this.syncProjectTotals(projectID);
    return addedPanels;
  }

  // Reset to default seed data
  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.MANUFACTURERS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.COMPONENTS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.PRICES);
    localStorage.removeItem(STORAGE_KEYS.PANEL_TYPES);
    localStorage.removeItem(STORAGE_KEYS.LABOUR_RATES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.PANELS);
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.BUREAU_CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.PURCHASE_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
    localStorage.removeItem(STORAGE_KEYS.PREDEFINED_ASSEMBLIES);
  }
}

export const storageService = new StorageService();
