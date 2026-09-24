using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LVEstimator.Domain.Entities;
using LVEstimator.Infrastructure.Data;

namespace LVEstimator.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComponentsController : ControllerBase
    {
        private readonly LVSwitchgearDbContext _context;

        public ComponentsController(LVSwitchgearDbContext context)
        {
            _context = context;
        }

        // GET: api/components?categoryId=1&manufacturerId=1&searchTerm=Emax&minCurrent=800&maxCurrent=2000&poles=3&breakingCapacity=65&pageNumber=1&pageSize=25
        [HttpGet]
        public async Task<IActionResult> GetComponents(
            [FromQuery] int? categoryId,
            [FromQuery] int? manufacturerId,
            [FromQuery] string? searchTerm,
            [FromQuery] decimal? minCurrent,
            [FromQuery] decimal? maxCurrent,
            [FromQuery] int? poles,
            [FromQuery] decimal? breakingCapacity,
            [FromQuery] string? iecStandard,
            [FromQuery] bool? isActive = true,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 25)
        {
            var query = _context.Components
                .Include(c => c.Category)
                .Include(c => c.Manufacturer)
                .Include(c => c.Specifications)
                .Include(c => c.SupplierPrices.Where(p => p.IsCurrent))
                    .ThenInclude(p => p.Supplier)
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(c => c.CategoryID == categoryId.Value);

            if (manufacturerId.HasValue)
                query = query.Where(c => c.ManufacturerID == manufacturerId.Value);

            if (poles.HasValue)
                query = query.Where(c => c.Poles == poles.Value);

            if (breakingCapacity.HasValue)
                query = query.Where(c => c.BreakingCapacity >= breakingCapacity.Value);

            if (minCurrent.HasValue)
                query = query.Where(c => c.RatedCurrent >= minCurrent.Value);

            if (maxCurrent.HasValue)
                query = query.Where(c => c.RatedCurrent <= maxCurrent.Value);

            if (!string.IsNullOrWhiteSpace(iecStandard))
                query = query.Where(c => c.IECStandard != null && c.IECStandard.Contains(iecStandard));

            if (isActive.HasValue)
                query = query.Where(c => c.IsActive == isActive.Value);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim().ToLower();
                query = query.Where(c =>
                    c.ComponentName.ToLower().Contains(term) ||
                    c.PartNumber.ToLower().Contains(term) ||
                    (c.Model != null && c.Model.ToLower().Contains(term)) ||
                    c.ComponentCode.ToLower().Contains(term));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(c => c.ComponentName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                Data = items
            });
        }

        // GET: api/components/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetComponentById(long id)
        {
            var component = await _context.Components
                .Include(c => c.Category)
                .Include(c => c.Manufacturer)
                .Include(c => c.Specifications)
                .Include(c => c.SupplierPrices)
                    .ThenInclude(p => p.Supplier)
                .FirstOrDefaultAsync(c => c.ComponentID == id);

            if (component == null) return NotFound();
            return Ok(component);
        }

        // POST: api/components
        [HttpPost]
        public async Task<IActionResult> CreateComponent([FromBody] Component component)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await _context.Components.AnyAsync(c => c.ComponentCode == component.ComponentCode))
            {
                return Conflict(new { Message = $"Component code '{component.ComponentCode}' already exists." });
            }

            component.CreatedAt = DateTime.UtcNow;
            _context.Components.Add(component);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetComponentById), new { id = component.ComponentID }, component);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class PricingController : ControllerBase
    {
        private readonly LVSwitchgearDbContext _context;

        public PricingController(LVSwitchgearDbContext context)
        {
            _context = context;
        }

        // GET: api/pricing/history/5
        [HttpGet("history/{componentId}")]
        public async Task<IActionResult> GetPriceHistory(long componentId)
        {
            var history = await _context.SupplierPrices
                .Include(p => p.Supplier)
                .Include(p => p.Component)
                .Where(p => p.ComponentID == componentId)
                .OrderByDescending(p => p.PriceDate)
                .ThenByDescending(p => p.SupplierPriceID)
                .ToListAsync();

            return Ok(history);
        }

        // POST: api/pricing/revise (Preserves history by archiving current price and inserting new row)
        [HttpPost("revise")]
        public async Task<IActionResult> RevisePrice([FromBody] CreatePriceRevisionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

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
                SupplierPartNumber = dto.SupplierPartNumber,
                Currency = dto.Currency ?? "AED",
                ListPrice = dto.ListPrice,
                DiscountPercent = dto.DiscountPercent,
                MinimumQuantity = dto.MinimumQuantity > 0 ? dto.MinimumQuantity : 1.0m,
                LeadTimeDays = dto.LeadTimeDays ?? 14,
                PriceDate = dto.PriceDate,
                ValidUntil = dto.ValidUntil,
                QuotationReference = dto.QuotationReference,
                Notes = dto.Notes,
                IsCurrent = true,
                CreatedBy = User.Identity?.Name ?? "system",
                CreatedAt = DateTime.UtcNow
            };

            _context.SupplierPrices.Add(newPrice);
            await _context.SaveChangesAsync();

            return Ok(newPrice);
        }
    }

    public class CreatePriceRevisionDto
    {
        public long ComponentID { get; set; }
        public int SupplierID { get; set; }
        public string? SupplierPartNumber { get; set; }
        public string? Currency { get; set; } = "AED";
        public decimal ListPrice { get; set; }
        public decimal DiscountPercent { get; set; } = 0.0m;
        public decimal MinimumQuantity { get; set; } = 1.0m;
        public int? LeadTimeDays { get; set; } = 14;
        public DateTime PriceDate { get; set; } = DateTime.UtcNow.Date;
        public DateTime? ValidUntil { get; set; }
        public string? QuotationReference { get; set; }
        public string? Notes { get; set; }
    }
}
