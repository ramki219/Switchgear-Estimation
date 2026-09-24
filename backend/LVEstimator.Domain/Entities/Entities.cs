namespace LVEstimator.Domain.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("Manufacturers", Schema = "master")]
    public class Manufacturer
    {
        [Key]
        public int ManufacturerID { get; set; }

        [Required, MaxLength(30)]
        public string ManufacturerCode { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ManufacturerName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(250)]
        public string? Website { get; set; }

        [MaxLength(150)]
        public string? ContactEmail { get; set; }

        [MaxLength(50)]
        public string? ContactPhone { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<Component> Components { get; set; } = new List<Component>();
    }

    [Table("ComponentCategories", Schema = "master")]
    public class ComponentCategory
    {
        [Key]
        public int CategoryID { get; set; }

        [Required, MaxLength(30)]
        public string CategoryCode { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        public int? ParentCategoryID { get; set; }

        [MaxLength(250)]
        public string? Description { get; set; }

        [MaxLength(100)]
        public string? DefaultIECStandard { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ParentCategoryID")]
        public virtual ComponentCategory? ParentCategory { get; set; }
        public virtual ICollection<ComponentCategory> SubCategories { get; set; } = new List<ComponentCategory>();
        public virtual ICollection<Component> Components { get; set; } = new List<Component>();
    }

    [Table("Components", Schema = "master")]
    public class Component
    {
        [Key]
        public long ComponentID { get; set; }

        [Required, MaxLength(50)]
        public string ComponentCode { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string ComponentName { get; set; } = string.Empty;

        public int CategoryID { get; set; }
        public int ManufacturerID { get; set; }

        [Required, MaxLength(150)]
        public string PartNumber { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? Model { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required, MaxLength(20)]
        public string Unit { get; set; } = "NOS";

        [Column(TypeName = "decimal(10,2)")]
        public decimal? RatedVoltage { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? RatedCurrent { get; set; }

        public int? Poles { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? BreakingCapacity { get; set; }

        [Column(TypeName = "decimal(6,2)")]
        public decimal? Frequency { get; set; } = 50.0m;

        [MaxLength(20)]
        public string? IPRating { get; set; }

        [MaxLength(50)]
        public string? MountingType { get; set; }

        [MaxLength(100)]
        public string? IECStandard { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("CategoryID")]
        public virtual ComponentCategory Category { get; set; } = null!;

        [ForeignKey("ManufacturerID")]
        public virtual Manufacturer Manufacturer { get; set; } = null!;

        public virtual ICollection<ComponentSpecification> Specifications { get; set; } = new List<ComponentSpecification>();
        public virtual ICollection<SupplierPrice> SupplierPrices { get; set; } = new List<SupplierPrice>();
    }

    [Table("ComponentSpecifications", Schema = "master")]
    public class ComponentSpecification
    {
        [Key]
        public long SpecificationID { get; set; }

        public long ComponentID { get; set; }

        [Required, MaxLength(100)]
        public string SpecificationName { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string SpecificationValue { get; set; } = string.Empty;

        [MaxLength(30)]
        public string? Unit { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ComponentID")]
        public virtual Component Component { get; set; } = null!;
    }

    [Table("Suppliers", Schema = "master")]
    public class Supplier
    {
        [Key]
        public int SupplierID { get; set; }

        [Required, MaxLength(30)]
        public string SupplierCode { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string SupplierName { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? ContactPerson { get; set; }

        [MaxLength(200)]
        public string? Email { get; set; }

        [MaxLength(50)]
        public string? Phone { get; set; }

        [MaxLength(300)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string Country { get; set; } = "United Arab Emirates";

        [Required, MaxLength(10)]
        public string Currency { get; set; } = "AED";

        [MaxLength(200)]
        public string PaymentTerms { get; set; } = "30 Days Net";

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CreditLimit { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<SupplierPrice> SupplierPrices { get; set; } = new List<SupplierPrice>();
    }

    [Table("SupplierPrices", Schema = "pricing")]
    public class SupplierPrice
    {
        [Key]
        public long SupplierPriceID { get; set; }

        public long ComponentID { get; set; }
        public int SupplierID { get; set; }

        [MaxLength(150)]
        public string? SupplierPartNumber { get; set; }

        [Required, MaxLength(10)]
        public string Currency { get; set; } = "AED";

        [Column(TypeName = "decimal(18,2)")]
        public decimal ListPrice { get; set; }

        [Column(TypeName = "decimal(8,3)")]
        public decimal DiscountPercent { get; set; } = 0.000m;

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetPrice { get; private set; }

        [Column(TypeName = "decimal(18,3)")]
        public decimal MinimumQuantity { get; set; } = 1.000m;

        public int? LeadTimeDays { get; set; } = 14;

        public DateTime PriceDate { get; set; }
        public DateTime? ValidUntil { get; set; }

        [MaxLength(100)]
        public string? QuotationReference { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public bool IsCurrent { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? CreatedBy { get; set; } = "system";

        [ForeignKey("ComponentID")]
        public virtual Component Component { get; set; } = null!;

        [ForeignKey("SupplierID")]
        public virtual Supplier Supplier { get; set; } = null!;
    }

    [Table("AuditLog", Schema = "audit")]
    public class AuditLog
    {
        [Key]
        public long AuditID { get; set; }

        [MaxLength(100)]
        public string? UserID { get; set; }

        [Required, MaxLength(100)]
        public string TableName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string RecordID { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        public string Action { get; set; } = string.Empty;

        public string? OldValue { get; set; }
        public string? NewValue { get; set; }

        [MaxLength(50)]
        public string? IpAddress { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
