using AutoMapper;
using PetCareServicios.Models.Clientes;

namespace PetCareServicios.Config
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Cliente, ClienteResponse>();
            CreateMap<ClienteRequest, Cliente>();
        }
    }
} 