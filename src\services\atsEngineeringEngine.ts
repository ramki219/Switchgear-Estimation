// ============================================================================
// ATS ENGINEERING MODULE (Automatic Transfer Switch & Interlocking Philosophy)
// Distinguishes BUS COUPLER from ATS / AUTOMATIC TRANSFER SYSTEM
// Generates control philosophy, interlocking logic & monitoring sequence
// ============================================================================

import { SLDTopology, ATSConfiguration } from '../types/engineering';

export class ATSEngineeringEngine {
  /**
   * Generates or derives ATS Configuration & Control Philosophy from SLD topology
   */
  public static generateATSConfiguration(topology: SLDTopology): ATSConfiguration {
    const utilityNode = topology.nodes.find(n => n.sourceType === 'UTILITY' || n.tag.includes('UTIL') || n.tag.includes('INC-1'));
    const genNode = topology.nodes.find(n => n.sourceType === 'GENERATOR' || n.tag.includes('GEN'));
    const couplerNode = topology.nodes.find(n => n.type === 'BUS_COUPLER');

    const normId = utilityNode ? utilityNode.id : (topology.nodes[1]?.id || 'node-inc-1');
    const emergId = genNode ? genNode.id : (topology.nodes[5]?.id || 'node-inc-2');

    const controlPhilosophy = `
1. SYSTEM OVERVIEW & CONTROL ARCHITECTURE
   • Primary Source: Normal Utility Mains (${utilityNode ? utilityNode.ratingA : 4000}A, 415V, 3PH+N, 50Hz)
   • Emergency Source: Standby Diesel Generator (${genNode ? genNode.ratingA : 2500}A, 415V, 3PH+N, 50Hz)
   • Interlocking Philosophy: 2-out-of-3 castell mechanical key exchange + fail-safe electrical auxiliary contact interlock.
   • Operating Modes: AUTO / MANUAL / TEST / BYPASS via front facia key selector switch.

2. NORMAL CONDITION (UTILITY HEALTHY)
   • Utility Incomer ACB (INCOMER-1): CLOSED
   • Generator Incomer ACB (INCOMER-2): OPEN (Engine in standby sleep mode)
   • Bus Coupler ACB (BC-01): OPEN (or closed if single-utility split load)
   • All essential and non-essential loads are energized via Utility Grid Source.
   • Phase Failure / Under-voltage Relay (UVR) continuously monitors 3-phase voltages (380V - 440V window).

3. UTILITY FAILURE SEQUENCE (AUTO MODE)
   • Stage 1 (Failure Confirmation): Upon Utility voltage dropping below 85% Un or phase loss for > 2.0 seconds (T1 adjustable), the Under-Voltage Relay triggers a mains failure condition.
   • Stage 2 (Generator Start Command): ATS controller closes potential-free dry contact to send Remote Start signal to Generator Engine Control Panel (ECP).
   • Stage 3 (Source Validation): Standby Generator starts, ramps up, and achieves 415V ±2% and 50Hz ±1Hz. Generator Healthy signal received by ATS controller.
   • Stage 4 (Mains Trip): Utility Incomer ACB (INCOMER-1) is tripped open via Shunt Trip coil (MX). Status verified OPEN by auxiliary limit switch.
   • Stage 5 (Transfer to Generator): After a dead-bus safety delay of 1.5 seconds, Generator Incomer ACB (INCOMER-2) receives closing command from Spring Charging Motor (MOE). Load transfers to Generator. Non-essential load shedding executed if required.

4. UTILITY RESTORATION & RETRANSFER SEQUENCE
   • Stage 1 (Mains Health Monitoring): When Utility supply is restored to normal levels (within 90%–110% nominal), Mains Stable Timer (T2: 0–30 mins, preset to 5.0 mins) initiates.
   • Stage 2 (Retransfer Command): Upon timer expiry, Generator Incomer ACB (INCOMER-2) is tripped open.
   • Stage 3 (Dead-Bus Safety Interval): A mechanical & electrical safety interlock delay of 2.0 seconds elapses to prevent out-of-phase paralleling.
   • Stage 4 (Mains Re-closing): Utility Incomer ACB (INCOMER-1) closes. Full load is safely retransferred to Utility mains.
   • Stage 5 (Generator Cool-down & Stop): Generator engine runs unloaded for cool-down timer (T3: 5.0 minutes) to dissipate turbocharger heat, then shuts down into standby.

5. SAFETY INTERLOCKING MATRIX
   • Mechanical Interlock: Flexible stainless steel bowden cable / walking-beam interlock ensures physical impossibility of closing both Utility and Generator ACBs simultaneously.
   • Electrical Interlock: Series connection of normally-closed (NC) auxiliary contacts on ACB closing circuits preventing simultaneous electrical closing pulse.
   • Castell Key Interlock: Single trapped key mechanism for manual maintenance bypass.
`;

    return {
      id: 'ats-config-01',
      atsTag: 'ATS-MDB-01',
      normalSourceNodeId: normId,
      emergencySourceNodeId: emergId,
      busCouplerNodeId: couplerNode?.id,
      topologyType: 'UTILITY_GEN',
      transitionType: 'OPEN_TRANSITION',
      interlockType: 'MECHANICAL_AND_ELECTRICAL',
      genStartDelaySec: 2,
      transferDelaySec: 1.5,
      retransferDelaySec: 300, // 5 mins
      genCooldownSec: 300, // 5 mins
      hasBypassSwitch: true,
      controlPhilosophyText: controlPhilosophy.trim(),
      monitoringRelays: {
        underVoltage: true,
        overVoltage: true,
        phaseFailure: true,
        frequencyMonitor: true,
        neutralFailure: true,
      },
    };
  }
}
