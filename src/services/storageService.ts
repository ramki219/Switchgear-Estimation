import { 
  Manufacturer, 
  ComponentCategory, 
  Component, 
  Supplier, 
  SupplierPrice, 
  PanelType, 
  LabourRate, 
  AuditLogEntry, 
  DashboardMetrics 
} from '../types';
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
  INITIAL_QUOTATIONS
} from '../data/phase2SeedData';
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
  ConsolidatedBOMItem
} from '../types';

const STORAGE_KEYS = {
  MANUFACTURERS: 'lv_estimator_manufacturers_v1',
  CATEGORIES: 'lv_estimator_categories_v1',
  COMPONENTS: 'lv_estimator_components_v1',
  SUPPLIERS: 'lv_estimator_suppliers_v1',
  PRICES: 'lv_estimator_prices_v1',
  PANEL_TYPES: 'lv_estimator_panel_types_v1',
  LABOUR_RATES: 'lv_estimator_labour_rates_v1',
  AUDIT_LOGS: 'lv_estimator_audit_logs_v1',
  PROJECTS: 'lv_estimator_projects_v2',
  PANELS: 'lv_estimator_panels_v2',
  QUOTATIONS: 'lv_estimator_quotations_v2',
};

class StorageService {
  // --- Manufacturers ---
  getManufacturers(): Manufacturer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MANUFACTURERS);
    if (!raw) {
      this.saveManufacturers(INITIAL_MANUFACTURERS);
      return INITIAL_MANUFACTURERS;
    }
    return JSON.parse(raw);
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

  // --- Pricing with Strict Historical Preservation ---
  getPrices(): SupplierPrice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICES);
    if (!raw) {
      this.savePrices(INITIAL_PRICES);
      return INITIAL_PRICES;
    }
    return JSON.parse(raw);
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
    return JSON.parse(raw);
  }

  savePanelTypes(data: PanelType[]): void {
    localStorage.setItem(STORAGE_KEYS.PANEL_TYPES, JSON.stringify(data));
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
    const busbarResult = calculateBusbarRequirements({
      incomerAmps: panel.incomerRating,
      widthMm: panel.enclosureWidth,
      heightMm: panel.enclosureHeight,
      columns: panel.numberOfColumns,
      currentDensity: panel.busbarCurrentDensity || 1.5,
      copperRatePerKg: panel.copperBaseRatePerKg || 42.0,
    });

    // 2. Calculate Sheet Metal Enclosure
    const enclosureResult = calculateEnclosureCost({
      heightMm: panel.enclosureHeight,
      widthMm: panel.enclosureWidth,
      depthMm: panel.enclosureDepth,
      columns: panel.numberOfColumns,
      formOfSeparation: panel.formOfSeparation,
      ipRating: panel.ipRating,
      sheetMetalThicknessMm: panel.sheetMetalThickness || 2.0,
    });

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
      (equipmentCost + busbarResult.totalBusbarCost + enclosureResult.totalEnclosureCost + labourResult.totalCost).toFixed(2)
    );

    return {
      ...panel,
      copperCrossSectionMm2: busbarResult.crossSectionPerPhaseMm2,
      copperWeightKg: busbarResult.totalWeightKg,
      copperCost: busbarResult.totalBusbarCost,
      enclosureCost: enclosureResult.totalEnclosureCost,
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
  }
}

export const storageService = new StorageService();
