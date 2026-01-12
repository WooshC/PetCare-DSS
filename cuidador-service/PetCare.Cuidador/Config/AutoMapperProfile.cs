using AutoMapper;
using PetCareServicios.Models.Cuidadores;

namespace PetCareServicios.Config
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Mapeo de Cuidador a CuidadorResponse
            CreateMap<Cuidador, CuidadorResponse>()
                .ForMember(dest => dest.NombreUsuario, opt => opt.Ignore())
                .ForMember(dest => dest.EmailUsuario, opt => opt.Ignore());

            // Mapeo de CuidadorRequest a Cuidador (para creación)
            CreateMap<CuidadorRequest, Cuidador>()
                .ForMember(dest => dest.CuidadorID, opt => opt.Ignore())
                .ForMember(dest => dest.UsuarioID, opt => opt.Ignore())
                .ForMember(dest => dest.CalificacionPromedio, opt => opt.Ignore())
                .ForMember(dest => dest.DocumentoVerificado, opt => opt.Ignore())
                .ForMember(dest => dest.FechaVerificacion, opt => opt.Ignore())
                .ForMember(dest => dest.Estado, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.Ignore())
                .ForMember(dest => dest.FechaActualizacion, opt => opt.Ignore());
        }
    }
} 