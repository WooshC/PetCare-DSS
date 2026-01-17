using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.IO;

namespace PetCare.Shared
{
    public class AuditMiddleware
    {
        private readonly RequestDelegate _next;


        public AuditMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IAuditService auditService)
        {
            var request = context.Request;
            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            string requestBody = string.Empty;
            if (request.Method != "GET" && request.Method != "OPTIONS" && request.ContentLength > 0)
            {
                request.EnableBuffering();
                using (var reader = new StreamReader(request.Body, System.Text.Encoding.UTF8, true, 1024, true))
                {
                    requestBody = await reader.ReadToEndAsync();
                    request.Body.Position = 0; 
                }
            }
            
            await _next(context);

            if (request.Method != "GET" && request.Method != "OPTIONS")
            {
                // Sanitizar body si es endpoints de login o registro
                string path = request.Path.ToString().ToLower();
                if (path.Contains("/login") || path.Contains("/register"))
                {
                    requestBody = "[SENSITIVE DATA HIDDEN]";
                }

                var audit = new AuditLog
                {
                    UserId = userId,
                    Action = request.Method,
                    EntityName = request.Path,
                    IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = request.Headers["User-Agent"].ToString(),
                    NewValues = $"Status: {context.Response.StatusCode}. Body: {requestBody}",
                    Timestamp = DateTime.UtcNow
                };

                await auditService.LogAsync(audit);
            }
        }
    }
}
