using System.Threading.Tasks;

namespace PetCare.Shared
{
    public interface IAuditService
    {
        Task LogAsync(AuditLog log);
    }
}
