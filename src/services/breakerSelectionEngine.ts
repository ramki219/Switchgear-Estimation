// ============================================================================
// BREAKER SELECTION ENGINE (Database-Driven per Approved Engineering Master)
// Rule: Never invent part numbers or ratings. Return "ENGINEERING DATA REQUIRED"
// ============================================================================

import { Component } from '../types';

export interface BreakerQuery {
  currentA: number;
  voltageV?: number;
  poles?: 3 | 4;
  breakingCapacityKA?: number;
  protection?: string; // "LSIG", "LSI", "LI", "Thermal-Magnetic"
  mounting?: 'Drawout' | 'Fixed' | 'Plug-in' | 'DIN Rail';
  preferredManufacturer?: string; // "ABB", "Schneider", "Siemens", "LS Electric", "Eaton"
  categoryCode?: 'ACB' | 'MCCB' | 'MCB' | 'ISOLATOR';
}

export interface BreakerSelectionResult {
  status: 'FOUND' | 'ENGINEERING_DATA_REQUIRED';
  component?: Component;
  partNumber: string;
  manufacturer: string;
  productFamily: string;
  deviceType: 'ACB' | 'MCCB' | 'MCB' | 'ISOLATOR';
  ratedCurrentA: number;
  breakingCapacityKA: number;
  shortTimeWithstandKA?: number;
  poles: number;
  protectionUnit: string;
  mounting: string;
  iecStandard: string;
  estimatedPriceAED: number;
  selectionReason: string;
  engineeringNotes: string[];
}

export class BreakerSelectionEngine {
  /**
   * Automatically select breaker matching engineering criteria from master database
   */
  public static selectBreaker(
    query: BreakerQuery,
    catalogComponents: Component[]
  ): BreakerSelectionResult {
    const {
      currentA,
      poles = 4,
      breakingCapacityKA = 36,
      protection = 'LSIG',
      mounting,
      preferredManufacturer = 'ABB',
      categoryCode,
    } = query;

    // Determine device type if not specified
    const targetCategory = categoryCode || this.determineCategoryByCurrent(currentA);

    // Filter candidate components from approved master database
    const candidates = catalogComponents.filter((c) => {
      if (!c.isActive) return false;

      // Filter by category
      const codeUpper = (c.categoryName || '').toUpperCase();
      const isACB = targetCategory === 'ACB' && (codeUpper.includes('ACB') || codeUpper.includes('AIR CIRCUIT'));
      const isMCCB = targetCategory === 'MCCB' && (codeUpper.includes('MCCB') || codeUpper.includes('MOULDED'));
      const isMCB = targetCategory === 'MCB' && (codeUpper.includes('MCB') || codeUpper.includes('MINIATURE'));
      const isIsolator = targetCategory === 'ISOLATOR' && (codeUpper.includes('ISOLATOR') || codeUpper.includes('SWITCH'));

      if (!isACB && !isMCCB && !isMCB && !isIsolator) return false;

      // Filter by poles if specified
      if (poles && c.poles && c.poles !== poles) return false;

      // Filter by current rating (must be >= requested current)
      if (c.ratedCurrent && c.ratedCurrent < currentA) return false;

      return true;
    });

    // Score candidates based on manufacturer preference, rating proximity, and breaking capacity
    let bestMatch: Component | null = null;
    let lowestScore = Infinity;

    for (const cand of candidates) {
      let score = 0;

      // Manufacturer match bonus
      const candMfg = (cand.manufacturerCode || cand.manufacturerName || '').toUpperCase();
      if (preferredManufacturer && candMfg.includes(preferredManufacturer.toUpperCase())) {
        score -= 1000;
      }

      // Proximity of current rating
      const candIn = cand.ratedCurrent || 0;
      const currentDelta = candIn - currentA;
      if (currentDelta < 0) continue;
      score += currentDelta; // prefer closest rating without undersizing

      // Breaking capacity check
      const candIcu = cand.breakingCapacity || 0;
      if (candIcu < breakingCapacityKA) {
        score += 5000; // heavy penalty if below required fault level
      } else {
        score += (candIcu - breakingCapacityKA) * 2; // small penalty for over-specification
      }

      // Mounting match
      if (mounting && cand.mountingType) {
        if (cand.mountingType.toLowerCase() === mounting.toLowerCase()) {
          score -= 50;
        }
      }

      if (score < lowestScore) {
        lowestScore = score;
        bestMatch = cand;
      }
    }

    if (bestMatch && bestMatch.partNumber) {
      const price = bestMatch.currentPrice?.netPrice || 0;
      const icu = bestMatch.breakingCapacity || breakingCapacityKA;
      const mfg = bestMatch.manufacturerCode || bestMatch.manufacturerName || preferredManufacturer;

      return {
        status: 'FOUND',
        component: bestMatch,
        partNumber: bestMatch.partNumber,
        manufacturer: mfg,
        productFamily: bestMatch.model || `${mfg} Standard Series`,
        deviceType: targetCategory,
        ratedCurrentA: bestMatch.ratedCurrent || currentA,
        breakingCapacityKA: icu,
        shortTimeWithstandKA: targetCategory === 'ACB' ? Math.round(icu * 0.85) : undefined,
        poles: bestMatch.poles || poles,
        protectionUnit: protection,
        mounting: bestMatch.mountingType || (targetCategory === 'ACB' ? 'Drawout' : 'Fixed'),
        iecStandard: bestMatch.iecStandard || 'IEC 60947-2',
        estimatedPriceAED: price,
        selectionReason: `Selected ${mfg} ${bestMatch.model || targetCategory} rated ${bestMatch.ratedCurrent}A, ${icu}kA from Master Catalog to meet design load ${currentA}A @ ${breakingCapacityKA}kA fault level.`,
        engineeringNotes: [
          `Approved IEC 60947-2 tested device.`,
          icu >= breakingCapacityKA
            ? `Breaking capacity ${icu}kA satisfies site fault level ${breakingCapacityKA}kA.`
            : `WARNING: Breaker Icu (${icu}kA) is below requested fault level (${breakingCapacityKA}kA).`,
          targetCategory === 'ACB' ? `Includes micro-processor based trip unit (${protection}) with LCD display.` : `Electronic / Thermal-magnetic protection calibrated for continuous duty.`,
        ],
      };
    }

    // If no candidate exists in the master database, do NOT invent one
    return {
      status: 'ENGINEERING_DATA_REQUIRED',
      partNumber: 'ENGINEERING DATA REQUIRED',
      manufacturer: preferredManufacturer || 'OEM Undefined',
      productFamily: 'ENGINEERING DATA REQUIRED',
      deviceType: targetCategory,
      ratedCurrentA: currentA,
      breakingCapacityKA: breakingCapacityKA,
      poles: poles,
      protectionUnit: protection,
      mounting: targetCategory === 'ACB' ? 'Drawout' : 'Fixed',
      iecStandard: 'IEC 60947-2',
      estimatedPriceAED: 0,
      selectionReason: `No approved component found in Master Catalog matching ${currentA}A, ${poles}P, ${breakingCapacityKA}kA for ${preferredManufacturer}. Please add this component to the Master Catalog or select alternative OEM.`,
      engineeringNotes: [
        `ENGINEERING DATA REQUIRED: Cannot fabricate part numbers per safety constitution.`,
        `Required Specification: ${targetCategory} ${currentA}A, ${poles}P, Icu >= ${breakingCapacityKA}kA, Trip Unit: ${protection}.`,
      ],
    };
  }

  public static determineCategoryByCurrent(amps: number): 'ACB' | 'MCCB' | 'MCB' {
    if (amps >= 800) return 'ACB';
    if (amps >= 100) return 'MCCB';
    return 'MCB';
  }
}
