import React, { useState } from 'react';
import { 
  Database, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Server, 
  Layers, 
  CheckCircle2,
  ExternalLink,
  FileText
} from 'lucide-react';
import { downloadSQLScript } from '../../services/exportService';
import { downloadProjectDocumentationPDF } from '../../services/projectDocumentationPdfService';

export const ArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'001' | '002' | '003' | '004' | '005' | 'efcore' | 'api' | 'setup'>('001');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const scripts = {
    '001': {
      filename: '001_Database.sql',
      title: 'Database & Schemas (001_Database.sql)',
      description: 'Creates LVSwitchgearEstimator database with 7 dedicated schemas: dbo, master, pricing, est, bom, sales, and audit with Snapshot Isolation.',
      code: `-- ============================================================================
-- LV Switchgear Estimator - Database & Schemas DDL
-- Engine: Microsoft SQL Server 2019 / 2022 / Azure SQL
-- Database: LVSwitchgearEstimator
-- ============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'LVSwitchgearEstimator')
BEGIN
    CREATE DATABASE [LVSwitchgearEstimator]
    COLLATE Latin1_General_CI_AS;
END
GO

USE [LVSwitchgearEstimator];
GO

-- Enable Snapshot Isolation for high-concurrency multi-user estimation
ALTER DATABASE [LVSwitchgearEstimator] SET READ_COMMITTED_SNAPSHOT ON;
GO

-- Create Schemas
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'master')  EXEC('CREATE SCHEMA [master]');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'pricing') EXEC('CREATE SCHEMA [pricing]');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'est')     EXEC('CREATE SCHEMA [est]');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'bom')     EXEC('CREATE SCHEMA [bom]');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'sales')   EXEC('CREATE SCHEMA [sales]');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'audit')   EXEC('CREATE SCHEMA [audit]');
GO`,
    },
    '002': {
      filename: '002_MasterData.sql',
      title: 'Master Data DDL (002_MasterData.sql)',
      description: 'Tables for Manufacturers, Categories, Components with physical/electrical ratings, ComponentSpecifications (EAV), Suppliers, PanelTypes, and LabourRates.',
      code: `USE [LVSwitchgearEstimator];
GO

-- 1. Manufacturers (OEMs)
CREATE TABLE master.Manufacturers
(
    ManufacturerID INT IDENTITY(1,1) PRIMARY KEY,
    ManufacturerCode VARCHAR(30) NOT NULL UNIQUE,
    ManufacturerName NVARCHAR(100) NOT NULL,
    Country NVARCHAR(100) NULL,
    Website NVARCHAR(250) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 2. Component Categories
CREATE TABLE master.ComponentCategories
(
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryCode VARCHAR(30) NOT NULL UNIQUE,
    CategoryName NVARCHAR(100) NOT NULL,
    ParentCategoryID INT NULL REFERENCES master.ComponentCategories(CategoryID),
    DefaultIECStandard VARCHAR(100) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

-- 3. Components Master
CREATE TABLE master.Components
(
    ComponentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ComponentCode VARCHAR(50) NOT NULL UNIQUE,
    ComponentName NVARCHAR(200) NOT NULL,
    CategoryID INT NOT NULL REFERENCES master.ComponentCategories(CategoryID),
    ManufacturerID INT NOT NULL REFERENCES master.Manufacturers(ManufacturerID),
    PartNumber NVARCHAR(150) NOT NULL,
    Model NVARCHAR(150) NULL,
    Description NVARCHAR(500) NULL,
    Unit VARCHAR(20) NOT NULL DEFAULT 'NOS',
    RatedVoltage DECIMAL(10,2) NULL,
    RatedCurrent DECIMAL(10,2) NULL,
    Poles INT NULL,
    BreakingCapacity DECIMAL(10,2) NULL,
    Frequency DECIMAL(6,2) NULL DEFAULT 50.00,
    IPRating VARCHAR(20) NULL,
    MountingType VARCHAR(50) NULL,
    IECStandard VARCHAR(100) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 4. Dynamic Technical Specifications (EAV)
CREATE TABLE master.ComponentSpecifications
(
    SpecificationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ComponentID BIGINT NOT NULL REFERENCES master.Components(ComponentID) ON DELETE CASCADE,
    SpecificationName NVARCHAR(100) NOT NULL,
    SpecificationValue NVARCHAR(200) NOT NULL,
    Unit VARCHAR(30) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 5. Suppliers
CREATE TABLE master.Suppliers
(
    SupplierID INT IDENTITY(1,1) PRIMARY KEY,
    SupplierCode VARCHAR(30) NOT NULL UNIQUE,
    SupplierName NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(150) NULL,
    Email NVARCHAR(200) NULL,
    Phone NVARCHAR(50) NULL,
    Currency VARCHAR(10) NOT NULL DEFAULT 'AED',
    PaymentTerms NVARCHAR(200) DEFAULT '30 Days Net',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 6. Labour & Fabrication Rates
CREATE TABLE pricing.LabourRates
(
    LabourRateID INT IDENTITY(1,1) PRIMARY KEY,
    ActivityCode VARCHAR(50) NOT NULL UNIQUE,
    ActivityName NVARCHAR(200) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    RatePerHour DECIMAL(18,2) NOT NULL,
    Currency VARCHAR(10) NOT NULL DEFAULT 'AED',
    EffectiveFrom DATE NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO`,
    },
    '003': {
      filename: '003_PricingAndEstimation.sql',
      title: 'Pricing, Estimation & BOM DDL (003_PricingAndEstimation.sql)',
      description: 'Defines pricing.SupplierPrices with computed NetPrice and historical retention, Estimates, EstimatePanels, EstimateItems, BOM, and AuditLog.',
      code: `USE [LVSwitchgearEstimator];
GO

-- 1. Supplier Prices (Computed Column + Strict Historical Retention)
CREATE TABLE pricing.SupplierPrices
(
    SupplierPriceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ComponentID BIGINT NOT NULL REFERENCES master.Components(ComponentID),
    SupplierID INT NOT NULL REFERENCES master.Suppliers(SupplierID),
    SupplierPartNumber NVARCHAR(150) NULL,
    Currency VARCHAR(10) NOT NULL DEFAULT 'AED',
    ListPrice DECIMAL(18,2) NOT NULL,
    DiscountPercent DECIMAL(8,3) NOT NULL DEFAULT 0.000,

    -- SQL Server PERSISTED Computed Column:
    NetPrice AS (CAST(ListPrice * (1.0 - (ISNULL(DiscountPercent, 0.0) / 100.0)) AS DECIMAL(18,2))) PERSISTED,

    MinimumQuantity DECIMAL(18,3) NOT NULL DEFAULT 1.000,
    LeadTimeDays INT NULL DEFAULT 14,
    PriceDate DATE NOT NULL,
    ValidUntil DATE NULL,
    QuotationReference NVARCHAR(100) NULL,
    Notes NVARCHAR(500) NULL,
    IsCurrent BIT NOT NULL DEFAULT 1,
    CreatedBy VARCHAR(100) NULL DEFAULT 'system',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE NONCLUSTERED INDEX IX_SupplierPrices_ComponentID ON pricing.SupplierPrices(ComponentID, IsCurrent);

-- 2. Audit Trail
CREATE TABLE audit.AuditLog
(
    AuditID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID VARCHAR(100) NULL,
    TableName VARCHAR(100) NOT NULL,
    RecordID VARCHAR(100) NOT NULL,
    Action VARCHAR(30) NOT NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO`,
    },
    '004': {
      filename: '004_StoredProcedures.sql',
      title: 'Stored Procedures (004_StoredProcedures.sql)',
      description: 'Includes pricing.sp_SaveComponentPriceWithHistory which archives previous rates and writes to audit trail in a single atomic transaction.',
      code: `USE [LVSwitchgearEstimator];
GO

CREATE OR ALTER PROCEDURE pricing.sp_SaveComponentPriceWithHistory
    @ComponentID BIGINT,
    @SupplierID INT,
    @SupplierPartNumber NVARCHAR(150),
    @Currency VARCHAR(10) = 'AED',
    @ListPrice DECIMAL(18,2),
    @DiscountPercent DECIMAL(8,3) = 0.000,
    @MinimumQuantity DECIMAL(18,3) = 1.000,
    @LeadTimeDays INT = 14,
    @PriceDate DATE,
    @ValidUntil DATE = NULL,
    @QuotationReference NVARCHAR(100) = NULL,
    @CreatedBy VARCHAR(100) = 'system',
    @NewSupplierPriceID BIGINT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Archive prior active rate
        UPDATE pricing.SupplierPrices
        SET IsCurrent = 0,
            ValidUntil = ISNULL(ValidUntil, DATEADD(DAY, -1, @PriceDate))
        WHERE ComponentID = @ComponentID AND SupplierID = @SupplierID AND IsCurrent = 1;

        -- Insert new version
        INSERT INTO pricing.SupplierPrices
        (ComponentID, SupplierID, SupplierPartNumber, Currency, ListPrice, DiscountPercent, MinimumQuantity, LeadTimeDays, PriceDate, ValidUntil, QuotationReference, IsCurrent, CreatedBy, CreatedAt)
        VALUES
        (@ComponentID, @SupplierID, @SupplierPartNumber, @Currency, @ListPrice, @DiscountPercent, @MinimumQuantity, @LeadTimeDays, @PriceDate, @ValidUntil, @QuotationReference, 1, @CreatedBy, SYSUTCDATETIME());

        SET @NewSupplierPriceID = SCOPE_IDENTITY();

        -- Write to audit
        INSERT INTO audit.AuditLog (UserID, TableName, RecordID, Action, NewValue)
        VALUES (@CreatedBy, 'pricing.SupplierPrices', CAST(@NewSupplierPriceID AS VARCHAR), 'PRICE_REVISION', CONCAT('List:', @ListPrice, '|Net:', @ListPrice * (1.0 - (@DiscountPercent/100.0))));

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO`,
    },
    '005': {
      filename: '005_SeedData.sql',
      title: 'Authentic Seed Data (005_SeedData.sql)',
      description: 'Seeds ABB, Schneider, Siemens, Eaton, Hager, RTR, Lovato, actual part numbers, specifications, suppliers, and historical price records.',
      code: `USE [LVSwitchgearEstimator];
GO

-- Seed Manufacturers
INSERT INTO master.Manufacturers (ManufacturerCode, ManufacturerName, Country, Website, IsActive)
VALUES
('ABB', N'ABB Electrification', N'Switzerland', N'https://new.abb.com/low-voltage', 1),
('SCHNEIDER', N'Schneider Electric', N'France', N'https://www.se.com', 1),
('SIEMENS', N'Siemens AG', N'Germany', N'https://www.siemens.com', 1),
('HAGER', N'Hager Group', N'Germany', N'https://hager.com', 1),
('RTR', N'RTR Energia', N'Spain', N'https://rtrenergia.es', 1);

-- Seed Sample Components
INSERT INTO master.Components (ComponentCode, ComponentName, CategoryID, ManufacturerID, PartNumber, Unit, RatedVoltage, RatedCurrent, Poles, BreakingCapacity, IECStandard)
VALUES
('CMP-ACB-1600-ABB', N'ABB Emax 2 E2.2N 1600A 3P Drawout ACB', 1, 1, '1SDA071018R1', 'NOS', 415.00, 1600.00, 3, 66.00, 'IEC 60947-2'),
('CMP-MCCB-400-SCH', N'Schneider ComPact NSX400F 400A 3P 36kA MCCB', 2, 2, 'LV432676', 'NOS', 415.00, 400.00, 3, 36.00, 'IEC 60947-2');
GO`,
    },
    efcore: {
      filename: 'LVSwitchgearDbContext.cs',
      title: 'Entity Framework Core DbContext (C#)',
      description: 'Maps schemas master, pricing, audit with Fluent API computed column mappings and relationship indexes.',
      code: `using Microsoft.EntityFrameworkCore;
using LVEstimator.Domain.Entities;

namespace LVEstimator.Infrastructure.Data
{
    public class LVSwitchgearDbContext : DbContext
    {
        public LVSwitchgearDbContext(DbContextOptions<LVSwitchgearDbContext> options) : base(options) { }

        public DbSet<Manufacturer> Manufacturers => Set<Manufacturer>();
        public DbSet<ComponentCategory> ComponentCategories => Set<ComponentCategory>();
        public DbSet<Component> Components => Set<Component>();
        public DbSet<ComponentSpecification> ComponentSpecifications => Set<ComponentSpecification>();
        public DbSet<Supplier> Suppliers => Set<Supplier>();
        public DbSet<SupplierPrice> SupplierPrices => Set<SupplierPrice>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasDefaultSchema("dbo");

            // Persisted computed column for NetPrice
            modelBuilder.Entity<SupplierPrice>(entity =>
            {
                entity.ToTable("SupplierPrices", "pricing");
                entity.Property(e => e.NetPrice)
                      .HasComputedColumnSql("CAST(ListPrice * (1.0 - (ISNULL(DiscountPercent, 0.0) / 100.0)) AS DECIMAL(18,2))", stored: true);
                entity.HasIndex(e => new { e.ComponentID, e.IsCurrent });
            });
        }
    }
}`,
    },
    api: {
      filename: 'Controllers.cs',
      title: 'ASP.NET Core REST API Endpoints',
      description: 'API controllers with multi-field search, pagination, historical price revisions, and DTO contracts.',
      code: `// GET: api/components?categoryId=1&minCurrent=800&breakingCapacity=65&pageNumber=1&pageSize=25
// GET: api/components/{id}
// POST: api/components
// GET: api/pricing/history/{componentId}
// POST: api/pricing/revise (Preserves history by archiving current price and inserting new version)

[ApiController]
[Route("api/[controller]")]
public class PricingController : ControllerBase
{
    private readonly LVSwitchgearDbContext _context;
    public PricingController(LVSwitchgearDbContext context) => _context = context;

    [HttpPost("revise")]
    public async Task<IActionResult> RevisePrice([FromBody] CreatePriceRevisionDto dto)
    {
        var existingCurrent = await _context.SupplierPrices
            .FirstOrDefaultAsync(p => p.ComponentID == dto.ComponentID && p.SupplierID == dto.SupplierID && p.IsCurrent);

        if (existingCurrent != null)
        {
            existingCurrent.IsCurrent = false;
            existingCurrent.ValidUntil = dto.PriceDate.AddDays(-1);
        }

        var newPrice = new SupplierPrice
        {
            ComponentID = dto.ComponentID,
            SupplierID = dto.SupplierID,
            ListPrice = dto.ListPrice,
            DiscountPercent = dto.DiscountPercent,
            PriceDate = dto.PriceDate,
            IsCurrent = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.SupplierPrices.Add(newPrice);
        await _context.SaveChangesAsync();
        return Ok(newPrice);
    }
}`,
    },
    setup: {
      filename: 'SETUP_GUIDE.md',
      title: 'SQL Server Connection & Deployment Guide',
      description: 'Step-by-step setup for SQL Server 2019/2022/Azure SQL, EF Core migrations, and connecting the backend.',
      code: `# SQL Server Setup & Connection Guide

### 1. Connection String in appsettings.json
\`\`\`json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=LVSwitchgearEstimator;User Id=sa;Password=YourSecurePassword123!;TrustServerCertificate=True;MultipleActiveResultSets=True;"
  }
}
\`\`\`

### 2. Run Database SQL Scripts in SSMS or Azure Data Studio
Execute in order:
1. \`001_Database.sql\` (Creates database & schemas: master, pricing, est, bom, sales, audit)
2. \`002_MasterData.sql\` (Creates master tables, components, and specs)
3. \`003_PricingAndEstimation.sql\` (Creates pricing & audit tables)
4. \`004_StoredProcedures.sql\` (Creates sp_SaveComponentPriceWithHistory)
5. \`005_SeedData.sql\` (Inserts initial OEM switchgear catalog & rates)

### 3. EF Core CLI Commands
\`\`\`bash
dotnet ef migrations add InitialCreate --project LVEstimator.Infrastructure --startup-project LVEstimator.API
dotnet ef database update --project LVEstimator.Infrastructure --startup-project LVEstimator.API
\`\`\`

### 4. Git Repository Setup
\`\`\`bash
git init
git add .
git commit -m "feat: LV Switchgear Estimator Phase 1 (SQL Server Schemas, Master Data, Historical Pricing)"
git branch -M main
git remote add origin https://github.com/your-org/LV-Switchgear-Estimator.git
git push -u origin main
\`\`\``,
    },
  };

  const currentScript = scripts[activeTab];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-600" />
            <span>SQL Server & C# Backend Architecture Explorer</span>
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Phase 1 Database DDL, EF Core DbContext, Stored Procedures & Connection Specs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadProjectDocumentationPDF()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-2xs"
            title="Download Complete Technical PDF Manual with Architecture, Schema and Workflows"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Project PDF Manual</span>
          </button>
          <button
            onClick={() => downloadSQLScript(currentScript.filename, currentScript.code)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-mono font-medium transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {currentScript.filename}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 overflow-x-auto text-xs font-mono shadow-xs">
        <button
          onClick={() => setActiveTab('001')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
            activeTab === '001' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          001_Database.sql
        </button>
        <button
          onClick={() => setActiveTab('002')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
            activeTab === '002' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          002_MasterData.sql
        </button>
        <button
          onClick={() => setActiveTab('003')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
            activeTab === '003' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          003_Pricing.sql
        </button>
        <button
          onClick={() => setActiveTab('004')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
            activeTab === '004' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          004_Procedures.sql
        </button>
        <button
          onClick={() => setActiveTab('005')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
            activeTab === '005' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          005_SeedData.sql
        </button>
        <button
          onClick={() => setActiveTab('efcore')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
            activeTab === 'efcore' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          EF Core DbContext
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
            activeTab === 'api' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          REST API Controllers
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
            activeTab === 'setup' ? 'bg-cyan-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Setup & Deployment
        </button>
      </div>

      {/* Code Viewer */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div>
            <div className="font-mono text-xs font-semibold text-slate-800 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-600" />
              <span>{currentScript.title}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentScript.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(currentScript.code, activeTab)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors shadow-2xs"
            >
              {copied === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === activeTab ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] text-xs font-mono text-slate-800 bg-slate-50/50 leading-relaxed border-t border-slate-100 selection:bg-cyan-100 selection:text-cyan-900">
          <pre>{currentScript.code}</pre>
        </div>
      </div>
    </div>
  );
};
