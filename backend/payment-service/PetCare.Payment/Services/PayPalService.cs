using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using PetCare.Payment.Models;

namespace PetCare.Payment.Services
{
    public class PayPalService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public PayPalService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
            
            // ==================================================================================
            // ==================================================================================
            //   ⚠️⚠️⚠️  CONFIGURACIÓN DE PAYPAL AQUI  ⚠️⚠️⚠️
            //
            //   Debes poner tus Credenciales de PayPal Developer en appsettings.json:
            //   
            //   "PayPal": {
            //      "ClientId": "PON_AQUI_TU_CLIENT_ID",
            //      "ClientSecret": "PON_AQUI_TU_SECRET_KEY",
            //      "Mode": "Sandbox"
            //   }
            //
            // ==================================================================================
            // ==================================================================================
        }

        public async Task<string> CreateOrder(PaymentRequest request)
        {
            var accessToken = await GetAccessToken();

            var order = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new
                    {
                        amount = new
                        {
                            currency_code = request.Currency,
                            value = request.Amount.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)
                        },
                        description = request.Description
                    }
                },
                application_context = new
                {
                    return_url = request.ReturnUrl,
                    cancel_url = request.CancelUrl
                }
            };

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api-m.sandbox.paypal.com/v2/checkout/orders");
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            httpRequest.Content = new StringContent(JsonSerializer.Serialize(order), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(httpRequest);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Error creando orden PayPal: {content}");
            }

            // En un caso real, aquí parseas el JSON para devolver el link de aprobación
            return content;
        }

        private async Task<string> GetAccessToken()
        {
            // Simulación simplificada. En producción esto debe cachear el token.
            var clientId = _config["PayPal:ClientId"];
            var secret = _config["PayPal:ClientSecret"];

            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(secret))
            {
                // Fallback for demo without keys
                return "mock_access_token"; 
            }

            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{secret}"));
            
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api-m.sandbox.paypal.com/v1/oauth2/token");
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", auth);
            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "grant_type", "client_credentials" }
            });


            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Error obteniendo Token de PayPal: {responseContent}");
            }

            using (var doc = JsonDocument.Parse(responseContent))
            {
                if (doc.RootElement.TryGetProperty("access_token", out var tokenElement))
                {
                    return tokenElement.GetString() ?? throw new Exception("El token de acceso es nulo");
                }
                else
                {
                    throw new Exception($"Respuesta de PayPal no contiene access_token. Respuesta: {responseContent}");
                }
            }
        }
    }
}
