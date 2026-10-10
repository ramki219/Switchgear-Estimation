// ============================================================================
// GRAPHICAL SLD EDITOR & VIEWER (Interactive SVG Single Line Diagram)
// Symbols: Utility, Generator, Transformer, ACB, MCCB, MCB, Bus Coupler, Busbars, CT, Meter
// Supports node editing, live status toggle (OPEN/CLOSED), rating modification
// ============================================================================

import React, { useState } from 'react';
import { 
  SLDTopology, 
  SLDNode, 
  SLDConnection 
} from '../../types/engineering';
import { 
  Zap, 
  Plus, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Settings,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface GraphicalSLDEditorProps {
  topology: SLDTopology;
  onUpdateTopology: (updated: SLDTopology) => void;
  onSelectNode?: (node: SLDNode) => void;
}

export const GraphicalSLDEditor: React.FC<GraphicalSLDEditorProps> = ({
  topology,
  onUpdateTopology,
  onSelectNode,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<SLDNode | null>(null);

  const handleNodeClick = (node: SLDNode) => {
    setSelectedNodeId(node.id);
    setEditingNode({ ...node });
    if (onSelectNode) onSelectNode(node);
  };

  const handleToggleBreakerState = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedNodes = topology.nodes.map(n => {
      if (n.id === nodeId && (n.type === 'ACB' || n.type === 'MCCB' || n.type === 'BUS_COUPLER' || n.type === 'MCB')) {
        const nextStatus = n.status === 'CLOSED' ? 'OPEN' : 'CLOSED';
        return { ...n, status: nextStatus as 'CLOSED' | 'OPEN' };
      }
      return n;
    });
    onUpdateTopology({ ...topology, nodes: updatedNodes, updatedAt: new Date().toISOString() });
  };

  const handleSaveNodeEdit = () => {
    if (!editingNode) return;
    const updatedNodes = topology.nodes.map(n => n.id === editingNode.id ? editingNode : n);
    onUpdateTopology({ ...topology, nodes: updatedNodes, updatedAt: new Date().toISOString() });
    setEditingNode(null);
  };

  const handleAddOutgoing = () => {
    const outgoings = topology.nodes.filter(n => n.type === 'MCCB' || n.type === 'MCB');
    const newIdx = outgoings.length + 1;
    const newTag = `FDR-${String(newIdx).padStart(2, '0')}`;
    const newNode: SLDNode = {
      id: `node-fdr-${Date.now()}`,
      tag: newTag,
      type: 'MCCB',
      ratingA: 250,
      voltageV: topology.systemVoltage,
      poles: 4,
      icuKA: 50,
      protection: 'Thermal-Magnetic',
      manufacturer: 'ABB',
      modelSeries: 'Tmax XT4',
      selectedPartNumber: '1SDA068228R1',
      mounting: 'Fixed',
      busSectionId: 'bus-sec-1',
      loadDescription: `Auxiliary Feeder Circuit ${newIdx} (250A)`,
      powerKW: 110,
      powerFactor: 0.85,
      status: 'CLOSED',
      x: 100 + (outgoings.length % 8) * 90,
      y: 470,
    };

    const newConn: SLDConnection = {
      id: `conn-fdr-${Date.now()}`,
      fromNodeId: topology.nodes[1]?.id || 'node-inc-1',
      toNodeId: newNode.id,
      busSectionId: 'bus-sec-1',
    };

    onUpdateTopology({
      ...topology,
      nodes: [...topology.nodes, newNode],
      connections: [...topology.connections, newConn],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = topology.nodes.filter(n => n.id !== nodeId);
    const updatedConns = topology.connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
    onUpdateTopology({
      ...topology,
      nodes: updatedNodes,
      connections: updatedConns,
      updatedAt: new Date().toISOString(),
    });
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setEditingNode(null);
    }
  };

  // Group nodes by types
  const utilityIncomers = topology.nodes.filter(n => n.type === 'UTILITY' || (n.type === 'ACB' && n.tag.includes('INC-1')));
  const genIncomers = topology.nodes.filter(n => n.type === 'GENERATOR' || (n.type === 'ACB' && (n.tag.includes('INC-2') || n.tag.includes('GEN'))));
  const busCouplers = topology.nodes.filter(n => n.type === 'BUS_COUPLER');
  const meters = topology.nodes.filter(n => n.type === 'METER');
  const outgoings = topology.nodes.filter(n => n.type === 'MCCB' || n.type === 'MCB');

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-900 text-sm">{topology.panelTag} Electrical SLD</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {topology.systemVoltage}V • {topology.frequency}Hz • {topology.earthingSystem}
            </span>
            <span className="text-[10px] bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded border border-cyan-200 font-semibold">
              {topology.formOfSeparation}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-medium text-slate-700">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAddOutgoing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Outgoing Feeder</span>
          </button>
        </div>
      </div>

      {/* Main Diagram Area with Node Properties Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Drawing Canvas (3 Columns) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 overflow-x-auto shadow-xs min-h-[560px] relative">
          <div 
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', minWidth: '960px' }}
            className="transition-transform duration-100 select-none pb-8"
          >
            <svg width="1020" height="600" className="overflow-visible font-mono">
              <defs>
                {/* Arrow markers */}
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                {/* Grid pattern */}
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Background grid */}
              <rect width="1000" height="580" fill="url(#grid)" rx="8" />

              {/* ============================================================== */}
              {/* SOURCE 1: UTILITY GRID (Left Incomer) */}
              {/* ============================================================== */}
              <g className="cursor-pointer" onClick={() => handleNodeClick(topology.nodes[0] || topology.nodes[1])}>
                {/* Transformer / Grid symbol */}
                <circle cx="200" cy="50" r="18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                <circle cx="200" cy="74" r="18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                <text x="200" y="30" textAnchor="middle" className="text-[10px] font-bold fill-slate-800">SOURCE 1: UTILITY GRID</text>
                <text x="200" y="105" textAnchor="middle" className="text-[9px] fill-slate-500">11kV / 415V 50Hz</text>

                {/* Cable feed to Incomer ACB */}
                <line x1="200" y1="92" x2="200" y2="150" stroke="#0284c7" strokeWidth="3" />
              </g>

              {/* Incomer 1 ACB Symbol */}
              {(() => {
                const inc1 = topology.nodes.find(n => n.tag === 'INCOMER-1');
                if (!inc1) return null;
                const isClosed = inc1.status !== 'OPEN';
                return (
                  <g className="cursor-pointer" onClick={() => handleNodeClick(inc1)}>
                    {/* Breaker Box */}
                    <rect 
                      x="165" 
                      y="150" 
                      width="70" 
                      height="50" 
                      rx="6" 
                      fill={selectedNodeId === inc1.id ? '#e0f2fe' : '#ffffff'} 
                      stroke={isClosed ? '#dc2626' : '#16a34a'} 
                      strokeWidth="2" 
                    />
                    {/* Drawout Chassis Chevrons */}
                    <path d="M 160 160 L 165 160 M 160 190 L 165 190 M 235 160 L 240 160 M 235 190 L 240 190" stroke="#64748b" strokeWidth="2" />
                    {/* Switch contact */}
                    {isClosed ? (
                      <line x1="200" y1="158" x2="200" y2="192" stroke="#dc2626" strokeWidth="3.5" />
                    ) : (
                      <line x1="200" y1="158" x2="218" y2="185" stroke="#16a34a" strokeWidth="3.5" strokeDasharray="3 2" />
                    )}
                    <text x="200" y="142" textAnchor="middle" className="text-[11px] font-bold fill-slate-900">{inc1.tag}</text>
                    <text x="200" y="215" textAnchor="middle" className="text-[10px] font-semibold fill-cyan-900">{inc1.ratingA}A 4P 65kA</text>
                    <text x="200" y="228" textAnchor="middle" className="text-[9px] fill-slate-500">{inc1.protection || 'LSIG'} • Drawout</text>

                    {/* Toggle button */}
                    <rect 
                      x="180" 
                      y="235" 
                      width="40" 
                      height="16" 
                      rx="3" 
                      fill={isClosed ? '#fee2e2' : '#dcfce7'} 
                      stroke={isClosed ? '#ef4444' : '#22c55e'} 
                      onClick={(e) => handleToggleBreakerState(inc1.id, e)} 
                    />
                    <text 
                      x="200" 
                      y="247" 
                      textAnchor="middle" 
                      className={`text-[8px] font-bold ${isClosed ? 'fill-rose-700' : 'fill-emerald-700'}`}
                      onClick={(e) => handleToggleBreakerState(inc1.id, e)}
                    >
                      {isClosed ? 'ON (CLOSED)' : 'OFF (OPEN)'}
                    </text>
                  </g>
                );
              })()}

              {/* CT & Meter 1 */}
              <g>
                <line x1="200" y1="255" x2="200" y2="300" stroke="#0284c7" strokeWidth="3" />
                <circle cx="200" cy="280" r="7" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <circle cx="200" cy="285" r="7" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <text x="220" y="285" className="text-[9px] font-bold fill-slate-600">CT 4000/5A Cl 0.5</text>
                <rect x="220" y="290" width="60" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" />
                <text x="250" y="303" textAnchor="middle" className="text-[9px] font-bold fill-slate-800">M01 (Class 0.5S)</text>
              </g>

              {/* ============================================================== */}
              {/* SOURCE 2: GENERATOR (Right Incomer) */}
              {/* ============================================================== */}
              <g className="cursor-pointer" onClick={() => handleNodeClick(topology.nodes[4] || topology.nodes[5])}>
                {/* Generator symbol */}
                <circle cx="820" cy="62" r="24" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
                <text x="820" y="68" textAnchor="middle" className="text-base font-bold fill-amber-900 font-sans">G</text>
                <text x="820" y="30" textAnchor="middle" className="text-[10px] font-bold fill-slate-800">SOURCE 2: STANDBY GEN</text>
                <text x="820" y="105" textAnchor="middle" className="text-[9px] fill-slate-500">2500 kVA • 415V 50Hz</text>

                {/* Cable feed to Gen Incomer */}
                <line x1="820" y1="88" x2="820" y2="150" stroke="#d97706" strokeWidth="3" />
              </g>

              {/* Incomer 2 ACB Symbol (Generator) */}
              {(() => {
                const inc2 = topology.nodes.find(n => n.tag.includes('INC-2') || n.tag.includes('GEN'));
                if (!inc2) return null;
                const isClosed = inc2.status === 'CLOSED';
                return (
                  <g className="cursor-pointer" onClick={() => handleNodeClick(inc2)}>
                    <rect 
                      x="785" 
                      y="150" 
                      width="70" 
                      height="50" 
                      rx="6" 
                      fill={selectedNodeId === inc2.id ? '#fef3c7' : '#ffffff'} 
                      stroke={isClosed ? '#dc2626' : '#16a34a'} 
                      strokeWidth="2" 
                    />
                    <path d="M 780 160 L 785 160 M 780 190 L 785 190 M 855 160 L 860 160 M 855 190 L 860 190" stroke="#64748b" strokeWidth="2" />
                    {isClosed ? (
                      <line x1="820" y1="158" x2="820" y2="192" stroke="#dc2626" strokeWidth="3.5" />
                    ) : (
                      <line x1="820" y1="158" x2="838" y2="185" stroke="#16a34a" strokeWidth="3.5" strokeDasharray="3 2" />
                    )}
                    <text x="820" y="142" textAnchor="middle" className="text-[11px] font-bold fill-slate-900">{inc2.tag}</text>
                    <text x="820" y="215" textAnchor="middle" className="text-[10px] font-semibold fill-amber-900">{inc2.ratingA}A 4P 65kA</text>
                    <text x="820" y="228" textAnchor="middle" className="text-[9px] fill-slate-500">{inc2.protection || 'LSIG'} • Drawout</text>

                    {/* Toggle button */}
                    <rect 
                      x="800" 
                      y="235" 
                      width="40" 
                      height="16" 
                      rx="3" 
                      fill={isClosed ? '#fee2e2' : '#dcfce7'} 
                      stroke={isClosed ? '#ef4444' : '#22c55e'} 
                      onClick={(e) => handleToggleBreakerState(inc2.id, e)} 
                    />
                    <text 
                      x="820" 
                      y="247" 
                      textAnchor="middle" 
                      className={`text-[8px] font-bold ${isClosed ? 'fill-rose-700' : 'fill-emerald-700'}`}
                      onClick={(e) => handleToggleBreakerState(inc2.id, e)}
                    >
                      {isClosed ? 'ON (CLOSED)' : 'OFF (OPEN)'}
                    </text>
                  </g>
                );
              })()}

              {/* CT & Meter 2 */}
              <g>
                <line x1="820" y1="255" x2="820" y2="300" stroke="#d97706" strokeWidth="3" />
                <circle cx="820" cy="280" r="7" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <circle cx="820" cy="285" r="7" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <text x="840" y="285" className="text-[9px] font-bold fill-slate-600">CT 2500/5A Cl 0.5</text>
                <rect x="840" y="290" width="60" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" />
                <text x="870" y="303" textAnchor="middle" className="text-[9px] font-bold fill-slate-800">M02 (Class 0.5S)</text>
              </g>

              {/* ============================================================== */}
              {/* MAIN HORIZONTAL BUSBARS (Section 1 & Section 2) */}
              {/* ============================================================== */}
              {/* Bus Section 1 (Left - Blue) */}
              <line x1="40" y1="350" x2="460" y2="350" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" />
              <rect x="40" y="325" width="130" height="18" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
              <text x="105" y="337" textAnchor="middle" className="text-[9px] font-bold fill-cyan-900">BUS SECTION 1 (4000A Cu)</text>

              {/* Incomer 1 connection to Busbar 1 */}
              <line x1="200" y1="300" x2="200" y2="350" stroke="#0284c7" strokeWidth="3" />
              <circle cx="200" cy="350" r="5" fill="#0284c7" />

              {/* Bus Section 2 (Right - Amber) */}
              <line x1="560" y1="350" x2="980" y2="350" stroke="#d97706" strokeWidth="7" strokeLinecap="round" />
              <rect x="850" y="325" width="130" height="18" rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
              <text x="915" y="337" textAnchor="middle" className="text-[9px] font-bold fill-amber-900">BUS SECTION 2 (2500A Cu)</text>

              {/* Incomer 2 connection to Busbar 2 */}
              <line x1="820" y1="300" x2="820" y2="350" stroke="#d97706" strokeWidth="3" />
              <circle cx="820" cy="350" r="5" fill="#d97706" />

              {/* ============================================================== */}
              {/* BUS COUPLER (Between Section 1 and Section 2) */}
              {/* ============================================================== */}
              {(() => {
                const bc = topology.nodes.find(n => n.type === 'BUS_COUPLER');
                if (!bc) return null;
                const isClosed = bc.status === 'CLOSED';
                return (
                  <g className="cursor-pointer" onClick={() => handleNodeClick(bc)}>
                    {/* Connecting lines from bus 1 and bus 2 to coupler */}
                    <line x1="460" y1="350" x2="475" y2="350" stroke="#0284c7" strokeWidth="3" />
                    <line x1="545" y1="350" x2="560" y2="350" stroke="#d97706" strokeWidth="3" />

                    {/* Coupler Breaker Symbol */}
                    <rect 
                      x="475" 
                      y="328" 
                      width="70" 
                      height="44" 
                      rx="5" 
                      fill={selectedNodeId === bc.id ? '#ede9fe' : '#ffffff'} 
                      stroke={isClosed ? '#dc2626' : '#16a34a'} 
                      strokeWidth="2" 
                    />
                    {isClosed ? (
                      <line x1="482" y1="350" x2="538" y2="350" stroke="#dc2626" strokeWidth="3.5" />
                    ) : (
                      <line x1="482" y1="350" x2="530" y2="335" stroke="#16a34a" strokeWidth="3.5" strokeDasharray="3 2" />
                    )}
                    <text x="510" y="320" textAnchor="middle" className="text-[10px] font-bold fill-purple-950">{bc.tag} (COUPLER)</text>
                    <text x="510" y="385" textAnchor="middle" className="text-[9px] font-semibold fill-slate-700">{bc.ratingA}A 4P 65kA</text>
                    <text x="510" y="397" textAnchor="middle" className="text-[8px] fill-purple-700 font-bold">Castell Interlocked</text>

                    {/* Interlocking dashed warning link */}
                    <path d="M 235 175 C 350 175, 475 330, 475 350" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 3" />
                    <path d="M 785 175 C 670 175, 545 330, 545 350" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 3" />
                    <rect x="470" y="240" width="80" height="22" rx="4" fill="#faf5ff" stroke="#c084fc" />
                    <text x="510" y="254" textAnchor="middle" className="text-[8px] font-bold fill-purple-800">2-OUT-OF-3</text>
                    <text x="510" y="263" textAnchor="middle" className="text-[7px] fill-purple-700">ELECTRICAL & KEY</text>
                  </g>
                );
              })()}

              {/* ============================================================== */}
              {/* OUTGOING FEEDERS (Section 1 and Section 2) */}
              {/* ============================================================== */}
              {outgoings.map((fdr, idx) => {
                const isSec1 = fdr.busSectionId === 'bus-sec-1';
                // Calculate X position
                const sec1Feeders = outgoings.filter(f => f.busSectionId === 'bus-sec-1');
                const sec2Feeders = outgoings.filter(f => f.busSectionId !== 'bus-sec-1');

                let posX = 80;
                if (isSec1) {
                  const localIdx = sec1Feeders.indexOf(fdr);
                  posX = 60 + localIdx * (380 / Math.max(1, sec1Feeders.length));
                } else {
                  const localIdx = sec2Feeders.indexOf(fdr);
                  posX = 580 + localIdx * (380 / Math.max(1, sec2Feeders.length));
                }

                const isClosed = fdr.status !== 'OPEN';
                const isSelected = selectedNodeId === fdr.id;

                return (
                  <g key={fdr.id} className="cursor-pointer" onClick={() => handleNodeClick(fdr)}>
                    {/* Dropper connection from Busbar */}
                    <line x1={posX} y1="350" x2={posX} y2="400" stroke={isSec1 ? '#0284c7' : '#d97706'} strokeWidth="2.5" />
                    <circle cx={posX} cy="350" r="3.5" fill={isSec1 ? '#0284c7' : '#d97706'} />

                    {/* MCCB symbol box */}
                    <rect 
                      x={posX - 18} 
                      y="400" 
                      width="36" 
                      height="34" 
                      rx="4" 
                      fill={isSelected ? '#e0f2fe' : '#ffffff'} 
                      stroke={isClosed ? '#dc2626' : '#16a34a'} 
                      strokeWidth="1.5" 
                    />
                    {isClosed ? (
                      <line x1={posX} y1="405" x2={posX} y2="429" stroke="#dc2626" strokeWidth="2.5" />
                    ) : (
                      <line x1={posX} y1="405" x2={posX + 12} y2="425" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="2 2" />
                    )}

                    {/* Circuit Tag & Rating */}
                    <text x={posX} y="394" textAnchor="middle" className="text-[9px] font-bold fill-slate-800">{fdr.tag}</text>
                    <text x={posX} y="445" textAnchor="middle" className="text-[8px] font-bold fill-slate-900">{fdr.ratingA}A</text>
                    <text x={posX} y="455" textAnchor="middle" className="text-[7px] fill-slate-500">4P 50kA</text>

                    {/* Cable down to load terminal */}
                    <line x1={posX} y1="460" x2={posX} y2="500" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

                    {/* Load description box */}
                    <rect x={posX - 22} y="505" width="44" height="24" rx="3" fill="#f8fafc" stroke="#e2e8f0" />
                    <text x={posX} y="517" textAnchor="middle" className="text-[7px] font-medium fill-slate-700">
                      {fdr.powerKW ? `${fdr.powerKW}kW` : 'LOAD'}
                    </text>
                    <text x={posX} y="526" textAnchor="middle" className="text-[6.5px] fill-slate-400">
                      {fdr.loadDescription ? fdr.loadDescription.substring(0, 8) + '..' : 'Feeder'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute bottom-3 left-3 text-[11px] text-slate-500 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200">
            Click on any breaker to toggle <strong>ON / OFF</strong> state, or select to modify electrical ratings.
          </div>
        </div>

        {/* Right Inspector Panel (1 Column) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-cyan-600" />
              <span>Component Inspector</span>
            </span>
            {selectedNodeId && (
              <button
                onClick={() => handleDeleteNode(selectedNodeId)}
                className="text-rose-600 hover:text-rose-800 p-1"
                title="Delete component"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {editingNode ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Circuit / Node Tag</label>
                <input
                  type="text"
                  value={editingNode.tag}
                  onChange={(e) => setEditingNode({ ...editingNode, tag: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-bold focus:border-cyan-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Current Rating (A)</label>
                  <input
                    type="number"
                    value={editingNode.ratingA}
                    onChange={(e) => setEditingNode({ ...editingNode, ratingA: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold focus:border-cyan-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Poles</label>
                  <select
                    value={editingNode.poles}
                    onChange={(e) => setEditingNode({ ...editingNode, poles: Number(e.target.value) as 3 | 4 })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-cyan-600"
                  >
                    <option value={3}>3 Poles (3P)</option>
                    <option value={4}>4 Poles (4P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Breaking Cap (kA)</label>
                  <input
                    type="number"
                    value={editingNode.icuKA || 50}
                    onChange={(e) => setEditingNode({ ...editingNode, icuKA: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-cyan-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Mounting</label>
                  <select
                    value={editingNode.mounting || 'Fixed'}
                    onChange={(e) => setEditingNode({ ...editingNode, mounting: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-cyan-600"
                  >
                    <option value="Drawout">Drawout</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Plug-in">Plug-in</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Manufacturer OEM</label>
                <select
                  value={editingNode.manufacturer || 'ABB'}
                  onChange={(e) => setEditingNode({ ...editingNode, manufacturer: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-cyan-600"
                >
                  <option value="ABB">ABB Electrification</option>
                  <option value="Schneider">Schneider Electric</option>
                  <option value="Siemens">Siemens AG</option>
                  <option value="LS Electric">LS Electric</option>
                  <option value="Eaton">Eaton Power</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Trip Unit Protection</label>
                <input
                  type="text"
                  value={editingNode.protection || 'LSIG'}
                  onChange={(e) => setEditingNode({ ...editingNode, protection: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Load Description / Service</label>
                <input
                  type="text"
                  value={editingNode.loadDescription || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, loadDescription: e.target.value })}
                  placeholder="e.g. Chiller-01, AHU, SMDB"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-cyan-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={handleSaveNodeEdit}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-bold transition shadow-xs"
                >
                  Apply Changes to Topology
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
              <p>Click any breaker, source, or meter in the SLD canvas to inspect its ratings and part specifications.</p>
            </div>
          )}

          {/* Quick Stats Summary */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Total Nodes:</span>
              <span className="font-bold text-slate-900">{topology.nodes.length}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Incomers:</span>
              <span className="font-bold text-cyan-700">{utilityIncomers.length + genIncomers.length} Sources</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Outgoing Feeders:</span>
              <span className="font-bold text-emerald-700">{outgoings.length} Circuits</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Bus Coupler:</span>
              <span className="font-bold text-purple-700">{busCouplers.length > 0 ? 'Active' : 'None'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
