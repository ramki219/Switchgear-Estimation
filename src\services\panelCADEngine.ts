// ============================================================================
// PANEL CAD & DIMENSION ENGINE
// Generates 2D Panel GA Drawing, Section Layout & Front Facia Layout
// ============================================================================

import {
  SLDTopology,
  PanelGAData,
  PanelColumnLayout,
  FaciaLayoutData,
  FaciaComponent,
  CompartmentDefinition,
} from '../types/engineering';

export class PanelCADEngine {
  /**
   * Generates General Arrangement (GA) layout and column dimensions based on electrical topology
   */
  public static generatePanelGA(topology: SLDTopology): PanelGAData {
    const columns: PanelColumnLayout[] = [];
    let colIndex = 1;

    // Standard switchgear dimensions
    const standardHeight = 2200; // mm (including top busbar chamber)
    const standardDepth = 1000; // mm for Form 4b back-to-back/front-accessible
    const plinthHeight = 100; // mm

    // 1. Identify incomers
    const incomers = topology.nodes.filter(n => n.type === 'ACB' && (n.tag.includes('INC') || n.tag.includes('UTIL') || n.tag.includes('GEN')));
    const couplers = topology.nodes.filter(n => n.type === 'BUS_COUPLER');
    const outgoings = topology.nodes.filter(n => n.type === 'MCCB' || n.type === 'MCB');

    // Section 1: Incomer 1
    if (incomers.length > 0) {
      const inc1 = incomers[0];
      const inc1Width = inc1.ratingA >= 3200 ? 1000 : 800;

      columns.push({
        columnNumber: colIndex++,
        designation: `Section 01: Incomer 1 (${inc1.tag}) - ${inc1.ratingA}A ACB`,
        widthMm: inc1Width,
        heightMm: standardHeight,
        depthMm: standardDepth,
        compartments: [
          {
            id: 'c-inc1-meter',
            name: 'Metering & Protection Chamber',
            type: 'METERING',
            heightMm: 450,
            componentTags: ['M01', 'UVR-01', 'CT-01', 'SPD-01'],
            equipmentDescription: 'Class 0.5S Digital Power Meter + Phase Indicating Lamps + Under-voltage relay',
          },
          {
            id: 'c-inc1-breaker',
            name: `Main Breaker Chamber (${inc1.ratingA}A 4P Drawout ACB)`,
            type: 'BREAKER',
            heightMm: 950,
            componentTags: [inc1.tag],
            equipmentDescription: `${inc1.manufacturer || 'ABB'} ${inc1.modelSeries || 'Emax 2'} ${inc1.ratingA}A 4P Drawout ACB with Ekip Touch LSIG`,
          },
          {
            id: 'c-inc1-cable',
            name: 'Cable / Busduct Termination Chamber',
            type: 'CABLE',
            heightMm: 700,
            componentTags: ['TERM-INC1'],
            equipmentDescription: 'Top/Bottom Cable Chamber with copper spreader links & CT mounting',
          },
        ],
      });
    }

    // Section 2: Bus Coupler (if present)
    if (couplers.length > 0) {
      const coupler = couplers[0];
      const couplerWidth = coupler.ratingA >= 3200 ? 1000 : 800;

      columns.push({
        columnNumber: colIndex++,
        designation: `Section 02: Bus Coupler (${coupler.tag}) - ${coupler.ratingA}A ACB`,
        widthMm: couplerWidth,
        heightMm: standardHeight,
        depthMm: standardDepth,
        compartments: [
          {
            id: 'c-bc-ctrl',
            name: 'Interlocking & Control Chamber',
            type: 'CONTROL',
            heightMm: 450,
            componentTags: ['IL-KEY-01', 'BC-UVR', 'SYNC-RELAY'],
            equipmentDescription: 'Castell Key Interlock Unit + 2-out-of-3 Auto Interlock Logic Relay',
          },
          {
            id: 'c-bc-breaker',
            name: `Bus Coupler Breaker (${coupler.ratingA}A 4P Drawout ACB)`,
            type: 'BREAKER',
            heightMm: 950,
            componentTags: [coupler.tag],
            equipmentDescription: `${coupler.manufacturer || 'ABB'} ${coupler.ratingA}A Drawout Bus Coupler`,
          },
          {
            id: 'c-bc-transition',
            name: 'Horizontal Busbar Inter-tie Transition',
            type: 'BUSBAR',
            heightMm: 700,
            componentTags: ['BUS-TIE-CU'],
            equipmentDescription: 'Bus Section 1 to Bus Section 2 Copper Cross-tie droppers',
          },
        ],
      });
    }

    // Section 3: Incomer 2 / Generator Incomer (if present)
    if (incomers.length > 1) {
      const inc2 = incomers[1];
      const inc2Width = inc2.ratingA >= 3200 ? 1000 : 800;

      columns.push({
        columnNumber: colIndex++,
        designation: `Section 03: Incomer 2 / Generator (${inc2.tag}) - ${inc2.ratingA}A ACB`,
        widthMm: inc2Width,
        heightMm: standardHeight,
        depthMm: standardDepth,
        compartments: [
          {
            id: 'c-inc2-meter',
            name: 'Metering & ATS Control Chamber',
            type: 'METERING',
            heightMm: 450,
            componentTags: ['M02', 'GEN-START', 'ATS-ANNUNCIATOR'],
            equipmentDescription: 'Generator Power Quality Meter + Auto Transfer Annunciator Panel',
          },
          {
            id: 'c-inc2-breaker',
            name: `Generator Incomer Breaker (${inc2.ratingA}A ACB)`,
            type: 'BREAKER',
            heightMm: 950,
            componentTags: [inc2.tag],
            equipmentDescription: `${inc2.manufacturer || 'ABB'} ${inc2.ratingA}A 4P Drawout ACB with LSIG`,
          },
          {
            id: 'c-inc2-cable',
            name: 'Generator Cable Termination Chamber',
            type: 'CABLE',
            heightMm: 700,
            componentTags: ['TERM-GEN'],
            equipmentDescription: 'Bottom Entry Cable Chamber for Generator Multi-core XLPE cables',
          },
        ],
      });
    }

    // Sections for Outgoing Feeders: Group into columns (approx 4-6 large MCCBs or 8-10 smaller MCCBs per column)
    const outgoingColWidth = 800; // standard 800mm outgoing column
    const feedersPerColumn = 6;
    const totalOutCols = Math.max(1, Math.ceil(outgoings.length / feedersPerColumn));

    for (let c = 0; c < totalOutCols; c++) {
      const startIdx = c * feedersPerColumn;
      const colFeeders = outgoings.slice(startIdx, startIdx + feedersPerColumn);
      const colCompartments: CompartmentDefinition[] = [];

      // Top Cable Chamber
      colCompartments.push({
        id: `c-out${c + 1}-top-cable`,
        name: 'Top Cable Spreader & Terminal Chamber',
        type: 'CABLE',
        heightMm: 350,
        componentTags: colFeeders.map(f => `TERM-${f.tag}`),
        equipmentDescription: 'Control Terminal Blocks TB01/02 + Outgoing Cable Terminations',
      });

      // Individual feeder modular compartments (Form 4B physical segregation)
      const feederCompHeight = Math.floor(1400 / Math.max(1, colFeeders.length));
      colFeeders.forEach((fdr, fIdx) => {
        colCompartments.push({
          id: `c-out${c + 1}-fdr-${fIdx + 1}`,
          name: `Feeder Unit: ${fdr.tag} (${fdr.ratingA}A 4P)`,
          type: 'BREAKER',
          heightMm: feederCompHeight,
          componentTags: [fdr.tag],
          equipmentDescription: `${fdr.tag}: ${fdr.ratingA}A 4P MCCB (${fdr.loadDescription || 'Distribution Load'})`,
        });
      });

      // Bottom Cable Chamber
      colCompartments.push({
        id: `c-out${c + 1}-bot-cable`,
        name: 'Bottom Cable Chamber & Gland Plate',
        type: 'CABLE',
        heightMm: 350,
        componentTags: ['GLAND-PLATE-BOT'],
        equipmentDescription: 'Removable Brass Gland Plate with Earthing Bar link',
      });

      columns.push({
        columnNumber: colIndex++,
        designation: `Section ${String(columns.length + 1).padStart(2, '0')}: Outgoing Feeders ${startIdx + 1}–${Math.min(startIdx + feedersPerColumn, outgoings.length)}`,
        widthMm: outgoingColWidth,
        heightMm: standardHeight,
        depthMm: standardDepth,
        compartments: colCompartments,
      });
    }

    const totalWidth = columns.reduce((sum, col) => sum + col.widthMm, 0);

    return {
      panelTag: topology.panelTag,
      totalWidthMm: totalWidth,
      totalHeightMm: standardHeight + plinthHeight,
      totalDepthMm: standardDepth,
      plinthHeightMm: plinthHeight,
      formOfSeparation: topology.formOfSeparation,
      ipRating: topology.ipRating,
      cableEntry: 'BOTTOM',
      columns,
      hasLiftingLugs: true,
      hasPlinth: true,
      hasVentilationLouvers: true,
      sheetMetalThicknessMm: 2.0,
      colorRAL: 'RAL 7035 Light Grey',
      warningLabels: [
        'DANGER: 415V 3-PHASE 4-WIRE 50Hz',
        'DUAL SOURCE INTERLOCKED - DO NOT OPEN UNDER LOAD',
        'IEC 61439-2 CERTIFIED LOW VOLTAGE SWITCHBOARD',
      ],
    };
  }

  /**
   * Generates Front Facia / Door Layout with breakers, digital meters, indicator lights, switches
   */
  public static generateFaciaLayout(topology: SLDTopology, gaData: PanelGAData): FaciaLayoutData {
    const components: FaciaComponent[] = [];

    gaData.columns.forEach((col) => {
      col.compartments.forEach((comp) => {
        if (comp.type === 'METERING') {
          // Digital Meter at center
          components.push({
            id: `facia-meter-${comp.id}`,
            tag: comp.componentTags.find(t => t.startsWith('M')) || 'M01',
            columnNumber: col.columnNumber,
            compartmentId: comp.id,
            type: 'DIGITAL_METER',
            label: 'Multifunction Energy Meter (LCD)',
            color: '#0f172a',
            xPercent: 50,
            yPercent: 45,
          });

          // Phase Indicating Lamps (R, Y, B)
          components.push({
            id: `facia-lamp-r-${comp.id}`,
            tag: 'LR',
            columnNumber: col.columnNumber,
            compartmentId: comp.id,
            type: 'LAMP_PHASE_R',
            label: 'Phase L1 (Red)',
            color: '#ef4444',
            xPercent: 20,
            yPercent: 25,
          });
          components.push({
            id: `facia-lamp-y-${comp.id}`,
            tag: 'LY',
            columnNumber: col.columnNumber,
            compartmentId: comp.id,
            type: 'LAMP_PHASE_Y',
            label: 'Phase L2 (Yellow)',
            color: '#eab308',
            xPercent: 50,
            yPercent: 25,
          });
          components.push({
            id: `facia-lamp-b-${comp.id}`,
            tag: 'LB',
            columnNumber: col.columnNumber,
            compartmentId: comp.id,
            type: 'LAMP_PHASE_B',
            label: 'Phase L3 (Blue)',
            color: '#3b82f6',
            xPercent: 80,
            yPercent: 25,
          });

          // Ammeter/Voltmeter Selector Switch
          components.push({
            id: `facia-sel-${comp.id}`,
            tag: 'SS-01',
            columnNumber: col.columnNumber,
            compartmentId: comp.id,
            type: 'SELECTOR_AMMET',
            label: 'Ammeter / Voltmeter Selector Switch',
            color: '#1e293b',
            xPercent: 50,
            yPercent: 80,
          });
        }

        if (comp.type === 'BREAKER') {
          const breakerTag = comp.componentTags[0] || 'BREAKER';
          const node = topology.nodes.find(n => n.tag === breakerTag);
          const isACB = node?.type === 'ACB' || node?.type === 'BUS_COUPLER';

          if (isACB) {
            // Large Drawout ACB Escutcheon & Operating Handle
            components.push({
              id: `facia-acb-${comp.id}`,
              tag: breakerTag,
              columnNumber: col.columnNumber,
              compartmentId: comp.id,
              type: 'ACB_HANDLE',
              label: `${breakerTag} (${node?.ratingA}A Drawout Mechanism)`,
              color: '#334155',
              state: node?.status || 'CLOSED',
              xPercent: 50,
              yPercent: 50,
            });

            // Status indication lamps (ON, OFF, TRIP)
            components.push({
              id: `facia-lamp-on-${comp.id}`,
              tag: `LAMP-ON-${breakerTag}`,
              columnNumber: col.columnNumber,
              compartmentId: comp.id,
              type: 'LAMP_ON',
              label: 'BREAKER CLOSED (RED)',
              color: '#dc2626',
              xPercent: 25,
              yPercent: 18,
            });
            components.push({
              id: `facia-lamp-off-${comp.id}`,
              tag: `LAMP-OFF-${breakerTag}`,
              columnNumber: col.columnNumber,
              compartmentId: comp.id,
              type: 'LAMP_OFF',
              label: 'BREAKER OPEN (GREEN)',
              color: '#16a34a',
              xPercent: 50,
              yPercent: 18,
            });
            components.push({
              id: `facia-lamp-trip-${comp.id}`,
              tag: `LAMP-TRIP-${breakerTag}`,
              columnNumber: col.columnNumber,
              compartmentId: comp.id,
              type: 'LAMP_TRIP',
              label: 'TRIP ON FAULT (AMBER)',
              color: '#f59e0b',
              xPercent: 75,
              yPercent: 18,
            });

            // Engraved Acrylate Nameplate
            components.push({
              id: `facia-plate-${comp.id}`,
              tag: `PLATE-${breakerTag}`,
              columnNumber: col.columnNumber,
              compartmentId: comp.id,
              type: 'NAMEPLATE',
              label: `${breakerTag} • ${node?.ratingA}A 4P • 65kA`,
              color: '#ffffff',
              xPercent: 50,
              yPercent: 88,
            });
          } else {
            // Outgoing MCCB Rotary Handle / Toggle Flange
            components.push({
              id: `facia-mccb-${comp.id}`,
              tag: breakerTag,
              columnNumber: col.columnNumber,
              compartmentId: comp.id,
              type: 'MCCB_HANDLE',
              label: `${breakerTag} (${node?.ratingA}A MCCB)`,
              color: '#475569',
              state: node?.status || 'CLOSED',
              xPercent: 40,
              yPercent: 50,
            });

            components.push({
              id: `facia-plate-${comp.id}`,
              tag: `PLATE-${breakerTag}`,
              columnNumber: col.columnNumber,
              compartmentId: comp.id,
              type: 'NAMEPLATE',
              label: `${breakerTag} • ${node?.ratingA}A`,
              color: '#ffffff',
              xPercent: 75,
              yPercent: 50,
            });
          }
        }

        if (comp.type === 'CONTROL') {
          // Emergency Stop Mushroom & Auto/Manual Selector
          components.push({
            id: `facia-estop-${comp.id}`,
            tag: 'E-STOP',
            columnNumber: col.columnNumber,
            compartmentId: comp.id,
            type: 'EMERGENCY_STOP',
            label: 'EMERGENCY TRIP PUSHBUTTON',
            color: '#dc2626',
            xPercent: 30,
            yPercent: 50,
          });

          components.push({
            id: `facia-automan-${comp.id}`,
            tag: 'SS-AUTO-MAN',
            columnNumber: col.columnNumber,
            compartmentId: comp.id,
            type: 'SELECTOR_AUTO_MAN',
            label: 'AUTO / MANUAL / TEST SELECTOR',
            color: '#0f172a',
            xPercent: 70,
            yPercent: 50,
          });
        }
      });
    });

    return {
      panelTag: topology.panelTag,
      totalWidthMm: gaData.totalWidthMm,
      totalHeightMm: gaData.totalHeightMm,
      columnsCount: gaData.columns.length,
      components,
    };
  }
}
