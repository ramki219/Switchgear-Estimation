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

// Commercial SaaS & Production Handover Views
import { ProductionHandoverView } from './components/production/ProductionHandoverView';
import { SaaSBillingView } from './components/saas/SaaSBillingView';
import { CompanySettingsView } from './components/saas/CompanySettingsView';
import { FacebookLoginScreen } from './components/auth/FacebookLoginScreen';
import { ProjectDocumentationModal } from './components/documentation/ProjectDocumentationModal';
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
        }
        return found;
      }
      return null;
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Phase 2 Project CRUD
  const handleSaveProject = (projectData: any) => {
    if (projectData.projectID) {
      storageService.updateProject(projectData);
    } else {
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

  // Export CSV
  const handleExportCSV = () => {
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
  const handleUpgradePlan = async (newPlan: SaaSPlan, billingCycle: 'MONTHLY' | 'ANNUAL') => {
    try {
      const res = await apiClient.post('/api/tenant/subscription/change-plan', { plan: newPlan, billingCycle });
      if (res) {
        setSubscription(res);
        setCompany(prev => ({ ...prev, plan: newPlan }));
      }
    } catch (e) {
      console.warn('API update failed, updating state locally:', e);
      setCompany(prev => ({ ...prev, plan: newPlan }));
      setSubscription(prev => prev ? { ...prev, plan: newPlan, billingCycle } : null);
    }
  };

  const handleSaveCompanySettings = async (updated: Partial<CompanyTenant>) => {
    try {
      const res = await apiClient.put('/api/tenant/company', updated);
      if (res) {
        setCompany(prev => ({ ...prev, ...res }));
      }
    } catch (e) {
      console.warn('API update failed, updating state locally:', e);
      setCompany(prev => ({ ...prev, ...updated }));
    }
  };

  const handleLoginSuccess = (user: SaaSUser, tenantCompany: CompanyTenant) => {
    setCurrentUser(user);
    setCompany(tenantCompany);
    localStorage.setItem('switchgear_saas_user', JSON.stringify(user));
    localStorage.setItem('switchgear_saas_company', JSON.stringify(tenantCompany));
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
    setCompany(newCompany);
    setCurrentUser(newUser);
    localStorage.setItem('switchgear_saas_user', JSON.stringify(newUser));
    localStorage.setItem('switchgear_saas_company', JSON.stringify(newCompany));
    if (newCompany.id === 2) {
      // Demonstrating strict multi-tenant isolation: Tenant 2 sees only their own tenders
      setProjects([
        {
          projectID: 201,
          projectCode: 'GULF-2026-001',
          projectName: 'Musaffah 33/11kV Substation Auxiliary PCC & MCC',
          clientName: 'Abu Dhabi Distribution Company (ADDC)',
          consultantName: 'KEO International Consultants',
          location: 'Musaffah Industrial, Abu Dhabi',
          authority: 'ADDC',
          status: 'IN_ESTIMATION',
          createdDate: '2026-10-02',
          dueDate: '2026-11-20',
          currency: 'AED',
          assignedEstimator: 'Eng. Suresh Kumar',
          targetMarginPercent: 18.5,
          totalCost: 345000,
          sellingPrice: 423312,
          panelsCount: 4,
          primaryOEM: 'ABB',
          copperRatePerKg: 42.50,
        }
      ]);
      setActiveProject(null);
    } else {
      loadData();
    }
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
              onNavigate={setCurrentView}
              onSelectComponent={setSelectedComponentForDetail}
              onOpenNewPrice={handleOpenRevisePrice}
            />
          )}

          {currentView === 'sld_studio' && (
            <SLDStudioView
              catalogComponents={components}
              project={activeProject || undefined}
              onNavigateToCosting={() => setCurrentView('quotations')}
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
              onSelectProjectForSLD={(p) => {
                setActiveProject(p);
                setCurrentView('sld_studio');
              }}
              onOpenNewProject={() => {
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
                onNavigateToSLD={() => setCurrentView('sld_studio')}
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
                onBackToEstimation={() => setCurrentView('workspace')}
                onNavigateToQuotation={() => setCurrentView('quotations')}
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
                onBackToEstimation={() => setCurrentView('workspace')}
                onSaveQuotation={handleSaveQuotation}
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
            <PanelTypesView panelTypes={panelTypes} />
          )}

          {currentView === 'labour_rates' && (
            <LabourRatesView labourRates={labourRates} />
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

      {/* Project Architecture & Engineering Specification PDF Modal */}
      <ProjectDocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        currentCompany={company}
      />
    </div>
  );
}
