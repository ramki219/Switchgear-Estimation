// ============================================================================
// SLD ENGINE (Structured & Natural Language Interpreter + Topology Generator)
// Converts user input into single-source-of-truth electrical topology
// ============================================================================

import { SLDTopology, SLDNode, SLDConnection, BusSectionDefinition } from '../types/engineering';
import { Component } from '../types';
import { BreakerSelectionEngine } from './breakerSelectionEngine';

export interface SLDParseResult {
  success: boolean;
  topology: SLDTopology;
  detectedSummary: {
    sourcesCount: number;
    busCouplerCount: number;
    outgoingsCount: number;
    totalConnectedAmps: number;
    incomerAmps: number;
    faultLevelKA: number;
    earthingSystem: string;
    formOfSeparation: string;
    ipRating: string;
  };
  warnings: string[];
  rawTextParsed: string;
}

export class SLDEngine {
  /**
   * Generates the preloaded official benchmark demo project: UAE-MDB-DEMO-001
   */
  public static createDemoTopology(catalogComponents: Component[] = []): SLDTopology {
    const nodes: SLDNode[] = [
      // 1. Utility Source 1
      {
        id: 'node-src-1',
        tag: 'UTIL-01',
        type: 'UTILITY',
        sourceType: 'UTILITY',
        sourceName: 'DEWA / Utility Grid (11kV / 415V)',
        ratingA: 4000,
        voltageV: 415,
        poles: 4,
        busSectionId: 'bus-sec-1',
        x: 180,
        y: 60,
      },
      // 2. Incomer 1 Breaker (4000A ACB)
      {
        id: 'node-inc-1',
        tag: 'INCOMER-1',
        type: 'ACB',
        ratingA: 4000,
        voltageV: 415,
        poles: 4,
        icuKA: 65,
        icsKA: 65,
        icwKA: 65,
        protection: 'LSIG',
        manufacturer: 'ABB',
        modelSeries: 'Emax 2 E4.2V',
        selectedPartNumber: '1SDA071018R1',
        mounting: 'Drawout',
        busSectionId: 'bus-sec-1',
        status: 'CLOSED',
        isEssential: true,
        x: 180,
        y: 190,
        notes: 'Main Grid Incomer with Ekip Touch LSIG Trip Unit + Under-voltage release',
      },
      // 3. Digital Meter for Incomer 1
      {
        id: 'node-meter-1',
        tag: 'M01',
        type: 'METER',
        ratingA: 4000,
        voltageV: 415,
        poles: 4,
        meterType: 'Digital Power Quality Meter (RS485 Modbus, THD, Harmonics, Class 0.5S)',
        busSectionId: 'bus-sec-1',
        x: 180,
        y: 280,
      },
      // 4. Bus Coupler Breaker (4000A ACB)
      {
        id: 'node-bc-1',
        tag: 'BC-01',
        type: 'BUS_COUPLER',
        ratingA: 4000,
        voltageV: 415,
        poles: 4,
        icuKA: 65,
        icsKA: 65,
        icwKA: 65,
        protection: 'LSIG',
        manufacturer: 'ABB',
        modelSeries: 'Emax 2 E4.2V',
        selectedPartNumber: '1SDA071018R1',
        mounting: 'Drawout',
        busSectionId: 'bus-sec-1',
        status: 'OPEN',
        x: 480,
        y: 350,
        notes: 'Bus Coupler ACB with Castell Key + Electrical Interlock with Incomer 1 & Incomer 2',
      },
      // 5. Generator Source 2
      {
        id: 'node-src-2',
        tag: 'GEN-01',
        type: 'GENERATOR',
        sourceType: 'GENERATOR',
        sourceName: 'Prime Standby Diesel Generator (2500kVA)',
        ratingA: 2500,
        voltageV: 415,
        poles: 4,
        busSectionId: 'bus-sec-2',
        x: 780,
        y: 60,
      },
      // 6. Incomer 2 Breaker (2500A ACB)
      {
        id: 'node-inc-2',
        tag: 'INCOMER-2',
        type: 'ACB',
        ratingA: 2500,
        voltageV: 415,
        poles: 4,
        icuKA: 65,
        icsKA: 65,
        icwKA: 65,
        protection: 'LSIG',
        manufacturer: 'ABB',
        modelSeries: 'Emax 2 E2.2H',
        selectedPartNumber: '1SDA071658R1',
        mounting: 'Drawout',
        busSectionId: 'bus-sec-2',
        status: 'OPEN',
        isEssential: true,
        x: 780,
        y: 190,
        notes: 'Generator Incomer ACB with Ekip Touch LSIG Trip Unit',
      },
      // 7. Digital Meter for Incomer 2
      {
        id: 'node-meter-2',
        tag: 'M02',
        type: 'METER',
        ratingA: 2500,
        voltageV: 415,
        poles: 4,
        meterType: 'Digital Power Quality Meter (RS485 Modbus, Class 0.5S)',
        busSectionId: 'bus-sec-2',
        x: 780,
        y: 280,
      },
    ];

    // Outgoings on Bus Section 1 (Essential / Heavy loads)
    const outgoingsSec1 = [
      { tag: 'FDR-01', rating: 800, type: 'MCCB' as const, desc: 'Chiller Plant Main Feeder 1', power: 450 },
      { tag: 'FDR-02', rating: 630, type: 'MCCB' as const, desc: 'Chiller Plant Main Feeder 2', power: 350 },
      { tag: 'FDR-03', rating: 400, type: 'MCCB' as const, desc: 'SMDB-GF Commercial Zone', power: 220 },
      { tag: 'FDR-04', rating: 400, type: 'MCCB' as const, desc: 'SMDB-01 Office Tower Zone A', power: 220 },
      { tag: 'FDR-05', rating: 250, type: 'MCCB' as const, desc: 'Elevator & Lift Panel MCC', power: 130 },
      { tag: 'FDR-06', rating: 250, type: 'MCCB' as const, desc: 'Fire Pump Controller Transfer Feeder', power: 130 },
      { tag: 'FDR-07', rating: 160, type: 'MCCB' as const, desc: 'AHU Ventilation Sub-Board', power: 85 },
      { tag: 'FDR-08', rating: 100, type: 'MCCB' as const, desc: 'Basement Sump & Drainage Pumps', power: 50 },
    ];

    // Outgoings on Bus Section 2 (Non-essential / General distribution)
    const outgoingsSec2 = [
      { tag: 'FDR-09', rating: 630, type: 'MCCB' as const, desc: 'SMDB-02 Office Tower Zone B', power: 350 },
      { tag: 'FDR-10', rating: 400, type: 'MCCB' as const, desc: 'SMDB-Retail Dining Galleria', power: 220 },
      { tag: 'FDR-11', rating: 315, type: 'MCCB' as const, desc: 'Multi-Storey Car Park Lighting & Power', power: 170 },
      { tag: 'FDR-12', rating: 250, type: 'MCCB' as const, desc: 'Exterior Landscape & Façade Lighting', power: 130 },
      { tag: 'FDR-13', rating: 200, type: 'MCCB' as const, desc: 'Data Centre & BMS Auxiliary Board', power: 105 },
      { tag: 'FDR-14', rating: 160, type: 'MCCB' as const, desc: 'Rooftop Solar Inverter Sync Feeder', power: 85 },
      { tag: 'FDR-15', rating: 125, type: 'MCCB' as const, desc: 'EV Fast Charging Station Sub-Feeder', power: 65 },
    ];

    let x1 = 80;
    outgoingsSec1.forEach((fdr) => {
      nodes.push({
        id: `node-${fdr.tag.toLowerCase()}`,
        tag: fdr.tag,
        type: 'MCCB',
        ratingA: fdr.rating,
        voltageV: 415,
        poles: 4,
        icuKA: 50,
        icsKA: 50,
        protection: 'LSI Electronic',
        manufacturer: 'ABB',
        modelSeries: fdr.rating >= 630 ? 'Tmax XT5' : fdr.rating >= 250 ? 'Tmax XT4' : 'Tmax XT2',
        selectedPartNumber: `1SDA${Math.floor(100000 + Math.random() * 900000)}R1`,
        mounting: 'Fixed',
        busSectionId: 'bus-sec-1',
        loadDescription: fdr.desc,
        powerKW: fdr.power,
        powerFactor: 0.85,
        status: 'CLOSED',
        isEssential: true,
        x: x1,
        y: 470,
      });
      x1 += 90;
    });

    let x2 = 540;
    outgoingsSec2.forEach((fdr) => {
      nodes.push({
        id: `node-${fdr.tag.toLowerCase()}`,
        tag: fdr.tag,
        type: 'MCCB',
        ratingA: fdr.rating,
        voltageV: 415,
        poles: 4,
        icuKA: 50,
        icsKA: 50,
        protection: 'LSI Electronic',
        manufacturer: 'ABB',
        modelSeries: fdr.rating >= 630 ? 'Tmax XT5' : fdr.rating >= 250 ? 'Tmax XT4' : 'Tmax XT2',
        selectedPartNumber: `1SDA${Math.floor(100000 + Math.random() * 900000)}R1`,
        mounting: 'Fixed',
        busSectionId: 'bus-sec-2',
        loadDescription: fdr.desc,
        powerKW: fdr.power,
        powerFactor: 0.85,
        status: 'CLOSED',
        isEssential: false,
        x: x2,
        y: 470,
      });
      x2 += 90;
    });

    // Connections between sources, breakers, bus sections, and couplers
    const connections: SLDConnection[] = [
      { id: 'conn-1', fromNodeId: 'node-src-1', toNodeId: 'node-inc-1' },
      { id: 'conn-2', fromNodeId: 'node-inc-1', toNodeId: 'node-meter-1' },
      { id: 'conn-3', fromNodeId: 'node-src-2', toNodeId: 'node-inc-2' },
      { id: 'conn-4', fromNodeId: 'node-inc-2', toNodeId: 'node-meter-2' },
      { id: 'conn-5', fromNodeId: 'node-meter-1', toNodeId: 'node-bc-1', isInterlocked: true, interlockType: 'BOTH' },
      { id: 'conn-6', fromNodeId: 'node-meter-2', toNodeId: 'node-bc-1', isInterlocked: true, interlockType: 'BOTH' },
    ];

    // Connect outgoings to their respective busbar sections
    outgoingsSec1.forEach(fdr => {
      connections.push({
        id: `conn-${fdr.tag.toLowerCase()}`,
        fromNodeId: 'node-meter-1',
        toNodeId: `node-${fdr.tag.toLowerCase()}`,
        busSectionId: 'bus-sec-1',
      });
    });

    outgoingsSec2.forEach(fdr => {
      connections.push({
        id: `conn-${fdr.tag.toLowerCase()}`,
        fromNodeId: 'node-meter-2',
        toNodeId: `node-${fdr.tag.toLowerCase()}`,
        busSectionId: 'bus-sec-2',
      });
    });

    const busSections: BusSectionDefinition[] = [
      {
        id: 'bus-sec-1',
        name: 'Bus Section 1 (Utility Grid Priority)',
        ratingA: 4000,
        nominalVoltageV: 415,
        shortCircuitKA: 65,
        color: '#0284c7',
      },
      {
        id: 'bus-sec-2',
        name: 'Bus Section 2 (Generator / Auxiliary Grid)',
        ratingA: 2500,
        nominalVoltageV: 415,
        shortCircuitKA: 65,
        color: '#d97706',
      },
    ];

    return {
      panelTag: 'MDB-01',
      panelName: 'Main Distribution Board 01 (UAE-MDB-DEMO-001)',
      systemVoltage: 415,
      frequency: 50,
      phases: 3,
      wires: 4,
      earthingSystem: 'TN-S',
      nodes,
      connections,
      busSections,
      formOfSeparation: 'Form 4B Type 6',
      ipRating: 'IP54',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Parse structured or natural language SLD input into structured topology
   */
  public static parseSLDInput(
    input: string,
    catalogComponents: Component[] = [],
    preferredManufacturer: string = 'ABB'
  ): SLDParseResult {
    const text = input.trim();
    const warnings: string[] = [];

    // Default configuration attributes
    let panelTag = 'MDB-01';
    let systemVoltage = 415;
    let frequency = 50;
    let earthingSystem: 'TN-S' | 'TN-C' | 'TN-C-S' | 'TT' | 'IT' = 'TN-S';
    let formOfSeparation = 'Form 4B Type 6';
    let ipRating = 'IP54';
    let faultLevelKA = 65;

    // Detect Panel name/tag
    const panelMatch = text.match(/(?:PANEL|PANEL TAG|BOARD|NAME)[:=\s]+([A-Za-z0-9-_]+)/i);
    if (panelMatch) panelTag = panelMatch[1].toUpperCase();

    // Detect Form of Separation
    const formMatch = text.match(/Form\s*([1234][a-bA-B]?(?:\s*Type\s*[1-7])?)/i);
    if (formMatch) formOfSeparation = `Form ${formMatch[1]}`;

    // Detect IP rating
    const ipMatch = text.match(/IP\s*([0-9]{2})/i);
    if (ipMatch) ipRating = `IP${ipMatch[1]}`;

    // Detect Voltage & Frequency
    const voltMatch = text.match(/([0-9]{3,4})\s*V(?:olts)?/i);
    if (voltMatch) systemVoltage = parseInt(voltMatch[1], 10);

    const freqMatch = text.match(/([0-9]{2})\s*Hz/i);
    if (freqMatch) frequency = parseInt(freqMatch[1], 10);

    // Detect Earthing system
    if (text.match(/TN-S/i)) earthingSystem = 'TN-S';
    else if (text.match(/TN-C-S/i)) earthingSystem = 'TN-C-S';
    else if (text.match(/TT/i)) earthingSystem = 'TT';

    // Detect Incomers: Look for patterns like "4000A utility", "2500A generator", "4000A ACB", etc.
    const nodes: SLDNode[] = [];
    const connections: SLDConnection[] = [];
    let incomerCount = 0;
    let totalIncomerAmps = 0;

    // Regex for incomers
    // e.g. "two 4000A utility incomers" or "INCOMER-1 Rating: 4000A Breaker: ACB"
    const utilityMatches = Array.from(text.matchAll(/([0-9]+)\s*[xX*]?\s*([0-9]{3,5})\s*A(?:mps)?\s*(?:utility|grid|transformer|mains)/gi));
    const genMatches = Array.from(text.matchAll(/([0-9]+)?\s*([0-9]{3,5})\s*A(?:mps)?\s*(?:generator|genset|gen|standby)/gi));
    const couplerMatches = text.match(/([0-9]{3,5})\s*A(?:mps)?\s*(?:bus\s*coupler|coupler|tie)/i);

    let sec1IncomerAmps = 4000;
    let sec2IncomerAmps = 2500;

    if (utilityMatches.length > 0) {
      utilityMatches.forEach((m, idx) => {
        const count = m[1] ? parseInt(m[1], 10) : 1;
        const amps = parseInt(m[2], 10);
        for (let i = 0; i < count; i++) {
          incomerCount++;
          const incTag = `INCOMER-${incomerCount}`;
          sec1IncomerAmps = amps;
          totalIncomerAmps += amps;

          // Select component from master catalog
          const breakerMatch = BreakerSelectionEngine.selectBreaker(
            { currentA: amps, poles: 4, breakingCapacityKA: faultLevelKA, preferredManufacturer },
            catalogComponents
          );

          nodes.push({
            id: `src-${incomerCount}`,
            tag: `UTIL-0${incomerCount}`,
            type: 'UTILITY',
            sourceType: 'UTILITY',
            sourceName: `Utility Grid Source ${incomerCount}`,
            ratingA: amps,
            voltageV: systemVoltage,
            poles: 4,
            busSectionId: 'bus-sec-1',
            x: 180 * incomerCount,
            y: 60,
          });

          nodes.push({
            id: `inc-${incomerCount}`,
            tag: incTag,
            type: 'ACB',
            ratingA: amps,
            voltageV: systemVoltage,
            poles: 4,
            icuKA: faultLevelKA,
            icsKA: faultLevelKA,
            protection: 'LSIG',
            manufacturer: breakerMatch.manufacturer,
            modelSeries: breakerMatch.productFamily,
            selectedPartNumber: breakerMatch.partNumber,
            mounting: 'Drawout',
            busSectionId: 'bus-sec-1',
            status: 'CLOSED',
            isEssential: true,
            x: 180 * incomerCount,
            y: 190,
          });

          connections.push({
            id: `conn-src-inc-${incomerCount}`,
            fromNodeId: `src-${incomerCount}`,
            toNodeId: `inc-${incomerCount}`,
          });
        }
      });
    } else {
      // Default to 1 utility incomer 4000A if none found
      incomerCount++;
      nodes.push({
        id: 'src-1',
        tag: 'UTIL-01',
        type: 'UTILITY',
        sourceType: 'UTILITY',
        sourceName: 'Utility Grid Source 1',
        ratingA: 4000,
        voltageV: systemVoltage,
        poles: 4,
        busSectionId: 'bus-sec-1',
        x: 180,
        y: 60,
      });

      nodes.push({
        id: 'inc-1',
        tag: 'INCOMER-1',
        type: 'ACB',
        ratingA: 4000,
        voltageV: systemVoltage,
        poles: 4,
        icuKA: 65,
        protection: 'LSIG',
        manufacturer: preferredManufacturer,
        modelSeries: 'Emax 2 / MTZ',
        selectedPartNumber: '1SDA071018R1',
        mounting: 'Drawout',
        busSectionId: 'bus-sec-1',
        status: 'CLOSED',
        isEssential: true,
        x: 180,
        y: 190,
      });

      connections.push({ id: 'conn-src-inc-1', fromNodeId: 'src-1', toNodeId: 'inc-1' });
      totalIncomerAmps += 4000;
    }

    // Add Generator Incomer if mentioned
    let hasGenerator = false;
    if (genMatches.length > 0) {
      hasGenerator = true;
      incomerCount++;
      const genAmps = parseInt(genMatches[0][2], 10);
      sec2IncomerAmps = genAmps;
      totalIncomerAmps += genAmps;

      const breakerMatch = BreakerSelectionEngine.selectBreaker(
        { currentA: genAmps, poles: 4, breakingCapacityKA: faultLevelKA, preferredManufacturer },
        catalogComponents
      );

      nodes.push({
        id: `src-gen`,
        tag: 'GEN-01',
        type: 'GENERATOR',
        sourceType: 'GENERATOR',
        sourceName: 'Standby Generator Source',
        ratingA: genAmps,
        voltageV: systemVoltage,
        poles: 4,
        busSectionId: 'bus-sec-2',
        x: 750,
        y: 60,
      });

      nodes.push({
        id: `inc-gen`,
        tag: `INCOMER-${incomerCount} (GEN)`,
        type: 'ACB',
        ratingA: genAmps,
        voltageV: systemVoltage,
        poles: 4,
        icuKA: faultLevelKA,
        protection: 'LSIG',
        manufacturer: breakerMatch.manufacturer,
        modelSeries: breakerMatch.productFamily,
        selectedPartNumber: breakerMatch.partNumber,
        mounting: 'Drawout',
        busSectionId: 'bus-sec-2',
        status: 'OPEN',
        isEssential: true,
        x: 750,
        y: 190,
      });

      connections.push({ id: 'conn-src-gen', fromNodeId: 'src-gen', toNodeId: 'inc-gen' });
    }

    // Check for Bus Coupler
    let hasCoupler = false;
    if (couplerMatches || (incomerCount >= 2)) {
      hasCoupler = true;
      const couplerAmps = couplerMatches ? parseInt(couplerMatches[1], 10) : Math.max(sec1IncomerAmps, sec2IncomerAmps);
      nodes.push({
        id: 'bc-1',
        tag: 'BC-01',
        type: 'BUS_COUPLER',
        ratingA: couplerAmps,
        voltageV: systemVoltage,
        poles: 4,
        icuKA: faultLevelKA,
        protection: 'LSIG',
        manufacturer: preferredManufacturer,
        modelSeries: 'Drawout ACB Coupler',
        selectedPartNumber: '1SDA071018R1',
        mounting: 'Drawout',
        busSectionId: 'bus-sec-1',
        status: 'OPEN',
        x: 480,
        y: 350,
        notes: 'Castell Key mechanical interlock + 2-out-of-3 electrical shunt trip interlock',
      });
    }

    // Parse Outgoing Feeders (explicit lines or natural language count)
    // Example: "15 outgoing feeders" or explicit list "FDR-01 MCCB 630A"
    const outgoingsCountMatch = text.match(/([0-9]{1,2})\s*outgoing(?:\s*feeders)?/i);
    let totalOutgoings = outgoingsCountMatch ? parseInt(outgoingsCountMatch[1], 10) : 12;

    // Standard feeder distribution ratings
    const standardRatings = [800, 630, 400, 400, 250, 250, 160, 160, 125, 100, 63, 63, 40, 32, 25];
    let totalConnectedKW = 0;

    let outX1 = 80;
    let outX2 = 540;

    for (let i = 1; i <= totalOutgoings; i++) {
      const rating = standardRatings[(i - 1) % standardRatings.length];
      const isSec1 = i <= Math.ceil(totalOutgoings / 2);
      const tag = `FDR-${String(i).padStart(2, '0')}`;
      const kw = Math.round(rating * 0.55);
      totalConnectedKW += kw;

      const breakerMatch = BreakerSelectionEngine.selectBreaker(
        { currentA: rating, poles: 4, breakingCapacityKA: 50, preferredManufacturer },
        catalogComponents
      );

      nodes.push({
        id: `fdr-${i}`,
        tag,
        type: rating >= 800 ? 'ACB' : rating >= 100 ? 'MCCB' : 'MCB',
        ratingA: rating,
        voltageV: systemVoltage,
        poles: 4,
        icuKA: 50,
        protection: rating >= 250 ? 'LSI Electronic' : 'Thermal-Magnetic',
        manufacturer: breakerMatch.manufacturer,
        modelSeries: breakerMatch.productFamily,
        selectedPartNumber: breakerMatch.partNumber,
        mounting: rating >= 800 ? 'Drawout' : 'Fixed',
        busSectionId: isSec1 ? 'bus-sec-1' : 'bus-sec-2',
        loadDescription: `Circuit Feeder ${i} Distribution Load (${rating}A)`,
        powerKW: kw,
        powerFactor: 0.85,
        status: 'CLOSED',
        isEssential: isSec1,
        x: isSec1 ? outX1 : outX2,
        y: 470,
      });

      connections.push({
        id: `conn-fdr-${i}`,
        fromNodeId: isSec1 ? 'inc-1' : (hasGenerator ? 'inc-gen' : 'inc-1'),
        toNodeId: `fdr-${i}`,
        busSectionId: isSec1 ? 'bus-sec-1' : 'bus-sec-2',
      });

      if (isSec1) outX1 += 90;
      else outX2 += 90;
    }

    const busSections: BusSectionDefinition[] = [
      {
        id: 'bus-sec-1',
        name: 'Bus Section 1 (Essential Loads)',
        ratingA: sec1IncomerAmps,
        nominalVoltageV: systemVoltage,
        shortCircuitKA: faultLevelKA,
        color: '#0284c7',
      },
    ];

    if (hasGenerator || incomerCount >= 2) {
      busSections.push({
        id: 'bus-sec-2',
        name: 'Bus Section 2 (Non-Essential / Auxiliary)',
        ratingA: sec2IncomerAmps,
        nominalVoltageV: systemVoltage,
        shortCircuitKA: faultLevelKA,
        color: '#d97706',
      });
    }

    const topology: SLDTopology = {
      panelTag,
      panelName: `${panelTag} Low Voltage Switchboard`,
      systemVoltage,
      frequency,
      phases: 3,
      wires: 4,
      earthingSystem,
      nodes,
      connections,
      busSections,
      formOfSeparation,
      ipRating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      topology,
      detectedSummary: {
        sourcesCount: incomerCount,
        busCouplerCount: hasCoupler ? 1 : 0,
        outgoingsCount: totalOutgoings,
        totalConnectedAmps: totalConnectedKW * 1.7,
        incomerAmps: totalIncomerAmps,
        faultLevelKA,
        earthingSystem,
        formOfSeparation,
        ipRating,
      },
      warnings,
      rawTextParsed: input,
    };
  }
}
