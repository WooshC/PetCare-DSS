using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PetCare.Shared.Data;

namespace PetCare.Shared
{
    public class AuditService : IAuditService
    {
        private readonly ILogger<AuditService> _logger;
        private readonly AuditDbContext _context;

        public AuditService(ILogger<AuditService> logger, AuditDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task LogAsync(AuditLog log)
        {
            try
            {
                // Save to Database
                await _context.AuditLogs.AddAsync(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Fallback log if DB fails
                _logger.LogError(ex, "Failed to write audit log to database");
            }
        }
    }
}
