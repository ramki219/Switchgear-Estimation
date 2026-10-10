// ============================================================================
// CONTROL WIRING & TERMINAL SCHEDULE ENGINE
// Generates control circuit schedules, wire codes, and terminal block mappings
// ============================================================================

import { SLDTopology, ControlCircuitItem, TerminalScheduleItem } from '../types/engineering';

export class ControlWiringEngine {
  /**
   * Generates control circuits and terminal schedules for the panel
   */
  public static generateControlAndTerminals(topology: SLDTopology): {
    controlCircuits: ControlCircuitItem[];
    terminalSchedule: TerminalScheduleItem[];
  } {
    const controlCircuits: ControlCircuitItem[] = [
      {
        circuitId: 'CC-01',
        functionName: 'Utility Incomer 1 Tripping & UVR Protection Circuit',
        sourceVoltage: '240V AC Auxiliary Supply',
        fuseRatingA: 6,
        devicesInvolved: ['UVR-01', 'MX-SHUNTRIP-1', 'OF-AUX-1', 'PB-TRIP-1'],
        terminalBlock: 'TB01',
        wireNumbers: ['L101', 'L102', 'L103', 'N100'],
        description: 'Under-voltage release coil feed + manual emergency trip push button loop',
      },
      {
        circuitId: 'CC-02',
        functionName: 'Utility Incomer 1 Spring Charging Motor (MOE) & Closing Circuit',
        sourceVoltage: '240V AC Auxiliary Supply',
        fuseRatingA: 10,
        devicesInvolved: ['M-MOTOR-1', 'XF-CLOSE-1', 'SS-LOCAL-REMOTE'],
        terminalBlock: 'TB01',
        wireNumbers: ['L104', 'L105', 'L106', 'N100'],
        description: 'Motorized spring charging mechanism power and electrical closing coil pulse',
      },
      {
        circuitId: 'CC-03',
        functionName: 'Class 0.5S Energy Meter CT Secondary Current Measurement (3PH+N)',
        sourceVoltage: '5A Secondary CT Loop',
        fuseRatingA: 0, // Direct shorting terminal blocks (NEVER FUSE CTs)
        devicesInvolved: ['CT-L1', 'CT-L2', 'CT-L3', 'CT-N', 'M01-METER'],
        terminalBlock: 'TB01',
        wireNumbers: ['S1-R', 'S2-R', 'S1-Y', 'S2-Y', 'S1-B', 'S2-B', 'S1-N', 'S2-N'],
        description: 'Disconnection sliding test blocks with shorting links for energy meter current coils',
      },
      {
        circuitId: 'CC-04',
        functionName: 'Class 0.5S Energy Meter PT Voltage Sensing (Fused)',
        sourceVoltage: '415V / 240V AC Sensing Supply',
        fuseRatingA: 2,
        devicesInvolved: ['FU-METER-R', 'FU-METER-Y', 'FU-METER-B', 'M01-METER'],
        terminalBlock: 'TB01',
        wireNumbers: ['V1', 'V2', 'V3', 'VN'],
        description: 'Line-to-Line and Line-to-Neutral voltage measurement inputs to digital meter',
      },
      {
        circuitId: 'CC-05',
        functionName: 'Dual Source Mechanical & Electrical Safety Interlock Loop',
        sourceVoltage: '24V DC / 240V AC Interlock Loop',
        fuseRatingA: 6,
        devicesInvolved: ['INC1-NC-AUX', 'INC2-NC-AUX', 'BC-NC-AUX', 'CASTELL-SWITCH'],
        terminalBlock: 'TB02',
        wireNumbers: ['IL01', 'IL02', 'IL03', 'IL04'],
        description: 'Fail-safe series auxiliary contact interlocking preventing simultaneous closing of sources',
      },
      {
        circuitId: 'CC-06',
        functionName: 'Generator Remote Auto-Start Signal (Dry Contacts to Genset ECP)',
        sourceVoltage: '24V DC Potential-Free Contact',
        fuseRatingA: 4,
        devicesInvolved: ['ATS-GEN-RELAY', 'GEN-ECP-REMOTE-START'],
        terminalBlock: 'TB02',
        wireNumbers: ['G01', 'G02'],
        description: 'Normally-Open (NO) dry contact closes to signal generator startup on utility failure',
      },
      {
        circuitId: 'CC-07',
        functionName: 'Common Fault Annunciation & Master Trip Horn Alarm',
        sourceVoltage: '240V AC Alarm Bus',
        fuseRatingA: 6,
        devicesInvolved: ['HORN-01', 'LAMP-COMMON-TRIP', 'PB-ALARM-ACK'],
        terminalBlock: 'TB02',
        wireNumbers: ['AL01', 'AL02', 'AL03'],
        description: 'Master trip signal energizes flashing beacon and audible horn with silence button',
      },
    ];

    const terminalSchedule: TerminalScheduleItem[] = [
      // TB01: Incomer 1 & Metering
      { id: 't-01', terminalBlock: 'TB01', terminalNumber: 1, wireNumber: 'L101', signalDescription: 'Auxiliary Phase L1 Supply (240VAC)', sourceDevice: 'Control Fuse 1', destinationDevice: 'UVR-01', wireSizeMm2: 2.5, wireColor: 'Red' },
      { id: 't-02', terminalBlock: 'TB01', terminalNumber: 2, wireNumber: 'L102', signalDescription: 'Under-voltage Relay Coil (+)', sourceDevice: 'UVR-01', destinationDevice: 'PB-TRIP-1', wireSizeMm2: 1.5, wireColor: 'Grey' },
      { id: 't-03', terminalBlock: 'TB01', terminalNumber: 3, wireNumber: 'L103', signalDescription: 'Shunt Trip Coil (MX) Trigger', sourceDevice: 'PB-TRIP-1', destinationDevice: 'MX-COIL-1', wireSizeMm2: 1.5, wireColor: 'Grey' },
      { id: 't-04', terminalBlock: 'TB01', terminalNumber: 4, wireNumber: 'N100', signalDescription: 'Auxiliary Neutral Return', sourceDevice: 'Neutral Link', destinationDevice: 'UVR / MX Coils', wireSizeMm2: 2.5, wireColor: 'Blue' },
      { id: 't-05', terminalBlock: 'TB01', terminalNumber: 5, wireNumber: 'S1-R', signalDescription: 'Phase R Current Transformer Start (S1)', sourceDevice: 'CT-L1 (S1)', destinationDevice: 'M01 Meter (I1+)', wireSizeMm2: 4.0, wireColor: 'Red' },
      { id: 't-06', terminalBlock: 'TB01', terminalNumber: 6, wireNumber: 'S2-R', signalDescription: 'Phase R Current Transformer End (S2/Earth)', sourceDevice: 'CT-L1 (S2)', destinationDevice: 'M01 Meter (I1-)', wireSizeMm2: 4.0, wireColor: 'Black' },
      { id: 't-07', terminalBlock: 'TB01', terminalNumber: 7, wireNumber: 'S1-Y', signalDescription: 'Phase Y Current Transformer Start (S1)', sourceDevice: 'CT-L2 (S1)', destinationDevice: 'M01 Meter (I2+)', wireSizeMm2: 4.0, wireColor: 'Yellow' },
      { id: 't-08', terminalBlock: 'TB01', terminalNumber: 8, wireNumber: 'S2-Y', signalDescription: 'Phase Y Current Transformer End (S2/Earth)', sourceDevice: 'CT-L2 (S2)', destinationDevice: 'M01 Meter (I2-)', wireSizeMm2: 4.0, wireColor: 'Black' },
      { id: 't-09', terminalBlock: 'TB01', terminalNumber: 9, wireNumber: 'S1-B', signalDescription: 'Phase B Current Transformer Start (S1)', sourceDevice: 'CT-L3 (S1)', destinationDevice: 'M01 Meter (I3+)', wireSizeMm2: 4.0, wireColor: 'Blue' },
      { id: 't-10', terminalBlock: 'TB01', terminalNumber: 10, wireNumber: 'S2-B', signalDescription: 'Phase B Current Transformer End (S2/Earth)', sourceDevice: 'CT-L3 (S2)', destinationDevice: 'M01 Meter (I3-)', wireSizeMm2: 4.0, wireColor: 'Black' },
      { id: 't-11', terminalBlock: 'TB01', terminalNumber: 11, wireNumber: 'V1', signalDescription: 'Meter Voltage Sensing Phase L1 (415V Fused)', sourceDevice: 'Fuse 2A (L1)', destinationDevice: 'M01 Meter (V1)', wireSizeMm2: 1.5, wireColor: 'Red' },
      { id: 't-12', terminalBlock: 'TB01', terminalNumber: 12, wireNumber: 'V2', signalDescription: 'Meter Voltage Sensing Phase L2 (415V Fused)', sourceDevice: 'Fuse 2A (L2)', destinationDevice: 'M01 Meter (V2)', wireSizeMm2: 1.5, wireColor: 'Yellow' },
      { id: 't-13', terminalBlock: 'TB01', terminalNumber: 13, wireNumber: 'V3', signalDescription: 'Meter Voltage Sensing Phase L3 (415V Fused)', sourceDevice: 'Fuse 2A (L3)', destinationDevice: 'M01 Meter (V3)', wireSizeMm2: 1.5, wireColor: 'Blue' },
      { id: 't-14', terminalBlock: 'TB01', terminalNumber: 14, wireNumber: 'VN', signalDescription: 'Meter Voltage Sensing Neutral (Fused)', sourceDevice: 'Fuse 2A (N)', destinationDevice: 'M01 Meter (VN)', wireSizeMm2: 1.5, wireColor: 'Black' },

      // TB02: Interlocking & Generator Remote
      { id: 't-21', terminalBlock: 'TB02', terminalNumber: 1, wireNumber: 'IL01', signalDescription: 'Interlock Loop Supply (+24VDC)', sourceDevice: 'Power Supply 24V', destinationDevice: 'INC-1 Auxiliary NC', wireSizeMm2: 1.5, wireColor: 'Red' },
      { id: 't-22', terminalBlock: 'TB02', terminalNumber: 2, wireNumber: 'IL02', signalDescription: 'Interlock Loop Incomer 1 Status Return', sourceDevice: 'INC-1 Aux NC', destinationDevice: 'BC-1 Closing Circuit', wireSizeMm2: 1.5, wireColor: 'Grey' },
      { id: 't-23', terminalBlock: 'TB02', terminalNumber: 3, wireNumber: 'IL03', signalDescription: 'Interlock Loop Incomer 2 Status Return', sourceDevice: 'INC-2 Aux NC', destinationDevice: 'BC-1 Closing Circuit', wireSizeMm2: 1.5, wireColor: 'Grey' },
      { id: 't-24', terminalBlock: 'TB02', terminalNumber: 4, wireNumber: 'G01', signalDescription: 'Generator Remote Auto-Start Contact (Pin 1)', sourceDevice: 'ATS Controller Relay', destinationDevice: 'Generator ECP Terminal 1', wireSizeMm2: 2.5, wireColor: 'Orange' },
      { id: 't-25', terminalBlock: 'TB02', terminalNumber: 5, wireNumber: 'G02', signalDescription: 'Generator Remote Auto-Start Contact (Pin 2)', sourceDevice: 'ATS Controller Relay', destinationDevice: 'Generator ECP Terminal 2', wireSizeMm2: 2.5, wireColor: 'Orange' },
      { id: 't-26', terminalBlock: 'TB02', terminalNumber: 6, wireNumber: 'AL01', signalDescription: 'Common Fault Beacon (+240V)', sourceDevice: 'Master Trip Relay', destinationDevice: 'Door Warning Strobe', wireSizeMm2: 1.5, wireColor: 'Red' },
      { id: 't-27', terminalBlock: 'TB02', terminalNumber: 7, wireNumber: 'AL02', signalDescription: 'Alarm Silence Pushbutton Return', sourceDevice: 'PB-ACK', destinationDevice: 'Trip Relay Reset', wireSizeMm2: 1.5, wireColor: 'Grey' },
      { id: 't-28', terminalBlock: 'TB02', terminalNumber: 8, wireNumber: 'PE', signalDescription: 'Protective Earth Connection', sourceDevice: 'Main Earth Bar', destinationDevice: 'Door Bonding Strap', wireSizeMm2: 6.0, wireColor: 'Green/Yellow' },
    ];

    return { controlCircuits, terminalSchedule };
  }
}
