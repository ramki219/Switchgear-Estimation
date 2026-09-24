-- ============================================================================
-- LV Switchgear Estimator - Master Data DDL
-- Engine: Microsoft SQL Server
-- Schema: master, pricing
-- ============================================================================

USE [LVSwitchgearEstimator];
GO

-- 1. Manufacturers (OEMs)
IF OBJECT_ID(N'master.Manufacturers', N'U') IS NULL
BEGIN
    CREATE TABLE master.Manufacturers
    (
        ManufacturerID INT IDENTITY(1,1) PRIMARY KEY,
        ManufacturerCode VARCHAR(30) NOT NULL UNIQUE,
        ManufacturerName NVARCHAR(100) NOT NULL,
        Country NVARCHAR(100) NULL,
        Website NVARCHAR(250) NULL,
        ContactEmail NVARCHAR(150) NULL,
        ContactPhone NVARCHAR(50) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

-- 2. Component Categories
IF OBJECT_ID(N'master.ComponentCategories', N'U') IS NULL
BEGIN
    CREATE TABLE master.ComponentCategories
    (
        CategoryID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryCode VARCHAR(30) NOT NULL UNIQUE,
        CategoryName NVARCHAR(100) NOT NULL,
        ParentCategoryID INT NULL,
        Description NVARCHAR(250) NULL,
        DefaultIECStandard VARCHAR(100) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_Category_Parent
            FOREIGN KEY (ParentCategoryID)
            REFERENCES master.ComponentCategories(CategoryID)
    );
END
GO

-- 3. Components Master
IF OBJECT_ID(N'master.Components', N'U') IS NULL
BEGIN
    CREATE TABLE master.Components
    (
        ComponentID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ComponentCode VARCHAR(50) NOT NULL UNIQUE,
        ComponentName NVARCHAR(200) NOT NULL,
        CategoryID INT NOT NULL,
        ManufacturerID INT NOT NULL,
        PartNumber NVARCHAR(150) NOT NULL,
        Model NVARCHAR(150) NULL,
        Description NVARCHAR(500) NULL,
        Unit VARCHAR(20) NOT NULL DEFAULT 'NOS',
        
        -- Electrical & Mechanical Characteristics
        RatedVoltage DECIMAL(10,2) NULL,        -- e.g., 415.00 V
        RatedCurrent DECIMAL(10,2) NULL,        -- e.g., 1600.00 A
        Poles INT NULL,                         -- 1, 2, 3, 4
        BreakingCapacity DECIMAL(10,2) NULL,    -- Icu in kA at rated voltage (e.g. 50, 65, 85 kA)
        Frequency DECIMAL(6,2) NULL DEFAULT 50.00, -- Hz (50Hz or 60Hz)
        IPRating VARCHAR(20) NULL,              -- e.g., IP20, IP42, IP54, IP65
        MountingType VARCHAR(50) NULL,          -- Drawout, Fixed, DIN Rail, Base Mount
        IECStandard VARCHAR(100) NULL,          -- e.g., IEC 60947-2, IEC 61439-1/2

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,

        CONSTRAINT FK_Component_Category
            FOREIGN KEY(CategoryID)
            REFERENCES master.ComponentCategories(CategoryID),

        CONSTRAINT FK_Component_Manufacturer
            FOREIGN KEY(ManufacturerID)
            REFERENCES master.Manufacturers(ManufacturerID)
    );

    CREATE NONCLUSTERED INDEX IX_Components_CategoryID ON master.Components(CategoryID);
    CREATE NONCLUSTERED INDEX IX_Components_ManufacturerID ON master.Components(ManufacturerID);
    CREATE NONCLUSTERED INDEX IX_Components_RatedCurrent ON master.Components(RatedCurrent);
    CREATE NONCLUSTERED INDEX IX_Components_BreakingCapacity ON master.Components(BreakingCapacity);
    CREATE NONCLUSTERED INDEX IX_Components_PartNumber ON master.Components(PartNumber);
END
GO

-- 4. Component Technical Specifications (EAV for dynamic rating attributes)
IF OBJECT_ID(N'master.ComponentSpecifications', N'U') IS NULL
BEGIN
    CREATE TABLE master.ComponentSpecifications
    (
        SpecificationID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ComponentID BIGINT NOT NULL,
        SpecificationName NVARCHAR(100) NOT NULL,  -- e.g. 'Trip Unit', 'Protection', 'Ics (% Icu)', 'Coil Voltage'
        SpecificationValue NVARCHAR(200) NOT NULL, -- e.g. 'Ekip Touch', 'LSIG', '100%', '230V AC'
        Unit VARCHAR(30) NULL,                    -- e.g. 'kA', 'ms', 'kvar'
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_Specification_Component
            FOREIGN KEY(ComponentID)
            REFERENCES master.Components(ComponentID) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_ComponentSpecs_ComponentID ON master.ComponentSpecifications(ComponentID);
END
GO

-- 5. Suppliers
IF OBJECT_ID(N'master.Suppliers', N'U') IS NULL
BEGIN
    CREATE TABLE master.Suppliers
    (
        SupplierID INT IDENTITY(1,1) PRIMARY KEY,
        SupplierCode VARCHAR(30) NOT NULL UNIQUE,
        SupplierName NVARCHAR(200) NOT NULL,
        ContactPerson NVARCHAR(150) NULL,
        Email NVARCHAR(200) NULL,
        Phone NVARCHAR(50) NULL,
        Address NVARCHAR(300) NULL,
        City NVARCHAR(100) NULL,
        Country NVARCHAR(100) DEFAULT 'United Arab Emirates',
        Currency VARCHAR(10) NOT NULL DEFAULT 'AED',
        PaymentTerms NVARCHAR(200) DEFAULT '30 Days Net',
        CreditLimit DECIMAL(18,2) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

-- 6. Panel Types
IF OBJECT_ID(N'master.PanelTypes', N'U') IS NULL
BEGIN
    CREATE TABLE master.PanelTypes
    (
        PanelTypeID INT IDENTITY(1,1) PRIMARY KEY,
        PanelTypeCode VARCHAR(30) NOT NULL UNIQUE,
        PanelTypeName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        DefaultFormOfSeparation VARCHAR(50) DEFAULT 'Form 4b Type 6',
        DefaultIPRating VARCHAR(20) DEFAULT 'IP54',
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- 7. Panel Templates
IF OBJECT_ID(N'master.PanelTemplates', N'U') IS NULL
BEGIN
    CREATE TABLE master.PanelTemplates
    (
        PanelTemplateID INT IDENTITY(1,1) PRIMARY KEY,
        PanelTypeID INT NOT NULL,
        TemplateCode VARCHAR(50) NOT NULL UNIQUE,
        TemplateName NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500) NULL,
        IncomerRating DECIMAL(10,2) NULL,
        FaultRating DECIMAL(10,2) NULL,
        FormOfSeparation VARCHAR(50) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_PanelTemplate_PanelType
            FOREIGN KEY(PanelTypeID)
            REFERENCES master.PanelTypes(PanelTypeID)
    );
END
GO

-- 8. Labour & Fabrication Rates
IF OBJECT_ID(N'pricing.LabourRates', N'U') IS NULL
BEGIN
    CREATE TABLE pricing.LabourRates
    (
        LabourRateID INT IDENTITY(1,1) PRIMARY KEY,
        ActivityCode VARCHAR(50) NOT NULL UNIQUE,
        ActivityName NVARCHAR(200) NOT NULL,
        Category VARCHAR(50) NOT NULL, -- Fabrication, Assembly, Copper, Wiring, Testing, Engineering
        RatePerHour DECIMAL(18,2) NOT NULL,
        Currency VARCHAR(10) NOT NULL DEFAULT 'AED',
        EffectiveFrom DATE NOT NULL,
        EffectiveTo DATE NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

PRINT 'Master data tables created successfully.';
GO
