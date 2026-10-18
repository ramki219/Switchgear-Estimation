/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { storageService } from './services/storageService';
import { exportComponentsToCSV, exportPricesToCSV } from './services/exportService';
import { 
  Component, 
  ComponentCategory, 
  Manufacturer, 
  Supplier, 
  PanelType, 
  LabourRate, 
  SupplierPrice, 
  AuditLogEntry, 
  DashboardMetrics,
  Project,
  EstimatePanel,
  Quotation,
  PurchaseOrder,
  FollowUpActivity,
  ConsolidatedBOMItem,
  BulkImportResult,
  CompanyTenant,
  SaaSSubscription,
  SaaSPlan,
  SaaSUser
} from './types';

// Layout
import { Sidebar, NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ConfirmationDialog } from './components/common/ConfirmationDialog';
import { AuthModal } from './components/auth/AuthModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ComponentsView } from './components/components/ComponentsView';
import { ComponentDetailModal } from './components/components/ComponentDetailModal';
import { ComponentFormModal } from './components/components/ComponentFormModal';
import { ComponentImportModal } from './components/components/ComponentImportModal';
import { PricingView } from './components/pricing/PricingView';
import { PriceHistoryModal } from './components/pricing/PriceHistoryModal';
import { PriceEntryModal } from './components/pricing/PriceEntryModal';
import { ManufacturersView } from './components/manufacturers/ManufacturersView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { PanelTypesView } from './components/panels/PanelTypesView';
import { LabourRatesView } from './components/costing/LabourRatesView';
import { ArchitectureView } from './components/architecture/ArchitectureView';
import { AuditLogView } from './components/audit/AuditLogView';

// Phase 2 Views & Modals
import { ProjectsView } from './components/estimation/ProjectsView';
import { EstimationWorkspaceView } from './components/estimation/EstimationWorkspaceView';
import { BOMView } from './components/estimation/BOMView';
import { QuotationsView } from './components/estimation/QuotationsView';
import { ProjectFormModal } from './components/estimation/ProjectFormModal';
import { BureauHubView } from './components/bureau/BureauHubView';
import { SLDStudioView } from './components/engineering/SLDStudioView';

// Commercial SaaS, Sales Intelligence & Production Handover Views
import { POBookingView } from './components/commercial/POBookingView';
import { FollowUpCenterView } from './components/commercial/FollowUpCenterView';
import { NewFollowUpModal } from './components/commercial/NewFollowUpModal';
import { ProductionHandoverView } from './components/production/ProductionHandoverView';
import { SaaSBillingView } from './components/saas/SaaSBillingView';
import { CompanySettingsView } from './components/saas/CompanySettingsView';
import { FacebookLoginScreen } from './components/auth/FacebookLoginScreen';
import { PredefinedAssembliesView } from './components/assemblies/PredefinedAssembliesView';
import { ProjectDocumentationModal } from './components/documentation/ProjectDocumentationModal';
import { ClientCompaniesAndApprovalsView } from './components/admin/ClientCompaniesAndApprovalsView';
import { authApprovalService, PLAN_LIMITS } from './services/authApprovalService';
import { Lock, Sparkles, AlertCircle, CreditCard } from 'lucide-react';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { apiClient } from './services/apiClient';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');

  // SaaS Multi-Tenant State
  const [company, setCompany] = useState<CompanyTenant>(() => {
    const saved = localStorage.getItem('switchgear_saas_company');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 1,
      companyCode: 'EMIRATES-LV-01',
      companyName: 'Emirates Switchgear Manufacturing LLC',
      tradeLicenseNo: 'CN-1029384',
      country: 'United Arab Emirates',
      city: 'Dubai',
      address: 'Al Quoz Industrial Area 4, Dubai, UAE',
      phone: '+971 4 345 6789',
      email: 'sales@emiratesswitchgear.ae',
      vatTrn: '100234567800003',
      currency: 'AED',
      defaultCostingMethod: 'MARKUP',
      defaultMarginPercent: 15.00,
      defaultVatPercent: 5.00,
      plan: 'PROFESSIONAL',
      subscriptionStatus: 'ACTIVE',
      maxProjects: 50,
      maxUsers: 5,
    };
  });

  const [subscription, setSubscription] = useState<SaaSSubscription | null>({
    id: 1,
    companyId: 1,
    plan: 'PROFESSIONAL',
    priceAedMonthly: 499,
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    maxProjects: 50,
    maxUsers: 5,
    autoRenew: true,
  });

  // User session: starts null unless restored from active session in localStorage
  const [currentUser, setCurrentUser] = useState<SaaSUser | null>(() => {
    const saved = localStorage.getItem('switchgear_saas_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'quota' | 'export' | null>(null);

  // Application Data States
  const [components, setComponents] = useState<Component[]>([]);
  const [categories, setCategories] = useState<ComponentCategory[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [panelTypes, setPanelTypes] = useState<PanelType[]>([]);
  const [labourRates, setLabourRates] = useState<LabourRate[]>([]);
  const [prices, setPrices] = useState<SupplierPrice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalComponents: 0,
    activeComponents: 0,
    totalManufacturers: 0,
    totalSuppliers: 0,
    currentPriceRecords: 0,
    historicalPriceRecords: 0,
  });

  // Phase 2 States
  const [projects, setProjects] = useState<Project[]>([]);
  const [allPanels, setAllPanels] = useState<EstimatePanel[]>([]);
  const [allQuotations, setAllQuotations] = useState<Quotation[]>([]);
  const [allOrders, setAllOrders] = useState<PurchaseOrder[]>([]);
  const [allFollowUps, setAllFollowUps] = useState<FollowUpActivity[]>([]);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedQuoteForFollowUp, setSelectedQuoteForFollowUp] = useState<Quotation | null>(null);

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activePanels, setActivePanels] = useState<EstimatePanel[]>([]);
  const [activeQuotation, setActiveQuotation] = useState<Quotation | undefined>(undefined);
  const [activeBOM, setActiveBOM] = useState<ConsolidatedBOMItem[]>([]);

  // Project Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [deleteProjectConfirmId, setDeleteProjectConfirmId] = useState<number | null>(null);

  // Component & Price Modals
  const [selectedComponentForDetail, setSelectedComponentForDetail] = useState<Component | null>(null);
  const [isComponentFormOpen, setIsComponentFormOpen] = useState(false);
  const [componentToEdit, setComponentToEdit] = useState<Component | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [isPriceEntryOpen, setIsPriceEntryOpen] = useState(false);
  const [preselectedComponentForPrice, setPreselectedComponentForPrice] = useState<Component | null>(null);

  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false);
  const [componentForHistory, setComponentForHistory] = useState<Component | null>(null);
  const [priceHistoryList, setPriceHistoryList] = useState<SupplierPrice[]>([]);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Sync currentCompany plan & quota from authApprovalService directory if matched
  const syncActiveCompanyRecord = useCallback(() => {
    setCompany(prev => {
      const allClients = authApprovalService.getClientCompanies();
      const matched = allClients.find(
        c => c.companyCode === prev.companyCode || c.companyName.toLowerCase() === prev.companyName.toLowerCase()
      );
      if (!matched) return prev;
      const updated: CompanyTenant = {
        ...prev,
        plan: matched.plan,
        maxProjects: matched.maxProjects,
        maxUsers: matched.maxUsers,
        requestedPlan: matched.requestedPlan,
        paymentReference: matched.paymentReference,
        subscriptionStatus: matched.requestedPlan
          ? 'PENDING_APPROVAL'
          : matched.plan === 'TRIAL'
          ? 'TRIALING'
          : 'ACTIVE',
      };
      localStorage.setItem('switchgear_saas_company', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Load all data from storage
  const loadData = useCallback(() => {
    setComponents(storageService.getComponents());
    setCategories(storageService.getCategories());
    setManufacturers(storageService.getManufacturers());
    setSuppliers(storageService.getSuppliers());
    setPanelTypes(storageService.getPanelTypes());
    setLabourRates(storageService.getLabourRates());
    setPrices(storageService.getAllPrices());
    setAuditLogs(storageService.getAuditLogs());
    setMetrics(storageService.getDashboardMetrics());

    const loadedProjects = storageService.getProjects();
    setProjects(loadedProjects);
    setAllPanels(storageService.getPanels());
    setAllQuotations(storageService.getQuotations());
    setAllOrders(storageService.getPurchaseOrders());
    setAllFollowUps(storageService.getFollowUps());

    // If there's an active project, refresh its panels & state
    setActiveProject(prev => {
      const targetId = prev ? prev.projectID : (loadedProjects.length > 0 ? loadedProjects[0].projectID : null);
      if (targetId) {
        const found = loadedProjects.find(p => p.projectID === targetId) || loadedProjects[0] || null;
        if (found) {
          const panels = storageService.getPanelsByProject(found.projectID);
          setActivePanels(panels);
          setActiveQuotation(storageService.getQuotationByProject(found.projectID));
          setActiveBOM(storageService.generateBOMForProject(found.projectID));
        } else {
          setActivePanels([]);
          setActiveQuotation(undefined);
          setActiveBOM([]);
        }
        return found;
      }
      setActivePanels([]);
      setActiveQuotation(undefined);
      setActiveBOM([]);
      return null;
    });
  }, []);

  useEffect(() => {
    loadData();
    syncActiveCompanyRecord();
  }, [loadData, syncActiveCompanyRecord]);

  // Phase 2 Project Navigation Handlers
  const handleSelectProjectForEstimation = (proj: Project) => {
    setActiveProject(proj);
    const panels = storageService.getPanelsByProject(proj.projectID);
    setActivePanels(panels);
    setActiveQuotation(storageService.getQuotationByProject(proj.projectID));
    setActiveBOM(storageService.generateBOMForProject(proj.projectID));
    setCurrentView('workspace');
  };

  const handleSelectProjectForQuotation = (proj: Project) => {
    setActiveProject(proj);
    const panels = storageService.getPanelsByProject(proj.projectID);
    setActivePanels(panels);
    setActiveQuotation(storageService.getQuotationByProject(proj.projectID));
    setActiveBOM(storageService.generateBOMForProject(proj.projectID));
    setCurrentView('quotations');
  };

  const handleSelectProjectForBOM = (proj: Project) => {
    setActiveProject(proj);
    const panels = storageService.getPanelsByProject(proj.projectID);
    setActivePanels(panels);
    setActiveQuotation(storageService.getQuotationByProject(proj.projectID));
    setActiveBOM(storageService.generateBOMForProject(proj.projectID));
    setCurrentView('bom');
  };

  const [selectedCADPanelId, setSelectedCADPanelId] = useState<number>(0);

  const handleSelectProjectForSLD = (proj: Project, panelId?: number) => {
    setActiveProject(proj);
    const panels = storageService.getPanelsByProject(proj.projectID);
    setActivePanels(panels);
    setActiveQuotation(storageService.getQuotationByProject(proj.projectID));
    setActiveBOM(storageService.generateBOMForProject(proj.projectID));
    if (panelId) {
      setSelectedCADPanelId(panelId);
    } else if (panels.length > 0) {
      setSelectedCADPanelId(panels[0].panelID);
    }
    setCurrentView('sld_studio');
  };

  const handleNavigateToSLD = (panelId?: number) => {
    if (panelId) {
      setSelectedCADPanelId(panelId);
    } else if (activePanels.length > 0) {
      setSelectedCADPanelId(activePanels[0].panelID);
    }
    setCurrentView('sld_studio');
  };

  const handleSyncSLDToPanels = (panelId: number, sldData: {
    equipmentCost: number;
    copperWeightKg: number;
    enclosureCost: number;
    labourHours: number;
    feedersCount: number;
    enclosureWidth: number;
    enclosureHeight: number;
    enclosureDepth: number;
  }) => {
    const copperRate = 42; // AED/kg
    const labourRate = 85; // AED/hr
    const newCopperCost = Math.round(sldData.copperWeightKg * copperRate);
    const newLabourCost = Math.round(sldData.labourHours * labourRate);
    const totalCost = sldData.equipmentCost + newCopperCost + sldData.enclosureCost + newLabourCost;

    const existing = activePanels.find(p => p.panelID === panelId);
    if (existing) {
      const updatedPanel: EstimatePanel = {
        ...existing,
        equipmentCost: sldData.equipmentCost,
        copperWeightKg: sldData.copperWeightKg,
        copperCost: newCopperCost,
        enclosureCost: sldData.enclosureCost,
        labourHours: sldData.labourHours,
        labourCost: newLabourCost,
        totalPanelCost: totalCost,
        enclosureWidth: sldData.enclosureWidth,
        enclosureHeight: sldData.enclosureHeight,
        enclosureDepth: sldData.enclosureDepth,
      };

      storageService.updatePanel(updatedPanel);
      loadData();
    }
  };

  const maxProjectsAllowed = company.maxProjects || PLAN_LIMITS[company.plan || 'TRIAL']?.maxProjects || 2;

  // Phase 2 Project CRUD (with strict Estimation Quota check)
  const handleSaveProject = (projectData: any) => {
    if (projectData.projectID) {
      storageService.updateProject(projectData);
    } else {
      if (projects.length >= maxProjectsAllowed) {
        setIsProjectModalOpen(false);
        setPaywallReason('quota');
        return;
      }
      const newProj = storageService.addProject(projectData);
      setActiveProject(newProj);
    }
    loadData();
    setIsProjectModalOpen(false);
    setProjectToEdit(null);
  };

  const handleDeleteProject = (projectId: number) => {
    storageService.deleteProject(projectId);
    loadData();
    setDeleteProjectConfirmId(null);
  };

  // Phase 2 Panel CRUD
  const handleAddPanel = (panelData: any) => {
    if (!activeProject) return;
    storageService.addPanel(panelData);
    loadData();
  };

  const handleUpdatePanel = (panelData: EstimatePanel) => {
    storageService.updatePanel(panelData);
    loadData();
  };

  const handleDeletePanel = (panelId: number) => {
    storageService.deletePanel(panelId);
    loadData();
  };

  const handleAddItemToPanel = (panelId: number, itemData: any) => {
    storageService.addItemToPanel(panelId, itemData);
    loadData();
  };

  const handleDeleteItemFromPanel = (panelId: number, itemId: number) => {
    storageService.deleteItemFromPanel(panelId, itemId);
    loadData();
  };

  const handleSaveQuotation = (quoteData: any) => {
    storageService.createOrUpdateQuotation(quoteData);
    loadData();
  };

  // Commercial Intelligence Handlers: Purchase Orders & Follow-ups
  const handleSavePO = (po: Omit<PurchaseOrder, 'poID' | 'createdAt' | 'updatedAt' | 'auditHistory'>) => {
    storageService.addPurchaseOrder(po);
    loadData();
  };

  const handleUpdatePO = (po: PurchaseOrder) => {
    storageService.updatePurchaseOrder(po);
    loadData();
  };

  const handleVerifyPO = (poID: number, verifiedBy: string) => {
    storageService.verifyPurchaseOrder(poID, verifiedBy);
    loadData();
  };

  const handleRejectPO = (poID: number, reason: string) => {
    storageService.rejectPurchaseOrder(poID, currentUser?.fullName || 'Commercial Lead', reason);
    loadData();
  };

  const handleCancelPO = (poID: number, reason: string) => {
    storageService.cancelPurchaseOrder(poID, currentUser?.fullName || 'Commercial Lead', reason);
    loadData();
  };

  const handleDeletePO = (poID: number) => {
    storageService.deletePurchaseOrder(poID);
    loadData();
  };

  const handleClearAllPOs = () => {
    storageService.clearAllPurchaseOrders();
    loadData();
  };

  const handleResetCommercialPipeline = () => {
    storageService.resetCommercialPipelineToClean();
    loadData();
  };

  const handleLoadDemoData = () => {
    storageService.loadDemoShowcaseData();
    loadData();
  };

  const handleSaveFollowUp = (activity: Omit<FollowUpActivity, 'id' | 'createdAt'>) => {
    storageService.addFollowUp(activity);
    loadData();
  };

  // Handlers for Components
  const handleSaveComponent = (componentData: any) => {
    if (componentData.componentID) {
      storageService.updateComponent(componentData.componentID, componentData);
    } else {
      storageService.addComponent(componentData);
    }
    loadData();
    setIsComponentFormOpen(false);
    setComponentToEdit(null);
  };

  const handleDeleteComponent = (componentID: number) => {
    storageService.deleteComponent(componentID);
    loadData();
    setDeleteConfirmId(null);
    if (selectedComponentForDetail?.componentID === componentID) {
      setSelectedComponentForDetail(null);
    }
  };

  // Handlers for Prices
  const handleSavePrice = (pricePayload: any) => {
    storageService.addOrRevisePrice(pricePayload);
    loadData();
    setIsPriceEntryOpen(false);

    if (componentForHistory && componentForHistory.componentID === pricePayload.componentID) {
      setPriceHistoryList(storageService.getPriceHistory(pricePayload.componentID));
    }
  };

  const handleOpenPriceHistory = (comp: Component) => {
    setComponentForHistory(comp);
    setPriceHistoryList(storageService.getPriceHistory(comp.componentID));
    setIsPriceHistoryOpen(true);
  };

  const handleOpenRevisePrice = (compOrId?: Component | number) => {
    if (typeof compOrId === 'number') {
      const found = components.find(c => c.componentID === compOrId);
      setPreselectedComponentForPrice(found || null);
    } else {
      setPreselectedComponentForPrice(compOrId || null);
    }
    setIsPriceEntryOpen(true);
  };

  // Handlers for Manufacturers & Suppliers
  const handleAddManufacturer = (mfg: Omit<Manufacturer, 'manufacturerID' | 'createdAt'>) => {
    storageService.addManufacturer(mfg);
    loadData();
  };

  const handleAddSupplier = (sup: Omit<Supplier, 'supplierID' | 'createdAt'>) => {
    storageService.addSupplier(sup);
    loadData();
  };

  // Export CSV (gated on Free Trial)
  const handleExportCSV = () => {
    if (company.plan === 'TRIAL') {
      setPaywallReason('export');
      return;
    }
    if (currentView === 'prices') {
      exportPricesToCSV(prices);
    } else {
      exportComponentsToCSV(components);
    }
  };

  // Reset to initial seed data
  const handleResetData = () => {
    if (window.confirm('Reset all catalog data, components, prices, and projects back to initial seed data?')) {
      storageService.resetToSeed();
      loadData();
    }
  };

  // Handlers for SaaS Subscription & Company Profile
  const handleUpgradePlan = async (
    newPlan: SaaSPlan,
    billingCycle: 'MONTHLY' | 'ANNUAL',
    paymentRef?: string,
    instantActivate?: boolean
  ) => {
    const limits = PLAN_LIMITS[newPlan] || PLAN_LIMITS.PROFESSIONAL;
    if (instantActivate) {
      authApprovalService.updateCompanyPlanAndQuota(company.companyCode, newPlan, limits.maxProjects);
      const updatedCompany: CompanyTenant = {
        ...company,
        plan: newPlan,
        maxProjects: limits.maxProjects,
        maxUsers: limits.maxUsers,
        requestedPlan: undefined,
        paymentReference: paymentRef,
        subscriptionStatus: 'ACTIVE',
      };
      setCompany(updatedCompany);
      localStorage.setItem('switchgear_saas_company', JSON.stringify(updatedCompany));
      setSubscription(prev => prev ? { ...prev, plan: newPlan, billingCycle, maxProjects: limits.maxProjects, maxUsers: limits.maxUsers } : null);
    } else {
      authApprovalService.submitPaymentUpgradeRequest(
        company.companyCode,
        newPlan,
        paymentRef || 'BANK-TRANSFER-PENDING'
      );
      const updatedCompany: CompanyTenant = {
        ...company,
        requestedPlan: newPlan,
        paymentReference: paymentRef,
        subscriptionStatus: 'PENDING_APPROVAL',
      };
      setCompany(updatedCompany);
      localStorage.setItem('switchgear_saas_company', JSON.stringify(updatedCompany));
    }

    try {
      await apiClient.post('/api/tenant/subscription/change-plan', {
        plan: newPlan,
        billingCycle,
        paymentReference: paymentRef,
        instantActivate: !!instantActivate,
      });
    } catch (e) {
      // Handled locally via authApprovalService
    }
  };

  const handleSaveCompanySettings = async (updated: Partial<CompanyTenant>) => {
    try {
      const res = await apiClient.put('/api/tenant/company', updated);
      if (res) {
        setCompany(prev => {
          const next = { ...prev, ...res };
          localStorage.setItem('switchgear_saas_company', JSON.stringify(next));
          return next;
        });
      }
    } catch (e) {
      setCompany(prev => {
        const next = { ...prev, ...updated };
        localStorage.setItem('switchgear_saas_company', JSON.stringify(next));
        return next;
      });
    }
  };

  const handleLoginSuccess = (user: SaaSUser, tenantCompany: CompanyTenant) => {
    localStorage.setItem('switchgear_saas_user', JSON.stringify(user));
    localStorage.setItem('switchgear_saas_company', JSON.stringify(tenantCompany));
    setCurrentUser(user);
    setCompany(tenantCompany);
    // Load isolated tenant projects immediately after setting switchgear_saas_company
    loadData();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut notice:', e);
    }
    localStorage.removeItem('switchgear_saas_user');
    localStorage.removeItem('switchgear_saas_company');
    setCurrentUser(null);
  };

  const handleSwitchTenant = (newCompany: CompanyTenant, newUser: SaaSUser) => {
    localStorage.setItem('switchgear_saas_user', JSON.stringify(newUser));
    localStorage.setItem('switchgear_saas_company', JSON.stringify(newCompany));
    setCompany(newCompany);
    setCurrentUser(newUser);
    loadData();
  };

  // --------------------------------------------------------------------------
  // AUTHENTICATION GATE:
  // Website dashboard and panels are strictly visible ONLY AFTER LOGIN.
  // When no active session exists, display the Facebook-Style Login Gateway.
  // --------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <FacebookLoginScreen
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        componentCount={components.length}
        priceCount={prices.length}
        projectCount={projects.length}
        currentUser={currentUser}
        currentCompany={company}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDocumentation={() => setIsDocModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentView={currentView}
          currentUser={currentUser}
          currentCompany={company}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenDocumentation={() => setIsDocModalOpen(true)}
          onNavigateToClientApprovals={() => setCurrentView('client_approvals')}
          onOpenAddComponent={() => {
            setComponentToEdit(null);
            setIsComponentFormOpen(true);
          }}
          onOpenAddPrice={() => handleOpenRevisePrice()}
          onResetData={handleResetData}
          onExportCSV={handleExportCSV}
          onOpenArchitecture={() => setCurrentView('architecture')}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {currentView === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              recentPrices={prices}
              components={components}
              manufacturers={manufacturers}
              projects={projects}
              quotations={allQuotations}
              orders={allOrders}
              followUps={allFollowUps}
              onNavigate={setCurrentView}
              onSelectComponent={setSelectedComponentForDetail}
              onOpenNewPrice={handleOpenRevisePrice}
              onSavePO={handleSavePO}
              onUpdatePO={handleUpdatePO}
              onVerifyPO={handleVerifyPO}
              onRejectPO={handleRejectPO}
              onCancelPO={handleCancelPO}
              onDeletePO={handleDeletePO}
              onClearAllPOs={handleClearAllPOs}
              onResetCommercialPipeline={handleResetCommercialPipeline}
              onLoadDemoData={handleLoadDemoData}
              onSaveFollowUp={handleSaveFollowUp}
              onOpenQuotation={(q) => {
                const prj = projects.find(p => p.projectID === q.projectID);
                if (prj) handleSelectProjectForQuotation(prj);
              }}
            />
          )}

          {currentView === 'po_register' && (
            <POBookingView
              orders={allOrders}
              quotations={allQuotations}
              projects={projects}
              onSavePO={handleSavePO}
              onUpdatePO={handleUpdatePO}
              onVerifyPO={handleVerifyPO}
              onRejectPO={handleRejectPO}
              onCancelPO={handleCancelPO}
              onDeletePO={handleDeletePO}
              onClearAllPOs={handleClearAllPOs}
              onNavigateToQuotation={() => setCurrentView('quotations')}
            />
          )}

          {currentView === 'follow_ups' && (
            <FollowUpCenterView
              followUps={allFollowUps}
              quotations={allQuotations}
              onOpenNewFollowUp={(quote) => {
                setSelectedQuoteForFollowUp(quote || null);
                setIsFollowUpModalOpen(true);
              }}
            />
          )}

          {currentView === 'sld_studio' && (
            <SLDStudioView
              catalogComponents={components}
              project={activeProject || undefined}
              panels={activePanels}
              activePanelId={selectedCADPanelId}
              onSelectPanel={setSelectedCADPanelId}
              onSyncPanelToProject={handleSyncSLDToPanels}
              onNavigateToCosting={() => setCurrentView('quotations')}
              onBackToWorkspace={() => setCurrentView('workspace')}
            />
          )}

          {currentView === 'bureau' && (
            <BureauHubView
              projects={projects}
              panels={allPanels}
              quotations={allQuotations}
              manufacturers={manufacturers}
              onOpenProject={handleSelectProjectForEstimation}
              onRefreshData={loadData}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              onSelectProjectForEstimation={handleSelectProjectForEstimation}
              onSelectProjectForQuotation={handleSelectProjectForQuotation}
              onSelectProjectForBOM={handleSelectProjectForBOM}
              onSelectProjectForSLD={(p) => handleSelectProjectForSLD(p)}
              onOpenNewProject={() => {
                if (projects.length >= maxProjectsAllowed) {
                  setPaywallReason('quota');
                  return;
                }
                setProjectToEdit(null);
                setIsProjectModalOpen(true);
              }}
              onOpenEditProject={(p) => {
                setProjectToEdit(p);
                setIsProjectModalOpen(true);
              }}
              onDeleteProject={(id) => setDeleteProjectConfirmId(id)}
            />
          )}

          {currentView === 'workspace' && (
            activeProject ? (
              <EstimationWorkspaceView
                project={activeProject}
                panels={activePanels}
                components={components}
                panelTypes={panelTypes}
                onBackToProjects={() => setCurrentView('projects')}
                onNavigateToQuotation={handleSelectProjectForQuotation}
                onNavigateToBOM={handleSelectProjectForBOM}
                onNavigateToSLD={handleNavigateToSLD}
                onAddPanel={handleAddPanel}
                onUpdatePanel={handleUpdatePanel}
                onDeletePanel={handleDeletePanel}
                onAddItemToPanel={handleAddItemToPanel}
                onDeleteItemFromPanel={handleDeleteItemFromPanel}
              />
            ) : (
              <div className="bg-white border border-slate-200 p-8 rounded-xl text-center text-slate-600 font-mono shadow-xs">
                Please select or create a project first to open the Panel Sizing Engine.
                <div className="mt-4">
                  <button
                    onClick={() => setCurrentView('projects')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    Go to Projects
                  </button>
                </div>
              </div>
            )
          )}

          {currentView === 'bom' && (
            activeProject ? (
              <BOMView
                project={activeProject}
                bomItems={activeBOM}
                companyPlan={company.plan}
                onBackToEstimation={() => setCurrentView('workspace')}
                onNavigateToQuotation={() => setCurrentView('quotations')}
                onRequireUpgrade={() => setPaywallReason('export')}
              />
            ) : (
              <div className="bg-white border border-slate-200 p-8 rounded-xl text-center text-slate-600 font-mono shadow-xs">
                Please select a project to view its consolidated Bill of Materials.
                <div className="mt-4">
                  <button
                    onClick={() => setCurrentView('projects')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    Go to Projects
                  </button>
                </div>
              </div>
            )
          )}

          {currentView === 'quotations' && (
            activeProject ? (
              <QuotationsView
                project={activeProject}
                panels={activePanels}
                quotation={activeQuotation}
                company={company}
                onBackToEstimation={() => setCurrentView('workspace')}
                onSaveQuotation={handleSaveQuotation}
                onRequireUpgrade={() => setPaywallReason('export')}
              />
            ) : (
              <div className="bg-white border border-slate-200 p-8 rounded-xl text-center text-slate-600 font-mono shadow-xs">
                Please select a project to generate commercial quotations.
                <div className="mt-4">
                  <button
                    onClick={() => setCurrentView('projects')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    Go to Projects
                  </button>
                </div>
              </div>
            )
          )}

          {currentView === 'components' && (
            <ComponentsView
              components={components}
              categories={categories}
              manufacturers={manufacturers}
              onSelectComponent={setSelectedComponentForDetail}
              onOpenAddComponent={() => {
                setComponentToEdit(null);
                setIsComponentFormOpen(true);
              }}
              onOpenEditComponent={(comp) => {
                setComponentToEdit(comp);
                setIsComponentFormOpen(true);
              }}
              onDeleteComponent={(id) => setDeleteConfirmId(id)}
              onOpenPriceHistory={handleOpenPriceHistory}
              onOpenRevisePrice={handleOpenRevisePrice}
              onExportCSV={handleExportCSV}
              onOpenImport={() => setIsImportModalOpen(true)}
            />
          )}

          {currentView === 'manufacturers' && (
            <ManufacturersView
              manufacturers={manufacturers}
              components={components}
              onAddManufacturer={handleAddManufacturer}
            />
          )}

          {currentView === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
            />
          )}

          {currentView === 'prices' && (
            <PricingView
              prices={prices}
              components={components}
              manufacturers={manufacturers}
              suppliers={suppliers}
              onOpenNewPrice={handleOpenRevisePrice}
              onOpenPriceHistory={handleOpenPriceHistory}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentView === 'panel_types' && (
            <PanelTypesView 
              panelTypes={panelTypes} 
              components={components}
              projects={projects}
              onSelectComponent={(comp) => setSelectedComponentForDetail(comp)}
              onOpenAddComponent={() => {
                setComponentToEdit(null);
                setIsComponentFormOpen(true);
              }}
              onRefreshData={loadData}
              onNavigateToAssemblies={() => setCurrentView('predefined_assemblies')}
            />
          )}

          {currentView === 'predefined_assemblies' && (
            <PredefinedAssembliesView
              projects={projects}
              activeProject={activeProject}
              components={components}
              onSelectProject={(prj) => {
                setActiveProject(prj);
                const prjPanels = storageService.getPanelsByProject(prj.projectID);
                setActivePanels(prjPanels);
                setCurrentView('workspace');
              }}
              onNavigateToWorkspace={(prj) => {
                setActiveProject(prj);
                const prjPanels = storageService.getPanelsByProject(prj.projectID);
                setActivePanels(prjPanels);
                setCurrentView('workspace');
              }}
            />
          )}

          {currentView === 'labour_rates' && (
            <LabourRatesView labourRates={labourRates} />
          )}

          {currentView === 'client_approvals' && (
            <ClientCompaniesAndApprovalsView
              onNavigateToBureau={() => setCurrentView('bureau')}
              onNavigateToProjects={() => setCurrentView('projects')}
              onClientDataUpdated={() => {
                syncActiveCompanyRecord();
                loadData();
              }}
            />
          )}

          {currentView === 'architecture' && (
            <ArchitectureView />
          )}

          {currentView === 'production' && (
            <ProductionHandoverView
              projects={projects}
              activeProject={activeProject}
              panels={activePanels}
              onSelectProject={setActiveProject}
            />
          )}

          {currentView === 'saas_billing' && (
            <SaaSBillingView
              company={company}
              subscription={subscription}
              currentUser={currentUser as any}
              projectsCount={projects.length}
              onUpgradePlan={handleUpgradePlan}
            />
          )}

          {currentView === 'company_settings' && (
            <CompanySettingsView
              company={company}
              onSaveCompany={handleSaveCompanySettings}
            />
          )}

          {currentView === 'audit' && (
            <AuditLogView logs={auditLogs} />
          )}
        </main>
      </div>

      {/* Component Technical Datasheet Modal */}
      <ComponentDetailModal
        component={selectedComponentForDetail}
        onClose={() => setSelectedComponentForDetail(null)}
        onOpenPriceHistory={handleOpenPriceHistory}
        onRevisePrice={handleOpenRevisePrice}
        onEditComponent={(comp) => {
          setSelectedComponentForDetail(null);
          setComponentToEdit(comp);
          setIsComponentFormOpen(true);
        }}
      />

      {/* Component Form (Add / Edit) Modal */}
      <ComponentFormModal
        isOpen={isComponentFormOpen}
        onClose={() => {
          setIsComponentFormOpen(false);
          setComponentToEdit(null);
        }}
        onSave={handleSaveComponent}
        componentToEdit={componentToEdit}
        categories={categories}
        manufacturers={manufacturers}
      />

      {/* Excel / CSV Master Components Bulk Import Modal */}
      <ComponentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        categories={categories}
        manufacturers={manufacturers}
        suppliers={suppliers}
        existingComponents={components}
        onImportSuccess={() => {
          loadData();
        }}
      />

      {/* Project Form (Add / Edit) Modal */}
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
        }}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />

      {/* Supplier Price Entry / Revision Modal */}
      <PriceEntryModal
        isOpen={isPriceEntryOpen}
        onClose={() => {
          setIsPriceEntryOpen(false);
          setPreselectedComponentForPrice(null);
        }}
        onSavePrice={handleSavePrice}
        components={components}
        suppliers={suppliers}
        preselectedComponent={preselectedComponentForPrice}
      />

      {/* Historical Price Timeline Modal */}
      <PriceHistoryModal
        component={componentForHistory}
        history={priceHistoryList}
        isOpen={isPriceHistoryOpen}
        onClose={() => {
          setIsPriceHistoryOpen(false);
          setComponentForHistory(null);
        }}
        onOpenRevisePrice={handleOpenRevisePrice}
      />

      {/* Component Deletion Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeleteComponent(deleteConfirmId)}
        title="Delete Switchgear Component"
        message="Are you sure you want to delete this component? This will remove the component from the master catalog and mark associated historical records as archived."
        confirmLabel="Delete Component"
        isDestructive={true}
      />

      {/* Project Deletion Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteProjectConfirmId !== null}
        onClose={() => setDeleteProjectConfirmId(null)}
        onConfirm={() => deleteProjectConfirmId && handleDeleteProject(deleteProjectConfirmId)}
        title="Delete Switchgear Project"
        message="Are you sure you want to delete this project and all its configured switchboards? This action cannot be undone."
        confirmLabel="Delete Project"
        isDestructive={true}
      />

      {/* SaaS Google Authentication & Multi-Tenant Isolation Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        currentCompany={company}
        onSwitchTenant={handleSwitchTenant}
        onSignOut={handleLogout}
      />

      {/* Project Architecture & PDF Manual Modal */}
      <ProjectDocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />

      {/* Commercial Intelligence: Log Follow-up Activity Modal */}
      <NewFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setSelectedQuoteForFollowUp(null);
        }}
        quotations={allQuotations}
        selectedQuotation={selectedQuoteForFollowUp}
        onSaveFollowUp={(activity) => {
          handleSaveFollowUp(activity);
          setIsFollowUpModalOpen(false);
          setSelectedQuoteForFollowUp(null);
        }}
      />

      {/* Subscription Quota & Feature Paywall Modal */}
      {paywallReason && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {paywallReason === 'quota' ? 'Estimation Quota Reached' : 'Paid License Required'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {paywallReason === 'quota'
                      ? `You Have Used ${projects.length} / ${maxProjectsAllowed} Estimations`
                      : 'Commercial PDF & Excel Exports Require a Paid Plan'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setPaywallReason(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-sans text-xs text-slate-700 leading-relaxed space-y-2">
              {paywallReason === 'quota' ? (
                <p>
                  Your current <strong>{company.plan}</strong> plan includes a maximum of{' '}
                  <strong>{maxProjectsAllowed} active estimation projects</strong>. Upgrade to{' '}
                  <strong>Starter (10 projects)</strong>, <strong>Professional (50 projects)</strong>, or{' '}
                  <strong>Advanced (200 projects)</strong> to continue creating new tenders.
                </p>
              ) : (
                <p>
                  Your account is currently on the <strong>Free Trial ({maxProjectsAllowed} Projects)</strong> tier. You can size panels and preview quotations in-app, but downloading official <strong>PDF Client Proposals</strong> and <strong>Excel/CSV Bills of Materials</strong> requires an active paid subscription.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPaywallReason(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setPaywallReason(null);
                  setCurrentView('saas_billing');
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>View Subscription Plans (AED)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
