-- ============================================================================
-- LV Switchgear Estimator - Database Initialization Script
-- Engine: Microsoft SQL Server 2019 / 2022 / Azure SQL Database
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

-- ============================================================================
-- SCHEMAS DEFINITION
-- dbo       -> Core system & configuration
-- master    -> Master data (OEMs, Categories, Components, Panel Types)
-- pricing   -> Supplier prices, historical price logs, labour rates
-- est       -> Projects, estimates, panels, estimate line items
-- bom       -> Generated Bill of Materials & assemblies
-- sales     -> Quotations, revisions, commercial terms
-- audit     -> Historical audit trail & change tracking
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'master')
    EXEC('CREATE SCHEMA [master]');
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'pricing')
    EXEC('CREATE SCHEMA [pricing]');
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'est')
    EXEC('CREATE SCHEMA [est]');
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'bom')
    EXEC('CREATE SCHEMA [bom]');
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'sales')
    EXEC('CREATE SCHEMA [sales]');
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'audit')
    EXEC('CREATE SCHEMA [audit]');
GO

PRINT 'Schemas dbo, master, pricing, est, bom, sales, and audit created successfully.';
GO
