-- ============================================================================
-- LV Switchgear Estimator - Comprehensive Seed Data
-- Engine: Microsoft SQL Server
-- Authentic LV Switchgear OEM Components, Specifications, Suppliers & Prices
-- ============================================================================

USE [LVSwitchgearEstimator];
GO

-- 1. Seed Manufacturers (OEMs)
SET IDENTITY_INSERT master.Manufacturers ON;

INSERT INTO master.Manufacturers (ManufacturerID, ManufacturerCode, ManufacturerName, Country, Website, IsActive)
VALUES
(1, 'ABB', N'ABB Electrification', N'Switzerland', N'https://new.abb.com/low-voltage', 1),
(2, 'SCHNEIDER', N'Schneider Electric', N'France', N'https://www.se.com', 1),
(3, 'SIEMENS', N'Siemens AG', N'Germany', N'https://www.siemens.com', 1),
(4, 'EATON', N'Eaton Corporation', N'United States', N'https://www.eaton.com', 1),
(5, 'HAGER', N'Hager Group', N'Germany', N'https://hager.com', 1),
(6, 'SOCOMEC', N'Socomec Group', N'France', N'https://www.socomec.com', 1),
(7, 'LOVATO', N'Lovato Electric', N'Italy', N'https://www.lovatoelectric.com', 1),
(8, 'LEGRAND', N'Legrand', N'France', N'https://www.legrand.com', 1),
(9, 'RTR', N'RTR Energia', N'Spain', N'https://rtrenergia.es', 1),
(10, 'DEHN', N'DEHN SE', N'Germany', N'https://www.dehn-international.com', 1);

SET IDENTITY_INSERT master.Manufacturers OFF;
GO

-- 2. Seed Component Categories
SET IDENTITY_INSERT master.ComponentCategories ON;

INSERT INTO master.ComponentCategories (CategoryID, CategoryCode, CategoryName, Description, DefaultIECStandard, IsActive)
VALUES
(1, 'ACB', N'Air Circuit Breakers', N'Main incomers & heavy feeder protection', 'IEC 60947-2', 1),
(2, 'MCCB', N'Moulded Case Circuit Breakers', N'Power distribution circuit protection', 'IEC 60947-2', 1),
(3, 'MCB', N'Miniature Circuit Breakers', N'Final sub-circuit protection 0.5A to 125A', 'IEC 60898-1 / 60947-2', 1),
(4, 'CONTACTOR', N'Power & Capacitor Contactors', N'Motor starting and APFC switching contactors', 'IEC 60947-4-1', 1),
(5, 'APFC_CAP', N'Power Factor Capacitors', N'Heavy duty gas/resin filled power capacitors', 'IEC 60831-1/2', 1),
(6, 'DET_REACTOR', N'Detuned Harmonic Filter Reactors', N'7% and 14% anti-resonance reactors', 'IEC 60076-6', 1),
(7, 'METERS', N'Digital Power & Energy Meters', N'Multifunction digital meters with RS485 Modbus', 'IEC 61557-12', 1),
(8, 'CT', N'Current Transformers', N'Measuring & protection toroidal and wound CTs', 'IEC 61869-2', 1),
(9, 'SPD', N'Surge Protective Devices', N'Type 1+2 and Type 2 lightning & transient surge arresters', 'IEC 61643-11', 1),
(10, 'ATS_CTRL', N'ATS Controllers & Switches', N'Automatic transfer switches and mains/generator controllers', 'IEC 60947-6-1', 1),
(11, 'ENCLOSURE', N'Modular Switchboard Enclosures', N'Form 2b / Form 4b sheet steel modular cubicles', 'IEC 61439-1/2', 1),
(12, 'BUSBAR', N'High Conductivity Copper Busbars', N'Cu-ETP 99.9% bare and tinned busbars', 'BS EN 13601', 1);

SET IDENTITY_INSERT master.ComponentCategories OFF;
GO

-- 3. Seed Panel Types
SET IDENTITY_INSERT master.PanelTypes ON;

INSERT INTO master.PanelTypes (PanelTypeID, PanelTypeCode, PanelTypeName, Description, DefaultFormOfSeparation, DefaultIPRating)
VALUES
(1, 'MDB', N'Main Distribution Board', N'Main Low Voltage switchboard from transformer or generator', 'Form 4b Type 6', 'IP54'),
(2, 'SMDB', N'Sub Main Distribution Board', N'Floor or sub-distribution board with MCCB incomers & outgoing', 'Form 3b Type 2', 'IP54'),
(3, 'DB', N'Final Distribution Board', N'Lighting and small power distribution board with MCB outgoing', 'Form 2b', 'IP42'),
(4, 'MCC', N'Motor Control Center', N'Centralized motor starters, DOL, Star-Delta, VFDs and soft starters', 'Form 4b Type 7', 'IP54'),
(5, 'APFC', N'Automatic Power Factor Correction Panel', N'Detuned capacitor bank with reactive power controller', 'Form 2b', 'IP43'),
(6, 'ATS', N'Automatic Transfer Switch Panel', N'Dual-source auto changeover panel between Mains and Genset', 'Form 3b', 'IP54');

SET IDENTITY_INSERT master.PanelTypes OFF;
GO

-- 4. Seed Suppliers
SET IDENTITY_INSERT master.Suppliers ON;

INSERT INTO master.Suppliers (SupplierID, SupplierCode, SupplierName, ContactPerson, Email, Phone, Currency, PaymentTerms, IsActive)
VALUES
(1, 'SUP-ALGHURAIR', N'Al Ghandi Electrical Supplies', N'Ramesh Kumar', N'sales@alghandielect.com', N'+971 4 295 4411', 'AED', '30 Days Net', 1),
(2, 'SUP-DANUBE', N'Danube Switchgear Supplies LLC', N'Mustafa Al-Hashimi', N'quotes@danubeswitchgear.ae', N'+971 4 880 1234', 'AED', '45 Days PDC', 1),
(3, 'SUP-BIN_GHALIB', N'Bin Ghalib Engineering', N'Sanjay Varma', N'switchgear@binghalib.ae', N'+971 4 338 6677', 'AED', '30 Days Net', 1),
(4, 'SUP-SCIENTIFIC', N'Gulf Electrical Distribution FZCO', N'David Henderson', N'd.henderson@gulfelec.com', N'+971 4 883 9922', 'AED', 'Immediate LC', 1);

SET IDENTITY_INSERT master.Suppliers OFF;
GO

-- 5. Seed Components
SET IDENTITY_INSERT master.Components ON;

INSERT INTO master.Components 
(ComponentID, ComponentCode, ComponentName, CategoryID, ManufacturerID, PartNumber, Model, Description, Unit, RatedVoltage, RatedCurrent, Poles, BreakingCapacity, Frequency, IPRating, MountingType, IECStandard, IsActive)
VALUES
-- ACB 1600A ABB Emax 2
(1, 'CMP-ACB-1600-ABB', N'ABB Emax 2 E2.2N 1600A 3P Drawout ACB', 1, 1, '1SDA071018R1', 'E2.2N 1600 Ekip Touch LSI 3p WMP', N'Air circuit breaker, 1600A, 3 poles, drawout with Ekip Touch trip unit, complete with cradle', 'NOS', 415.00, 1600.00, 3, 66.00, 50.00, 'IP30', 'Drawout', 'IEC 60947-2', 1),

-- ACB 2500A Schneider MasterPact MTZ2
(2, 'CMP-ACB-2500-SCH', N'Schneider MasterPact MTZ2 25H1 2500A 4P Drawout ACB', 1, 2, 'LV848150', 'MTZ2 25H1 4P Drawout Micrologic 5.0X', N'MasterPact MTZ2 drawout ACB, 2500A, 4-Pole, 66kA, with Micrologic 5.0X trip unit and chassis', 'NOS', 415.00, 2500.00, 4, 66.00, 50.00, 'IP30', 'Drawout', 'IEC 60947-2', 1),

-- MCCB 400A Schneider NSX400F
(3, 'CMP-MCCB-400-SCH', N'Schneider ComPact NSX400F 400A 3P 36kA MCCB', 2, 2, 'LV432676', 'NSX400F Micrologic 2.3 3P', N'Moulded case circuit breaker, 400A frame, 3-pole, 36kA at 415V, Micrologic 2.3 electronic trip', 'NOS', 415.00, 400.00, 3, 36.00, 50.00, 'IP40', 'Fixed', 'IEC 60947-2', 1),

-- MCCB 250A ABB Tmax XT4N
(4, 'CMP-MCCB-250-ABB', N'ABB Tmax XT4N 250A 3P 36kA TMD MCCB', 2, 1, '1SDA068138R1', 'XT4N 250 TMD 250-2500 3p F F', N'Moulded case circuit breaker, 250A, 3-pole, 36kA, thermal-magnetic TMD adjustable trip unit', 'NOS', 415.00, 250.00, 3, 36.00, 50.00, 'IP40', 'Fixed', 'IEC 60947-2', 1),

-- MCCB 160A Siemens 3VA11
(5, 'CMP-MCCB-160-SIE', N'Siemens 3VA11 160A 3P 25kA TM240 MCCB', 2, 3, '3VA1116-4EF32-0AA0', '3VA11 160A 3P TM240 ATAM', N'Sentron moulded case circuit breaker, 160A, 3-pole, 25kA, line protection TM240', 'NOS', 415.00, 160.00, 3, 25.00, 50.00, 'IP40', 'Fixed', 'IEC 60947-2', 1),

-- MCB 32A Hager 10kA 3P
(6, 'CMP-MCB-32-HAG', N'Hager 32A 3P C-Curve 10kA MCB', 3, 5, 'NC332A', 'NC332A 3P 32A 10kA C', N'Miniature circuit breaker, 32A, 3-Pole, C-Curve, 10kA breaking capacity according to IEC 60898-1', 'NOS', 415.00, 32.00, 3, 10.00, 50.00, 'IP20', 'DIN Rail', 'IEC 60898-1', 1),

-- MCB 20A Hager 10kA 1P
(7, 'CMP-MCB-20-HAG', N'Hager 20A 1P C-Curve 10kA MCB', 3, 5, 'NC120A', 'NC120A 1P 20A 10kA C', N'Miniature circuit breaker, 20A, 1-Pole, C-Curve, 10kA breaking capacity', 'NOS', 240.00, 20.00, 1, 10.00, 50.00, 'IP20', 'DIN Rail', 'IEC 60898-1', 1),

-- Digital Meter Schneider PM5350
(8, 'CMP-MTR-PM5350-SCH', N'Schneider PowerLogic PM5350 Multifunction Power Meter', 7, 2, 'METSEPM5350', 'PowerLogic PM5350 RS485', N'Multifunction digital power meter, Class 0.5S, THD harmonic analysis, RS485 Modbus RTU', 'NOS', 415.00, 5.00, 3, NULL, 50.00, 'IP54', 'Door Mount (96x96)', 'IEC 61557-12', 1),

-- CT 1600/5A Class 0.5
(9, 'CMP-CT-1600-5A', N'Busbar Type Measuring CT 1600/5A Class 0.5 15VA', 8, 1, 'CT-BB-1600-5', 'CT-1600/5A-CL0.5-15VA', N'Cast resin insulated busbar window current transformer, 1600/5A, Class 0.5, 15VA burden', 'NOS', 660.00, 1600.00, 1, NULL, 50.00, 'IP20', 'Busbar Mount', 'IEC 61869-2', 1),

-- Capacitor 50 kvar RTR Energia
(10, 'CMP-CAP-50KVAR-RTR', N'RTR Energia 50 kvar 440V Heavy Duty Gas Filled Capacitor', 5, 9, 'POLT-440-50', 'POLT-HD 50kvar 440V 50Hz', N'3-phase self-healing heavy duty metalized polypropylene gas-filled capacitor, 50 kvar at 440V', 'NOS', 440.00, 65.60, 3, NULL, 50.00, 'IP20', 'Base Mount', 'IEC 60831-1/2', 1),

-- Detuned Reactor 50 kvar 7%
(11, 'CMP-REA-50KVAR-RTR', N'RTR 50 kvar 7% (189Hz) Detuned Harmonic Reactor', 6, 9, 'RTA-440-50-7', 'RTA 50kvar 7% 400/440V', N'Copper wound iron core detuned filter reactor, 7% p-factor, 189Hz resonance tuning', 'NOS', 400.00, 72.00, 3, NULL, 50.00, 'IP00', 'Base Mount', 'IEC 60076-6', 1),

-- Contactor 65A Lovato
(12, 'CMP-CON-65A-LOV', N'Lovato 65A AC-3 3P 230V AC Contactor', 4, 7, 'BF6500A230', 'BF65 00 A 230', N'Three-pole contactor, 65A AC-3 (30kW at 400V), 230VAC 50/60Hz control coil', 'NOS', 415.00, 65.00, 3, NULL, 50.00, 'IP20', 'DIN Rail / Base', 'IEC 60947-4-1', 1);

SET IDENTITY_INSERT master.Components OFF;
GO

-- 6. Seed Component Specifications
INSERT INTO master.ComponentSpecifications (ComponentID, SpecificationName, SpecificationValue, Unit)
VALUES
(1, 'Trip Unit', 'Ekip Touch LSI', NULL),
(1, 'Short-circuit Icu', '66', 'kA'),
(1, 'Service Breaking Ics', '100% Icu', NULL),
(1, 'Terminal Orientation', 'Rear Horizontal', NULL),
(1, 'Motor Operating Mechanism', '220-250V AC/DC', NULL),

(2, 'Trip Unit', 'Micrologic 5.0X', NULL),
(2, 'Protection Class', 'LSI (Long, Short, Instantaneous)', NULL),
(2, 'Icu at 415V', '66', 'kA'),
(2, 'Neutral Protection', '100%', NULL),
(2, 'Communication', 'Modbus TCP / RTU Embedded', NULL),

(3, 'Trip Unit', 'Micrologic 2.3', NULL),
(3, 'Thermal Adjustment Ir', '160A - 400A', NULL),
(3, 'Short-time Pickup Isd', '1.5 - 10 x Ir', NULL),

(8, 'Accuracy Class', 'Class 0.5S (Active Energy)', NULL),
(8, 'Harmonics Range', 'Up to 31st Harmonic THD', NULL),
(8, 'Communication Protocol', 'Modbus RTU RS485 (2-wire)', NULL),

(10, 'Rated kvar at 400V', '41.3', 'kvar'),
(10, 'Rated kvar at 440V', '50.0', 'kvar'),
(10, 'Dielectric Losses', '< 0.2', 'W/kvar'),
(10, 'Overcurrent Withstand', '1.5 x In Continuous', NULL);
GO

-- 7. Seed Supplier Prices (Including historical progression showing real price updates)
SET IDENTITY_INSERT pricing.SupplierPrices ON;

INSERT INTO pricing.SupplierPrices 
(SupplierPriceID, ComponentID, SupplierID, SupplierPartNumber, Currency, ListPrice, DiscountPercent, MinimumQuantity, LeadTimeDays, PriceDate, ValidUntil, QuotationReference, Notes, IsCurrent, CreatedBy)
VALUES
-- ABB 1600A ACB - Historical price #1 (Q1 2026)
(1, 1, 1, 'ABB-E22N16-W', 'AED', 16200.00, 18.000, 1, 21, '2026-01-10', '2026-04-30', 'QT-AG-2026-014', 'Initial tender agreement rate', 0, 'ramesh.k'),

-- ABB 1600A ACB - Historical price #2 (Q2 2026)
(2, 1, 1, 'ABB-E22N16-W', 'AED', 16800.00, 18.000, 1, 21, '2026-05-01', '2026-07-31', 'QT-AG-2026-442', 'Copper surcharge adjusted', 0, 'ramesh.k'),

-- ABB 1600A ACB - Current Active Price (Q3 2026)
(3, 1, 1, 'ABB-E22N16-W', 'AED', 17400.00, 19.500, 1, 21, '2026-08-01', '2026-12-31', 'QT-AG-2026-891', 'Annual volume frame contract', 1, 'ramesh.k'),

-- Schneider MTZ2 2500A ACB - Current Price
(4, 2, 2, 'SCH-MTZ2-25H1-4P', 'AED', 28500.00, 22.000, 1, 28, '2026-07-15', '2026-12-31', 'QT-DAN-8831', 'Includes cradle, motor and trip unit', 1, 'mustafa.h'),

-- Schneider NSX400F 400A MCCB - Current Price
(5, 3, 2, 'SCH-LV432676', 'AED', 2450.00, 28.000, 1, 7, '2026-06-10', '2026-12-31', 'QT-DAN-8831', 'Stock item in Jebel Ali warehouse', 1, 'mustafa.h'),

-- ABB XT4N 250A MCCB - Current Price
(6, 4, 1, 'ABB-XT4N-250', 'AED', 1620.00, 25.000, 1, 5, '2026-05-20', '2026-12-31', 'QT-AG-2026-512', 'Readily available ex-stock', 1, 'ramesh.k'),

-- Siemens 3VA11 160A MCCB - Current Price
(7, 5, 3, 'SIE-3VA1116', 'AED', 980.00, 30.000, 2, 10, '2026-07-01', '2026-12-31', 'QT-BG-2026-118', 'Sentron range discount applied', 1, 'sanjay.v'),

-- Hager 32A 3P MCB - Current Price
(8, 6, 2, 'HAG-NC332A', 'AED', 54.00, 35.000, 12, 3, '2026-06-01', '2026-12-31', 'QT-DAN-9104', 'Box pack of 12 pcs', 1, 'mustafa.h'),

-- Hager 20A 1P MCB - Current Price
(9, 7, 2, 'HAG-NC120A', 'AED', 16.50, 38.000, 24, 3, '2026-06-01', '2026-12-31', 'QT-DAN-9104', 'High volume small power protection', 1, 'mustafa.h'),

-- Schneider PM5350 Digital Meter - Current Price
(10, 8, 4, 'SCH-PM5350-RS', 'AED', 1420.00, 15.000, 1, 14, '2026-07-10', '2026-12-31', 'QT-GED-4412', 'Class 0.5S DEWA approved model', 1, 'david.h'),

-- CT 1600/5A - Current Price
(11, 9, 3, 'CT-BB-1600-5-CL05', 'AED', 260.00, 20.000, 3, 7, '2026-05-15', '2026-12-31', 'QT-BG-2026-089', 'ASTA certified measuring class', 1, 'sanjay.v'),

-- RTR 50 kvar Capacitor - Current Price
(12, 10, 4, 'RTR-POLT-440-50', 'AED', 820.00, 18.000, 2, 21, '2026-06-25', '2026-12-31', 'QT-GED-4490', 'Heavy duty 440V rating', 1, 'david.h'),

-- RTR 50 kvar Detuned Reactor - Current Price
(13, 11, 4, 'RTR-RTA-440-50-7', 'AED', 1250.00, 16.000, 1, 28, '2026-06-25', '2026-12-31', 'QT-GED-4490', 'Pure copper windings with thermal probe', 1, 'david.h'),

-- Lovato 65A Contactor - Current Price
(14, 12, 1, 'LOV-BF6500A230', 'AED', 310.00, 24.000, 2, 7, '2026-06-18', '2026-12-31', 'QT-AG-2026-621', 'AC-3 duty contactor 230V coil', 1, 'ramesh.k');

SET IDENTITY_INSERT pricing.SupplierPrices OFF;
GO

-- 8. Seed Labour & Fabrication Rates
SET IDENTITY_INSERT pricing.LabourRates ON;

INSERT INTO pricing.LabourRates 
(LabourRateID, ActivityCode, ActivityName, Category, RatePerHour, Currency, EffectiveFrom, EffectiveTo, IsActive)
VALUES
(1, 'LAB-PANEL-ASSY', N'Switchboard Cubicle Mechanical Assembly', 'Assembly', 45.00, 'AED', '2026-01-01', NULL, 1),
(2, 'LAB-BUSBAR-FAB', N'Copper Busbar Cutting, Punching & Bending', 'Copper', 65.00, 'AED', '2026-01-01', NULL, 1),
(3, 'LAB-POWER-WIRING', N'Main Power Cable Gland & Termination', 'Wiring', 50.00, 'AED', '2026-01-01', NULL, 1),
(4, 'LAB-CTRL-WIRING', N'Control, Protection & Metering Harness Wiring', 'Wiring', 48.00, 'AED', '2026-01-01', NULL, 1),
(5, 'LAB-ROUTINE-TEST', N'Factory Routine Testing, Insulation & HV Test', 'Testing', 80.00, 'AED', '2026-01-01', NULL, 1),
(6, 'LAB-CLIENT-FAT', N'Witnessed Factory Acceptance Test (FAT)', 'Testing', 120.00, 'AED', '2026-01-01', NULL, 1),
(7, 'LAB-ENG-DESIGN', N'AutoCAD Single Line Diagram & Shop Drawing', 'Engineering', 95.00, 'AED', '2026-01-01', NULL, 1);

SET IDENTITY_INSERT pricing.LabourRates OFF;
GO

-- 9. Initial Audit Trail Entries
INSERT INTO audit.AuditLog (UserID, TableName, RecordID, Action, OldValue, NewValue)
VALUES
('system', 'pricing.SupplierPrices', '1', 'INSERT_PRICE', NULL, 'PriceID:1|ListPrice:16200.00|Discount%:18.000|NetPrice:13284.00|Ref:QT-AG-2026-014'),
('ramesh.k', 'pricing.SupplierPrices', '2', 'PRICE_REVISION', 'PriceID:1|ListPrice:16200.00|NetPrice:13284.00', 'PriceID:2|ListPrice:16800.00|Discount%:18.000|NetPrice:13776.00|Ref:QT-AG-2026-442'),
('ramesh.k', 'pricing.SupplierPrices', '3', 'PRICE_REVISION', 'PriceID:2|ListPrice:16800.00|NetPrice:13776.00', 'PriceID:3|ListPrice:17400.00|Discount%:19.500|NetPrice:14007.00|Ref:QT-AG-2026-891');
GO

PRINT 'Comprehensive seed data inserted successfully.';
GO
