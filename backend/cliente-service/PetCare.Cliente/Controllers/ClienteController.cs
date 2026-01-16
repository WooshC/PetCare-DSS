using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Clientes;
using PetCareServicios.Services.Interfaces;
using System.Security.Claims;

namespace PetCareServicios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        [HttpGet("mi-perfil")]
        public async Task<IActionResult> GetMiPerfil()
        {
            var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _clienteService.GetByUsuarioIdAsync(usuarioId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CrearPerfil([FromBody] ClienteRequest request)
        {
            var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var nombreUsuario = User.FindFirstValue(ClaimTypes.Name)!;
            var emailUsuario = User.FindFirstValue(ClaimTypes.Email)!;
            var result = await _clienteService.CreateAsync(usuarioId, request, nombreUsuario, emailUsuario);
            return Ok(result);
        }

        [HttpPut("mi-perfil")]
        public async Task<IActionResult> ActualizarPerfil([FromBody] ClienteRequest request)
        {
            var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _clienteService.UpdateAsync(usuarioId, request);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("mi-perfil")]
        public async Task<IActionResult> EliminarPerfil()
        {
            var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _clienteService.DeleteAsync(usuarioId);
            if (!result) return NotFound();
            return Ok(new { message = "Perfil eliminado correctamente" });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _clienteService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _clienteService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("{id}/verificar")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> VerificarDocumento(int id)
        {
            var result = await _clienteService.VerifyDocumentoAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Documento verificado exitosamente" });
        }
    }
} 