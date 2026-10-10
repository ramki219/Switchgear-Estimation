// ============================================================================
// LV SWITCHGEAR ENGINEERING & SLD DESIGN STUDIO
// Core Workflow: SLD Input → Interpretation → Equipment Selection → Auto-SLD →
// Calculations → BOM/BOQ → Panel GA → Facia → Wiring Schedules → Compliance
// Single Source of Truth for all dependent outputs
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  SLDTopology, 
  PanelGAData, 
  FaciaLayoutData, 
  ATSConfiguration,
  ProjectRevisionRecord 
} from '../../types/engineering';
import { Component, Project } from '../../types';
import { SLDEngine } from '../../services/sldEngine';
import { PanelCADEngine } from '../../services/panelCADEngine';
import { ATSEngineeringEngine } from '../../services/atsEngineeringEngine';
import { ValidationEngine } from '../../services/validationEngine';
import { GraphicalSLDEditor } from './GraphicalSLDEditor';
import { PanelGADrawing } from './PanelGADrawing';
import { FaciaGeneratorView } from './FaciaGeneratorView';
import { ATSEngineeringView } from './ATSEngineeringView';
import { BusbarCalculationView } from './BusbarCalculationView';
import { ControlWiringView } from './ControlWiringView';
import { CustomerBOQView } from './CustomerBOQView';
import { EngineeringValidationPanel } from './EngineeringValidationPanel';
import { EngineeringAIAssistantDrawer } from './EngineeringAIAssistantDrawer';
import { 
  Layers, 
  Zap, 
  Ruler, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  Bot, 
  FileSpreadsheet, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Printer,
  History,
  Send,
  ArrowRight
} from 'lucide-react';

interface SLDStudioViewProps {
  catalogComponents: Component[];
  project?: Project;
  onNavigateToCosting?: () => void;
}

export type EngineeringStudioTab = 
  | 'sld_editor' 
  | 'text_input' 
  | 'panel_ga' 
  | 'facia' 
  | 'ats' 
  | 'busbars' 
  | 'wiring' 
  | 'boq' 
  | 'validation' 
  | 'ai_assistant';

export const SLDStudioView: React.FC<SLDStudioViewProps> = ({
  catalogComponents,
  project,
  onNavigateToCosting,
}) => {
  // SINGLE SOURCE OF TRUTH: SLD Topology
  const [topology, setTopology] = useState<SLDTopology>(() => {
    return SLDEngine.createDemoTopology(catalogComponents);
  });

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<EngineeringStudioTab>('sld_editor');

  // Natural Language / Structured SLD Text Input State
  const [inputText, setInputText] = useState<string>(`PANEL: MDB-01
SYSTEM: 415V 3PH 4W 50Hz TN-S
FORM: Form 4B Type 6
IP: IP54

INCOMER-1:
Source: Utility Grid
Breaker: 4000A 4P ACB 65kA LSIG Drawout

INCOMER-2:
Source: Standby Diesel Generator
Breaker: 2500A 4P ACB 65kA LSIG Drawout

BUS COUPLER:
Breaker: 4000A 4P ACB 65kA Drawout (Castell Interlock)

OUTGOINGS:
15 outgoing feeders (800A, 630A, 400A, 250A, 160A, 100A MCCBs)`);

  // Revision Control
  const [revisions, setRevisions] = useState<ProjectRevisionRecord[]>([
    {
      revision: 'R0',
      date: '2026-09-28',
      author: 'Lead Estimator (Eng. Rajesh)',
      status: 'ENGINEER_APPROVED',
      changeLog: [
        'Initial IEC 61439-2 Form 4B engineering baseline created',
        '2x Incomers (4000A Grid + 2500A Gen) with 4000A Bus Coupler configured',
        '15x Outgoing feeders assigned with preliminary copper busbar sizing',
      ],
      approvedBy: 'Chief Technical Officer',
    },
  ]);

  // Derived CAD, Facia & ATS Models - Driven automatically from SINGLE SOURCE OF TRUTH
  const gaData: PanelGAData = React.useMemo(() => {
    return PanelCADEngine.generatePanelGA(topology);
  }, [topology]);

  const faciaData: FaciaLayoutData = React.useMemo(() => {
    return PanelCADEngine.generateFaciaLayout(topology, gaData);
  }, [topology, gaData]);

  const atsConfig: ATSConfiguration = React.useMemo(() => {
    return ATSEngineeringEngine.generateATSConfiguration(topology);
  }, [topology]);

  const validations = React.useMemo(() => {
    return ValidationEngine.validateDesign(topology);
  }, [topology]);

  const errorCount = validations.filter(v => v.severity === 'ERROR').length;
  const warningCount = validations.filter(v => v.severity === 'WARNING').length;

  const handleParseInput = () => {
    const res = SLDEngine.parseSLDInput(inputText, catalogComponents);
    if (res.success) {
      setTopology(res.topology);
      setActiveTab('sld_editor');

      // Record revision entry
      const newRev: ProjectRevisionRecord = {
        revision: `R${revisions.length}`,
        date: new Date().toISOString().split('T')[0],
        author: 'Lead Design Engineer',
        status: 'DRAFT',
        changeLog: [
          `Parsed SLD input: ${res.detectedSummary.sourcesCount} sources, ${res.detectedSummary.outgoingsCount} feeders`,
          `Updated form of separation to ${res.detectedSummary.formOfSeparation}, ${res.detectedSummary.ipRating}`,
        ],
      };
      setRevisions(prev => [newRev, ...prev]);
    }
  };

  const handleApplyAIAction = (action: any) => {
    if (action.type === 'UPDATE_OEM') {
      const oem = action.payload.manufacturer;
      const updatedNodes = topology.nodes.map(n => ({
        ...n,
        manufacturer: oem,
        modelSeries: oem === 'Schneider' ? (n.type === 'ACB' ? 'MasterPact MTZ2' : 'ComPact NSX')
          : oem === 'Siemens' ? (n.type === 'ACB' ? 'Sentron 3WA' : 'Sentron 3VA')
          : (n.type === 'ACB' ? 'Emax 2' : 'Tmax XT'),
      }));
      setTopology({ ...topology, nodes: updatedNodes, updatedAt: new Date().toISOString() });
      setActiveTab('sld_editor');
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs pb-12">
      {/* Top Engineering Studio Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-bold uppercase">
              PROFESSIONAL LV SWITCHGEAR ENGINEERING PLATFORM
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
              Rev: {revisions[0]?.revision || 'R0'} ({revisions[0]?.status || 'ACTIVE'})
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              ONE SOURCE OF TRUTH
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-600" />
            <span>LV Switchgear Design, GA Layout, Facia & SLD Studio</span>
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Single Line Diagram → Component Selection → IEC 61439 Validation → 2D GA Dimensions → Door Facia → Control Schedules → Customer BOQ
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Engineering Validation Badge Indicator */}
          <button
            onClick={() => setActiveTab('validation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-2xs ${
              errorCount > 0 
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : warningCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {errorCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{errorCount} Safety Errors</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{warningCount} Warnings • Validated</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('text_input')}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-700" />
            <span>SLD Text / Prompt Input</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_assistant')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition shadow-2xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Engineering AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Primary Engineering Studio Navigation Tabs */}
      <div className="flex items-center overflow-x-auto gap-1 border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs text-xs">
        <button
          onClick={() => setActiveTab('sld_editor')}
          className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sld_editor' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>1. Graphical SLD Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('panel_ga')}
          className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'panel_ga' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>2. 2D Panel GA Drawing</span>
        </button>

        <button
          onClick={() => setActiveTab('facia')}
          className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'facia' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>3. Front Facia Layout</span>
        </button>

        <button
          onClick={() => setActiveTab('ats')}
          className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ats' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>4. ATS & Interlocking</span>
        </button>

        <button
          onClick={() => setActiveTab('busbars')}
          className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'busbars' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>5. Busbar Sizing (Cu/Al)</span>
        </button>

        <button
          onClick={() => setActiveTab('wiring')}
          className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'wiring' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>6. Control Wiring & Terminals</span>
        </button>

        <button
          onClick={() => setActiveTab('boq')}
          className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'boq' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>7. Customer BOQ Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'validation' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>8. IEC 61439 Validation</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_assistant')}
          className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ai_assistant' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>9. Engineering AI</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB CONTENTS */}
      {/* ============================================================== */}

      {/* Tab 1: Graphical SLD Editor */}
      {activeTab === 'sld_editor' && (
        <GraphicalSLDEditor
          topology={topology}
          onUpdateTopology={(updated) => setTopology(updated)}
        />
      )}

      {/* Tab 2: 2D Panel GA Drawing */}
      {activeTab === 'panel_ga' && (
        <PanelGADrawing
          gaData={gaData}
        />
      )}

      {/* Tab 3: Front Facia & Door Mimic */}
      {activeTab === 'facia' && (
        <FaciaGeneratorView
          faciaData={faciaData}
          topology={topology}
        />
      )}

      {/* Tab 4: ATS & Interlocking Module */}
      {activeTab === 'ats' && (
        <ATSEngineeringView
          atsConfig={atsConfig}
          topology={topology}
          onUpdateATSConfig={(updated) => {}}
        />
      )}

      {/* Tab 5: Busbar Sizing Module */}
      {activeTab === 'busbars' && (
        <BusbarCalculationView
          topology={topology}
        />
      )}

      {/* Tab 6: Control Wiring & Terminal Schedules */}
      {activeTab === 'wiring' && (
        <ControlWiringView
          topology={topology}
        />
      )}

      {/* Tab 7: Customer BOQ vs Manufacturing BOM */}
      {activeTab === 'boq' && (
        <CustomerBOQView
          topology={topology}
        />
      )}

      {/* Tab 8: Validation Panel */}
      {activeTab === 'validation' && (
        <EngineeringValidationPanel
          topology={topology}
        />
      )}

      {/* Tab 9: AI Engineering Assistant */}
      {activeTab === 'ai_assistant' && (
        <EngineeringAIAssistantDrawer
          topology={topology}
          catalog={catalogComponents}
          onApplyAction={handleApplyAIAction}
        />
      )}

      {/* Sub-View: Text / Prompt SLD Input Dialog */}
      {activeTab === 'text_input' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                <span>Natural Language / Structured SLD Syntax Input</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Paste structured tender specifications or describe the switchboard in plain natural language (e.g. "MDB with 2x 4000A utility incomers, 1x 2500A generator incomer, 4000A bus coupler, 15 outgoings, Form 4B IP54").
              </p>
            </div>
            <button
              onClick={() => setActiveTab('sld_editor')}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
          </div>

          <textarea
            rows={14}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-cyan-600 shadow-inner"
          />

          <div className="flex justify-between items-center pt-2">
            <div className="text-[11px] text-slate-500 font-sans">
              The engine will parse electrical topology, select approved components from the SQL database, size busbars, and create all 9 views automatically.
            </div>

            <button
              onClick={handleParseInput}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Parse & Generate Engineering Topology</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
