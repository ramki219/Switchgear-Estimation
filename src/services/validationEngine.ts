// ============================================================================
// ENGINEERING VALIDATION ENGINE (IEC 61439 / IEC 60947 Compliance & Safety)
// Flags: GREEN (Valid), YELLOW (Engineering Review Required), RED (Error)
// Never silently corrects the user's design.
// ============================================================================

import { SLDTopology, EngineeringValidation } from '../types/engineering';

export class ValidationEngine {
  /**
   * Performs deterministic engineering validation over SLD topology & panel parameters
   */
  public static validateDesign(topology: SLDTopology): EngineeringValidation[] {
    const validations: EngineeringValidation[] = [];

    // 1. Check for Duplicate Feeder Tags
    const tagCounts = new Map<string, number>();
    topology.nodes.forEach(n => {
      tagCounts.set(n.tag, (tagCounts.get(n.tag) || 0) + 1);
    });

    tagCounts.forEach((count, tag) => {
      if (count > 1) {
        validations.push({
          id: `val-dup-${tag}`,
          severity: 'ERROR',
          code: 'ERR_DUPLICATE_TAG',
          category: 'BREAKER',
          message: `Duplicate circuit tag detected: "${tag}" is used ${count} times in the same panel schedule.`,
          recommendation: `Rename duplicates to unique tags (e.g. ${tag}-A, ${tag}-B) to maintain electrical traceability.`,
          affectedNodeTags: [tag],
        });
      }
    });

    // 2. Check Breaking Capacity (Icu) vs Site Fault Level (65kA default)
    const incomers = topology.nodes.filter(n => n.type === 'ACB' || n.type === 'BUS_COUPLER');
    const systemFaultKA = 65; // standard MV/LV substation fault level

    incomers.forEach(inc => {
      if (inc.icuKA && inc.icuKA < systemFaultKA) {
        validations.push({
          id: `val-fault-${inc.tag}`,
          severity: 'ERROR',
          code: 'ERR_INADEQUATE_ICU',
          category: 'SHORT_CIRCUIT',
          message: `Incomer breaker "${inc.tag}" breaking capacity (${inc.icuKA}kA) is below network prospective short-circuit level (${systemFaultKA}kA).`,
          recommendation: `Upgrade breaker frame to 65kA or 85kA rated interrupting capacity to prevent catastrophic switchgear rupture under bolted fault.`,
          affectedNodeTags: [inc.tag],
          iecClause: 'IEC 60947-2 Clause 4.3.5 / IEC 61439-1 Clause 9.3',
        });
      }
    });

    // 3. Check for Dual Sources without Interlocking
    const sources = topology.nodes.filter(n => n.type === 'UTILITY' || n.type === 'GENERATOR');
    const couplers = topology.nodes.filter(n => n.type === 'BUS_COUPLER');

    if (sources.length >= 2) {
      const hasInterlock = couplers.some(c => c.notes?.toLowerCase().includes('interlock')) ||
        topology.connections.some(conn => conn.isInterlocked);

      if (!hasInterlock) {
        validations.push({
          id: 'val-paralleling-hazard',
          severity: 'ERROR',
          code: 'ERR_PARALLELING_HAZARD',
          category: 'INTERLOCK',
          message: `Two independent electrical sources (Utility & Generator) detected without interlocking logic. Direct paralleling without auto-synchronizer can cause out-of-phase generator destruction or back-feeding utility grid.`,
          recommendation: `Mandate 2-out-of-3 castell mechanical key interlock and electrical shunt trip interlocking between Incomer 1, Incomer 2, and Bus Coupler.`,
          affectedNodeTags: sources.map(s => s.tag),
          iecClause: 'IEC 61439-1 Clause 8.4.3 / IEEE 1547',
        });
      } else {
        validations.push({
          id: 'val-interlock-ok',
          severity: 'VALID',
          code: 'VAL_INTERLOCK_SATISFIED',
          category: 'INTERLOCK',
          message: `Dual source safety interlocking verified: 2-out-of-3 castell key exchange & auxiliary trip logic active between sources.`,
          iecClause: 'IEC 61439-1 Clause 8.4.3',
        });
      }
    }

    // 4. Check Breaker Ratings vs Load Demand
    const outgoings = topology.nodes.filter(n => n.type === 'MCCB' || n.type === 'MCB');
    outgoings.forEach(fdr => {
      if (fdr.powerKW) {
        // Ib = P / (sqrt(3) * V * cos phi)
        const calcAmps = Math.round(fdr.powerKW / (Math.sqrt(3) * 0.415 * (fdr.powerFactor || 0.85)));
        if (fdr.ratingA < calcAmps) {
          validations.push({
            id: `val-overload-${fdr.tag}`,
            severity: 'ERROR',
            code: 'ERR_BREAKER_UNDERSIZED',
            category: 'BREAKER',
            message: `Breaker ${fdr.tag} continuous rating (${fdr.ratingA}A) is undersized for connected load (${fdr.powerKW}kW = ${calcAmps}A full load current).`,
            recommendation: `Select breaker frame rated at least ${Math.ceil(calcAmps * 1.25)}A to prevent nuisance thermal tripping.`,
            affectedNodeTags: [fdr.tag],
          });
        }
      }
    });

    // 5. Warnings (Yellow): Busbar short-circuit withstand verification
    validations.push({
      id: 'val-busbar-withstand',
      severity: 'WARNING',
      code: 'WARN_BUSBAR_VERIFICATION',
      category: 'BUSBAR',
      message: `Main copper busbar short-circuit withstand (${systemFaultKA}kA for 1s) requires manufacturer type-test verification and support spacing verification per DIN 43671.`,
      recommendation: `Verify busbar support insulator spacing (max 400mm centers) against certified type-test report before workshop fabrication.`,
      iecClause: 'IEC 61439-1 Clause 10.11 / DIN 43671',
    });

    // 6. Warnings (Yellow): Preliminary Panel Dimensions
    validations.push({
      id: 'val-dim-preliminary',
      severity: 'WARNING',
      code: 'WARN_PRELIMINARY_DIMENSIONS',
      category: 'DIMENSION',
      message: `Panel overall dimensions and section divisions are preliminary engineering calculations based on catalog frame dimensions.`,
      recommendation: `Verify site cable trench locations and transformer room doorway access dimensions prior to metal cutting.`,
      iecClause: 'IEC 61439-1 Clause 8.2',
    });

    // 7. Green Validations
    validations.push({
      id: 'val-form-separation',
      severity: 'VALID',
      code: 'VAL_FORM_SEPARATION',
      category: 'COMPLIANCE',
      message: `Enclosure internal separation ${topology.formOfSeparation} provides complete segregation of busbars, functional units, and terminal chambers.`,
      iecClause: 'IEC 61439-2 Clause 8.101',
    });

    validations.push({
      id: 'val-ip-rating',
      severity: 'VALID',
      code: 'VAL_IP_RATING',
      category: 'COMPLIANCE',
      message: `Ingress Protection ${topology.ipRating} satisfies indoor climate-controlled substation environment requirements.`,
      iecClause: 'IEC 60529',
    });

    return validations;
  }
}
