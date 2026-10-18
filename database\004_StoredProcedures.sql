-- ============================================================================
-- LV Switchgear Estimator - Stored Procedures
-- Engine: Microsoft SQL Server
-- Schemas: pricing, master, audit, est
-- ============================================================================

USE [LVSwitchgearEstimator];
GO

-- 1. Procedure to Save Component Price with Strict Historical Preservation
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
    @Notes NVARCHAR(500) = NULL,
    @CreatedBy VARCHAR(100) = 'system',
    @NewSupplierPriceID BIGINT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    BEGIN TRY
        -- Find existing active price for this component & supplier to record in audit log
        DECLARE @OldPriceID BIGINT, @OldListPrice DECIMAL(18,2), @OldNetPrice DECIMAL(18,2);
        
        SELECT TOP 1 
            @OldPriceID = SupplierPriceID,
            @OldListPrice = ListPrice,
            @OldNetPrice = NetPrice
        FROM pricing.SupplierPrices
        WHERE ComponentID = @ComponentID 
          AND SupplierID = @SupplierID 
          AND IsCurrent = 1;

        -- Step 1: Deactivate previous current price if exists, setting ValidUntil
        IF @OldPriceID IS NOT NULL
        BEGIN
            UPDATE pricing.SupplierPrices
            SET IsCurrent = 0,
                ValidUntil = ISNULL(ValidUntil, DATEADD(DAY, -1, @PriceDate))
            WHERE SupplierPriceID = @OldPriceID;
        END

        -- Step 2: Insert New Price Version (Always a new row, never an overwrite!)
        INSERT INTO pricing.SupplierPrices
        (
            ComponentID,
            SupplierID,
            SupplierPartNumber,
            Currency,
            ListPrice,
            DiscountPercent,
            MinimumQuantity,
            LeadTimeDays,
            PriceDate,
            ValidUntil,
            QuotationReference,
            Notes,
            IsCurrent,
            CreatedBy,
            CreatedAt
        )
        VALUES
        (
            @ComponentID,
            @SupplierID,
            @SupplierPartNumber,
            @Currency,
            @ListPrice,
            @DiscountPercent,
            @MinimumQuantity,
            @LeadTimeDays,
            @PriceDate,
            @ValidUntil,
            @QuotationReference,
            @Notes,
            1,
            @CreatedBy,
            SYSUTCDATETIME()
        );

        SET @NewSupplierPriceID = SCOPE_IDENTITY();

        -- Step 3: Insert Audit Trail Record
        DECLARE @AuditOldVal NVARCHAR(MAX) = NULL;
        IF @OldPriceID IS NOT NULL
        BEGIN
            SET @AuditOldVal = CONCAT('PriceID:', @OldPriceID, '|ListPrice:', @OldListPrice, '|NetPrice:', @OldNetPrice);
        END

        DECLARE @NewNetPrice DECIMAL(18,2) = CAST(@ListPrice * (1.0 - (@DiscountPercent / 100.0)) AS DECIMAL(18,2));
        DECLARE @AuditNewVal NVARCHAR(MAX) = CONCAT('PriceID:', @NewSupplierPriceID, '|ListPrice:', @ListPrice, '|Discount%:', @DiscountPercent, '|NetPrice:', @NewNetPrice, '|Ref:', @QuotationReference);

        INSERT INTO audit.AuditLog
        (
            UserID,
            TableName,
            RecordID,
            Action,
            OldValue,
            NewValue,
            CreatedAt
        )
        VALUES
        (
            @CreatedBy,
            'pricing.SupplierPrices',
            CAST(@NewSupplierPriceID AS VARCHAR(100)),
            CASE WHEN @OldPriceID IS NULL THEN 'INSERT_PRICE' ELSE 'PRICE_REVISION' END,
            @AuditOldVal,
            @AuditNewVal,
            SYSUTCDATETIME()
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 2. Procedure to Retrieve Components with Current Active Prices & Specs
CREATE OR ALTER PROCEDURE master.sp_SearchComponentsWithPrices
    @CategoryID INT = NULL,
    @ManufacturerID INT = NULL,
    @SearchTerm NVARCHAR(100) = NULL,
    @MinRatedCurrent DECIMAL(10,2) = NULL,
    @MaxRatedCurrent DECIMAL(10,2) = NULL,
    @Poles INT = NULL,
    @BreakingCapacity DECIMAL(10,2) = NULL,
    @IECStandard VARCHAR(100) = NULL,
    @IsActive BIT = 1,
    @PageNumber INT = 1,
    @PageSize INT = 25
AS
BEGIN
    SET NOCOUNT ON;

    WITH ComponentBase AS (
        SELECT 
            c.ComponentID,
            c.ComponentCode,
            c.ComponentName,
            c.CategoryID,
            cat.CategoryName,
            c.ManufacturerID,
            m.ManufacturerName,
            m.ManufacturerCode,
            c.PartNumber,
            c.Model,
            c.Description,
            c.Unit,
            c.RatedVoltage,
            c.RatedCurrent,
            c.Poles,
            c.BreakingCapacity,
            c.Frequency,
            c.IPRating,
            c.MountingType,
            c.IECStandard,
            c.IsActive,
            sp.SupplierPriceID,
            sp.SupplierID,
            s.SupplierName,
            sp.Currency,
            sp.ListPrice,
            sp.DiscountPercent,
            sp.NetPrice,
            sp.PriceDate,
            sp.QuotationReference,
            ROW_NUMBER() OVER (ORDER BY c.ComponentName ASC) AS RowNum,
            COUNT(*) OVER () AS TotalRecords
        FROM master.Components c
        INNER JOIN master.ComponentCategories cat ON c.CategoryID = cat.CategoryID
        INNER JOIN master.Manufacturers m ON c.ManufacturerID = m.ManufacturerID
        LEFT JOIN pricing.SupplierPrices sp ON c.ComponentID = sp.ComponentID AND sp.IsCurrent = 1
        LEFT JOIN master.Suppliers s ON sp.SupplierID = s.SupplierID
        WHERE (@CategoryID IS NULL OR c.CategoryID = @CategoryID)
          AND (@ManufacturerID IS NULL OR c.ManufacturerID = @ManufacturerID)
          AND (@Poles IS NULL OR c.Poles = @Poles)
          AND (@BreakingCapacity IS NULL OR c.BreakingCapacity >= @BreakingCapacity)
          AND (@MinRatedCurrent IS NULL OR c.RatedCurrent >= @MinRatedCurrent)
          AND (@MaxRatedCurrent IS NULL OR c.RatedCurrent <= @MaxRatedCurrent)
          AND (@IECStandard IS NULL OR c.IECStandard LIKE '%' + @IECStandard + '%')
          AND (@IsActive IS NULL OR c.IsActive = @IsActive)
          AND (
                @SearchTerm IS NULL 
                OR c.ComponentName LIKE '%' + @SearchTerm + '%'
                OR c.PartNumber LIKE '%' + @SearchTerm + '%'
                OR c.Model LIKE '%' + @SearchTerm + '%'
                OR c.ComponentCode LIKE '%' + @SearchTerm + '%'
              )
    )
    SELECT *
    FROM ComponentBase
    WHERE RowNum BETWEEN ((@PageNumber - 1) * @PageSize + 1) AND (@PageNumber * @PageSize)
    ORDER BY RowNum;
END;
GO

-- 3. Procedure to Get Price History Trend for a Component
CREATE OR ALTER PROCEDURE pricing.sp_GetComponentPriceHistory
    @ComponentID BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        sp.SupplierPriceID,
        sp.ComponentID,
        c.ComponentCode,
        c.ComponentName,
        c.PartNumber,
        m.ManufacturerName,
        s.SupplierID,
        s.SupplierName,
        sp.SupplierPartNumber,
        sp.Currency,
        sp.ListPrice,
        sp.DiscountPercent,
        sp.NetPrice,
        sp.PriceDate,
        sp.ValidUntil,
        sp.QuotationReference,
        sp.LeadTimeDays,
        sp.IsCurrent,
        sp.CreatedAt,
        sp.CreatedBy
    FROM pricing.SupplierPrices sp
    INNER JOIN master.Components c ON sp.ComponentID = c.ComponentID
    INNER JOIN master.Manufacturers m ON c.ManufacturerID = m.ManufacturerID
    INNER JOIN master.Suppliers s ON sp.SupplierID = s.SupplierID
    WHERE sp.ComponentID = @ComponentID
    ORDER BY sp.PriceDate DESC, sp.SupplierPriceID DESC;
END;
GO

-- 4. Procedure for Dashboard Analytics
CREATE OR ALTER PROCEDURE master.sp_GetDashboardAnalytics
AS
BEGIN
    SET NOCOUNT ON;

    -- Stat counters
    SELECT 
        (SELECT COUNT(*) FROM master.Components) AS TotalComponents,
        (SELECT COUNT(*) FROM master.Components WHERE IsActive = 1) AS ActiveComponents,
        (SELECT COUNT(*) FROM master.Manufacturers WHERE IsActive = 1) AS TotalManufacturers,
        (SELECT COUNT(*) FROM master.Suppliers WHERE IsActive = 1) AS TotalSuppliers,
        (SELECT COUNT(*) FROM pricing.SupplierPrices WHERE IsCurrent = 1) AS CurrentPriceRecords,
        (SELECT COUNT(*) FROM pricing.SupplierPrices) AS TotalHistoricalPriceRecords;

    -- Recent Price Updates
    SELECT TOP 10
        sp.SupplierPriceID,
        c.ComponentID,
        c.ComponentName,
        c.PartNumber,
        m.ManufacturerName,
        s.SupplierName,
        sp.Currency,
        sp.ListPrice,
        sp.DiscountPercent,
        sp.NetPrice,
        sp.PriceDate,
        sp.QuotationReference,
        sp.IsCurrent,
        sp.CreatedAt
    FROM pricing.SupplierPrices sp
    INNER JOIN master.Components c ON sp.ComponentID = c.ComponentID
    INNER JOIN master.Manufacturers m ON c.ManufacturerID = m.ManufacturerID
    INNER JOIN master.Suppliers s ON sp.SupplierID = s.SupplierID
    ORDER BY sp.CreatedAt DESC;
END;
GO

PRINT 'Stored procedures compiled successfully.';
GO
