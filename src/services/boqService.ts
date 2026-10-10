// ============================================================================
// BOQ SERVICE (Customer-Facing BOQ vs Internal Manufacturing BOM)
// Separates customer commercial presentation from internal factory workshop BOM
// ============================================================================

import { SLDTopology, CustomerBOQItem } from '../types/engineering';

export class BOQService {
  /**
   * Generates clean, customer-facing tender BOQ hiding internal factory scrap & raw item codes
   */
  public static generateCustomerBOQ(topology: SLDTopology): CustomerBOQItem[] {
    const items: CustomerBOQItem[] = [];
    let itemIdx = 1;

    // 1. Incomers
    const incomers = topology.nodes.filter(n => n.type === 'ACB' && !n.tag.includes('BC'));
    incomers.forEach(inc => {
      const isGen = inc.sourceType === 'GENERATOR' || inc.tag.includes('GEN');
      items.push({
        itemNumber: `${itemIdx++}.0`,
        description: isGen
          ? `Emergency Generator Incomer Functional Unit: Fully withdrawable 4-pole Air Circuit Breaker (ACB) complete with drawout cradle, microprocessor-based trip unit (LSIG), Under-voltage release (UVR), closing solenoid, spring charging motor, auxiliary limit switches, and remote generator auto-start signaling contacts.`
          : `Main Utility Grid Incomer Functional Unit: Fully withdrawable 4-pole Air Circuit Breaker (ACB) complete with drawout cradle, microprocessor-based trip unit (LSIG) with illuminated LCD display, Under-voltage release (UVR), shunt trip coil, spring charging motor, and auxiliary signalling contacts.`,
        make: inc.manufacturer || 'ABB',
        model: inc.modelSeries || 'Emax 2 Series',
        ratingSpecification: `${inc.ratingA}A, 415V, 4-Pole, Icu = Ics = Icw = ${inc.icuKA || 65}kA (1.0s), Trip Unit: ${inc.protection || 'LSIG'}`,
        quantity: 1,
        unit: 'SET',
        complianceStandard: 'IEC 60947-2 / IEC 61439-2',
        unitRateAED: inc.ratingA >= 4000 ? 52000 : 38000,
        totalRateAED: inc.ratingA >= 4000 ? 52000 : 38000,
        remarks: 'Drawout Execution with Racking Interlock',
      });

      // Digital Metering & Instruments package
      items.push({
        itemNumber: `${itemIdx - 1}.${1}`,
        description: `Digital Power Quality & Energy Metering Instrumentation Package: Class 0.5S accuracy multifunction digital power meter with RS485 Modbus RTU communication port, THD harmonic analysis up to 31st order, complete with 3 nos. current transformers (5A secondary, Class 0.5, 15VA) and 3 nos. LED phase indicating lamps with fused disconnects.`,
        make: inc.manufacturer || 'ABB',
        model: 'M4M 20 / PM5350 Series',
        ratingSpecification: `CT Ratio: ${inc.ratingA}/5A Class 0.5, 15VA • Meter: 415V L-L / 240V L-N Class 0.5S`,
        quantity: 1,
        unit: 'LOT',
        complianceStandard: 'IEC 61557-12 / IEC 62053-22',
        unitRateAED: 4800,
        totalRateAED: 4800,
        remarks: 'Factory calibrated & wired to sliding test blocks',
      });
    });

    // 2. Bus Coupler (if present)
    const couplers = topology.nodes.filter(n => n.type === 'BUS_COUPLER');
    couplers.forEach(coupler => {
      items.push({
        itemNumber: `${itemIdx++}.0`,
        description: `Bus Section Tie / Coupler Functional Unit: Fully withdrawable 4-pole Air Circuit Breaker (ACB) complete with drawout cradle, electronic trip unit (LSIG), castell mechanical key interlocking, and electrical 2-out-of-3 trip interlock scheme coordinating Incomer 1, Incomer 2, and Bus Coupler.`,
        make: coupler.manufacturer || 'ABB',
        model: coupler.modelSeries || 'Emax 2 Series',
        ratingSpecification: `${coupler.ratingA}A, 415V, 4-Pole, Icu = Ics = Icw = ${coupler.icuKA || 65}kA (1.0s), Drawout`,
        quantity: 1,
        unit: 'SET',
        complianceStandard: 'IEC 60947-2 / IEC 61439-2',
        unitRateAED: 46000,
        totalRateAED: 46000,
        remarks: 'Castell Key Trapped Mechanical Interlock Included',
      });
    });

    // 3. Outgoing Feeders (Grouped by ratings for clean commercial presentation)
    const outgoings = topology.nodes.filter(n => n.type === 'MCCB' || n.type === 'MCB');
    const grouped = new Map<number, { count: number; mfg: string; model: string; tags: string[] }>();

    outgoings.forEach(fdr => {
      const existing = grouped.get(fdr.ratingA) || {
        count: 0,
        mfg: fdr.manufacturer || 'ABB',
        model: fdr.modelSeries || 'Tmax XT Series',
        tags: [],
      };
      existing.count++;
      existing.tags.push(fdr.tag);
      grouped.set(fdr.ratingA, existing);
    });

    grouped.forEach((data, rating) => {
      const unitRate = rating >= 800 ? 12500 : rating >= 630 ? 6800 : rating >= 400 ? 4200 : rating >= 250 ? 2400 : 1600;
      items.push({
        itemNumber: `${itemIdx++}.0`,
        description: `Outgoing Circuit Feeder Functional Unit (${rating}A): 4-Pole Moulded Case Circuit Breaker (MCCB) complete with electronic/thermal-magnetic trip unit, extended rotary front operating handle with door interlock and padlock facility, Form 4B internal separation compartment, and outgoing cable terminal extension spreaders. Feeders: ${data.tags.join(', ')}.`,
        make: data.mfg,
        model: data.model,
        ratingSpecification: `${rating}A, 415V, 4-Pole, Icu = 50kA, Fixed Front Connection`,
        quantity: data.count,
        unit: 'NOS',
        complianceStandard: 'IEC 60947-2 / IEC 61439-2',
        unitRateAED: unitRate,
        totalRateAED: unitRate * data.count,
        remarks: `Form 4B Type 6 Segregated Functional Compartments`,
      });
    });

    // 4. Main Copper Busbar System
    items.push({
      itemNumber: `${itemIdx++}.0`,
      description: `Main Horizontal & Vertical Dropper Busbar System: High-conductivity Electrolytic Tough Pitch (ETP 99.9%) copper busbars, fully tin-plated throughout, sized for maximum continuous current with 100% neutral and full-size protective earth (PE) bar. Supported on halogen-free glass-reinforced polyester (SMC) insulators verified for 65kA 1-second short-circuit electrodynamic withstand forces.`,
      make: 'Specialized Switchgear Fabricators',
      model: 'ETP 99.9% Cu DIN 43671',
      ratingSpecification: `Continuous Rating: 4000A • Fault Level: 65kA (1.0s) • Tin-plated finish`,
      quantity: 1,
      unit: 'LOT',
      complianceStandard: 'IEC 61439-1 Clause 8.4 / DIN 43671',
      unitRateAED: 44000,
      totalRateAED: 44000,
      remarks: 'Color coded phase heat-shrink sleeving (Red, Yellow, Blue, Black, Green/Yellow)',
    });

    // 5. Enclosure & Switchboard Assembly
    items.push({
      itemNumber: `${itemIdx++}.0`,
      description: `Factory-Built Low Voltage Switchboard Enclosure: Self-supporting modular sheet steel cubicle assembly constructed from 2.0mm electro-galvanized sheet steel frame and doors. Degreased, zinc-phosphated, and electrostatically powder coated in RAL 7035 textured light grey (80-100 microns). Verified to Form 4B Type 6 internal separation with independent cable chambers, ventilation louvers with washable filters, neoprene door gaskets, and 100mm black channel base plinth.`,
      make: 'Approved Switchgear Enclosures',
      model: 'Form 4B Modular Type 6',
      ratingSpecification: `Form of Separation: Form 4B Type 6 • Ingress Protection: IP54 • Paint: RAL 7035 • Sheet: 2.0mm`,
      quantity: 1,
      unit: 'LOT',
      complianceStandard: 'IEC 61439-1 & IEC 61439-2 / IEC 60529',
      unitRateAED: 36000,
      totalRateAED: 36000,
      remarks: 'Includes full-width removable brass gland plates and lifting lugs',
    });

    return items;
  }
}
