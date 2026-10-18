using Microsoft.EntityFrameworkCore;
using LVEstimator.Domain.Entities;

namespace LVEstimator.Infrastructure.Data
{
    public class LVSwitchgearDbContext : DbContext
    {
        public LVSwitchgearDbContext(DbContextOptions<LVSwitchgearDbContext> options)
            : base(options)
        {
        }

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

            // Configure Schemas
            modelBuilder.HasDefaultSchema("dbo");

            // Manufacturer Configuration
            modelBuilder.Entity<Manufacturer>(entity =>
            {
                entity.ToTable("Manufacturers", "master");
                entity.HasIndex(e => e.ManufacturerCode).IsUnique();
            });

            // ComponentCategory Configuration
            modelBuilder.Entity<ComponentCategory>(entity =>
            {
                entity.ToTable("ComponentCategories", "master");
                entity.HasIndex(e => e.CategoryCode).IsUnique();
                entity.HasOne(d => d.ParentCategory)
                      .WithMany(p => p.SubCategories)
                      .HasForeignKey(d => d.ParentCategoryID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Component Configuration
            modelBuilder.Entity<Component>(entity =>
            {
                entity.ToTable("Components", "master");
                entity.HasIndex(e => e.ComponentCode).IsUnique();
                entity.HasIndex(e => e.PartNumber);
                entity.HasIndex(e => e.RatedCurrent);
                entity.HasIndex(e => e.BreakingCapacity);

                entity.HasOne(d => d.Category)
                      .WithMany(p => p.Components)
                      .HasForeignKey(d => d.CategoryID)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Manufacturer)
                      .WithMany(p => p.Components)
                      .HasForeignKey(d => d.ManufacturerID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ComponentSpecification Configuration
            modelBuilder.Entity<ComponentSpecification>(entity =>
            {
                entity.ToTable("ComponentSpecifications", "master");
                entity.HasOne(d => d.Component)
                      .WithMany(p => p.Specifications)
                      .HasForeignKey(d => d.ComponentID)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Supplier Configuration
            modelBuilder.Entity<Supplier>(entity =>
            {
                entity.ToTable("Suppliers", "master");
                entity.HasIndex(e => e.SupplierCode).IsUnique();
            });

            // SupplierPrice Configuration with Computed Column & Historical Tracking
            modelBuilder.Entity<SupplierPrice>(entity =>
            {
                entity.ToTable("SupplierPrices", "pricing");

                // SQL Server Computed Column for NetPrice = ListPrice * (1 - DiscountPercent / 100)
                entity.Property(e => e.NetPrice)
                      .HasComputedColumnSql("CAST(ListPrice * (1.0 - (ISNULL(DiscountPercent, 0.0) / 100.0)) AS DECIMAL(18,2))", stored: true);

                entity.HasIndex(e => new { e.ComponentID, e.IsCurrent });
                entity.HasIndex(e => e.PriceDate);

                entity.HasOne(d => d.Component)
                      .WithMany(p => p.SupplierPrices)
                      .HasForeignKey(d => d.ComponentID)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Supplier)
                      .WithMany(p => p.SupplierPrices)
                      .HasForeignKey(d => d.SupplierID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // AuditLog Configuration
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLog", "audit");
                entity.HasIndex(e => new { e.TableName, e.RecordID });
                entity.HasIndex(e => e.CreatedAt);
            });
        }
    }
}
