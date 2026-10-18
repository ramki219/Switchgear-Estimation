import React, { useState, useEffect } from 'react';
import { 
  Component, 
  SupplierPrice, 
  Manufacturer, 
  DashboardMetrics, 
  Project, 
  Quotation, 
  PurchaseOrder, 
  FollowUpActivity 
} from '../../types';
import { storageService } from '../../services/storageService';
import { CommercialDashboardView } from '../commercial/CommercialDashboardView';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  recentPrices: SupplierPrice[];
  components: Component[];
  manufacturers: Manufacturer[];
  projects?: Project[];
  quotations?: Quotation[];
  orders?: PurchaseOrder[];
  followUps?: FollowUpActivity[];
  onNavigate: (view: any) => void;
  onSelectComponent: (comp: Component) => void;
  onOpenNewPrice: (componentId?: number) => void;
  onSavePO?: (po: Omit<PurchaseOrder, 'poID' | 'createdAt' | 'updatedAt' | 'auditHistory'>) => void;
  onUpdatePO?: (po: PurchaseOrder) => void;
  onVerifyPO?: (poID: number, verifiedBy: string) => void;
  onRejectPO?: (poID: number, reason: string) => void;
  onCancelPO?: (poID: number, reason: string) => void;
  onDeletePO?: (poID: number) => void;
  onClearAllPOs?: () => void;
  onResetCommercialPipeline?: () => void;
  onLoadDemoData?: () => void;
  onSaveFollowUp?: (activity: Omit<FollowUpActivity, 'id' | 'createdAt'>) => void;
  onOpenQuotation?: (quotation: Quotation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentPrices,
  components,
  manufacturers,
  projects = [],
  quotations: propQuotations,
  orders: propOrders,
  followUps: propFollowUps,
  onNavigate,
  onSelectComponent,
  onOpenNewPrice,
  onSavePO: propOnSavePO,
  onUpdatePO: propOnUpdatePO,
  onVerifyPO: propOnVerifyPO,
  onRejectPO: propOnRejectPO,
  onCancelPO: propOnCancelPO,
  onDeletePO: propOnDeletePO,
  onClearAllPOs: propOnClearAllPOs,
  onResetCommercialPipeline: propOnResetCommercialPipeline,
  onLoadDemoData: propOnLoadDemoData,
  onSaveFollowUp: propOnSaveFollowUp,
  onOpenQuotation,
}) => {
  // Local state for auto-refreshing commercial datasets if not supplied via props
  const [internalQuotations, setInternalQuotations] = useState<Quotation[]>(
    propQuotations || storageService.getQuotations()
  );
  const [internalOrders, setInternalOrders] = useState<PurchaseOrder[]>(
    propOrders || storageService.getPurchaseOrders()
  );
  const [internalFollowUps, setInternalFollowUps] = useState<FollowUpActivity[]>(
    propFollowUps || storageService.getFollowUps()
  );

  const refreshCommercialData = () => {
    setInternalQuotations(storageService.getQuotations());
    setInternalOrders(storageService.getPurchaseOrders());
    setInternalFollowUps(storageService.getFollowUps());
  };

  useEffect(() => {
    if (propQuotations) setInternalQuotations(propQuotations);
  }, [propQuotations]);

  useEffect(() => {
    if (propOrders) setInternalOrders(propOrders);
  }, [propOrders]);

  useEffect(() => {
    if (propFollowUps) setInternalFollowUps(propFollowUps);
  }, [propFollowUps]);

  const handleSavePO = (po: Omit<PurchaseOrder, 'poID' | 'createdAt' | 'updatedAt' | 'auditHistory'>) => {
    if (propOnSavePO) {
      propOnSavePO(po);
    } else {
      storageService.addPurchaseOrder(po);
      refreshCommercialData();
    }
  };

  const handleUpdatePO = (po: PurchaseOrder) => {
    if (propOnUpdatePO) {
      propOnUpdatePO(po);
    } else {
      storageService.updatePurchaseOrder(po);
      refreshCommercialData();
    }
  };

  const handleVerifyPO = (poID: number, verifiedBy: string) => {
    if (propOnVerifyPO) {
      propOnVerifyPO(poID, verifiedBy);
    } else {
      storageService.verifyPurchaseOrder(poID, verifiedBy);
      refreshCommercialData();
    }
  };

  const handleRejectPO = (poID: number, reason: string) => {
    if (propOnRejectPO) {
      propOnRejectPO(poID, reason);
    } else {
      storageService.rejectPurchaseOrder(poID, 'Commercial Lead', reason);
      refreshCommercialData();
    }
  };

  const handleCancelPO = (poID: number, reason: string) => {
    if (propOnCancelPO) {
      propOnCancelPO(poID, reason);
    } else {
      storageService.cancelPurchaseOrder(poID, 'Commercial Lead', reason);
      refreshCommercialData();
    }
  };

  const handleDeletePO = (poID: number) => {
    if (propOnDeletePO) {
      propOnDeletePO(poID);
    } else {
      storageService.deletePurchaseOrder(poID);
      refreshCommercialData();
    }
  };

  const handleClearAllPOs = () => {
    if (propOnClearAllPOs) {
      propOnClearAllPOs();
    } else {
      storageService.clearAllPurchaseOrders();
      refreshCommercialData();
    }
  };

  const handleSaveFollowUp = (activity: Omit<FollowUpActivity, 'id' | 'createdAt'>) => {
    if (propOnSaveFollowUp) {
      propOnSaveFollowUp(activity);
    } else {
      storageService.addFollowUp(activity);
      refreshCommercialData();
    }
  };

  const handleResetCommercialPipeline = () => {
    if (propOnResetCommercialPipeline) {
      propOnResetCommercialPipeline();
    } else {
      storageService.resetCommercialPipelineToClean();
      refreshCommercialData();
    }
  };

  const handleLoadDemoData = () => {
    if (propOnLoadDemoData) {
      propOnLoadDemoData();
    } else {
      storageService.loadDemoShowcaseData();
      refreshCommercialData();
    }
  };

  return (
    <CommercialDashboardView
      quotations={internalQuotations}
      orders={internalOrders}
      projects={projects}
      followUps={internalFollowUps}
      components={components}
      prices={recentPrices}
      manufacturers={manufacturers}
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
      onNavigateToEstimationWorkspace={(proj) => {
        onNavigate('workspace');
      }}
      onOpenQuotation={onOpenQuotation}
      onSelectComponent={onSelectComponent}
      onOpenNewPrice={onOpenNewPrice}
    />
  );
};
