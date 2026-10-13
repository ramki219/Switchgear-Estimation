import type { BureauClient } from '../types/index.ts';

export const INITIAL_BUREAU_CLIENTS: BureauClient[] = [
  {
    clientID: 1,
    clientCode: 'CLI-AGS-01',
    companyName: 'Al Ghandi Switchgear LLC',
    contactPerson: 'Eng. Tariq Mansoor (Tendering Head)',
    email: 'tariq.m@alghandiswitchgear.ae',
    phone: '+971 4 231 8800',
    address: 'Ras Al Khor Industrial Area 2, Dubai, UAE',
    authority: 'DEWA / SEWA',
    defaultPaymentTerms: '10% Advance with Order, 80% against Delivery, 10% on Testing & Handover',
    defaultWarrantyMonths: 18,
    defaultDeliveryWeeks: 8,
    targetMarginPercent: 14.5,
    defaultOverheadPercent: 7.5,
    oemDiscounts: [
      { manufacturerCode: 'ABB', manufacturerName: 'ABB Electrification', standardDiscountPercent: 42.0 },
      { manufacturerCode: 'SCHNEIDER', manufacturerName: 'Schneider Electric', standardDiscountPercent: 35.0 },
      { manufacturerCode: 'SIEMENS', manufacturerName: 'Siemens AG', standardDiscountPercent: 38.0 },
      { manufacturerCode: 'HAGER', manufacturerName: 'Hager Group', standardDiscountPercent: 40.0 },
      { manufacturerCode: 'EATON', manufacturerName: 'Eaton Power Distribution', standardDiscountPercent: 34.0 },
      { manufacturerCode: 'SOCOMEC', manufacturerName: 'Socomec Middle East', standardDiscountPercent: 28.0 }
    ],
    notes: 'Tier-1 Approved DEWA panel builder. High volume on ABB Emax2 & Tmax XT. Preferred Form 4b Type 6.',
    activeTendersCount: 4,
    totalWonTendersValue: 1850000.00
  },
  {
    clientID: 2,
    clientCode: 'CLI-DAN-02',
    companyName: 'Danway Electrical & Mechanical Engineering',
    contactPerson: 'Eng. K. Suresh (Chief Estimator)',
    email: 'suresh.k@danwayeme.com',
    phone: '+971 6 534 5111',
    address: 'Industrial Area 13, Sharjah, UAE',
    authority: 'SEWA / DEWA / FEWA',
    defaultPaymentTerms: '15% Advance, 75% against Delivery to site, 10% Retention 12 Months',
    defaultWarrantyMonths: 24,
    defaultDeliveryWeeks: 10,
    targetMarginPercent: 15.0,
    defaultOverheadPercent: 8.0,
    oemDiscounts: [
      { manufacturerCode: 'SCHNEIDER', manufacturerName: 'Schneider Electric', standardDiscountPercent: 40.5 },
      { manufacturerCode: 'ABB', manufacturerName: 'ABB Electrification', standardDiscountPercent: 36.0 },
      { manufacturerCode: 'SIEMENS', manufacturerName: 'Siemens AG', standardDiscountPercent: 35.5 },
      { manufacturerCode: 'HAGER', manufacturerName: 'Hager Group', standardDiscountPercent: 38.0 },
      { manufacturerCode: 'RTR', manufacturerName: 'RTR Energia', standardDiscountPercent: 25.0 }
    ],
    notes: 'Major industrial contractor. Strong ties with Schneider Electric. Focus on infrastructure & wastewater pumping stations.',
    activeTendersCount: 3,
    totalWonTendersValue: 2420000.00
  },
  {
    clientID: 3,
    clientCode: 'CLI-PPS-03',
    companyName: 'Power Plus Switchboards Manufacturing LLC',
    contactPerson: 'Eng. Hisham Al-Sayed (Technical Director)',
    email: 'hisham.s@powerplusswitchgear.com',
    phone: '+971 2 550 2244',
    address: 'ICAD 1, Musaffah, Abu Dhabi, UAE',
    authority: 'ADDC / AADC',
    defaultPaymentTerms: '10% Advance, 80% against progressive inspections, 10% after Final Acceptance',
    defaultWarrantyMonths: 24,
    defaultDeliveryWeeks: 9,
    targetMarginPercent: 16.0,
    defaultOverheadPercent: 8.5,
    oemDiscounts: [
      { manufacturerCode: 'SIEMENS', manufacturerName: 'Siemens AG', standardDiscountPercent: 41.0 },
      { manufacturerCode: 'ABB', manufacturerName: 'ABB Electrification', standardDiscountPercent: 38.5 },
      { manufacturerCode: 'SCHNEIDER', manufacturerName: 'Schneider Electric', standardDiscountPercent: 34.0 },
      { manufacturerCode: 'EATON', manufacturerName: 'Eaton Power Distribution', standardDiscountPercent: 36.5 }
    ],
    notes: 'Specializes in ADDC utilities, oil & gas substation auxiliary panels, and withdrawable MCCs.',
    activeTendersCount: 2,
    totalWonTendersValue: 1290000.00
  },
  {
    clientID: 4,
    clientCode: 'CLI-FAN-04',
    companyName: 'Al Fanar Electrical Systems',
    contactPerson: 'Eng. Faisal Al-Otaibi (Commercial Manager)',
    email: 'faisal.otaibi@alfanar.com',
    phone: '+966 11 9200 0611',
    address: 'Second Industrial City, Riyadh, Kingdom of Saudi Arabia',
    authority: 'SEC / Saudi Aramco / SWCC',
    defaultPaymentTerms: '20% Advance against Bank Guarantee, 70% against Shipping, 10% Commissioning',
    defaultWarrantyMonths: 24,
    defaultDeliveryWeeks: 12,
    targetMarginPercent: 15.5,
    defaultOverheadPercent: 9.0,
    oemDiscounts: [
      { manufacturerCode: 'ABB', manufacturerName: 'ABB Electrification', standardDiscountPercent: 40.0 },
      { manufacturerCode: 'SCHNEIDER', manufacturerName: 'Schneider Electric', standardDiscountPercent: 39.0 },
      { manufacturerCode: 'SIEMENS', manufacturerName: 'Siemens AG', standardDiscountPercent: 37.0 },
      { manufacturerCode: 'SOCOMEC', manufacturerName: 'Socomec Middle East', standardDiscountPercent: 30.0 }
    ],
    notes: 'Saudi mega-projects (NEOM, Red Sea, Riyadh Metro). High ambient derating (50 deg C ambient) applies.',
    activeTendersCount: 5,
    totalWonTendersValue: 4100000.00
  }
];
