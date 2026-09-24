-- ============================================================================
-- LV Switchgear Estimator - Pricing, Estimation, BOM, Sales & Audit DDL
-- Engine: Microsoft SQL Server
-- Schemas: pricing, est, bom, sales, audit
-- ============================================================================

USE [LVSwitchgearEstimator];
GO

-- 1. Supplier Prices (Strict Historical Tracking - Never Overwrite)
IF OBJECT_ID(N'pricing.SupplierPrices', N'U') IS NULL
BEGIN
    CREATE TABLE pricing.SupplierPrices
    (
        SupplierPriceID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ComponentID BIGINT NOT NULL,
        SupplierID INT NOT NULL,
        SupplierPartNumber NVARCHAR(150) NULL,
        Currency VARCHAR(10) NOT NULL DEFAULT 'AED',
        ListPrice DECIMAL(18,2) NOT NULL,
        DiscountPercent DECIMAL(8,3) NOT NULL DEFAULT 0.000,

        -- Net Price is deterministic computed column
        NetPrice AS (CAST(ListPrice * (1.0 - (ISNULL(DiscountPercent, 0.0) / 100.0)) AS DECIMAL(18,2))) PERSISTED,

        MinimumQuantity DECIMAL(18,3) NOT NULL DEFAULT 1.000,
        LeadTimeDays INT NULL DEFAULT 14,
        PriceDate DATE NOT NULL,
        ValidUntil DATE NULL,
        QuotationReference NVARCHAR(100) NULL,
        Notes NVARCHAR(500) NULL,
        IsCurrent BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CreatedBy VARCHAR(100) NULL DEFAULT 'system',

        CONSTRAINT FK_SupplierPrices_Component
            FOREIGN KEY(ComponentID)
            REFERENCES master.Components(ComponentID),

        CONSTRAINT FK_SupplierPrices_Supplier
            FOREIGN KEY(SupplierID)
            REFERENCES master.Suppliers(SupplierID)
    );

    CREATE NONCLUSTERED INDEX IX_SupplierPrices_ComponentID ON pricing.SupplierPrices(ComponentID, IsCurrent);
    CREATE NONCLUSTERED INDEX IX_SupplierPrices_SupplierID ON pricing.SupplierPrices(SupplierID);
    CREATE NONCLUSTERED INDEX IX_SupplierPrices_PriceDate ON pricing.SupplierPrices(PriceDate DESC);
END
GO

-- 2. Estimates Master
IF OBJECT_ID(N'est.Estimates', N'U') IS NULL
BEGIN
    CREATE TABLE est.Estimates
    (
        EstimateID BIGINT IDENTITY(1,1) PRIMARY KEY,
        EstimateNumber VARCHAR(50) NOT NULL UNIQUE,
        ProjectName NVARCHAR(250) NOT NULL,
        ClientName NVARCHAR(250) NOT NULL,
        ConsultantName NVARCHAR(250) NULL,
        Authority NVARCHAR(100) NULL, -- DEWA, SEWA, ADDC, AADC, Kahramaa, SEC
        Revision INT NOT NULL DEFAULT 0,
        EstimateDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        Status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, ESTIMATED, UNDER_REVIEW, APPROVED, CANCELLED
        
        -- Calculated Costs Base
        MaterialCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        BusbarCopperCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        EnclosureCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        LabourCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        EngineeringCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        TestingCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        OverheadCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        TransportCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        ContingencyCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,

        TotalCost AS (MaterialCost + BusbarCopperCost + EnclosureCost + LabourCost + EngineeringCost + TestingCost + OverheadCost + TransportCost + ContingencyCost) PERSISTED,

        MarginPercent DECIMAL(8,3) NOT NULL DEFAULT 15.000,
        SellingPrice DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        VATPercent DECIMAL(8,3) NOT NULL DEFAULT 5.000,
        VATAmount AS (CAST(SellingPrice * (VATPercent / 100.0) AS DECIMAL(18,2))) PERSISTED,
        GrandTotal AS (CAST(SellingPrice * (1.0 + (VATPercent / 100.0)) AS DECIMAL(18,2))) PERSISTED,

        Currency VARCHAR(10) NOT NULL DEFAULT 'AED',
        CreatedBy VARCHAR(100) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

-- 3. Estimate Panels
IF OBJECT_ID(N'est.EstimatePanels', N'U') IS NULL
BEGIN
    CREATE TABLE est.EstimatePanels
    (
        EstimatePanelID BIGINT IDENTITY(1,1) PRIMARY KEY,
        EstimateID BIGINT NOT NULL,
        PanelTypeID INT NOT NULL,
        PanelTag VARCHAR(100) NOT NULL, -- e.g. MDB-01, SMDB-G-01, MCC-01
        PanelDescription NVARCHAR(500) NULL,
        Quantity INT NOT NULL DEFAULT 1,
        RatedCurrent DECIMAL(10,2) NULL, -- Incomer Ampere rating
        RatedVoltage DECIMAL(10,2) NOT NULL DEFAULT 415.00,
        ShortCircuitRating DECIMAL(10,2) NULL, -- kA for 1 sec
        FormOfSeparation VARCHAR(50) NULL, -- Form 2b, Form 3b, Form 4b Type 6
        IPRating VARCHAR(20) NOT NULL DEFAULT 'IP54',
        EnclosureMaterial VARCHAR(50) NOT NULL DEFAULT 'Sheet Steel (2.0mm)',
        BusbarRating DECIMAL(10,2) NULL,
        PanelMaterialCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        PanelLabourCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,

        CONSTRAINT FK_EstimatePanels_Estimate
            FOREIGN KEY(EstimateID)
            REFERENCES est.Estimates(EstimateID) ON DELETE CASCADE,

        CONSTRAINT FK_EstimatePanels_PanelType
            FOREIGN KEY(PanelTypeID)
            REFERENCES master.PanelTypes(PanelTypeID)
    );
END
GO

-- 4. Estimate Items (Line items for each panel)
IF OBJECT_ID(N'est.EstimateItems', N'U') IS NULL
BEGIN
    CREATE TABLE est.EstimateItems
    (
        EstimateItemID BIGINT IDENTITY(1,1) PRIMARY KEY,
        EstimatePanelID BIGINT NOT NULL,
        ComponentID BIGINT NOT NULL,
        ItemCategory VARCHAR(50) NULL, -- Incomer, Outgoing, Metering, Control, Busbar, Accessories
        ItemDescription NVARCHAR(500) NULL,
        Quantity DECIMAL(18,3) NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL,
        DiscountPercent DECIMAL(8,3) NOT NULL DEFAULT 0.000,
        ExtendedCost AS (CAST(Quantity * UnitPrice * (1.0 - (DiscountPercent / 100.0)) AS DECIMAL(18,2))) PERSISTED,
        SourcePriceID BIGINT NULL,
        Remarks NVARCHAR(250) NULL,

        CONSTRAINT FK_EstimateItems_EstimatePanel
            FOREIGN KEY(EstimatePanelID)
            REFERENCES est.EstimatePanels(EstimatePanelID) ON DELETE CASCADE,

        CONSTRAINT FK_EstimateItems_Component
            FOREIGN KEY(ComponentID)
            REFERENCES master.Components(ComponentID),

        CONSTRAINT FK_EstimateItems_SourcePrice
            FOREIGN KEY(SourcePriceID)
            REFERENCES pricing.SupplierPrices(SupplierPriceID)
    );
END
GO

-- 5. Bill of Materials (BOM)
IF OBJECT_ID(N'bom.BOMHeaders', N'U') IS NULL
BEGIN
    CREATE TABLE bom.BOMHeaders
    (
        BOMID BIGINT IDENTITY(1,1) PRIMARY KEY,
        EstimateID BIGINT NOT NULL,
        BOMNumber VARCHAR(50) NOT NULL UNIQUE,
        Revision INT NOT NULL DEFAULT 0,
        TotalItems INT NOT NULL DEFAULT 0,
        TotalBOMCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        GeneratedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_BOMHeaders_Estimate
            FOREIGN KEY(EstimateID)
            REFERENCES est.Estimates(EstimateID)
    );
END
GO

IF OBJECT_ID(N'bom.BOMItems', N'U') IS NULL
BEGIN
    CREATE TABLE bom.BOMItems
    (
        BOMItemID BIGINT IDENTITY(1,1) PRIMARY KEY,
        BOMID BIGINT NOT NULL,
        ComponentID BIGINT NOT NULL,
        ItemNo INT NOT NULL,
        Description NVARCHAR(500) NOT NULL,
        Quantity DECIMAL(18,3) NOT NULL,
        Unit VARCHAR(20) NOT NULL,
        UnitCost DECIMAL(18,2) NOT NULL,
        TotalCost AS (CAST(Quantity * UnitCost AS DECIMAL(18,2))) PERSISTED,
        ProcurementStatus VARCHAR(30) NOT NULL DEFAULT 'PENDING_ORDER', -- PENDING_ORDER, ORDERED, IN_STOCK

        CONSTRAINT FK_BOMItems_BOMHeader
            FOREIGN KEY(BOMID)
            REFERENCES bom.BOMHeaders(BOMID) ON DELETE CASCADE,

        CONSTRAINT FK_BOMItems_Component
            FOREIGN KEY(ComponentID)
            REFERENCES master.Components(ComponentID)
    );
END
GO

-- 6. Commercial Quotations
IF OBJECT_ID(N'sales.Quotations', N'U') IS NULL
BEGIN
    CREATE TABLE sales.Quotations
    (
        QuotationID BIGINT IDENTITY(1,1) PRIMARY KEY,
        QuotationNumber VARCHAR(50) NOT NULL UNIQUE,
        EstimateID BIGINT NOT NULL,
        Revision INT NOT NULL DEFAULT 0,
        QuotationDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        ValidUntilDate DATE NULL,
        Currency VARCHAR(10) NOT NULL DEFAULT 'AED',
        SubTotal DECIMAL(18,2) NOT NULL,
        DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        NetTotal AS (SubTotal - DiscountAmount) PERSISTED,
        VATPercent DECIMAL(8,3) NOT NULL DEFAULT 5.000,
        VATAmount AS (CAST((SubTotal - DiscountAmount) * (VATPercent / 100.0) AS DECIMAL(18,2))) PERSISTED,
        GrandTotal AS (CAST((SubTotal - DiscountAmount) * (1.0 + (VATPercent / 100.0)) AS DECIMAL(18,2))) PERSISTED,
        PaymentTerms NVARCHAR(300) DEFAULT '10% Advance, 90% against Delivery / Proforma',
        DeliveryTerms NVARCHAR(300) DEFAULT '6-8 Weeks from technically & commercially clear order',
        Warranty NVARCHAR(300) DEFAULT '12 months from date of commissioning or 18 months from delivery',
        Status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, REVISED, WON, LOST
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_Quotations_Estimate
            FOREIGN KEY(EstimateID)
            REFERENCES est.Estimates(EstimateID)
    );
END
GO

-- 7. Audit Trail (Tracking changes across all critical engineering master & pricing tables)
IF OBJECT_ID(N'audit.AuditLog', N'U') IS NULL
BEGIN
    CREATE TABLE audit.AuditLog
    (
        AuditID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID VARCHAR(100) NULL,
        TableName VARCHAR(100) NOT NULL,
        RecordID VARCHAR(100) NOT NULL,
        Action VARCHAR(30) NOT NULL, -- INSERT, UPDATE, DELETE, PRICE_REVISION, STATUS_CHANGE
        OldValue NVARCHAR(MAX) NULL,
        NewValue NVARCHAR(MAX) NULL,
        IpAddress VARCHAR(50) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE NONCLUSTERED INDEX IX_AuditLog_TableRecord ON audit.AuditLog(TableName, RecordID);
    CREATE NONCLUSTERED INDEX IX_AuditLog_CreatedAt ON audit.AuditLog(CreatedAt DESC);
END
GO

PRINT 'Pricing, Estimation, BOM, Sales and Audit tables created successfully.';
GO
